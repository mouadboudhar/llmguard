# LLMGuard

Self-hosted security gateway for LLM applications.

LLMGuard sits between your AI application and any LLM 
provider. It applies three deterministic security guards 
to every request, gives you full visibility through a 
dashboard, and runs entirely inside your own infrastructure.

## Quick Start

docker compose up

## Guards

- **Input Guard** — blocks prompt injection before forwarding
- **Output Guard** — redacts PII and secrets from responses  
- **Retrieval AuthZ** — enforces clearance-based RAG filtering

## Integration

One URL change in your application:

base_url = "http://your-llmguard/v1"

## Status

v0.1.0 — foundation in progress
