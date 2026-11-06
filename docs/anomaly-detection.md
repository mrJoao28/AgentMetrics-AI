# Latency anomaly detection

This module applies Tukey's IQR rule to response latencies.
It calculates the first and third quartiles using the median-of-halves
convention, then flags values outside 1.5 × IQR fences by default.

Outlier flags are exploratory signals, not model diagnoses.
A slow response may be valid; investigate infrastructure, prompt length,
traffic, model version and other confounding factors before acting.

For large datasets or multivariate detection, a future release may compare
Isolation Forest against this transparent baseline using labeled data.
