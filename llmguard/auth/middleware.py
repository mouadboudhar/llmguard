from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.types import ASGIApp

from llmguard import db
from llmguard.auth.keys import hash_key
from llmguard.auth.repository import SQLiteKeyRepository

# GET-only paths that don't require an API key.
_EXEMPT_PATHS = frozenset({"/health", "/docs", "/openapi.json"})


class ApiKeyAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method == "GET" and request.url.path in _EXEMPT_PATHS:
            return await call_next(request)

        provided = request.headers.get("X-LLMGuard-Key")
        if not provided:
            return JSONResponse(
                status_code=401, content={"detail": "Missing X-LLMGuard-Key header"}
            )

        key_hash = hash_key(provided)
        async with db.AsyncSessionLocal() as session:
            repo = SQLiteKeyRepository(session)
            api_key = await repo.get_by_hash(key_hash)
            if api_key is None:
                return JSONResponse(
                    status_code=401, content={"detail": "Invalid or revoked API key"}
                )
            key_id = api_key.id
            await repo.update_last_used(key_id)
            await session.commit()

        request.state.key_id = key_id
        return await call_next(request)
