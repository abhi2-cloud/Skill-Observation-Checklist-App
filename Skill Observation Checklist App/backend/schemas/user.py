from pydantic import BaseModel
from pydantic import EmailStr


class CreateUserRequest(BaseModel):

    name: str

    email: EmailStr

    password: str

    role: str