import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "../../styles/ai-performance.css";

function PerformancePrediction() {
  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  // =========================================================
  // FORM STATES
  // =========================================================

  const [employeeId, setEmployeeId] = useState("");

  const [attendancePercentage, setAttendancePercentage] =
    useState("");

  const [experienceYears, setExperienceYears] = useState("");

  const [projectsCompleted, setProjectsCompleted] =
    useState("");

  const [tasksCompleted, setTasksCompleted] =
    useState("");

  const [previousRating, setPreviousRating] =
    useState("");

  const [trainingCompleted, setTrainingCompleted] =
    useState("");

  const [overtimeHours, setOvertimeHours] =
    useState("");

  const [leaveDays, setLeaveDays] = useState("");

  // =========================================================
  // LOGGED-IN EMPLOYEE PROFILE
  // Used only for EMPLOYEE role
  // =========================================================

  const [myEmployeeId, setMyEmployeeId] = useState(null);
  const [myEmployeeName, setMyEmployeeName] = useState("");

  const [profileLoading, setProfileLoading] =
    useState(false);

  // =========================================================
  // RESULT / LOADING
  // =========================================================

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD LOGGED-IN EMPLOYEE PROFILE
  // =========================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        const response = await api.get("/profile");

        console.log(
          "Performance Profile:",
          response.data
        );

        if (response.data?.employeeId != null) {
          setMyEmployeeId(
            Number(response.data.employeeId)
          );
        }

        if (response.data?.employeeName) {
          setMyEmployeeName(
            response.data.employeeName
          );
        } else if (response.data?.name) {
          setMyEmployeeName(
            response.data.name
          );
        }
      } catch (err) {
        console.error(
          "Profile loading error:",
          err
        );

        setError(
          "Unable to load your employee profile."
        );
      } finally {
        setProfileLoading(false);
      }
    };

    // Employee should automatically get own Employee ID
    if (userRole === "EMPLOYEE") {
      loadProfile();
    }
  }, [userRole]);

  // =========================================================
  // SAFE TEXT
  // =========================================================

  const safeText = (value) => {
    if (value === null || value === undefined) {
      return "N/A";
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.join(", ");
      }

      return (
        value.message ||
        value.text ||
        value.value ||
        value.result ||
        JSON.stringify(value)
      );
    }

    return String(value);
  };

  // =========================================================
  // PREDICT PERFORMANCE
  // =========================================================

  const handlePredict = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    // =======================================================
    // ROLE BASED EMPLOYEE ID
    // =======================================================

    let finalEmployeeId;

    // EMPLOYEE -> Own Employee ID only
    if (userRole === "EMPLOYEE") {
      if (!myEmployeeId) {
        setError(
          "Unable to find your Employee ID."
        );
        return;
      }

      finalEmployeeId = myEmployeeId;
    }

    // ADMIN / HR / MANAGER
    else {
      if (!employeeId) {
        setError(
          userRole === "MANAGER"
            ? "Please enter your team member's Employee ID."
            : "Please enter Employee ID."
        );
        return;
      }

      finalEmployeeId = Number(employeeId);
    }

    // =======================================================
    // VALIDATION
    // =======================================================

    if (
      attendancePercentage === "" ||
      Number(attendancePercentage) < 0 ||
      Number(attendancePercentage) > 100
    ) {
      setError(
        "Attendance Percentage must be between 0 and 100."
      );
      return;
    }

    if (experienceYears === "") {
      setError("Please enter Experience Years.");
      return;
    }

    if (projectsCompleted === "") {
      setError("Please enter Projects Completed.");
      return;
    }

    if (tasksCompleted === "") {
      setError("Please enter Tasks Completed.");
      return;
    }

    if (previousRating === "") {
      setError("Please enter Previous Performance Rating.");
      return;
    }

    const rating = Number(previousRating);

    if (rating < 0 || rating > 5) {
      setError(
        "Previous Rating must be between 0 and 5."
      );
      return;
    }

    if (trainingCompleted === "") {
      setError("Please enter Training Completed.");
      return;
    }

    if (overtimeHours === "") {
      setError("Please enter Overtime Hours.");
      return;
    }

    if (leaveDays === "") {
      setError("Please enter Leave Days.");
      return;
    }

          // =======================================================
      // API REQUEST
      // =======================================================

      try {
        setLoading(true);
        setError("");
        setResult(null);

        const requestBody = {
          employeeId: Number(finalEmployeeId),

          // Important for backend role-based authorization
          role: userRole,

          attendancePercentage:
            Number(attendancePercentage),

          experienceYears:
            Number(experienceYears),

          projectsCompleted:
            Number(projectsCompleted),

          tasksCompleted:
            Number(tasksCompleted),

          previousRating:
            Number(previousRating),

          trainingCompleted:
            Number(trainingCompleted),

          overtimeHours:
            Number(overtimeHours),

          leaveDays:
            Number(leaveDays),
        };

        console.log(
          "Performance AI Request:",
          requestBody
        );

        // Uses VITE_API_URL automatically through api.js
        // JWT token is also added automatically by api.js
        const response = await api.post(
          "/ai/performance",
          requestBody
        );

        console.log(
          "Performance AI Response:",
          response.data
        );

        // Supports both wrapped and direct backend responses
        const performanceResult =
          response.data?.data ??
          response.data;

        if (
          performanceResult === null ||
          performanceResult === undefined
        ) {
          setError(
            "Performance AI returned an empty response."
          );
          return;
        }

        setResult(performanceResult);

      } catch (err) {
        console.error(
          "Performance prediction error:",
          err
        );

        console.error(
          "Performance error response:",
          err?.response?.data
        );

        let errorMessage =
          "Unable to generate performance prediction.";

        if (err?.response?.status === 401) {
          errorMessage =
            "Session expired. Please login again.";
        }

        else if (err?.response?.status === 403) {
          errorMessage =
            userRole === "MANAGER"
              ? "You can predict performance only for employees in your team."
              : "You are not authorized to access this performance prediction.";
        }

        else if (err?.response?.status === 404) {
          errorMessage =
            "Performance AI endpoint not found.";
        }

        else if (err?.response?.status === 500) {
          errorMessage =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Performance AI server error. Please check Spring Boot and Python AI service.";
        }

        else if (err?.response?.data?.message) {
          errorMessage = safeText(
            err.response.data.message
          );
        }

        else if (err?.response?.data?.detail) {
          errorMessage = safeText(
            err.response.data.detail
          );
        }

        else if (err?.response?.data?.error) {
          errorMessage = safeText(
            err.response.data.error
          );
        }

        else if (err?.response?.data) {
          errorMessage = safeText(
            err.response.data
          );
        }

        setError(errorMessage);

      } finally {
        setLoading(false);
      }
      };
  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    // Don't reset Employee's automatically loaded ID
    if (userRole !== "EMPLOYEE") {
      setEmployeeId("");
    }

    setAttendancePercentage("");
    setExperienceYears("");
    setProjectsCompleted("");
    setTasksCompleted("");
    setPreviousRating("");
    setTrainingCompleted("");
    setOvertimeHours("");
    setLeaveDays("");

    setResult(null);
    setError("");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="ai-performance-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="performance-header">

        <div>
          <h1>
            AI Performance Prediction
          </h1>

          <p>
            Predict employee performance using
            AI-based analysis.
          </p>
        </div>

        <div className="ai-badge">
          🤖 AI Powered
        </div>

      </div>


      {/* =====================================================
          ACCESS INFORMATION
      ===================================================== */}

      <div className="performance-access-info">

        {userRole === "ADMIN" && (
          <span>
            🔐 Admin Access — All Employees
          </span>
        )}

        {userRole === "HR" && (
          <span>
            🔐 HR Access — All Employees
          </span>
        )}

        {userRole === "MANAGER" && (
          <span>
            👥 Manager Access — Team Employees Only
          </span>
        )}

        {userRole === "EMPLOYEE" && (
          <span>
            👤 Employee Access — Own Performance Only
          </span>
        )}

      </div>


      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className="performance-layout">


        {/* ===================================================
            INPUT CARD
        =================================================== */}

        <div className="performance-card">

          <div className="card-heading">

            <div className="heading-icon">
              📊
            </div>

            <div>
              <h2>
                Employee Performance
              </h2>

              <p>
                Enter employee details for
                performance prediction.
              </p>
            </div>

          </div>


          <form onSubmit={handlePredict}>

            {/* =================================================
                EMPLOYEE ID
            ================================================= */}

            {userRole === "EMPLOYEE" ? (

              <div className="form-group">

                <label>
                  Your Employee ID
                </label>

                <input
                  type="number"
                  value={
                    myEmployeeId || ""
                  }
                  disabled
                />

                <small>
                  Your Employee ID is automatically
                  loaded from your profile.
                </small>

              </div>

            ) : (

              <div className="form-group">

                <label>
                  {userRole === "MANAGER"
                    ? "Team Employee ID"
                    : "Employee ID"}
                </label>

                <input
                  type="number"
                  value={employeeId}
                  onChange={(e) =>
                    setEmployeeId(
                      e.target.value
                    )
                  }
                  placeholder={
                    userRole === "MANAGER"
                      ? "Enter Team Employee ID"
                      : "Enter Employee ID"
                  }
                  min="1"
                  required
                />

                {userRole === "MANAGER" && (
                  <small>
                    You can analyze employees
                    belonging to your team only.
                  </small>
                )}

              </div>

            )}


            {/* =================================================
                EMPLOYEE NAME - EMPLOYEE ONLY
            ================================================= */}

            {userRole === "EMPLOYEE" && (
              <div className="form-group">

                <label>
                  Employee Name
                </label>

                <input
                  type="text"
                  value={
                    myEmployeeName || ""
                  }
                  disabled
                />

              </div>
            )}


            {/* =================================================
                ATTENDANCE
            ================================================= */}

            <div className="form-group">

              <label>
                Attendance Percentage
              </label>

              <input
                type="number"
                value={
                  attendancePercentage
                }
                onChange={(e) =>
                  setAttendancePercentage(
                    e.target.value
                  )
                }
                placeholder="Example: 90"
                min="0"
                max="100"
                step="0.1"
                required
              />

              <small>
                Enter attendance percentage
                between 0 and 100.
              </small>

            </div>


            {/* =================================================
                EXPERIENCE
            ================================================= */}

            <div className="form-group">

              <label>
                Experience (Years)
              </label>

              <input
                type="number"
                value={experienceYears}
                onChange={(e) =>
                  setExperienceYears(
                    e.target.value
                  )
                }
                placeholder="Example: 2"
                min="0"
                step="0.1"
                required
              />

            </div>


            {/* =================================================
                PROJECTS
            ================================================= */}

            <div className="form-group">

              <label>
                Projects Completed
              </label>

              <input
                type="number"
                value={projectsCompleted}
                onChange={(e) =>
                  setProjectsCompleted(
                    e.target.value
                  )
                }
                placeholder="Example: 5"
                min="0"
                required
              />

            </div>


            {/* =================================================
                TASKS
            ================================================= */}

            <div className="form-group">

              <label>
                Tasks Completed
              </label>

              <input
                type="number"
                value={tasksCompleted}
                onChange={(e) =>
                  setTasksCompleted(
                    e.target.value
                  )
                }
                placeholder="Example: 20"
                min="0"
                required
              />

            </div>


            {/* =================================================
                PREVIOUS RATING
            ================================================= */}

            <div className="form-group">

              <label>
                Previous Performance Rating
              </label>

              <input
                type="number"
                value={previousRating}
                onChange={(e) =>
                  setPreviousRating(
                    e.target.value
                  )
                }
                placeholder="Example: 4"
                min="0"
                max="5"
                step="0.1"
                required
              />

              <small>
                Rating must be between 0 and 5.
              </small>

            </div>


            {/* =================================================
                TRAINING
            ================================================= */}

            <div className="form-group">

              <label>
                Training Completed
              </label>

              <input
                type="number"
                value={trainingCompleted}
                onChange={(e) =>
                  setTrainingCompleted(
                    e.target.value
                  )
                }
                placeholder="Example: 3"
                min="0"
                required
              />

            </div>


            {/* =================================================
                OVERTIME
            ================================================= */}

            <div className="form-group">

              <label>
                Overtime Hours
              </label>

              <input
                type="number"
                value={overtimeHours}
                onChange={(e) =>
                  setOvertimeHours(
                    e.target.value
                  )
                }
                placeholder="Example: 10"
                min="0"
                step="0.1"
                required
              />

            </div>


            {/* =================================================
                LEAVE
            ================================================= */}

            <div className="form-group">

              <label>
                Leave Days
              </label>

              <input
                type="number"
                value={leaveDays}
                onChange={(e) =>
                  setLeaveDays(
                    e.target.value
                  )
                }
                placeholder="Example: 5"
                min="0"
                step="0.1"
                required
              />

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="performance-error">

                <span>!</span>

                <span>
                  {safeText(error)}
                </span>

              </div>
            )}


            {/* =================================================
                BUTTON
            ================================================= */}

            <button
              type="submit"
              className="predict-btn"
              disabled={
                loading ||
                profileLoading
              }
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  ✨ Predict Performance
                </>
              )}

            </button>

          </form>

        </div>


        {/* ===================================================
            RESULT CARD
        =================================================== */}

        <div className="performance-card result-card">

          <div className="card-heading">

            <div className="heading-icon">
              🧠
            </div>

            <div>
              <h2>
                Prediction Result
              </h2>

              <p>
                AI-generated performance analysis.
              </p>
            </div>

          </div>


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!result && !loading && (

            <div className="result-empty">

              <div className="empty-icon">
                📊
              </div>

              <h3>
                No Prediction Yet
              </h3>

              <p>
                Enter employee information and
                click "Predict Performance".
              </p>

            </div>

          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="result-loading">

              <div className="large-spinner"></div>

              <h3>
                AI is analyzing...
              </h3>

              <p>
                Please wait while employee
                data is being processed.
              </p>

            </div>

          )}


          {/* =================================================
              RESULT
          ================================================= */}

          {result && !loading && (

            <div className="prediction-result">

              {/* MAIN PREDICTION */}

              <div className="prediction-main">

                <span>
                  Performance Prediction
                </span>

                <strong>
                  {safeText(
                    result.prediction ||
                    result.performance ||
                    result.result ||
                    result.predictedPerformance
                  )}
                </strong>

              </div>


              {/* RESULT GRID */}

              <div className="result-grid">

                {/* EMPLOYEE ID */}

                <div className="result-item">

                  <span>
                    Employee ID
                  </span>

                  <strong>
                    {result.employeeId ??
                      myEmployeeId ??
                      employeeId}
                  </strong>

                </div>


                {/* EMPLOYEE NAME */}

                {(
                  result.employeeName ||
                  myEmployeeName
                ) && (

                  <div className="result-item">

                    <span>
                      Employee Name
                    </span>

                    <strong>
                      {result.employeeName ||
                        myEmployeeName}
                    </strong>

                  </div>

                )}


                {/* PERFORMANCE SCORE */}

                <div className="result-item">

                  <span>
                    Performance Score
                  </span>

                  <strong>

                    {result.score != null
                      ? safeText(result.score)
                      : result.performanceScore != null
                      ? safeText(
                          result.performanceScore
                        )
                      : result.predictedScore != null
                      ? safeText(
                          result.predictedScore
                        )
                      : "N/A"}

                  </strong>

                </div>


                {/* CONFIDENCE */}

                <div className="result-item">

                  <span>
                    Confidence
                  </span>

                  <strong>

                    {result.confidence != null
                      ? `${safeText(
                          result.confidence
                        )}${
                          String(
                            result.confidence
                          ).includes("%")
                            ? ""
                            : "%"
                        }`
                      : "N/A"}

                  </strong>

                </div>


                {/* ATTENDANCE */}

                <div className="result-item">

                  <span>
                    Attendance
                  </span>

                  <strong>
                    {attendancePercentage !== ""
                      ? `${attendancePercentage}%`
                      : "N/A"}
                  </strong>

                </div>

              </div>


              {/* AI EXPLANATION */}

              {(result.message ||
                result.explanation ||
                result.reason ||
                result.details) && (

                <div className="ai-explanation">

                  <strong>
                    🧠 AI Analysis
                  </strong>

                  <p>
                    {safeText(
                      result.message ||
                      result.explanation ||
                      result.reason ||
                      result.details
                    )}
                  </p>

                </div>

              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default PerformancePrediction;