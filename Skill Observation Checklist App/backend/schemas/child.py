from pydantic import BaseModel
from typing import Optional


class ChildCreate(BaseModel):

    name: str
    age: int

    gender: Optional[str] = None

    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_phone: Optional[str] = None

    classroom: str

    admission_date: Optional[str] = None

    allergies: Optional[str] = None
    medical_notes: Optional[str] = None


class ChildUpdate(BaseModel):

    name: Optional[str] = None
    age: Optional[int] = None

    gender: Optional[str] = None

    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_phone: Optional[str] = None

    classroom: Optional[str] = None

    admission_date: Optional[str] = None

    allergies: Optional[str] = None
    medical_notes: Optional[str] = None