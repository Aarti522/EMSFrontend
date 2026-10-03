import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// =========================
// AUTH PAGES
// =========================
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

// =========================
// MAIN PAGES
// =========================
import Dashboard from "../pages/Dashboard/Dashboard";
import Employees from "../pages/Employees/Employees";
import Departments from "../pages/Departments/Departments";
import Attendance from "../pages/Attendance/Attendance";
import Leave from "../pages/Leave/Leave";
import Payroll from "../pages/Payroll/Payroll";
import Reports from "../pages/Reports/Reports";
import Profile from "../pages/Profile/Profile";
import MyTeam from "../pages/Manager/MyTeam";

// =========================
// AI PAGES
// =========================
import AIHome from "../pages/AI/AIHome";
import PerformancePrediction from "../pages/AI/PerformancePrediction";
import AttritionPrediction from "../pages/AI/AttritionPrediction";
import ResumeScreening from "../pages/AI/ResumeScreening";
import HRChatbot from "../pages/AI/HRChatbot";
import AttendanceInsights from "../pages/AI/AttendanceInsights";

// =========================
// OTHER
// =========================
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

// =========================
// ROUTE PROTECTION
// =========================
import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";

// =========================
// LAYOUT
// =========================
import DashboardLayout from "../layouts/DashboardLayout";


function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        {/* ROOT */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* FORGOT PASSWORD */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* RESET PASSWORD */}
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* UNAUTHORIZED */}
        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />


        {/* =====================================================
            PROTECTED ROUTES
        ===================================================== */}

        <Route element={<ProtectedRoute />}>

          {/* =================================================
              DASHBOARD LAYOUT
          ================================================= */}

          <Route element={<DashboardLayout />}>

            {/* =================================================
                DASHBOARD
                ALL ROLES
            ================================================= */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />


            {/* =================================================
                EMPLOYEES
                ADMIN + HR
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                  ]}
                />
              }
            >

              <Route
                path="/employees"
                element={<Employees />}
              />

            </Route>


            {/* =================================================
                DEPARTMENTS
                ADMIN + HR
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                  ]}
                />
              }
            >

              <Route
                path="/departments"
                element={<Departments />}
              />

            </Route>


            {/* =================================================
                ATTENDANCE
                ALL ROLES
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                    "MANAGER",
                    "EMPLOYEE",
                  ]}
                />
              }
            >

              <Route
                path="/attendance"
                element={<Attendance />}
              />

            </Route>


            {/* =================================================
                LEAVE
                ALL ROLES
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                    "MANAGER",
                    "EMPLOYEE",
                  ]}
                />
              }
            >

              <Route
                path="/leave"
                element={<Leave />}
              />

            </Route>


            {/* =================================================
                PAYROLL
                ALL ROLES
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                    "MANAGER",
                    "EMPLOYEE",
                  ]}
                />
              }
            >

              <Route
                path="/payroll"
                element={<Payroll />}
              />

            </Route>


            {/* =================================================
                REPORTS
                ADMIN + HR + MANAGER
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                    "MANAGER",
                  ]}
                />
              }
            >

              <Route
                path="/reports"
                element={<Reports />}
              />

            </Route>


            {/* =================================================
                AI HOME
                ALL ROLES
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                    "MANAGER",
                    "EMPLOYEE",
                  ]}
                />
              }
            >

              <Route
                path="/ai"
                element={<AIHome />}
              />

            </Route>


            {/* =================================================
                AI PERFORMANCE PREDICTION
                ALL ROLES
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                    "MANAGER",
                    "EMPLOYEE",
                  ]}
                />
              }
            >

              <Route
                path="/ai/performance"
                element={<PerformancePrediction />}
              />

            </Route>


            {/* =================================================
                AI ATTRITION PREDICTION
                ADMIN + HR + MANAGER
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                    "MANAGER",
                  ]}
                />
              }
            >

              <Route
                path="/ai/attrition"
                element={<AttritionPrediction />}
              />

            </Route>


            {/* =================================================
                AI RESUME SCREENING
                HR ONLY
            ================================================= */}
<Route
  element={
    <RoleRoute
      allowedRoles={[
        "ADMIN",
        "HR",
      ]}
    />
  }
>
  <Route
    path="/ai/resume"
    element={<ResumeScreening />}
  />
</Route>


            {/* =================================================
                AI HR CHATBOT
                ALL ROLES
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                    "MANAGER",
                    "EMPLOYEE",
                  ]}
                />
              }
            >

              <Route
                path="/ai/chatbot"
                element={<HRChatbot />}
              />

            </Route>


            {/* =================================================
                AI ATTENDANCE INSIGHTS
                ALL ROLES
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                    "MANAGER",
                    "EMPLOYEE",
                  ]}
                />
              }
            >

              <Route
                path="/ai/attendance"
                element={<AttendanceInsights />}
              />

            </Route>


            {/* =================================================
                MANAGER - MY TEAM
                MANAGER ONLY
            ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "MANAGER",
                  ]}
                />
              }
            >

              <Route
                path="/manager/my-team"
                element={<MyTeam />}
              />

            </Route>


            {/* =================================================
                PROFILE
                ALL AUTHENTICATED USERS
            ================================================= */}

            <Route
              path="/profile"
              element={<Profile />}
            />


            {/* =================================================
                404 - PAGE NOT FOUND
            ================================================= */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Route>

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;