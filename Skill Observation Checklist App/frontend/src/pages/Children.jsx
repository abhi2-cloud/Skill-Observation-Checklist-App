import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  MdAdd,
  MdPerson,
  MdSchool,
  MdFamilyRestroom,
  MdArrowForward,
  MdSearchOff
} from "react-icons/md";

function Children() {

  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [search, setSearch] = useState("");

  const fetchChildren = async () => {

    try {

      const token =
        localStorage.getItem(
          "access_token"
        );

      const response =
        await axios.get(
          "/api/children/",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setChildren(
        response.data
      );

    } catch (error) {

      console.error(error);

      alert(
        "Failed to load children"
      );

    }

  };

  useEffect(() => {

    fetchChildren();

  }, []);

  const filteredChildren =
    children.filter(
      (child) => {

        const searchText =
          search.toLowerCase();

        return (

          child.name
            ?.toLowerCase()
            .includes(searchText)

          ||

          child.classroom
            ?.toLowerCase()
            .includes(searchText)

        );

      }
    );

  const getInitials = (name) => {

    if (!name) return "?";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

  };

  const avatarColors = [
    { bg: "#dbeafe", color: "#2563eb" },
    { bg: "#fce7f3", color: "#db2777" },
    { bg: "#dcfce7", color: "#16a34a" },
    { bg: "#fef3c7", color: "#d97706" },
    { bg: "#ede9fe", color: "#7c3aed" }
  ];

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
          title="Children"
          breadcrumbs={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Children", path: null }
          ]}
          showSearch={false}
        />

        <div
          style={{
            padding: "32px",
            maxWidth: "1400px",
            margin: "0 auto",
            boxSizing: "border-box"
          }}
        >

          {/* Header */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "24px"
            }}
          >

            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "28px",
                  fontWeight: 800
                }}
              >
                Children
              </h1>

              <p
                style={{
                  margin: "4px 0 0 0",
                  color: "#64748b",
                  fontSize: "14px"
                }}
              >
                {filteredChildren.length} of {children.length} children
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/add-child")
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "13px 22px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 10px 20px rgba(37,99,235,0.25)",
                transition: "background 0.18s ease, transform 0.18s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1d4ed8";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2563eb";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <MdAdd size={19} />
              Add Child
            </button>

          </div>

          {/* Search */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "20px 24px",
              marginBottom: "24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              border: "1px solid #f1f5f9"
            }}
          >

            <input
              type="text"
              placeholder="Search by name or classroom..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                fontSize: "15px",
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
                background: "#f8fafc",
                transition: "border-color 0.18s ease, background 0.18s ease"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.background = "#ffffff";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.background = "#f8fafc";
              }}
            />

          </div>

          {/* Grid */}

          {

            filteredChildren.length === 0 ?

            (

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "60px 20px",
                  textAlign: "center",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  border: "1px solid #f1f5f9"
                }}
              >

                <MdSearchOff
                  size={42}
                  color="#cbd5e1"
                />

                <h3
                  style={{
                    margin: "12px 0 0 0",
                    color: "#475569",
                    fontWeight: 700
                  }}
                >
                  No Children Found
                </h3>

                <p
                  style={{
                    margin: "6px 0 0 0",
                    color: "#94a3b8",
                    fontSize: "14px"
                  }}
                >
                  Try adjusting your search or add a new child.
                </p>

              </div>

            )

            :

            (

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px"
                }}
              >

                {

                  filteredChildren.map(
                    (child, index) => {

                      const colors =
                        avatarColors[index % avatarColors.length];

                      return (

                        <div
                          key={child.id}
                          style={{
                            background: "#ffffff",
                            borderRadius: "20px",
                            padding: "22px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                            border: "1px solid #f1f5f9",
                            transition: "transform 0.2s ease, box-shadow 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-6px)";
                            e.currentTarget.style.boxShadow = "0 20px 45px rgba(0,0,0,0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)";
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start"
                            }}
                          >

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                                minWidth: 0
                              }}
                            >

                              <div
                                style={{
                                  width: "52px",
                                  height: "52px",
                                  minWidth: "52px",
                                  borderRadius: "16px",
                                  background: colors.bg,
                                  color: colors.color,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: "17px"
                                }}
                              >
                                {getInitials(child.name)}
                              </div>

                              <div style={{ minWidth: 0 }}>

                                <h2
                                  style={{
                                    margin: 0,
                                    fontSize: "17px",
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                  }}
                                >
                                  {child.name}
                                </h2>

                                <p
                                  style={{
                                    margin: "2px 0 0 0",
                                    fontSize: "12px",
                                    color: "#94a3b8",
                                    fontWeight: 600
                                  }}
                                >
                                  ID: #{child.id?.slice(0,8)}
                                </p>

                              </div>

                            </div>

                            <span
                              style={{
                                background: "#dcfce7",
                                color: "#15803d",
                                padding: "5px 12px",
                                borderRadius: "9999px",
                                fontSize: "12px",
                                fontWeight: 700,
                                whiteSpace: "nowrap"
                              }}
                            >
                              ● Active
                            </span>

                          </div>

                          <div
                            style={{
                              marginTop: "18px",
                              paddingTop: "16px",
                              borderTop: "1px solid #f1f5f9",
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px"
                            }}
                          >

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                fontSize: "13px",
                                color: "#475569"
                              }}
                            >
                              <MdPerson size={16} color="#94a3b8" />
                              Age: {child.age ?? "-"}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                fontSize: "13px",
                                color: "#475569"
                              }}
                            >
                              <MdSchool size={16} color="#94a3b8" />
                              Classroom: {child.classroom || "-"}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                fontSize: "13px",
                                color: "#475569",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                            >
                              <MdFamilyRestroom size={16} color="#94a3b8" />
                              Parent: {child.parent_name || "Not Assigned"}
                            </div>

                          </div>

                          <button
                            onClick={() =>
                              navigate(
                                `/child/${child.id}`
                              )
                            }
                            style={{
                              marginTop: "18px",
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              background: "#eff6ff",
                              color: "#2563eb",
                              border: "none",
                              padding: "11px 16px",
                              fontSize: "14px",
                              fontWeight: 700,
                              borderRadius: "10px",
                              cursor: "pointer",
                              transition: "background 0.18s ease, color 0.18s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#2563eb";
                              e.currentTarget.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#eff6ff";
                              e.currentTarget.style.color = "#2563eb";
                            }}
                          >
                            View Profile 
                            <MdArrowForward size={16} />
                          </button>

                        </div>

                      );

                    }
                  )

                }

              </div>

            )

          }

        </div>

      </div>

    </div>

  );

}

export default Children;