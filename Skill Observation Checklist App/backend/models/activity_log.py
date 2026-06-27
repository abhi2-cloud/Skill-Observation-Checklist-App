import uuid

from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import DateTime

from sqlalchemy.dialects.postgresql import UUID

from datetime import datetime

from core.database import Base


class ActivityLog(Base):

    __tablename__ = "activity_logs"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_email = Column(
        String,
        nullable=False
    )

    action = Column(
        String,
        nullable=False
    )

    module = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )