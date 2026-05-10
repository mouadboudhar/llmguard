import uvicorn
from fastapi import FastAPI

app = FastAPI(title="LLMGuard", version="0.1.0")


@app.get("/health")
async def health():
    return {"status": "ok"}


def start():
    uvicorn.run("llmguard.proxy.main:app", host="0.0.0.0", port=8000, reload=False)
