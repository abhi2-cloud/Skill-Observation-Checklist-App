import { Navigate } from "react-router-dom";

function RoleProtectedRoute({
  children,
  allowedRoles = []
}) {

  const token =
    localStorage.getItem(
      "access_token"
    );

  const role =
    localStorage.getItem(
      "user_role"
    );

  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }

  if (
    !allowedRoles.includes(role)
  ) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  }

  return children;
}

export default RoleProtectedRoute;