"""学习助手工具 - 供 Agent 调用的工具函数"""
import json
import re
from datetime import datetime, date, timedelta
from typing import Any, Dict, List
from langchain.tools import tool
from coze_coding_utils.log.write_log import request_context
from coze_coding_utils.runtime_ctx.context import new_context
from storage.database.supabase_client import get_supabase_client


def _get_db():
    ctx = request_context.get() or new_context(method="todo_tools")
    return get_supabase_client()


def _parse_date(date_str: str) -> str:
    """解析日期字符串，支持相对日期（如'明天'、'后天'）和绝对日期格式。"""
    if not date_str:
        return date.today().isoformat()
    
    # 尝试直接解析为日期
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return date_str
    except ValueError:
        pass
    
    # 处理相对日期
    today = date.today()
    relative_map = {
        "今天": 0, "明天": 1, "后天": 2, "大后天": 3,
        "昨天": -1, "前天": -2,
    }
    for keyword, offset in relative_map.items():
        if keyword in date_str:
            return (today + timedelta(days=offset)).isoformat()
    
    # 尝试解析常见格式
    for fmt in ["%m月%d日", "%m/%d", "%Y年%m月%d日"]:
        try:
            parsed = datetime.strptime(date_str, fmt)
            return parsed.replace(year=today.year).date().isoformat()
        except ValueError:
            continue
    
    # 默认返回今天
    return today.isoformat()


@tool
def get_today_tasks() -> str:
    """获取今天的所有学习任务列表。返回任务名称、科目、类型、积分等信息。"""
    db = _get_db()
    today = date.today().isoformat()
    row = db.from_("todo_tasks").select("*").eq("task_date", today).eq("is_active", True).order("created_at", desc=False).execute()
    tasks: List[Dict[str, Any]] = row.data if row.data else []  # type: ignore
    if not tasks:
        return "今天还没有安排任务哦～可以让家长帮你添加一些学习任务！"
    result = []
    for t in tasks:
        type_icon = {"reading": "🎤", "dictation": "🔤"}.get(str(t.get("task_type", "")), "")
        status = "✅" if t.get("is_completed") else "⬜"
        result.append(f"{status} {type_icon} **{t.get('title', '')}** ({t.get('subject', '')}) - {t.get('points', 0)}积分")
        if t.get("description"):
            result.append(f"   📋 {t.get('description', '')}")
    return "\n".join(result)


@tool
def complete_task(task_title: str) -> str:
    """标记某个任务为已完成。参数 task_title 是任务的名称。"""
    db = _get_db()
    today = date.today().isoformat()
    row = db.from_("todo_tasks").select("id", "points", "is_completed").eq("title", task_title).eq("task_date", today).execute()
    tasks: List[Dict[str, Any]] = row.data if row.data else []  # type: ignore
    if not tasks:
        return f"没有找到名为「{task_title}」的今日任务哦，请检查任务名称～"
    task = tasks[0]
    if task.get("is_completed"):
        return f"「{task_title}」已经完成啦，不要重复打卡哦～"
    db.from_("todo_tasks").update({"is_completed": True, "completed_at": datetime.now().isoformat()}).eq("id", task["id"]).execute()
    points = int(task.get("points", 0) or 0)
    if points > 0:
        db.from_("todo_task_completions").insert({
            "task_id": task["id"],
            "completed_at": datetime.now().isoformat(),
            "points_earned": points,
            "status": "completed"
        }).execute()
        db.from_("todo_points_log").insert({
            "source_type": "task",
            "source_id": task["id"],
            "points": points,
            "description": f"完成任务：{task_title}"
        }).execute()
    return f"太棒了！🎉 「{task_title}」已完成！获得 {points} 积分！"


@tool
def get_points_summary() -> str:
    """查看积分统计，包括总积分、今日积分和最近记录。"""
    db = _get_db()
    total_row = db.from_("todo_points_log").select("points").execute()
    total_points = sum(int(p.get("points", 0) or 0) for p in (total_row.data or []))  # type: ignore
    today = date.today().isoformat()
    today_row = db.from_("todo_points_log").select("points").gte("created_at", f"{today}T00:00:00").execute()
    today_points = sum(int(p.get("points", 0) or 0) for p in (today_row.data or []))  # type: ignore
    recent_row = db.from_("todo_points_log").select("points,description,created_at").order("created_at", desc=True).limit(5).execute()
    recent: List[Dict[str, Any]] = recent_row.data or []  # type: ignore
    result = [f"🏆 **总积分：{total_points}**", f"📅 **今日积分：{today_points}**", ""]
    if recent:
        result.append("📋 最近记录：")
        for r in recent:
            result.append(f"  • {r.get('description', '')} (+{r.get('points', 0)})")
    else:
        result.append("还没有积分记录，快去完成任务吧！")
    return "\n".join(result)


