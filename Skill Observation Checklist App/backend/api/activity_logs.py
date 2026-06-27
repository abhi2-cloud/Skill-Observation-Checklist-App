from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from core.database import get_db

from models.activity_log import ActivityLog

from schemas.activity_log import (
    ActivityLogCreate
)

router = APIRouter(
    prefix="/api/activity-logs",
    tags=["Activity Logs"]
)


@router.post("/")
def create_activity_log(
    payload: ActivityLogCreate,
    db: Session = Depends(get_db)
):

    activity = ActivityLog(
        user_email=payload.user_email,
        action=payload.action,
        module=payload.module
    )

    db.add(activity)

    db.commit()

    db.refresh(activity)

    return activity


@router.get("/")
def get_activity_logs(
    db: Session = Depends(get_db)
):

    return db.query(
        ActivityLog
    ).order_by(
        ActivityLog.created_at.desc()
    ).all()