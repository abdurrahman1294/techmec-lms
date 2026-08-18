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
      toast.success("Name updated.");
      if (token && user) {
        login(token, {
          ...user,
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

  if (loading) return <h2>Loading profile...</h2>;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <h1>Profile</h1>
      <div className="course-card">
        <form onSubmit={handleSave}>
          <label htmlFor="prof-name">Name</label>
          <input
            id="prof-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label htmlFor="prof-email">Email</label>
          <input id="prof-email" value={email} disabled />
          <p>
            <strong>Role:</strong> {role}
          </p>
          <p>
            <strong>Status:</strong> {status}
          </p>
          {counts.courses !== undefined && (
            <p>
              <strong>Courses:</strong> {counts.courses}
            </p>
          )}
          {counts.enrollments !== undefined && (
            <p>
              <strong>Enrollments:</strong> {counts.enrollments}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save name"}
          </button>
        </form>
      </div>

      <div className="course-card">
        <h2 style={{ marginTop: 0 }}>Change password</h2>
        <form onSubmit={handleChangePassword}>
          <label htmlFor="cur-pw">Current password</label>
          <input
            id="cur-pw"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <label htmlFor="new-pw">New password</label>
          <input
            id="new-pw"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <label htmlFor="conf-pw">Confirm new password</label>
          <input
            id="conf-pw"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <p style={{ fontSize: 12, color: "#64748b" }}>
            At least 8 characters, with upper, lower, number, and special
            character.
          </p>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={changingPw}
          >
            {changingPw ? "Updating..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
