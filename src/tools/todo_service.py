"""To-Do List 业务逻辑层"""
import os
import base64
import logging
import datetime
from typing import Optional, List, Dict, Any

from sqlalchemy import func, desc
from storage.database.db import get_session
from storage.database.todo_models import (
    Task, TaskCompletion, ReadingSession, DictationSession, PointsLog
)

logger = logging.getLogger(__name__)

# ─── 七年级英语词库 (人教版 Go for it!) ───

WORD_BANK = [
    {
        "unit": "Starter Unit 1",
        "title": "Good morning!",
        "words": [
            {"en": "good", "zh": "好的"},
            {"en": "morning", "zh": "早晨"},
            {"en": "afternoon", "zh": "下午"},
            {"en": "evening", "zh": "晚上"},
            {"en": "hello", "zh": "你好"},
            {"en": "hi", "zh": "嗨"},
            {"en": "thanks", "zh": "谢谢"},
            {"en": "fine", "zh": "好的"},
            {"en": "ok", "zh": "好的"},
            {"en": "bye", "zh": "再见"},
        ]
    },
    {
        "unit": "Starter Unit 2",
        "title": "What's this in English?",
        "words": [
            {"en": "what", "zh": "什么"},
            {"en": "this", "zh": "这个"},
            {"en": "that", "zh": "那个"},
            {"en": "spell", "zh": "拼写"},
            {"en": "please", "zh": "请"},
            {"en": "pen", "zh": "钢笔"},
            {"en": "cup", "zh": "杯子"},
            {"en": "ruler", "zh": "尺子"},
            {"en": "jacket", "zh": "夹克"},
            {"en": "map", "zh": "地图"},
            {"en": "key", "zh": "钥匙"},
            {"en": "orange", "zh": "橙子"},
            {"en": "quilt", "zh": "被子"},
        ]
    },
    {
        "unit": "Starter Unit 3",
        "title": "What color is it?",
        "words": [
            {"en": "color", "zh": "颜色"},
            {"en": "red", "zh": "红色"},
            {"en": "yellow", "zh": "黄色"},
            {"en": "blue", "zh": "蓝色"},
            {"en": "green", "zh": "绿色"},
            {"en": "black", "zh": "黑色"},
            {"en": "white", "zh": "白色"},
            {"en": "purple", "zh": "紫色"},
            {"en": "brown", "zh": "棕色"},
            {"en": "gray", "zh": "灰色"},
        ]
    },
    {
        "unit": "Unit 1",
        "title": "My name's Gina.",
        "words": [
            {"en": "name", "zh": "名字"},
            {"en": "nice", "zh": "令人愉快的"},
            {"en": "meet", "zh": "遇见"},
            {"en": "first", "zh": "第一"},
            {"en": "last", "zh": "最后的"},
            {"en": "friend", "zh": "朋友"},
            {"en": "phone", "zh": "电话"},
            {"en": "number", "zh": "号码"},
            {"en": "school", "zh": "学校"},
            {"en": "year", "zh": "年"},
            {"en": "middle", "zh": "中间"},
            {"en": "grade", "zh": "年级"},
        ]
    },
    {
        "unit": "Unit 2",
        "title": "This is my sister.",
        "words": [
            {"en": "sister", "zh": "姐妹"},
            {"en": "brother", "zh": "兄弟"},
            {"en": "mother", "zh": "母亲"},
            {"en": "father", "zh": "父亲"},
            {"en": "parent", "zh": "父(母)亲"},
            {"en": "grandmother", "zh": "祖母"},
            {"en": "grandfather", "zh": "祖父"},
            {"en": "family", "zh": "家庭"},
            {"en": "daughter", "zh": "女儿"},
            {"en": "son", "zh": "儿子"},
            {"en": "photo", "zh": "照片"},
            {"en": "here", "zh": "这里"},
        ]
    },
    {
        "unit": "Unit 3",
        "title": "Is this your pencil?",
        "words": [
            {"en": "pencil", "zh": "铅笔"},
            {"en": "book", "zh": "书"},
            {"en": "eraser", "zh": "橡皮"},
            {"en": "box", "zh": "箱子"},
            {"en": "desk", "zh": "书桌"},
            {"en": "table", "zh": "桌子"},
            {"en": "chair", "zh": "椅子"},
            {"en": "schoolbag", "zh": "书包"},
            {"en": "dictionary", "zh": "词典"},
            {"en": "bank", "zh": "银行"},
            {"en": "baseball", "zh": "棒球"},
            {"en": "computer", "zh": "电脑"},
        ]
    },
    {
        "unit": "Unit 4",
        "title": "Where's my schoolbag?",
        "words": [
            {"en": "where", "zh": "在哪里"},
            {"en": "under", "zh": "在...下面"},
            {"en": "come", "zh": "来"},
            {"en": "think", "zh": "认为"},
            {"en": "room", "zh": "房间"},
            {"en": "head", "zh": "头"},
            {"en": "know", "zh": "知道"},
            {"en": "radio", "zh": "收音机"},
            {"en": "clock", "zh": "时钟"},
            {"en": "tape", "zh": "磁带"},
            {"en": "model", "zh": "模型"},
            {"en": "plane", "zh": "飞机"},
        ]
    },
    {
        "unit": "Unit 5",
        "title": "Do you have a soccer ball?",
        "words": [
            {"en": "soccer", "zh": "足球"},
            {"en": "ball", "zh": "球"},
            {"en": "basketball", "zh": "篮球"},
            {"en": "volleyball", "zh": "排球"},
            {"en": "tennis", "zh": "网球"},
            {"en": "ping-pong", "zh": "乒乓球"},
            {"en": "sport", "zh": "运动"},
            {"en": "have", "zh": "有"},
            {"en": "get", "zh": "得到"},
            {"en": "play", "zh": "玩"},
            {"en": "love", "zh": "爱"},
            {"en": "watch", "zh": "观看"},
            {"en": "interesting", "zh": "有趣的"},
            {"en": "difficult", "zh": "困难的"},
        ]
    },
    {
        "unit": "Unit 6",
        "title": "Do you like bananas?",
        "words": [
            {"en": "banana", "zh": "香蕉"},
            {"en": "hamburger", "zh": "汉堡"},
            {"en": "tomato", "zh": "西红柿"},
            {"en": "strawberry", "zh": "草莓"},
            {"en": "apple", "zh": "苹果"},
            {"en": "bread", "zh": "面包"},
            {"en": "carrot", "zh": "胡萝卜"},
            {"en": "rice", "zh": "米饭"},
            {"en": "chicken", "zh": "鸡肉"},
            {"en": "milk", "zh": "牛奶"},
            {"en": "fruit", "zh": "水果"},
            {"en": "vegetable", "zh": "蔬菜"},
            {"en": "food", "zh": "食物"},
            {"en": "healthy", "zh": "健康的"},
        ]
    },
    {
        "unit": "Unit 7",
        "title": "How much are these socks?",
        "words": [
            {"en": "socks", "zh": "短袜"},
            {"en": "shorts", "zh": "短裤"},
            {"en": "sweater", "zh": "毛衣"},
            {"en": "shoes", "zh": "鞋子"},
            {"en": "skirt", "zh": "裙子"},
            {"en": "shirt", "zh": "衬衫"},
            {"en": "trousers", "zh": "裤子"},
            {"en": "coat", "zh": "外套"},
            {"en": "dollar", "zh": "元"},
            {"en": "clothes", "zh": "衣服"},
            {"en": "store", "zh": "商店"},
            {"en": "buy", "zh": "买"},
            {"en": "sell", "zh": "卖"},
            {"en": "price", "zh": "价格"},
        ]
    },
    {
        "unit": "Unit 8",
        "title": "When is your birthday?",
        "words": [
            {"en": "when", "zh": "什么时候"},
            {"en": "month", "zh": "月"},
            {"en": "day", "zh": "天"},
            {"en": "year", "zh": "年"},
            {"en": "birthday", "zh": "生日"},
            {"en": "party", "zh": "聚会"},
            {"en": "gift", "zh": "礼物"},
            {"en": "happy", "zh": "高兴的"},
            {"en": "old", "zh": "年老的"},
            {"en": "trip", "zh": "旅行"},
            {"en": "test", "zh": "测验"},
            {"en": "student", "zh": "学生"},
            {"en": "thing", "zh": "东西"},
            {"en": "favorite", "zh": "最喜爱的"},
        ]
    },
    {
        "unit": "Unit 9",
        "title": "My favorite subject is science.",
        "words": [
            {"en": "subject", "zh": "科目"},
            {"en": "science", "zh": "科学"},
            {"en": "music", "zh": "音乐"},
            {"en": "math", "zh": "数学"},
            {"en": "Chinese", "zh": "语文"},
            {"en": "English", "zh": "英语"},
            {"en": "history", "zh": "历史"},
            {"en": "geography", "zh": "地理"},
            {"en": "art", "zh": "美术"},
            {"en": "Monday", "zh": "星期一"},
            {"en": "Friday", "zh": "星期五"},
            {"en": "Saturday", "zh": "星期六"},
            {"en": "Sunday", "zh": "星期日"},
            {"en": "teacher", "zh": "老师"},
        ]
    },
]

