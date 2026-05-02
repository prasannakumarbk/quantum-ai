"""
POST /optimize
Transpile circuit at optimization_level=3 and return before/after comparison
"""
from fastapi import APIRouter
from pydantic import BaseModel

from services.circuit_service import (
    execute_circuit_code,
    optimize_circuit,
    circuit_to_image_b64,
    circuit_to_ascii,
)

router = APIRouter()


class OptimizeRequest(BaseModel):
    code: str


class OptimizeResponse(BaseModel):
    comparison: dict
    optimized_code: str
    optimized_image: str   # base64 PNG
    optimized_ascii: str
    error: str | None = None


@router.post("", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest):
    qc, error = execute_circuit_code(req.code)
    if error:
        return OptimizeResponse(
            comparison={},
            optimized_code="",
            optimized_image="",
            optimized_ascii="",
            error=f"Circuit error: {error}",
        )

    optimized_qc, comparison = optimize_circuit(qc)

    # Convert optimized circuit back to a code-like string (QASM)
    try:
        optimized_code = optimized_qc.qasm() if hasattr(optimized_qc, "qasm") else str(optimized_qc.draw("text"))
    except Exception:
        optimized_code = str(optimized_qc.draw("text"))

    optimized_image = circuit_to_image_b64(optimized_qc)
    optimized_ascii = circuit_to_ascii(optimized_qc)

    return OptimizeResponse(
        comparison=comparison,
        optimized_code=optimized_code,
        optimized_image=optimized_image,
        optimized_ascii=optimized_ascii,
    )
