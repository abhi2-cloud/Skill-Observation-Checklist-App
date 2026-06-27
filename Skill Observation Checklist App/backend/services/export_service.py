import csv

from io import StringIO


def export_children_csv(children):

    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "Name",
        "Age",
        "Gender",
        "Parent Name",
        "Parent Email",
        "Classroom"
    ])

    for child in children:

        writer.writerow([
            child.id,
            child.name,
            child.age,
            child.gender,
            child.parent_name,
            child.parent_email,
            child.classroom
        ])

    return output.getvalue()


def export_observations_csv(observations):

    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Child ID",
        "Teacher ID",
        "Skill",
        "Rating",
        "Notes"
    ])

    for observation in observations:

        writer.writerow([
            observation.child_id,
            observation.teacher_id,
            observation.skill,
            observation.rating,
            observation.notes
        ])

    return output.getvalue()