# ─── 朗读课文材料 ───

READING_MATERIALS = [
    {
        "id": "yuwen_7a_01",
        "title": "春（节选）- 朱自清",
        "subject": "语文",
        "text": "盼望着，盼望着，东风来了，春天的脚步近了。一切都像刚睡醒的样子，欣欣然张开了眼。山朗润起来了，水涨起来了，太阳的脸红起来了。小草偷偷地从土里钻出来，嫩嫩的，绿绿的。园子里，田野里，瞧去，一大片一大片满是的。"
    },
    {
        "id": "yuwen_7a_02",
        "title": "济南的冬天（节选）- 老舍",
        "subject": "语文",
        "text": "对于一个在北平住惯的人，像我，冬天要是不刮风，便觉得是奇迹；济南的冬天是没有风声的。对于一个刚由伦敦回来的人，像我，冬天要能看得见日光，便觉得是怪事；济南的冬天是响晴的。自然，在热带的地方，日光是永远那么毒，响亮的天气反有点儿叫人害怕。"
    },
    {
        "id": "yuwen_7a_03",
        "title": "散步（节选）- 莫怀戚",
        "subject": "语文",
        "text": "我们在田野散步：我，我的母亲，我的妻子和儿子。母亲本不愿出来的。她老了，身体不好，走远一点就觉得很累。我说，正因为如此，才应该多走走。母亲信服地点点头，便去拿外套。她现在很听我的话，就像我小时候很听她的话一样。"
    },
    {
        "id": "yuwen_7a_04",
        "title": "秋天的怀念（节选）- 史铁生",
        "subject": "语文",
        "text": "双腿瘫痪后，我的脾气变得暴怒无常。望着望着天上北归的雁阵，我会突然把面前的玻璃砸碎；听着听着李谷一甜美的歌声，我会猛地把手边的东西摔向四周的墙壁。母亲就悄悄地躲出去，在我看不见的地方偷偷地听着我的动静。"
    },
    {
        "id": "yuwen_7a_05",
        "title": "从百草园到三味书屋（节选）- 鲁迅",
        "subject": "语文",
        "text": "不必说碧绿的菜畦，光滑的石井栏，高大的皂荚树，紫红的桑葚；也不必说鸣蝉在树叶里长吟，肥胖的黄蜂伏在菜花上，轻捷的叫天子忽然从草间直窜向云霄里去了。单是周围的短短的泥墙根一带，就有无限趣味。"
    },
]


