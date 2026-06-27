from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from core.database import get_db

from models.child import Child
from models.observation import Observation

from services.parent_service import (
    get_parent_dashboard
)

from services.recommendation_service import (
    generate_recommendation
)

router = APIRouter(
    prefix="/api/parent",
    tags=["Parent Portal"]
)


@router.get("/{child_id}")
def parent_dashboard(
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

    observations = db.query(
        Observation
    ).filter(
        Observation.child_id == child_id
    ).all()

    recommendation = (
        generate_recommendation(
            observations
        )
    )

    return get_parent_dashboard(
        child,
        observations,
        recommendation
    )