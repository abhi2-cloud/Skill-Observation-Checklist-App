import uuid

from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from sqlalchemy.dialects.postgresql import UUID

from datetime import datetime

from core.database import Base


class Observation(Base):

    __tablename__ = "observations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    child_id = Column(
        UUID(as_uuid=True),
        ForeignKey("children.id"),
        nullable=False
    )

    teacher_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    skill = Column(
        String,
        nullable=False
    )

    rating = Column(
        Integer,
        nullable=False
    )

    notes = Column(
        String
    )

    observation_date = Column(
        DateTime,
        default=datetime.utcnow
    )