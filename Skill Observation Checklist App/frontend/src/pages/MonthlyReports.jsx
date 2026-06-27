import { useEffect, useState } from "react";
import axios from "../api/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  FiCalendar, FiDownload, FiBarChart2, FiStar,
  FiUsers, FiChevronLeft, FiChevronRight, FiBookOpen
} from "react-icons/fi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";


const token = () => localStorage.getItem("access_token");

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"];

export default function MonthlyReports() {
  const [observations, setObservations] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token()}` };
      const [oRes, cRes] = await Promise.all([
        axios.get("/api/observations/", { headers: h }),
        axios.get("/api/children/", { headers: h }),
      ]);
      setObservations(oRes.data);
      setChildren(cRes.data);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const monthlyObs = observations.filter((o) => {
    const d = new Date(o.observation_date || o.created_at);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const skillMap = {};
  monthlyObs.forEach((o) => {
    const s = o.skill_name || o.skill || "General";
    if (!skillMap[s]) skillMap[s] = { total: 0, count: 0 };
    skillMap[s].total += o.rating;
    skillMap[s].count += 1;
  });
  const skillData = Object.entries(skillMap).map(([skill, { total, count }]) => ({
    skill, avg: parseFloat((total / count).toFixed(2)), count
  }));

  // Child summary for table
  const childSummary = children.map((c) => {
    const obs = monthlyObs.filter((o) => String(o.child_id) === String(c.id));
    const avg = obs.length ? parseFloat((obs.reduce((s, o) => s + o.rating, 0) / obs.length).toFixed(2)) : null;
    return { ...c, obs: obs.length, avg };
  }).filter((c) => c.obs > 0).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));

  const overallAvg = monthlyObs.length
    ? (monthlyObs.reduce((s, o) => s + o.rating, 0) / monthlyObs.length).toFixed(2)
    : "N/A";

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Monthly Report — ${MONTHS[selectedMonth]} ${selectedYear}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Total Observations: ${monthlyObs.length}  |  Average: ${overallAvg}/5`, 14, 30);
    doc.autoTable({
      startY: 38,
      head: [["Child", "Observations", "Average Rating"]],
      body: childSummary.map((c) => [c.name, c.obs, c.avg !== null ? `${c.avg}/5` : "—"]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] },
    });
    doc.save(`report-${MONTHS[selectedMonth]}-${selectedYear}.pdf`);
  };

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
    <div style={{marginLeft:"260px", padding: "30px", fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A" }}>Monthly Reports</h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>Observation summaries by month</p>
        </div>
        <button onClick={exportPDF} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 22px",
          background: "#2563EB", border: "none", borderRadius: 12,
          fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(37,99,235,.3)"
        }}>
          <FiDownload size={15} /> Export PDF
        </button>
      </div>

      {/* Month Selector */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: "20px 28px",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 28,
        display: "flex", alignItems: "center", gap: 20
      }}>
        <FiCalendar color="#2563EB" size={20} />
        <button onClick={prevMonth} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: "#475569", display: "flex", alignItems: "center" }}>
          <FiChevronLeft size={18} />
        </button>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", minWidth: 200, textAlign: "center" }}>
          {MONTHS[selectedMonth]} {selectedYear}
        </div>
        <button onClick={nextMonth} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: "#475569", display: "flex", alignItems: "center" }}>
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
        {[
          { icon: FiBookOpen, label: "Observations", value: monthlyObs.length, color: "#2563EB" },
          { icon: FiStar, label: "Average Rating", value: overallAvg !== "N/A" ? `${overallAvg} / 5` : "N/A", color: "#F59E0B" },
          { icon: FiUsers, label: "Active Children", value: childSummary.length, color: "#10B981" },
          { icon: FiBarChart2, label: "Skills Covered", value: skillData.length, color: "#8B5CF6" },
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
            background: "#fff", borderRadius: 20, padding: "22px 26px",
            boxShadow: "0 10px 25px rgba(0,0,0,.08)", display: "flex",
            alignItems: "center", gap: 18, flex: "1 1 180px"
          }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>{value}</div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {monthlyObs.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 20, padding: "60px 0", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
          <FiCalendar size={48} color="#CBD5E1" />
          <p style={{ color: "#94A3B8", marginTop: 16, fontSize: 15 }}>No observations recorded for {MONTHS[selectedMonth]} {selectedYear}.</p>
        </div>
      ) : (
        <>
          {/* Skill Chart */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <FiBarChart2 color="#2563EB" size={18} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Skill Averages This Month</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={skillData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="skill" tick={{ fontSize: 12, fill: "#94A3B8" }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "#94A3B8" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }} formatter={(v) => [`${v} / 5`, "Avg"]} />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                  {skillData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Child Summary Table */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Child Summary</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["#", "Child", "Classroom", "Observations", "Average", "Progress"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E2E8F0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {childSummary.map((child, i) => (
                    <tr key={child.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px 16px", color: "#94A3B8", fontSize: 14, fontWeight: 600 }}>#{i + 1}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            color: `hsl(${(child.id * 47) % 360}, 50%, 35%)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 13, color: `hsl(${(child.id * 47) % 360}, 50%, 35%)`
                          }}>{child.name?.[0]?.toUpperCase()}</div>
                          <span style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{child.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#475569", fontSize: 14 }}>{child.classroom || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 14 }}>{child.obs}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>{child.avg ?? "—"}</span>
                        {child.avg !== null && <span style={{ color: "#94A3B8", fontSize: 12 }}>/5</span>}
                      </td>
                      <td style={{ padding: "12px 16px", minWidth: 140 }}>
                        {child.avg !== null && (
                          <>
                            <div style={{ background: "#F1F5F9", borderRadius: 999, height: 8, overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: 999, width: `${(child.avg / 5) * 100}%`, background: "#2563EB", transition: "width 0.6s ease" }} />
                            </div>
                            <span style={{ fontSize: 11, color: "#94A3B8", marginTop: 3, display: "block" }}>{Math.round((child.avg / 5) * 100)}%</span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}