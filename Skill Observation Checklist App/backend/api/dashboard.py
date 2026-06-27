from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from core.database import get_db

from core.security import verify_access_token

from models.user import User
from models.child import Child
from models.observation import Observation
from models.notification import Notification
from models.activity_log import ActivityLog

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)

security = HTTPBearer()


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db)
):

    users = db.query(User).filter(
        User.is_active.is_(True)
    ).all()

    total_admins = len([
        user
        for user in users
        if user.role == "admin"
    ])

    total_teachers = len([
        user
        for user in users
        if user.role == "teacher"
    ])

    total_parents = len([
        user
        for user in users
        if user.role == "parent"
    ])

    return {

        "total_users":
        len(users),

        "total_admins":
        total_admins,

        "total_teachers":
        total_teachers,

        "total_parents":
        total_parents,

        "total_children":
        db.query(Child).count(),

        "total_observations":
        db.query(Observation).count(),

        "total_notifications":
        db.query(Notification).count(),

        "total_activity_logs":
        db.query(ActivityLog).count()

    }


@router.get("/child-progress")
def child_progress(
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

    role = payload.get(
        "role"
    )

    email = payload.get(
        "email"
    )

    if role == "parent":

        children = db.query(
            Child
        ).filter(
            Child.parent_email == email
        ).all()

    else:

        children = db.query(
            Child
        ).all()

    results = []

    for child in children:

        observations = db.query(
            Observation
        ).filter(
            Observation.child_id == child.id
        ).all()

        total_observations = len(
            observations
        )

        average_rating = 0

        if total_observations > 0:

            average_rating = round(

                sum(
                    obs.rating
                    for obs in observations
                )
                /
                total_observations,

                1

            )

        results.append({

            "child_id":
            str(child.id),

            "child_name":
            child.name,

            "total_observations":
            total_observations,

            "average_rating":
            average_rating

        })

    return results


@router.get("/top-child")
def top_child(
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

    role = payload.get(
        "role"
    )

    email = payload.get(
        "email"
    )

    if role == "parent":

        children = db.query(
            Child
        ).filter(
            Child.parent_email == email
        ).all()

    else:

        children = db.query(
            Child
        ).all()

    best_child = None

    highest_rating = 0

    for child in children:

        observations = db.query(
            Observation
        ).filter(
            Observation.child_id == child.id
        ).all()

        if len(observations) == 0:

            continue

        average_rating = round(

            sum(
                obs.rating
                for obs in observations
            )
            /
            len(observations),

            1

        )

        if average_rating > highest_rating:

            highest_rating = average_rating

            best_child = {

                "child_id":
                str(child.id),

                "child_name":
                child.name,

                "average_rating":
                average_rating,

                "total_observations":
                len(observations)

            }

    if not best_child:

        return {

            "child_id": None,

            "child_name": "No Data",

            "average_rating": 0,

            "total_observations": 0

        }

    return best_child