def _get_today_utc():
    return datetime.datetime.now(datetime.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)


def _get_week_start_utc():
    today = _get_today_utc()
    monday = today - datetime.timedelta(days=today.weekday())
    return monday


# ─── Task CRUD ───

def create_task(data: dict) -> Task:
    with get_session() as session:
        task = Task(**data)
        session.add(task)
        session.commit()
        session.refresh(task)
        # detach from session
        session.expunge(task)
        return task


def update_task(task_id: int, data: dict) -> Optional[Task]:
    with get_session() as session:
        task = session.query(Task).filter(Task.id == task_id).first()
        if not task:
            return None
        for k, v in data.items():
            if v is not None:
                setattr(task, k, v)
        session.commit()
        session.refresh(task)
        session.expunge(task)
        return task


def get_task(task_id: int) -> Optional[Task]:
    with get_session() as session:
        task = session.query(Task).filter(Task.id == task_id).first()
        if task:
            session.expunge(task)
        return task


def list_tasks(active_only: bool = True) -> List[Task]:
    with get_session() as session:
        q = session.query(Task)
        if active_only:
            q = q.filter(Task.is_active == True)
        tasks = q.order_by(Task.created_at.desc()).all()
        for t in tasks:
            session.expunge(t)
        return tasks


def delete_task(task_id: int) -> bool:
    with get_session() as session:
        task = session.query(Task).filter(Task.id == task_id).first()
        if not task:
            return False
        task.is_active = False  # type: ignore[assignment]
        session.commit()
        return True


