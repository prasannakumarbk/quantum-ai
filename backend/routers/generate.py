"""
POST /generate-circuit
Natural language → Qiskit circuit code + visualization
"""
from fastapi import APIRouter
from pydantic import BaseModel

from services.llm_service import generate_circuit_code
from services.circuit_service import (
    execute_circuit_code,
    circuit_to_image_b64,
    circuit_to_ascii,
    get_circuit_metrics,
)

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str
    shots: int = 1024


class GenerateResponse(BaseModel):
    code: str
    circuit_image: str       # base64 PNG
    circuit_ascii: str
    metrics: dict
    error: str | None = None


@router.post("", response_model=GenerateResponse)
async def generate_circuit(req: GenerateRequest):
    # Step 1: LLM → code
    code = await generate_circuit_code(req.prompt)

    # Step 2: Execute code safely
    qc, error = execute_circuit_code(code)
    if error:
        return GenerateResponse(
            code=code,
            circuit_image="",
            circuit_ascii="",
            metrics={},
            error=f"Circuit execution error: {error}",
        )

    # Step 3: Render and return
    image_b64 = circuit_to_image_b64(qc)
    ascii_repr = circuit_to_ascii(qc)
    metrics = get_circuit_metrics(qc)

    return GenerateResponse(
        code=code,
        circuit_image=image_b64,
        circuit_ascii=ascii_repr,
        metrics=metrics,
    )
