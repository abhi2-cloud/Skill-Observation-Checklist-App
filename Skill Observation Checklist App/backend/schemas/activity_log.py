from pydantic import BaseModel


class ActivityLogCreate(BaseModel):

    user_email: str

    action: str

    module: str