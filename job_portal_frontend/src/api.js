//
// Centralized API client and services for IT Job Portal frontend
// - Provides generic request wrapper
// - Reads backend API base URL from environment variables
// - Exposes authentication and job management service functions
//

// PUBLIC_INTERFACE
const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:3001"; // fallback for local dev

// Generic request handler using fetch
// PUBLIC_INTERFACE
async function apiRequest(endpoint, { method = "GET", body, token, params, headers = {} } = {}) {
  let url = API_BASE_URL + endpoint;

  // Handle query params
  if (params && typeof params === "object") {
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const fetchOptions = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (token) {
    fetchOptions.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  // Try to parse JSON, return error details if present
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      (data && data.detail) || response.statusText || "API request failed"
    );
  }
  return data;
}

// --- Auth Service ---
// PUBLIC_INTERFACE
export const AuthService = {
  /**
   * Registers a new user.
   * @param {object} payload {username, email, password}
   */
  register(payload) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  /**
   * Log in user (returns tokens).
   * @param {object} payload {username/email, password}
   */
  login(payload) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  /**
   * Get the current profile (requires token).
   */
  profile(token) {
    return apiRequest("/auth/me", {
      method: "GET",
      token,
    });
  },
};

// --- Job Service ---
// PUBLIC_INTERFACE
export const JobService = {
  /**
   * Fetches job postings with optional filters.
   * @param {object} params  Query filter params (e.g., keywords, location)
   */
  listJobs(params) {
    return apiRequest("/jobs", {
      method: "GET",
      params,
    });
  },

  /**
   * Fetch job posting details.
   * @param {string} jobId
   */
  getJob(jobId) {
    return apiRequest(`/jobs/${jobId}`, {
      method: "GET",
    });
  },

  /**
   * Post a new job (employer only, requires token).
   * @param {object} payload  Job data.
   * @param {string} token    Auth token.
   */
  createJob(payload, token) {
    return apiRequest("/jobs", {
      method: "POST",
      body: payload,
      token,
    });
  },

  /**
   * List all jobs posted by the current (employer) user.
   * @param {string} token Auth token.
   */
  listMyJobs(token) {
    return apiRequest("/employer/jobs", {
      method: "GET",
      token,
    });
  },

  /**
   * Update an existing job posting (employer only, requires token)
   * @param {string} jobId
   * @param {object} payload
   * @param {string} token
   */
  updateJob(jobId, payload, token) {
    return apiRequest(`/jobs/${jobId}`, {
      method: "PUT",
      body: payload,
      token,
    });
  },

  /**
   * Delete a job posting (employer only, requires token)
   * @param {string} jobId
   * @param {string} token
   */
  deleteJob(jobId, token) {
    return apiRequest(`/jobs/${jobId}`, {
      method: "DELETE",
      token,
    });
  },

  /**
   * Get all applications submitted for a specific job (employer only, requires token)
   * @param {string} jobId
   * @param {string} token
   */
  getJobApplications(jobId, token) {
    return apiRequest(`/jobs/${jobId}/applications`, {
      method: "GET",
      token,
    });
  },

  /**
   * Apply to a job (job seeker, requires token).
   * @param {string} jobId
   * @param {object} payload (e.g. application data)
   * @param {string} token
   */
  applyToJob(jobId, payload, token) {
    return apiRequest(`/jobs/${jobId}/apply`, {
      method: "POST",
      body: payload,
      token,
    });
  }
};

// Example: export other services (ProfileService, NotificationService, etc) here in the future