# ─── Task Completion ───

def complete_task(task_id: int, photo_key: Optional[str] = None, note: Optional[str] = None) -> Optional[TaskCompletion]:
    task = get_task(task_id)
    if not task:
        return None
    with get_session() as session:
        completion = TaskCompletion(
            task_id=task_id,
            points_earned=task.points,
            photo_key=photo_key,
            status="completed",
            note=note,
        )
        session.add(completion)
        # 记录积分
        log = PointsLog(
            source_type="task",
            source_id=task_id,
            points=task.points,
            description=f"完成任务: {task.title}",
        )
        session.add(log)
        session.commit()
        session.refresh(completion)
        session.expunge(completion)
        return completion


def get_task_completions(task_id: Optional[int] = None, date_from=None) -> List[TaskCompletion]:
    with get_session() as session:
        q = session.query(TaskCompletion)
        if task_id:
            q = q.filter(TaskCompletion.task_id == task_id)
        if date_from:
            q = q.filter(TaskCompletion.completed_at >= date_from)
        results = q.order_by(TaskCompletion.completed_at.desc()).all()
        for r in results:
            session.expunge(r)
        return results


# ─── Photo Upload ───

def get_photo_storage():
    from coze_coding_dev_sdk.s3 import S3SyncStorage
    return S3SyncStorage(
        endpoint_url=os.getenv("COZE_BUCKET_ENDPOINT_URL"),
        access_key="",
        secret_key="",
        bucket_name=os.getenv("COZE_BUCKET_NAME"),
        region="cn-beijing",
    )


def upload_photo(file_content: bytes, file_name: str, content_type: str = "image/jpeg") -> str:
    storage = get_photo_storage()
    key = storage.upload_file(
        file_content=file_content,
        file_name=f"todo-photos/{file_name}",
        content_type=content_type,
    )
    return key


def get_photo_url(photo_key: str, expire_time: int = 86400) -> str:
    storage = get_photo_storage()
    return storage.generate_presigned_url(key=photo_key, expire_time=expire_time)


# ─── Reading Session ───

def create_reading_session(task_id: Optional[int], text_content: str, target_count: int = 1) -> ReadingSession:
    with get_session() as session:
        rs = ReadingSession(
            task_id=task_id,
            text_content=text_content,
            target_count=target_count,
            read_count=0,
        )
        session.add(rs)
        session.commit()
        session.refresh(rs)
        session.expunge(rs)
        return rs


def submit_reading_audio(session_id: int, audio_key: str, recognized_text: str) -> Optional[ReadingSession]:
    with get_session() as session:
        rs = session.query(ReadingSession).filter(ReadingSession.id == session_id).first()
        if not rs:
            return None

        rs.audio_key = audio_key
        rs.recognized_text = recognized_text
        rs.read_count += 1

        # 计算完整度：识别文本与原文的字符匹配率
        completeness = _calc_completeness(rs.text_content, recognized_text)
        rs.completeness = completeness

        # 判断是否达标：完整度>=70% 且 朗读次数>=目标次数
        current_read_count = rs.read_count
        current_target = rs.target_count
        if completeness >= 0.7 and current_read_count >= current_target:
            rs.is_completed = True
            # 获取关联任务的积分
            points = 1
            if rs.task_id is not None:
                task = session.query(Task).filter(Task.id == rs.task_id).first()
                if task:
                    points = task.points
            rs.points_earned = points
            # 记录积分
            log = PointsLog(
                source_type="reading",
                source_id=session_id,
                points=points,
                description=f"朗读打卡: {rs.text_content[:20]}...",
            )
            session.add(log)

        session.commit()
        session.refresh(rs)
        session.expunge(rs)
        return rs


