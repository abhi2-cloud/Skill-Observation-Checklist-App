import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  FiTrendingUp, FiAward, FiUsers, FiStar,
  FiSearch, FiBarChart2
} from "react-icons/fi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";


const token = () => localStorage.getItem("access_token");

const RANK_COLORS = ["#F59E0B", "#94A3B8", "#CD7C2F"];
const BAR_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"];

export default function Progress() {
  const [children, setChildren] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token()}` };
      const [cRes, oRes] = await Promise.all([
        axios.get("/api/children/", { headers: h }),
        axios.get("/api/observations/", { headers: h }),
      ]);
      setChildren(cRes.data);
      setObservations(oRes.data);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  // Build child progress data
  const childProgress = children.map((child) => {
    const obs = observations.filter((o) => o.child_id === child.id || String(o.child_id) === String(child.id));
    const avg = obs.length ? parseFloat((obs.reduce((s, o) => s + o.rating, 0) / obs.length).toFixed(2)) : 0;
    return { ...child, avg, obsCount: obs.length };
  }).sort((a, b) => b.avg - a.avg);

  const filtered = childProgress.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.classroom?.toLowerCase().includes(search.toLowerCase())
  );

  const barData = filtered.slice(0, 10).map((c) => ({ name: c.name.split(" ")[0], avg: c.avg }));

  const overallAvg = childProgress.length
    ? (childProgress.reduce((s, c) => s + c.avg, 0) / childProgress.length).toFixed(2)
    : "N/A";

  const topChild = childProgress[0];

  const RankBadge = ({ rank }) => {
    if (rank > 3) return <span style={{ fontWeight: 700, color: "#64748B", fontSize: 15 }}>#{rank}</span>;
    const medals = ["🥇", "🥈", "🥉"];
    return <span style={{ fontSize: 20 }}>{medals[rank - 1]}</span>;
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "4px solid #E2E8F0", borderTop: "4px solid #2563EB", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: "#64748B" }}>Loading progress…</div>
      </div>
    </div>
  );

  return (
    <div style={{ marginLeft: "260px", padding: "30px", fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A" }}>Progress Overview</h1>
        <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>Rankings and average ratings across all children</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
        {[
          { icon: FiUsers, label: "Total Children", value: children.length, color: "#2563EB" },
          { icon: FiStar, label: "Overall Average", value: overallAvg !== "N/A" ? `${overallAvg} / 5` : "N/A", color: "#F59E0B" },
          { icon: FiAward, label: "Top Performer", value: topChild?.name?.split(" ")[0] ?? "—", color: "#10B981" },
          { icon: FiBarChart2, label: "Total Observations", value: observations.length, color: "#8B5CF6" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div 
          key={label}
          onMouseEnter={(e)=>{
            e.currentTarget.style.transform="translateY(-4px)";
          }}
          onMouseLeave={(e)=>{
            e.currentTarget.style.transform="translateY(0)";
          }}
  
           style={{
            background: "#fff", borderRadius: 20, padding: "24px 28px",
            boxShadow: "0 10px 25px rgba(0,0,0,.08)", display: "flex",
            alignItems: "center", gap: 20, flex: "1 1 180px"
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={24} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>{value}</div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
      

      {/* Bar Chart */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <FiTrendingUp color="#2563EB" size={18} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Top 10 Performers</h3>
        </div>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }} formatter={(v) => [`${v} / 5`, "Avg Rating"]} />
              <Bar dataKey="avg" radius={[8, 8, 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", color: "#94A3B8", padding: "60px 0", fontSize: 14 }}>No data available</div>
        )}
      </div>

      {/* Rankings Table */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Rankings</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "8px 16px" }}>
            <FiSearch size={16} color="#94A3B8" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search children…"
              style={{ border: "none", outline: "none", fontSize: 14, color: "#0F172A", background: "transparent", width: 180 }} />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Rank", "Child", "Class", "Observations", "Average Rating", "Progress"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E2E8F0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((child, i) => {
                const rank = childProgress.findIndex((c) => c.id === child.id) + 1;
                return (
                  <tr key={child.id} style={{ borderBottom: "1px solid #F1F5F9", background: rank <= 3 ? `${RANK_COLORS[rank - 1]}08` : "transparent" }}>
                    <td style={{ padding: "14px 16px" }}><RankBadge rank={rank} /></td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          color: `hsl(${(child.id * 47) % 360}, 50%, 35%)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 14, color: `hsl(${(child.id * 47) % 360}, 50%, 35%)`
                        }}>
                          {child.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{child.name}</div>
                          <div style={{ color: "#94A3B8", fontSize: 12 }}>{child.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#475569", fontSize: 14 }}>{child.classroom || "—"}</td>
                    <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 14 }}>{child.obsCount}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FiStar size={13} color="#F59E0B" fill={child.avg > 0 ? "#F59E0B" : "none"} />
                        <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>{child.avg || "—"}</span>
                        {child.avg > 0 && <span style={{ color: "#94A3B8", fontSize: 12 }}>/5</span>}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", minWidth: 140 }}>
                      <div style={{ background: "#F1F5F9", borderRadius: 999, height: 8, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 999, width: `${(child.avg / 5) * 100}%`,
                          background: rank === 1 ? "#F59E0B" : rank === 2 ? "#94A3B8" : rank === 3 ? "#CD7C2F" : "#2563EB",
                          transition: "width 0.6s ease"
                        }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 14 }}>No children found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}