@tool
def get_all_tasks() -> str:
    """获取所有任务（包括历史任务），用于家长查看和管理。"""
    db = _get_db()
    row = db.from_("todo_tasks").select("*").order("task_date", desc=True).order("created_at", desc=False).execute()
    tasks: List[Dict[str, Any]] = row.data if row.data else []  # type: ignore
    if not tasks:
        return "还没有任何任务记录。"
    result = []
    for t in tasks:
        status = "✅" if t.get("is_completed") else "⬜"
        active = "" if t.get("is_active") else "🔴已删除"
        result.append(f"{status} **{t.get('title', '')}** ({t.get('task_date', '')} / {t.get('subject', '')} / {t.get('points', 0)}积分) {active}")
    return "\n".join(result)


@tool
def add_task(title: str, subject: str, task_type: str, points: int, task_date: str = "", description: str = "", word_list: str = "", reading_content: str = "") -> str:
    """添加新任务。参数：title=任务名称, subject=科目, task_type=类型(普通/朗读/听写), points=积分, task_date=日期(默认今天), description=描述, word_list=词库JSON, reading_content=课文内容。"""
    db = _get_db()
    task_date = _parse_date(task_date)
    task_data = {
        "title": title, "subject": subject, "task_type": task_type,
        "points": points, "task_date": task_date, "description": description,
        "word_list": word_list, "reading_content": reading_content,
        "is_active": True, "is_completed": False
    }
    db.from_("todo_tasks").insert(task_data).execute()
    return f"✅ 任务「{title}」已添加！（{task_date} / {subject} / {points}积分）"


@tool
def delete_task(task_title: str) -> str:
    """删除指定名称的任务。"""
    db = _get_db()
    row = db.from_("todo_tasks").select("id").eq("title", task_title).execute()
    tasks: List[Dict[str, Any]] = row.data if row.data else []  # type: ignore
    if not tasks:
        return f"没有找到名为「{task_title}」的任务。"
    db.from_("todo_tasks").update({"is_active": False}).eq("id", tasks[0]["id"]).execute()
    return f"🗑️ 任务「{task_title}」已删除。"


@tool
def get_textbook_catalog(subject: str = "英语", grade: str = "七年级", version: str = "人教版") -> str:
    """获取教材目录，列出可用单元。参数：subject=科目(英语/语文), grade=年级(七年级/八年级/九年级), version=版本(人教版/外研版/译林版)。"""
    db = _get_db()
    row = db.from_("todo_textbook_content").select("unit_name").eq("subject", subject).eq("grade", grade).eq("textbook_version", version).order("unit_order").execute()
    units: List[Dict[str, Any]] = row.data if row.data else []  # type: ignore
    if not units:
        return f"暂未找到 {version}{grade}{subject} 的教材内容，可以尝试其他版本或手动输入内容。"
    result = [f"📚 **{version}{grade}{subject}** 可用单元："]
    for u in units:
        result.append(f"  • {u.get('unit_name', '')}")
    return "\n".join(result)


@tool
def get_textbook_content(subject: str, grade: str, version: str, unit_name: str) -> str:
    """获取指定单元的教材内容（词库或课文）。参数：subject=科目, grade=年级, version=版本, unit_name=单元名称。"""
    db = _get_db()
    row = db.from_("todo_textbook_content").select("*").eq("subject", subject).eq("grade", grade).eq("textbook_version", version).eq("unit_name", unit_name).execute()
    items: List[Dict[str, Any]] = row.data if row.data else []  # type: ignore
    if not items:
        return f"暂未找到 {version}{grade}{subject}{unit_name} 的内容。"
    item = items[0]
    result = [f" **{unit_name}** 内容："]
    if item.get("word_list"):
        try:
            words = json.loads(item["word_list"]) if isinstance(item["word_list"], str) else item["word_list"]  # type: ignore
            if isinstance(words, list):
                result.append(f" 词库（{len(words)}个单词）：")
                for w in words[:10]:
                    if isinstance(w, dict):
                        result.append(f"  • {w.get('word', '')} {w.get('phonetic', '')} - {w.get('meaning', '')}")
                    else:
                        result.append(f"  • {w}")
                if len(words) > 10:
                    result.append(f"  ... 共{len(words)}个")
        except Exception:
            result.append(f"🔤 词库：{item['word_list']}")
    if item.get("reading_content"):
        result.append(f"📝 课文：\n{str(item['reading_content'])[:200]}")
    return "\n".join(result)
