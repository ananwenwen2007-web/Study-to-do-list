"""
Study To-Do List API Routes
Provides endpoints for task management, reading verification, dictation, and points tracking.
"""
import os
import json
import base64
import logging
import requests as http_requests
from datetime import datetime, timezone
from typing import Optional, List, Any, Dict

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError

from coze_coding_dev_sdk import TTSClient, ASRClient
from coze_coding_dev_sdk.s3 import S3SyncStorage
from coze_coding_utils.runtime_ctx.context import new_context
from storage.database.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/todo", tags=["todo"])


def _get_storage() -> S3SyncStorage:
    return S3SyncStorage(
        endpoint_url=os.getenv("COZE_BUCKET_ENDPOINT_URL"),
        access_key="",
        secret_key="",
        bucket_name=os.getenv("COZE_BUCKET_NAME"),
        region="cn-beijing",
    )


def _get_db():
    return get_supabase_client()


# ─── Task Management ─────────────────────────────────────────────────────────

@router.get("/tasks")
async def list_tasks():
    """List all active tasks"""
    try:
        db = _get_db()
        resp = db.table("todo_tasks").select("*").eq("is_active", True).order("created_at", desc=True).execute()
        return {"code": 0, "data": resp.data}
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e.message}")


@router.post("/tasks")
async def create_task(
    title: str = Form(...),
    task_type: str = Form("normal"),
    description: Optional[str] = Form(None),
    points: int = Form(10),
    subject: Optional[str] = Form(None),
    target_count: Optional[int] = Form(1),
    text_content: Optional[str] = Form(None),
    word_list: Optional[str] = Form(None),
):
    """Create a new task"""
    try:
        db = _get_db()
        extra_data: Dict[str, Any] = {}
        if text_content:
            extra_data["text_content"] = text_content
        if word_list:
            try:
                extra_data["word_list"] = json.loads(word_list)
            except json.JSONDecodeError:
                extra_data["word_list"] = []

        now = datetime.now(timezone.utc).isoformat()
        task_data = {
            "title": title,
            "task_type": task_type,
            "description": description or "",
            "points": points,
            "subject": subject or "",
            "extra_data": extra_data if extra_data else None,
            "is_daily": False,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }
        resp = db.table("todo_tasks").insert(task_data).execute()
        data_list: List[Dict[str, Any]] = resp.data if isinstance(resp.data, list) else []
        return {"code": 0, "data": data_list[0] if data_list else None}
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Insert failed: {e.message}")


