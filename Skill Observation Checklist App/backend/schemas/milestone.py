from pydantic import BaseModel


class MilestoneCreate(BaseModel):

    age_group: str

    title: str

    description: str

    expected_score: int


class MilestoneUpdate(BaseModel):

    age_group: str

    title: str

    description: str

    expected_score: int