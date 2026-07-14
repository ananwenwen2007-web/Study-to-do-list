"""To-Do List API 请求/响应模型"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─── Task Schemas ───

class TaskCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    task_type: str = Field(default="normal", pattern="^(normal|reading|dictation)$")
    points: int = Field(default=1, ge=1, le=100)
    subject: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None
    is_daily: bool = False


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    points: Optional[int] = None
    subject: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None
    is_daily: Optional[bool] = None
    is_active: Optional[bool] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    task_type: str
    points: int
    subject: Optional[str]
    extra_data: Optional[Dict[str, Any]]
    is_daily: bool
    is_active: bool
    created_at: Optional[datetime]


class TaskCompletionRequest(BaseModel):
    task_id: int
    note: Optional[str] = None


class TaskCompletionResponse(BaseModel):
    id: int
    task_id: int
    completed_at: Optional[datetime]
    points_earned: int
    photo_url: Optional[str]
    status: str
    note: Optional[str]


# ─── Photo Upload ───

class PhotoUploadResponse(BaseModel):
    photo_key: str
    photo_url: str


# ─── Reading Schemas ───

class ReadingStartRequest(BaseModel):
    task_id: Optional[int] = None
    text_content: str
    target_count: int = Field(default=1, ge=1, le=20)


class ReadingSubmitRequest(BaseModel):
    session_id: int
    audio_base64: str  # base64 编码的音频数据


class ReadingSessionResponse(BaseModel):
    id: int
    text_content: str
    recognized_text: Optional[str]
    completeness: float
    read_count: int
    target_count: int
    is_completed: bool
    points_earned: int
    created_at: Optional[datetime]


# ─── Dictation Schemas ───

class DictationStartRequest(BaseModel):
    unit_id: int


class DictationWordItem(BaseModel):
    word: str
    hint: str


class DictationStartResponse(BaseModel):
    session_id: int
    unit_name: str
    total_words: int
    words: List[DictationWordItem]


class DictationSubmitRequest(BaseModel):
    session_id: int
    answers: List[Dict[str, Any]]  # [{"word_index": 0, "answer": "apple"}, ...]


class DictationSubmitResponse(BaseModel):
    correct_count: int
    total_words: int
    accuracy: float
    points_earned: int
    details: List[Dict[str, Any]]


class TTSGenRequest(BaseModel):
    text: str
    speaker: str = "zh_female_vv_uranus_bigtts"


class TTSGenResponse(BaseModel):
    audio_url: str


# ─── Points Schemas ───

class PointsSummary(BaseModel):
    total_points: int
    today_points: int
    week_points: int
    streak_days: int
    total_completions: int
    total_readings: int
    total_dictations: int


class PointsLogItem(BaseModel):
    id: int
    source_type: str
    points: int
    description: Optional[str]
    created_at: Optional[datetime]


# ─── Word Bank ───

class WordUnit(BaseModel):
    unit: str
    words: List[Dict[str, str]]


class ReadingMaterial(BaseModel):
    id: str
    title: str
    text: str
    subject: str
