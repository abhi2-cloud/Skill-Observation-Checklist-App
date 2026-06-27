from io import BytesIO

from reportlab.lib.pagesizes import letter

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.lib.styles import (
    getSampleStyleSheet
)


def generate_child_report(
    child,
    observations,
    recommendation
):

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter
    )

    styles = getSampleStyleSheet()

    content = []

    content.append(
        Paragraph(
            "Child Progress Report",
            styles["Title"]
        )
    )

    content.append(
        Spacer(1, 12)
    )

    content.append(
        Paragraph(
            f"Child Name: {child.name}",
            styles["Normal"]
        )
    )

    content.append(
        Paragraph(
            f"Age: {child.age}",
            styles["Normal"]
        )
    )

    content.append(
        Spacer(1, 12)
    )

    content.append(
        Paragraph(
            "Observations",
            styles["Heading2"]
        )
    )

    for observation in observations:

        content.append(
            Paragraph(
                f"{observation.skill} "
                f"- Rating: {observation.rating}",
                styles["Normal"]
            )
        )

    content.append(
        Spacer(1, 12)
    )

    content.append(
        Paragraph(
            "Recommendation",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            recommendation["recommendation"],
            styles["Normal"]
        )
    )

    doc.build(content)

    pdf = buffer.getvalue()

    buffer.close()

    return pdf