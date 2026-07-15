from coze_coding_dev_sdk.database import Base

from typing import Optional
import datetime

from sqlalchemy import BigInteger, Boolean, Column, DateTime, Double, ForeignKeyConstraint, Integer, JSON, Numeric, PrimaryKeyConstraint, String, Table, Text, text
from sqlalchemy.dialects.postgresql import OID
from sqlalchemy.orm import Mapped, mapped_column, relationship

class HealthCheck(Base):
    __tablename__ = 'health_check'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='health_check_pkey'),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(True), server_default=text('now()'))


t_pg_stat_statements = Table(
    'pg_stat_statements', Base.metadata,
    Column('userid', OID),
    Column('dbid', OID),
    Column('toplevel', Boolean),
    Column('queryid', BigInteger),
    Column('query', Text),
    Column('plans', BigInteger),
    Column('total_plan_time', Double(53)),
    Column('min_plan_time', Double(53)),
    Column('max_plan_time', Double(53)),
    Column('mean_plan_time', Double(53)),
    Column('stddev_plan_time', Double(53)),
    Column('calls', BigInteger),
    Column('total_exec_time', Double(53)),
    Column('min_exec_time', Double(53)),
    Column('max_exec_time', Double(53)),
    Column('mean_exec_time', Double(53)),
    Column('stddev_exec_time', Double(53)),
    Column('rows', BigInteger),
    Column('shared_blks_hit', BigInteger),
    Column('shared_blks_read', BigInteger),
    Column('shared_blks_dirtied', BigInteger),
    Column('shared_blks_written', BigInteger),
    Column('local_blks_hit', BigInteger),
    Column('local_blks_read', BigInteger),
    Column('local_blks_dirtied', BigInteger),
    Column('local_blks_written', BigInteger),
    Column('temp_blks_read', BigInteger),
    Column('temp_blks_written', BigInteger),
    Column('shared_blk_read_time', Double(53)),
    Column('shared_blk_write_time', Double(53)),
    Column('local_blk_read_time', Double(53)),
    Column('local_blk_write_time', Double(53)),
    Column('temp_blk_read_time', Double(53)),
    Column('temp_blk_write_time', Double(53)),
    Column('wal_records', BigInteger),
    Column('wal_fpi', BigInteger),
    Column('wal_bytes', Numeric),
    Column('jit_functions', BigInteger),
    Column('jit_generation_time', Double(53)),
    Column('jit_inlining_count', BigInteger),
    Column('jit_inlining_time', Double(53)),
    Column('jit_optimization_count', BigInteger),
    Column('jit_optimization_time', Double(53)),
    Column('jit_emission_count', BigInteger),
    Column('jit_emission_time', Double(53)),
    Column('jit_deform_count', BigInteger),
    Column('jit_deform_time', Double(53)),
    Column('stats_since', DateTime(True)),
    Column('minmax_stats_since', DateTime(True))
)


t_pg_stat_statements_info = Table(
    'pg_stat_statements_info', Base.metadata,
    Column('dealloc', BigInteger),
    Column('stats_reset', DateTime(True))
)


class StudyTasks(Base):
    __tablename__ = 'study_tasks'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='study_tasks_pkey'),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, comment='任务标题')
    task_type: Mapped[str] = mapped_column(String(50), nullable=False, comment='任务类型: regular/reading/dictation/photo')
    points: Mapped[int] = mapped_column(Integer, nullable=False, comment='完成积分')
    target_count: Mapped[int] = mapped_column(Integer, nullable=False, comment='目标完成次数(如朗读3遍)')
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, comment='是否激活')
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('now()'))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('now()'))
    description: Mapped[Optional[str]] = mapped_column(Text, comment='任务描述')
    subject: Mapped[Optional[str]] = mapped_column(String(50), comment='学科: chinese/english/math/other')
    task_content: Mapped[Optional[dict]] = mapped_column(JSON, comment='任务内容(JSON): 朗读文本/听写词库等')
    due_date: Mapped[Optional[str]] = mapped_column(String(10), comment='截止日期 YYYY-MM-DD')

    dictation_sessions: Mapped[list['DictationSessions']] = relationship('DictationSessions', back_populates='task')
    points_log: Mapped[list['PointsLog']] = relationship('PointsLog', back_populates='task')
    reading_records: Mapped[list['ReadingRecords']] = relationship('ReadingRecords', back_populates='task')
    task_completions: Mapped[list['TaskCompletions']] = relationship('TaskCompletions', back_populates='task')


