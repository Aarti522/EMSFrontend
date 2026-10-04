import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "../../styles/ai-resume.css";

function ResumeScreening() {
  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  // =========================================================
  // ROLE ACCESS
  // ADMIN -> ACCESS
  // HR -> ACCESS
  // MANAGER -> NO ACCESS
  // EMPLOYEE -> NO ACCESS
  // =========================================================

  const hasAccess =
    userRole === "ADMIN" ||
    userRole === "HR";

  // =========================================================
  // STATES
  // =========================================================

  const [resume, setResume] = useState(null);

  const [jobDescription, setJobDescription] = useState("");

  const [jobRole, setJobRole] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  // =========================================================
  // FILE CHANGE
  // =========================================================

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];

    setError("");
    setResult(null);

    if (!file) {
      setResume(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setResume(null);

      setError(
        "Only PDF resume files are allowed."
      );

      return;
    }

    setResume(file);
  };

  // =========================================================
  // SUBMIT RESUME
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!resume) {
      setError(
        "Please upload a resume PDF."
      );

      return;
    }

    if (resume.type !== "application/pdf") {
      setError(
        "Only PDF files are allowed."
      );

      return;
    }

    if (!jobRole.trim()) {
      setError(
        "Please enter the job role."
      );

      return;
    }

    if (!jobDescription.trim()) {
      setError(
        "Please enter the job description."
      );

      return;
    }

    try {
      setLoading(true);

      // =======================================================
      // FORM DATA
      // =======================================================

      const formData = new FormData();

      // Resume PDF
      formData.append(
        "resume",
        resume
      );

      // IMPORTANT:
      // Spring Boot expects:
      // @RequestParam("job_description")
      //
      // Therefore the frontend MUST send
      // "job_description", not "jobDescription".

      formData.append(
        "job_description",
        jobDescription.trim()
      );

      // Job role
      formData.append(
        "role",
        jobRole.trim()
      );

      console.log(
        "Resume Screening Request:",
        {
          fileName: resume.name,
          fileSize: resume.size,
          role: jobRole.trim(),
          jobDescription:
            jobDescription.trim()
        }
      );

      // =======================================================
      // API REQUEST
      // =======================================================
      //
      // api.js automatically:
      // 1. Uses VITE_API_URL
      // 2. Adds JWT token
      // 3. Calls deployed Spring Boot backend
      //
      // Do NOT manually set Content-Type.
      // Browser/Axios will automatically create the
      // multipart/form-data boundary.
      // =======================================================

      const response = await api.post(
        "/ai/resume",
        formData
      );

      console.log(
        "Resume Screening Response:",
        response.data
      );

      // =======================================================
      // HANDLE RESPONSE
      // =======================================================

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

      setResult(
        resumeResult
      );

    } catch (err) {
      console.error(
        "Resume screening error:",
        err
      );

      console.error(
        "Resume screening status:",
        err?.response?.status
      );

      console.error(
        "Resume screening error response:",
        err?.response?.data
      );

      let errorMessage =
        "Resume screening failed.";

      // -------------------------------------------------------
      // 401
      // -------------------------------------------------------

      if (
        err?.response?.status === 401
      ) {
        errorMessage =
          "Your session has expired. Please login again.";
      }

      // -------------------------------------------------------
      // 403
      // -------------------------------------------------------

      else if (
        err?.response?.status === 403
      ) {
        errorMessage =
          "Access denied. Resume Screening is available only for ADMIN and HR.";
      }

      // -------------------------------------------------------
      // 404
      // -------------------------------------------------------

      else if (
        err?.response?.status === 404
      ) {
        errorMessage =
          "Resume Screening endpoint not found.";
      }

      // -------------------------------------------------------
      // 400
      // -------------------------------------------------------

      else if (
        err?.response?.status === 400
      ) {
        if (
          typeof err?.response?.data ===
          "string"
        ) {
          errorMessage =
            err.response.data;
        } else {
          errorMessage =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Invalid resume screening request.";
        }
      }

      // -------------------------------------------------------
      // 500
      // -------------------------------------------------------

      else if (
        err?.response?.status === 500
      ) {
        if (
          typeof err?.response?.data ===
          "string"
        ) {
          errorMessage =
            err.response.data;
        } else {
          errorMessage =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Resume Screening server error. Please check Spring Boot and Python AI service.";
        }
      }

      // -------------------------------------------------------
      // OTHER ERROR
      // -------------------------------------------------------

      else if (
        err?.response?.data?.message
      ) {
        errorMessage =
          err.response.data.message;
      }

      else if (
        err?.response?.data?.error
      ) {
        errorMessage =
          err.response.data.error;
      }

      else if (
        typeof err?.response?.data ===
        "string"
      ) {
        errorMessage =
          err.response.data;
      }

      else if (
        err?.message
      ) {
        errorMessage =
          err.message;
      }

      setError(
        String(errorMessage)
      );

    } finally {
      setLoading(false);
    }
  };

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

          <h1>
            Access Restricted
          </h1>

          <p>
            Resume Screening is available only for
            <strong> ADMIN </strong>
            and
            <strong> HR </strong>
            users.
          </p>

          <div className="access-role-badge">
            Current Role:
            {" "}
            {userRole || "UNKNOWN"}
          </div>

          <span className="access-denied-message">
            You do not have permission to access
            this AI feature.
          </span>

        </div>

      </div>
    );
  }

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

          <h1>
            ▤ Resume Screening
          </h1>

          <p>
            AI analyzes a candidate&apos;s resume
            against the job description and provides
            screening insights.
          </p>

        </div>

        <div className="ai-badge">
          🤖 AI Powered
        </div>

      </div>

      {/* =====================================================
          FORM CARD
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
                    {(resume.size / 1024)
                      .toFixed(1)} KB
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
                setJobRole(
                  e.target.value
                )
              }
              placeholder="Example: Software Developer"
              required
            />

            <small>
              Enter the position for which the
              candidate is being screened.
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
                setJobDescription(
                  e.target.value
                )
              }
              placeholder="Paste the complete job description here..."
              required
            />

            <small>
              Include required skills,
              qualifications, experience and
              responsibilities.
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

      {/* =====================================================
          RESULT
      ===================================================== */}

      {result && (

        <div className="ai-result">

          {/* RESULT HEADER */}

          <div className="result-header">

            <div>

              <h2>
                🧠 AI Screening Result
              </h2>

              <p>
                Resume analysis completed successfully.
              </p>

            </div>

            <div className="result-badge">
              AI Analysis
            </div>

          </div>

          {/* RESULT CONTENT */}

          <div className="result-content">

            {(() => {

              const screening =
                result?.data ??
                result;

              const matchScore =
                Number(
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

              const normalizedMatchScore =
                Math.max(
                  0,
                  Math.min(
                    100,
                    matchScore
                  )
                );

              return (
                <>

                  {/* =========================================
                      ANALYSIS DETAILS
                  ========================================= */}

                  <div className="analysis-section">

                    <h3 className="analysis-title">
                      Analysis Details
                    </h3>

                    {/* MATCH SCORE */}

                    <div className="result-item">

                      <span>
                        Match Score
                      </span>

                      <strong>
                        {normalizedMatchScore}%
                      </strong>

                    </div>

                    {/* RECOMMENDATION */}

                    <div className="recommendation-box">

                      <strong>
                        Recommendation
                      </strong>

                      <p>
                        {recommendation}
                      </p>

                    </div>

                    {/* MATCHED SKILLS */}

                    <div className="skills-section">

                      <div className="skills-box">

                        <h3>
                          Matched Skills
                        </h3>

                        <div className="skills-list">

                          {Array.isArray(
                            matchedSkills
                          ) &&
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

                      {/* MISSING SKILLS */}

                      <div className="skills-box">

                        <h3>
                          Missing Skills
                        </h3>

                        <div className="skills-list">

                          {Array.isArray(
                            missingSkills
                          ) &&
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

                    {/* AI SUMMARY */}

                    <div className="ai-summary">

                      <h3>
                        🤖 AI Analysis
                      </h3>

                      <p>
                        {summary}
                      </p>

                    </div>

                  </div>

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
