import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  FiMail, FiSend, FiUsers, FiUser, FiCheckCircle,
  FiAlertCircle, FiX, FiFileText
} from "react-icons/fi";


const token = () => localStorage.getItem("access_token");

export default function EmailReports() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedChild, setSelectedChild] = useState("");
  const [reportType, setReportType] = useState("monthly");
  const [customEmail, setCustomEmail] = useState("");
  const [sendTo, setSendTo] = useState("parent"); // "parent" | "custom"
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [sentLog, setSentLog] = useState([]);

  useEffect(() => { fetchChildren(); }, []);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/children/", { headers: { Authorization: `Bearer ${token()}` } });
      setChildren(res.data);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const selectedChildData = children.find((c) => String(c.id) === selectedChild);
  const recipientEmail = sendTo === "parent" ? selectedChildData?.parent_email : customEmail;

  const handleSend = async () => {
    if (!selectedChild) { setError("Please select a child."); return; }
    if (!recipientEmail) { setError("Recipient email is required."); return; }
    setSending(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(
        "/api/email/send-report",
        {
          child_id: selectedChild,
          report_type: reportType,
          recipient_email: recipientEmail,
        },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setSuccess(`Report sent successfully to ${recipientEmail}`);
      setSentLog((prev) => [{
        child: selectedChildData?.name,
        email: recipientEmail,
        type: reportType,
        time: new Date().toLocaleString(),
      }, ...prev.slice(0, 9)]);
      setSelectedChild("");
      setCustomEmail("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send report. Please try again.");
    } finally { setSending(false); }
  };

  const REPORT_TYPES = [
    { value: "monthly", label: "Monthly Report", desc: "Monthly observation summary" },
    { value: "progress", label: "Progress Report", desc: "Skill performance and trends" },
    { value: "full", label: "Full Report", desc: "Complete observation history" },
  ];

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "4px solid #E2E8F0", borderTop: "4px solid #2563EB", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: "#64748B" }}>Loading…</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F172A" }}>Email Reports</h1>
        <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 14 }}>Send observation reports directly to parents</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24, alignItems: "start" }}>

        {/* Main Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Alerts */}
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: "14px 18px", color: "#DC2626", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><FiAlertCircle size={16} /> {error}</div>
              <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626" }}><FiX size={16} /></button>
            </div>
          )}
          {success && (
            <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 14, padding: "14px 18px", color: "#059669", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><FiCheckCircle size={16} /> {success}</div>
              <button onClick={() => setSuccess("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#059669" }}><FiX size={16} /></button>
            </div>
          )}

          {/* Select Child */}
          <div
           onMouseEnter={(e)=>{
           e.currentTarget.style.transform="translateY(-4px)";
           }}

           onMouseLeave={(e)=>{
           e.currentTarget.style.transform="translateY(0)";
           }}
           style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <FiUsers color="#2563EB" size={18} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Select Child</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {children.map((child) => (
                <div key={child.id} onClick={() => setSelectedChild(String(child.id))}
                  style={{
                    padding: "16px 18px", borderRadius: 14, cursor: "pointer",
                    border: `2px solid ${selectedChild === String(child.id) ? "#2563EB" : "#E2E8F0"}`,
                    background: selectedChild === String(child.id) ? "#EFF6FF" : "#F8FAFC",
                    transition: "all 0.2s"
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      color: `hsl(${(child.id * 47) % 360},50%,35%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 16, color: `hsl(${(child.id * 47) % 360}, 50%, 35%)`
                    }}>{child.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{child.name}</div>
                      <div style={{ color: "#94A3B8", fontSize: 12 }}>{child.classroom || "No class"}</div>
                    </div>
                  </div>
                  {selectedChild === String(child.id) && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, color: "#2563EB", fontSize: 12, fontWeight: 600 }}>
                      <FiCheckCircle size={13} /> Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Report Type */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <FiFileText color="#10B981" size={18} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Report Type</h3>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {REPORT_TYPES.map(({ value, label, desc }) => (
                <div key={value} onClick={() => setReportType(value)}
                  style={{
                    flex: "1 1 160px", padding: "16px 18px", borderRadius: 14, cursor: "pointer",
                    border: `2px solid ${reportType === value ? "#10B981" : "#E2E8F0"}`,
                    background: reportType === value ? "#ECFDF5" : "#F8FAFC",
                    transition: "all 0.2s"
                  }}>
                  <div style={{ fontWeight: 700, color: reportType === value ? "#059669" : "#0F172A", fontSize: 14, marginBottom: 4 }}>{label}</div>
                  <div style={{ color: "#94A3B8", fontSize: 12 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <FiMail color="#F59E0B" size={18} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Recipient</h3>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {[{ value: "parent", label: "Send to Parent" }, { value: "custom", label: "Custom Email" }].map(({ value, label }) => (
                <button key={value} onClick={() => setSendTo(value)} style={{
                  padding: "10px 20px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 14,
                  border: `2px solid ${sendTo === value ? "#F59E0B" : "#E2E8F0"}`,
                  background: sendTo === value ? "#FFFBEB" : "#F8FAFC",
                  color: sendTo === value ? "#D97706" : "#64748B"
                }}>{label}</button>
              ))}
            </div>

            {sendTo === "parent" ? (
              <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 18px", border: "1px solid #E2E8F0" }}>
                {selectedChildData ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FiUser size={16} color="#64748B" />
                    <div>
                      <div style={{ fontSize: 13, color: "#64748B" }}>Parent: {selectedChildData.parent_name || "—"}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginTop: 2 }}>{selectedChildData.parent_email || "No email on file"}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "#94A3B8", fontSize: 14 }}>Select a child to see parent email</div>
                )}
              </div>
            ) : (
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={customEmail} onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
              </div>
            )}
          </div>

          {/* Send Button */}
          <button onClick={handleSend} disabled={sending || !selectedChild || !recipientEmail} style={{
            padding: "16px 32px", background: "#2563EB", border: "none", borderRadius: 16,
            fontSize: 16, fontWeight: 700, color: "#fff", cursor: sending || !selectedChild || !recipientEmail ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            opacity: sending || !selectedChild || !recipientEmail ? 0.65 : 1,
            boxShadow: "0 6px 20px rgba(37,99,235,.35)", transition: "all 0.2s"
          }}>
            <FiSend size={18} /> {sending ? "Sending Report…" : "Send Report"}
          </button>
        </div>

        {/* Sent Log Sidebar */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 10px 25px rgba(0,0,0,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <FiCheckCircle color="#10B981" size={18} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Recent Sends</h3>
          </div>
          {sentLog.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 14 }}>
              <FiMail size={32} color="#CBD5E1" />
              <p style={{ marginTop: 12 }}>No reports sent yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sentLog.map((log, i) => (
                <div key={i} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 14, marginBottom: 4 }}>{log.child}</div>
                  <div style={{ color: "#64748B", fontSize: 13 }}>{log.email}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ background: "#ECFDF5", color: "#059669", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, textTransform: "capitalize" }}>{log.type}</span>
                    <span style={{ color: "#94A3B8", fontSize: 11 }}>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "#64748B", textTransform: "uppercase",
  letterSpacing: "0.05em", marginBottom: 6
};

const inputStyle = {
  padding: "10px 14px", border: "1px solid #E2E8F0",
  borderRadius: 12, fontSize: 14, color: "#0F172A",
  background: "#F8FAFC", outline: "none"
};