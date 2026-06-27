from collections import defaultdict


def generate_recommendation(observations):

    if not observations:
        return {
            "strengths": [],
            "weaknesses": [],
            "recommendation": "No observations available",
            "suggested_activities": []
        }

    skill_scores = defaultdict(list)

    for observation in observations:

        skill_scores[
            observation.skill
        ].append(
            observation.rating
        )

    strengths = []
    weaknesses = []

    total_score = 0
    total_count = 0

    for skill, scores in skill_scores.items():

        avg_skill_score = sum(scores) / len(scores)

        total_score += sum(scores)
        total_count += len(scores)

        if avg_skill_score >= 3:
            strengths.append(skill)

        if avg_skill_score < 3:
            weaknesses.append(skill)

    average_score = total_score / total_count

    if average_score < 2:

        recommendation = (
            "Needs Immediate Attention"
        )

        suggested_activities = [
            "One-to-one guided learning",
            "Daily observation support",
            "Counting blocks",
            "Picture flash cards",
            "Interactive play sessions"
        ]

    elif average_score < 3:

        recommendation = (
            "Continue Guided Practice"
        )

        suggested_activities = [
            "Group activities",
            "Story telling sessions",
            "Shape matching games",
            "Color recognition exercises",
            "Peer interaction activities"
        ]

    else:

        recommendation = (
            "Excellent Progress"
        )

        suggested_activities = [
            "Advanced classroom activities",
            "Leadership opportunities",
            "Creative problem-solving tasks",
            "Collaborative learning projects",
            "Skill enrichment activities"
        ]

    return {
        "average_score": round(
            average_score,
            2
        ),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendation": recommendation,
        "suggested_activities": suggested_activities
    }