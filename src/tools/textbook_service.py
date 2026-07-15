"""教材内容获取服务 - 通过 LLM 生成标准教材内容"""
import json
import logging
from coze_coding_dev_sdk import LLMClient
from coze_coding_utils.runtime_ctx.context import new_context
from langchain_core.messages import SystemMessage, HumanMessage

logger = logging.getLogger(__name__)

# 支持的教材版本和科目
TEXTBOOK_CATALOG = {
    "english": {
        "name": "英语",
        "versions": ["人教版(PEP)", "外研版", "译林版", "北师大版", "冀教版"],
        "grades": ["七年级上册", "七年级下册", "八年级上册", "八年级下册", "九年级全一册"],
        "units_range": {
            "七年级上册": list(range(1, 10)),
            "七年级下册": list(range(1, 13)),
            "八年级上册": list(range(1, 11)),
            "八年级下册": list(range(1, 11)),
            "九年级全一册": list(range(1, 15)),
        }
    },
    "chinese": {
        "name": "语文",
        "versions": ["人教版(部编版)", "苏教版", "语文版", "北师大版"],
        "grades": ["七年级上册", "七年级下册", "八年级上册", "八年级下册", "九年级上册", "九年级下册"],
        "units_range": {
            "七年级上册": list(range(1, 7)),
            "七年级下册": list(range(1, 7)),
            "八年级上册": list(range(1, 6)),
            "八年级下册": list(range(1, 6)),
            "九年级上册": list(range(1, 6)),
            "九年级下册": list(range(1, 6)),
        }
    }
}


def _extract_text_content(content) -> str:
    """安全提取 LLM 返回的文本内容"""
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        if content and isinstance(content[0], str):
            return " ".join(content)
        else:
            return " ".join(
                item.get("text", "")
                for item in content
                if isinstance(item, dict) and item.get("type") == "text"
            )
    return str(content)


def generate_english_words(subject: str, grade: str, version: str, unit: int) -> dict:
    """通过 LLM 生成英语单词表

    Returns:
        {"words": [{"word": "apple", "phonetic": "/ˈæpl/", "pos": "n.", "meaning": "苹果"}, ...]}
    """
    ctx = new_context(method="textbook_gen")
    client = LLMClient(ctx=ctx)

    system_prompt = """你是一位资深初中英语教师，精通人教版等主流教材的词汇表。
你的任务是根据用户指定的教材信息，返回该单元的标准单词表。
要求：
1. 单词必须与真实教材一致，不可编造
2. 包含音标、词性、中文释义
3. 按教材原顺序排列
4. 只返回 JSON，不要其他内容"""

    user_prompt = f"""请返回以下教材单元的标准单词表：
- 科目：英语
- 年级：{grade}
- 版本：{version}
- 单元：Unit {unit}

请严格按以下 JSON 格式返回（不要包含 markdown 代码块标记）：
{{"unit_title": "单元标题", "words": [{{"word": "单词", "phonetic": "音标", "pos": "词性", "meaning": "中文释义"}}]}}"""

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        response = client.invoke(
            messages=messages,
            model="doubao-seed-2-0-mini-260215",
            temperature=0.1,
            max_completion_tokens=8000
        )
        text = _extract_text_content(response.content)
        # 清理可能的 markdown 代码块标记
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
        data = json.loads(text)
        logger.info(f"Generated English words for {grade} {version} Unit {unit}: {len(data.get('words', []))} words")
        return data
    except Exception as e:
        logger.error(f"Failed to generate English words: {e}")
        return {"unit_title": f"Unit {unit}", "words": []}


def generate_reading_text(subject: str, grade: str, version: str, unit: int) -> dict:
    """通过 LLM 生成课文朗读内容

    Returns:
        {"unit_title": "单元标题", "title": "课文标题", "passages": [{"title": "段落标题", "content": "课文内容"}]}
    """
    ctx = new_context(method="textbook_gen")
    client = LLMClient(ctx=ctx)

    subject_name = "英语" if subject == "english" else "语文"

    system_prompt = f"""你是一位资深初中{subject_name}教师，精通人教版等主流教材的课文内容。
你的任务是根据用户指定的教材信息，返回该单元的课文朗读内容。
要求：
1. 课文内容必须与真实教材一致，不可编造
2. 包含课文标题和完整正文
3. 如果是英语课文，提供英文原文
4. 按教材原顺序排列（一个单元可能有多篇课文）
5. 只返回 JSON，不要其他内容"""

    user_prompt = f"""请返回以下教材单元的课文朗读内容：
- 科目：{subject_name}
- 年级：{grade}
- 版本：{version}
- 单元：第{unit}单元

请严格按以下 JSON 格式返回（不要包含 markdown 代码块标记）：
{{"unit_title": "单元标题", "passages": [{{"title": "课文标题", "content": "课文完整内容"}}]}}"""

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        response = client.invoke(
            messages=messages,
            model="doubao-seed-2-0-mini-260215",
            temperature=0.1,
            max_completion_tokens=10000
        )
        text = _extract_text_content(response.content)
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
        data = json.loads(text)
        logger.info(f"Generated reading text for {grade} {version} Unit {unit}: {len(data.get('passages', []))} passages")
        return data
    except Exception as e:
        logger.error(f"Failed to generate reading text: {e}")
        return {"unit_title": f"第{unit}单元", "passages": []}


def get_catalog() -> dict:
    """获取教材目录"""
    return TEXTBOOK_CATALOG
