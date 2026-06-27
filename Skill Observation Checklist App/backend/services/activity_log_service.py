from sqlalchemy.orm import Session

from models.activity_log import ActivityLog


def log_activity(
    db: Session,
    user_email: str,
    action: str,
    module: str
):

    activity = ActivityLog(
        user_email=user_email,
        action=action,
        module=module
    )

    db.add(activity)

    db.commit()

    db.refresh(activity)

    return activity