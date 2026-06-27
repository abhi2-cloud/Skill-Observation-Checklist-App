from models.child import Child
from models.observation import Observation


def get_parent_dashboard(
    child,
    observations,
    recommendation
):

    total_observations = len(
        observations
    )

    average_score = 0

    if total_observations > 0:

        average_score = round(
            sum(
                observation.rating
                for observation in observations
            )
            /
            total_observations,
            2
        )

    return {

        "child": {
            "id": str(child.id),
            "name": child.name,
            "age": child.age,
            "classroom": child.classroom
        },

        "summary": {
            "total_observations":
                total_observations,
            "average_score":
                average_score
        },

        "recommendation":
            recommendation
    }