import { useEffect, useState } from "react";
import axios from "../api/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  FiDownload, FiBarChart2, FiUsers, FiStar,
  FiTrendingUp, FiBookOpen, FiFilter, FiRefreshCw
} from "react-icons/fi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";


const token = () => localStorage.getItem("access_token");

const PIE_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function Reports() {
  const [children, setChildren] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
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

  // Filtered observations
  const filtered = observations.filter((o) => {
    const matchChild = selectedChild ? String(o.child_id) === selectedChild : true;
    const d = new Date(o.observation_date || o.created_at);
    const matchFrom = dateFrom ? d >= new Date(dateFrom) : true;
    const matchTo = dateTo ? d <= new Date(dateTo) : true;
    return matchChild && matchFrom && matchTo;
  });

  // Skill distribution for pie
  const skillCount = {};
  filtered.forEach((o) => {
    const s = o.skill_name || o.skill || "General";
    skillCount[s] = (skillCount[s] || 0) + 1;
  });
  const pieData = Object.entries(skillCount).map(([name, value]) => ({ name, value }));

  // Rating distribution bar
  const ratingDist = [1, 2, 3, 4, 5].map((r) => ({
    rating: `${r} ★`,
    count: filtered.filter((o) => o.rating === r).length,
  }));

  // Monthly trend
  const monthMap = {};
  filtered.forEach((o) => {
    const d = new Date(o.observation_date || o.created_at);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[k]) monthMap[k] = { month: k, total: 0, count: 0 };
    monthMap[k].total += o.rating;
    monthMap[k].count += 1;
  });
  const trendData = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({ month: m.month, avg: parseFloat((m.total / m.count).toFixed(2)) }));

  const overallAvg = filtered.length
    ? (filtered.reduce((s, o) => s + o.rating, 0) / filtered.length).toFixed(2)
    : "N/A";

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Skill Observation Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.autoTable({
      startY: 38,
      head: [["Child", "Skill", "Rating", "Date", "Notes"]],
      body: filtered.map((o) => [
        o.child_name || o.child_id,
        o.skill_name || o.skill || "General",
        `${o.rating}/5`,
        o.observation_date ? new Date(o.observation_date).toLocaleDateString() : "—",
        o.notes || "",
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] },
    });
    doc.save("observation-report.pdf");
  };

  const StatCard = ({ icon: Icon, label, value, color = "#2563EB" }) => (
    <div style={{
      background: "#fff", borderRadius: 20, padding: "24px 28px",
      boxShadow: "0 10px 25px rgba(0,0,0,.08)", display: "flex",
      alignItems: "center", gap: 20, flex: "1 1 180px"
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#0F172A" }}>{value}</div>
        <div style={{ fontSize: 13, color: "#64748B", marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "4px solid #E2E8F0", borderTop: "4px solid #2563EB", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: "#64748B" }}>Loading reports…</div>
      </div>
    </div>
  );

  return (
    <div style={{marginLeft: "260px", padding: "30px", fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A" }}>Reports</h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>Analytics and export for all observations</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={fetchAll}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
            background: "#fff", cursor:"pointer", transition:"all .25s ease", border: "1px solid #E2E8F0", borderRadius: 12,
            fontSize: 14, fontWeight: 500, color: "#475569", cursor: "pointer"
          }}>
            <FiRefreshCw size={15} /> Refresh
          </button>
          <button onClick={exportPDF} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 22px",
            background: "#2563EB", border: "none", borderRadius: 12,
            fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,.3)"
          }}>
            <FiDownload size={15} /> Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: "20px 28px",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 28,
        display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end"
      }}>
        <FiFilter size={18} color="#64748B" style={{ marginBottom: 2 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Child</label>
          <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}
            style={{ padding: "8px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 14, color: "#0F172A", background: "#F8FAFC", outline: "none" }}>
            <option value="">All Children</option>
            {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            style={{ padding: "8px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 14, color: "#0F172A", background: "#F8FAFC", outline: "none" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            style={{ padding: "8px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 14, color: "#0F172A", background: "#F8FAFC", outline: "none" }} />
        </div>
        {(selectedChild || dateFrom || dateTo) && (
          <button onClick={() => { setSelectedChild(""); setDateFrom(""); setDateTo(""); }}
            style={{ padding: "8px 16px", background: "#FEF2F2", border: "none", borderRadius: 10, fontSize: 13, color: "#EF4444", cursor: "pointer", fontWeight: 600 }}>
            Clear
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon={FiBookOpen} label="Total Observations" value={filtered.length} color="#2563EB" />
        <StatCard icon={FiStar} label="Average Rating" value={overallAvg !== "N/A" ? `${overallAvg} / 5` : "N/A"} color="#F59E0B" />
        <StatCard icon={FiUsers} label="Children" value={[...new Set(filtered.map((o) => o.child_id))].length} color="#10B981" />
        <StatCard icon={FiBarChart2} label="Skills" value={Object.keys(skillCount).length} color="#8B5CF6" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>

        {/* Rating Distribution */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <FiBarChart2 color="#2563EB" size={18} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Rating Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ratingDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="rating" tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }} />
              <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Distribution Pie */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <FiBookOpen color="#10B981" size={18} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Skill Distribution</h3>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", color: "#94A3B8", padding: "80px 0", fontSize: 14 }}>No data</div>
          )}
        </div>
      </div>

      {/* Trend */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <FiTrendingUp color="#F59E0B" size={18} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Monthly Average Trend</h3>
        </div>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }} formatter={(v) => [`${v} / 5`, "Avg"]} />
              <Line type="monotone" dataKey="avg" stroke="#F59E0B" strokeWidth={3} dot={{ r: 5, fill: "#F59E0B" }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", color: "#94A3B8", padding: "50px 0", fontSize: 14 }}>Not enough data</div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Observation Records</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Child", "Skill", "Rating", "Teacher", "Date", "Notes"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E2E8F0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{o.child_name || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#475569", fontSize: 14 }}>{o.skill_name || o.skill || "General"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: "#FEF9C3", color: "#92400E", fontWeight: 700, fontSize: 13, padding: "3px 10px", borderRadius: 999 }}>{o.rating}/5</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 14 }}>{o.teacher_name || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 14 }}>{o.observation_date ? new Date(o.observation_date).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#94A3B8", fontSize: 13, maxWidth: 200 }}>{o.notes ? o.notes.slice(0, 60) + (o.notes.length > 60 ? "…" : "") : "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 14 }}>No records match your filters.</td></tr>
              )}
            </tbody>
          </table>
          {filtered.length > 50 && (
            <div style={{ textAlign: "center", padding: "12px 0", color: "#64748B", fontSize: 13 }}>
              Showing 50 of {filtered.length} records. Export PDF to view all.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}