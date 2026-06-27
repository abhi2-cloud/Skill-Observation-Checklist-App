from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi.responses import Response

from sqlalchemy.orm import Session

from core.database import get_db

from models.child import Child
from models.observation import Observation

from services.recommendation_service import (
    generate_recommendation
)

from services.report_service import (
    generate_child_report
)

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)


@router.get("/summary")
def reports_summary(
    db: Session = Depends(get_db)
):

    observations = db.query(
        Observation
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
            ) / total_observations,
            2
        )

    skill_scores = {}

    for obs in observations:

        if obs.skill not in skill_scores:

            skill_scores[obs.skill] = []

        skill_scores[obs.skill].append(
            obs.rating
        )

    highest_skill = None
    lowest_skill = None

    if skill_scores:

        skill_averages = {

            skill: sum(scores) / len(scores)

            for skill, scores
            in skill_scores.items()

        }

        highest_skill = max(
            skill_averages,
            key=skill_averages.get
        )

        lowest_skill = min(
            skill_averages,
            key=skill_averages.get
        )

    recent_observations = [

        {
            "skill": obs.skill,
            "rating": obs.rating,
            "notes": obs.notes
        }

        for obs in observations[-5:]

    ]

    return {

        "total_observations":
        total_observations,

        "average_rating":
        average_rating,

        "highest_skill":
        highest_skill,

        "lowest_skill":
        lowest_skill,

        "recent_observations":
        recent_observations

    }


@router.get("/{child_id}")
def generate_report(
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

    pdf = generate_child_report(
        child,
        observations,
        recommendation
    )

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            f"attachment; filename={child.name}.pdf"
        }
    )