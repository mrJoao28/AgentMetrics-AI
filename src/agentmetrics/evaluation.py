"""Transparent, dependency-free evaluation metrics for agent outputs."""

from collections.abc import Iterable, Mapping
from statistics import mean


def evaluate(records: Iterable[Mapping]) -> dict:
    """Evaluate labeled outputs.

    Each record requires expected and predicted strings, latency_ms >= 0,
    and optionally cost_usd >= 0. Accuracy is exact match after stripping
    surrounding whitespace and casefolding; it is NOT semantic correctness.
    """
    items = list(records)
    if not items:
        raise ValueError("At least one record is required")
    for index, item in enumerate(items):
        for field in ("expected", "predicted", "latency_ms"):
            if field not in item:
                raise ValueError(f"Record {index} missing {field}")
        if not isinstance(item["expected"], str) or not isinstance(item["predicted"], str):
            raise TypeError(f"Record {index}: expected and predicted must be strings")
        latency = item["latency_ms"]
        cost = item.get("cost_usd", 0)
        if isinstance(latency, bool) or not isinstance(latency, (int, float)) or not 0 <= latency < float("inf"):
            raise ValueError(f"Record {index}: invalid latency_ms")
        if isinstance(cost, bool) or not isinstance(cost, (int, float)) or not 0 <= cost < float("inf"):
            raise ValueError(f"Record {index}: invalid cost_usd")
    correct = sum(
        item["expected"].strip().casefold() == item["predicted"].strip().casefold()
        for item in items
    )
    return {
        "count": len(items),
        "exact_match_accuracy": correct / len(items),
        "mean_latency_ms": mean(item["latency_ms"] for item in items),
        "total_cost_usd": sum(item.get("cost_usd", 0) for item in items),
    }


def evaluate_records(records: Iterable[Mapping]) -> dict:
    """Backwards-friendly explicit alias for evaluate."""
    return evaluate(records)
