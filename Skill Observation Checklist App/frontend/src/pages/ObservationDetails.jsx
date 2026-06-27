import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  FiArrowLeft, FiEdit2, FiTrash2, FiUser, FiBookOpen,
  FiStar, FiCalendar, FiFileText, FiClock, FiAward,
  FiAlertCircle
} from "react-icons/fi";


const token = () => localStorage.getItem("access_token");

const RATING_CONFIG = {
  1: { label: "Poor",          color: "#EF4444", bg: "#FEF2F2", bar: "#EF4444" },
  2: { label: "Below Average", color: "#F97316", bg: "#FFF7ED", bar: "#F97316" },
  3: { label: "Average",       color: "#F59E0B", bg: "#FFFBEB", bar: "#F59E0B" },
  4: { label: "Good",          color: "#10B981", bg: "#ECFDF5", bar: "#10B981" },
  5: { label: "Excellent",     color: "#2563EB", bg: "#EFF6FF", bar: "#2563EB" },
};

export default function ObservationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [obs, setObs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const userRole = localStorage.getItem("user_role")?.toLowerCase();
  const canEdit = ["admin", "teacher"].includes(userRole);

  useEffect(() => { fetchObservation(); }, [id]);

  const fetchObservation = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/observations/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setObs(res.data);
    } catch {
      setError("Failed to load observation details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this observation? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/observations/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      navigate("/observations/list");
    } catch {
      setError("Failed to delete observation.");
      setDeleting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 44, height: 44, border: "4px solid #E2E8F0",
          borderTop: "4px solid #2563EB", borderRadius: "50%",
          animation: "spin 0.9s linear infinite", margin: "0 auto 16px"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: "#64748B", fontSize: 15 }}>Loading observation…</div>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !obs) return (
    <div style={{marginLeft:"260px", padding: "30px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 16,
        padding: "20px 24px", display: "flex", alignItems: "center", gap: 12, color: "#DC2626"
      }}>
        <FiAlertCircle size={20} />
        <span style={{ fontSize: 15 }}>{error || "Observation not found."}</span>
      </div>
      <button onClick={() => navigate(-1)} style={{
        marginTop: 20, display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px", background: "#fff", border: "1px solid #E2E8F0",
        borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#475569", cursor: "pointer"
      }}>
        <FiArrowLeft size={15} /> Go Back
      </button>
    </div>
  );

  const rc = RATING_CONFIG[obs.rating] || RATING_CONFIG[3];
  const formattedDate = obs.observation_date
    ? new Date(obs.observation_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const createdAt = obs.created_at
    ? new Date(obs.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;
  const updatedAt = obs.updated_at
    ? new Date(obs.updated_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate(-1)} style={{
            background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12,
            padding: "10px 14px", cursor: "pointer", display: "flex",
            alignItems: "center", gap: 8, color: "#475569", fontSize: 14,
            fontWeight: 500, boxShadow: "0 2px 8px rgba(0,0,0,.05)"
          }}>
            <FiArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A" }}>
              Observation Details
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>
              Record #{obs.id}
            </p>
          </div>
        </div>

        {canEdit && (
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => navigate(`/observations/edit/${obs.id}`)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 22px",
              background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12,
              fontSize: 14, fontWeight: 600, color: "#D97706", cursor: "pointer"
            }}>
              <FiEdit2 size={15} /> Edit
            </button>
            <button onClick={handleDelete} disabled={deleting} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 22px",
              background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12,
              fontSize: 14, fontWeight: 600, color: "#DC2626", cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.65 : 1
            }}>
              <FiTrash2 size={15} /> {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* ── Hero Rating Banner ── */}
      <div style={{
        background: `linear-gradient(135deg, ${rc.color} 0%, ${rc.color}CC 100%)`,
        borderRadius: 24, padding: "32px 36px", marginBottom: 28,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 20
      }}>
        <div>
          <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Skill Rating
          </p>
          <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: "#fff" }}>
            {obs.skill_name || obs.skill || "Observation"}
          </h2>
          <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 15 }}>
            {obs.child_name || "Child"} · {formattedDate}
          </p>
        </div>
        <div style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "20px 32px" }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{obs.rating}</div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>out of 5</div>
          <div style={{ marginTop: 12, background: "rgba(255,255,255,0.25)", borderRadius: 999, height: 8, width: 120, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 999, width: `${(obs.rating / 5) * 100}%`, background: "#fff" }} />
          </div>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 700, marginTop: 8 }}>
            {rc.label}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Core Information */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
            <SectionTitle icon={FiBookOpen} color="#2563EB" title="Observation Information" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <InfoItem icon={FiUser} label="Child" value={obs.child_name || "—"} />
              <InfoItem icon={FiAward} label="Skill" value={obs.skill_name || obs.skill || "General"} />
              <InfoItem icon={FiUser} label="Teacher" value={obs.teacher_name || "—"} />
              <InfoItem icon={FiCalendar} label="Observation Date" value={formattedDate} />
            </div>
          </div>

          {/* Rating Detail */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
            <SectionTitle icon={FiStar} color="#F59E0B" title="Rating Breakdown" />
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((r) => {
                const cfg = RATING_CONFIG[r];
                const isSelected = r === obs.rating;
                return (
                  <div key={r} style={{
                    flex: 1, padding: "14px 10px", borderRadius: 14, textAlign: "center",
                    background: isSelected ? cfg.bg : "#F8FAFC",
                    border: `2px solid ${isSelected ? cfg.color : "#E2E8F0"}`,
                    transition: "all 0.2s"
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{"⭐".repeat(r)}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? cfg.color : "#94A3B8" }}>
                      {r}
                    </div>
                    <div style={{ fontSize: 10, color: isSelected ? cfg.color : "#CBD5E1", marginTop: 2 }}>
                      {cfg.label}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: rc.bg,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <FiStar size={22} color={rc.color} fill={rc.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>{rc.label}</span>
                  <span style={{ fontWeight: 800, color: rc.color, fontSize: 15 }}>{obs.rating} / 5</span>
                </div>
                <div style={{ background: "#E2E8F0", borderRadius: 999, height: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 999,
                    width: `${(obs.rating / 5) * 100}%`,
                    background: rc.bar, transition: "width 0.6s ease"
                  }} />
                </div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>
                  {Math.round((obs.rating / 5) * 100)}th percentile
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {obs.notes && (
            <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
              <SectionTitle icon={FiFileText} color="#10B981" title="Teacher Notes" />
              <div style={{
                background: "#F8FAFC", borderRadius: 14, padding: "20px 22px",
                borderLeft: "4px solid #10B981", lineHeight: 1.7,
                color: "#334155", fontSize: 15
              }}>
                {obs.notes}
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Quick Stats */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Quick Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Child", value: obs.child_name || "—", icon: FiUser, color: "#2563EB" },
                { label: "Skill", value: obs.skill_name || obs.skill || "General", icon: FiBookOpen, color: "#10B981" },
                { label: "Rating", value: `${obs.rating} / 5 — ${rc.label}`, icon: FiStar, color: rc.color },
                { label: "Date", value: formattedDate, icon: FiCalendar, color: "#F59E0B" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#F8FAFC", borderRadius: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginTop: 1 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Record Metadata */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Record Info</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <MetaRow label="Record ID" value={`#${obs.id}`} />
              {createdAt && <MetaRow label="Created" value={createdAt} icon={FiClock} />}
              {updatedAt && <MetaRow label="Last Updated" value={updatedAt} icon={FiClock} />}
              {obs.classroom && <MetaRow label="Classroom" value={obs.classroom} />}
            </div>
          </div>

          {/* Action Buttons */}
          {canEdit && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => navigate(`/observations/edit/${obs.id}`)} style={{
                width: "100%", padding: "13px 0", background: "#2563EB", border: "none",
                borderRadius: 14, fontSize: 14, fontWeight: 700, color: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, boxShadow: "0 4px 14px rgba(37,99,235,.3)"
              }}>
                <FiEdit2 size={16} /> Edit Observation
              </button>
              <button onClick={() => navigate(`/children/${obs.child_id}/performance`)} style={{
                width: "100%", padding: "13px 0", background: "#ECFDF5", border: "1px solid #A7F3D0",
                borderRadius: 14, fontSize: 14, fontWeight: 600, color: "#059669",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
                View Child Performance
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{
                width: "100%", padding: "13px 0", background: "#FEF2F2", border: "1px solid #FECACA",
                borderRadius: 14, fontSize: 14, fontWeight: 600, color: "#DC2626",
                cursor: deleting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: deleting ? 0.65 : 1
              }}>
                <FiTrash2 size={15} /> {deleting ? "Deleting…" : "Delete Observation"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, color, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color={color} />
      </div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{title}</h3>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", border: "1px solid #E2E8F0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon size={14} color="#94A3B8" />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{value}</div>
    </div>
  );
}

function MetaRow({ label, value, icon: Icon }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
      <span style={{ fontSize: 13, color: "#64748B" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{value}</span>
    </div>
  );
}