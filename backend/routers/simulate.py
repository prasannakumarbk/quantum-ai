"""
POST /simulate
Execute a circuit in ideal and/or noisy simulation and return counts + histogram
"""
from fastapi import APIRouter
from pydantic import BaseModel

from services.circuit_service import (
    execute_circuit_code,
    run_ideal_simulation,
    run_noisy_simulation,
    counts_to_histogram_b64,
    compute_fidelity,
)

router = APIRouter()


class SimulateRequest(BaseModel):
    code: str
    shots: int = 1024
    noisy: bool = True


class SimulateResponse(BaseModel):
    ideal_counts: dict
    noisy_counts: dict | None = None
    fidelity: float | None = None
    histogram_image: str   # base64 PNG
    error: str | None = None


@router.post("", response_model=SimulateResponse)
async def simulate(req: SimulateRequest):
    qc, error = execute_circuit_code(req.code)
    if error:
        return SimulateResponse(
            ideal_counts={},
            histogram_image="",
            error=f"Circuit error: {error}",
        )

    ideal_counts = run_ideal_simulation(qc, shots=req.shots)
    noisy_counts = None
    fidelity = None

    if req.noisy:
        noisy_counts = run_noisy_simulation(qc, shots=req.shots)
        fidelity = compute_fidelity(ideal_counts, noisy_counts, shots=req.shots)

    histogram = counts_to_histogram_b64(
        ideal_counts,
        noisy_counts,
        title="Measurement Results",
    )

    return SimulateResponse(
        ideal_counts=ideal_counts,
        noisy_counts=noisy_counts,
        fidelity=round(fidelity, 4) if fidelity is not None else None,
        histogram_image=histogram,
    )
