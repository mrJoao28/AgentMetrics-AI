# Live evaluation integration

The Next.js dashboard calls POST /api/evaluate on the same origin. The Next.js route proxies to the Python FastAPI backend, which invokes the existing agentmetrics.evaluation.evaluate engine.

Run Python API locally:

```bash
pip install -e ".[dev]"
uvicorn agentmetrics.api:app --reload --port 8000
```

In apps/web/.env.local set AGENTMETRICS_API_URL=http://127.0.0.1:8000 and run npm run dev from apps/web.

On Vercel, set AGENTMETRICS_API_URL to the deployed Python service HTTPS origin. Do not set NEXT_PUBLIC_ prefix. Until configured, the dashboard shows a clear service unavailable message when evaluating. No fake evaluation metrics are returned.

POST /v1/evaluate accepts {"records":[{"expected":"a","predicted":"a","latency_ms":120,"cost_usd":0.001}]} and returns count, exact_match_accuracy, mean_latency_ms, total_cost_usd. The metrics are exact string match (trim/casefold), not semantic evaluation. The example data are synthetic.

The current interface limits uploads to 2 MB and 10,000 JSONL records. Backend also validates records and bounds. Future work: persist runs, agent identifiers, datasets, and paired comparison statistics.
