# Dashboard

Install and run locally:

```bash
python -m pip install -e ".[dashboard]"
streamlit run app.py
```

The dashboard opens with synthetic demo data, or accepts a JSONL file containing
`expected`, `predicted`, `latency_ms` and optional `cost_usd`.

For paired statistical comparisons, upload a CSV with numeric `baseline` and
`candidate` columns. Rows must refer to the same prompts in the same order.

## Responsible interpretation
- Exact match is case-insensitive and ignores surrounding whitespace.
- It does not measure semantic equivalence, hallucinations, or safety.
- Cost is supplied by the dataset, not independently verified.
- Demo data is synthetic; do not present it as a production benchmark.
- Uploaded data stays in the local Streamlit process; do not upload secrets.
