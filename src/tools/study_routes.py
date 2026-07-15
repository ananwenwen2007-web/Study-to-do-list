"""API routes for Study Todo App."""
import os
import json
import base64
import logging
import difflib
from datetime import datetime, date
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from storage.database.db import get_session, get_engine
from storage.database.study_models import (
    Base, Task, TaskCompletion, ReadingRecord, DictationSession, PointsLog
)
from storage.s3.s3_storage import S3SyncStorage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/study", tags=["study"])

# ─── S3 Storage helper ───────────────────────────────────────────────
def _get_s3():
    """Get S3 storage instance."""
    try:
        from coze_workload_identity import Client as CozeEnvClient
        client = CozeEnvClient()
        env_vars = client.get_project_env_vars()
        client.close()
        creds = {}
        for ev in env_vars:
            if ev.key == "COZE_BUCKET_ACCESS_KEY":
                creds["access_key"] = ev.value.replace("'", "")
            elif ev.key == "COZE_BUCKET_SECRET_KEY":
                creds["secret_key"] = ev.value.replace("'", "")
            elif ev.key == "COZE_BUCKET_NAME":
                creds["bucket_name"] = ev.value.replace("'", "")
        return S3SyncStorage(
            access_key=creds.get("access_key", ""),
            secret_key=creds.get("secret_key", ""),
            bucket_name=creds.get("bucket_name", "default"),
        )
    except Exception as e:
        logger.error(f"Failed to init S3: {e}")
        return None


def _get_presigned_url(key: str) -> str:
    """Generate presigned URL for a file."""
    try:
        s3 = _get_s3()
        if s3:
            return s3.generate_presigned_url(key=key, expire_time=3600)
    except Exception as e:
        logger.error(f"Failed to generate presigned URL: {e}")
    return ""


# ─── Database init ────────────────────────────────────────────────────
def init_db():
    """Create tables if not exist."""
    try:
        engine = get_engine()
        Base.metadata.create_all(bind=engine)
        logger.info("Study app tables created/verified.")
    except Exception as e:
        logger.error(f"Failed to create study tables: {e}")


