from fastapi import APIRouter
from pydantic import BaseModel

from services.email_service import (
    send_email
)

router = APIRouter(
    prefix="/api/email",
    tags=["Email"]
)


class EmailRequest(BaseModel):

    email: str


@router.post("/send-report")
def send_report(
    payload: EmailRequest
):

    send_email(

        email=payload.email,

        subject=
        "Skill Observation Report",

        message=
        "Your child's latest report is available."

    )

    return {

        "message":
        f"Report sent successfully to {payload.email}"

    }