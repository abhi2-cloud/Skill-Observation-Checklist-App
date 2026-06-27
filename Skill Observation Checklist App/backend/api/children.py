from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from core.database import get_db

from core.security import verify_access_token

from models.child import Child

from schemas.child import (
    ChildCreate,
    ChildUpdate
)

from services.activity_log_service import (
    log_activity
)

router = APIRouter(
    prefix="/api/children",
    tags=["Children"]
)

security = HTTPBearer()


@router.post("/")
def create_child(
    payload: ChildCreate,
    db: Session = Depends(get_db)
):

    child = Child(
        **payload.dict()
    )

    db.add(child)

    db.commit()

    db.refresh(child)

    log_activity(
        db=db,
        user_email="admin@system.com",
        action="Created Child",
        module="Children"
    )

    return child


@router.get("/")
def get_children(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    payload = verify_access_token(
        token
    )

    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    role = payload.get("role")

    email = payload.get("email")

    if role == "parent":

        return db.query(
            Child
        ).filter(
            Child.parent_email == email
        ).all()

    return db.query(
        Child
    ).all()


@router.get("/{child_id}")
def get_child(
    child_id: str,
    db: Session = Depends(get_db)
):

    child = db.query(
        Child
    ).filter(
        Child.id == child_id
    ).first()

    if not child:

        raise HTTPException(
            status_code=404,
            detail="Child not found"
        )

    return child


@router.put("/{child_id}")
def update_child(
    child_id: str,
    payload: ChildUpdate,
    db: Session = Depends(get_db)
):

    child = db.query(
        Child
    ).filter(
        Child.id == child_id
    ).first()

    if not child:

        raise HTTPException(
            status_code=404,
            detail="Child not found"
        )
    update_data = payload.dict(
       exclude_unset=True
    )

    for key, value in payload.dict().items():

        setattr(
            child,
            key,
            value
        )

    db.commit()

    db.refresh(child)

    log_activity(
        db=db,
        user_email="admin@system.com",
        action="Updated Child",
        module="Children"
    )

    return child


@router.delete("/{child_id}")
def delete_child(
    child_id: str,
    db: Session = Depends(get_db)
):

    child = db.query(
        Child
    ).filter(
        Child.id == child_id
    ).first()

    if not child:

        raise HTTPException(
            status_code=404,
            detail="Child not found"
        )

    db.delete(child)

    db.commit()

    log_activity(
        db=db,
        user_email="admin@system.com",
        action="Deleted Child",
        module="Children"
    )

    return {
        "message":
        "Child deleted successfully"
    }