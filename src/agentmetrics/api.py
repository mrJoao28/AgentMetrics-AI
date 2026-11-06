"""FastAPI HTTP interface to the same validated evaluation engine as the CLI."""
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from agentmetrics.evaluation import evaluate

app = FastAPI(title="AgentMetrics API", version="0.1.0")


class EvaluationRecord(BaseModel):
    expected: str
    predicted: str
    latency_ms: float = Field(ge=0, allow_inf_nan=False)
    cost_usd: float = Field(default=0, ge=0, allow_inf_nan=False)


class EvaluationRequest(BaseModel):
    records: list[EvaluationRecord] = Field(min_length=1, max_length=10000)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/evaluate")
def evaluate_payload(payload: EvaluationRequest) -> dict[str, Any]:
    try:
        return evaluate([record.model_dump() for record in payload.records])
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
