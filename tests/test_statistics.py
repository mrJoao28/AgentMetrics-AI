import pytest

from agentmetrics.statistics import paired_bootstrap


def test_identical_samples_have_zero_interval():
    result = paired_bootstrap([0, 1, 1], [0, 1, 1], seed=7)
    assert result["mean_difference"] == 0
    assert result["ci_lower"] == 0
    assert result["ci_upper"] == 0


def test_constant_improvement():
    result = paired_bootstrap([0, 0, 0], [1, 1, 1])
    assert result["mean_difference"] == 1
    assert result["ci_lower"] == 1
    assert result["ci_upper"] == 1


def test_seed_reproducibility():
    args = ([0, 1, 0, 1], [1, 0, 1, 1])
    assert paired_bootstrap(*args, seed=10) == paired_bootstrap(*args, seed=10)


@pytest.mark.parametrize("a,b", [([], []), ([1], []), ([1], [1, 2])])
def test_invalid_pairs(a, b):
    with pytest.raises(ValueError):
        paired_bootstrap(a, b)


def test_non_numeric_rejected():
    with pytest.raises(TypeError):
        paired_bootstrap(["bad"], [1])
