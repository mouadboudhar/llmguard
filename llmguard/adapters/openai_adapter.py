import os
from typing import Any

import httpx
from fastapi import HTTPException

from llmguard.adapters.base import AdapterConfig, LLMAdapter

_FORWARD_HEADERS = ("authorization", "content-type")


class OpenAIAdapter(LLMAdapter):
    def __init__(self, config: AdapterConfig) -> None:
        self.config = config

    async def forward(
        self,
        request_body: dict[str, Any],
        headers: dict[str, Any],
    ) -> dict[str, Any]:
        lowered = {k.lower(): v for k, v in headers.items()}
        forward_headers = {
            name: lowered[name] for name in _FORWARD_HEADERS if name in lowered
        }
        async with httpx.AsyncClient(timeout=self.config.timeout_seconds) as client:
            response = await client.post(
                self.config.upstream_url,
                json=request_body,
                headers=forward_headers,
            )
        if response.is_error:
            try:
                detail = response.json()
            except ValueError:
                detail = response.text
            raise HTTPException(status_code=response.status_code, detail=detail)
        return response.json()


def get_openai_adapter() -> LLMAdapter:
    base = os.getenv("LLMGUARD_UPSTREAM_URL", "https://api.openai.com").rstrip("/")
    return OpenAIAdapter(AdapterConfig(upstream_url=f"{base}/v1/chat/completions"))
