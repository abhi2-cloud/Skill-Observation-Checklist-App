from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from core.database import get_db

from models.milestone import Milestone

from schemas.milestone import (
    MilestoneCreate,
    MilestoneUpdate
)

router = APIRouter(
    prefix="/api/milestones",
    tags=["Milestones"]
)


@router.post("/")
def create_milestone(
    payload: MilestoneCreate,
    db: Session = Depends(get_db)
):

    milestone = Milestone(
        **payload.dict()
    )

    db.add(milestone)

    db.commit()

    db.refresh(milestone)

    return milestone


@router.get("/")
def get_milestones(
    db: Session = Depends(get_db)
):

    return db.query(
        Milestone
    ).all()


@router.get("/{milestone_id}")
def get_milestone(
    milestone_id: str,
    db: Session = Depends(get_db)
):

    milestone = db.query(
        Milestone
    ).filter(
        Milestone.id == milestone_id
    ).first()

    if not milestone:

        raise HTTPException(
            status_code=404,
            detail="Milestone not found"
        )

    return milestone


@router.put("/{milestone_id}")
def update_milestone(
    milestone_id: str,
    payload: MilestoneUpdate,
    db: Session = Depends(get_db)
):

    milestone = db.query(
        Milestone
    ).filter(
        Milestone.id == milestone_id
    ).first()

    if not milestone:

        raise HTTPException(
            status_code=404,
            detail="Milestone not found"
        )

    milestone.age_group = payload.age_group
    milestone.title = payload.title
    milestone.description = payload.description
    milestone.expected_score = payload.expected_score

    db.commit()

    db.refresh(milestone)

    return milestone


@router.delete("/{milestone_id}")
def delete_milestone(
    milestone_id: str,
    db: Session = Depends(get_db)
):

    milestone = db.query(
        Milestone
    ).filter(
        Milestone.id == milestone_id
    ).first()

    if not milestone:

        raise HTTPException(
            status_code=404,
            detail="Milestone not found"
        )

    db.delete(milestone)

    db.commit()

    return {
        "message": "Milestone deleted"
    }