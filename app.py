"""AgentMetrics AI interactive analytics dashboard."""

import json

import pandas as pd
import plotly.express as px
import streamlit as st

from agentmetrics.evaluation import evaluate
from agentmetrics.statistics import paired_bootstrap

st.set_page_config(page_title="AgentMetrics AI", page_icon="📊", layout="wide")
st.title("AgentMetrics AI")
st.caption("Reproducible evaluation for conversational AI • No API key required")
st.info("Demo data is synthetic. Exact match is not semantic correctness.")

uploaded = st.file_uploader("Upload evaluation JSONL", type=["jsonl"])
if uploaded is None:
    with open("data/demo.jsonl", encoding="utf-8") as handle:
        records = [json.loads(line) for line in handle if line.strip()]
else:
    try:
        records = [json.loads(line) for line in uploaded.getvalue().decode("utf-8").splitlines() if line.strip()]
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        st.error(f"Invalid JSONL: {error}")
        st.stop()

try:
    metrics = evaluate(records)
except (ValueError, TypeError) as error:
    st.error(f"Invalid evaluation data: {error}")
    st.stop()

a, b, c, d = st.columns(4)
a.metric("Evaluated prompts", metrics["count"])
b.metric("Exact-match accuracy", f'{metrics["exact_match_accuracy"]:.1%}')
c.metric("Mean latency", f'{metrics["mean_latency_ms"]:.1f} ms')
d.metric("Total estimated cost", f'${metrics["total_cost_usd"]:.4f}')

frame = pd.DataFrame(records)
frame["exact_match"] = frame["expected"].str.strip().str.casefold() == frame["predicted"].str.strip().str.casefold()
st.subheader("Latency distribution")
st.plotly_chart(px.histogram(frame, x="latency_ms", nbins=20, title="Response latency (ms)"), use_container_width=True)
st.subheader("Inspect predictions")
st.dataframe(frame, use_container_width=True, hide_index=True)

st.subheader("Paired model comparison")
st.caption("Upload CSV with baseline and candidate numerical scores aligned by prompt.")
comparison = st.file_uploader("Paired scores CSV", type=["csv"])
if comparison is not None:
    try:
        scores = pd.read_csv(comparison)
        if not {"baseline", "candidate"}.issubset(scores.columns):
            raise ValueError("CSV must include baseline and candidate columns")
        result = paired_bootstrap(scores["baseline"].tolist(), scores["candidate"].tolist())
        st.metric("Candidate minus baseline", f'{result["mean_difference"]:.3f}')
        st.write(f'{result["confidence_level"]:.0%} bootstrap interval: [{result["ci_lower"]:.3f}, {result["ci_upper"]:.3f}]')
        st.caption("Percentile bootstrap interval, not a p-value; scores must be paired by prompt.")
    except (ValueError, TypeError, KeyError) as error:
        st.error(f"Comparison error: {error}")
