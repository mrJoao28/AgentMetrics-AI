import pytest

from agentmetrics.anomalies import detect_latency_outliers


def test_outlier_identified():
    result = detect_latency_outliers([10, 11, 10, 12, 11, 1000])
    assert result["outlier_indices"] == [5]
    assert result["outlier_count"] == 1


def test_constant_values():
    result = detect_latency_outliers([10, 10, 10, 10])
    assert result["outlier_indices"] == []


def test_invalid_values():
    with pytest.raises(ValueError):
        detect_latency_outliers([1, 2, 3])
    with pytest.raises(ValueError):
        detect_latency_outliers([1, 2, 3, -1])
    with pytest.raises(TypeError):
        detect_latency_outliers([1, 2, 3, "x"])
