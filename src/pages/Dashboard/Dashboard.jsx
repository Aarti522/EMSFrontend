import { useEffect, useState } from "react";
import { getDashboard } from "../../services/dashboardService";
import { useAuth } from "../../context/AuthContext";


function Dashboard() {
  const { role } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboard();

      console.log("Dashboard Response:", data);

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard Error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>

          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */
  if (error) {
    return (
      <div className="dashboard-state">
        <div className="dashboard-error-card">
          <div className="dashboard-error-icon">
            !
          </div>

          <h2>Unable to Load Dashboard</h2>

          <p>{error}</p>

          <button
            onClick={loadDashboard}
            className="dashboard-retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     NO DATA
  ========================= */
  if (!dashboard) {
    return (
      <div className="dashboard-state">
        <div className="dashboard-empty-card">
          <div className="dashboard-empty-icon">
            📊
          </div>

          <h2>No Dashboard Data</h2>

          <p>
            No dashboard information is currently available.
          </p>
        </div>
      </div>
    );
  }

  const currentRole = (
    dashboard.role ||
    role ||
    ""
  ).toUpperCase();

  /* =========================
     REUSABLE STAT CARD
  ========================= */
  const StatCard = ({
    title,
    value,
    icon,
    iconBg,
    iconColor,
    description,
  }) => (
    <div className="dashboard-stat-card">

      <div className="dashboard-stat-info">
        <p className="dashboard-stat-title">
          {title}
        </p>

        <p className="dashboard-stat-value">
          {value}
        </p>

        {description && (
          <p className="dashboard-stat-description">
            {description}
          </p>
        )}
      </div>

      <div
        className={`dashboard-stat-icon ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>

      <div className="dashboard-stat-decoration"></div>
    </div>
  );

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}
      <div className="dashboard-header">

        <div className="dashboard-header-content">

          <div className="dashboard-role-label">
            <span className="dashboard-status-dot"></span>

            <span>
              {currentRole} Dashboard
            </span>
          </div>

          <h1>
            Welcome back 👋
          </h1>

          <p>
            Here's what's happening with your organization today.
          </p>

        </div>

        <div className="dashboard-role-badge">

          <span>Role</span>

          <strong>
            {currentRole}
          </strong>

        </div>

      </div>


      {/* =====================================================
          ADMIN / HR / MANAGER
      ===================================================== */}
      {["ADMIN", "HR", "MANAGER"].includes(currentRole) && (
        <div>

          {/* SECTION TITLE */}
          <div className="dashboard-section-header">

            <div>
              <h2>Overview</h2>

              <p>
                Organization statistics and today's activity
              </p>
            </div>

          </div>


          {/* STAT CARDS */}
          <div className="dashboard-stat-grid">

            <StatCard
              title="Total Employees"
              value={dashboard.totalEmployees ?? 0}
              icon="👥"
              iconBg="dashboard-icon-indigo"
              iconColor="dashboard-icon-text-indigo"
              description="Registered employees"
            />

            <StatCard
              title="Total Departments"
              value={dashboard.totalDepartments ?? 0}
              icon="🏢"
              iconBg="dashboard-icon-blue"
              iconColor="dashboard-icon-text-blue"
              description="Active departments"
            />

            <StatCard
              title="Present Today"
              value={dashboard.presentToday ?? 0}
              icon="✓"
              iconBg="dashboard-icon-green"
              iconColor="dashboard-icon-text-green"
              description="Employees present"
            />

            <StatCard
              title="Absent Today"
              value={dashboard.absentToday ?? 0}
              icon="!"
              iconBg="dashboard-icon-red"
              iconColor="dashboard-icon-text-red"
              description="Employees absent"
            />

            <StatCard
              title="On Leave"
              value={dashboard.onLeave ?? 0}
              icon="☕"
              iconBg="dashboard-icon-amber"
              iconColor="dashboard-icon-text-amber"
              description="Currently on leave"
            />

            <StatCard
              title="Total Payroll"
              value={`₹${dashboard.totalPayroll ?? 0}`}
              icon="₹"
              iconBg="dashboard-icon-violet"
              iconColor="dashboard-icon-text-violet"
              description="Total payroll amount"
            />

          </div>


          {/* MANAGER DEPARTMENT */}
          {currentRole === "MANAGER" &&
            dashboard.department && (
              <div className="manager-department-card">

                <div className="manager-department-icon">
                  🏢
                </div>

                <div>
                  <p>
                    Your Department
                  </p>

                  <strong>
                    {dashboard.department}
                  </strong>
                </div>

              </div>
            )}

        </div>
      )}


      {/* =====================================================
          EMPLOYEE
      ===================================================== */}
      {currentRole === "EMPLOYEE" && (
        <div>

          <div className="dashboard-section-header employee-section">

            <div>
              <h2>My Overview</h2>

              <p>
                Your personal employee information and activity
              </p>
            </div>

          </div>


          {/* PERSONAL INFORMATION */}
          <div className="employee-profile-card">

            <div className="employee-profile-header">

              <div className="employee-avatar">
                {dashboard.employeeName
                  ? dashboard.employeeName
                      .charAt(0)
                      .toUpperCase()
                  : "E"}
              </div>

              <div>
                <h3>
                  {dashboard.employeeName || "Employee"}
                </h3>

                <p>
                  {dashboard.designation || "Employee"}
                </p>
              </div>

            </div>


            <div className="employee-info-grid">

              <div className="employee-info-item">
                <p>Email</p>

                <strong>
                  {dashboard.email || "N/A"}
                </strong>
              </div>

              <div className="employee-info-item">
                <p>Department</p>

                <strong>
                  {dashboard.department?.name ||
                    dashboard.department ||
                    "N/A"}
                </strong>
              </div>

              <div className="employee-info-item">
                <p>Designation</p>

                <strong>
                  {dashboard.designation || "N/A"}
                </strong>
              </div>

            </div>

          </div>


          {/* EMPLOYEE STAT CARDS */}
          <div className="dashboard-stat-grid employee-stat-grid">

            <StatCard
              title="Today's Attendance"
              value={dashboard.todayAttendance || "N/A"}
              icon="✓"
              iconBg="dashboard-icon-green"
              iconColor="dashboard-icon-text-green"
            />

            <StatCard
              title="Total Present"
              value={dashboard.totalPresent ?? 0}
              icon="📅"
              iconBg="dashboard-icon-blue"
              iconColor="dashboard-icon-text-blue"
            />

            <StatCard
              title="Total Absent"
              value={dashboard.totalAbsent ?? 0}
              icon="!"
              iconBg="dashboard-icon-red"
              iconColor="dashboard-icon-text-red"
            />

            <StatCard
              title="Leave Status"
              value={dashboard.leaveStatus || "N/A"}
              icon="☕"
              iconBg="dashboard-icon-amber"
              iconColor="dashboard-icon-text-amber"
            />

            <StatCard
              title="Salary"
              value={`₹${dashboard.salary ?? 0}`}
              icon="₹"
              iconBg="dashboard-icon-violet"
              iconColor="dashboard-icon-text-violet"
            />

          </div>

        </div>
      )}


      {/* =========================
          BOTTOM ACCENT
      ========================= */}
      <div className="dashboard-security-note">

        <span className="dashboard-security-dot"></span>

        <p>
          Dashboard data is securely loaded from your
          Employee Management System.
        </p>

      </div>

    </div>
  );
}

export default Dashboard;
