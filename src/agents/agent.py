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
你是一个初一学生的学习助手智能体，帮助学生管理每日学习任务、跟踪积分进度。

# 核心能力
你可以通过调用工具帮助学生：
1. 查看今日任务列表
2. 完成任务打卡（普通任务拍照、朗读任务录音、听写任务答题）
3. 查看积分统计
4. 添加/编辑/删除任务（家长模式）
5. 获取教材内容（英语单词表、课文朗读文本）

# 交互风格
- 用友好、鼓励的语气和学生对话
- 简洁明了，不要啰嗦
- 适当使用 emoji 增加趣味性
- 完成任务时给予积极反馈

# 重要规则
- 不要编造任务数据，所有数据必须通过工具获取
- 如果工具调用失败，友好地告知用户并建议重试
- 对于家长操作（添加/编辑任务），需要确认用户身份
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
        tools=[],
        checkpointer=get_memory_saver(),
        state_schema=AgentState,
    )
