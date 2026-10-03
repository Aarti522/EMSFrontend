import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "../../styles/hrchatbot.css";

function HRChatbot() {
  const { role: authRole } = useAuth();

  // =========================================================
  // USER INFORMATION
  // =========================================================

  const [role, setRole] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState("");

  const [departmentId, setDepartmentId] = useState(null);
  const [departmentName, setDepartmentName] = useState("");

  // Manager's team
  const [teamEmployeeIds, setTeamEmployeeIds] = useState([]);

  const [profileLoading, setProfileLoading] = useState(true);

  // =========================================================
  // CHAT STATES
  // =========================================================

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I am your AI HR Assistant. How can I help you?",
    },
  ]);

  const [loading, setLoading] = useState(false);

  // =========================================================
  // GET EMPLOYEE ID
  // =========================================================

  const getEmployeeId = (employee) => {
    return (
      employee?.employeeId ??
      employee?.id ??
      employee?.employee_id ??
      null
    );
  };

  // =========================================================
  // GET DEPARTMENT ID
  // =========================================================

  const getDepartmentId = (employee) => {
    return (
      employee?.departmentId ??
      employee?.department_id ??
      employee?.department?.id ??
      null
    );
  };

  // =========================================================
  // GET DEPARTMENT NAME
  // =========================================================

  const getDepartmentName = (employee) => {
    return (
      employee?.departmentName ??
      employee?.department_name ??
      employee?.department?.name ??
      ""
    );
  };

  // =========================================================
  // LOAD LOGGED-IN USER PROFILE
  // =========================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setProfileLoading(false);
          return;
        }

        // -----------------------------------------------------
        // Get role from AuthContext first
        // -----------------------------------------------------

        let currentRole = authRole?.toUpperCase() || "";

        // -----------------------------------------------------
        // Fallback: localStorage role
        // -----------------------------------------------------

        if (!currentRole) {
          const storedRole = localStorage.getItem("role");

          if (storedRole) {
            currentRole = storedRole.toUpperCase();
          }
        }

        // -----------------------------------------------------
        // Load profile
        // -----------------------------------------------------

        const response = await api.get("/profile");

        console.log("Chatbot Profile:", response.data);

        const profile = response.data || {};

        // -----------------------------------------------------
        // Employee ID
        // -----------------------------------------------------

        if (
          profile.employeeId !== null &&
          profile.employeeId !== undefined
        ) {
          setEmployeeId(Number(profile.employeeId));
        }

        // -----------------------------------------------------
        // Employee Name
        // -----------------------------------------------------

        const name =
          profile.employeeName ??
          profile.name ??
          profile.fullName ??
          "";

        if (name) {
          setEmployeeName(name);
        }

        // -----------------------------------------------------
        // Department
        // -----------------------------------------------------

        const profileDepartmentId =
          profile.departmentId ??
          profile.department_id ??
          profile.department?.id ??
          null;

        if (profileDepartmentId !== null) {
          setDepartmentId(Number(profileDepartmentId));
        }

        const profileDepartmentName =
          profile.departmentName ??
          profile.department_name ??
          profile.department?.name ??
          "";

        if (profileDepartmentName) {
          setDepartmentName(profileDepartmentName);
        }

        // -----------------------------------------------------
        // Profile role has priority
        // -----------------------------------------------------

        if (profile.role) {
          currentRole = profile.role.toUpperCase();
        }

        setRole(currentRole);
      } catch (err) {
        console.error("Profile loading error:", err);

        // Fallback to AuthContext role
        if (authRole) {
          setRole(authRole.toUpperCase());
        }
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [authRole]);

  // =========================================================
  // LOAD MANAGER TEAM
  // =========================================================

  useEffect(() => {
    const loadManagerTeam = async () => {
      if (role !== "MANAGER") {
        return;
      }

      if (departmentId === null && !departmentName) {
        return;
      }

      try {
        const response = await api.get("/employees");

        console.log("Chatbot Manager Team:", response.data);

        const employees = Array.isArray(response.data)
          ? response.data
          : response.data?.employees || [];

        const teamEmployees = employees.filter((employee) => {
          const empDepartmentId = getDepartmentId(employee);
          const empDepartmentName = getDepartmentName(employee);

          // -----------------------------------------------
          // Department ID match
          // -----------------------------------------------

          if (
            departmentId !== null &&
            empDepartmentId !== null
          ) {
            return (
              Number(empDepartmentId) ===
              Number(departmentId)
            );
          }

          // -----------------------------------------------
          // Department name fallback
          // -----------------------------------------------

          if (
            departmentName &&
            empDepartmentName
          ) {
            return (
              empDepartmentName
                .toString()
                .toLowerCase() ===
              departmentName
                .toString()
                .toLowerCase()
            );
          }

          return false;
        });

        const teamIds = teamEmployees
          .map((employee) => getEmployeeId(employee))
          .filter((id) => id !== null)
          .map((id) => Number(id));

        console.log(
          "Manager Team Employee IDs:",
          teamIds
        );

        setTeamEmployeeIds(teamIds);
      } catch (err) {
        console.error(
          "Manager team loading error:",
          err
        );

        setTeamEmployeeIds([]);
      }
    };

    loadManagerTeam();
  }, [role, departmentId, departmentName]);

  // =========================================================
  // GET CHATBOT ACCESS SCOPE
  // =========================================================

  const getAccessScope = () => {
    // ADMIN
    if (role === "ADMIN") {
      return "ORGANIZATION";
    }

    // HR
    if (role === "HR") {
      return "ORGANIZATION";
    }

    // MANAGER
    if (role === "MANAGER") {
      return "TEAM";
    }

    // EMPLOYEE
    if (role === "EMPLOYEE") {
      return "OWN_GENERAL";
    }

    return "OWN_GENERAL";
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    if (profileLoading) {
      return;
    }

    const userMessage = message.trim();

    // -------------------------------------------------------
    // Add user message immediately
    // -------------------------------------------------------

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // -----------------------------------------------------
      // Determine access scope
      // -----------------------------------------------------

      const accessScope = getAccessScope();

      // -----------------------------------------------------
      // Build chatbot context
      // -----------------------------------------------------

      const requestData = {
        message: userMessage,

        role: role || "EMPLOYEE",

        employeeId: employeeId || 0,

        context: {
          // Current user's access scope
          accessScope: accessScope,

          // Logged-in employee
          employeeId: employeeId || 0,

          employeeName: employeeName || "",

          // Department information
          departmentId: departmentId || 0,

          departmentName: departmentName || "",

          // Manager team
          teamEmployeeIds:
            role === "MANAGER"
              ? teamEmployeeIds
              : [],

          // -------------------------------------------------
          // Permission flags
          // -------------------------------------------------

          permissions: {
            organizationAccess:
              role === "ADMIN" ||
              role === "HR",

            teamAccess:
              role === "MANAGER",

            ownAccess:
              role === "EMPLOYEE" ||
              role === "MANAGER",

            generalHRAccess: true,
          },

          // Keep this field if Python chatbot expects it
          additionalProp: {},
        },
      };

      console.log(
        "========================================"
      );

      console.log(
        "Chatbot Request:",
        requestData
      );

      console.log(
        "Chatbot API: POST /ai/chatbot"
      );

      console.log(
        "========================================"
      );

      // =====================================================
      // API REQUEST
      // =====================================================

      const response = await api.post(
        "/ai/chatbot",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "========================================"
      );

      console.log(
        "Chatbot Response:",
        response.data
      );

      console.log(
        "Actual AI Response:",
        response.data?.data?.response
      );

      console.log(
        "========================================"
      );

      // =====================================================
      // BOT RESPONSE
      // =====================================================

      /*
       * Python response structure:
       *
       * {
       *   "success": true,
       *   "data": {
       *     "employeeId": 101,
       *     "response": "Hello. How can I assist you..."
       *   },
       *   "message": "Chatbot response generated successfully"
       * }
       */

      const botReply =
        response.data?.data?.response ||
        response.data?.reply ||
        response.data?.response ||
        response.data?.answer ||
        response.data?.text ||
        response.data?.message ||
        "Sorry, I could not understand your question.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botReply,
        },
      ]);
    } catch (err) {
      console.error(
        "========================================"
      );

      console.error(
        "Chatbot error:",
        err
      );

      console.error(
        "Status:",
        err?.response?.status
      );

      console.error(
        "Error Response:",
        err?.response?.data
      );

      console.error(
        "========================================"
      );

      let errorMessage =
        "Sorry, something went wrong. Please try again.";

      if (err?.response?.data?.message) {
        errorMessage =
          err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage =
          err.response.data.error;
      } else if (
        typeof err?.response?.data === "string"
      ) {
        errorMessage =
          err.response.data;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ENTER KEY
  // =========================================================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  // =========================================================
  // QUICK QUESTION
  // =========================================================

  const askQuickQuestion = (question) => {
    setMessage(question);
  };

  // =========================================================
  // ACCESS DESCRIPTION
  // =========================================================

  const getAccessDescription = () => {
    if (role === "ADMIN") {
      return "Organization-wide HR assistance";
    }

    if (role === "HR") {
      return "Organization-wide HR assistance";
    }

    if (role === "MANAGER") {
      return "Team & HR assistance";
    }

    if (role === "EMPLOYEE") {
      return "Personal & general HR assistance";
    }

    return "HR assistance";
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="chatbot-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="chatbot-header">

        <div>
          <h1>
            AI HR Chatbot
          </h1>

          <p>
            Your intelligent HR assistant for
            employee-related queries.
          </p>
        </div>

        <div className="ai-badge">
          🤖 AI Powered
        </div>

      </div>

      {/* =====================================================
          CHAT CONTAINER
      ===================================================== */}

      <div className="chatbot-container">

        {/* ===================================================
            CHAT HEADER
        =================================================== */}

        <div className="chat-header">

          <div className="bot-avatar">
            🤖
          </div>

          <div>

            <h2>
              AI HR Assistant
            </h2>

            <span>
              ● Online
            </span>

          </div>

        </div>

        {/* ===================================================
            USER INFORMATION
        =================================================== */}

        <div className="chat-user-info">

          <span>
            👤 Role:{" "}
            <strong>
              {role || "Loading..."}
            </strong>
          </span>

          <span>
            🆔 Employee ID:{" "}
            <strong>
              {employeeId || "Loading..."}
            </strong>
          </span>

          <span>
            🔐 Access:{" "}
            <strong>
              {getAccessDescription()}
            </strong>
          </span>

        </div>

        {/* ===================================================
            MESSAGES
        =================================================== */}

        <div className="chat-messages">

          {messages.map(
            (msg, index) => (

              <div
                key={index}
                className={`message-row ${
                  msg.sender === "user"
                    ? "user-row"
                    : "bot-row"
                }`}
              >

                {/* BOT AVATAR */}

                {msg.sender === "bot" && (
                  <div className="small-avatar">
                    🤖
                  </div>
                )}

                {/* MESSAGE */}

                <div
                  className={`message ${
                    msg.sender === "user"
                      ? "user-message"
                      : "bot-message"
                  }`}
                >
                  {msg.text}
                </div>

              </div>

            )
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="message-row bot-row">

              <div className="small-avatar">
                🤖
              </div>

              <div className="bot-message typing">

                <span></span>
                <span></span>
                <span></span>

              </div>

            </div>

          )}

        </div>

        {/* ===================================================
            INPUT
        =================================================== */}

        <form
          className="chat-input-area"
          onSubmit={sendMessage}
        >

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask your HR question..."
            rows="1"
            disabled={
              loading ||
              profileLoading
            }
          />

          <button
            type="submit"
            disabled={
              loading ||
              profileLoading ||
              !message.trim()
            }
          >
            {loading ? "..." : "➤"}
          </button>

        </form>

        <div className="chat-hint">
          Press Enter to send your message.
        </div>

      </div>

      {/* =====================================================
          QUICK QUESTIONS
      ===================================================== */}

      <div className="quick-questions">

        <h3>
          💡 Try asking
        </h3>

        <div className="quick-buttons">

          <button
            type="button"
            onClick={() =>
              askQuickQuestion(
                "How can I apply for leave?"
              )
            }
          >
            How can I apply for leave?
          </button>

          <button
            type="button"
            onClick={() =>
              askQuickQuestion(
                "How can I check my attendance?"
              )
            }
          >
            How can I check my attendance?
          </button>

          <button
            type="button"
            onClick={() =>
              askQuickQuestion(
                "How can I check my salary?"
              )
            }
          >
            How can I check my salary?
          </button>

          <button
            type="button"
            onClick={() =>
              askQuickQuestion(
                "What is my current leave balance?"
              )
            }
          >
            What is my leave balance?
          </button>

        </div>

      </div>

    </div>
  );
}

export default HRChatbot;