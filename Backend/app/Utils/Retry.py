# app/Utils/Retry.py
# retry_with_backoff() — one backoff implementation (sharedinfrastructure.md §3).
import time
from typing import Callable, Literal

from app.Utils.Results import OperationResult

Classification = Literal["permanent", "transient"]


def retry_with_backoff(
    fn: Callable[[], OperationResult],
    classify: Callable[[Exception], Classification],
    max_attempts: int = 4,
    base_delay_seconds: float = 2.0,
) -> OperationResult:
    last_result: OperationResult = OperationResult(success=False, error_code="no_attempts")
    for attempt in range(1, max_attempts + 1):
        try:
            result = fn()
            result.attempts = attempt
        except Exception as e:
            classification = classify(e)
            result = OperationResult(
                success=False, error_code=classification, error_message=str(e), attempts=attempt,
            )
            if classification == "permanent":
                return result

        last_result = result
        if result.success or attempt == max_attempts:
            return result
        time.sleep(base_delay_seconds * attempt)

    return last_result
