import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

// Minimal main page for demo
function Home() {
  const { isAuthenticated, profile, logout } = useAuth();
  return (
    <div>
      <h2>Welcome to the IT Job Portal</h2>
      {isAuthenticated && profile && (
        <>
          <div style={{ margin: "1rem 0" }}>
            <span>
              Logged in as <b>{profile.username || profile.email}</b>
            </span>
            <button
              style={{
                marginLeft: 18,
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
          </div>
          <div>
            <em>(Job listings and dashboard coming soon...)</em>
          </div>
        </>
      )}
      {!isAuthenticated && (
        <div style={{ margin: "1.5rem 0" }}>
          <Link to="/login" className="btn" style={{ marginRight: "12px" }}>
            Login
          </Link>
          <Link to="/register" className="btn">
            Register
          </Link>
        </div>
      )}
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
                  // Protect this route if needed for authenticated content
                  <Home />
                }
              />
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
