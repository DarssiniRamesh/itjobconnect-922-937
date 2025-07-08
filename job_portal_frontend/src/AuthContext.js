import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthService } from "./api";

// PUBLIC_INTERFACE
const AuthContext = createContext();

/**
 * Provides authentication state and methods to the app.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("jwt_token");
    return token ? { token } : null;
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Fetch profile if JWT exists but no user loaded
  useEffect(() => {
    const token = user && user.token;
    if (token && !user.profile) {
      setLoading(true);
      AuthService.profile(token)
        .then((profile) => setUser((u) => ({ ...u, profile })))
        .catch((err) => {
          setAuthError("Session expired. Please login again.");
          setUser(null);
          localStorage.removeItem("jwt_token");
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line
  }, []);

  // PUBLIC_INTERFACE
  const login = async (payload) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await AuthService.login(payload);
      localStorage.setItem("jwt_token", data.access_token || data.token);
      setUser({ token: data.access_token || data.token });
      // Fetch profile after login
      AuthService.profile(data.access_token || data.token)
        .then((profile) => setUser((u) => ({ ...u, profile })))
        .catch(() => {});
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  const register = async (payload) => {
    setLoading(true);
    setAuthError(null);
    try {
      await AuthService.register(payload);
      // Optional: auto-login after registration
      return await login({
        username: payload.username,
        password: payload.password,
      });
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  const logout = () => {
    localStorage.removeItem("jwt_token");
    setUser(null);
    setAuthError(null);
  };

  // Expose context value
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!user.token,
        profile: user && user.profile,
        loading,
        authError,
        login,
        register,
        logout,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}
