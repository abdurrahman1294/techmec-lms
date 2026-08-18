import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactElement } from "react";

interface Props {
  children: ReactElement;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
