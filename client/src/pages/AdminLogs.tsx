import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getSystemLogs } from "../services/adminService";

interface LogRow {
  id: number;
  action: string;
  details: string | null;
  createdAt: string;
  User?: { id: number; name: string | null; email: string } | null;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSystemLogs();
        setLogs(data || []);
      } catch (e: any) {
        toast.error(e.response?.data?.message || "Failed to load logs.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <h2 style={{ padding: 20 }}>Loading audit logs...</h2>;

  return (
    <div style={{ maxWidth: 1000, margin: "30px auto", padding: 20 }}>
      <h1>System Audit Log</h1>
      <p style={{ color: "#64748b" }}>
        Recent platform events (login, courses, purchases, admin actions).
        Passwords and tokens are never stored here.
      </p>

      {logs.length === 0 ? (
        <p>No logs yet. Use the app (login, create course, checkout) to generate events.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Time</th>
              <th style={{ padding: 8 }}>Action</th>
              <th style={{ padding: 8 }}>User</th>
              <th style={{ padding: 8 }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: 8 }}>
                  <code>{log.action}</code>
                </td>
                <td style={{ padding: 8 }}>
                  {log.User
                    ? `${log.User.name || "—"} (${log.User.email})`
                    : "—"}
                </td>
                <td style={{ padding: 8, fontSize: 13 }}>{log.details || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
