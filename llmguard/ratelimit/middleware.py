from fastapi import Request
from fastapi.responses import JSONResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession

from llmguard.auth.models import ApiKey
from llmguard.ratelimit.bucket import (
    WINDOWS,
    TokenBucket,
    _resets_in,
    effective_limits,
)

_bucket = TokenBucket()


async def check_rate_limits(
    request: Request,
    key_record: ApiKey,
    session: AsyncSession,
) -> Response | None:
    del request  # part of the documented signature; not needed here
    limits = effective_limits(key_record)
    for window in WINDOWS:
        allowed, _ = await _bucket.check_and_increment(
            session, key_record.id, window, limits[window]
        )
        if not allowed:
            retry_after = _resets_in(window)
            return JSONResponse(
                status_code=429,
                content={
                    "error": "rate_limit_exceeded",
                    "window": window,
                    "limit": limits[window],
                    "retry_after": retry_after,
                },
                headers={"Retry-After": str(retry_after)},
            )
    return None
