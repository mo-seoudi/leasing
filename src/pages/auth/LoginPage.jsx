import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthProvider";
import "./LoginPage.css";

export default function LoginPage() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const destination = location.state?.from || "/dashboard";

  useEffect(() => {
    setErrorMessage("");
  }, [email, password]);

  if (!loading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const { error } = await signIn(
      email.trim(),
      password
    );

    if (error) {
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "The email or password is incorrect."
          : error.message
      );
      setSubmitting(false);
      return;
    }

    navigate(destination, { replace: true });
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand-row">
          <div className="login-brand-mark">CO</div>
          <div>
            <div className="login-brand-name">ComOps</div>
            <div className="login-brand-subtitle">
              Commercial workspace
            </div>
          </div>
        </div>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>
            Sign in to access the Commercial Operations Dashboard.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="name@company.com"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
          </label>

          {errorMessage && (
            <div className="login-error" role="alert">
              {errorMessage}
            </div>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={submitting || loading}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="login-access-note">
          Access is limited to authorised users.
        </p>
      </section>
    </main>
  );
}
