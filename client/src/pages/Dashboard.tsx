import { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboardService";
import DashboardCard from "../components/DashboardCard";

interface DashboardData {
  role: string;
  data: any;
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error(error);
        alert("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <h2 style={{ padding: 20 }}>Loading Dashboard...</h2>;
  if (!dashboard) return <h2 style={{ padding: 20 }}>No dashboard data.</h2>;

  return (
    <div style={{ maxWidth: 1000, margin: "30px auto", padding: 20 }}>
      <h1>Dashboard</h1>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 30 }}>
        {dashboard.role === "ADMIN" && (
          <>
            <DashboardCard title="Total Users" value={dashboard.data.users} />
            <DashboardCard title="Students" value={dashboard.data.students} />
            <DashboardCard title="Instructors" value={dashboard.data.instructors} />
            <DashboardCard title="Total Courses" value={dashboard.data.courses} />
            <DashboardCard title="Published Courses" value={dashboard.data.publishedCourses} />
            <DashboardCard title="Enrollments" value={dashboard.data.enrollments} />
            <DashboardCard title="Transactions" value={dashboard.data.transactions} />
          </>
        )}
        {dashboard.role === "INSTRUCTOR" && (
          <>
            <DashboardCard title="My Courses" value={dashboard.data.courses} />
            <DashboardCard title="Published" value={dashboard.data.published} />
            <DashboardCard title="Student Enrollments" value={dashboard.data.enrollments} />
          </>
        )}
        {dashboard.role === "STUDENT" && (
          <>
            <DashboardCard title="Enrolled Courses" value={dashboard.data.enrolledCourses} />
            <DashboardCard title="Avg Progress" value={`${dashboard.data.avgProgress ?? 0}%`} />
          </>
        )}
      </div>
    </div>
  );
}
