import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { Link, useNavigate } from "react-router-dom";

// PUBLIC_INTERFACE
export default function RegisterPage() {
  const { register, loading, authError, setAuthError } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setAuthError && setAuthError(null);
  };

  const handleConfirmChange = (e) => {
    setConfirmPassword(e.target.value);
    setAuthError && setAuthError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      form.password !== confirmPassword
    )
      return;
    const res = await register(form);
    if (res.success) {
      setRegistrationSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1200);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
        <label>
          Username
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            disabled={loading}
            required
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
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
            autoComplete="new-password"
            disabled={loading}
            required
          />
        </label>
        <label>
          Confirm Password
          <input
            name="confirm"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmChange}
            autoComplete="new-password"
            disabled={loading}
            required
          />
        </label>
        <button
          className="btn"
          type="submit"
          disabled={
            loading ||
            !form.username ||
            !form.email ||
            !form.password ||
            form.password !== confirmPassword
          }
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {authError && <div className="form-error">{authError}</div>}
        {submitted && (!form.username || !form.email || !form.password) && (
          <div className="form-error">Please fill in all fields.</div>
        )}
        {submitted && form.password !== confirmPassword && (
          <div className="form-error">Passwords do not match.</div>
        )}
        {registrationSuccess && (
          <div className="form-success">
            Registration successful! Redirecting to dashboard...
          </div>
        )}
      </form>
      <div className="auth-links">
        <span>Already have an account? </span>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
}
