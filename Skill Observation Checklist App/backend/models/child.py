import uuid

from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import Date

from sqlalchemy.dialects.postgresql import UUID

from core.database import Base


class Child(Base):

    __tablename__ = "children"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name = Column(String, nullable=False)

    age = Column(Integer)

    gender = Column(String)

    parent_name = Column(String)

    parent_email = Column(String)

    parent_phone = Column(String)

    classroom = Column(String)

    admission_date = Column(Date)

    allergies = Column(String)

    medical_notes = Column(String)