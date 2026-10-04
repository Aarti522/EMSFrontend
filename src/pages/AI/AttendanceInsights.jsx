import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "../../styles/ai-attendance.css";

function AttendanceInsights() {
  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  // =========================================================
  // FORM STATES
  // =========================================================

  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  const [currentMonthAttendance, setCurrentMonthAttendance] =
    useState("");

  const [previousMonthAttendance, setPreviousMonthAttendance] =
    useState("");

  const [lateDays, setLateDays] = useState("");
  const [absentDays, setAbsentDays] = useState("");
  const [leaveDays, setLeaveDays] = useState("");

  // =========================================================
  // LOGGED-IN USER PROFILE
  // =========================================================

  const [myEmployeeId, setMyEmployeeId] = useState(null);
  const [myEmployeeName, setMyEmployeeName] = useState("");

  const [managerDepartmentId, setManagerDepartmentId] =
    useState(null);

  const [managerDepartmentName, setManagerDepartmentName] =
    useState("");

  // =========================================================
  // MANAGER TEAM
  // =========================================================

  const [teamEmployees, setTeamEmployees] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  // =========================================================
  // RESULT / LOADING
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // HELPER FUNCTIONS
  // =========================================================

  const getEmployeeId = (employee) => {
    return (
      employee?.employeeId ??
      employee?.id ??
      employee?.employee_id ??
      null
    );
  };

  const getEmployeeName = (employee) => {
    return (
      employee?.employeeName ??
      employee?.name ??
      employee?.fullName ??
      employee?.employee_name ??
      ""
    );
  };

  const getDepartmentId = (employee) => {
    return (
      employee?.departmentId ??
      employee?.department_id ??
      employee?.department?.id ??
      null
    );
  };

  const getDepartmentName = (employee) => {
    return (
      employee?.departmentName ??
      employee?.department_name ??
      employee?.department?.name ??
      ""
    );
  };

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/profile");

        console.log(
          "Attendance AI Profile:",
          response.data
        );

        const profile = response.data;

        // Employee ID
        if (
          profile?.employeeId !== null &&
          profile?.employeeId !== undefined
        ) {
          setMyEmployeeId(Number(profile.employeeId));
        }

        // Employee Name
        if (profile?.employeeName) {
          setMyEmployeeName(profile.employeeName);
        } else if (profile?.name) {
          setMyEmployeeName(profile.name);
        } else if (profile?.fullName) {
          setMyEmployeeName(profile.fullName);
        }

        // Department ID
        const departmentId =
          profile?.departmentId ??
          profile?.department_id ??
          profile?.department?.id ??
          null;

        // Department Name
        const departmentName =
          profile?.departmentName ??
          profile?.department_name ??
          profile?.department?.name ??
          "";

        if (departmentId !== null) {
          setManagerDepartmentId(
            Number(departmentId)
          );
        }

        if (departmentName) {
          setManagerDepartmentName(
            departmentName
          );
        }

      } catch (err) {
        console.error(
          "Attendance AI profile loading error:",
          err
        );

        if (
          userRole === "EMPLOYEE" ||
          userRole === "MANAGER"
        ) {
          setError(
            "Unable to load your profile information."
          );
        }
      }
    };

    if (
      userRole === "EMPLOYEE" ||
      userRole === "MANAGER"
    ) {
      loadProfile();
    }
  }, [userRole]);

  // =========================================================
  // LOAD MANAGER TEAM
  // =========================================================

  useEffect(() => {
    const loadManagerTeam = async () => {
      if (userRole !== "MANAGER") {
        return;
      }

      try {
        setTeamLoading(true);
        setError("");

        const response = await api.get("/employees");

        console.log(
          "All Employees:",
          response.data
        );

        const employees = Array.isArray(response.data)
          ? response.data
          : response.data?.employees || [];

        // Filter manager's department
        const filteredTeam = employees.filter(
          (employee) => {
            const employeeDepartmentId =
              getDepartmentId(employee);

            const employeeDepartmentName =
              getDepartmentName(employee);

            // Match Department ID
            if (
              managerDepartmentId !== null &&
              employeeDepartmentId !== null
            ) {
              return (
                Number(employeeDepartmentId) ===
                Number(managerDepartmentId)
              );
            }

            // Match Department Name
            if (
              managerDepartmentName &&
              employeeDepartmentName
            ) {
              return (
                employeeDepartmentName
                  .toString()
                  .toLowerCase() ===
                managerDepartmentName
                  .toString()
                  .toLowerCase()
              );
            }

            return false;
          }
        );

        console.log(
          "Manager Team:",
          filteredTeam
        );

        setTeamEmployees(filteredTeam);

      } catch (err) {
        console.error(
          "Manager team loading error:",
          err
        );

        setTeamEmployees([]);

        setError(
          "Unable to load your team employees."
        );

      } finally {
        setTeamLoading(false);
      }
    };

    if (
      userRole === "MANAGER" &&
      (
        managerDepartmentId !== null ||
        managerDepartmentName
      )
    ) {
      loadManagerTeam();
    }

  }, [
    userRole,
    managerDepartmentId,
    managerDepartmentName
  ]);

  // =========================================================
  // MANAGER SELECT EMPLOYEE
  // =========================================================

  const handleTeamEmployeeChange = (e) => {
    const selectedId = e.target.value;

    setEmployeeId(selectedId);
    setResult(null);
    setError("");

    const selectedEmployee =
      teamEmployees.find(
        (employee) =>
          String(getEmployeeId(employee)) ===
          String(selectedId)
      );

    if (selectedEmployee) {
      setEmployeeName(
        getEmployeeName(selectedEmployee)
      );
    } else {
      setEmployeeName("");
    }
  };

  // =========================================================
  // ANALYZE ATTENDANCE
  // =========================================================

  const handleAnalyze = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    // =======================================================
    // EMPLOYEE VALIDATION
    // =======================================================

    if (userRole === "EMPLOYEE") {
      if (!myEmployeeId) {
        setError(
          "Unable to find your Employee ID."
        );
        return;
      }

      if (!myEmployeeName.trim()) {
        setError(
          "Unable to find your Employee Name."
        );
        return;
      }
    }

    // =======================================================
    // ADMIN / HR VALIDATION
    // =======================================================

    if (
      userRole === "ADMIN" ||
      userRole === "HR"
    ) {
      if (!employeeId) {
        setError(
          "Please enter Employee ID."
        );
        return;
      }

      if (!employeeName.trim()) {
        setError(
          "Please enter Employee Name."
        );
        return;
      }
    }

    // =======================================================
    // MANAGER VALIDATION
    // =======================================================

    if (userRole === "MANAGER") {
      if (teamLoading) {
        setError(
          "Please wait while your team is loading."
        );
        return;
      }

      if (!employeeId) {
        setError(
          "Please select a team employee."
        );
        return;
      }

      const selectedTeamEmployee =
        teamEmployees.find(
          (employee) =>
            String(getEmployeeId(employee)) ===
            String(employeeId)
        );

      if (!selectedTeamEmployee) {
        setError(
          "You can analyze attendance only for employees in your team."
        );
        return;
      }

      setEmployeeName(
        getEmployeeName(selectedTeamEmployee)
      );
    }

    // =======================================================
    // COMMON VALIDATION
    // =======================================================

    if (currentMonthAttendance === "") {
      setError(
        "Please enter current month attendance."
      );
      return;
    }

    if (previousMonthAttendance === "") {
      setError(
        "Please enter previous month attendance."
      );
      return;
    }

    if (lateDays === "") {
      setError(
        "Please enter late days."
      );
      return;
    }

    if (absentDays === "") {
      setError(
        "Please enter absent days."
      );
      return;
    }

    if (leaveDays === "") {
      setError(
        "Please enter leave days."
      );
      return;
    }

    // =======================================================
    // NUMBER VALIDATION
    // =======================================================

    if (
      Number(currentMonthAttendance) < 0 ||
      Number(currentMonthAttendance) > 100
    ) {
      setError(
        "Current month attendance must be between 0 and 100."
      );
      return;
    }

    if (
      Number(previousMonthAttendance) < 0 ||
      Number(previousMonthAttendance) > 100
    ) {
      setError(
        "Previous month attendance must be between 0 and 100."
      );
      return;
    }

    if (Number(lateDays) < 0) {
      setError(
        "Late days cannot be negative."
      );
      return;
    }

    if (Number(absentDays) < 0) {
      setError(
        "Absent days cannot be negative."
      );
      return;
    }

    if (Number(leaveDays) < 0) {
      setError(
        "Leave days cannot be negative."
      );
      return;
    }

    // =======================================================
    // FINAL EMPLOYEE DATA
    // =======================================================

    let finalEmployeeId;
    let finalEmployeeName;

    // -------------------------------------------------------
    // EMPLOYEE → OWN DATA
    // -------------------------------------------------------

    if (userRole === "EMPLOYEE") {
      finalEmployeeId = myEmployeeId;
      finalEmployeeName = myEmployeeName;
    }

    // -------------------------------------------------------
    // MANAGER → TEAM EMPLOYEE
    // -------------------------------------------------------

    else if (userRole === "MANAGER") {
      const selectedTeamEmployee =
        teamEmployees.find(
          (employee) =>
            String(getEmployeeId(employee)) ===
            String(employeeId)
        );

      if (!selectedTeamEmployee) {
        setError(
          "Selected employee does not belong to your team."
        );
        return;
      }

      finalEmployeeId =
        getEmployeeId(selectedTeamEmployee);

      finalEmployeeName =
        getEmployeeName(selectedTeamEmployee);
    }

    // -------------------------------------------------------
    // ADMIN / HR → ANY EMPLOYEE
    // -------------------------------------------------------

    else {
      finalEmployeeId = Number(employeeId);
      finalEmployeeName = employeeName.trim();
    }

    // =======================================================
    // FINAL VALIDATION
    // =======================================================

    if (!finalEmployeeId) {
      setError(
        "Invalid Employee ID."
      );
      return;
    }

    if (!finalEmployeeName) {
      setError(
        "Invalid Employee Name."
      );
      return;
    }

    // =======================================================
    // REQUEST BODY
    // =======================================================

    const requestBody = {
      employeeId: Number(finalEmployeeId),

      role: userRole,

      employeeName: finalEmployeeName,

      currentMonthAttendance:
        Number(currentMonthAttendance),

      previousMonthAttendance:
        Number(previousMonthAttendance),

      lateDays:
        Number(lateDays),

      absentDays:
        Number(absentDays),

      leaveDays:
        Number(leaveDays)
    };

    console.log(
      "Attendance AI Request:",
      requestBody
    );

    // =======================================================
