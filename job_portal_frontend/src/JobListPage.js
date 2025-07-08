import React, { useState, useEffect } from "react";
import { JobService } from "./api";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Jobs listing and search page UI.
 * Allows searching/filtering IT jobs and displays the results.
 * Available to all users (login optional).
 */
// PUBLIC_INTERFACE
export default function JobListPage() {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    company: "",
    remote: "",
    full_time: "",
  });

  // Fetch jobs from API with current filters
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    setJobs([]);
    try {
      let params = {};
      // Only send non-empty filters
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.location) params.location = filters.location;
      if (filters.company) params.company = filters.company;
      if (filters.remote) params.remote = filters.remote;
      if (filters.full_time) params.full_time = filters.full_time;
      const jobs = await JobService.listJobs(params);
      setJobs(jobs || []);
    } catch (err) {
      setError(err.message || "Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  };

  // Search/filter handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFilters((f) => ({ ...f, [name]: checked ? "true" : "" }));
    } else {
      setFilters((f) => ({ ...f, [name]: value }));
    }
  };

  // Submit search/filter
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  // On mount, load jobs (unfiltered)
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="job-list-page container" style={{ maxWidth: 900, margin: "48px auto" }}>
      <h2 className="title">Find IT Jobs</h2>
      <form
        className="job-filter-form"
        style={{
          margin: "32px 0 18px 0",
          background: "var(--bg-secondary)",
          borderRadius: 10,
          padding: "16px 20px",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "flex-end",
        }}
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div style={{ flex: "2", minWidth: 180 }}>
          <label style={{ fontWeight: 500 }}>
            Keyword
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleInputChange}
              placeholder="e.g. frontend, devops, AWS"
              style={{ width: "100%", marginTop: 4 }}
              autoFocus
            />
          </label>
        </div>
        <div style={{ flex: "1", minWidth: 120 }}>
          <label style={{ fontWeight: 500 }}>
            Location
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleInputChange}
              placeholder="e.g. Remote, Berlin"
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
        </div>
        <div style={{ flex: "1", minWidth: 120 }}>
          <label style={{ fontWeight: 500 }}>
            Company
            <input
              type="text"
              name="company"
              value={filters.company}
              onChange={handleInputChange}
              placeholder="e.g. Google"
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
        </div>
        <div style={{ display: "flex", gap: 16, flex: "1", minWidth: 90 }}>
          <label style={{ fontWeight: 500 }}>
            <input
              type="checkbox"
              name="remote"
              checked={!!filters.remote}
              onChange={handleInputChange}
              style={{ marginRight: 6 }}
            />
            Remote
          </label>
          <label style={{ fontWeight: 500 }}>
            <input
              type="checkbox"
              name="full_time"
              checked={!!filters.full_time}
              onChange={handleInputChange}
              style={{ marginRight: 6 }}
            />
            Full Time
          </label>
        </div>
        <button
          className="btn"
          style={{ fontWeight: 700, marginLeft: 4, padding: "7px 24px", minWidth: 90 }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}
      <JobList jobs={jobs} loading={loading} />
    </div>
  );
}

/**
 * Renders a list of jobs (cards).
 */
function JobList({ jobs, loading }) {
  if (loading) {
    return (
      <div style={{ minHeight: 64, textAlign: "center" }}>
        <span>Loading jobs...</span>
      </div>
    );
  }
  if (jobs.length === 0) {
    return (
      <div style={{ minHeight: 64, textAlign: "center", color: "#888", marginTop: 32 }}>
        <span>No jobs found. Try adjusting filters.</span>
      </div>
    );
  }
  return (
    <div style={{
      marginTop: 6,
      display: "flex",
      flexDirection: "column",
      gap: 18
    }}>
      {jobs.map((job) => (
        <JobCard job={job} key={job.id || job._id || Math.random()} />
      ))}
    </div>
  );
}

/**
 * Renders a single job posting card.
 */
function JobCard({ job }) {
  // Assume job fields: id, title, company, location, is_remote, job_type, description, posted_at
  return (
    <div
      className="job-card"
      style={{
        background: "var(--bg-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: 10,
        boxShadow: "0 2px 12px rgba(20,30,48,0.04)",
        padding: "18px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 5
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <span className="subtitle" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            {job.title || "Untitled Position"}
          </span>
          {job.company && 
            <span style={{
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginLeft: 12
            }}>
              {job.company}
            </span>
          }
        </div>
        <span style={{
          marginLeft: "auto",
          fontSize: 14,
          background: "#e9ecef",
          color: "#21253f",
          borderRadius: 6,
          padding: "2px 9px",
          fontWeight: 500
        }}>
          {job.job_type || ""}
          {job.is_remote ? " · Remote" : ""}
        </span>
      </div>
      <div style={{ color: "#888", fontSize: 14 }}>
        {job.location}
        {job.posted_at && (
          <span style={{ marginLeft: 10, fontStyle: "italic" }}>
            · {formatDate(job.posted_at)}
          </span>
        )}
      </div>
      <div style={{
        margin: "7px 0 5px 0",
        color: "#444",
        fontSize: 15,
        minHeight: 28
      }}>
        {truncateText(job.description, 180)}
      </div>
      <div style={{ marginTop: 4 }}>
        <Link
          to={`/jobs/${job.id || job._id}`}
          className="btn"
          style={{
            fontWeight: 600,
            background: "var(--button-bg)",
            color: "var(--button-text)",
            padding: "6px 23px"
          }}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function truncateText(text, maxLen) {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

function formatDate(dt) {
  // dt may be ISO string or Date
  try {
    const d = typeof dt === "string" ? new Date(dt) : dt;
    return d.toLocaleDateString();
  } catch {
    return dt;
  }
}