@router.put("/tasks/{task_id}")
async def update_task(
    task_id: int,
    title: Optional[str] = Form(None),
    task_type: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    points: Optional[int] = Form(None),
    subject: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    text_content: Optional[str] = Form(None),
    word_list: Optional[str] = Form(None),
):
    """Update a task"""
    try:
        db = _get_db()
        update_data: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}
        if title is not None:
            update_data["title"] = title
        if task_type is not None:
            update_data["task_type"] = task_type
        if description is not None:
            update_data["description"] = description
        if points is not None:
            update_data["points"] = points
        if subject is not None:
            update_data["subject"] = subject
        if is_active is not None:
            update_data["is_active"] = is_active

        if text_content is not None or word_list is not None:
            existing = db.table("todo_tasks").select("extra_data").eq("id", task_id).maybe_single().execute()
            existing_data: Dict[str, Any] = existing.data if isinstance(existing.data, dict) else {}
            extra: Dict[str, Any] = existing_data.get("extra_data", {}) if existing_data else {}
            if extra is None:
                extra = {}
            if text_content is not None:
                extra["text_content"] = text_content
            if word_list is not None:
                try:
                    extra["word_list"] = json.loads(word_list)
                except json.JSONDecodeError:
                    extra["word_list"] = []
            update_data["extra_data"] = extra

        resp = db.table("todo_tasks").update(update_data).eq("id", task_id).execute()
        data_list: List[Dict[str, Any]] = resp.data if isinstance(resp.data, list) else []
        return {"code": 0, "data": data_list[0] if data_list else None}
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {e.message}")


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    """Soft delete a task (set is_active=False)"""
    try:
        db = _get_db()
        resp = db.table("todo_tasks").update({
            "is_active": False,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", task_id).execute()
        data_list: List[Dict[str, Any]] = resp.data if isinstance(resp.data, list) else []
        return {"code": 0, "data": data_list[0] if data_list else None}
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {e.message}")


# ─── Task Completion & Points ────────────────────────────────────────────────

@router.post("/tasks/{task_id}/complete")
async def complete_task(
    task_id: int,
    photo_key: Optional[str] = Form(None),
    completion_count: int = Form(1),
):
    """Mark a task as completed, optionally with a photo"""
    try:
        db = _get_db()

        # Get task info
        task_resp = db.table("todo_tasks").select("*").eq("id", task_id).maybe_single().execute()
        task: Dict[str, Any] = task_resp.data if isinstance(task_resp.data, dict) else {}
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Record completion
        completion_data: Dict[str, Any] = {
            "task_id": task_id,
            "completion_count": completion_count,
        }
        if photo_key:
            completion_data["photo_key"] = photo_key
        db.table("todo_task_completions").insert(completion_data).execute()

        # Award points
        points_earned: int = int(task.get("points", 0) or 0) * completion_count
        if points_earned > 0:
            points_data: Dict[str, Any] = {
                "task_id": task_id,
                "points": points_earned,
                "reason": f"完成: {task.get('title', '')}",
            }
            db.table("todo_points_log").insert(points_data).execute()

        # Update task completion count
        current_count: int = int(task.get("completion_count", 0) or 0)
        db.table("todo_tasks").update({
            "completion_count": current_count + completion_count,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", task_id).execute()

        return {"code": 0, "data": {"points_earned": points_earned, "total_completions": current_count + completion_count}}
    except HTTPException:
        raise
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Complete failed: {e.message}")


@router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    """Upload a photo to object storage and return the key"""
    try:
        storage = _get_storage()
        content = await file.read()
        key = storage.upload_file(
            file_content=content,
            file_name=f"photos/{file.filename}",
            content_type=file.content_type or "image/jpeg",
        )
        return {"code": 0, "data": {"key": key}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/photo-url")
async def get_photo_url(key: str):
    """Get a presigned URL for a photo"""
    try:
        storage = _get_storage()
        url = storage.generate_presigned_url(key=key, expire_time=3600)
        return {"code": 0, "data": {"url": url}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Get URL failed: {str(e)}")


# ─── Reading Verification (ASR) ─────────────────────────────────────────────

@router.post("/reading/start")
async def start_reading_session(task_id: int = Form(...)):
    """Start a reading session for a task"""
    try:
        db = _get_db()
        resp = db.table("todo_reading_sessions").insert({
            "task_id": task_id,
            "status": "recording"
        }).execute()
        data_list: List[Dict[str, Any]] = resp.data if isinstance(resp.data, list) else []
        return {"code": 0, "data": data_list[0] if data_list else None}
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Start reading failed: {e.message}")


@router.post("/reading/submit")
async def submit_reading_audio(
    session_id: int = Form(...),
    task_id: int = Form(...),
    audio_data: str = Form(...),  # base64 encoded audio
):
    """Submit recorded audio for reading verification"""
    try:
        db = _get_db()

        # Decode audio
        audio_bytes = base64.b64decode(audio_data)

        # Upload audio to storage
        storage = _get_storage()
        audio_key = storage.upload_file(
            file_content=audio_bytes,
            file_name=f"readings/session_{session_id}.webm",
            content_type="audio/webm",
        )

        # ASR: Convert speech to text
        ctx = new_context(method="reading_asr")
        asr = ASRClient(ctx=ctx)
        audio_b64_str = base64.b64encode(audio_bytes).decode("utf-8")
        asr_text, asr_data = asr.recognize(uid="student", base64_data=audio_b64_str)

        # Get original text from task
        task_resp = db.table("todo_tasks").select("extra_data").eq("id", task_id).maybe_single().execute()
        task_data: Dict[str, Any] = task_resp.data if isinstance(task_resp.data, dict) else {}
        extra: Dict[str, Any] = task_data.get("extra_data", {}) if task_data else {}
        original_text: str = extra.get("text_content", "") if extra else ""

        # Calculate completeness (simple character overlap ratio)
        completeness = 0.0
        if original_text and asr_text:
            clean_original = original_text.replace(" ", "").replace("\n", "")
            clean_asr = asr_text.replace(" ", "").replace("\n", "")
            if clean_original:
                matched = sum(1 for c in clean_asr if c in clean_original)
                completeness = min(matched / len(clean_original), 1.0)

        # Update session
        db.table("todo_reading_sessions").update({
            "audio_key": audio_key,
            "asr_text": asr_text,
            "completeness": completeness,
            "status": "completed"
        }).eq("id", session_id).execute()

        # Award points if completeness >= 80%
        points_earned = 0
        if completeness >= 0.8:
            task_info_resp = db.table("todo_tasks").select("points").eq("id", task_id).maybe_single().execute()
            task_info: Dict[str, Any] = task_info_resp.data if isinstance(task_info_resp.data, dict) else {}
            points_earned = int(task_info.get("points", 0) or 0)
            if points_earned > 0:
                db.table("todo_points_log").insert({
                    "task_id": task_id,
                    "points": points_earned,
                    "reason": f"朗读完成 (完整度: {completeness:.0%})"
                }).execute()

            # Update task completion count
            task_full_resp = db.table("todo_tasks").select("completion_count").eq("id", task_id).maybe_single().execute()
            task_full: Dict[str, Any] = task_full_resp.data if isinstance(task_full_resp.data, dict) else {}
            current_count = int(task_full.get("completion_count", 0) or 0)
            db.table("todo_tasks").update({
                "completion_count": current_count + 1,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", task_id).execute()

        return {
            "code": 0,
            "data": {
                "asr_text": asr_text,
                "completeness": completeness,
                "points_earned": points_earned,
                "passed": completeness >= 0.8
            }
        }
    except Exception as e:
        logger.error(f"Reading submit error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Submit reading failed: {str(e)}")


@router.get("/reading/history")
async def get_reading_history(task_id: Optional[int] = None):
    """Get reading session history"""
    try:
        db = _get_db()
        query = db.table("todo_reading_sessions").select("*").order("created_at", desc=True)
        if task_id:
            query = query.eq("task_id", task_id)
        resp = query.limit(50).execute()
        return {"code": 0, "data": resp.data}
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e.message}")


# ─── English Dictation (TTS) ─────────────────────────────────────────────────

@router.post("/dictation/start")
async def start_dictation_session(task_id: int = Form(...)):
    """Start a dictation session"""
    try:
        db = _get_db()
        resp = db.table("todo_dictation_sessions").insert({
            "task_id": task_id,
            "status": "in_progress"
        }).execute()
        data_list: List[Dict[str, Any]] = resp.data if isinstance(resp.data, list) else []
        return {"code": 0, "data": data_list[0] if data_list else None}
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Start dictation failed: {e.message}")


@router.post("/dictation/tts")
async def generate_tts(text: str = Form(...)):
    """Generate TTS audio for a word/sentence"""
    try:
        ctx = new_context(method="dictation_tts")
        tts = TTSClient(ctx=ctx)

        audio_url, audio_size = tts.synthesize(
            uid="student",
            text=text,
            speaker="zh_female_xiaohe_uranus_bigtts",
            audio_format="mp3",
        )

        # Download audio and encode to base64
        audio_content = http_requests.get(audio_url).content
        audio_b64 = base64.b64encode(audio_content).decode()

        return {"code": 0, "data": {"audio_base64": audio_b64, "audio_url": audio_url}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


@router.post("/dictation/submit")
async def submit_dictation(
    session_id: int = Form(...),
    task_id: int = Form(...),
    answers: str = Form(...),  # JSON string: [{"word": "apple", "answer": "apple"}, ...]
):
    """Submit dictation answers and auto-grade"""
    try:
        db = _get_db()

        answer_list: List[Dict[str, str]] = json.loads(answers)
        total = len(answer_list)
        correct = 0
        results: List[Dict[str, Any]] = []

        for item in answer_list:
            word = item.get("word", "").strip().lower()
            answer = item.get("answer", "").strip().lower()
            is_correct = word == answer
            if is_correct:
                correct += 1
            results.append({
                "word": word,
                "answer": answer,
                "correct": is_correct
            })

        score = (correct / total * 100) if total > 0 else 0

        # Update session
        db.table("todo_dictation_sessions").update({
            "word_list": [item.get("word", "") for item in answer_list],
            "user_answers": [item.get("answer", "") for item in answer_list],
            "score": score,
            "status": "completed"
        }).eq("id", session_id).execute()

        # Award points if score >= 80%
        points_earned = 0
        if score >= 80:
            task_resp = db.table("todo_tasks").select("points, completion_count").eq("id", task_id).maybe_single().execute()
            task_data: Dict[str, Any] = task_resp.data if isinstance(task_resp.data, dict) else {}
            points_earned = int(task_data.get("points", 0) or 0)
            if points_earned > 0:
                db.table("todo_points_log").insert({
                    "task_id": task_id,
                    "points": points_earned,
                    "reason": f"听写完成 (得分: {score:.0f}%)"
                }).execute()

            current_count = int(task_data.get("completion_count", 0) or 0)
            db.table("todo_tasks").update({
                "completion_count": current_count + 1,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", task_id).execute()

        return {
            "code": 0,
            "data": {
                "total": total,
                "correct": correct,
                "score": score,
                "results": results,
                "points_earned": points_earned
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Submit dictation failed: {str(e)}")


@router.get("/dictation/history")
async def get_dictation_history(task_id: Optional[int] = None):
    """Get dictation session history"""
    try:
        db = _get_db()
        query = db.table("todo_dictation_sessions").select("*").order("created_at", desc=True)
        if task_id:
            query = query.eq("task_id", task_id)
        resp = query.limit(50).execute()
        return {"code": 0, "data": resp.data}
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e.message}")


# ─── Points Dashboard ────────────────────────────────────────────────────────

@router.get("/points/summary")
async def get_points_summary():
    """Get points summary: total, today, this week"""
    try:
        db = _get_db()
        resp = db.table("todo_points_log").select("points, created_at").order("created_at", desc=True).execute()
        logs: List[Dict[str, Any]] = resp.data if isinstance(resp.data, list) else []

        total_points = sum(int(log.get("points", 0) or 0) for log in logs)

        now = datetime.now(timezone.utc)
        today_str = now.strftime("%Y-%m-%d")
        today_points = sum(
            int(log.get("points", 0) or 0)
            for log in logs
            if str(log.get("created_at", ""))[:10] == today_str
        )

        return {
            "code": 0,
            "data": {
                "total_points": total_points,
                "today_points": today_points,
                "total_completions": len(logs),
            }
        }
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e.message}")


@router.get("/points/history")
async def get_points_history(limit: int = 50):
    """Get points history"""
    try:
        db = _get_db()
        resp = db.table("todo_points_log").select("*").order("created_at", desc=True).limit(limit).execute()
        return {"code": 0, "data": resp.data}
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e.message}")