def _calc_completeness(original: str, recognized: str) -> float:
    """计算朗读完整度 - 基于字符级别的匹配"""
    if not recognized or not original:
        return 0.0
    # 去除标点符号和空格进行比对
    import re
    punct_pattern = r'[\uFF0C\u3002\uFF01\uFF1F\u3001\uFF1B\uFF1A\u201C\u201D\u2018\u2019\uFF08\uFF09\s\n]'
    clean_orig = re.sub(punct_pattern, '', original)
    clean_recog = re.sub(punct_pattern, '', recognized)

    if not clean_orig:
        return 0.0

    # 使用最长公共子序列计算匹配率
    matched = _lcs_length(clean_orig, clean_recog)
    return min(matched / len(clean_orig), 1.0)


def _lcs_length(s1: str, s2: str) -> int:
    """计算最长公共子序列长度（优化版，只保留长度）"""
    m, n = len(s1), len(s2)
    if m == 0 or n == 0:
        return 0
    # 使用一维数组优化空间
    prev = [0] * (n + 1)
    curr = [0] * (n + 1)
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                curr[j] = prev[j - 1] + 1
            else:
                curr[j] = max(prev[j], curr[j - 1])
        prev, curr = curr, [0] * (n + 1)
    return prev[n]


def get_reading_sessions(task_id: Optional[int] = None, limit: int = 20) -> List[ReadingSession]:
    with get_session() as session:
        q = session.query(ReadingSession)
        if task_id:
            q = q.filter(ReadingSession.task_id == task_id)
        results = q.order_by(ReadingSession.created_at.desc()).limit(limit).all()
        for r in results:
            session.expunge(r)
        return results


# ─── Dictation Session ───

def create_dictation_session(unit_id: int) -> dict:
    """Create a dictation session from a word unit ID. Returns session info with words."""
    # unit_id is 1-indexed into WORD_BANK
    if unit_id < 1 or unit_id > len(WORD_BANK):
        raise ValueError(f"Dictation unit {unit_id} not found")

    unit = WORD_BANK[unit_id - 1]
    words = unit["words"]

    with get_session() as session:
        ds = DictationSession(
            unit_name=unit["unit"],
            words=words,
            total_words=len(words),
        )
        session.add(ds)
        session.commit()
        session.refresh(ds)

        # Return session info with words for the frontend (hints only, not answers)
        words_for_display = [
            {"word": w["en"], "hint": w["zh"]}
            for w in words
        ]
        return {
            "session_id": ds.id,
            "unit_name": unit["unit"],
            "total_words": len(words),
            "words": words_for_display,
        }


def submit_dictation_answers(session_id: int, answers: list) -> Optional[DictationSession]:
    with get_session() as session:
        ds = session.query(DictationSession).filter(DictationSession.id == session_id).first()
        if not ds:
            return None

        words = ds.words
        correct_count = 0
        graded_answers = []

        for ans in answers:
            idx = ans.get("word_index", -1)
            student_answer = ans.get("answer", "").strip().lower()
            if 0 <= idx < len(words):
                correct_word = words[idx]["en"].lower()
                is_correct = student_answer == correct_word
                if is_correct:
                    correct_count += 1
                graded_answers.append({
                    "word_index": idx,
                    "expected": words[idx]["en"],
                    "answer": ans.get("answer", ""),
                    "correct": is_correct,
                })

        ds.answers = graded_answers
        ds.correct_count = correct_count
        total = ds.total_words
        accuracy_val = correct_count / total if total > 0 else 0.0
        ds.accuracy = accuracy_val

        # 积分计算：正确率>=80% 获得积分，全对额外奖励
        if accuracy_val >= 0.8:
            base_points = 2
            if accuracy_val >= 1.0:
                base_points = 5  # 全对奖励
            elif accuracy_val >= 0.9:
                base_points = 3
            ds.points_earned = base_points

            log = PointsLog(
                source_type="dictation",
                source_id=session_id,
                points=base_points,
                description=f"英语听写 {ds.unit_name}: {correct_count}/{ds.total_words}",
            )
            session.add(log)

        session.commit()
        session.refresh(ds)

        return {
            "correct_count": correct_count,
            "total_words": total,
            "accuracy": round(accuracy_val, 4),
            "points_earned": ds.points_earned,
            "details": graded_answers,
        }


