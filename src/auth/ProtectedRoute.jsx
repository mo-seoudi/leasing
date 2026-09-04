import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }) {
  const { session, loading, sessionExpired } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "Inter, Arial, sans-serif",
          color: "#667085",
          background: "#f8fafc",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          sessionExpired,
        }}
      />
    );
  }

  return children;
}
