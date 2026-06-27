from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from core.database import get_db

from core.security import (
    verify_access_token
)

from models.observation import Observation
from models.child import Child

from schemas.observation import (
    ObservationCreate,
    ObservationUpdate
)

from services.activity_log_service import (
    log_activity
)

router = APIRouter(
    prefix="/api/observations",
    tags=["Observations"]
)

security = HTTPBearer()


@router.post("/")
def create_observation(
    payload: ObservationCreate,
    db: Session = Depends(get_db)
):

    observation = Observation(
        **payload.dict()
    )

    db.add(observation)

    db.commit()

    db.refresh(observation)

    log_activity(
        db=db,
        user_email="admin@system.com",
        action="Created Observation",
        module="Observations"
    )

    return observation


@router.get("/")
def get_observations(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    payload = verify_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    role = payload.get("role")
    email = payload.get("email")

    if role in ["admin", "teacher"]:

        observations = db.query(Observation).all()

    else:

        children = (
            db.query(Child)
            .filter(Child.parent_email == email)
            .all()
        )

        child_ids = [child.id for child in children]

        observations = (
            db.query(Observation)
            .filter(Observation.child_id.in_(child_ids))
            .all()
        )

    result = []

    for obs in observations:

        child = (
            db.query(Child)
            .filter(Child.id == obs.child_id)
            .first()
        )

        result.append({

            "id": str(obs.id),

            "child_id": str(obs.child_id),

            "child_name": child.name if child else "Unknown Child",

            "skill_area": obs.skill,

            "rating": obs.rating,

            "notes": obs.notes,

            "observation_date": (
                obs.observation_date.isoformat()
                if obs.observation_date
                else None
            )

        })

    return result


@router.get("/child/{child_id}")
def get_child_observations(
    child_id: str,
    db: Session = Depends(get_db)
):

    observations = (
        db.query(Observation)
        .filter(
            Observation.child_id == child_id
        )
        .all()
    )

    total_observations = len(
        observations
    )

    average_rating = 0

    if total_observations > 0:

        average_rating = round(
            sum(
                obs.rating
                for obs in observations
            ) / total_observations,
            2
        )

    return {
        "average_rating":
            average_rating,
        "total_observations":
            total_observations,
        "observations":
            observations
    }


@router.get("/{observation_id}")
def get_observation(
    observation_id: str,
    db: Session = Depends(get_db)
):

    observation = db.query(
        Observation
    ).filter(
        Observation.id == observation_id
    ).first()

    if not observation:

        raise HTTPException(
            status_code=404,
            detail="Observation not found"
        )

    return observation


@router.put("/{observation_id}")
def update_observation(
    observation_id: str,
    payload: ObservationUpdate,
    db: Session = Depends(get_db)
):

    observation = db.query(
        Observation
    ).filter(
        Observation.id == observation_id
    ).first()

    if not observation:

        raise HTTPException(
            status_code=404,
            detail="Observation not found"
        )

    observation.skill = payload.skill
    observation.rating = payload.rating
    observation.notes = payload.notes

    db.commit()

    db.refresh(observation)

    log_activity(
        db=db,
        user_email="admin@system.com",
        action="Updated Observation",
        module="Observations"
    )

    return observation


@router.delete("/{observation_id}")
def delete_observation(
    observation_id: str,
    db: Session = Depends(get_db)
):

    observation = db.query(
        Observation
    ).filter(
        Observation.id == observation_id
    ).first()

    if not observation:

        raise HTTPException(
            status_code=404,
            detail="Observation not found"
        )

    db.delete(observation)

    db.commit()

    log_activity(
        db=db,
        user_email="admin@system.com",
        action="Deleted Observation",
        module="Observations"
    )

    return {
        "message":
        "Observation deleted"
    }