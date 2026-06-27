from uuid import UUID

from pydantic import BaseModel


class ObservationCreate(BaseModel):

    child_id: UUID

    teacher_id: UUID

    skill: str

    rating: int

    notes: str


class ObservationUpdate(BaseModel):

    skill: str

    rating: int

    notes: str