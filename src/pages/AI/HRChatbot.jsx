import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "../../styles/hrchatbot.css";

function HRChatbot() {
  const { role: authRole } = useAuth();

  const [role, setRole] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [departmentId, setDepartmentId] = useState(null);
  const [departmentName, setDepartmentName] = useState("");
  const [teamEmployeeIds, setTeamEmployeeIds] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I am your AI HR Assistant. How can I help you?",
    },
  ]);

  const [loading, setLoading] = useState(false);

  // =========================================================
  // NORMALIZE ROLE
  // ROLE_HR -> HR
  // ROLE_ADMIN -> ADMIN
  // =========================================================

  const normalizeRole = (value) => {
    if (!value) {
      return "";
    }

    return value
      .toString()
      .trim()
      .toUpperCase()
      .replace(/^ROLE_/, "");
  };

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

        let currentRole =
          normalizeRole(authRole);

        if (!currentRole) {
          const storedRole =
            localStorage.getItem("role");

          currentRole =
            normalizeRole(storedRole);
        }

        const response =
          await api.get("/profile");

        console.log(
          "Chatbot Profile Response:",
          response.data
        );

        const profile =
          response.data?.data ??
          response.data ??
          {};

        const profileEmployeeId =
          profile.employeeId ??
          profile.employee_id ??
          profile.id ??
          null;

        if (
          profileEmployeeId !== null &&
          profileEmployeeId !== undefined
        ) {
          setEmployeeId(
            Number(profileEmployeeId)
          );
        }

        const name =
          profile.employeeName ??
          profile.name ??
          profile.fullName ??
          "";

        if (name) {
          setEmployeeName(name);
        }

        const profileDepartmentId =
          profile.departmentId ??
          profile.department_id ??
          profile.department?.id ??
          null;

        if (
          profileDepartmentId !== null &&
          profileDepartmentId !== undefined
        ) {
          setDepartmentId(
            Number(profileDepartmentId)
          );
        }

        const profileDepartmentName =
          profile.departmentName ??
          profile.department_name ??
          profile.department?.name ??
          "";

        if (profileDepartmentName) {
          setDepartmentName(
            profileDepartmentName
          );
        }

        if (profile.role) {
          currentRole =
            normalizeRole(profile.role);
        }

        console.log(
          "Normalized Chatbot Role:",
          currentRole
        );

        setRole(currentRole);

      } catch (err) {
        console.error(
          "Chatbot profile loading error:",
          err
        );

        const fallbackRole =
          normalizeRole(authRole);

        if (fallbackRole) {
          setRole(fallbackRole);
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
        setTeamEmployeeIds([]);
        return;
      }

      if (
        departmentId === null &&
        !departmentName
      ) {
        return;
      }

      try {
        const response =
          await api.get("/employees");

        const responseData =
          response.data?.data ??
          response.data;

        const employees =
          Array.isArray(responseData)
            ? responseData
            : responseData?.employees || [];

        const teamEmployees =
          employees.filter((employee) => {
            const empDepartmentId =
              getDepartmentId(employee);

            const empDepartmentName =
              getDepartmentName(employee);

            if (
              departmentId !== null &&
              empDepartmentId !== null
            ) {
              return (
                Number(empDepartmentId) ===
                Number(departmentId)
              );
            }

            if (
              departmentName &&
              empDepartmentName
            ) {
              return (
                empDepartmentName
                  .toString()
                  .trim()
                  .toLowerCase() ===
                departmentName
                  .toString()
                  .trim()
                  .toLowerCase()
              );
            }

            return false;
          });

        const teamIds =
          teamEmployees
            .map((employee) =>
              getEmployeeId(employee)
            )
            .filter(
              (id) =>
                id !== null &&
                id !== undefined
            )
            .map((id) => Number(id));

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
  }, [
    role,
    departmentId,
    departmentName,
  ]);

  // =========================================================
  // ACCESS SCOPE
  // =========================================================

  const getAccessScope = () => {
    if (
      role === "ADMIN" ||
      role === "HR"
    ) {
      return "ORGANIZATION";
    }

    if (role === "MANAGER") {
      return "TEAM";
    }

    return "OWN_GENERAL";
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!message.trim()) {
      return;
    }

    if (profileLoading || loading) {
      return;
    }

    const userMessage =
      message.trim();

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
      const normalizedRole =
        normalizeRole(role) ||
        normalizeRole(authRole) ||
        "EMPLOYEE";

      let accessScope =
        "OWN_GENERAL";

      if (
        normalizedRole === "ADMIN" ||
        normalizedRole === "HR"
      ) {
        accessScope =
          "ORGANIZATION";
      } else if (
        normalizedRole === "MANAGER"
      ) {
        accessScope =
          "TEAM";
      }

      const requestData = {
        message: userMessage,

        role: normalizedRole,

        employeeId:
          employeeId ?? 0,

        context: {
          accessScope,

          employeeId:
            employeeId ?? 0,

          employeeName:
            employeeName || "",

          departmentId:
            departmentId ?? 0,

          departmentName:
            departmentName || "",

          teamEmployeeIds:
            normalizedRole === "MANAGER"
              ? teamEmployeeIds
              : [],

          permissions: {
            organizationAccess:
              normalizedRole === "ADMIN" ||
              normalizedRole === "HR",

            teamAccess:
              normalizedRole === "MANAGER",

            ownAccess:
              normalizedRole === "EMPLOYEE" ||
              normalizedRole === "MANAGER",

            generalHRAccess: true,
          },

          additionalProp: {},
        },
      };

      console.log(
        "Normalized Chatbot Role:",
        normalizedRole
      );

      console.log(
        "Chatbot Access Scope:",
        accessScope
      );

      console.log(
        "Chatbot Request:",
        requestData
      );

      const response =
        await api.post(
          "/ai/chatbot",
          requestData
        );

      console.log(
        "Chatbot Response:",
        response.data
      );

      const responseData =
        response.data?.data ??
        response.data;

      const botReply =
        responseData?.response ??
        responseData?.reply ??
        responseData?.answer ??
        responseData?.text ??
        responseData?.message ??
        response.data?.message ??
        "Sorry, I could not understand your question.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            typeof botReply === "string"
              ? botReply
              : JSON.stringify(botReply),
        },
      ]);

    } catch (err) {
      console.error(
        "Chatbot error:",
        err
      );

      console.error(
        "Chatbot Status:",
        err?.response?.status
      );

      console.error(
        "Chatbot Error Response:",
        err?.response?.data
      );

      let errorMessage =
        "Sorry, something went wrong. Please try again.";

      if (err?.response?.status === 401) {
        errorMessage =
          "Your session has expired. Please login again.";
      } else if (
        err?.response?.status === 403
      ) {
        errorMessage =
          "You do not have permission to use the AI HR Chatbot.";
      } else if (
        err?.response?.status === 500
      ) {
        errorMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "AI Chatbot server error. Please try again.";
      } else if (
        err?.response?.data?.message
      ) {
        errorMessage =
          err.response.data.message;
      } else if (
        err?.response?.data?.error
      ) {
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
          text: String(errorMessage),
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

      if (
        message.trim() &&
        !loading &&
        !profileLoading
      ) {
        sendMessage(e);
      }
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
    if (
      role === "ADMIN" ||
      role === "HR"
    ) {
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

      {/* ================= HEADER ================= */}

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

      {/* ================= CHAT CONTAINER ================= */}

      <div className="chatbot-container">

        {/* CHAT HEADER */}

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

        {/* USER INFORMATION */}

        <div className="chat-user-info">

          <span>
            👤 Role:{" "}
            <strong>
              {profileLoading
                ? "Loading..."
                : role || "UNKNOWN"}
            </strong>
          </span>

          <span>
            🆔 Employee ID:{" "}
            <strong>
              {profileLoading
                ? "Loading..."
                : employeeId ?? "N/A"}
            </strong>
          </span>

          <span>
            🔐 Access:{" "}
            <strong>
              {getAccessDescription()}
            </strong>
          </span>

        </div>

        {/* ================= MESSAGES ================= */}

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

                {msg.sender === "bot" && (
                  <div className="small-avatar">
                    🤖
                  </div>
                )}

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

          {/* LOADING */}

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

        {/* ================= INPUT ================= */}

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

      {/* ================= QUICK QUESTIONS ================= */}

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

        </div>

      </div>

    </div>
  );
}

export default HRChatbot;