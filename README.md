# MediSense AI

**Adaptive Multimodal Health Deterioration Prediction Platform for Continuous Personalized Patient Risk Assessment**

A runnable academic prototype containing:
- React + Vite + Tailwind-style custom CSS frontend (dark navy/teal)
- FastAPI backend
- SQLAlchemy database (SQLite by default; PostgreSQL configurable)
- JWT authentication and role-aware demo portals
- Health measurements and historical records
- An ML training pipeline using clearly synthetic demonstration data
- Risk assessment API, explanation factors, and alert history

> **Clinical safety:** This is an educational prototype, not a medical device. The included synthetic model is not clinically validated and must never be used for diagnosis, triage, treatment, or real patient care. Risk scores are demonstration outputs only. Use synthetic data only.

## Requirements

- macOS
- Python 3.10+
- Node.js 20+
- npm

## Quick start

### 1. Backend

Open Terminal:

```bash
cd MediSense-AI/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.seed
uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000  
Swagger API docs: http://127.0.0.1:8000/docs

Demo accounts (password: `MediSense@123`):
- Patient: `patient@medisense.demo`
- Doctor: `doctor@medisense.demo`
- Admin: `admin@medisense.demo`

### 2. Frontend

In a second Terminal window:

```bash
cd MediSense-AI/frontend
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## Optional: PostgreSQL

SQLite is selected by default so the project runs immediately on a Mac without a database server. To use PostgreSQL, update `DATABASE_URL` in `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/medisense
```

Create the database first. Then restart the backend.

## Train the demonstration model

The seed command creates a small synthetic dataset and trains a demonstration Random Forest model:

```bash
cd backend
source .venv/bin/activate
python -m app.ml.train
```

Model files are written to `backend/app/ml/artifacts/`.

The synthetic model exists only to demonstrate the end-to-end software pipeline. It is not evidence of clinical accuracy.

## Project structure

```text
MediSense-AI/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── security.py
│   │   ├── seed.py
│   │   ├── routes/
│   │   └── ml/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── index.html
│   └── package.json
└── documentation/
    └── PHASE_1_REQUIREMENTS.md
```

## Important implementation notes

- The API validates input ranges and associates measurements with authenticated users.
- Demo doctor/admin access is included for local demonstration only.
- Before any real deployment, implement production-grade authorization, secrets management, audit controls, HTTPS, backup/retention policies, security testing, and clinical governance.
- The included model predicts a synthetic binary label from synthetic features. Replace it only after selecting a properly licensed dataset, defining a documented outcome and prediction horizon, preventing patient/time leakage, and evaluating on an appropriate held-out cohort.
