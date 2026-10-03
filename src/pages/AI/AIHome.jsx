import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AIHome() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  // =========================================================
  // AI FEATURE ACCESS
  //
  // ADMIN
  //   Performance        -> All Employees
  //   Attrition          -> All Employees
  //   Resume Screening   -> All Candidates
  //   HR Chatbot         -> Organization
  //   Attendance Insights-> Organization
  //
  // HR
  //   Performance        -> All Employees
  //   Attrition          -> All Employees
  //   Resume Screening   -> All Candidates
  //   HR Chatbot         -> Organization
  //   Attendance Insights-> Organization
  //
  // MANAGER
  //   Performance        -> Own Team
  //   Attrition          -> Own Team
  //   Resume Screening   -> No Access
  //   HR Chatbot         -> Own Team
  //   Attendance Insights-> Own Team
  //
  // EMPLOYEE
  //   Performance        -> Own
  //   Attrition          -> No Access
  //   Resume Screening   -> No Access
  //   HR Chatbot         -> Own / General
  //   Attendance Insights-> Own Attendance
  // =========================================================

  const features = [
    {
      title: "AI Performance Prediction",

      description:
        "Predict employee performance using AI-based analysis.",

      icon: "📊",

      path: "/ai/performance",

      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },

    {
      title: "AI Attrition Prediction",

      description:
        "Identify employees who may have a higher attrition risk.",

      icon: "⚠️",

      path: "/ai/attrition",

      roles: ["ADMIN", "HR", "MANAGER"],
    },

    {
      title: "AI Resume Screening",

      description:
        "Screen and analyze candidate resumes using AI.",

      icon: "📄",

      path: "/ai/resume",

      roles: ["ADMIN", "HR"],
    },

    {
      title: "AI HR Chatbot",

      description:
        "Ask HR and employee-related questions using AI.",

      icon: "💬",

      path: "/ai/chatbot",

      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },

    {
      title: "Attendance AI Insights",

      description:
        "Analyze attendance, late days, absences and leave patterns using AI.",

      icon: "🕐",

      path: "/ai/attendance",

      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
  ];

  // =========================================================
  // SHOW ONLY FEATURES ALLOWED FOR CURRENT ROLE
  // =========================================================

  const allowedFeatures = features.filter((feature) =>
    feature.roles.includes(userRole)
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="ai-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="ai-header">

        <div>
          <h1>AI Features</h1>

          <p>
            AI-powered Employee Management System
          </p>
        </div>

        <div className="role-badge">
          Role: {userRole || "USER"}
        </div>

      </div>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <div className="ai-intro">

        <h2>
          Intelligent HR Management
        </h2>

        <p>
          Use artificial intelligence to analyze employee
          performance, attrition risk, resumes, attendance
          patterns and HR-related queries.
        </p>

      </div>

      {/* =====================================================
          AI FEATURE CARDS
      ===================================================== */}

      <div className="ai-grid">

        {allowedFeatures.map((feature) => (

          <div
            className="ai-card"
            key={feature.path}
            onClick={() => navigate(feature.path)}
          >

            {/* ICON */}

            <div className="ai-icon">
              {feature.icon}
            </div>

            {/* TITLE */}

            <h2>
              {feature.title}
            </h2>

            {/* DESCRIPTION */}

            <p>
              {feature.description}
            </p>

            {/* BUTTON */}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(feature.path);
              }}
            >
              Open Feature →
            </button>

          </div>

        ))}

      </div>

      {/* =====================================================
          NO FEATURE FALLBACK
      ===================================================== */}

      {allowedFeatures.length === 0 && (

        <div className="ai-card">

          <div className="ai-icon">
            🔒
          </div>

          <h2>
            No AI Features Available
          </h2>

          <p>
            No AI features are currently available
            for your role.
          </p>

        </div>

      )}

    </div>
  );
}

export default AIHome;