class TodoPointsLog(Base):
    __tablename__ = 'todo_points_log'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='todo_points_log_pkey'),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False, comment='来源: task/reading/dictation')
    points: Mapped[int] = mapped_column(Integer, nullable=False, comment='积分变动(正数)')
    source_id: Mapped[Optional[int]] = mapped_column(Integer, comment='关联ID')
    description: Mapped[Optional[str]] = mapped_column(String(200), comment='描述')
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)


class TodoTasks(Base):
    __tablename__ = 'todo_tasks'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='todo_tasks_pkey'),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, comment='任务标题')
    task_type: Mapped[str] = mapped_column(String(50), nullable=False, comment='任务类型: normal/reading/dictation')
    description: Mapped[Optional[str]] = mapped_column(Text, comment='任务描述')
    points: Mapped[Optional[int]] = mapped_column(Integer, comment='完成积分')
    subject: Mapped[Optional[str]] = mapped_column(String(50), comment='科目: 语文/数学/英语')
    extra_data: Mapped[Optional[dict]] = mapped_column(JSON, comment='扩展数据')
    is_daily: Mapped[Optional[bool]] = mapped_column(Boolean, comment='是否每日任务')
    is_active: Mapped[Optional[bool]] = mapped_column(Boolean, comment='是否启用')
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)

    todo_dictation_sessions: Mapped[list['TodoDictationSessions']] = relationship('TodoDictationSessions', back_populates='task')
    todo_reading_sessions: Mapped[list['TodoReadingSessions']] = relationship('TodoReadingSessions', back_populates='task')
    todo_task_completions: Mapped[list['TodoTaskCompletions']] = relationship('TodoTaskCompletions', back_populates='task')


class DictationSessions(Base):
    __tablename__ = 'dictation_sessions'
    __table_args__ = (
        ForeignKeyConstraint(['task_id'], ['study_tasks.id'], name='dictation_sessions_task_id_fkey'),
        PrimaryKeyConstraint('id', name='dictation_sessions_pkey')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task_id: Mapped[int] = mapped_column(Integer, nullable=False)
    total_words: Mapped[int] = mapped_column(Integer, nullable=False, comment='总词数')
    correct_count: Mapped[int] = mapped_column(Integer, nullable=False, comment='正确数')
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('now()'))
    word_list: Mapped[Optional[dict]] = mapped_column(JSON, comment='听写词库列表')
    answers: Mapped[Optional[dict]] = mapped_column(JSON, comment='学生答案 [{word, user_answer, correct}]')
    score: Mapped[Optional[float]] = mapped_column(Double(53), comment='得分率')

    task: Mapped['StudyTasks'] = relationship('StudyTasks', back_populates='dictation_sessions')


class PointsLog(Base):
    __tablename__ = 'points_log'
    __table_args__ = (
        ForeignKeyConstraint(['task_id'], ['study_tasks.id'], name='points_log_task_id_fkey'),
        PrimaryKeyConstraint('id', name='points_log_pkey')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    points: Mapped[int] = mapped_column(Integer, nullable=False, comment='积分变动(+/-)')
    reason: Mapped[str] = mapped_column(String(200), nullable=False, comment='变动原因')
    total_points: Mapped[int] = mapped_column(Integer, nullable=False, comment='变动后总积分')
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('now()'))
    task_id: Mapped[Optional[int]] = mapped_column(Integer)

    task: Mapped[Optional['StudyTasks']] = relationship('StudyTasks', back_populates='points_log')


class ReadingRecords(Base):
    __tablename__ = 'reading_records'
    __table_args__ = (
        ForeignKeyConstraint(['task_id'], ['study_tasks.id'], name='reading_records_task_id_fkey'),
        PrimaryKeyConstraint('id', name='reading_records_pkey')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task_id: Mapped[int] = mapped_column(Integer, nullable=False)
    read_count: Mapped[int] = mapped_column(Integer, nullable=False, comment='本次朗读第几次')
    is_complete: Mapped[bool] = mapped_column(Boolean, nullable=False, comment='是否读完')
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('now()'))
    audio_url: Mapped[Optional[str]] = mapped_column(Text, comment='录音文件URL')
    asr_text: Mapped[Optional[str]] = mapped_column(Text, comment='ASR识别文本')
    original_text: Mapped[Optional[str]] = mapped_column(Text, comment='原文内容')
    similarity: Mapped[Optional[float]] = mapped_column(Double(53), comment='相似度(0-1)')

    task: Mapped['StudyTasks'] = relationship('StudyTasks', back_populates='reading_records')


