"""Robust, explainable latency anomaly detection using the IQR rule."""

import math
from collections.abc import Sequence
from statistics import median


def detect_latency_outliers(values: Sequence[float], multiplier: float = 1.5) -> dict:
    """Flag observations outside Tukey IQR fences.

    Uses a documented median-of-halves quartile convention.
    Outliers are descriptive flags, not evidence of faulty model behavior.
    """
    if len(values) < 4:
        raise ValueError("At least four latency measurements are required")
    if not math.isfinite(multiplier) or multiplier <= 0:
        raise ValueError("multiplier must be positive and finite")
    for value in values:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError("Latencies must be numeric")
        if not math.isfinite(value) or value < 0:
            raise ValueError("Latencies must be finite and nonnegative")
    ordered = sorted(values)
    half = len(ordered) // 2
    lower_half = ordered[:half]
    upper_half = ordered[-half:]
    q1, q3 = median(lower_half), median(upper_half)
    iqr = q3 - q1
    low, high = q1 - multiplier * iqr, q3 + multiplier * iqr
    flags = [i for i, value in enumerate(values) if value < low or value > high]
    return {
        "q1": q1,
        "q3": q3,
        "iqr": iqr,
        "lower_fence": low,
        "upper_fence": high,
        "outlier_indices": flags,
        "outlier_count": len(flags),
        "outlier_rate": len(flags) / len(values),
        "method": "tukey_iqr_median_of_halves",
    }
