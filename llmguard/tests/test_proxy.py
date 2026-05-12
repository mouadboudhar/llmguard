import httpx
import pytest
import respx
from httpx import ASGITransport, AsyncClient

from llmguard.proxy.main import app

UPSTREAM_URL = "https://api.openai.com/v1/chat/completions"

FAKE_COMPLETION = {
    "id": "chatcmpl-test",
    "object": "chat.completion",
    "model": "gpt-4o-mini",
    "choices": [
        {
            "index": 0,
            "message": {"role": "assistant", "content": "Hello!"},
            "finish_reason": "stop",
        }
    ],
}


def _client() -> AsyncClient:
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


@pytest.mark.asyncio
async def test_health_check():
    async with _client() as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
@respx.mock
async def test_proxy_forwards_request():
    route = respx.post(UPSTREAM_URL).mock(
        return_value=httpx.Response(200, json=FAKE_COMPLETION)
    )
    request_body = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "Hi"}],
    }
    async with _client() as client:
        response = await client.post(
            "/v1/chat/completions",
            json=request_body,
            headers={"Authorization": "Bearer sk-customer-key"},
        )
    assert response.status_code == 200
    assert response.json() == FAKE_COMPLETION
    assert route.called
    sent = route.calls.last.request
    assert sent.headers["authorization"] == "Bearer sk-customer-key"


@pytest.mark.asyncio
@respx.mock
async def test_proxy_handles_upstream_error():
    respx.post(UPSTREAM_URL).mock(
        return_value=httpx.Response(429, json={"error": {"message": "rate limited"}})
    )
    async with _client() as client:
        response = await client.post(
            "/v1/chat/completions",
            json={"model": "gpt-4o-mini", "messages": []},
            headers={"Authorization": "Bearer sk-customer-key"},
        )
    assert response.status_code == 429
