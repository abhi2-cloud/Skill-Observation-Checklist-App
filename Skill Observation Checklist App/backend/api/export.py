from fastapi import APIRouter
from fastapi import Depends

from fastapi.responses import Response

from sqlalchemy.orm import Session

from core.database import get_db

from models.child import Child
from models.observation import Observation

from services.export_service import (
    export_children_csv,
    export_observations_csv
)

router = APIRouter(
    prefix="/api/export",
    tags=["Export"]
)


@router.get("/children")
def export_children(
    db: Session = Depends(get_db)
):

    children = db.query(
        Child
    ).all()

    csv_data = export_children_csv(
        children
    )

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=children.csv"
        }
    )


@router.get("/observations")
def export_observations(
    db: Session = Depends(get_db)
):

    observations = db.query(
        Observation
    ).all()

    csv_data = (
        export_observations_csv(
            observations
        )
    )

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=observations.csv"
        }
    )