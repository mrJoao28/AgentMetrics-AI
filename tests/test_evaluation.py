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
        "record_matches": [True, False],
    }


def test_record_matches_use_python_unicode_casefold():
    records = [
        {"expected": "straße", "predicted": "STRASSE", "latency_ms": 10},
        {"expected": "ΟΣ", "predicted": "ος", "latency_ms": 20},
        {"expected": "alpha", "predicted": "beta", "latency_ms": 30},
    ]

    result = evaluate(records)

    assert result["record_matches"] == [True, True, False]
    assert result["exact_match_accuracy"] == pytest.approx(2 / 3)


@pytest.mark.parametrize("records", [
    [],
    [{"expected": "a", "predicted": "a", "latency_ms": -1}],
    [{"expected": "a", "predicted": "a", "latency_ms": float("nan")}],
    [{"expected": "a", "predicted": "a", "latency_ms": 1, "cost_usd": -1}],
])
def test_invalid_records(records):
    with pytest.raises(ValueError):
        evaluate(records)
