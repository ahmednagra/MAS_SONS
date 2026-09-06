# app/Utils/Results.py
# OperationResult — the 'never raise' shape for background-callable Services (sharedinfrastructure.md §2).
from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class OperationResult:
    success: bool
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    attempts: int = 1
    extra: dict[str, Any] = field(default_factory=dict)
