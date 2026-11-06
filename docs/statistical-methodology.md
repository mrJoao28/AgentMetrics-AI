# Statistical methodology

## Purpose
Compare two agent variants on **identical evaluation prompts**. Never compare
unpaired datasets as if they were paired.

## Metric definition
Each observation is a numerical score. A common starting point is exact-match
accuracy encoded as 0 or 1, but exact match is not semantic correctness.
Higher scores must mean better results.

## Estimator
For each prompt, compute candidate score minus baseline score. Report the
arithmetic mean of those paired differences.

## Uncertainty
Resample the paired differences with replacement and calculate a percentile
bootstrap confidence interval (default 95%, 2,000 iterations, fixed seed).
This interval estimates sampling uncertainty under the observed dataset.
It is not a hypothesis-test p-value and does not correct dataset bias.

## Limitations
- Small or unrepresentative datasets can produce misleading confidence intervals.
- Prompts should be sampled independently for the usual interpretation.
- Repeated prompts or user clusters require cluster-aware resampling.
- Predefine metrics and avoid choosing only favorable results.
- Record model versions, prompt templates, sampling conditions and seeds.
- Never present synthetic demo results as real model performance.
