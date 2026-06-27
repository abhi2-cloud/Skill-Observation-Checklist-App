from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from core.database import get_db

from models.child import Child
from models.observation import Observation

from services.recommendation_service import (
    generate_recommendation
)

router = APIRouter(
    prefix="/api/progress",
    tags=["Progress"]
)


@router.get("/{child_id}")
def child_progress(
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

    if not observations:

        return {
            "child_name": child.name,
            "average_score": 0,
            "skills": [],
            "recommendation":
                "No observations found"
        }

    skill_scores = {}

    total_score = 0

    for observation in observations:

        total_score += observation.rating

        if observation.skill not in skill_scores:

            skill_scores[
                observation.skill
            ] = []

        skill_scores[
            observation.skill
        ].append(
            observation.rating
        )

    skills = []

    for skill, ratings in skill_scores.items():

        skills.append({
            "skill": skill,
            "average":
                round(
                    sum(ratings)
                    /
                    len(ratings),
                    2
                )
        })

    average_score = round(
        total_score /
        len(observations),
        2
    )

    recommendation = (
        generate_recommendation(
            observations
        )
    )

    return {
        "child_name": child.name,
        "average_score":
            average_score,
        "skills":
            skills,
        "recommendation":
            recommendation
    }