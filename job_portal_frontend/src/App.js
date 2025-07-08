import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import JobListPage from "./JobListPage";
import EmployerDashboard from "./EmployerDashboard";
import ProfilePage from "./ProfilePage";
import NotificationsPanel from "./NotificationsPanel";

/**
 * Responsive navigation bar component for the portal.
 */
function MainNavBar({ theme, onToggleTheme }) {
  const { isAuthenticated, profile, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar" style={{
      width: "100%",
      background: "var(--bg-secondary)",
      borderBottom: "1.5px solid var(--border-color)",
      boxShadow: "0 0px 16px rgba(30,29,60,0.04)",
      padding: "0 0",
      minHeight: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      zIndex: 10,
      flexWrap: "wrap"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <img src={logo} alt="logo" style={{ height: 36, marginLeft: 18, marginRight: 10 }} />
        <span
          className="title"
          style={{
            fontWeight: "bold",
            fontFamily: 'Inter, "Segoe UI", Roboto, Arial, sans-serif',
            fontSize: 21,
            color: "rgb(26, 35, 126)",
            fontStyle: "italic",
            textDecoration: "underline",
            textAlign: "left"
          }}
        >
          KAVIA IT Job Portal
        </span>
        <Link
          to="/jobs"
          className={`btn nav-btn${location.pathname.startsWith('/jobs') ? ' active' : ''}`}
          style={{ marginLeft: 28 }}
        >
          Jobs
        </Link>
        {isAuthenticated && profile?.role === "employer" && (
          <Link
            to="/employer/dashboard"
            className={`btn nav-btn${location.pathname.includes('/employer/dashboard') ? ' active' : ''}`}
            style={{ background: "#2196f3", color: "#fff", marginLeft: 6 }}
          >
            Employer
          </Link>
        )}
      </div>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginRight: 14
      }}>
        {!isAuthenticated ? (
          <>
            <Link to="/login" className={`btn nav-btn${location.pathname === '/login' ? ' active' : ''}`}>
              Login
            </Link>
            <Link to="/register" className={`btn nav-btn${location.pathname === '/register' ? ' active' : ''}`}>
              Register
            </Link>
          </>
        ) : (
          <>
            <Link to="/profile" className="btn nav-btn" style={{ background: "#ff9800", color: "#fff" }}>
              Profile
            </Link>
            <Link to="/notifications" className="btn nav-btn" style={{ background: "#dedc35", color: "#212121" }}>
              Notifications
            </Link>
            <span style={{
              color: "#333", fontWeight: 600, marginLeft: 12, marginRight: 3, fontSize: 15,
              display: window.innerWidth < 700 ? "none" : "inline"
            }}>
              {(profile && (profile.username || profile.email)) || "User"}
            </span>
            <button
              className="btn"
              style={{
                background: "var(--button-bg)",
                color: "var(--button-text)",
                fontWeight: 700,
                padding: "6px 17px",
                marginLeft: 1
              }}
              onClick={logout}
            >
              Logout
            </button>
          </>
        )}
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          style={{ marginLeft: 20, position: "static" }}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </nav>
  );
}

/**
 * The main application shell including navigation and page routing.
 */
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

  // Main content with extra responsiveness wrappers
  function MainContent() {
    return (
      <div className="main-content" style={{
        margin: "0 auto",
        maxWidth: 1280,
        width: "100%",
        padding: "30px 10px 16px 10px",
        minHeight: "calc(100vh - 62px)",
        boxSizing: "border-box"
      }}>
        <Routes>
          <Route path="/" element={<JobListPage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/employer/dashboard" element={
            <PrivateRoute>
              <EmployerDashboard />
            </PrivateRoute>
          }/>
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }/>
          <Route path="/notifications" element={
            <PrivateRoute>
              <NotificationsPanel />
            </PrivateRoute>
          }/>
          {/* Not found */}
          <Route path="*" element={
            <div style={{ padding: 48, textAlign: "center", color: "#777" }}>
              <h2>404 Not Found</h2>
              <p>The page you're looking for does not exist.</p>
              <Link to="/jobs" className="btn" style={{ marginTop: 14 }}>Go to Jobs</Link>
            </div>
          }/>
        </Routes>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <MainNavBar theme={theme} onToggleTheme={toggleTheme} />
          <MainContent />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
