import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ allowedRoles }) {

  const { role } = useAuth();

  const userRole = role?.toUpperCase();

  const normalizedRoles = allowedRoles.map(
    (allowedRole) => allowedRole.toUpperCase()
  );

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!normalizedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;