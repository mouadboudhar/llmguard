import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from llmguard import db
from llmguard.auth.keys import generate_api_key, hash_key
from llmguard.auth.models import Base
from llmguard.auth.repository import SQLiteKeyRepository
from llmguard.proxy.main import app


@pytest_asyncio.fixture
async def session_factory(monkeypatch):
    """In-memory SQLite engine, with llmguard.db patched so the middleware uses it."""
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    monkeypatch.setattr(db, "engine", engine)
    monkeypatch.setattr(db, "AsyncSessionLocal", factory)
    yield factory
    await engine.dispose()


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c


@pytest_asyncio.fixture
async def create_key(session_factory):
    """Returns an async helper: await create_key("name") -> (plaintext, id)."""

    async def _make(name: str = "app") -> tuple[str, int]:
        plaintext = generate_api_key()
        async with session_factory() as session:
            repo = SQLiteKeyRepository(session)
            key = await repo.create(name=name, key_hash=hash_key(plaintext))
            await session.commit()
            return plaintext, key.id

    return _make
