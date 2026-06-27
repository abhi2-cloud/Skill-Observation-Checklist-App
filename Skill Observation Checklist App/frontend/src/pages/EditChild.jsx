import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate
} from "react-router-dom";

import axios from "../api/axios";

function EditChild() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    classroom: "",
    admission_date: "",
    allergies: "",
    medical_notes: ""
  });

  useEffect(() => {
    loadChild();
  }, []);

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

      setForm({
        ...response.data,
        name: response.data.name || "",
        age: response.data.age || "",
        gender: response.data.gender || "",
        parent_name:
          response.data.parent_name || "",
        parent_email:
          response.data.parent_email || "",
        parent_phone:
          response.data.parent_phone || "",
        classroom:
          response.data.classroom || "",
        admission_date:
          response.data.admission_date || "",
        allergies:
          response.data.allergies || "",
        medical_notes:
          response.data.medical_notes || ""
      });

    } catch (error) {

      console.error(error);

    }

  };

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value
    });

  };

  const updateChild = async (e) => {

    e.preventDefault();

    try {

      const token =
        localStorage.getItem(
          "access_token"
        );

      console.log("Sending:", form);

      await axios.put(
        `/api/children/${id}`,
        form,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      alert(
        "Child Updated Successfully"
      );

      navigate(`/child/${id}`);

    } catch (error) {

      console.error(error);

      alert(
        "Update Failed"
      );

    }

  };

  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none"
  };

  return (

    <div
      style={{
        marginLeft: "240px",
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "40px"
      }}
    >

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}
      >

        {/* Header */}

        <button
          onClick={() =>
            navigate("/children")
          }
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "16px",
            marginBottom: "20px"
          }}
        >
          ← Back to Children
        </button>

        <h1
          style={{
            margin: 0,
            color: "#0f172a"
          }}
        >
          Edit Child
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "30px"
          }}
        >
          Update child information and details
        </p>

        <form
          onSubmit={updateChild}
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "35px",
            boxShadow:
              "0 10px 25px rgba(0,0,0,0.06)"
          }}
        >

          {/* Basic Information */}

          <h2
            style={{
              color: "#2563eb",
              marginBottom: "25px"
            }}
          >
            👤 Basic Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3,1fr)",
              gap: "20px"
            }}
          >

            <div>
              <label>
                Full Name
              </label>
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Age
              </label>
              <input
                name="age"
                value={form.age || ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Gender
              </label>
              <select
                name="gender"
                value={form.gender || ""}
                onChange={handleChange}
                style={inputStyle}
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
              <label>
                Classroom
              </label>
              <input
                name="classroom"
                value={form.classroom || ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

          </div>

          <hr
            style={{
              margin: "35px 0"
            }}
          />

          {/* Parent Information */}

          <h2
            style={{
              color: "#7c3aed",
              marginBottom: "25px"
            }}
          >
            👨‍👩‍👧 Parent Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2,1fr)",
              gap: "20px"
            }}
          >

            <div>
              <label>
                Parent Name
              </label>
              <input
                name="parent_name"
                value={
                  form.parent_name || ""
                }
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Parent Email
              </label>
              <input
                name="parent_email"
                value={
                  form.parent_email || ""
                }
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Parent Phone
              </label>
              <input
                name="parent_phone"
                value={
                  form.parent_phone || ""
                }
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

          </div>

          <hr
            style={{
              margin: "35px 0"
            }}
          />

          {/* Additional Information */}

          <h2
            style={{
              color: "#16a34a",
              marginBottom: "25px"
            }}
          >
            🏥 Additional Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2,1fr)",
              gap: "20px"
            }}
          >

            <div>
              <label>
                Allergies
              </label>

              <textarea
                rows="4"
                name="allergies"
                value={
                  form.allergies || ""
                }
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  resize: "none"
                }}
              />
            </div>

            <div>
              <label>
                Medical Notes
              </label>

              <textarea
                rows="4"
                name="medical_notes"
                value={
                  form.medical_notes || ""
                }
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  resize: "none"
                }}
              />
            </div>

            <div>
              <label>
                Admission Date
              </label>

              <input
                type="date"
                name="admission_date"
                value={
                  form.admission_date || ""
                }
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

          </div>

          {/* Buttons */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: "15px",
              marginTop: "40px"
            }}
          >

            <button
              type="button"
              onClick={() =>
                navigate("/children")
              }
              style={{
                padding: "14px 22px",
                borderRadius: "12px",
                border:
                  "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: "14px 24px",
                borderRadius: "12px",
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              💾 Update Child
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default EditChild;