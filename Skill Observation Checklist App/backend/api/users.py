from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from core.database import get_db

from models.user import User

from schemas.user import CreateUserRequest

from core.security import hash_password

from services.activity_log_service import (
    log_activity
)

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get("/")
def get_users(
    db: Session = Depends(get_db)
):

    users = db.query(User).filter(
        User.is_active == True
    ).all()

    return [

        {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role
        }

        for user in users

    ]


@router.post("/")
def create_user(

    payload: CreateUserRequest,

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
        action="User Created",
        module="User Management"
    )

    return {
        "message":
        "User created successfully"
    }


@router.put("/{user_id}")
def update_user(

    user_id: str,

    payload: CreateUserRequest,

    db: Session = Depends(get_db)

):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_user = db.query(User).filter(
        User.email == payload.email,
        User.id != user_id
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    user.name = payload.name

    user.email = payload.email

    user.role = payload.role

    db.commit()

    db.refresh(user)

    log_activity(
        db=db,
        user_email=user.email,
        action="User Updated",
        module="User Management"
    )

    return {
        "message":
        "User updated successfully"
    }


@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.is_active = False

    db.commit()

    log_activity(
        db=db,
        user_email=user.email,
        action="User Deleted",
        module="User Management"
    )

    return {
        "message":
        "User deactivated successfully"
    }