from sqlalchemy.orm import Session

from models.child import Child
from models.observation import Observation


def get_dashboard_summary(db: Session):

    total_children = db.query(
        Child
    ).count()

    total_observations = db.query(
        Observation
    ).count()

    observations = db.query(
        Observation
    ).all()

    students_needing_attention = 0

    child_scores = {}

    for observation in observations:

        child_id = str(
            observation.child_id
        )

        if child_id not in child_scores:
            child_scores[child_id] = []

        child_scores[child_id].append(
            observation.rating
        )

    for scores in child_scores.values():

        average = sum(scores) / len(scores)

        if average < 2:
            students_needing_attention += 1

    average_rating = 0

    if observations:

        average_rating = round(
            sum(
                observation.rating
                for observation in observations
            ) / len(observations),
            2
        )

    return {
        "total_children": total_children,
        "total_observations": total_observations,
        "students_needing_attention":
            students_needing_attention,
        "average_rating":
            average_rating
    }


def get_skill_distribution(db: Session):

    observations = db.query(
        Observation
    ).all()

    skill_data = {}

    for observation in observations:

        skill = observation.skill

        if skill not in skill_data:
            skill_data[skill] = 0

        skill_data[skill] += 1

    result = []

    for skill, count in skill_data.items():

        result.append({
            "skill": skill,
            "count": count
        })

    return result


def get_monthly_progress(db: Session):

    observations = db.query(
        Observation
    ).all()

    monthly_data = {}

    for observation in observations:

        month = observation.observation_date.strftime(
            "%Y-%m"
        )

        if month not in monthly_data:

            monthly_data[month] = {
                "total": 0,
                "count": 0
            }

        monthly_data[month]["total"] += (
            observation.rating
        )

        monthly_data[month]["count"] += 1

    result = []

    for month, data in monthly_data.items():

        average = round(
            data["total"] / data["count"],
            2
        )

        result.append({
            "month": month,
            "average_rating": average
        })

    return result