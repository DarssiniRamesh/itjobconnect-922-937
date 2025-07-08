import React, { useEffect, useState } from "react";
import { NotificationService } from "./api";
import { useAuth } from "./AuthContext";

/**
 * NOTIFICATIONS panel: lists notifications and marks as read.
 * If backend not ready, fallback to mocked placeholder notifications.
 */
// PUBLIC_INTERFACE
export default function NotificationsPanel() {
  const { user } = useAuth();
  const token = user && user.token;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications
  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        // Try backend API
        const notes = await NotificationService.listNotifications(token);
        setNotifications(Array.isArray(notes) ? notes : []);
      } catch (e) {
        // Placeholder: show dummy notifications if backend fails
        setNotifications([
          {
            id: "1",
            message: "Welcome to IT Job Portal!",
            read: false,
            created_at: new Date().toISOString(),
          },
        ]);
        setError("Notifications backend not available, showing demo notifications.");
      }
      setLoading(false);
    }
    fetchData();
  }, [token]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (token) {
      try {
        await NotificationService.markAsRead(id, token);
      } catch {
        // ignore backend errors here for UX
      }
    }
  };

  return (
    <div className="container" style={{ margin: "48px auto", maxWidth: 540 }}>
      <h2 className="title">Notifications</h2>
      {loading ? (
        <span>Loading notifications...</span>
      ) : (
        <>
          {notifications.length === 0 ? (
            <div style={{ color: "#777", fontSize: 15, marginTop: 16 }}>
              No notifications
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, marginTop: 18 }}>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  style={{
                    background: n.read ? "#efefef" : "#feffe0",
                    border: "1px solid var(--border-color)",
                    borderRadius: 8,
                    padding: "13px 18px",
                    marginBottom: 14,
                    color: n.read ? "#888" : "#21253f",
                    fontWeight: n.read ? 400 : 600,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ flex: 1 }}>{n.message || n.text || "New notification"}</span>
                  <span style={{ fontSize: 13, color: "#789" }}>
                    {formatDate(n.created_at)}
                  </span>
                  {!n.read && (
                    <button
                      className="btn"
                      style={{ marginLeft: 14, padding: "6px 18px" }}
                      onClick={() => markAsRead(n.id)}
                    >
                      Mark read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {error && <div className="form-error" style={{ marginTop: 11 }}>{error}</div>}
        </>
      )}
    </div>
  );
}

function formatDate(dt) {
  if (!dt) return "";
  try {
    const d = typeof dt === "string" ? new Date(dt) : dt;
    return d.toLocaleString();
  } catch {
    return dt;
  }
}
