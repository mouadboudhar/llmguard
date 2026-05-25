import os
from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from llmguard.auth.models import Base
from llmguard.config import models as _config_models  # noqa: F401  (register Endpoint on Base.metadata)
from llmguard.ratelimit import bucket as _ratelimit_models  # noqa: F401  (register RateLimitBucket on Base.metadata)


def _database_url() -> str:
    raw = os.getenv("LLMGUARD_DB_PATH", "sqlite+aiosqlite:///llmguard.db")
    if "://" in raw:
        return raw
    # Bare filesystem path from .env -> normalize to an async sqlite URL.
    if os.path.isabs(raw):
        return f"sqlite+aiosqlite:///{raw}"
    return f"sqlite+aiosqlite:///{raw.removeprefix('./')}"


DATABASE_URL = _database_url()

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.execute(text("PRAGMA journal_mode=WAL"))
        await conn.run_sync(Base.metadata.create_all)
        await _migrate_api_keys_rate_limits(conn)


async def _migrate_api_keys_rate_limits(conn) -> None:
    # create_all doesn't ALTER existing tables; backfill rate-limit columns
    # on databases created before Stage 10.
    result = await conn.execute(text("PRAGMA table_info(api_keys)"))
    existing = {row[1] for row in result.fetchall()}
    for col in ("rate_limit_rpm", "rate_limit_rph", "rate_limit_rpd"):
        if col not in existing:
            await conn.execute(text(f"ALTER TABLE api_keys ADD COLUMN {col} INTEGER"))


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
