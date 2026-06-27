import {
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

import {
  getObservations
} from "../services/observationApi";

function ObservationTrends() {

  const [observations, setObservations] =
    useState([]);

  const [stats, setStats] =
    useState({
      total: 0,
      average: 0,
      highest: 0,
      lowest: 0
    });

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    try {

      const data =
        await getObservations();

      const sortedData =
        [...data].sort(
          (a, b) =>
            new Date(
              b.observation_date
            ) -
            new Date(
              a.observation_date
            )
        );

      setObservations(
        sortedData
      );

      calculateStats(
        sortedData
      );

    } catch (error) {

      console.log(error);

    }

  };

  const calculateStats =
    (data) => {

      if (
        !data ||
        data.length === 0
      ) {

        setStats({
          total: 0,
          average: 0,
          highest: 0,
          lowest: 0
        });

        return;

      }

      const ratings =
        data.map(
          item => item.rating
        );

      const average =
        (
          ratings.reduce(
            (a, b) => a + b,
            0
          ) / ratings.length
        ).toFixed(2);

      setStats({

        total:
          data.length,

        average,

        highest:
          Math.max(
            ...ratings
          ),

        lowest:
          Math.min(
            ...ratings
          )

      });

    };

  const ratingDistribution =
    [1, 2, 3, 4, 5].map(
      rating => ({

        rating,

        count:
          observations.filter(
            item =>
              item.rating === rating
          ).length

      })
    );

  const skillPerformance =
    observations.map(
      obs => ({

        skill:
          obs.skill,

        rating:
          obs.rating

      })
    );

  return (

    <div
      style={{
        padding: "30px",
        maxWidth: "1300px",
        margin: "auto"
      }}
    >

      <Link
        to="/dashboard"
      >
        ← Back to Dashboard
      </Link>

      <h1
        style={{
          textAlign: "center"
        }}
      >
        Observation Trends
      </h1>

      <hr />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}
      >

        <Card
          title="Total Observations"
          value={stats.total}
        />

        <Card
          title="Average Rating"
          value={stats.average}
        />

        <Card
          title="Highest Rating"
          value={stats.highest}
        />

        <Card
          title="Lowest Rating"
          value={stats.lowest}
        />

      </div>

      <h2>
        Rating Distribution
      </h2>

      <div
        style={{
          height: "350px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px"
        }}
      >

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <BarChart
            data={
              ratingDistribution
            }
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="rating"
            />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="count"
              name="Observations"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      <h2>
        Skill Performance
      </h2>

      <div
        style={{
          height: "350px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px"
        }}
      >

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <BarChart
            data={
              skillPerformance
            }
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="skill"
            />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="rating"
              name="Rating"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      <h2>
        Observation Records
      </h2>

      {

        observations.length === 0 ?

        (

          <p>
            No Observation Data Found
          </p>

        )

        :

        (

          <table
            border="1"
            width="100%"
          >

            <thead>

              <tr>

                <th>
                  Skill
                </th>

                <th>
                  Rating
                </th>

                <th>
                  Notes
                </th>

                <th>
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {

                observations.map(
                  obs => (

                    <tr
                      key={obs.id}
                    >

                      <td>
                        {obs.skill}
                      </td>

                      <td>
                        {obs.rating}
                      </td>

                      <td>
                        {obs.notes}
                      </td>

                      <td>

                        {

                          obs.observation_date

                            ?

                            new Date(
                              obs.observation_date
                            ).toLocaleDateString()

                            :

                            "-"

                        }

                      </td>

                    </tr>

                  )
                )

              }

            </tbody>

          </table>

        )

      }

    </div>

  );

}

function Card({
  title,
  value
}) {

  return (

    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center"
      }}
    >

      <h3>
        {title}
      </h3>

      <h1>
        {value}
      </h1>

    </div>

  );

}

export default ObservationTrends;