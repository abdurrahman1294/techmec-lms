import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUsers, updateUserStatus } from "../services/adminService";

interface UserRow {
  id: number;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (user: UserRow) => {
    const next = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await updateUserStatus(user.id, next);
      toast.success(`User ${next.toLowerCase()}.`);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Update failed.");
    }
  };

  if (loading) return <h2 style={{ padding: 20 }}>Loading users...</h2>;

  return (
    <div style={{ maxWidth: 1000, margin: "30px auto", padding: 20 }}>
      <h1>User Management</h1>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 16,
        }}
      >
        <thead>
          <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
            <th style={{ padding: 8 }}>ID</th>
            <th style={{ padding: 8 }}>Name</th>
            <th style={{ padding: 8 }}>Email</th>
            <th style={{ padding: 8 }}>Role</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ padding: 8 }}>{u.id}</td>
              <td style={{ padding: 8 }}>{u.name}</td>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8 }}>{u.role}</td>
              <td style={{ padding: 8 }}>
                <span
                  style={{
                    color: u.status === "ACTIVE" ? "#16a34a" : "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  {u.status}
                </span>
              </td>
              <td style={{ padding: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => toggleStatus(u)}>
                  {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
