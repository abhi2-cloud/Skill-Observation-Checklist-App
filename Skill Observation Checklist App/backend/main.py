print("========== USING THIS MAIN.PY ==========")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.database import Base
from core.database import engine

from models.user import User
from models.child import Child
from models.observation import Observation
from models.notification import Notification
from models.activity_log import ActivityLog

from api.auth import router as auth_router
from api.children import router as children_router
from api.observations import router as observations_router
from api.progress import router as progress_router
from api.reports import router as reports_router
from api.parent_portal import router as parent_router
from api.export import router as export_router
from api.notifications import router as notifications_router
from api.activity_logs import router as activity_logs_router
from api.dashboard import router as dashboard_router
from api.email import router as email_router

# NEW USERS ROUTER

from api.users import router as users_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
title="Skill Observation Checklist API",
version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication

app.include_router(auth_router)

# Children

app.include_router(children_router)

# Observations

app.include_router(observations_router)

# Progress Analytics

app.include_router(progress_router)

# Reports

app.include_router(reports_router)

# Parent Portal

app.include_router(parent_router)

# Export

app.include_router(export_router)

# Notifications

app.include_router(notifications_router)

# Activity Logs

app.include_router(activity_logs_router)

# Dashboard Analytics

app.include_router(dashboard_router)

# Email Reports

app.include_router(email_router)

# Users Management

app.include_router(users_router)

@app.get("/")
def home():

    return {
        "message": "Skill Observation Checklist API"
    }

