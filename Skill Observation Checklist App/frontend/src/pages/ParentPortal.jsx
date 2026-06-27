import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  FiUser, FiStar, FiBookOpen, FiCalendar,
  FiTrendingUp, FiFileText, FiMessageSquare
} from "react-icons/fi";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";


const token = () => localStorage.getItem("access_token");

export default function ParentPortal() {
  const [childData, setChildData] = useState(null);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = localStorage.getItem("user_name") || "";
  const userEmail = localStorage.getItem("user_email") || "";

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token()}` };
      const [childRes, obsRes] = await Promise.all([
        axios.get(`/api/parent/child/`, { headers: h }),
        axios.get(`/api/parent/observations/`, { headers: h }),
      ]);
      setChildData(childRes.data);
      setObservations(Array.isArray(obsRes.data) ? obsRes.data : [obsRes.data].filter(Boolean));
    } catch { /* silent */ } finally { setLoading(false); }
  };

  // Skill radar
  const skillMap = {};
  observations.forEach((o) => {
    const s = o.skill_name || o.skill || "General";
    if (!skillMap[s]) skillMap[s] = { total: 0, count: 0 };
    skillMap[s].total += o.rating;
    skillMap[s].count += 1;
  });
  const radarData = Object.entries(skillMap).map(([subject, { total, count }]) => ({
    subject, score: parseFloat((total / count).toFixed(2)), fullMark: 5
  }));

  // Timeline
  const monthMap = {};
  observations.forEach((o) => {
    const d = new Date(o.observation_date || o.created_at);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[k]) monthMap[k] = { month: k, total: 0, count: 0 };
    monthMap[k].total += o.rating;
    monthMap[k].count += 1;
  });
  const trendData = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({ month: m.month, avg: parseFloat((m.total / m.count).toFixed(2)) }));

  const overallAvg = observations.length
    ? (observations.reduce((s, o) => s + o.rating, 0) / observations.length).toFixed(2)
    : "N/A";

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "4px solid #E2E8F0", borderTop: "4px solid #2563EB", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: "#64748B" }}>Loading your child's progress…</div>
      </div>
    </div>
  );

  return (
    <div style={{ marginLeft: "260px", padding: "30px", fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
        borderRadius: 24, padding: "32px 36px", marginBottom: 28,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20
      }}>
        <div>
          <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.75)", fontSize: 14 }}>Welcome back,</p>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#fff" }}>{userName || "Parent"}</h1>
          <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{userEmail}</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 18, padding: "16px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{overallAvg !== "N/A" ? overallAvg : "—"}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 }}>Overall Average / 5</div>
        </div>
      </div>
      

      {/* Child Info Card */}
      {childData && (
        <div style={{
          background: "#fff", borderRadius: 20, padding: 28,
          boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 28,
          display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap"
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            color: `hsl(${(childData.id * 47) % 360}, 50%, 35%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, fontWeight: 800, color: `hsl(${(childData.id * 47) % 360}, 50%, 35%)`
          }}>
            {childData.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#0F172A" }}>{childData.name}</h2>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { label: "Age", value: childData.age ? `${childData.age} years` : "—" },
                { label: "Classroom", value: childData.classroom || "—" },
                { label: "Gender", value: childData.gender || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#475569", marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { icon: FiBookOpen, label: "Observations", value: observations.length, color: "#2563EB" },
              { icon: FiStar, label: "Avg Rating", value: overallAvg !== "N/A" ? `${overallAvg}/5` : "—", color: "#F59E0B" },
              { icon: FiTrendingUp, label: "Skills", value: radarData.length, color: "#10B981" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
               key={label}
               onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
               }}
               onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
               }}
                style={{ textAlign: "center", background: "#F8FAFC", borderRadius: 16, padding: "16px 20px" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{value}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>

        {/* Progress Trend */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <FiTrendingUp color="#10B981" size={18} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Progress Over Time</h3>
          </div>
          {trendData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }} formatter={(v) => [`${v} / 5`, "Avg Rating"]} />
                <Line type="monotone" dataKey="avg" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: "#10B981" }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", color: "#94A3B8", padding: "60px 0", fontSize: 14 }}>More observations needed for trend</div>
          )}
        </div>

        {/* Skill Radar */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <FiBookOpen color="#2563EB" size={18} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Skill Profile</h3>
          </div>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} outerRadius={85}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#475569" }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9, fill: "#94A3B8" }} />
                <Radar name="Score" dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", color: "#94A3B8", padding: "60px 0", fontSize: 14 }}>No skill data yet</div>
          )}
        </div>
      </div>

      {/* Recent Observations */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <FiCalendar color="#F59E0B" size={18} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Teacher Observations</h3>
        </div>
        {observations.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {observations.slice(0, 10).map((obs) => (
              <div
               key={obs.id}
               onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
               }}
               onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
               }}
                style={{
                background: "#F8FAFC", borderRadius: 14, padding: "16px 20px",
                border: "1px solid #E2E8F0", display: "flex", alignItems: "flex-start", gap: 16
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FiMessageSquare color="#2563EB" size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 14 }}>{obs.skill_name || obs.skill || "General"}</span>
                    {obs.teacher_name && (
                      <span style={{ color: "#64748B", fontSize: 13 }}>by {obs.teacher_name}</span>
                    )}
                  </div>
                  {obs.notes && <p style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.5 }}>{obs.notes}</p>}
                  {obs.observation_date && (
                    <p style={{ margin: "8px 0 0", color: "#94A3B8", fontSize: 12 }}>
                      {new Date(obs.observation_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
                <div style={{ background: "#FEF9C3", borderRadius: 999, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
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