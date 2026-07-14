"""Minimal agent for platform compatibility - 学习管理系统使用 Web 应用模式"""
import os
import json
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from coze_coding_utils.runtime_ctx.context import default_headers
from storage.memory.memory_saver import get_memory_saver


LLM_CONFIG = "config/agent_llm_config.json"


def build_agent(ctx=None):
    workspace_path = os.getenv("COZE_WORKSPACE_PATH", "/workspace/projects")
    config_path = os.path.join(workspace_path, LLM_CONFIG)

    # Fallback config if file doesn't exist
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
    else:
        cfg = {
            "config": {
                "model": "doubao-seed-2-0-lite-260215",
                "temperature": 0.7,
                "top_p": 0.9,
                "max_completion_tokens": 10000,
                "timeout": 600,
                "thinking": "disabled"
            },
            "sp": "You are a helpful assistant.",
            "tools": []
        }

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
        system_prompt=cfg.get("sp", "You are a helpful assistant."),
        tools=[],
        checkpointer=get_memory_saver(),
    )
