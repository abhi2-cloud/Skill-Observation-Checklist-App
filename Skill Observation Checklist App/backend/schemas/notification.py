from pydantic import BaseModel


class NotificationCreate(BaseModel):

    title: str

    message: str

    notification_type: str


class NotificationUpdate(BaseModel):

    is_read: bool