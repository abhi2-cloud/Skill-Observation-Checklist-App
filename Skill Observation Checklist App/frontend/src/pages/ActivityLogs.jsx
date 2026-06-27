import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  FiActivity, FiSearch, FiFilter, FiRefreshCw,
  FiLogIn, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiInfo
} from "react-icons/fi";


const token = () => localStorage.getItem("access_token");

const ACTION_CONFIG = {
  login:    { color: "#10B981", bg: "#ECFDF5", icon: FiLogIn,  label: "Login" },
  logout:   { color: "#64748B", bg: "#F1F5F9", icon: FiLogOut, label: "Logout" },
  create:   { color: "#2563EB", bg: "#EFF6FF", icon: FiPlus,   label: "Create" },
  update:   { color: "#F59E0B", bg: "#FFFBEB", icon: FiEdit2,  label: "Update" },
  delete:   { color: "#EF4444", bg: "#FEF2F2", icon: FiTrash2, label: "Delete" },
  default:  { color: "#8B5CF6", bg: "#F5F3FF", icon: FiInfo,   label: "Activity" },
};

const getConfig = (action = "") => {
  const k = action.toLowerCase();
  return ACTION_CONFIG[k] || ACTION_CONFIG.default;
};

const PAGE_SIZE = 20;

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/activity-logs/`, { headers: { Authorization: `Bearer ${token()}` } });
      setLogs(res.data);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter ? l.action?.toLowerCase() === actionFilter : true;
    return matchSearch && matchAction;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const uniqueActions = [...new Set(logs.map((l) => l.action?.toLowerCase()).filter(Boolean))];

  // Summary counts
  const summaryCounts = {};
  logs.forEach((l) => {
    const k = l.action?.toLowerCase() || "other";
    summaryCounts[k] = (summaryCounts[k] || 0) + 1;
  });

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "4px solid #E2E8F0", borderTop: "4px solid #2563EB", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: "#64748B" }}>Loading logs…</div>
      </div>
    </div>
  );

  return (
    <div style={{marginLeft: "260px", padding: "30px", fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A" }}>Activity Logs</h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>System activity and audit trail</p>
        </div>
        <button onClick={fetchLogs} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
          background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12,
          fontSize: 14, fontWeight: 500, color: "#475569", cursor: "pointer"
        }}>
          <FiRefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        {Object.entries(ACTION_CONFIG).filter(([k]) => k !== "default").map(([k, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div
             key={k}
             onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
             }}
             onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
             }}
             style={{
              background: "#fff", borderRadius: 18, padding: "18px 22px",
              boxShadow: "0 10px 25px rgba(0,0,0,.08)", display: "flex",
              alignItems: "center", gap: 14, flex: "1 1 120px",
              cursor: "pointer", border: actionFilter === k ? `2px solid ${cfg.color}` : "2px solid transparent",
              transition: "border 0.2s"
            }} onClick={() => setActionFilter(actionFilter === k ? "" : k)}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} color={cfg.color} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>{summaryCounts[k] || 0}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{cfg.label}s</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: "14px 20px",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
          <FiSearch size={16} color="#94A3B8" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search logs…"
            style={{ border: "none", outline: "none", fontSize: 14, color: "#0F172A", background: "transparent", flex: 1 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FiFilter size={15} color="#94A3B8" />
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            style={{ padding: "6px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 14, color: "#0F172A", background: "#F8FAFC", outline: "none" }}>
            <option value="">All Actions</option>
            {uniqueActions.map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
          </select>
        </div>
        {(search || actionFilter) && (
          <button onClick={() => { setSearch(""); setActionFilter(""); setPage(1); }}
            style={{ padding: "6px 14px", background: "#FEF2F2", border: "none", borderRadius: 10, fontSize: 13, color: "#EF4444", cursor: "pointer", fontWeight: 600 }}>
            Clear
          </button>
        )}
        <div style={{ color: "#94A3B8", fontSize: 13, marginLeft: "auto" }}>
          {filtered.length} records
        </div>
      </div>

      {/* Log Table */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 24 }}>
        {paginated.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
            <FiActivity size={40} color="#CBD5E1" />
            <p style={{ marginTop: 12, fontSize: 14 }}>No activity logs found.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {paginated.map((log) => {
              const cfg = getConfig(log.action);
              const Icon = cfg.icon;
              return (
                <div
                 key={log.id}
                 onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                 }}
                 onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                 }}
                 style={{
                  display: "flex", alignItems: "flex-start", gap: 16,
                  padding: "14px 16px", borderRadius: 14, background: "#F8FAFC",
                  border: "1px solid #E2E8F0"
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 14 }}>{log.user_name || "System"}</span>
                      <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 999, textTransform: "capitalize" }}>
                        {log.action}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: "#475569", fontSize: 13, lineHeight: 1.5 }}>
                      {log.description || log.details || "No details available."}
                    </p>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    {log.created_at && (
                      <div style={{ color: "#94A3B8", fontSize: 12 }}>
                        {new Date(log.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </div>
                    )}
                    {log.created_at && (
                      <div style={{ color: "#CBD5E1", fontSize: 11, marginTop: 2 }}>
                        {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: "8px 16px", background: page === 1 ? "#F1F5F9" : "#fff", border: "1px solid #E2E8F0", borderRadius: 10, cursor: page === 1 ? "not-allowed" : "pointer", color: "#475569", fontSize: 14 }}>
            Prev
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
            return p;
          }).filter((p, i, arr) => arr.indexOf(p) === i).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              style={{ padding: "8px 14px", background: p === page ? "#2563EB" : "#fff", border: `1px solid ${p === page ? "#2563EB" : "#E2E8F0"}`, borderRadius: 10, cursor: "pointer", color: p === page ? "#fff" : "#475569", fontWeight: p === page ? 700 : 400, fontSize: 14 }}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: "8px 16px", background: page === totalPages ? "#F1F5F9" : "#fff", border: "1px solid #E2E8F0", borderRadius: 10, cursor: page === totalPages ? "not-allowed" : "pointer", color: "#475569", fontSize: 14 }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}