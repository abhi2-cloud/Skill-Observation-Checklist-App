import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import {
  MdMenuBook,
  MdFamilyRestroom,
  MdCalendarToday,
  MdFavoriteBorder,
  MdClose,
  MdCheck
} from "react-icons/md";

function AddChild() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const [classroom, setClassroom] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");

  const [allergies, setAllergies] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Child name is required";
    }

    if (!age || Number(age) <= 0) {
      newErrors.age = "Enter a valid age";
    }

    if (!classroom.trim()) {
      newErrors.classroom = "Classroom is required";
    }

    if (!parentName.trim()) {
      newErrors.parentName = "Parent name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

  const submitChild = async (e) => {

    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {

      const token =
        localStorage.getItem(
          "access_token"
        );

      const parentEmail =
        localStorage.getItem(
          "user_email"
        );

      await axios.post(
        "/api/children/",
        {
          name,
          age: Number(age),
          gender,

          parent_name: parentName,

          parent_email:
            parentEmail,

          parent_phone:
            parentPhone,

          classroom,

          admission_date:
            admissionDate,

          allergies,

          medical_notes:
            medicalNotes
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      alert(
        "Child Added Successfully"
      );

      navigate(
        "/children"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Failed To Add Child"
      );

    } finally {

      setSubmitting(false);

    }

  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    border: "1px solid #f1f5f9",
    marginBottom: "20px"
  };

  const cardHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px"
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

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px"
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#475569",
    marginBottom: "7px"
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: hasError
      ? "1px solid #ef4444"
      : "1px solid #e5e7eb",
    fontSize: "14px",
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
    background: "#f8fafc",
    transition: "border-color 0.18s ease, background 0.18s ease"
  });

  const handleFocus = (e) => {
    e.currentTarget.style.borderColor = "#2563eb";
    e.currentTarget.style.background = "#ffffff";
  };

  const handleBlur = (e, hasError) => {
    e.currentTarget.style.borderColor = hasError ? "#ef4444" : "#e5e7eb";
    e.currentTarget.style.background = "#f8fafc";
  };

  const errorTextStyle = {
    color: "#ef4444",
    fontSize: "12px",
    fontWeight: 600,
    margin: "5px 0 0 0"
  };

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
          title="Add Child"
          breadcrumbs={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Children", path: "/children" },
            { label: "Add Child", path: null }
          ]}
          showSearch={false}
        />

        <div
          style={{
            padding: "32px",
            maxWidth: "1000px",
            margin: "0 auto",
            boxSizing: "border-box"
          }}
        >

          <div
            style={{
              marginBottom: "24px"
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a"
              }}
            >
              Add New Child
            </h1>

            <p
              style={{
                margin: "6px 0 0 0",
                color: "#64748b",
                fontSize: "14px"
              }}
            >
              Onboard a new student to the system.
            </p>
          </div>

          <form onSubmit={submitChild}>

            {/* Child Information */}

            <div style={cardStyle}>

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
                  Child Information
                </h2>
              </div>

              <div style={gridStyle}>

                <div>
                  <label style={labelStyle}>Child Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    style={inputStyle(!!errors.name)}
                    onFocus={handleFocus}
                    onBlur={(e) => handleBlur(e, !!errors.name)}
                  />
                  {errors.name && (
                    <p style={errorTextStyle}>{errors.name}</p>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={age}
                    onChange={(e) =>
                      setAge(
                        e.target.value
                      )
                    }
                    style={inputStyle(!!errors.age)}
                    onFocus={handleFocus}
                    onBlur={(e) => handleBlur(e, !!errors.age)}
                  />
                  {errors.age && (
                    <p style={errorTextStyle}>{errors.age}</p>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(
                        e.target.value
                      )
                    }
                    style={inputStyle(false)}
                    onFocus={handleFocus}
                    onBlur={(e) => handleBlur(e, false)}
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Classroom</label>
                  <input
                    type="text"
                    placeholder="e.g. Blue Jays"
                    value={classroom}
                    onChange={(e) =>
                      setClassroom(
                        e.target.value
                      )
                    }
                    style={inputStyle(!!errors.classroom)}
                    onFocus={handleFocus}
                    onBlur={(e) => handleBlur(e, !!errors.classroom)}
                  />
                  {errors.classroom && (
                    <p style={errorTextStyle}>{errors.classroom}</p>
                  )}
                </div>

              </div>

            </div>

            {/* Parent Information */}

            <div style={cardStyle}>

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

              <div style={gridStyle}>

                <div>
                  <label style={labelStyle}>Parent Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Johnson"
                    value={parentName}
                    onChange={(e) =>
                      setParentName(
                        e.target.value
                      )
                    }
                    style={inputStyle(!!errors.parentName)}
                    onFocus={handleFocus}
                    onBlur={(e) => handleBlur(e, !!errors.parentName)}
                  />
                  {errors.parentName && (
                    <p style={errorTextStyle}>{errors.parentName}</p>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Parent Email</label>
                  <input
                    type="email"
                    value={
                      localStorage.getItem(
                        "user_email"
                      ) || ""
                    }
                    readOnly
                    style={{
                      ...inputStyle(false),
                      background: "#f1f5f9",
                      color: "#64748b",
                      cursor: "not-allowed"
                    }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Parent Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555 123 4567"
                    value={parentPhone}
                    onChange={(e) =>
                      setParentPhone(
                        e.target.value
                      )
                    }
                    style={inputStyle(false)}
                    onFocus={handleFocus}
                    onBlur={(e) => handleBlur(e, false)}
                  />
                </div>

              </div>

            </div>

            {/* Admission Information */}

            <div style={cardStyle}>

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

              <div style={gridStyle}>

                <div>
                  <label style={labelStyle}>Admission Date</label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) =>
                      setAdmissionDate(
                        e.target.value
                      )
                    }
                    style={inputStyle(false)}
                    onFocus={handleFocus}
                    onBlur={(e) => handleBlur(e, false)}
                  />
                </div>

              </div>

            </div>

            {/* Medical Information */}

            <div style={cardStyle}>

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

              <div style={gridStyle}>

                <div>
                  <label style={labelStyle}>Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Peanuts, Pollen"
                    value={allergies}
                    onChange={(e) =>
                      setAllergies(
                        e.target.value
                      )
                    }
                    style={inputStyle(false)}
                    onFocus={handleFocus}
                    onBlur={(e) => handleBlur(e, false)}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Medical Notes</label>
                  <textarea
                    placeholder="Any additional medical notes..."
                    value={medicalNotes}
                    onChange={(e) =>
                      setMedicalNotes(
                        e.target.value
                      )
                    }
                    rows="4"
                    style={{
                      ...inputStyle(false),
                      resize: "vertical",
                      fontFamily: "inherit"
                    }}
                    onFocus={handleFocus}
                    onBlur={(e) => handleBlur(e, false)}
                  />
                </div>

              </div>

            </div>

            {/* Actions */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "10px"
              }}
            >

              <button
                type="button"
                onClick={() => navigate("/children")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "13px 24px",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  color: "#475569",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "14px",
                  transition: "background 0.18s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <MdClose size={17} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "13px 26px",
                  borderRadius: "12px",
                  border: "none",
                  background: submitting ? "#93c5fd" : "#2563eb",
                  color: "#ffffff",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: "14px",
                  boxShadow: "0 10px 20px rgba(37,99,235,0.25)",
                  transition: "background 0.18s ease"
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.background = "#1d4ed8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.background = "#2563eb";
                  }
                }}
              >
                <MdCheck size={18} />
                {submitting ? "Adding..." : "Add Child"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>

  );

}

export default AddChild;