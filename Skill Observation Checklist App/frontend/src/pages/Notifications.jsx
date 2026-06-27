import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  FiBell, FiPlus, FiTrash2, FiCheckCircle, FiAlertCircle,
  FiInfo, FiX, FiSearch, FiRefreshCw
} from "react-icons/fi";


const token = () => localStorage.getItem("access_token");

const TYPE_CONFIG = {
  info: { color: "#2563EB", bg: "#EFF6FF", icon: FiInfo },
  success: { color: "#10B981", bg: "#ECFDF5", icon: FiCheckCircle },
  warning: { color: "#F59E0B", bg: "#FFFBEB", icon: FiAlertCircle },
  error: { color: "#EF4444", bg: "#FEF2F2", icon: FiAlertCircle },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "info" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/notifications/", { headers: { Authorization: `Bearer ${token()}` } });
      setNotifications(res.data);
    } catch { setError("Failed to load notifications."); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSubmitting(true);
    try {
      await axios.post("/api/notifications/", form, { headers: { Authorization: `Bearer ${token()}` } });
      setForm({ title: "", message: "", type: "info" });
      setShowForm(false);
      fetchNotifications();
    } catch { setError("Failed to create notification."); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await axios.delete(`/api/notifications/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { setError("Failed to delete."); }
  };

  const filtered = notifications.filter((n) =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.message?.toLowerCase().includes(search.toLowerCase())
  );

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={{marginLeft:"260px", padding: "30px", fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A" }}>Notifications</h1>
            {unread > 0 && (
              <span style={{ background: "#EF4444", color: "#fff", fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
                {unread} new
              </span>
            )}
          </div>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>Manage and send notifications</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={fetchNotifications} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
            background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12,
            fontSize: 14, fontWeight: 500, color: "#475569", cursor: "pointer"
          }}>
            <FiRefreshCw size={15} /> Refresh
          </button>
          <button onClick={() => setShowForm((p) => !p)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 22px",
            background: "#2563EB", border: "none", borderRadius: 12,
            fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,.3)"
          }}>
            <FiPlus size={16} /> New Notification
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: "14px 18px", marginBottom: 20, color: "#DC2626", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626" }}><FiX size={16} /></button>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)", transition:"all .25s ease", cursor:"pointer", marginBottom: 28 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Create Notification</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Notification title" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Notification message…" rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "'Inter', sans-serif" }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleSubmit} disabled={submitting} style={{
              padding: "10px 24px", background: "#2563EB", border: "none", borderRadius: 12,
              color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
              opacity: submitting ? 0.7 : 1
            }}>
              {submitting ? "Sending…" : "Send Notification"}
            </button>
            <button onClick={() => setShowForm(false)} style={{
              padding: "10px 20px", background: "#F1F5F9", border: "none", borderRadius: 12,
              color: "#475569", fontWeight: 500, fontSize: 14, cursor: "pointer"
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ background: "#fff", borderRadius: 20, padding: "14px 20px", boxShadow: "0 10px 25px rgba(0,0,0,.08)", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <FiSearch size={18} color="#94A3B8" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notifications…"
          style={{ border: "none", outline: "none", fontSize: 14, color: "#0F172A", background: "transparent", flex: 1 }} />
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748B" }}>
          <div style={{ width: 40, height: 40, border: "4px solid #E2E8F0", borderTop: "4px solid #2563EB", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 20, padding: "60px 0", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
          <FiBell size={48} color="#CBD5E1" />
          <p style={{ color: "#94A3B8", marginTop: 16, fontSize: 15 }}>No notifications found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div key={n.id} 
              onMouseEnter={(e)=>{
                e.currentTarget.style.transform="translateY(-3px)";
              }}
              onMouseLeave={(e)=>{
                e.currentTarget.style.transform="translateY(0)";
              }}style={{
                background: "#fff", borderRadius: 18, padding: "18px 24px",
                boxShadow: "0 4px 16px rgba(0,0,0,.06)",
                borderLeft: `4px solid ${cfg.color}`,
                display: "flex", alignItems: "flex-start", gap: 16,
                opacity: n.is_read ? 0.75 : 1
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: cfg.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <Icon size={20} color={cfg.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>{n.title}</span>
                    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, textTransform: "capitalize" }}>{n.type}</span>
                    {!n.is_read && <span style={{ background: "#DBEAFE", color: "#1D4ED8", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999 }}>New</span>}
                  </div>
                  <p style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.5 }}>{n.message}</p>
                  {n.created_at && (
                    <p style={{ margin: "8px 0 0", color: "#94A3B8", fontSize: 12 }}>
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <button onClick={() => handleDelete(n.id)} style={{
                  background: "#FEF2F2", border: "none", borderRadius: 10,
                  padding: "8px 10px", cursor: "pointer", color: "#EF4444",
                  display: "flex", alignItems: "center"
                }}>
                  <FiTrash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "#64748B", textTransform: "uppercase",
  letterSpacing: "0.05em", marginBottom: 6
};

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0",
  borderRadius: 12, fontSize: 14, color: "#0F172A",
  background: "#F8FAFC", outline: "none", boxSizing: "border-box"
};