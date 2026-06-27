import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  FiArrowLeft, FiStar, FiTrendingUp, FiBarChart2,
  FiCalendar, FiAward, FiBookOpen, FiActivity
} from "react-icons/fi";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";



const token = () => localStorage.getItem("access_token");

const SKILL_COLORS = [
  "#2563EB", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"
];

export default function ChildPerformance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token()}` };
        const [childRes, obsRes] = await Promise.all([
          axios.get(`/api/children/${id}`, { headers }),
          axios.get(`/api/observations/?child_id=${id}`, { headers }),
        ]);
        setChild(childRes.data);
        setObservations(obsRes.data);
      } catch (err) {
        setError("Failed to load performance data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Derived metrics
  const skillMap = {};
  observations.forEach((obs) => {
    const skill = obs.skill_name || obs.skill || "General";
    if (!skillMap[skill]) skillMap[skill] = { total: 0, count: 0 };
    skillMap[skill].total += obs.rating;
    skillMap[skill].count += 1;
  });

  const skillAverages = Object.entries(skillMap).map(([skill, { total, count }]) => ({
    skill,
    avg: parseFloat((total / count).toFixed(2)),
    count,
  }));

  const radarData = skillAverages.map(({ skill, avg }) => ({ subject: skill, score: avg, fullMark: 5 }));

  // Timeline: group by month
  const monthMap = {};
  observations.forEach((obs) => {
    const d = new Date(obs.observation_date || obs.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = { month: key, total: 0, count: 0 };
    monthMap[key].total += obs.rating;
    monthMap[key].count += 1;
  });
  const timelineData = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({ ...m, avg: parseFloat((m.total / m.count).toFixed(2)) }));

  const overallAvg =
    observations.length > 0
      ? (observations.reduce((s, o) => s + o.rating, 0) / observations.length).toFixed(2)
      : "N/A";

  const topSkill = skillAverages.reduce((best, s) => (s.avg > (best?.avg ?? 0) ? s : best), null);

  const StatCard = ({ icon: Icon, label, value, color = "#2563EB", sub }) => (
    <div style={{
      background: "#fff", borderRadius: 20, padding: "24px 28px",
      boxShadow: "0 10px 25px rgba(0,0,0,.08)", display: "flex",
      alignItems: "center", gap: 20, flex: "1 1 200px", minWidth: 180
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${color}18`, display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#0F172A", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 13, color: "#64748B", marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div className="spinner" style={{
          width: 44, height: 44, border: "4px solid #E2E8F0",
          borderTop: "4px solid #2563EB", borderRadius: "50%",
          animation: "spin 0.9s linear infinite", margin: "0 auto 16px"
        }} />
        <div style={{ color: "#64748B", fontSize: 15 }}>Loading performance data…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, textAlign: "center", color: "#EF4444", fontSize: 16 }}>{error}</div>
  );

  return (
    <div style={{ padding: "30px", marginLeft: "260px", fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12,
            padding: "10px 14px", cursor: "pointer", display: "flex",
            alignItems: "center", gap: 8, color: "#475569", fontSize: 14,
            fontWeight: 500, boxShadow: "0 2px 8px rgba(0,0,0,.05)"
          }}>
          <FiArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A" }}>
            {child?.name}'s Performance
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>
            {child?.classroom} · Age {child?.age}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard icon={FiActivity} label="Total Observations" value={observations.length} color="#2563EB" />
        <StatCard icon={FiStar} label="Overall Average" value={overallAvg !== "N/A" ? `${overallAvg} / 5` : "N/A"} color="#F59E0B" />
        <StatCard icon={FiBookOpen} label="Skills Tracked" value={skillAverages.length} color="#10B981" />
        <StatCard
          icon={FiAward} label="Top Skill" color="#8B5CF6"
          value={topSkill?.skill ?? "—"}
          sub={topSkill ? `Avg ${topSkill.avg} / 5` : null}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>

        {/* Radar */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: 28,
          boxShadow: "0 10px 25px rgba(0,0,0,.08)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <FiBarChart2 color="#2563EB" size={18} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Skill Radar</h3>
          </div>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} outerRadius={100}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#475569" }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <Radar name="Score" dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", color: "#94A3B8", padding: "60px 0", fontSize: 14 }}>
              No skill data yet
            </div>
          )}
        </div>

        {/* Timeline */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: 28,
          boxShadow: "0 10px 25px rgba(0,0,0,.08)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <FiTrendingUp color="#10B981" size={18} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Progress Over Time</h3>
          </div>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }}
                  formatter={(v) => [`${v} / 5`, "Avg Rating"]}
                />
                <Line
                  type="monotone" dataKey="avg" stroke="#10B981"
                  strokeWidth={3} dot={{ r: 5, fill: "#10B981" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", color: "#94A3B8", padding: "60px 0", fontSize: 14 }}>
              Not enough data for timeline
            </div>
          )}
        </div>
      </div>

      {/* Skill Breakdown Table */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: 28,
        boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 28
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <FiBarChart2 color="#2563EB" size={18} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Skill Breakdown</h3>
        </div>
        {skillAverages.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Skill", "Observations", "Average Rating", "Progress"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "12px 16px", fontSize: 12,
                      fontWeight: 600, color: "#64748B", textTransform: "uppercase",
                      letterSpacing: "0.05em", borderBottom: "1px solid #E2E8F0"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skillAverages.map(({ skill, avg, count }, i) => (
                  <tr key={skill} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: SKILL_COLORS[i % SKILL_COLORS.length]
                        }} />
                        <span style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{skill}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 14 }}>{count}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>{avg}</span>
                        <span style={{ color: "#94A3B8", fontSize: 12 }}>/ 5</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", minWidth: 160 }}>
                      <div style={{ background: "#F1F5F9", borderRadius: 999, height: 8, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 999,
                          width: `${(avg / 5) * 100}%`,
                          background: SKILL_COLORS[i % SKILL_COLORS.length],
                          transition: "width 0.6s ease"
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, display: "block" }}>
                        {Math.round((avg / 5) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#94A3B8", padding: "40px 0", fontSize: 14 }}>
            No skill data available yet.
          </div>
        )}
      </div>

      {/* Recent Observations */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: 28,
        boxShadow: "0 10px 25px rgba(0,0,0,.08)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <FiCalendar color="#F59E0B" size={18} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Recent Observations</h3>
        </div>
        {observations.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {observations.slice(0, 8).map((obs) => (
              <div key={obs.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px", background: "#F8FAFC", borderRadius: 14,
                border: "1px solid #E2E8F0"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: "#EFF6FF",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <FiBookOpen color="#2563EB" size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>
                      {obs.skill_name || obs.skill || "General"}
                    </div>
                    <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 2 }}>
                      {obs.observation_date
                        ? new Date(obs.observation_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                      {obs.notes && ` · ${obs.notes.slice(0, 60)}${obs.notes.length > 60 ? "…" : ""}`}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#FEF9C3", borderRadius: 999, padding: "4px 12px"
                }}>
                  <FiStar size={13} color="#F59E0B" fill="#F59E0B" />
                  <span style={{ fontWeight: 700, color: "#92400E", fontSize: 14 }}>{obs.rating}</span>
                  <span style={{ color: "#A16207", fontSize: 12 }}>/5</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#94A3B8", padding: "40px 0", fontSize: 14 }}>
            No observations recorded yet.
          </div>
        )}
      </div>

    </div>
  );
}