
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User,
    HealthReading,
    RiskAssessment,
    Notification
)
from app.schemas import (
    ReadingIn,
    ReadingOut,
    AssessmentOut,
    NotificationOut
)
from app.security import get_current_user, require_roles
from app.ml.predict import predict_demo


router = APIRouter(prefix="/api", tags=["Health"])


# CREATE HEALTH READING
@router.post("/readings", response_model=ReadingOut)
def create_reading(
    data: ReadingIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("patient"))
):
    reading = HealthReading(
        patient_id=user.id,
        **data.model_dump()
    )

    db.add(reading)
    db.commit()
    db.refresh(reading)

    return reading


# GET HEALTH READINGS
@router.get("/readings", response_model=list[ReadingOut])
def list_readings(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role == "patient":
        return (
            db.query(HealthReading)
            .filter_by(patient_id=user.id)
            .order_by(HealthReading.recorded_at.desc())
            .limit(50)
            .all()
        )

    if user.role == "doctor":
        patient_ids = [
            u.id
            for u in db.query(User).filter_by(role="patient").all()
        ]

        return (
            db.query(HealthReading)
            .filter(HealthReading.patient_id.in_(patient_ids))
            .order_by(HealthReading.recorded_at.desc())
            .limit(100)
            .all()
        )

    return (
        db.query(HealthReading)
        .order_by(HealthReading.recorded_at.desc())
        .limit(100)
        .all()
    )


# CREATE RISK PREDICTION + NOTIFICATION
@router.post("/predictions", response_model=AssessmentOut)
def create_prediction(
    data: ReadingIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("patient"))
):
    score, level, explanation, version = predict_demo(
        data.model_dump()
    )

    assessment = RiskAssessment(
        patient_id=user.id,
        risk_score=score,
        risk_level=level,
        model_version=version,
        explanation=json.dumps(explanation)
    )

    db.add(assessment)

    # Generate assessment ID before creating its notification
    db.flush()

    notification = Notification(
        user_id=user.id,
        title="Risk Assessment Completed",
        message=(
            f"Your demo risk assessment is complete. "
            f"Risk level: {level}. Score: {score:.1f}."
        ),
        is_read=False
    )

    db.add(notification)
    db.commit()
    db.refresh(assessment)

    return {
        "id": assessment.id,
        "risk_score": assessment.risk_score,
        "risk_level": assessment.risk_level,
        "model_version": assessment.model_version,
        "explanation": explanation,
        "created_at": assessment.created_at
    }


# GET PREDICTION HISTORY
@router.get(
    "/predictions/history",
    response_model=list[AssessmentOut]
)
def prediction_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(RiskAssessment)

    if user.role == "patient":
        query = query.filter_by(patient_id=user.id)

    rows = (
        query
        .order_by(RiskAssessment.created_at.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "id": row.id,
            "risk_score": row.risk_score,
            "risk_level": row.risk_level,
            "model_version": row.model_version,
            "explanation": json.loads(row.explanation),
            "created_at": row.created_at
        }
        for row in rows
    ]


# DASHBOARD
@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role == "patient":
        readings = (
            db.query(HealthReading)
            .filter_by(patient_id=user.id)
            .order_by(HealthReading.recorded_at.desc())
            .limit(1)
            .all()
        )

        assessments = (
            db.query(RiskAssessment)
            .filter_by(patient_id=user.id)
            .order_by(RiskAssessment.created_at.desc())
            .limit(1)
            .all()
        )

        unread_count = (
            db.query(Notification)
            .filter(
                Notification.user_id == user.id,
                Notification.is_read.is_(False)
            )
            .count()
        )

        return {
            "user": {
                "name": user.name,
                "role": user.role
            },
            "latest_reading": readings[0] if readings else None,
            "latest_assessment": assessments[0] if assessments else None,
            "reading_count": (
                db.query(HealthReading)
                .filter_by(patient_id=user.id)
                .count()
            ),
            "unread_notification_count": unread_count
        }

    patients = db.query(User).filter_by(role="patient").count()
    readings_count = db.query(HealthReading).count()
    assessments_count = db.query(RiskAssessment).count()

    return {
        "user": {
            "name": user.name,
            "role": user.role
        },
        "patient_count": patients,
        "reading_count": readings_count,
        "assessment_count": assessments_count
    }


# GET USER NOTIFICATIONS
@router.get(
    "/notifications",
    response_model=list[NotificationOut]
)
def list_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


# MARK ONE NOTIFICATION AS READ
@router.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user.id
        )
        .first()
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True
    db.commit()

    return {
        "message": "Notification marked as read",
        "id": notification.id,
        "is_read": notification.is_read
    }


# MARK ALL NOTIFICATIONS AS READ
@router.post("/notifications/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    updated_count = (
        db.query(Notification)
        .filter(
            Notification.user_id == user.id,
            Notification.is_read.is_(False)
        )
        .update(
            {Notification.is_read: True},
            synchronize_session=False
        )
    )

    db.commit()

    return {
        "message": "All notifications marked as read",
        "updated_count": updated_count,
        "unread_count": 0
    }
