"""
POST /explain
AI-powered explanation of what a quantum circuit does
"""
from fastapi import APIRouter
from pydantic import BaseModel

from services.llm_service import explain_circuit, tutor_chat

router = APIRouter()


class ExplainRequest(BaseModel):
    code: str


class ExplainResponse(BaseModel):
    explanation: str
    error: str | None = None


class TutorRequest(BaseModel):
    messages: list[dict]   # [{role: "user"|"assistant", content: "..."}]


class TutorResponse(BaseModel):
    reply: str
    error: str | None = None


@router.post("", response_model=ExplainResponse)
async def explain(req: ExplainRequest):
    try:
        explanation = await explain_circuit(req.code)
        return ExplainResponse(explanation=explanation)
    except Exception as e:
        return ExplainResponse(explanation="", error=str(e))


@router.post("/tutor", response_model=TutorResponse)
async def tutor(req: TutorRequest):
    try:
        reply = await tutor_chat(req.messages)
        return TutorResponse(reply=reply)
    except Exception as e:
        return TutorResponse(reply="", error=str(e))
