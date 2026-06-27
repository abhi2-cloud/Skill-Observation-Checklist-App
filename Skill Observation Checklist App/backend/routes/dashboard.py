from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from core.database import get_db

from models.user import User
from models.child import Child
from models.observation import Observation
from models.notification import Notification
from models.activity_log import ActivityLog