from abc import ABC, abstractmethod
from typing import Any


class LLMAdapter(ABC):
    @abstractmethod
    async def forward(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Forward a normalized request to the upstream LLM and return its response."""
