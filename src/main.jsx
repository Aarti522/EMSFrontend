import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

import "./styles/dashboard.css";
import "./styles/employees.css";
import "./styles/departments.css";
import "./styles/attendance.css";
import "./styles/leave.css";
import "./styles/payroll.css";
import "./styles/reports.css";
import "./styles/profile.css";

import "./styles/myteam.css";

import "./styles/notfound.css";

import "./styles/Auth.css";

import "./styles/global.css";
import "./styles/sidebar.css";
import "./styles/navbar.css";
import "./styles/layout.css";

import "./styles/index.css";
import "./styles/App.css";

import "./styles/ai.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);