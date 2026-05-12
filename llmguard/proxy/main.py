import logging
import os
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

from llmguard.adapters.openai_adapter import get_openai_adapter
from llmguard.auth.middleware import ApiKeyAuthMiddleware
from llmguard.db import init_db

logger = logging.getLogger("llmguard.proxy")


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    upstream = os.getenv("LLMGUARD_UPSTREAM_URL", "https://api.openai.com")
    logger.info("LLMGuard proxy listening — upstream: %s", upstream)
    yield


app = FastAPI(title="LLMGuard", version="0.1.0", lifespan=lifespan)
app.add_middleware(ApiKeyAuthMiddleware)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    body = await request.json()
    headers = dict(request.headers)
    adapter = get_openai_adapter()
    try:
        result = await adapter.forward(body, headers)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return JSONResponse(content=result)


def start():
    uvicorn.run("llmguard.proxy.main:app", host="0.0.0.0", port=8000, reload=False)  # nosec B104
