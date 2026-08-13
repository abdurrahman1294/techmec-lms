import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getCourseStudents } from "../services/courseService";

interface EnrollmentRow {
  id: number;
  progressPercent: number;
  enrolledAt: string;
  student: {
    id: number;
    name: string | null;
    email: string;
    status: string;
  };
}

export default function CourseStudents() {
  const { id } = useParams();
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCourseStudents(Number(id));
        setRows(data);
      } catch (e: any) {
        toast.error(e.response?.data?.message || "Failed to load students.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 20 }}>
      <h1>Enrolled Students</h1>
      {rows.length === 0 ? (
        <p>No students enrolled yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Progress</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: 8 }}>{r.student.name}</td>
                <td style={{ padding: 8 }}>{r.student.email}</td>
                <td style={{ padding: 8 }}>{r.progressPercent}%</td>
                <td style={{ padding: 8 }}>{r.student.status}</td>
                <td style={{ padding: 8 }}>{new Date(r.enrolledAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
