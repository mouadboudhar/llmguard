from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class GuardResult:
    allowed: bool
    reason: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)


class Guard(ABC):
    @abstractmethod
    async def check(self, payload: dict[str, Any]) -> GuardResult:
        """Evaluate payload and return a GuardResult."""
