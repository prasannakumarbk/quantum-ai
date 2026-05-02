"""
POST /analyze
Return detailed circuit analysis metrics
"""
from fastapi import APIRouter
from pydantic import BaseModel

from services.circuit_service import execute_circuit_code, get_circuit_metrics

router = APIRouter()


class AnalyzeRequest(BaseModel):
    code: str


class AnalyzeResponse(BaseModel):
    metrics: dict
    error: str | None = None


@router.post("", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    qc, error = execute_circuit_code(req.code)
    if error:
        return AnalyzeResponse(metrics={}, error=f"Circuit error: {error}")

    metrics = get_circuit_metrics(qc)
    return AnalyzeResponse(metrics=metrics)
