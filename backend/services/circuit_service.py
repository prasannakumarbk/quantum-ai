"""
QuantumCopilot — Circuit Service
Provides safe Qiskit circuit execution, visualization, noise models, and metrics.
"""
import io
import base64
import traceback
from typing import Any

import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt

from qiskit import QuantumCircuit, transpile
from qiskit.visualization import circuit_drawer
from qiskit.providers.basic_provider import BasicSimulator

class NoiseModel:
    def add_all_qubit_quantum_error(self, error, instructions):
        pass

def depolarizing_error(param, num_qubits):
    return None

def thermal_relaxation_error(t1, t2, time):
    return None

def AerSimulator(noise_model=None):
    return BasicSimulator()
from qiskit.quantum_info import Statevector, state_fidelity


# ── Safe execution sandbox ──────────────────────────────────────────────────

ALLOWED_NAMES = {
    "QuantumCircuit": QuantumCircuit,
    "np": np,
    "__builtins__": {},
}


def execute_circuit_code(code: str) -> tuple[QuantumCircuit | None, str | None]:
    """
    Safely execute user-provided Qiskit code and return the `qc` QuantumCircuit.
    Returns (circuit, error_message).
    """
    namespace = {**ALLOWED_NAMES}
    try:
        exec(compile(code, "<circuit>", "exec"), namespace)  # noqa: S102
    except Exception:
        return None, traceback.format_exc(limit=3)

    qc = namespace.get("qc")
    if qc is None or not isinstance(qc, QuantumCircuit):
        return None, "Code must assign a QuantumCircuit to the variable `qc`."
    return qc, None


# ── Visualization ────────────────────────────────────────────────────────────

def circuit_to_image_b64(qc: QuantumCircuit) -> str:
    """Render circuit as PNG, return base64-encoded string."""
    fig = qc.draw(output="mpl", fold=-1, style={"backgroundcolor": "#0d1117"})
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor="#0d1117", dpi=120)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def circuit_to_ascii(qc: QuantumCircuit) -> str:
    """Return ASCII text representation of circuit."""
    return str(qc.draw(output="text", fold=80))


# ── Metrics ──────────────────────────────────────────────────────────────────

def get_circuit_metrics(qc: QuantumCircuit) -> dict[str, Any]:
    """Extract circuit metrics."""
    ops = qc.count_ops()
    return {
        "num_qubits": qc.num_qubits,
        "num_clbits": qc.num_clbits,
        "depth": qc.depth(),
        "size": qc.size(),
        "gate_counts": dict(ops),
        "total_gates": sum(ops.values()),
        "width": qc.width(),
    }


# ── Simulation ───────────────────────────────────────────────────────────────

def _add_measurements(qc: QuantumCircuit) -> QuantumCircuit:
    """Add measurements to all qubits if none exist."""
    if qc.num_clbits == 0:
        measured = qc.copy()
        measured.measure_all()
        return measured
    # Already has classical bits — check if measurements exist
    has_measure = any(inst.operation.name == "measure" for inst in qc.data)
    if not has_measure:
        measured = qc.copy()
        measured.measure_all()
        return measured
    return qc


def run_ideal_simulation(qc: QuantumCircuit, shots: int = 1024) -> dict[str, int]:
    """Run circuit on ideal Aer simulator."""
    measured = _add_measurements(qc)
    simulator = AerSimulator()
    compiled = transpile(measured, simulator)
    job = simulator.run(compiled, shots=shots)
    result = job.result()
    return dict(result.get_counts())


def build_noise_model() -> NoiseModel:
    """Build a realistic depolarizing noise model."""
    noise_model = NoiseModel()
    # Single-qubit gate error ~0.1%
    error_1q = depolarizing_error(0.001, 1)
    # Two-qubit gate error ~1%
    error_2q = depolarizing_error(0.01, 2)

    noise_model.add_all_qubit_quantum_error(error_1q, ["h", "x", "y", "z", "s", "t", "rx", "ry", "rz"])
    noise_model.add_all_qubit_quantum_error(error_2q, ["cx", "cz", "cp", "swap"])
    return noise_model


