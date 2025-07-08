import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import JobListPage from "./JobListPage";

// Minimal main page: For demo, route '/' to jobs page (also acts as welcome/dashboard)
function Home() {
  const { isAuthenticated, profile, logout } = useAuth();
  return (
    <div>
      <nav style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        marginBottom: 26,
        justifyContent: "center"
      }}>
        <Link to="/jobs" className="btn" style={{ background: "var(--button-bg)", color: "var(--button-text)" }}>
          Jobs
        </Link>
        {isAuthenticated ? (
          <>
            <span>
              Welcome, <b>{(profile && (profile.username || profile.email)) || "User"}</b>
            </span>
            <button
              style={{
                marginLeft: 6,
                padding: "4px 16px",
                borderRadius: "6px",
                border: "none",
                background: "var(--button-bg)",
                color: "var(--button-text)",
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn" style={{ marginRight: "6px" }}>
              Login
            </Link>
            <Link to="/register" className="btn">
              Register
            </Link>
          </>
        )}
      </nav>
      {/* Always render job list on home */}
      <JobListPage />
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Route protection
  function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  }

  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header" style={{ minHeight: "unset" }}>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <img src={logo} className="App-logo" alt="logo" />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <Home />
                }
              />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </BrowserRouter>
        </header>
      </div>
    </AuthProvider>
  );
}

export default App;