class TaskCompletions(Base):
    __tablename__ = 'task_completions'
    __table_args__ = (
        ForeignKeyConstraint(['task_id'], ['study_tasks.id'], name='task_completions_task_id_fkey'),
        PrimaryKeyConstraint('id', name='task_completions_pkey')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task_id: Mapped[int] = mapped_column(Integer, nullable=False)
    completed_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('now()'))
    points_earned: Mapped[int] = mapped_column(Integer, nullable=False, comment='获得积分')
    completion_data: Mapped[Optional[dict]] = mapped_column(JSON, comment='完成数据(录音URL/照片URL/听写结果等)')
    note: Mapped[Optional[str]] = mapped_column(Text, comment='备注')

    task: Mapped['StudyTasks'] = relationship('StudyTasks', back_populates='task_completions')


class TodoDictationSessions(Base):
    __tablename__ = 'todo_dictation_sessions'
    __table_args__ = (
        ForeignKeyConstraint(['task_id'], ['todo_tasks.id'], name='todo_dictation_sessions_task_id_fkey'),
        PrimaryKeyConstraint('id', name='todo_dictation_sessions_pkey')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    words: Mapped[dict] = mapped_column(JSON, nullable=False, comment='听写词表 [{en, zh}, ...]')
    task_id: Mapped[Optional[int]] = mapped_column(Integer)
    unit_name: Mapped[Optional[str]] = mapped_column(String(100), comment='单元名称')
    answers: Mapped[Optional[dict]] = mapped_column(JSON, comment='学生答案 [{word_index, answer, correct}, ...]')
    total_words: Mapped[Optional[int]] = mapped_column(Integer, comment='总词数')
    correct_count: Mapped[Optional[int]] = mapped_column(Integer, comment='正确数')
    accuracy: Mapped[Optional[float]] = mapped_column(Double(53), comment='正确率 0-1')
    points_earned: Mapped[Optional[int]] = mapped_column(Integer, comment='获得积分')
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)

    task: Mapped[Optional['TodoTasks']] = relationship('TodoTasks', back_populates='todo_dictation_sessions')


class TodoReadingSessions(Base):
    __tablename__ = 'todo_reading_sessions'
    __table_args__ = (
        ForeignKeyConstraint(['task_id'], ['todo_tasks.id'], name='todo_reading_sessions_task_id_fkey'),
        PrimaryKeyConstraint('id', name='todo_reading_sessions_pkey')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    text_content: Mapped[str] = mapped_column(Text, nullable=False, comment='朗读的课文内容')
    task_id: Mapped[Optional[int]] = mapped_column(Integer)
    audio_key: Mapped[Optional[str]] = mapped_column(String(500), comment='录音的 S3 key')
    recognized_text: Mapped[Optional[str]] = mapped_column(Text, comment='ASR 识别的文本')
    completeness: Mapped[Optional[float]] = mapped_column(Double(53), comment='完整度 0-1')
    read_count: Mapped[Optional[int]] = mapped_column(Integer, comment='朗读次数')
    target_count: Mapped[Optional[int]] = mapped_column(Integer, comment='目标朗读次数')
    is_completed: Mapped[Optional[bool]] = mapped_column(Boolean, comment='是否达标')
    points_earned: Mapped[Optional[int]] = mapped_column(Integer, comment='获得积分')
    created_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)

    task: Mapped[Optional['TodoTasks']] = relationship('TodoTasks', back_populates='todo_reading_sessions')


class TodoTaskCompletions(Base):
    __tablename__ = 'todo_task_completions'
    __table_args__ = (
        ForeignKeyConstraint(['task_id'], ['todo_tasks.id'], name='todo_task_completions_task_id_fkey'),
        PrimaryKeyConstraint('id', name='todo_task_completions_pkey')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task_id: Mapped[int] = mapped_column(Integer, nullable=False)
    completed_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    points_earned: Mapped[Optional[int]] = mapped_column(Integer, comment='获得积分')
    photo_key: Mapped[Optional[str]] = mapped_column(String(500), comment='提交照片的 S3 key')
    status: Mapped[Optional[str]] = mapped_column(String(20), comment='状态: completed/pending_review')
    note: Mapped[Optional[str]] = mapped_column(Text, comment='备注')

    task: Mapped['TodoTasks'] = relationship('TodoTasks', back_populates='todo_task_completions')
