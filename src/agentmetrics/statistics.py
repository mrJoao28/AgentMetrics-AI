"""Paired agent comparisons with reproducible bootstrap confidence intervals."""

import math
import random
from collections.abc import Sequence
from statistics import mean


def paired_bootstrap(
    baseline: Sequence[float],
    candidate: Sequence[float],
    *,
    iterations: int = 2000,
    confidence: float = 0.95,
    seed: int = 42,
) -> dict:
    """Bootstrap mean(candidate - baseline) on paired observations.

    Both samples must refer to the SAME prompts in the SAME order.
    Confidence interval is percentile bootstrap; it is not a p-value or
    proof of significance. Higher values are assumed to be better.
    """
    if not baseline or len(baseline) != len(candidate):
        raise ValueError("Paired samples must have equal, nonzero length")
    if iterations < 100:
        raise ValueError("iterations must be at least 100")
    if not 0 < confidence < 1:
        raise ValueError("confidence must be between zero and one")
    for value in (*baseline, *candidate):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError("All observations must be numeric")
        if not math.isfinite(value):
            raise ValueError("All observations must be finite")
    differences = [b - a for a, b in zip(baseline, candidate, strict=True)]
    rng = random.Random(seed)
    n = len(differences)
    draws = sorted(
        mean(differences[rng.randrange(n)] for _ in range(n))
        for _ in range(iterations)
    )
    alpha = (1 - confidence) / 2
    lower = draws[max(0, math.floor(alpha * (iterations - 1)))]
    upper = draws[min(iterations - 1, math.ceil((1 - alpha) * (iterations - 1)))]
    return {
        "sample_size": n,
        "mean_difference": mean(differences),
        "confidence_level": confidence,
        "ci_lower": lower,
        "ci_upper": upper,
        "bootstrap_iterations": iterations,
        "seed": seed,
        "method": "paired_percentile_bootstrap",
    }
