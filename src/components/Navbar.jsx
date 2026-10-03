import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

function Navbar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="ems-navbar">

      <div className="ems-navbar-left">
        <div className="ems-navbar-title-icon">
          ✦
        </div>

        <div className="ems-navbar-title">
          <h2>AI-EMS</h2>
          <span>Employee Management System</span>
        </div>
      </div>

      <div className="ems-navbar-right">

        <div className="ems-navbar-role">
          <div className="ems-navbar-user-icon">
            👤
          </div>

          <div className="ems-navbar-role-info">
            <span>Logged in as</span>
            <strong>{role}</strong>
          </div>
        </div>

        <div className="ems-navbar-divider"></div>

        <button
          className="ems-logout-button"
          onClick={handleLogout}
        >
          <span className="ems-logout-icon">↪</span>
          <span>Logout</span>
        </button>

      </div>

    </header>
  );
}

export default Navbar;