# ─── Task Management ─────────────────────────────────────────────────
@router.get("/tasks")
def list_tasks(active_only: bool = True):
    """获取任务列表"""
    with get_session() as session:
        query = session.query(Task)
        if active_only:
            query = query.filter(Task.is_active == True)
        tasks = query.order_by(desc(Task.created_at)).all()
        result = []
        for t in tasks:
            task_dict = {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "task_type": t.task_type,
                "subject": t.subject,
                "points": t.points,
                "target_count": t.target_count,
                "task_content": t.task_content,
                "due_date": t.due_date,
                "is_active": t.is_active,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            # Count completions today
            today_start = datetime.combine(date.today(), datetime.min.time())
            completion_count = session.query(TaskCompletion).filter(
                TaskCompletion.task_id == t.id,
                TaskCompletion.completed_at >= today_start
            ).count()
            task_dict["today_completions"] = completion_count
            result.append(task_dict)
        return {"code": 0, "data": result}


@router.post("/tasks")
def create_task(
    title: str = Form(...),
    description: str = Form(None),
    task_type: str = Form("regular"),
    subject: str = Form(None),
    points: int = Form(10),
    target_count: int = Form(1),
    task_content: str = Form(None),
    due_date: str = Form(None),
):
    """创建新任务"""
    parsed_content = None
    if task_content:
        try:
            parsed_content = json.loads(task_content)
        except json.JSONDecodeError:
            parsed_content = {"text": task_content}

    with get_session() as session:
        task = Task(
            title=title,
            description=description,
            task_type=task_type,
            subject=subject,
            points=points,
            target_count=target_count,
            task_content=parsed_content,
            due_date=due_date,
        )
        session.add(task)
        session.commit()
        return {"code": 0, "data": {"id": task.id, "title": task.title}}


@router.post("/tasks/{task_id}/complete")
def complete_task(task_id: int):
    """完成普通任务"""
    with get_session() as session:
        task = session.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        completion = TaskCompletion(
            task_id=task_id,
            points_earned=task.points,
            completion_data=json.dumps({"type": "manual_complete"}),
            note="manual_complete",
        )
        session.add(completion)
        _add_points(session, task_id, task.points, f"完成任务: {task.title}")
        session.commit()

        return {"code": 0, "data": {"points_earned": task.points}}


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    """删除任务(软删除)"""
    with get_session() as session:
        task = session.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        task.is_active = False
        session.commit()
        return {"code": 0, "msg": "Task deleted"}


# ─── Photo Upload ────────────────────────────────────────────────────
@router.post("/photo/upload")
async def upload_photo(
    task_id: int = Form(...),
    file: UploadFile = File(...),
):
    """上传照片(拍照提交)"""
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    s3 = _get_s3()
    if not s3:
        raise HTTPException(status_code=500, detail="Storage not available")

    try:
        file_key = s3.upload_file(
            file_content=content,
            file_name=f"study_photos/{file.filename}",
            content_type=file.content_type or "image/jpeg",
        )
        photo_url = _get_presigned_url(file_key)
    except Exception as e:
        logger.error(f"Photo upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    # Record completion
    with get_session() as session:
        task = session.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        completion = TaskCompletion(
            task_id=task_id,
            points_earned=task.points,
            completion_data=json.dumps({"photo_key": file_key, "photo_url": photo_url}),
            note="photo_submission",
        )
        session.add(completion)

        # Add points
        _add_points(session, task_id, task.points, f"拍照提交: {task.title}")
        session.commit()

        return {"code": 0, "data": {"photo_url": photo_url, "points_earned": task.points}}


# ─── Reading Verification ────────────────────────────────────────────
@router.post("/reading/verify")
async def verify_reading(
    task_id: int = Form(...),
    audio_base64: str = Form(...),
):
    """朗读验证 - 上传录音, ASR识别后比对原文"""
    with get_session() as session:
        task = session.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        original_text = ""
        if task.task_content:
            content = task.task_content
            if isinstance(content, str):
                content = json.loads(content)
            original_text = content.get("text", "")

        # Upload audio to S3
        audio_url = ""
        asr_text = ""
        similarity = 0.0

        try:
            audio_data = base64.b64decode(audio_base64)
            s3 = _get_s3()
            if s3:
                audio_key = s3.upload_file(
                    file_content=audio_data,
                    file_name=f"reading_audio/{task_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.webm",
                    content_type="audio/webm",
                )
                audio_url = _get_presigned_url(audio_key)

                # ASR recognition
                from coze_coding_dev_sdk import ASRClient
                from coze_coding_utils.runtime_ctx.context import new_context
                ctx = new_context(method="asr.recognize")
                asr_client = ASRClient(ctx=ctx)
                asr_text, _ = asr_client.recognize(uid="student", url=audio_url)
        except Exception as e:
            logger.error(f"Reading verification error: {e}")
            asr_text = f"[ASR Error: {str(e)}]"

        # Calculate similarity
        if original_text and asr_text and not asr_text.startswith("[ASR Error"):
            similarity = difflib.SequenceMatcher(
                None,
                original_text.replace(" ", "").replace("\n", ""),
                asr_text.replace(" ", "").replace("\n", "")
            ).ratio()

        # Count today's readings
        today_start = datetime.combine(date.today(), datetime.min.time())
        read_count = session.query(ReadingRecord).filter(
            ReadingRecord.task_id == task_id,
            ReadingRecord.created_at >= today_start
        ).count() + 1

        is_complete = similarity >= 0.7 if original_text else True

        # Save record
        record = ReadingRecord(
            task_id=task_id,
            audio_url=audio_url,
            asr_text=asr_text,
            original_text=original_text,
            similarity=similarity,
            read_count=read_count,
            is_complete=is_complete,
        )
        session.add(record)

        # If reached target count, award points
        points_earned = 0
        if read_count >= task.target_count and is_complete:
            completion = TaskCompletion(
                task_id=task_id,
                points_earned=task.points,
                completion_data=json.dumps({"read_count": read_count, "similarity": similarity}),
            )
            session.add(completion)
            _add_points(session, task_id, task.points, f"朗读完成: {task.title} ({read_count}遍)")
            points_earned = task.points

        session.commit()

        return {
            "code": 0,
            "data": {
                "asr_text": asr_text,
                "similarity": round(similarity, 2),
                "read_count": read_count,
                "target_count": task.target_count,
                "is_complete": is_complete,
                "points_earned": points_earned,
                "audio_url": audio_url,
            }
        }


# ─── English Dictation ───────────────────────────────────────────────
@router.post("/dictation/start")
def start_dictation(task_id: int = Form(...)):
    """开始听写 - 返回词库和TTS音频"""
    with get_session() as session:
        task = session.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        word_list = []
        if task.task_content:
            content = task.task_content
            if isinstance(content, str):
                content = json.loads(content)
            word_list = content.get("words", [])

        if not word_list:
            raise HTTPException(status_code=400, detail="No word list for this task")

        # Generate TTS for each word
        from coze_coding_dev_sdk import TTSClient
        from coze_coding_utils.runtime_ctx.context import new_context
        ctx = new_context(method="tts.synthesize")
        tts_client = TTSClient(ctx=ctx)

        audio_items = []
        for word in word_list:
            try:
                audio_url, _ = tts_client.synthesize(
                    uid="student",
                    text=word,
                    speaker="zh_female_vv_uranus_bigtts",
                    audio_format="mp3",
                )
                audio_items.append({"word": word, "audio_url": audio_url})
            except Exception as e:
                logger.error(f"TTS failed for '{word}': {e}")
                audio_items.append({"word": word, "audio_url": ""})

        # Create session
        dictation_session = DictationSession(
            task_id=task_id,
            word_list=json.dumps(word_list),
            total_words=len(word_list),
        )
        session.add(dictation_session)
        session.commit()

        return {
            "code": 0,
            "data": {
                "session_id": dictation_session.id,
                "audio_items": audio_items,
                "total_words": len(word_list),
            }
        }


@router.post("/dictation/submit")
def submit_dictation(
    session_id: int = Form(...),
    answers: str = Form(...),
):
    """提交听写答案 - 自动批改"""
    user_answers = json.loads(answers)

    with get_session() as session:
        dictation_session = session.query(DictationSession).filter(
            DictationSession.id == session_id
        ).first()
        if not dictation_session:
            raise HTTPException(status_code=404, detail="Session not found")

        word_list = json.loads(dictation_session.word_list) if isinstance(dictation_session.word_list, str) else dictation_session.word_list

        results = []
        correct_count = 0
        for i, word in enumerate(word_list):
            user_answer = user_answers[i] if i < len(user_answers) else ""
            is_correct = user_answer.strip().lower() == word.strip().lower()
            if is_correct:
                correct_count += 1
            results.append({
                "word": word,
                "user_answer": user_answer,
                "correct": is_correct,
            })

        total = len(word_list)
        score = (correct_count / total * 100) if total > 0 else 0

        dictation_session.answers = json.dumps(results)
        dictation_session.correct_count = correct_count
        dictation_session.score = score
        dictation_session.completed = True

        # Award points based on score
        task = session.query(Task).filter(Task.id == dictation_session.task_id).first()
        points_earned = 0
        if task and score >= 60:
            points_earned = int(task.points * score / 100)
            completion = TaskCompletion(
                task_id=dictation_session.task_id,
                points_earned=points_earned,
                completion_data=json.dumps({"session_id": session_id, "score": score}),
            )
            session.add(completion)
            _add_points(session, task.id, points_earned, f"英语听写: {task.title} (得分{score:.0f}%)")

        session.commit()

        return {
            "code": 0,
            "data": {
                "results": results,
                "correct_count": correct_count,
                "total": total,
                "score": round(score, 1),
                "points_earned": points_earned,
            }
        }


# ─── Points System ───────────────────────────────────────────────────
@router.get("/points")
def get_points_summary():
    """获取积分汇总"""
    with get_session() as session:
        total = session.query(func.coalesce(func.sum(PointsLog.points), 0)).scalar()
        today_start = datetime.combine(date.today(), datetime.min.time())
        today_points = session.query(func.coalesce(func.sum(PointsLog.points), 0)).filter(
            PointsLog.created_at >= today_start
        ).scalar()

        # Recent logs
        logs = session.query(PointsLog).order_by(desc(PointsLog.created_at)).limit(20).all()
        log_list = [{
            "id": l.id,
            "points": l.points,
            "reason": l.reason,
            "total_points": l.total_points,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        } for l in logs]

        return {
            "code": 0,
            "data": {
                "total_points": total,
                "today_points": today_points,
                "recent_logs": log_list,
            }
        }


# ─── Generate Vocabulary (LLM) ──────────────────────────────────────
@router.post("/generate/vocabulary")
def generate_vocabulary(
    subject: str = Form("english"),
    grade: str = Form("初一"),
    unit: str = Form(None),
    topic: str = Form(None),
):
    """使用LLM生成课标词库"""
    from coze_coding_dev_sdk import LLMClient
    from coze_coding_utils.runtime_ctx.context import new_context
    from langchain_core.messages import SystemMessage, HumanMessage

    ctx = new_context(method="invoke")
    client = LLMClient(ctx=ctx)

    prompt = f"请为{grade}学生生成一份英语听写词库"
    if unit:
        prompt += f"，对应单元: {unit}"
    if topic:
        prompt += f"，主题: {topic}"
    prompt += """。

要求：
1. 列出15-20个适合该年级的英语单词
2. 只返回JSON格式，不要其他内容
3. 格式: {"words": ["word1", "word2", ...], "unit": "单元名", "topic": "主题"}
4. 单词难度要适合初一学生
5. 包含常用词汇，涵盖听说读写"""

    messages = [
        SystemMessage(content="你是一位专业的英语教师，擅长根据课程标准为学生准备词汇表。"),
        HumanMessage(content=prompt),
    ]

    try:
        response = client.invoke(messages=messages, temperature=0.7)
        content = response.content
        if isinstance(content, list):
            content = " ".join(item.get("text", "") for item in content if isinstance(item, dict) and item.get("type") == "text") if not isinstance(content[0], str) else " ".join(content)
        # Parse JSON from response
        content = content.strip()
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:-1])
        vocab_data = json.loads(content)
        return {"code": 0, "data": vocab_data}
    except Exception as e:
        logger.error(f"Vocabulary generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


# ─── Dashboard ───────────────────────────────────────────────────────
@router.get("/dashboard")
def get_dashboard():
    """获取仪表盘数据"""
    with get_session() as session:
        today_start = datetime.combine(date.today(), datetime.min.time())

        total_points = session.query(func.coalesce(func.sum(PointsLog.points), 0)).scalar()
        today_points = session.query(func.coalesce(func.sum(PointsLog.points), 0)).filter(
            PointsLog.created_at >= today_start
        ).scalar()

        active_tasks = session.query(Task).filter(Task.is_active == True).count()
        today_completions = session.query(TaskCompletion).filter(
            TaskCompletion.completed_at >= today_start
        ).count()

        # Streak calculation (consecutive days with completions)
        streak = _calculate_streak(session)

        return {
            "code": 0,
            "data": {
                "total_points": total_points,
                "today_points": today_points,
                "active_tasks": active_tasks,
                "today_completions": today_completions,
                "streak_days": streak,
            }
        }


# ─── Helpers ─────────────────────────────────────────────────────────
def _add_points(session: Session, task_id: Optional[int], points: int, reason: str):
    """Add points and log."""
    current_total = session.query(func.coalesce(func.sum(PointsLog.points), 0)).scalar()
    log = PointsLog(
        task_id=task_id,
        points=points,
        reason=reason,
        total_points=current_total + points,
    )
    session.add(log)


def _calculate_streak(session: Session) -> int:
    """Calculate consecutive days with completions."""
    from datetime import timedelta
    streak = 0
    check_date = date.today()

    for _ in range(365):
        next_date = check_date + timedelta(days=1)
        count = session.query(TaskCompletion).filter(
            TaskCompletion.completed_at >= datetime.combine(check_date, datetime.min.time()),
            TaskCompletion.completed_at < datetime.combine(next_date, datetime.min.time()),
        ).count()
        if count > 0:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    return streak
