import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";

function DashboardCharts({ observations }) {
  /* ── build per-skill averages ──
     Uses obs.skill_area. If your API is returning every observation
     with an empty skill_area, this will correctly show "Unspecified" —
     that's a sign the backend isn't saving/sending the field, not a bug here.
  */
  const skillData = {};

  observations.forEach((obs) => {
    const key = obs.skill_area || "Unspecified";
    if (!skillData[key]) {
      skillData[key] = [];
    }
    skillData[key].push(Number(obs.rating) || 0);
  });

  const chartData = Object.keys(skillData).map((skill) => ({
    skill,
    average: Number(
      (skillData[skill].reduce((a, b) => a + b, 0) / skillData[skill].length).toFixed(2)
    ),
    count: skillData[skill].length
  }));

  const hasData = chartData.length > 0;
  const totalCount = chartData.reduce((sum, d) => sum + d.count, 0);

  // distribution data: % share of total observations per skill (drives donut + legend)
  const distributionData = chartData
    .map((d) => ({
      ...d,
      pct: totalCount > 0 ? Math.round((d.count / totalCount) * 100) : 0
    }))
    .sort((a, b) => b.pct - a.pct);

  const topCategory = distributionData[0] || {
    pct: 0,
    skill: "No Data"
  };

  const COLORS = ["#2563EB", "#60A5FA", "#93C5FD", "#C7D2FE", "#E0E7FF", "#A5B4FC", "#818CF8"];

  /* ── shared empty-state ── */
  const EmptyState = ({ label }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#94a3b8",
        fontSize: "13px",
        gap: "6px"
      }}
    >
      <span style={{ fontSize: "28px" }}>📊</span>
      {label}
    </div>
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
        gap: "16px",
        alignItems: "start"
      }}
    >
      {/* LEFT SIDE — bar chart, grouped by skill area */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px",
          height: "320px",
          boxSizing: "border-box",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px"
          }}
        >
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            Observation Trends
          </h2>
          <span
            style={{
              fontSize: "12px",
              color: "#2563eb",
              background: "#eff6ff",
              borderRadius: "20px",
              padding: "4px 12px",
              fontWeight: 600
            }}
          >
            This Month
          </span>
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="skill"
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    background: "#fff",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,.08)"
                  }}
                />
                <Bar dataKey="average" radius={[6, 6, 0, 0]} maxBarSize={38}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState label="No observation data yet" />
          )}
        </div>
      </div>

      {/* RIGHT SIDE — donut with center label + percentage legend, plus Top Skills below */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
          Skill Distribution
        </h2>

        {hasData ? (
          <>
            <div style={{ position: "relative", width: "100%", height: 190 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="pct"
                    nameKey="skill"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {distributionData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px"
                    }}
                    formatter={(value, name) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* center label — top category */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none"
                }}
              >
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
                  {topCategory.pct}%
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: 600,
                    maxWidth: "90px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                  title={topCategory.skill}
                >
                  {topCategory.skill}
                </div>
              </div>
            </div>

            {/* legend with percentages, like Image 1 */}
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {distributionData.map((item, index) => (
                <div
                  key={item.skill}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <span
                      style={{
                        width: "9px",
                        height: "9px",
                        borderRadius: "50%",
                        background: COLORS[index % COLORS.length],
                        flexShrink: 0
                      }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#334155",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      title={item.skill}
                    >
                      {item.skill}
                    </span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
                    {item.pct}%
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ height: "190px" }}>
            <EmptyState label="No skill data yet" />
          </div>
        )}
      </div>

      {/* TOP SKILLS */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "18px",
          boxShadow: "all .2s ease"
          
        }}
      >
        <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
          Top Skills
        </h3>

        {hasData ? (
          chartData
            .slice()
            .sort((a, b) => b.average - a.average)
            .map((item, index) => {
              // Ratings are on a 1–5 scale; clamp so bars never overflow 100%.
              const pct = Math.max(0, Math.min(100, (item.average / 5) * 100));
              return (
                <div key={item.skill} style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px"
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                      {item.skill}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                      {item.average}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#e5e7eb",
                      borderRadius: "20px",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: COLORS[index % COLORS.length],
                        borderRadius: "20px",
                        transition: "width .5s ease"
                      }}
                    />
                  </div>
                </div>
              );
            })
        ) : (
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No skill data yet.</p>
        )}
      </div>
      </div>
    </div>
  );
}

export default DashboardCharts;