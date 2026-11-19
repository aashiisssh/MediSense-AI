from pathlib import Path
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from app.ml.predict import FEATURES

ARTIFACT = Path(__file__).parent / "artifacts" / "demo_model.joblib"

def train_demo_model():
    # Synthetic data is generated only to prove software wiring.
    # Labels are generated from artificial rules, not clinical evidence.
    rng = np.random.default_rng(42)
    n = 5000
    X = np.column_stack([
        rng.normal(82, 18, n).clip(35, 180),
        rng.normal(122, 20, n).clip(75, 210),
        rng.normal(78, 13, n).clip(40, 130),
        rng.normal(97, 2.5, n).clip(82, 100),
        rng.normal(17, 5, n).clip(7, 40),
        rng.normal(36.8, 0.8, n).clip(34, 41),
        rng.normal(110, 35, n).clip(55, 300),
    ])
    # Artificial target for demonstration only.
    risk = (
        (X[:, 3] < 93).astype(int) * 2
        + (X[:, 0] > 115).astype(int)
        + (X[:, 4] > 24).astype(int)
        + (X[:, 5] > 38.2).astype(int)
        + (X[:, 1] < 95).astype(int)
        + (X[:, 2] < 55).astype(int)
        + rng.normal(0, 0.8, n)
    )
    y = (risk >= 2.2).astype(int)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    model = RandomForestClassifier(n_estimators=120, max_depth=8, random_state=42, class_weight="balanced")
    model.fit(X_train, y_train)
    print("Synthetic demonstration model report (NOT clinical performance):")
    print(classification_report(y_test, model.predict(X_test), zero_division=0))
    try:
        print("Synthetic ROC-AUC:", round(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]), 3))
    except ValueError:
        pass
    ARTIFACT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "version": "synthetic-demo-v1", "features": FEATURES}, ARTIFACT)
    print(f"Saved demonstration model: {ARTIFACT}")

if __name__ == "__main__":
    train_demo_model()
