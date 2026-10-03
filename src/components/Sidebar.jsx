import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  const menuItems = [
    // =========================
    // COMMON
    // =========================
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "🏠",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },

    // =========================
    // ADMIN + HR
    // =========================
    {
      name: "Employees",
      path: "/employees",
      icon: "👥",
      roles: ["ADMIN", "HR"],
    },
    {
      name: "Departments",
      path: "/departments",
      icon: "🏢",
      roles: ["ADMIN", "HR"],
    },

    // =========================
    // MANAGER
    // =========================
    {
      name: "My Team",
      path: "/manager/my-team",
      icon: "👨‍👩‍👧‍👦",
      roles: ["MANAGER"],
    },

    // =========================
    // COMMON MODULES
    // =========================
    {
      name: "Attendance",
      path: "/attendance",
      icon: "📅",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      name: "Leave",
      path: "/leave",
      icon: "📝",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      name: "Payroll",
      path: "/payroll",
      icon: "💰",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      name: "Reports",
      path: "/reports",
      icon: "📊",
      roles: ["ADMIN", "HR", "MANAGER"],
    },

    // =========================
    // AI FEATURES
    // =========================
    {
      name: "Performance Prediction",
      path: "/ai/performance",
      icon: "📈",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      name: "Attrition Prediction",
      path: "/ai/attrition",
      icon: "⚠️",
      roles: ["ADMIN", "HR", "MANAGER"],
    },
    {
      name: "Resume Screening",
      path: "/ai/resume",
      icon: "📄",
      roles: ["ADMIN", "HR"],
    },
    {
      name: "HR Chatbot",
      path: "/ai/chatbot",
      icon: "💬",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      name: "Attendance Insights",
      path: "/ai/attendance",
      icon: "🤖",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },

    // =========================
    // PROFILE
    // =========================
    {
      name: "Profile",
      path: "/profile",
      icon: "👤",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="ems-sidebar">

      {/* LOGO */}
      <div className="ems-sidebar-brand">
        <div className="ems-brand-logo">
          E
        </div>

        <div className="ems-brand-text">
          <h2>AI-EMS</h2>
          <span>Employee Managment System</span>
        </div>
      </div>

      {/* ROLE */}
      <div className="ems-role-card">
        <div className="ems-role-avatar">
          {userRole?.charAt(0) || "U"}
        </div>

        <div className="ems-role-info">
          <span>Logged in as</span>
          <strong>{userRole || "USER"}</strong>
        </div>

        <div className="ems-online-dot"></div>
      </div>

      {/* MENU */}
      <nav className="ems-sidebar-nav">

        <p className="ems-menu-label">MAIN MENU</p>

        {visibleItems.map((item) => {

          const isAI = item.path.startsWith("/ai");

          return (
            <NavLink
              key={`${item.path}-${item.name}`}
              to={item.path}
              className={({ isActive }) =>
                `ems-sidebar-link
                ${isActive ? "ems-sidebar-link-active" : ""}
                ${isAI ? "ems-ai-link" : ""}`
              }
            >
              <span className="ems-sidebar-icon">
                {item.icon}
              </span>

              <span className="ems-sidebar-name">
                {item.name}
              </span>

              <span className="ems-sidebar-arrow">
                ›
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* BOTTOM */}
      <div className="ems-sidebar-footer">
        <div className="ems-footer-line"></div>

        <div className="ems-footer-content">
          <span className="ems-footer-status"></span>

          <span>System Online</span>
        </div>

        <small>AI-EMS • Secure Workspace</small>
      </div>

    </aside>
  );
}

export default Sidebar;