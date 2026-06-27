import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2,
  FiEye, FiStar, FiRefreshCw, FiBookOpen
} from "react-icons/fi";


const token = () => localStorage.getItem("access_token");

const RATING_COLORS = {
  1: { bg: "#FEF2F2", text: "#DC2626" },
  2: { bg: "#FFF7ED", text: "#EA580C" },
  3: { bg: "#FFFBEB", text: "#D97706" },
  4: { bg: "#ECFDF5", text: "#059669" },
  5: { bg: "#EFF6FF", text: "#2563EB" },
};

const PAGE_SIZE = 15;

export default function ObservationList() {
  const navigate = useNavigate();

  const [observations, setObservations] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [childFilter, setChildFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token()}` };
      const [oRes, cRes] = await Promise.all([
        axios.get(`/api/observations/`, { headers: h }),
        axios.get(`/api/children/`, { headers: h }),
      ]);
      setObservations(oRes.data);
      setChildren(cRes.data);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this observation?")) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/observations/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      setObservations((prev) => prev.filter((o) => o.id !== id));
    } catch { /* silent */ } finally { setDeleting(null); }
  };

  const filtered = observations.filter((o) => {
    const matchSearch =
      o.child_name?.toLowerCase().includes(search.toLowerCase()) ||
      (o.skill_name || o.skill)?.toLowerCase().includes(search.toLowerCase()) ||
      o.teacher_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.notes?.toLowerCase().includes(search.toLowerCase());
    const matchChild = childFilter ? String(o.child_id) === childFilter : true;
    const matchRating = ratingFilter ? String(o.rating) === ratingFilter : true;
    return matchSearch && matchChild && matchRating;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const userRole = localStorage.getItem("user_role")?.toLowerCase();
  const canEdit = ["admin", "teacher"].includes(userRole);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "4px solid #E2E8F0", borderTop: "4px solid #2563EB", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: "#64748B" }}>Loading observations…</div>
      </div>
    </div>
  );

  return (
    <div style={{marginLeft:"260px", padding: "30px", fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A" }}>Observations</h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>{observations.length} total records</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={fetchAll} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#475569", cursor: "pointer" }}>
            <FiRefreshCw size={15} /> Refresh
          </button>
          {canEdit && (
            <button onClick={() => navigate("/observations/add")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "#2563EB", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,.3)" }}>
              <FiPlus size={16} /> Add Observation
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 20, padding: "16px 24px", boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
          <FiSearch size={16} color="#94A3B8" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by child, skill, teacher, or notes…"
            style={{ border: "none", outline: "none", fontSize: 14, color: "#0F172A", background: "transparent", flex: 1 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FiFilter size={15} color="#94A3B8" />
          <select value={childFilter} onChange={(e) => { setChildFilter(e.target.value); setPage(1); }}
            style={filterSelectStyle}>
            <option value="">All Children</option>
            {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={ratingFilter} onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
            style={filterSelectStyle}>
            <option value="">Any Rating</option>
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Star{r !== 1 ? "s" : ""}</option>)}
          </select>
        </div>
        {(search || childFilter || ratingFilter) && (
          <button onClick={() => { setSearch(""); setChildFilter(""); setRatingFilter(""); setPage(1); }}
            style={{ padding: "6px 14px", background: "#FEF2F2", border: "none", borderRadius: 10, fontSize: 13, color: "#EF4444", cursor: "pointer", fontWeight: 600 }}>
            Clear
          </button>
        )}
        <div style={{ color: "#94A3B8", fontSize: 13, marginLeft: "auto" }}>{filtered.length} records</div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 24 }}>
        {paginated.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
            <FiBookOpen size={40} color="#CBD5E1" />
            <p style={{ marginTop: 12, fontSize: 14 }}>No observations found.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Child", "Skill", "Rating", "Teacher", "Date", "Notes", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E2E8F0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((obs) => {
                  const rc = RATING_COLORS[obs.rating] || { bg: "#F1F5F9", text: "#475569" };
                  return (
                    <tr key={obs.id} style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, color: `hsl(${((obs.child_id || 0) * 47) % 360}, 50%, 35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: `hsl(${((obs.child_id || 0) * 47) % 360}, 50%, 35%)` }}>
                            {obs.child_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{obs.child_name || "—"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#475569", fontSize: 14 }}>{obs.skill_name || obs.skill || "General"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: rc.bg, color: rc.text, fontWeight: 700, fontSize: 13, padding: "4px 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <FiStar size={11} fill={rc.text} color={rc.text} /> {obs.rating}/5
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 14 }}>{obs.teacher_name || "—"}</td>
                      <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 14 }}>
                        {obs.observation_date ? new Date(obs.observation_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#94A3B8", fontSize: 13, maxWidth: 200 }}>
                        {obs.notes ? obs.notes.slice(0, 55) + (obs.notes.length > 55 ? "…" : "") : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => navigate(`/observations/${obs.id}`)} title="View"
                            style={{ padding: "7px 10px", background: "#EFF6FF", border: "none", borderRadius: 10, cursor: "pointer", color: "#2563EB", display: "flex", alignItems: "center" }}>
                            <FiEye size={15} />
                          </button>
                          {canEdit && (
                            <>
                              <button onClick={() => navigate(`/observations/edit/${obs.id}`)} title="Edit"
                                style={{ padding: "7px 10px", background: "#FFFBEB", border: "none", borderRadius: 10, cursor: "pointer", color: "#D97706", display: "flex", alignItems: "center" }}>
                                <FiEdit2 size={15} />
                              </button>
                              <button onClick={() => handleDelete(obs.id)} disabled={deleting === obs.id} title="Delete"
                                style={{ padding: "7px 10px", background: "#FEF2F2", border: "none", borderRadius: 10, cursor: "pointer", color: "#EF4444", display: "flex", alignItems: "center", opacity: deleting === obs.id ? 0.5 : 1 }}>
                                <FiTrash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: "8px 16px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, cursor: page === 1 ? "not-allowed" : "pointer", color: "#475569", fontSize: 14, opacity: page === 1 ? 0.5 : 1 }}>
            Previous
          </button>
          <span style={{ color: "#64748B", fontSize: 14, padding: "0 12px" }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: "8px 16px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, cursor: page === totalPages ? "not-allowed" : "pointer", color: "#475569", fontSize: 14, opacity: page === totalPages ? 0.5 : 1 }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

const filterSelectStyle = {
  padding: "7px 12px", border: "1px solid #E2E8F0", borderRadius: 10,
  fontSize: 14, color: "#0F172A", background: "#F8FAFC", outline: "none"
};