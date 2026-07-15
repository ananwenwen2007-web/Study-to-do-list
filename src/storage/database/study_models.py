"""Database models for Study Todo App."""
import datetime
from sqlalchemy import (
    String, Integer, Text, DateTime, Boolean, Float, JSON, ForeignKey, func
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from typing import Optional


class Base(DeclarativeBase):
    pass


def mapped_primary_key():
    """Helper to create a primary key column."""
    return mapped_column(Integer, primary_key=True, autoincrement=True)


class Task(Base):
    """学习任务表 - 由家长布置"""
    __tablename__ = "study_tasks"

    id: Mapped[int] = mapped_primary_key()
    title: Mapped[str] = mapped_column(String(200), nullable=False, comment="任务标题")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="任务描述")
    task_type: Mapped[str] = mapped_column(String(50), nullable=False, comment="任务类型: regular/reading/dictation/photo")
    subject: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, comment="学科: chinese/english/math/other")
    points: Mapped[int] = mapped_column(Integer, default=10, comment="完成积分")
    target_count: Mapped[int] = mapped_column(Integer, default=1, comment="目标完成次数(如朗读3遍)")
    task_content: Mapped[Optional[str]] = mapped_column(JSON, nullable=True, comment="任务内容(JSON): 朗读文本/听写词库等")
    due_date: Mapped[Optional[str]] = mapped_column(String(10), nullable=True, comment="截止日期 YYYY-MM-DD")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, comment="是否激活")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class TaskCompletion(Base):
    """任务完成记录"""
    __tablename__ = "task_completions"

    id: Mapped[int] = mapped_primary_key()
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("study_tasks.id"), nullable=False)
    completed_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    points_earned: Mapped[int] = mapped_column(Integer, default=0, comment="获得积分")
    completion_data: Mapped[Optional[str]] = mapped_column(JSON, nullable=True, comment="完成数据(录音URL/照片URL/听写结果等)")
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="备注")


class ReadingRecord(Base):
    """朗读打卡记录"""
    __tablename__ = "reading_records"

    id: Mapped[int] = mapped_primary_key()
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("study_tasks.id"), nullable=False)
    audio_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="录音文件URL")
    asr_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="ASR识别文本")
    original_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="原文内容")
    similarity: Mapped[Optional[float]] = mapped_column(Float, nullable=True, comment="相似度(0-1)")
    read_count: Mapped[int] = mapped_column(Integer, default=1, comment="本次朗读第几次")
    is_complete: Mapped[bool] = mapped_column(Boolean, default=False, comment="是否读完")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())


class DictationSession(Base):
    """英语听写会话"""
    __tablename__ = "dictation_sessions"

    id: Mapped[int] = mapped_primary_key()
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("study_tasks.id"), nullable=False)
    word_list: Mapped[Optional[str]] = mapped_column(JSON, nullable=True, comment="听写词库列表")
    answers: Mapped[Optional[str]] = mapped_column(JSON, nullable=True, comment="学生答案 [{word, user_answer, correct}]")
    total_words: Mapped[int] = mapped_column(Integer, default=0, comment="总词数")
    correct_count: Mapped[int] = mapped_column(Integer, default=0, comment="正确数")
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True, comment="得分率")
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())


class PointsLog(Base):
    """积分变动日志"""
    __tablename__ = "points_log"

    id: Mapped[int] = mapped_primary_key()
    task_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("study_tasks.id"), nullable=True)
    points: Mapped[int] = mapped_column(Integer, nullable=False, comment="积分变动(+/-)")
    reason: Mapped[str] = mapped_column(String(200), nullable=False, comment="变动原因")
    total_points: Mapped[int] = mapped_column(Integer, default=0, comment="变动后总积分")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
