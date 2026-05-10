# LLMGuard — Project Rules for Claude Code

## Product
LLMGuard is a self-hosted reverse proxy security gateway
for LLM applications. It sits between customer AI apps
and LLM providers, applying deterministic security guards.

## Architecture
- llmguard/proxy/    FastAPI reverse proxy (the product)
- llmguard/guards/   Input, Output, Retrieval AuthZ guards
- llmguard/adapters/ OpenAI, Anthropic, Ollama, Mistral
- llmguard/auth/     API key validation
- llmguard/audit/    Event log + WebSocket broadcast
- dashboard/         React + Vite admin dashboard

## Rules
- Ask before adding any dependency not in pyproject.toml
- Ask before adding any npm package not in package.json
- Never modify test files unless explicitly asked
- Never touch .github/workflows/ without explicit ask
- Show diffs only for modifications, never full rewrites
- Propose approach before implementing for non-trivial tasks
- Conventional commits: feat/fix/security/refactor/docs/ci/chore
