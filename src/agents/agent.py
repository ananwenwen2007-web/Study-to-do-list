import os
import json
from typing import Annotated
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langgraph.graph import MessagesState
from langgraph.graph.message import add_messages
from langchain_core.messages import AnyMessage
from coze_coding_utils.runtime_ctx.context import default_headers
from storage.memory.memory_saver import get_memory_saver
from tools.agent_tools import (
    get_today_tasks, complete_task, get_points_summary,
    get_all_tasks, add_task, delete_task,
    get_textbook_catalog, get_textbook_content
)

LLM_CONFIG = "config/agent_llm_config.json"

MAX_MESSAGES = 40

def _windowed_messages(old, new):
    all_msgs = add_messages(old, new)
    if isinstance(all_msgs, list):
        return all_msgs[-MAX_MESSAGES:]
    return all_msgs

class AgentState(MessagesState):
    messages: Annotated[list[AnyMessage], _windowed_messages]

SYSTEM_PROMPT = """# 角色定义
你是一个初一学生的学习助手，名叫「小学伴」。你的主要职责是帮助学生管理每日学习任务、跟踪积分进度。

# 核心能力
1. **查看任务**：学生可以问你今天有什么任务，你通过工具查询并展示
2. **完成任务**：学生完成任务后告诉你，你帮他们标记完成并发放积分
3. **朗读打卡**：学生朗读课文后告诉你，你帮他们验证并记录
4. **英语听写**：学生完成听写后告诉你答案，你帮他们批改
5. **查看积分**：学生可以随时查看自己的积分统计
6. **家长功能**：家长可以添加、编辑、删除任务

# 交互风格
- 用友好、温暖、鼓励的语气和学生对话
- 简洁明了，不要啰嗦
- 适当使用 emoji 增加趣味性 📚✨
- 完成任务时给予积极反馈："太棒了！""加油！"
- 如果学生遇到困难，耐心引导

# 重要规则
- 不要编造任务数据，所有数据必须通过工具获取
- 如果工具调用失败，友好地告知用户并建议重试
- 对于家长操作（添加/编辑任务），需要确认是家长在操作
- 保护学生隐私，不要泄露其他学生的信息
"""

def build_agent(ctx=None):
    workspace_path = os.getenv("COZE_WORKSPACE_PATH", "/workspace/projects")
    config_path = os.path.join(workspace_path, LLM_CONFIG)

    with open(config_path, 'r', encoding='utf-8') as f:
        cfg = json.load(f)

    api_key = os.getenv("COZE_WORKLOAD_IDENTITY_API_KEY")
    base_url = os.getenv("COZE_INTEGRATION_MODEL_BASE_URL")

    llm = ChatOpenAI(
        model=cfg['config'].get("model"),
        api_key=api_key,
        base_url=base_url,
        temperature=cfg['config'].get('temperature', 0.7),
        streaming=True,
        timeout=cfg['config'].get('timeout', 600),
        extra_body={
            "thinking": {
                "type": cfg['config'].get('thinking', 'disabled')
            }
        },
        default_headers=default_headers(ctx) if ctx else {}
    )

    return create_agent(
        model=llm,
        system_prompt=SYSTEM_PROMPT,
        tools=[
            get_today_tasks, complete_task, get_points_summary,
            get_all_tasks, add_task, delete_task,
            get_textbook_catalog, get_textbook_content
        ],
        checkpointer=get_memory_saver(),
        state_schema=AgentState,
    )
