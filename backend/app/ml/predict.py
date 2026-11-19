from pathlib import Path
import joblib
import numpy as np

ARTIFACT = Path(__file__).parent / "artifacts" / "demo_model.joblib"
FEATURES = ["heart_rate", "systolic_bp", "diastolic_bp", "spo2", "respiratory_rate", "temperature", "glucose"]

def predict_demo(values: dict):
    # Explicitly educational synthetic model; never use for clinical decisions.
    if not ARTIFACT.exists():
        from app.ml.train import train_demo_model
        train_demo_model()
    bundle = joblib.load(ARTIFACT)
    row = np.array([[float(values[k]) for k in FEATURES]])
    probability = float(bundle["model"].predict_proba(row)[0][1])
    score = round(probability * 100, 1)
    level = "High" if score >= 65 else "Moderate" if score >= 35 else "Low"
    explanations = []
    rules = [
        (values["spo2"] < 94, "SpO₂ is below the demo reference threshold."),
        (values["heart_rate"] > 100, "Heart rate is above the demo reference threshold."),
        (values["respiratory_rate"] > 22, "Respiratory rate is above the demo reference threshold."),
        (values["temperature"] >= 38, "Temperature is elevated in this demo rule set."),
        (values["systolic_bp"] < 95, "Systolic blood pressure is low in this demo rule set."),
    ]
    explanations = [message for condition, message in rules if condition]
    if not explanations:
        explanations = ["No configured demo warning rule was triggered."]
    return score, level, explanations, bundle.get("version", "synthetic-demo-v1")
