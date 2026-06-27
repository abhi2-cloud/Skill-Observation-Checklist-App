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
    child_id: str
    report_type: str
    recipient_email: str

@router.post("/send-report")
def send_report(
    payload: EmailRequest
):
    send_email(
        email=payload.recipient_email,
        subject=f"Skill Observation Report - {payload.report_type.capitalize()}",
        message="Your child's latest report is available."
    )
    return {
        "message": f"Report sent successfully to {payload.recipient_email}"
    }