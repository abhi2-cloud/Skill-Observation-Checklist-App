import uuid

from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer

from sqlalchemy.dialects.postgresql import UUID

from core.database import Base


class Milestone(Base):

    __tablename__ = "milestones"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    age_group = Column(
        String,
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        String
    )

    expected_score = Column(
        Integer,
        default=3
    )