# MediSense AI — Phase 1 Requirements Specification

**Official title:** Adaptive Multimodal Health Deterioration Prediction Platform for Continuous Personalized Patient Risk Assessment  
**Section:** 3EN1  
**Team:** Aashish Kumar (Frontend & Integration), Prashant Raj (Backend & Database), Ansh Raj (AI/ML)  
**Version:** 1.0

## 1. Abstract
MediSense AI is an educational healthcare monitoring and predictive analytics prototype. It combines physiological measurements, laboratory information, medical history and historical trends to demonstrate a multimodal machine-learning workflow for estimating a predefined deterioration outcome over a defined horizon. It provides patient, doctor and administrator workspaces, measurement history, risk-assessment records and explanatory indicators.

## 2. Problem statement
Reviewing patient information across multiple modalities and time points can be challenging. The project proposes an integrated application to organize health data and demonstrate predictive analytics using a reproducible ML pipeline.

## 3. Objectives
- Build a secure role-aware web application.
- Store patient profiles and health measurements.
- Integrate multiple data categories where supported by the selected dataset.
- Train and evaluate classification models.
- Compare current measurements with individual historical baselines.
- Display risk estimates, model version and contributing factors.
- Provide an interface for clinical review.

## 4. Scope
Included: authentication, patient profile, health readings, assessment history, demo prediction, dashboard, alerts/history UI and administrative/doctor demo views.

Excluded: diagnosis, treatment, autonomous clinical decisions, real-world clinical deployment and unvalidated device integration.

## 5. Users
- Patient: manage own profile and view own readings/assessments.
- Doctor: review authorized patient records.
- Administrator: manage accounts and platform operations.

## 6. Functional requirements
FR-01 registration and login; FR-02 role-based access; FR-03 patient profile; FR-04 health measurement entry; FR-05 history storage; FR-06 multimodal preprocessing; FR-07 model inference; FR-08 assessment history; FR-09 trend visualization; FR-10 alert review; FR-11 clinician review; FR-12 audit trail.

## 7. Non-functional requirements
Security, privacy, input validation, maintainability, usability, responsive layout, error handling and efficient data retrieval.

## 8. Technology
React, Vite, CSS, FastAPI, SQLAlchemy, SQLite for immediate local setup, PostgreSQL as configurable deployment database, scikit-learn, NumPy, Pandas and joblib.

## 9. Data and ML methodology
Proposed target: a documented deterioration event within 24 hours of an assessment timestamp. Final event definition and available features depend on dataset documentation. Split by patient and respect time to prevent leakage. Compare Logistic Regression, Random Forest and XGBoost. Report recall, precision, specificity, F1, ROC-AUC, PR-AUC and calibration. Synthetic demonstration data is only for software wiring and is not clinical evidence.

## 10. Database entities
Users, Patients, Doctors, Doctor-Patient assignments, Medical History, Health Readings, Lab Results, Risk Assessments, Risk Alerts, Clinical Reviews and Audit Logs.

## 11. Security
Use password hashing, role-based access, least privilege, protected endpoints, secure secrets, audit logging and de-identified or synthetic data. Production requires further security and privacy review.

## 12. Team allocation
- Aashish Kumar: React frontend, navigation, dashboards, API integration and repository coordination.
- Prashant Raj: FastAPI, database schema, authentication, APIs and integration.
- Ansh Raj: dataset research, preprocessing, model training, evaluation and explainability.
- All: testing, documentation, integration and viva.

## 13. Acceptance criteria
Authentication works; roles are enforced; readings can be saved and retrieved; demo prediction can run; assessments are versioned and persisted; dashboards display API data; validation and error handling work; documentation is prepared.

## 14. Risks
Dataset access, missing modalities, label ambiguity, leakage, model performance, integration delays and security risks. Mitigate through early dataset review, documented target definition, patient/time splits, API contracts and synthetic fallback for UI demonstrations.

## 15. Clinical disclaimer
MediSense AI is an academic prototype. Synthetic model scores are not clinical probabilities, diagnoses, triage advice or treatment recommendations. No real patient data should be entered into the demo.
