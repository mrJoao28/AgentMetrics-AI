import pytest

from agentmetrics import evaluate


def test_evaluation_metrics():
    records = [
        {"expected": "Yes", "predicted": " yes ", "latency_ms": 100, "cost_usd": 0.01},
        {"expected": "No", "predicted": "Maybe", "latency_ms": 300, "cost_usd": 0.02},
    ]
    assert evaluate(records) == {
        "count": 2,
        "exact_match_accuracy": 0.5,
        "mean_latency_ms": 200,
        "total_cost_usd": pytest.approx(0.03),
    }


@pytest.mark.parametrize("records", [
    [],
    [{"expected": "a", "predicted": "a", "latency_ms": -1}],
    [{"expected": "a", "predicted": "a", "latency_ms": float("nan")}],
    [{"expected": "a", "predicted": "a", "latency_ms": 1, "cost_usd": -1}],
])
def test_invalid_records(records):
    with pytest.raises(ValueError):
        evaluate(records)