def get_dictation_sessions(limit: int = 20) -> List[DictationSession]:
    with get_session() as session:
        results = session.query(DictationSession).order_by(
            DictationSession.created_at.desc()
        ).limit(limit).all()
        for r in results:
            session.expunge(r)
        return results


# ─── TTS (Text-to-Speech) ───

def generate_tts_audio(text: str, speaker: str = "zh_female_vv_uranus_bigtts") -> str:
    """生成 TTS 音频，返回音频 URL"""
    from coze_coding_dev_sdk import TTSClient
    from coze_coding_utils.runtime_ctx.context import new_context

    ctx = new_context(method="tts.synthesize")
    client = TTSClient(ctx=ctx)

    audio_url, audio_size = client.synthesize(
        uid="todo_student",
        text=text,
        speaker=speaker,
        audio_format="mp3",
        sample_rate=24000,
    )
    return audio_url


# ─── ASR (Speech Recognition) ───

def recognize_speech(audio_url: Optional[str] = None, audio_base64: Optional[str] = None) -> str:
    """语音识别，返回识别文本"""
    from coze_coding_dev_sdk import ASRClient
    from coze_coding_utils.runtime_ctx.context import new_context

    ctx = new_context(method="asr.recognize")
    client = ASRClient(ctx=ctx)

    text, data = client.recognize(
        uid="todo_student",
        url=audio_url,
        base64_data=audio_base64,
    )
    return text


# ─── Points ───

def get_points_summary() -> dict:
    today_start = _get_today_utc()
    week_start = _get_week_start_utc()

    with get_session() as session:
        total = session.query(func.coalesce(func.sum(PointsLog.points), 0)).scalar()
        today = session.query(func.coalesce(func.sum(PointsLog.points), 0)).filter(
            PointsLog.created_at >= today_start
        ).scalar()
        week = session.query(func.coalesce(func.sum(PointsLog.points), 0)).filter(
            PointsLog.created_at >= week_start
        ).scalar()
        total_completions = session.query(func.count(TaskCompletion.id)).scalar()
        total_readings = session.query(func.count(ReadingSession.id)).filter(
            ReadingSession.is_completed == True
        ).scalar()
        total_dictations = session.query(func.count(DictationSession.id)).filter(
            DictationSession.accuracy >= 0.8
        ).scalar()

    # 计算连续打卡天数
    streak = _calc_streak()

    return {
        "total_points": int(total),
        "today_points": int(today),
        "week_points": int(week),
        "streak_days": streak,
        "total_completions": int(total_completions),
        "total_readings": int(total_readings),
        "total_dictations": int(total_dictations),
    }


def _calc_streak() -> int:
    """计算连续打卡天数"""
    with get_session() as session:
        dates = session.query(
            func.date(PointsLog.created_at)
        ).distinct().order_by(
            desc(func.date(PointsLog.created_at))
        ).limit(365).all()

    if not dates:
        return 0

    date_list = [d[0] for d in dates]
    today = datetime.datetime.now(datetime.timezone.utc).date()
    streak = 0

    for i, d in enumerate(date_list):
        expected = today - datetime.timedelta(days=i)
        if d == expected:
            streak += 1
        else:
            break

    return streak


def get_points_logs(limit: int = 50) -> List[PointsLog]:
    with get_session() as session:
        results = session.query(PointsLog).order_by(
            PointsLog.created_at.desc()
        ).limit(limit).all()
        for r in results:
            session.expunge(r)
        return results


# ─── Word Bank Access ───

def get_word_units() -> list:
    """Return word units with id, unit_name, subject, and word_count."""
    result = []
    for i, unit in enumerate(WORD_BANK, 1):
        result.append({
            "id": i,
            "unit_name": unit["unit"],
            "title": unit.get("title", ""),
            "subject": "英语",
            "word_count": len(unit["words"]),
        })
    return result


def get_reading_materials() -> list:
    return READING_MATERIALS
