import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate
} from "react-router-dom";

import axios from "../api/axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  MdEdit,
  MdDeleteOutline,
  MdMenuBook,
  MdFamilyRestroom,
  MdCalendarToday,
  MdFavoriteBorder  
} from "react-icons/md";

function ChildDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChild();
  }, [id]);

  const loadChild = async () => {

    try {

      const token =
        localStorage.getItem(
          "access_token"
        );

      const response =
        await axios.get(
          `/api/children/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );
      console.log("Child Details:", response.data);

      setChild(response.data);

    } catch (error) {

      console.error(error);

      alert("Child not found");

      navigate("/children");

    } finally {

      setLoading(false);

    }

  };

  const deleteChild = async () => {

    const confirmed =
      window.confirm(
        `Delete ${child.name}?`
      );

    if (!confirmed) return;

    try {

      const token =
        localStorage.getItem(
          "access_token"
        );

      await axios.delete(
        `/api/children/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      alert(
        "Child Deleted Successfully"
      );

      navigate("/children");

    } catch (error) {

      console.error(error);

      alert("Delete Failed");

    }

  };

  const getInitials = (name) => {

    if (!name) return "?";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

  };

  const infoCardStyle = {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "25px",
    cursor: "default",
    transition: "all .25s ease",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    border: "1px solid #f1f5f9"
  };

  const cardHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px"
  };

  const iconBadgeStyle = (bg, color) => ({
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: bg,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  const fieldRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px"
  };

  const Field = ({ label, value }) => (
    <div style={fieldRowStyle}>
      <span style={{ color: "#64748b", fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ color: "#1e293b", fontWeight: 600, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );

  if (loading) {

    return (

      <div
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh"
        }}
      >

        <Sidebar />

        <div
          style={{
            marginLeft: "250px",
            padding: "32px"
          }}
        >
          <h2 style={{ color: "#64748b" }}>
            Loading...
          </h2>
        </div>

      </div>

    );

  }

  if (!child) {

    return (

      <div
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh"
        }}
      >

        <Sidebar />

        <div
          style={{
            marginLeft: "250px",
            padding: "32px"
          }}
        >
          <h2 style={{ color: "#64748b" }}>
            Child Not Found
          </h2>
        </div>

      </div>

    );

  }

  return (

    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh"
      }}
    >

      <Sidebar />

      <div
        style={{
          marginLeft: "250px",
          minHeight: "100vh",
          boxSizing: "border-box",
          overflowX: "hidden"
        }}
      >

        <Topbar
          title="Child Profile"
          breadcrumbs={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Children", path: "/children" },
            { label: child.name, path: null }
          ]}
          showSearch={false}
        />

        <div
          style={{
            padding: "32px",
            maxWidth: "1200px",
            margin: "0 auto",
            boxSizing: "border-box"
          }}
        >

          {/* Page actions */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginBottom: "20px"
            }}
          >

            <button
              onClick={() =>
                navigate(
                  `/child/edit/${id}`
                )
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 20px",
                borderRadius: "10px",
                border: "1px solid #2563eb",
                background: "#ffffff",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "14px",
                transition: "all .25s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#eff6ff";
                e.currentTarget.style.transform="translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.transform="translateY(0)";
              }}
            >
              <MdEdit size={17} />
              Edit Child
            </button>

            <button
              onClick={deleteChild}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "11px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 10px 20px rgba(239,68,68,0.25)",
                transition: "background 0.18s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#dc2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ef4444";
              }}
            >
              <MdDeleteOutline size={17} />
              Delete Child
            </button>

          </div>

          {/* Large profile card */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "30px",
              marginBottom: "20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              border: "1px solid #f1f5f9"
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px"
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px"
                }}
              >

                <div
                  style={{
                    width: "76px",
                    height: "76px",
                    minWidth: "76px",
                    borderRadius: "20px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "26px"
                  }}
                >
                  {getInitials(child.name)}
                </div>

                <div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "26px",
                      color: "#0f172a",
                      fontWeight: 800
                    }}
                  >
                    {child.name}
                  </h2>

                  <p
                    style={{
                      margin: "6px 0 0 0",
                      color: "#64748b",
                      fontSize: "14px",
                      fontWeight: 600
                    }}
                  >
                    ID: #{child.id?.slice(0,8)}
                    {"  •  "}
                    {child.classroom}
                  </p>

                </div>

              </div>

              <span
                style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  fontWeight: 700,
                  fontSize: "13px"
                }}
              >
                ● Active
              </span>

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(160px,1fr))",
                gap: "16px",
                marginTop: "26px",
                paddingTop: "22px",
                borderTop: "1px solid #f1f5f9"
              }}
            >

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em"
                  }}
                >
                  Age
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#1e293b"
                  }}
                >
                  {child.age}
                </p>
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em"
                  }}
                >
                  Classroom
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#1e293b"
                  }}
                >
                  {child.classroom}
                </p>
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em"
                  }}
                >
                  Gender
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#1e293b"
                  }}
                >
                  {child.gender || "Not Available"}
                </p>
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em"
                  }}
                >
                  ID
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#1e293b"
                  }}
                >
                  {child.id}
                </p>
              </div>

            </div>

          </div>

          {/* Info cards grid */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "20px"
            }}
          >

            {/* Basic Information */}

            <div
              style={infoCardStyle}
              onMouseEnter={(e)=>{
                e.currentTarget.style.transform="translateY(-4px)";
                e.currentTarget.style.boxShadow="0 18px 35px rgba(0,0,0,.12)";
              }}
              onMouseLeave={(e)=>{
                e.currentTarget.style.transform="translateY(0)";
                e.currentTarget.style.boxShadow="0 10px 25px rgba(0,0,0,.08)";
              }}
            >

              <div style={cardHeaderStyle}>
                <span style={iconBadgeStyle("#eff6ff", "#2563eb")}>
                  <MdMenuBook size={18} />
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0f172a"
                  }}
                >
                  Basic Information
                </h2>
              </div>

              <Field label="Full Name" value={child.name} />
              <Field label="Age" value={child.age} />
              <Field label="Gender" value={child.gender || "Not Available"} />
              <Field label="Classroom" value={child.classroom} />

            </div>

            {/* Parent Information */}

            <div
              style={infoCardStyle}
              onMouseEnter={(e)=>{
                e.currentTarget.style.transform="translateY(-4px)";
                e.currentTarget.style.boxShadow="0 18px 35px rgba(0,0,0,.12)";
              }}
              onMouseLeave={(e)=>{
                e.currentTarget.style.transform="translateY(0)";
                e.currentTarget.style.boxShadow="0 10px 25px rgba(0,0,0,.08)";
              }}
            >

              <div style={cardHeaderStyle}>
                <span style={iconBadgeStyle("#fdf2f8", "#db2777")}>
                  <MdFamilyRestroom size={18} />
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0f172a"
                  }}
                >
                  Parent Information
                </h2>
              </div>

              <Field
                label="Parent Name"
                value={child.parent_name || "Not Available"}
              />
              <Field label="Email" value={child.parent_email} />
              <Field label="Phone" value={child.parent_phone || "Not Available"} />

            </div>

            {/* Admission Information */}

            <div
              style={infoCardStyle}
              onMouseEnter={(e)=>{
                e.currentTarget.style.transform="translateY(-4px)";
                e.currentTarget.style.boxShadow="0 18px 35px rgba(0,0,0,.12)";
              }}
              onMouseLeave={(e)=>{
                e.currentTarget.style.transform="translateY(0)";
                e.currentTarget.style.boxShadow="0 10px 25px rgba(0,0,0,.08)";
              }}
            >

              <div style={cardHeaderStyle}>
                <span style={iconBadgeStyle("#fff7ed", "#ea580c")}>
                  <MdCalendarToday size={18} />
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0f172a"
                  }}
                >
                  Admission Information
                </h2>
              </div>

              <Field
                label="Admission Date"
                value={child.admission_date || "Not Available"}
              />

            </div>

            {/* Medical Information */}

            <div
              style={infoCardStyle}
              onMouseEnter={(e)=>{
                e.currentTarget.style.transform="translateY(-4px)";
                e.currentTarget.style.boxShadow="0 18px 35px rgba(0,0,0,.12)";
              }}
              onMouseLeave={(e)=>{
                e.currentTarget.style.transform="translateY(0)";
                e.currentTarget.style.boxShadow="0 10px 25px rgba(0,0,0,.08)";
              }}
            >

              <div style={cardHeaderStyle}>
                <span style={iconBadgeStyle("#fef2f2", "#ef4444")}>
                  <MdFavoriteBorder size={18} />
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0f172a"
                  }}
                >
                  Medical Information
                </h2>
              </div>

              <Field label="Allergies" value={child.allergies || "None"} />
              <Field label="Medical Notes" value={child.medical_notes || "None"} />

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default ChildDetails;