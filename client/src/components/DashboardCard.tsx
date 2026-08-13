import "./DashboardCard.css";

interface DashboardCardProps {
  title: string;
  value: number | string;
}

export default function DashboardCard({
  title,
  value,
}: DashboardCardProps) {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>

      <h1>{value}</h1>
    </div>
  );
}