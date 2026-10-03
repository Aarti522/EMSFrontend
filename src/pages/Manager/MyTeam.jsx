
import { useEffect, useState } from "react";
import { getMyTeam } from "../../services/managerService";
import "../../styles/myteam.css";

function MyTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyTeam();
  }, []);

  const fetchMyTeam = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyTeam();
      setTeam(data);
    } catch (err) {
      console.error("Error fetching team:", err);

      if (err.response?.status === 403) {
        setError("You are not authorized to view this team.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load team members."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Get employee initials for avatar
  const getInitials = (name) => {
    if (!name) return "EM";

    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0][0] + words[words.length - 1][0]
    ).toUpperCase();
  };

  // Loading state
  if (loading) {
    return (
      <div className="my-team-page">
        <div className="my-team-loading">
          <div className="my-team-loading-box">
            <span className="my-team-spinner"></span>
            <span>Loading team members...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="my-team-page">
        <div className="my-team-error">
          <div className="my-team-error-icon">!</div>

          <span>{error}</span>

          <button
            type="button"
            className="my-team-retry"
            onClick={fetchMyTeam}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-team-page">

      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="my-team-header">

        <div className="my-team-title-section">
          <span className="my-team-eyebrow">
            Team Management
          </span>

          <h2>My Team</h2>

          <p>
            View and manage information about your active
            team members.
          </p>
        </div>

        {/* Team Count */}
        <div className="my-team-count">
          <span className="my-team-count-number">
            {team.length}
          </span>

          <span>
            {team.length === 1
              ? "Team Member"
              : "Team Members"}
          </span>
        </div>
      </div>

      {/* =========================
          EMPTY STATE
      ========================== */}
      {team.length === 0 ? (
        <div className="my-team-empty">

          <div className="my-team-empty-icon">
            👥
          </div>

          <h3>No Active Team Members</h3>

          <p>
            There are currently no active employees assigned
            to your team.
          </p>
        </div>
      ) : (

        /* =========================
           TEAM CARDS
        ========================== */
        <div className="my-team-grid">

          {team.map((employee) => (
            <div
              className="my-team-card"
              key={employee.id}
            >

              {/* Card Header */}
              <div className="my-team-card-header">

                {/* Avatar */}
                <div className="my-team-avatar">
                  {getInitials(employee.name)}
                </div>

                {/* Name + Designation */}
                <div className="my-team-employee-heading">
                  <h3 title={employee.name}>
                    {employee.name}
                  </h3>

                  <span
                    className="my-team-designation"
                    title={employee.designation || "Not assigned"}
                  >
                    {employee.designation || "Not assigned"}
                  </span>
                </div>

                {/* Status Badge */}
                <span className="my-team-status">
                  {employee.status}
                </span>
              </div>

              {/* Employee Details */}
              <div className="my-team-details">

                {/* Email */}
                <div className="my-team-detail">
                  <div className="my-team-detail-icon">
                    ✉
                  </div>

                  <div className="my-team-detail-content">
                    <span className="my-team-detail-label">
                      Email
                    </span>

                    <span
                      className="my-team-detail-value"
                      title={employee.email}
                    >
                      {employee.email || "Not available"}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="my-team-detail">
                  <div className="my-team-detail-icon">
                    ☎
                  </div>

                  <div className="my-team-detail-content">
                    <span className="my-team-detail-label">
                      Phone
                    </span>

                    <span className="my-team-detail-value">
                      {employee.phone || "Not available"}
                    </span>
                  </div>
                </div>

                {/* Designation */}
                <div className="my-team-detail">
                  <div className="my-team-detail-icon">
                    💼
                  </div>

                  <div className="my-team-detail-content">
                    <span className="my-team-detail-label">
                      Designation
                    </span>

                    <span className="my-team-detail-value">
                      {employee.designation || "Not assigned"}
                    </span>
                  </div>
                </div>

                {/* Department */}
                <div className="my-team-detail">
                  <div className="my-team-detail-icon">
                    🏢
                  </div>

                  <div className="my-team-detail-content">
                    <span className="my-team-detail-label">
                      Department
                    </span>

                    <span className="my-team-detail-value">
                      {employee.department?.name ||
                        "Not assigned"}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default MyTeam;
