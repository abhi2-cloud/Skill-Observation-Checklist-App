import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axios";

function ChildProgress() {

  const { childId } = useParams();

  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadProgress();

  }, []);

  const loadProgress = async () => {

    try {

      const token =
        localStorage.getItem(
          "access_token"
        );

      const response =
        await axios.get(
          `/api/progress/${childId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setData(response.data);

    } catch (error) {

      console.log(error);

      alert(
        "Failed to load progress"
      );

    } finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (

      <h2
        style={{
          textAlign: "center"
        }}
      >
        Loading...
      </h2>

    );

  }

  if (!data) {

    return (

      <h2
        style={{
          textAlign: "center"
        }}
      >
        No Data Found
      </h2>

    );

  }

  return (

    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "auto"
      }}
    >

      <Link to="/progress">
        ← Back
      </Link>

      <h1>
        Child Progress Report
      </h1>

      <hr />

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px"
        }}
      >

        <h2>
          {data.child_name}
        </h2>

        <p>
          Average Score:
          {" "}
          {data.average_score}
        </p>

      </div>

      <h2>
        Skill Performance
      </h2>

      {

        data.skills.length === 0 ? (

          <p>
            No Skills Found
          </p>

        ) : (

          data.skills.map(
            (skill, index) => (

              <div
                key={index}
                style={{
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  padding:
                    "15px",
                  marginBottom:
                    "10px"
                }}
              >

                <h3>
                  {skill.skill}
                </h3>

                <p>
                  Average:
                  {" "}
                  {skill.average}
                </p>

              </div>

            )
          )

        )

      }

      <hr />

      <h2>
        Recommendation
      </h2>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "20px"
        }}
      >

        {

          typeof data.recommendation ===
          "string" ? (

            <p>
              {data.recommendation}
            </p>

          ) : (

            <>

              <h3>
                Strengths
              </h3>

              <ul>
                {
                  data.recommendation?.strengths?.map(
                    (
                      item,
                      index
                    ) => (

                      <li
                        key={index}
                      >
                        {item}
                      </li>

                    )
                  )
                }
              </ul>

              <h3>
                Areas To Improve
              </h3>

              <ul>
                {
                  data.recommendation?.weaknesses?.map(
                    (
                      item,
                      index
                    ) => (

                      <li
                        key={index}
                      >
                        {item}
                      </li>

                    )
                  )
                }
              </ul>

              <h3>
                Suggested Activities
              </h3>

              <ul>
                {
                  data.recommendation?.suggested_activities?.map(
                    (
                      item,
                      index
                    ) => (

                      <li
                        key={index}
                      >
                        {item}
                      </li>

                    )
                  )
                }
              </ul>

            </>

          )

        }

      </div>

    </div>

  );

}

export default ChildProgress;

