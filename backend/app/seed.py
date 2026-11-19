from app.database import Base, engine, SessionLocal
from app.models import User, HealthReading
from app.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()
accounts = [
    ("Aashish Kumar", "patient@medisense.demo", "patient"),
    ("Demo Doctor", "doctor@medisense.demo", "doctor"),
    ("Demo Admin", "admin@medisense.demo", "admin"),
]
try:
    for name, email, role in accounts:
        user = db.query(User).filter_by(email=email).first()
        if not user:
            user = User(name=name, email=email, role=role, password_hash=hash_password("MediSense@123"))
            db.add(user)
            db.flush()
        if role == "patient" and not db.query(HealthReading).filter_by(patient_id=user.id).first():
            db.add(HealthReading(patient_id=user.id, heart_rate=82, systolic_bp=122, diastolic_bp=78,
                                 spo2=97, respiratory_rate=17, temperature=36.8, glucose=108))
    db.commit()
    print("Seed complete. Demo password: MediSense@123")
finally:
    db.close()
