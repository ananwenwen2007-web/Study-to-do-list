"""To-Do List 学习管理系统的数据库模型"""
import datetime
from typing import Optional, List, Any
from sqlalchemy import Integer, String, Text, DateTime, Boolean, JSON, Float, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Task(Base):
    """学习任务表 - 由家长布置"""
    __tablename__ = "todo_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    task_type: Mapped[str] = mapped_column(String(50), nullable=False)
    points: Mapped[int] = mapped_column(Integer, default=1)
    subject: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    extra_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    is_daily: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    completions = relationship("TaskCompletion", back_populates="task")


class TaskCompletion(Base):
    """任务完成记录"""
    __tablename__ = "todo_task_completions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("todo_tasks.id"), nullable=False)
    completed_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    points_earned: Mapped[int] = mapped_column(Integer, default=0)
    photo_key: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="completed")
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    task = relationship("Task", back_populates="completions")


class ReadingSession(Base):
    """朗读打卡记录"""
    __tablename__ = "todo_reading_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("todo_tasks.id"), nullable=True)
    text_content: Mapped[str] = mapped_column(Text, nullable=False)
    audio_key: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    recognized_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    completeness: Mapped[float] = mapped_column(Float, default=0.0)
    read_count: Mapped[int] = mapped_column(Integer, default=1)
    target_count: Mapped[int] = mapped_column(Integer, default=1)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    points_earned: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))


class DictationSession(Base):
    """英语听写记录"""
    __tablename__ = "todo_dictation_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("todo_tasks.id"), nullable=True)
    unit_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    words: Mapped[list] = mapped_column(JSON, nullable=False)
    answers: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    total_words: Mapped[int] = mapped_column(Integer, default=0)
    correct_count: Mapped[int] = mapped_column(Integer, default=0)
    accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    points_earned: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))


class PointsLog(Base):
    """积分变动日志"""
    __tablename__ = "todo_points_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
