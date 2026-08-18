import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getTransactions } from "../services/adminService";

interface TxRow {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
  userId?: number;
  courseId?: number;
  User?: { id?: number; name: string | null; email: string } | null;
  Course?: { id?: number; title: string; price?: number } | null;
}

export default function AdminTransactions() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getTransactions();
        if (!cancelled) {
          setRows(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (e: any) {
        const msg =
          e.response?.data?.message ||
          e.message ||
          "Failed to load transactions.";
        console.error("Transactions load error:", e.response?.data || e);
        if (!cancelled) {
          setError(msg);
          setRows([]);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <h2>Loading transactions...</h2>;

  return (
    <div>
      <h1>Simulated Transactions</h1>
      <p style={{ color: "#64748b" }}>
        Records created when students complete checkout. No real card data is
        stored.
      </p>

      {error && (
        <div
          className="course-card"
          style={{ borderLeft: "4px solid #dc2626", marginBottom: 16 }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: "#b91c1c" }}>
            Could not load transactions
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 14 }}>{error}</p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#64748b" }}>
            On the server machine run: npx prisma@6.19.3 migrate deploy && npx
            prisma@6.19.3 generate — then restart npm run dev.
          </p>
        </div>
      )}

      {!error && rows.length === 0 ? (
        <div className="course-card">
          <p style={{ margin: 0, fontWeight: 600 }}>No transactions yet</p>
          <p style={{ margin: "8px 0 0", color: "#64748b" }}>
            Log in as a Student, add a published course to the cart, confirm
            simulated payment, then return here. (If the student was already
            enrolled in that course, checkout may not create a new transaction —
            try another course.)
          </p>
        </div>
      ) : null}

      {rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Course</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>
                  {r.User?.name || r.User?.email || `User #${r.userId ?? "—"}`}
                  {r.User?.email ? (
                    <>
                      <br />
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        {r.User.email}
                      </span>
                    </>
                  ) : null}
                </td>
                <td>{r.Course?.title || `Course #${r.courseId ?? "—"}`}</td>
                <td>${Number(r.amount).toFixed(2)}</td>
                <td>{r.status}</td>
                <td>
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