// API REQUEST
// =======================================================

try {
  setLoading(true);
  setError("");
  setResult(null);

  const response = await api.post(
    "/ai/ai-attendance",
    requestBody
  );

  console.log(
    "Attendance AI Response:",
    response.data
  );

      // =====================================================
      // HANDLE SPRING / FASTAPI RESPONSE
      // =====================================================

      /*
        Expected possible response:

        {
          success: true,
          data: {
            employeeId: 101,
            employeeName: "Rahul Sharma",
            attendanceScore: 87,
            status: "GOOD",
            insight: "...",
            recommendation: "..."
          },
          message: "Attendance analysis completed successfully"
        }

        OR directly:

        {
          employeeId: 101,
          riskLevel: "MEDIUM",
          summary: "...",
          observations: [],
          recommendation: "..."
        }
      */

      const attendanceResult =
        response.data?.data ??
        response.data;

      if (
        attendanceResult === null ||
        attendanceResult === undefined
      ) {
        setError(
          "Attendance AI returned an empty response."
        );
        return;
      }

      setResult(attendanceResult);

    } catch (err) {
      console.error(
        "Attendance AI error:",
        err
      );

      console.error(
        "Attendance AI error response:",
        err?.response?.data
      );

      // =====================================================
      // ERROR HANDLING
      // =====================================================

      if (err?.response?.status === 401) {
        setError(
          "Session expired. Please login again."
        );
      }

      else if (err?.response?.status === 403) {
        setError(
          "You are not authorized to access this attendance analysis."
        );
      }

      else if (err?.response?.status === 404) {
        setError(
          "Attendance AI endpoint not found. Please check the Spring Boot endpoint."
        );
      }

      else if (err?.response?.status === 500) {
        setError(
          err?.response?.data?.message ||
          "Attendance AI server error. Please check Spring Boot and Python AI service."
        );
      }

      else {
        setError(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Attendance AI service unavailable."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const handleReset = () => {
    // Do not reset logged-in employee profile
    // Only reset analysis form

    if (
      userRole === "ADMIN" ||
      userRole === "HR" ||
      userRole === "MANAGER"
    ) {
      setEmployeeId("");
      setEmployeeName("");
    }

    setCurrentMonthAttendance("");
    setPreviousMonthAttendance("");

    setLateDays("");
    setAbsentDays("");
    setLeaveDays("");

    setResult(null);
    setError("");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="ai-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="ai-header">

        <div>
          <h1>
            Attendance AI Insights
          </h1>

          <p>
            AI analyzes attendance patterns and
            provides meaningful attendance insights.
          </p>
        </div>

        <div className="ai-badge">
          🤖 AI Powered
        </div>

      </div>

      {/* ===================================================
          FORM CARD
      =================================================== */}

      <div className="ai-card">

        <div className="card-heading">

          <div>

            <h2>
              Attendance Analysis
            </h2>

            <p>

              {userRole === "ADMIN" &&
                "Analyze attendance of any employee in the organization."}

              {userRole === "HR" &&
                "Analyze attendance of any employee in the organization."}

              {userRole === "MANAGER" &&
                "Analyze attendance of employees in your team."}

              {userRole === "EMPLOYEE" &&
                "Analyze your own attendance insights."}

            </p>

          </div>

        </div>

        <form onSubmit={handleAnalyze}>

          {/* =================================================
              ADMIN / HR EMPLOYEE ID
          ================================================= */}

          {(userRole === "ADMIN" ||
            userRole === "HR") && (

            <div className="form-group">

              <label>
                Employee ID
              </label>

              <input
                type="number"
                value={employeeId}
                onChange={(e) =>
                  setEmployeeId(
                    e.target.value
                  )
                }
                placeholder="Enter Employee ID"
                min="1"
              />

            </div>

          )}

          {/* =================================================
              MANAGER TEAM EMPLOYEE
          ================================================= */}

          {userRole === "MANAGER" && (

            <div className="form-group">

              <label>
                Select Team Employee
              </label>

              <select
                value={employeeId}
                onChange={
                  handleTeamEmployeeChange
                }
                disabled={teamLoading}
              >

                <option value="">
                  {teamLoading
                    ? "Loading your team..."
                    : "Select Team Employee"}
                </option>

                {teamEmployees.map(
                  (employee) => {

                    const id =
                      getEmployeeId(employee);

                    const name =
                      getEmployeeName(employee);

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {name} - EMP{id}
                      </option>
                    );
                  }
                )}

              </select>

              <small>
                You can analyze attendance only
                for employees in your team.
              </small>

            </div>

          )}

          {/* =================================================
              EMPLOYEE OWN ID
          ================================================= */}

          {userRole === "EMPLOYEE" && (

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

            </div>

          )}

          {/* =================================================
              ADMIN / HR EMPLOYEE NAME
          ================================================= */}

          {(userRole === "ADMIN" ||
            userRole === "HR") && (

            <div className="form-group">

              <label>
                Employee Name
              </label>

              <input
                type="text"
                value={employeeName}
                onChange={(e) =>
                  setEmployeeName(
                    e.target.value
                  )
                }
                placeholder="Enter Employee Name"
              />

            </div>

          )}

          {/* =================================================
              MANAGER SELECTED EMPLOYEE NAME
          ================================================= */}

          {userRole === "MANAGER" && (

            <div className="form-group">

              <label>
                Employee Name
              </label>

              <input
                type="text"
                value={employeeName}
                disabled
                placeholder="Select team employee"
              />

            </div>

          )}

          {/* =================================================
              EMPLOYEE OWN NAME
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
              CURRENT MONTH ATTENDANCE
          ================================================= */}

          <div className="form-group">

            <label>
              Current Month Attendance (%)
            </label>

            <input
              type="number"
              value={
                currentMonthAttendance
              }
              onChange={(e) =>
                setCurrentMonthAttendance(
                  e.target.value
                )
              }
              placeholder="Example: 95"
              min="0"
              max="100"
              step="0.1"
            />

            <small>
              Enter attendance percentage for
              the current month.
            </small>

          </div>

          {/* =================================================
              PREVIOUS MONTH ATTENDANCE
          ================================================= */}

          <div className="form-group">

            <label>
              Previous Month Attendance (%)
            </label>

            <input
              type="number"
              value={
                previousMonthAttendance
              }
              onChange={(e) =>
                setPreviousMonthAttendance(
                  e.target.value
                )
              }
              placeholder="Example: 90"
              min="0"
              max="100"
              step="0.1"
            />

            <small>
              Enter attendance percentage for
              the previous month.
            </small>

          </div>

          {/* =================================================
              LATE DAYS
          ================================================= */}

          <div className="form-group">

            <label>
              Late Days
            </label>

            <input
              type="number"
              value={lateDays}
              onChange={(e) =>
                setLateDays(
                  e.target.value
                )
              }
              placeholder="Example: 2"
              min="0"
            />

          </div>

          {/* =================================================
              ABSENT DAYS
          ================================================= */}

          <div className="form-group">

            <label>
              Absent Days
            </label>

            <input
              type="number"
              value={absentDays}
              onChange={(e) =>
                setAbsentDays(
                  e.target.value
                )
              }
              placeholder="Example: 1"
              min="0"
            />

          </div>

          {/* =================================================
              LEAVE DAYS
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
              placeholder="Example: 3"
              min="0"
            />

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="error-message">

              <span>!</span>

              <span>
                {error}
              </span>

            </div>

          )}

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="form-actions">

            <button
              type="submit"
              disabled={
                loading ||
                teamLoading
              }
            >

              {loading
                ? "Analyzing..."
                : "🤖 Generate AI Attendance Insights"}

            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>

          </div>

        </form>

      </div>

      {/* ===================================================
          RESULT
      =================================================== */}

      {result && (

        <div className="ai-result">

          <div className="result-header">

            <div>

              <h2>
                🧠 Attendance Insights
              </h2>

              <p>
                AI attendance analysis completed.
              </p>

            </div>

            <div className="ai-badge">
              AI Analysis
            </div>

          </div>

          {/* =================================================
              RESULT GRID
          ================================================= */}

          <div className="result-grid">

            {result.employeeId !== undefined && (

              <div className="result-item">

                <span>
                  Employee ID
                </span>

                <strong>
                  {result.employeeId}
                </strong>

              </div>

            )}

            {result.employeeName !== undefined && (

              <div className="result-item">

                <span>
                  Employee Name
                </span>

                <strong>
                  {result.employeeName}
                </strong>

              </div>

            )}

            {result.attendanceScore !== undefined && (

              <div className="result-item">

                <span>
                  Attendance Score
                </span>

                <strong>
                  {result.attendanceScore}
                </strong>

              </div>

            )}

            {result.riskLevel !== undefined && (

              <div className="result-item">

                <span>
                  Risk Level
                </span>

                <strong>
                  {result.riskLevel}
                </strong>

              </div>

            )}

            {result.status !== undefined && (

              <div className="result-item">

                <span>
                  Status
                </span>

                <strong>
                  {result.status}
                </strong>

              </div>

            )}

          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          {(result.summary ||
            result.insight ||
            result.insights ||
            result.message ||
            result.analysis ||
            result.recommendation) && (

            <div className="recommendation-box">

              <strong>
                💡 AI Insight
              </strong>

              <p>

                {result.summary ||
                  result.insight ||
                  result.insights ||
                  result.message ||
                  result.analysis ||
                  result.recommendation}

              </p>

            </div>

          )}

          {/* =================================================
              OBSERVATIONS
          ================================================= */}

          {Array.isArray(result.observations) &&
            result.observations.length > 0 && (

            <div className="recommendation-box">

              <strong>
                📊 Observations
              </strong>

              <ul>

                {result.observations.map(
                  (observation, index) => (

                    <li key={index}>
                      {observation}
                    </li>

                  )
                )}

              </ul>

            </div>

          )}

          {/* =================================================
              RECOMMENDATION
          ================================================= */}

          {result.recommendation && (

            <div className="recommendation-box">

              <strong>
                💡 Recommendation
              </strong>

              <p>
                {result.recommendation}
              </p>

            </div>

          )}

          

          </div>


      )}

    </div>
  );
}

export default AttendanceInsights;