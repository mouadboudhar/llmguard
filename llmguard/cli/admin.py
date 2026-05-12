import asyncio

import typer
from rich.console import Console
from rich.table import Table

from llmguard.auth.keys import generate_api_key, hash_key
from llmguard.auth.repository import SQLiteKeyRepository
from llmguard.db import AsyncSessionLocal, init_db

app = typer.Typer(help="LLMGuard administration CLI.")
keys_app = typer.Typer(help="Manage LLMGuard API keys.")
app.add_typer(keys_app, name="keys")

console = Console()


def _fmt(value) -> str:
    return value.isoformat(sep=" ", timespec="seconds") if value else "-"


async def _create_key(name: str) -> str:
    await init_db()
    plaintext = generate_api_key()
    async with AsyncSessionLocal() as session:
        repo = SQLiteKeyRepository(session)
        await repo.create(name=name, key_hash=hash_key(plaintext))
        await session.commit()
    return plaintext


async def _list_keys():
    await init_db()
    async with AsyncSessionLocal() as session:
        repo = SQLiteKeyRepository(session)
        return await repo.list_all()


async def _revoke_key(key_id: int) -> bool:
    await init_db()
    async with AsyncSessionLocal() as session:
        repo = SQLiteKeyRepository(session)
        ok = await repo.revoke(key_id)
        if ok:
            await session.commit()
        return ok


@keys_app.command("create")
def keys_create(
    name: str = typer.Option(..., "--name", help="Human-readable name for the key."),
) -> None:
    plaintext = asyncio.run(_create_key(name))
    console.print(
        f"[bold green]API Key created successfully.[/bold green]\n"
        f"Name: {name}\n"
        f"Key:  [bold]{plaintext}[/bold]\n\n"
        f"[yellow]SAVE THIS KEY — it will never be shown again.[/yellow]"
    )


@keys_app.command("list")
def keys_list() -> None:
    rows = asyncio.run(_list_keys())
    table = Table(title="LLMGuard API Keys")
    table.add_column("ID", justify="right")
    table.add_column("Name")
    table.add_column("Created")
    table.add_column("Last Used")
    table.add_column("Status")
    for k in rows:
        status = "[green]Active[/green]" if k.is_active else "[red]Revoked[/red]"
        table.add_row(str(k.id), k.name, _fmt(k.created_at), _fmt(k.last_used_at), status)
    console.print(table)


@keys_app.command("revoke")
def keys_revoke(
    key_id: int = typer.Argument(..., help="ID of the key to revoke."),
) -> None:
    if not typer.confirm(f"Revoke key ID {key_id}?"):
        console.print("[yellow]Aborted.[/yellow]")
        raise typer.Exit(code=1)
    if asyncio.run(_revoke_key(key_id)):
        console.print(f"[green]Key ID {key_id} revoked.[/green]")
    else:
        console.print(f"[red]Key ID {key_id} not found or already revoked.[/red]")
        raise typer.Exit(code=1)
