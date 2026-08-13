import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", form);

      toast.success(
        "Registration successful! You can now log in."
      );

      navigate("/login");

    } catch (error: any) {
      console.error(error);

      if (error.response?.data?.message) {
        toast.error(
          error.response.data.message
        );
      } else if (
        error.response?.status === 409
      ) {
        toast.error(
          "An account with this email already exists. Please log in instead."
        );
      } else if (
        error.response?.status ===400
      ) {
        toast.error(
          "Please check your details and try again."
        );
      } else {
        toast.error(
          "Registration failed. Please try again later."
        );
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
      }}
    >
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          required
        />

        <br />
        <br />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          required
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
          required
        />

        <br />
        <br />

        <select
          value={form.role}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value,
            })
          }
        >
          <option value="STUDENT">
            Student
          </option>
          <option value="INSTRUCTOR">
            Instructor
          </option>
        </select>
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
          Administrator accounts are provisioned by the system administrator, not via public registration.
        </p>

        <br />
        <br />

        <button type="submit">
          Register
        </button>
      </form>
    </div>
  );
}