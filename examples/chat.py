#!/usr/bin/env python3
"""Minimal REPL chat client for manually exercising the LLMGuard proxy.

Usage:
    python examples/chat.py <llmguard_key> <provider_api_key>

Env overrides:
    LLMGUARD_URL    base URL of the proxy (default: http://localhost:8000)
    LLMGUARD_MODEL  model name sent in the request (default: gpt-4o-mini)

Commands inside the REPL:
    /reset    clear conversation history
    /history  print conversation so far
    /quit     exit (Ctrl-D / Ctrl-C also work)
"""
from __future__ import annotations

import os
import sys

import httpx


def _usage_and_exit() -> None:
    print(__doc__)
    sys.exit(2)


def main() -> int:
    if len(sys.argv) != 3:
        _usage_and_exit()

    llmguard_key = sys.argv[1]
    provider_key = sys.argv[2]
    base_url = os.environ.get("LLMGUARD_URL", "http://localhost:8000").rstrip("/")
    model = os.environ.get("LLMGUARD_MODEL", "gpt-4o-mini")
    url = f"{base_url}/v1/chat/completions"

    headers = {
        "X-LLMGuard-Key": llmguard_key,
        "Authorization": f"Bearer {provider_key}",
        "Content-Type": "application/json",
    }

    history: list[dict[str, str]] = []
    print(f"LLMGuard chat → {url}  model={model}")
    print("Type /quit to exit, /reset to clear history, /history to print it.\n")

    with httpx.Client(timeout=60.0) as client:
        while True:
            try:
                user_input = input("you> ").strip()
            except (EOFError, KeyboardInterrupt):
                print()
                return 0

            if not user_input:
                continue
            if user_input in {"/quit", "/exit"}:
                return 0
            if user_input == "/reset":
                history.clear()
                print("(history cleared)\n")
                continue
            if user_input == "/history":
                for m in history:
                    print(f"  {m['role']}: {m['content']}")
                print()
                continue

            history.append({"role": "user", "content": user_input})
            payload = {"model": model, "messages": history}

            try:
                response = client.post(url, json=payload, headers=headers)
            except httpx.HTTPError as exc:
                history.pop()
                print(f"[network error] {exc}\n")
                continue

            if response.status_code == 403:
                history.pop()
                try:
                    body = response.json()
                except ValueError:
                    print(f"[403] {response.text}\n")
                    continue
                if body.get("error") == "blocked_by_guard":
                    print(
                        f"[BLOCKED by {body.get('guard')}] "
                        f"{body.get('reason_code')} ({body.get('severity')}): "
                        f"{body.get('detail')}\n"
                    )
                else:
                    print(f"[403] {body}\n")
                continue

            if response.status_code >= 400:
                history.pop()
                print(f"[{response.status_code}] {response.text}\n")
                continue

            try:
                data = response.json()
                reply = data["choices"][0]["message"]["content"]
            except (ValueError, KeyError, IndexError) as exc:
                history.pop()
                print(f"[bad response shape: {exc}] {response.text}\n")
                continue

            history.append({"role": "assistant", "content": reply})
            print(f"bot> {reply}\n")


if __name__ == "__main__":
    raise SystemExit(main())
