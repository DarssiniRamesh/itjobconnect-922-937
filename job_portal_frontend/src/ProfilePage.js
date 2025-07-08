import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { ProfileService } from "./api";

/**
 * USER PROFILE page: View and edit your profile (basic info only)
 * Shows current profile, allows to edit email/name/etc (except username)
 */
// PUBLIC_INTERFACE
export default function ProfilePage() {
  const { user, profile, setAuthError } = useAuth();
  const token = user && user.token;
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch profile if not loaded
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const p = await ProfileService.getProfile(token);
        setInitial(p);
        setForm(reduceProfileForm(p));
      } catch (e) {
        setErr("Failed to fetch profile");
        setAuthError && setAuthError("Session expired.");
      }
      setLoading(false);
    }
    if (!profile && token) {
      fetchProfile();
    } else if (profile) {
      setInitial(profile);
      setForm(reduceProfileForm(profile));
    }
    // eslint-disable-next-line
  }, [profile, token]);

  function reduceProfileForm(p) {
    return p
      ? {
          email: p.email || "",
          full_name: p.full_name || "",
          bio: p.bio || "",
        }
      : { email: "", full_name: "", bio: "" };
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setMsg(null);
    setErr(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      await ProfileService.updateProfile(form, token);
      setMsg("Profile updated!");
      setEditing(false);
    } catch (e) {
      setErr(e.message || "Failed to update profile");
    }
    setLoading(false);
  }

  if (loading && !initial) {
    return <div className="container" style={{ margin: "48px auto", maxWidth: 440 }}>Loading profile...</div>;
  }

  if (err) {
    return (
      <div className="container" style={{ margin: "48px auto", maxWidth: 440 }}>
        <h2>Profile</h2>
        <div className="form-error">{err}</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: "48px auto", maxWidth: 480 }}>
      <h2 className="title">Your Profile</h2>
      <form className="auth-form" style={{ gap: 19, marginTop: 16 }} onSubmit={handleSubmit}>
        <label>
          Username
          <input value={initial?.username || ""} disabled style={{ background: "#e9ecef" }} />
        </label>
        <label>
          Email
          <input name="email" value={form.email} disabled={!editing} onChange={handleChange} />
        </label>
        <label>
          Full name
          <input name="full_name" value={form.full_name} disabled={!editing} onChange={handleChange} />
        </label>
        <label>
          Bio
          <textarea
            name="bio"
            value={form.bio}
            rows={3}
            maxLength={200}
            onChange={handleChange}
            disabled={!editing}
          />
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          {editing ? (
            <>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                className="btn"
                type="button"
                style={{ background: "#aaa", color: "#fff" }}
                onClick={() => {
                  setEditing(false);
                  setForm(reduceProfileForm(initial));
                  setErr(null);
                  setMsg(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          ) : (
            <button className="btn" type="button" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>
        {msg && <div className="form-success">{msg}</div>}
        {err && <div className="form-error">{err}</div>}
      </form>
    </div>
  );
}
