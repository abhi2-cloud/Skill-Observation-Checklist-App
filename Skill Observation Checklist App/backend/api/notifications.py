from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from core.database import get_db

from models.notification import Notification

from schemas.notification import (
    NotificationCreate,
    NotificationUpdate
)

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)


@router.post("/")
def create_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db)
):

    notification = Notification(
        title=payload.title,
        message=payload.message,
        notification_type=payload.notification_type
    )

    db.add(notification)

    db.commit()

    db.refresh(notification)

    return notification


@router.get("/")
def get_notifications(
    db: Session = Depends(get_db)
):

    return db.query(
        Notification
    ).order_by(
        Notification.created_at.desc()
    ).all()


@router.get("/{notification_id}")
def get_notification(
    notification_id: str,
    db: Session = Depends(get_db)
):

    notification = db.query(
        Notification
    ).filter(
        Notification.id == notification_id
    ).first()

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification


@router.put("/{notification_id}")
def mark_notification_read(
    notification_id: str,
    payload: NotificationUpdate,
    db: Session = Depends(get_db)
):

    notification = db.query(
        Notification
    ).filter(
        Notification.id == notification_id
    ).first()

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = payload.is_read

    db.commit()

    db.refresh(notification)

    return notification


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db)
):

    notification = db.query(
        Notification
    ).filter(
        Notification.id == notification_id
    ).first()

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    db.delete(notification)

    db.commit()

    return {
        "message": "Notification deleted"
    }