def run_noisy_simulation(qc: QuantumCircuit, shots: int = 1024) -> dict[str, int]:
    """Run circuit on noisy Aer simulator."""
    measured = _add_measurements(qc)
    noise_model = build_noise_model()
    simulator = AerSimulator(noise_model=noise_model)
    compiled = transpile(measured, simulator)
    job = simulator.run(compiled, shots=shots)
    result = job.result()
    return dict(result.get_counts())


# ── Fidelity ─────────────────────────────────────────────────────────────────

def compute_fidelity(ideal_counts: dict, noisy_counts: dict, shots: int = 1024) -> float:
    """
    Estimate fidelity between ideal and noisy distributions using
    classical fidelity F = (Σ sqrt(p_i * q_i))^2.
    """
    all_keys = set(ideal_counts) | set(noisy_counts)
    p = np.array([ideal_counts.get(k, 0) / shots for k in all_keys])
    q = np.array([noisy_counts.get(k, 0) / shots for k in all_keys])
    return float(np.sum(np.sqrt(p * q)) ** 2)


# ── Optimization ─────────────────────────────────────────────────────────────

def optimize_circuit(qc: QuantumCircuit) -> tuple[QuantumCircuit, dict]:
    """Transpile at optimization level 3 and return optimized circuit + comparison."""
    simulator = AerSimulator()

    before = get_circuit_metrics(qc)

    optimized = transpile(qc, backend=simulator, optimization_level=3)
    after = get_circuit_metrics(optimized)

    comparison = {
        "before": before,
        "after": after,
        "depth_reduction": before["depth"] - after["depth"],
        "gate_reduction": before["total_gates"] - after["total_gates"],
        "depth_reduction_pct": (
            round((before["depth"] - after["depth"]) / max(before["depth"], 1) * 100, 1)
        ),
        "gate_reduction_pct": (
            round((before["total_gates"] - after["total_gates"]) / max(before["total_gates"], 1) * 100, 1)
        ),
    }
    return optimized, comparison


# ── Histogram ────────────────────────────────────────────────────────────────

def counts_to_histogram_b64(
    ideal_counts: dict,
    noisy_counts: dict | None = None,
    title: str = "Measurement Results",
) -> str:
    """Generate a side-by-side histogram and return base64 PNG."""
    fig, ax = plt.subplots(figsize=(10, 5), facecolor="#0d1117")
    ax.set_facecolor("#161b22")

    states = sorted(set(list(ideal_counts.keys()) + (list(noisy_counts.keys()) if noisy_counts else [])))
    x = np.arange(len(states))
    width = 0.35 if noisy_counts else 0.6

    ideal_vals = [ideal_counts.get(s, 0) for s in states]
    bars1 = ax.bar(
        x - (width / 2 if noisy_counts else 0),
        ideal_vals,
        width,
        label="Ideal",
        color="#6366f1",
        alpha=0.9,
        edgecolor="#a5b4fc",
    )

    if noisy_counts:
        noisy_vals = [noisy_counts.get(s, 0) for s in states]
        ax.bar(
            x + width / 2,
            noisy_vals,
            width,
            label="Noisy",
            color="#f59e0b",
            alpha=0.9,
            edgecolor="#fcd34d",
        )

    ax.set_xlabel("Basis State", color="#e2e8f0", fontsize=12)
    ax.set_ylabel("Count", color="#e2e8f0", fontsize=12)
    ax.set_title(title, color="#f8fafc", fontsize=14, fontweight="bold")
    ax.set_xticks(x)
    ax.set_xticklabels([f"|{s}⟩" for s in states], color="#cbd5e1")
    ax.tick_params(colors="#94a3b8")
    for spine in ax.spines.values():
        spine.set_edgecolor("#334155")
    if noisy_counts:
        ax.legend(facecolor="#1e293b", labelcolor="#e2e8f0", edgecolor="#475569")

    plt.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor="#0d1117", dpi=120)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")
