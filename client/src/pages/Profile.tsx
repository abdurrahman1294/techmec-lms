import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, login, token } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [counts, setCounts] = useState<{
    courses?: number;
    enrollments?: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setName(data.name || "");
        setEmail(data.email || "");
        setRole(data.role || "");
        setStatus(data.status || "");
        setCounts(data._count || {});
      } catch (e: any) {
        toast.error(e.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(name.trim());
      toast.success("Profile updated.");
      if (token && user) {
        login(token, {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
        });
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setChangingPw(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Could not change password.");
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) return <h2 style={{ padding: 20 }}>Loading profile...</h2>;

  const field: React.CSSProperties = {
    width: "100%",
    padding: 10,
    marginBottom: 14,
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 560, margin: "30px auto", padding: 20 }}>
      <h1>My Profile</h1>
      <p style={{ color: "#64748b" }}>
        Update your display name or change your password.
      </p>

      <form onSubmit={handleSave} style={{ marginTop: 20 }}>
        <h3>Account</h3>
        <label style={{ display: "block", marginBottom: 6 }}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={field}
        />
        <label style={{ display: "block", marginBottom: 6 }}>Email</label>
        <input value={email} disabled style={{ ...field, background: "#f1f5f9" }} />
        <p>
          <strong>Role:</strong> {role}
        </p>
        <p>
          <strong>Status:</strong> {status}
        </p>
        {role === "INSTRUCTOR" && (
          <p>
            <strong>Courses created:</strong> {counts.courses ?? 0}
          </p>
        )}
        {role === "STUDENT" && (
          <p>
            <strong>Enrollments:</strong> {counts.enrollments ?? 0}
          </p>
        )}
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save name"}
        </button>
      </form>

      <hr style={{ margin: "32px 0" }} />

      <form onSubmit={handleChangePassword}>
        <h3>Change password</h3>
        <label style={{ display: "block", marginBottom: 6 }}>
          Current password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          style={field}
        />
        <label style={{ display: "block", marginBottom: 6 }}>New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={field}
        />
        <label style={{ display: "block", marginBottom: 6 }}>
          Confirm new password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={field}
        />
        <p style={{ fontSize: 12, color: "#64748b" }}>
          At least 8 characters, with upper, lower, number, and special
          character.
        </p>
        <button type="submit" disabled={changingPw}>
          {changingPw ? "Updating..." : "Change password"}
        </button>
      </form>
    </div>
  );
}
