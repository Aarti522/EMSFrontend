import { useState } from "react";
import api from "../../services/api";
import "../../styles/ai-attrition.css";

function AttritionPrediction() {
  const [employeeId, setEmployeeId] = useState("");
  const [age, setAge] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [jobSatisfaction, setJobSatisfaction] = useState("");
  const [workLifeBalance, setWorkLifeBalance] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [yearsAtCompany, setYearsAtCompany] = useState("");
  const [promotionYearsAgo, setPromotionYearsAgo] = useState("");
  const [leaveDays, setLeaveDays] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  // PREDICT ATTRITION
  // =========================================================

  const handlePredict = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!employeeId) {
      setError("Please enter Employee ID.");
      return;
    }

    const requestBody = {
      employeeId: Number(employeeId),
      age: Number(age),
      experienceYears: Number(experienceYears),
      monthlyIncome: Number(monthlyIncome),
      jobSatisfaction: Number(jobSatisfaction),
      workLifeBalance: Number(workLifeBalance),
      overtimeHours: Number(overtimeHours),
      yearsAtCompany: Number(yearsAtCompany),
      promotionYearsAgo: Number(promotionYearsAgo),
      leaveDays: Number(leaveDays),
    };

    console.log(
      "Attrition AI Request:",
      requestBody
    );

    try {
      setLoading(true);

      const response = await api.post(
        "/ai/attrition",
        requestBody
      );

      console.log(
        "Attrition AI Response:",
        response.data
      );

      const attritionResult =
        response.data?.data ??
        response.data;

      if (
        attritionResult === null ||
        attritionResult === undefined
      ) {
        setError(
          "Attrition AI returned an empty response."
        );
        return;
      }

      setResult(attritionResult);

    } catch (err) {
      console.error(
        "Attrition prediction error:",
        err
      );

      console.error(
        "Attrition error response:",
        err?.response?.data
      );

      if (err?.response?.status === 401) {
        setError(
          "Session expired. Please login again."
        );
      }

      else if (err?.response?.status === 403) {
        setError(
          "You are not authorized to access attrition prediction."
        );
      }

      else if (err?.response?.status === 404) {
        setError(
          "Attrition AI endpoint not found."
        );
      }

      else if (err?.response?.status === 500) {
        setError(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Attrition AI server error. Please check Spring Boot and Python AI service."
        );
      }

      else {
        let errorMessage =
          "Unable to generate attrition prediction.";

        if (
          err?.response?.data?.message
        ) {
          errorMessage = safeText(
            err.response.data.message
          );
        }

        else if (
          err?.response?.data?.error
        ) {
          errorMessage = safeText(
            err.response.data.error
          );
        }

        else if (
          err?.response?.data
        ) {
          errorMessage = safeText(
            err.response.data
          );
        }

        setError(errorMessage);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attrition-page">

      {/* ================= HEADER ================= */}

      <div className="attrition-header">

        <div>
          <h1>
            AI Attrition Prediction
          </h1>

          <p>
            Analyze employee information and identify
            potential attrition risk.
          </p>
        </div>

        <div className="ai-badge">
          🤖 AI Powered
        </div>

      </div>

      {/* ================= MAIN LAYOUT ================= */}

      <div className="attrition-layout">

        {/* ================= FORM CARD ================= */}

        <div className="attrition-card">

          <div className="card-heading">

            <div className="heading-icon">
              ⚠️
            </div>

            <div>
              <h2>
                Employee Risk Analysis
              </h2>

              <p>
                Enter employee details to predict
                attrition risk.
              </p>
            </div>

          </div>

          <form onSubmit={handlePredict}>

            {/* EMPLOYEE ID */}

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
                required
              />

            </div>

            {/* AGE */}

            <div className="form-group">

              <label>
                Age
              </label>

              <input
                type="number"
                value={age}
                onChange={(e) =>
                  setAge(
                    e.target.value
                  )
                }
                placeholder="Example: 25"
                min="18"
                max="70"
                required
              />

            </div>

            {/* EXPERIENCE YEARS */}

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

            {/* MONTHLY INCOME */}

            <div className="form-group">

              <label>
                Monthly Income
              </label>

              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) =>
                  setMonthlyIncome(
                    e.target.value
                  )
                }
                placeholder="Example: 25000"
                min="0"
                required
              />

            </div>

            {/* JOB SATISFACTION */}

            <div className="form-group">

              <label>
                Job Satisfaction
              </label>

              <select
                value={jobSatisfaction}
                onChange={(e) =>
                  setJobSatisfaction(
                    e.target.value
                  )
                }
                required
              >

                <option value="">
                  Select satisfaction level
                </option>

                <option value="1">
                  1 - Very Low
                </option>

                <option value="2">
                  2 - Low
                </option>

                <option value="3">
                  3 - Medium
                </option>

                <option value="4">
                  4 - High
                </option>

              </select>

            </div>

            {/* WORK LIFE BALANCE */}

            <div className="form-group">

              <label>
                Work-Life Balance
              </label>

              <select
                value={workLifeBalance}
                onChange={(e) =>
                  setWorkLifeBalance(
                    e.target.value
                  )
                }
                required
              >

                <option value="">
                  Select work-life balance
                </option>

                <option value="1">
                  1 - Poor
                </option>

                <option value="2">
                  2 - Fair
                </option>

                <option value="3">
                  3 - Good
                </option>

                <option value="4">
                  4 - Excellent
                </option>

              </select>

            </div>

            {/* OVERTIME HOURS */}

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
                required
              />

            </div>

            {/* YEARS AT COMPANY */}

            <div className="form-group">

              <label>
                Years at Company
              </label>

              <input
                type="number"
                value={yearsAtCompany}
                onChange={(e) =>
                  setYearsAtCompany(
                    e.target.value
                  )
                }
                placeholder="Example: 3"
                min="0"
                step="0.1"
                required
              />

            </div>

            {/* PROMOTION YEARS AGO */}

            <div className="form-group">

              <label>
                Promotion Years Ago
              </label>

              <input
                type="number"
                value={promotionYearsAgo}
                onChange={(e) =>
                  setPromotionYearsAgo(
                    e.target.value
                  )
                }
                placeholder="Example: 2"
                min="0"
                step="0.1"
                required
              />

            </div>

            {/* LEAVE DAYS */}

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
                placeholder="Example: 10"
                min="0"
                required
              />

            </div>

            {/* ERROR */}

            {error && (
              <div className="attrition-error">

                <span>
                  !
                </span>

                <span>
                  {safeText(error)}
                </span>

              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              className="check-risk-btn"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing Risk...
                </>
              ) : (
                <>
                  🔍 Check Attrition Risk
                </>
              )}

            </button>

          </form>

        </div>

        {/* ================= RESULT CARD ================= */}

        <div className="attrition-card result-card">

          <div className="card-heading">

            <div className="heading-icon">
              🧠
            </div>

            <div>
              <h2>
                Attrition Risk Result
              </h2>

              <p>
                AI-generated employee attrition analysis.
              </p>
            </div>

          </div>

          {/* EMPTY STATE */}

          {!result && !loading && (
            <div className="result-empty">

              <div className="empty-icon">
                🛡️
              </div>

              <h3>
                No Risk Analysis Yet
              </h3>

              <p>
                Enter employee information and click
                "Check Attrition Risk".
              </p>

            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="result-loading">

              <div className="large-spinner"></div>

              <h3>
                AI is analyzing...
              </h3>

              <p>
                Please wait while employee data is
                being processed.
              </p>

            </div>
          )}

          {/* RESULT */}

          {result && !loading && (
            <div className="attrition-result">

              {/* MAIN RISK */}

              <div className="risk-main">

                <span>
                  Attrition Risk
                </span>

                <strong>
                  {safeText(
                    result.prediction ||
                    result.risk ||
                    result.attritionRisk ||
                    result.result
                  )}
                </strong>

              </div>

              {/* RESULT GRID */}

              <div className="result-grid">

                <div className="result-item">

                  <span>
                    Risk Score
                  </span>

                  <strong>
                    {result.score != null
                      ? safeText(
                          result.score
                        )
                      : "N/A"}
                  </strong>

                </div>

                <div className="result-item">

                  <span>
                    Confidence
                  </span>

                  <strong>
                    {result.confidence != null
                      ? `${(
                          Number(
                            result.confidence
                          ) * 100
                        ).toFixed(0)}%`
                      : "N/A"}
                  </strong>

                </div>

              </div>

              {/* EMPLOYEE ID */}

              <div className="risk-status">

                <div className="status-icon">
                  👤
                </div>

                <div>

                  <strong>
                    Employee ID
                  </strong>

                  <p>
                    {safeText(
                      result.employeeId
                    )}
                  </p>

                </div>

              </div>

              {/* AI ANALYSIS */}

              <div className="recommendation-box">

                <strong>
                  💡 AI Analysis
                </strong>

                <p>

                  {result.prediction === "HIGH"
                    ? "The employee has been classified as having a high attrition risk based on the provided information."
                    : result.prediction === "MEDIUM"
                    ? "The employee has been classified as having a medium attrition risk based on the provided information."
                    : result.prediction === "LOW"
                    ? "The employee has been classified as having a low attrition risk based on the provided information."
                    : "AI analysis completed successfully."}

                </p>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default AttritionPrediction;