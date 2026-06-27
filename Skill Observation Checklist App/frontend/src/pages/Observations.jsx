import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  FiBookOpen, FiStar, FiUser, FiCalendar,
  FiFileText, FiCheck, FiArrowLeft, FiAlertCircle
} from "react-icons/fi";


const token = () => localStorage.getItem("access_token");

const RATING_LABELS = { 1: "Poor", 2: "Below Average", 3: "Average", 4: "Good", 5: "Excellent" };
const RATING_COLORS = { 1: "#EF4444", 2: "#F97316", 3: "#F59E0B", 4: "#10B981", 5: "#2563EB" };
const Field = ({ label, children }) => (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
export default function Observations() {
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [skills] = useState([
    { id: 1, name: "Communication" },
    { id: 2, name: "Speaking" },
    { id: 3, name: "Drawing" },
    { id: 4, name: "Counting" },
    { id: 5, name: "Running" },
    { id: 6, name: "Writing" },
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    child_id: "",
    teacher_id: String(localStorage.getItem("user_id") || ""),
    skill: "",
    rating: 0,
    notes: "",
    observation_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const h = {
        Authorization: `Bearer ${token()}`
      };

      const cRes = await axios.get("/api/children/", {
        headers: h
      });

      setChildren(cRes.data);

    } catch {
      setError("Failed to load children.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.child_id || !form.skill || !form.rating) {
      setError("Child, skill, and rating are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await axios.post(`/api/observations/`, form, { headers: { Authorization: `Bearer ${token()}` } });
      setSuccess(true);
      setTimeout(() => navigate("/observation-list"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save observation.");
    } finally { setSubmitting(false); }
  };

  

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "4px solid #E2E8F0", borderTop: "4px solid #2563EB", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: "#64748B" }}>Loading form…</div>
      </div>
    </div>
  );

  if (success) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <FiCheck size={36} color="#10B981" />
        </div>
        <h2 style={{ color: "#0F172A", marginBottom: 8 }}>Observation Saved</h2>
        <p style={{ color: "#64748B", fontSize: 15 }}>Redirecting to observation list…</p>
      </div>
    </div>
  );

  return (
    <div style={{marginLeft:"260px", padding: "30px", fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <button onClick={() => navigate("/dashboard")} style={{
          background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12,
          padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center",
          gap: 8, color: "#475569", fontSize: 14, fontWeight: 500
        }}>
          <FiArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A" }}>Record Observation</h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>Document a child's skill performance</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: "14px 18px", marginBottom: 24, color: "#DC2626", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <FiAlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Child & Skill */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <FiUser color="#2563EB" size={18} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Child & Skill</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Field label="Child *">
                <select value={form.child_id} onChange={(e) => setForm({ ...form, child_id: e.target.value })} style={selectStyle}>
                  <option value="">Select a child…</option>
                  {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Skill *">
                <select
                  value={form.skill}
                  onChange={(e) =>
                    setForm({
                    ...form,
                    skill: e.target.value
                    })
                  }
                  style={selectStyle}
                >
                  <option value="">Select a skill…</option>

                  {skills.map((s) => (
                    <option
                      key={s.id}
                      value={s.name}
                    >
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Rating */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <FiStar color="#F59E0B" size={18} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Rating *</h3>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} onClick={() => setForm({ ...form, rating: r })} style={{
                  flex: 1, padding: "16px 8px", borderRadius: 14, cursor: "pointer",
                  border: `2px solid ${form.rating === r ? RATING_COLORS[r] : "#E2E8F0"}`,
                  background: form.rating === r ? `${RATING_COLORS[r]}12` : "#F8FAFC",
                  transition: "all 0.2s", textAlign: "center"
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{"⭐".repeat(r)}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: form.rating === r ? RATING_COLORS[r] : "#94A3B8" }}>
                    {r} — {RATING_LABELS[r]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes & Date */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <FiFileText color="#10B981" size={18} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Notes & Date</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Observation Date">
                <div style={{ position: "relative" }}>
                  <FiCalendar size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="date" value={form.observation_date}
                    onChange={(e) => setForm({ ...form, observation_date: e.target.value })}
                    style={{ ...selectStyle, paddingLeft: 40 }} />
                </div>
              </Field>
              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Add observation notes, comments, or observations about the child's performance…"
                  rows={5} style={{ ...selectStyle, resize: "vertical", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }} />
              </Field>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleSubmit} disabled={submitting} style={{
              flex: 1, padding: "14px 24px", background: "#2563EB", border: "none",
              borderRadius: 14, fontSize: 15, fontWeight: 700, color: "#fff",
              cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
              boxShadow: "0 6px 20px rgba(37,99,235,.3)", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 10
            }}>
              <FiCheck size={18} /> {submitting ? "Saving…" : "Save Observation"}
            </button>
            <button onClick={() => navigate("/dashboard")} style={{
              padding: "14px 24px", background: "#F1F5F9", border: "none",
              borderRadius: 14, fontSize: 15, fontWeight: 600, color: "#475569", cursor: "pointer"
            }}>Cancel</button>
          </div>
        </div>

        {/* Preview Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)", position: "sticky", top: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Preview</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Child", value: children.find((c) => String(c.id) === String(form.child_id))?.name || "—", icon: FiUser },
              { label: "Skill", value: form.skill || "—", icon: FiBookOpen},
              { label: "Date", value: form.observation_date || "—", icon: FiCalendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#F8FAFC", borderRadius: 12 }}>
                <Icon size={16} color="#64748B" />
                <div>
                  <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginTop: 2 }}>{value}</div>
                </div>
              </div>
            ))}
            {form.rating > 0 && (
              <div style={{ padding: "14px", background: `${RATING_COLORS[form.rating]}10`, borderRadius: 12, border: `1px solid ${RATING_COLORS[form.rating]}30`, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{"⭐".repeat(form.rating)}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: RATING_COLORS[form.rating] }}>
                  {form.rating} / 5 — {RATING_LABELS[form.rating]}
                </div>
              </div>
            )}
            {form.notes && (
              <div style={{ padding: "12px 14px", background: "#F8FAFC", borderRadius: 12, borderLeft: "3px solid #2563EB" }}>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Notes</div>
                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{form.notes.slice(0, 120)}{form.notes.length > 120 ? "…" : ""}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const selectStyle = {
  width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0",
  borderRadius: 12, fontSize: 14, color: "#0F172A",
  background: "#F8FAFC", outline: "none", boxSizing: "border-box",
  fontFamily: "'Inter', sans-serif"
};