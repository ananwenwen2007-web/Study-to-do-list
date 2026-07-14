"""To-Do List 学习管理系统 API 路由"""
import os
import base64
import logging
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import HTMLResponse, FileResponse

from tools.todo_schemas import (
    TaskCreate, TaskUpdate, TaskResponse,
    TaskCompletionRequest, TaskCompletionResponse,
    ReadingStartRequest, ReadingSubmitRequest, ReadingSessionResponse,
    DictationStartRequest, DictationStartResponse,
    DictationSubmitRequest, DictationSubmitResponse,
    TTSGenRequest, TTSGenResponse,
    PointsSummary, PointsLogItem,
)
from tools import todo_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/todo", tags=["todo"])


# ─── Task Endpoints ───

@router.get("/tasks")
def api_list_tasks(active_only: bool = True):
    tasks = todo_service.list_tasks(active_only=active_only)
    return [_task_to_dict(t) for t in tasks]


@router.post("/tasks")
def api_create_task(data: TaskCreate):
    task = todo_service.create_task(data.model_dump())
    return _task_to_dict(task)


@router.put("/tasks/{task_id}")
def api_update_task(task_id: int, data: TaskUpdate):
    task = todo_service.update_task(task_id, data.model_dump(exclude_unset=True))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_dict(task)


@router.delete("/tasks/{task_id}")
def api_delete_task(task_id: int):
    ok = todo_service.delete_task(task_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True}


@router.post("/tasks/{task_id}/complete")
def api_complete_task(task_id: int, note: Optional[str] = Form(None)):
    completion = todo_service.complete_task(task_id, note=note)
    if not completion:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True, "points_earned": completion.points_earned}


# ─── Photo Upload ───

@router.post("/upload-photo")
async def api_upload_photo(file: UploadFile = File(...)):
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    key = todo_service.upload_photo(content, file.filename or "photo.jpg", file.content_type or "image/jpeg")
    url = todo_service.get_photo_url(key)
    return {"photo_key": key, "photo_url": url}


# ─── Reading Endpoints ───

@router.post("/reading/start")
def api_reading_start(data: ReadingStartRequest):
    rs = todo_service.create_reading_session(
        task_id=data.task_id,
        text_content=data.text_content,
        target_count=data.target_count,
    )
    return {
        "session_id": rs.id,
        "text_content": rs.text_content,
        "target_count": rs.target_count,
    }


@router.post("/reading/submit")
def api_reading_submit(data: ReadingSubmitRequest):
    # 将 base64 音频上传到 S3
    try:
        audio_bytes = base64.b64decode(data.audio_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 audio data")

    audio_key = todo_service.upload_photo(audio_bytes, "reading_audio.webm", "audio/webm")

    # 上传音频到 S3 后获取 URL 用于 ASR
    audio_url = todo_service.get_photo_url(audio_key, expire_time=300)

    # 调用 ASR 识别
    try:
        recognized_text = todo_service.recognize_speech(audio_url=audio_url)
    except Exception as e:
        logger.error(f"ASR failed: {e}")
        recognized_text = ""

    rs = todo_service.submit_reading_audio(data.session_id, audio_key, recognized_text)
    if not rs:
        raise HTTPException(status_code=404, detail="Reading session not found")

    return {
        "session_id": rs.id,
        "recognized_text": rs.recognized_text,
        "completeness": round(rs.completeness, 2),
        "read_count": rs.read_count,
        "target_count": rs.target_count,
        "is_completed": rs.is_completed,
        "points_earned": rs.points_earned,
    }


@router.get("/reading/sessions")
def api_reading_sessions(limit: int = 20):
    sessions = todo_service.get_reading_sessions(limit=limit)
    return [_reading_to_dict(s) for s in sessions]


@router.get("/reading/materials")
def api_reading_materials():
    return todo_service.get_reading_materials()


# ─── Dictation Endpoints ───

@router.post("/dictation/start")
def api_dictation_start(data: DictationStartRequest):
    result = todo_service.create_dictation_session(unit_id=data.unit_id)
    return result


@router.post("/dictation/submit")
def api_dictation_submit(data: DictationSubmitRequest):
    result = todo_service.submit_dictation_answers(data.session_id, data.answers)
    if not result:
        raise HTTPException(status_code=404, detail="Dictation session not found")
    return result


@router.get("/dictation/sessions")
def api_dictation_sessions(limit: int = 20):
    sessions = todo_service.get_dictation_sessions(limit=limit)
    return [_dictation_to_dict(s) for s in sessions]


@router.get("/dictation/units")
def api_dictation_units():
    return todo_service.get_word_units()


@router.post("/dictation/tts")
def api_dictation_tts(data: TTSGenRequest):
    try:
        audio_url = todo_service.generate_tts_audio(data.text, data.speaker)
        return {"audio_url": audio_url}
    except Exception as e:
        logger.error(f"TTS failed: {e}")
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")


# ─── Points Endpoints ───

@router.get("/points/summary")
def api_points_summary():
    return todo_service.get_points_summary()


@router.get("/points/logs")
def api_points_logs(limit: int = 50):
    logs = todo_service.get_points_logs(limit=limit)
    return [_points_log_to_dict(l) for l in logs]


# ─── Helpers ───

def _task_to_dict(t) -> dict:
    return {
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "task_type": t.task_type,
        "points": t.points,
        "subject": t.subject,
        "extra_data": t.extra_data,
        "is_daily": t.is_daily,
        "is_active": t.is_active,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }


def _reading_to_dict(r) -> dict:
    return {
        "id": r.id,
        "text_content": r.text_content,
        "recognized_text": r.recognized_text,
        "completeness": round(r.completeness, 2) if r.completeness else 0,
        "read_count": r.read_count,
        "target_count": r.target_count,
        "is_completed": r.is_completed,
        "points_earned": r.points_earned,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


def _dictation_to_dict(d) -> dict:
    return {
        "id": d.id,
        "unit_name": d.unit_name,
        "total_words": d.total_words,
        "correct_count": d.correct_count,
        "accuracy": round(d.accuracy, 2) if d.accuracy else 0,
        "points_earned": d.points_earned,
        "answers": d.answers,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    }


def _points_log_to_dict(l) -> dict:
    return {
        "id": l.id,
        "source_type": l.source_type,
        "points": l.points,
        "description": l.description,
        "created_at": l.created_at.isoformat() if l.created_at else None,
    }
