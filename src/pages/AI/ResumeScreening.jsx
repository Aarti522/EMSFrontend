import { useState } from "react";
import axios from "axios";
import "../../styles/ai-resume.css";
import { useAuth } from "../../context/AuthContext";

function ResumeScreening() {
  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  // =========================================================
  // ROLE ACCESS
  // ADMIN  -> ALL
  // HR     -> ALL
  // MANAGER -> NO ACCESS
  // EMPLOYEE -> NO ACCESS
  // =========================================================

  const hasAccess = userRole === "ADMIN" || userRole === "HR";

  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobRole, setJobRole] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // ACCESS DENIED
  // =========================================================

  if (!hasAccess) {
    return (
      <div className="ai-page">
        <div className="ai-access-denied">
          <div className="access-denied-icon">
            🔒
          </div>

          <h1>Access Restricted</h1>

          <p>
            Resume Screening is available only for
            <strong> ADMIN </strong> and <strong> HR </strong> users.
          </p>

          <div className="access-role-badge">
            Current Role: {userRole || "UNKNOWN"}
          </div>

          <span className="access-denied-message">
            You do not have permission to access this AI feature.
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // SUBMIT RESUME
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    // ================= VALIDATION =================

    if (!resume) {
      setError("Please upload a resume PDF.");
      return;
    }

    if (resume.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    if (!jobRole.trim()) {
      setError("Please enter the job role.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // ================= FORM DATA =================

      const formData = new FormData();

      formData.append("resume", resume);
      formData.append("job_description", jobDescription);
      formData.append("role", jobRole);

    // ================= API REQUEST =================

const response = await api.post(
  "/ai/resume",
  formData
);

console.log(
  "Resume Screening Response:",
  response.data
);

// Spring response may be:
// { success: true, data: {...}, message: "..." }
// or direct {...}

const resumeResult =
  response.data?.data ??
  response.data;

if (
  resumeResult === null ||
  resumeResult === undefined
) {
  setError(
    "Resume screening returned an empty response."
  );
  return;
}

setResult(resumeResult);

} catch (err) {
  console.error(
    "Resume screening error:",
    err
  );

  console.error(
    "Resume screening error response:",
    err?.response?.data
  );

  let errorMessage =
    "Resume screening failed.";

  if (err?.response?.status === 401) {
    errorMessage =
      "Your session has expired. Please login again.";
  }

  else if (err?.response?.status === 403) {
    errorMessage =
      "Access denied. You do not have permission to use Resume Screening.";
  }

  else if (err?.response?.status === 404) {
    errorMessage =
      "Resume Screening endpoint not found.";
  }

  else if (err?.response?.status === 500) {
    errorMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Resume Screening server error. Please check Spring Boot and Python AI service.";
  }

  else if (err?.response?.data?.message) {
    errorMessage =
      err.response.data.message;
  }

  else if (err?.response?.data?.error) {
    errorMessage =
      err.response.data.error;
  }

  else if (
    typeof err?.response?.data === "string"
  ) {
    errorMessage =
      err.response.data;
  }

  setError(errorMessage);

} finally {
  setLoading(false);
}
};

  // =========================================================
  // FILE CHANGE
  // =========================================================

  const handleResumeChange = (e) => {
    const file = e.target.files[0];

    setError("");
    setResult(null);

    if (!file) {
      setResume(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setResume(null);
      setError("Only PDF resume files are allowed.");
      return;
    }

    setResume(file);
  };

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
          <h1>▤ Resume Screening</h1>

          <p>
            AI analyzes a candidate's resume against the
            job description and provides screening insights.
          </p>
        </div>

        <div className="ai-badge">
          🤖 AI Powered
        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="ai-card">

        <form onSubmit={handleSubmit}>

          {/* =================================================
              RESUME UPLOAD
          ================================================= */}

          <div className="form-group">

            <label>
              Resume PDF
            </label>

            <div className="resume-upload-box">

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleResumeChange}
              />

              <div className="upload-content">

                <div className="upload-icon">
                  📄
                </div>

                <h3>
                  Upload Candidate Resume
                </h3>

                <p>
                  Select a PDF file to upload
                </p>

              </div>

            </div>

            {/* SELECTED FILE */}

            {resume && (
              <div className="selected-file">

                <span>
                  📎
                </span>

                <div>
                  <strong>
                    {resume.name}
                  </strong>

                  <small>
                    {(resume.size / 1024).toFixed(1)} KB
                  </small>
                </div>

              </div>
            )}

          </div>

          {/* =================================================
              JOB ROLE
          ================================================= */}

          <div className="form-group">

            <label>
              Job Role
            </label>

            <input
              type="text"
              value={jobRole}
              onChange={(e) =>
                setJobRole(e.target.value)
              }
              placeholder="Example: Software Developer"
            />

            <small>
              Enter the position for which the candidate
              is being screened.
            </small>

          </div>

          {/* =================================================
              JOB DESCRIPTION
          ================================================= */}

          <div className="form-group">

            <label>
              Job Description
            </label>

            <textarea
              rows="9"
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
              placeholder="Paste the complete job description here..."
            />

            <small>
              Include required skills, qualifications,
              experience and responsibilities.
            </small>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="error-message">

              <span>
                !
              </span>

              <span>
                {error}
              </span>

            </div>
          )}

          {/* =================================================
              BUTTON
          ================================================= */}

          <button
            type="submit"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing Resume...
              </>
            ) : (
              <>
                🔍 Screen Resume
              </>
            )}

          </button>

        </form>

      </div>

      {result && (
  <div className="ai-result">

    {/* =====================================================
        RESULT HEADER
       ===================================================== */}
    <div className="result-header">
      <div>
        <h2>🧠 AI Screening Result</h2>
        <p>
          Resume analysis completed successfully.
        </p>
      </div>

      <div className="result-badge">
        AI Analysis
      </div>
    </div>


    {/* =====================================================
        RESULT CONTENT
       ===================================================== */}
    <div className="result-content">

      {(() => {
        // Backend response:
        // {
        //   success: true,
        //   data: {...},
        //   message: "..."
        // }

        const screening = result?.data ?? result;

        const matchScore = Number(
          screening?.matchScore ??
          screening?.match_score ??
          0
        );

        const recommendation =
          screening?.recommendation ??
          screening?.recommendationText ??
          "N/A";

        const matchedSkills =
          screening?.matchedSkills ??
          screening?.matched_skills ??
          [];

        const missingSkills =
          screening?.missingSkills ??
          screening?.missing_skills ??
          [];

        const summary =
          screening?.summary ??
          screening?.analysis ??
          screening?.message ??
          "No AI analysis summary available.";

        return (
          <>
            {/* =================================================
                ANALYSIS DETAILS
               ================================================= */}
            <div className="analysis-section">

              <h3 className="analysis-title">
                Analysis Details
              </h3>


              {/* ===============================
                  MATCH SCORE
                 =============================== */}
              <div className="result-item">
                <span>Match Score</span>

                <strong>
                  {Math.max(
                    0,
                    Math.min(100, matchScore)
                  )}
                  %
                </strong>
              </div>


              {/* ===============================
                  RECOMMENDATION
                 =============================== */}
              <div className="recommendation-box">

                <strong>
                  Recommendation
                </strong>

                <p>
                  {recommendation}
                </p>

              </div>


              {/* ===============================
                  MATCHED SKILLS
                 =============================== */}
              <div className="skills-section">

                <div className="skills-box">

                  <h3>
                    Matched Skills
                  </h3>

                  <div className="skills-list">

                    {Array.isArray(matchedSkills) &&
                    matchedSkills.length > 0 ? (
                      matchedSkills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="skill-tag matched"
                          >
                            ✓ {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span className="skill-tag">
                        No matched skills
                      </span>
                    )}

                  </div>

                </div>


                {/* ===============================
                    MISSING SKILLS
                   =============================== */}
                <div className="skills-box">

                  <h3>
                    Missing Skills
                  </h3>

                  <div className="skills-list">

                    {Array.isArray(missingSkills) &&
                    missingSkills.length > 0 ? (
                      missingSkills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="skill-tag missing"
                          >
                            ✕ {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span className="skill-tag matched">
                        ✓ No missing skills
                      </span>
                    )}

                  </div>

                </div>

              </div>


              {/* =================================================
                  AI SUMMARY
                 ================================================= */}
              <div className="ai-summary">

                <h3>
                  🤖 AI Analysis
                </h3>

                <p>
                  {summary}
                </p>

              </div>

            </div>


            {/* =================================================
                OPTIONAL RAW RESPONSE
               ================================================= */}

            {/* 
              If you DON'T want JSON at all,
              keep this section commented.

              If you want it later for debugging,
              uncomment it.
            */}

            {/*
            <div className="raw-result">

              <h3>
                Analysis Details
              </h3>

              <pre>
                {JSON.stringify(
                  result,
                  null,
                  2
                )}
              </pre>

            </div>
            */}

          </>
        );
      })()}

    </div>

  </div>
)}

    </div>
  );
}

export default ResumeScreening;