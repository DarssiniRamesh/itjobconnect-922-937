import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { Link, useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
export default function LoginPage() {
  const { login, loading, authError, setAuthError } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setAuthError && setAuthError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!form.username || !form.password) return;
    const res = await login(form);
    if (res.success) {
      navigate("/");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
        <label>
          Username or Email
          <input
            name="username"
            type="text"
            value={form.username}
            autoFocus
            onChange={handleChange}
            autoComplete="username"
            disabled={loading}
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            disabled={loading}
            required
          />
        </label>
        <button
          className="btn"
          type="submit"
          disabled={loading || !form.username || !form.password}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {authError && <div className="form-error">{authError}</div>}
        {submitted && (!form.username || !form.password) && (
          <div className="form-error">Please enter both username and password.</div>
        )}
      </form>
      <div className="auth-links">
        <span>Don't have an account? </span>
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
}
