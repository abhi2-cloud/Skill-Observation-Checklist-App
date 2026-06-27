from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from core.database import get_db

from models.user import User

from schemas.auth import RegisterRequest
from schemas.auth import LoginRequest

from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token
)

from services.activity_log_service import (
    log_activity
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

security = HTTPBearer()


@router.post("/register")
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == payload.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(
            payload.password
        ),
        role=payload.role,
        is_active=True
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    log_activity(
        db=db,
        user_email=user.email,
        action="User Registered",
        module="Authentication"
    )

    return {
        "message":
        "User registered successfully"
    }


@router.post("/login")
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == payload.email
    ).first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if user.is_active is False:

        raise HTTPException(
            status_code=403,
            detail="Account is deactivated"
        )

    if not verify_password(
        payload.password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        }
    )

    log_activity(
        db=db,
        user_email=user.email,
        action="User Login",
        module="Authentication"
    )

    return {

       "access_token": token,

       "token_type": "bearer",

       "id": str(user.id),

       "email": user.email,

       "role": user.role,

       "name": user.name

    }


@router.get("/me")
def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    payload = verify_access_token(
        token
    )

    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return payload