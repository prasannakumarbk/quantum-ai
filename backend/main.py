"""
QuantumCopilot — FastAPI Backend Entry Point
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import generate, simulate, analyze, optimize, explain

load_dotenv()

app = FastAPI(
    title="QuantumCopilot API",
    description="AI-powered quantum computing assistant backend",
    version="1.0.0",
)

# Allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(generate.router, prefix="/generate-circuit", tags=["Circuit Generation"])
app.include_router(simulate.router, prefix="/simulate", tags=["Simulation"])
app.include_router(analyze.router, prefix="/analyze", tags=["Analysis"])
app.include_router(optimize.router, prefix="/optimize", tags=["Optimization"])
app.include_router(explain.router, prefix="/explain", tags=["Explanation"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "QuantumCopilot API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
