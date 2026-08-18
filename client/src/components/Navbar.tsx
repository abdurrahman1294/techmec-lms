import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        🎓 Mech Spec LMS
      </div>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/courses">Courses</NavLink>
        {user?.role === "STUDENT" && (
          <>
            <NavLink to="/my-courses">My Courses</NavLink>
            <NavLink to="/cart">Cart</NavLink>
          </>
        )}
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
        {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") && (
          <NavLink to="/instructor/courses">My Teaching</NavLink>
        )}
        {user && <NavLink to="/profile">Profile</NavLink>}
        {user?.role === "ADMIN" && (
          <>
            <NavLink to="/admin/users">Users</NavLink>
            <NavLink to="/admin/transactions">Transactions</NavLink>
            <NavLink to="/admin/logs">Logs</NavLink>
          </>
        )}
      </div>
      <div className="nav-user">
        {user ? (
          <>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="role-badge">{user.role}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
