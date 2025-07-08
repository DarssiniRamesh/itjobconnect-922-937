import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { JobService } from "./api";
import { Navigate } from "react-router-dom";

/**
 * EMPLOYER DASHBOARD
 * - Job CRUD (Create, Edit, Delete, List)
 * - Applications panel per job
 * Only accessible to authenticated employers.
 */
// PUBLIC_INTERFACE
export default function EmployerDashboard() {
  const { isAuthenticated, profile, user } = useAuth();
  const token = user && user.token;

  // Redirect non-authenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  // Role check: Only employer
  if (!profile || profile.role !== "employer") {
    return (
      <div className="container" style={{ margin: "48px auto", maxWidth: 780 }}>
        <h2 className="title">Employer Dashboard</h2>
        <p className="form-error" style={{ marginTop: 30 }}>
          Access denied: Employer account required.
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 980, margin: "46px auto 36px auto" }}>
      <h2 className="title" style={{ marginBottom: 18 }}>Employer Dashboard</h2>
      <EmployerJobPanel token={token} />
    </div>
  );
}

// ------- Employer Job Panel -------
function EmployerJobPanel({ token }) {
  const [jobs, setJobs] = useState([]);
  const [applicationsMap, setApplicationsMap] = useState({}); // {jobId: [apps]}
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  // Fetch only this employer's jobs
  const fetchMyJobs = async () => {
    setLoading(true); setError(null);
    try {
      const myJobs = await JobService.listMyJobs(token); // requires backend endpoint
      setJobs(Array.isArray(myJobs) ? myJobs : []);
    } catch (err) {
      setError(err.message || "Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyJobs(); }, []);

  // Fetch applications for a job
  const fetchApplications = async (jobId) => {
    setLoading(true); setError(null);
    try {
      const apps = await JobService.getJobApplications(jobId, token);
      setApplicationsMap((map) => ({ ...map, [jobId]: Array.isArray(apps) ? apps : [] }));
    } catch (err) {
      setError("Couldn't fetch applications: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  // Handlers for create, edit & delete
  const handleCreate = () => {
    setSelectedJob(null);
    setFormMode("create");
    setShowForm(true);
    setMsg(null);
    setError(null);
  };
  const handleEdit = (job) => {
    setSelectedJob(job);
    setFormMode("edit");
    setShowForm(true);
    setMsg(null);
    setError(null);
  };
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    setLoading(true); setError(null);
    try {
      await JobService.deleteJob(jobId, token);
      setMsg("Job deleted.");
      fetchMyJobs();
    } catch (err) {
      setError("Failed to delete job: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  // Save handler for form
  const handleFormSave = async (formValues) => {
    setLoading(true); setError(null);
    try {
      if (formMode === "create") {
        await JobService.createJob(formValues, token);
        setMsg("Job posted.");
      } else if (formMode === "edit" && selectedJob) {
        await JobService.updateJob(selectedJob.id || selectedJob._id, formValues, token);
        setMsg("Job updated.");
      }
      setShowForm(false);
      fetchMyJobs();
    } catch (err) {
      setError(err.message || "Failed to save job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 15 }}>
        <button className="btn" style={{ padding: "8px 20px", fontWeight: 700, fontSize: 15 }} onClick={handleCreate}>
          + Post New Job
        </button>
      </div>

      {showForm && (
        <JobForm
          mode={formMode}
          initialData={selectedJob}
          onSave={handleFormSave}
          onCancel={() => { setShowForm(false); setError(null);} }
          loading={loading}
        />
      )}

      {msg && <div className="form-success" style={{ marginBottom: 8 }}>{msg}</div>}
      {error && <div className="form-error" style={{ marginBottom: 8 }}>{error}</div>}
      <EmployerJobList
        jobs={jobs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewApplications={fetchApplications}
        applicationsMap={applicationsMap}
        loading={loading}
      />
    </div>
  );
}

// ------- Job Form (Create/Edit) -------
function JobForm({ mode, initialData, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    company: initialData?.company || "",
    location: initialData?.location || "",
    is_remote: initialData?.is_remote || false,
    job_type: initialData?.job_type || "Full Time",
    description: initialData?.description || "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.location || !form.description) return;
    onSave({ ...form });
  };

  return (
    <div className="auth-container" style={{ maxWidth: 520, marginBottom: 20 }}>
      <h3 style={{ marginBottom: 8 }}>
        {mode === "create" ? "Post New Job" : "Edit Job"}
      </h3>
      <form className="auth-form" onSubmit={handleSubmit} style={{ gap: 16 }}>
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} maxLength={80} required disabled={loading} />
        </label>
        <label>
          Company
          <input name="company" value={form.company} onChange={handleChange} maxLength={60} required disabled={loading} />
        </label>
        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} maxLength={64} required disabled={loading} />
        </label>
        <label>
          <input type="checkbox" name="is_remote" checked={!!form.is_remote} onChange={handleChange} disabled={loading} />
          Remote
        </label>
        <label>
          Job Type
          <select name="job_type" value={form.job_type} onChange={handleChange} disabled={loading}>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </label>
        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} rows={5} maxLength={600} required disabled={loading} />
        </label>
        <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
          <button className="btn" type="submit" style={{ flex: "1" }} disabled={loading}>
            {loading ? "Saving..." : mode === "create" ? "Post Job" : "Update"}
          </button>
          <button className="btn" type="button" onClick={onCancel} disabled={loading} style={{ background: "#999", color: "#fff" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ------- List of Employer's Jobs with Application panels -------
function EmployerJobList({ jobs, onEdit, onDelete, onViewApplications, applicationsMap, loading }) {
  if (!loading && jobs.length === 0) {
    return (
      <div style={{ color: "#777", fontSize: 16, marginTop: 30, textAlign: "center" }}>
        <span>No jobs posted yet.</span>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 6 }}>
      {jobs.map((job) => (
        <div
          key={job.id || job._id}
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            marginBottom: 34,
            boxShadow: "0 2px 12px rgba(20,30,48,0.03)",
            padding: "20px 18px 15px 22px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 2 }}>
              <span style={{ fontWeight: 600, fontSize: 18 }}>{job.title}</span>
              <span style={{ color: "#6197df", marginLeft: 16, fontWeight: 600 }}>{job.company}</span>
              <span style={{ color: "#222", marginLeft: 16 }}>{job.location}</span>
              {job.is_remote && (
                <span style={{ marginLeft: 10, color: "#18a049", fontWeight: 500 }}>Remote</span>
              )}
              <span style={{ background: "#ededed", color: "#444", borderRadius: 5, padding: "2px 10px", marginLeft: 16, fontSize: 14 }}>
                {job.job_type}
              </span>
              <div style={{ fontSize: 15, marginTop: 5, color: "#666" }}>{truncate(job.description, 120)}</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end" }}>
              <button className="btn" style={{ background: "#21ba45", color: "#fff", marginBottom: 2 }} onClick={() => onEdit(job)} disabled={loading}>Edit</button>
              <button className="btn" style={{ background: "#c52222", color: "#fff" }} onClick={() => onDelete(job.id || job._id)} disabled={loading}>Delete</button>
              <button className="btn" style={{ background: "#0077c0", color: "#fff" }} onClick={() => onViewApplications(job.id || job._id)} disabled={loading}>
                View Applications
              </button>
            </div>
          </div>
          {/* Applications list */}
          {applicationsMap[job.id || job._id] && (
            <div style={{ marginTop: 18 }}>
              <ApplicationsPanel applications={applicationsMap[job.id || job._id]} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ------- Applications List Panel -------
function ApplicationsPanel({ applications }) {
  if (!applications.length) {
    return <div style={{ color: "#999", fontSize: 15, marginTop: 6 }}>No applications yet.</div>;
  }
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Applications:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {applications.map((a, idx) => (
          <div key={a.id || idx} style={{
            background: "#f1f6fb", borderRadius: 8, padding: "11px 14px", color: "#222", fontSize: 15, border: "1px solid #dadfe5"
          }}>
            <b>{a.applicant_name || a.candidate_name || a.username || "Applicant"}</b>{" "}
            <span style={{ color: "#2b71b9" }}>{a.email || ""}</span>
            <div style={{ fontSize: 14, color: "#666", marginTop: 2 }}>{truncate(a.cover_letter, 120)}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
              Applied: {formatDate(a.applied_at || a.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function truncate(text, n) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n) + "..." : text;
}

function formatDate(dt) {
  try {
    const d = typeof dt === "string" ? new Date(dt) : dt;
    return d.toLocaleDateString();
  } catch {
    return dt;
  }
}
