// TaxEaseLK API Client for Next.js Frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('taxease_token');
}

export async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', 'Bearer ' + token);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(API_BASE_URL + endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'API Error ' + response.status);
  }

  return response.json();
}

export const authApi = {
  login: async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('taxease_token', data.access_token);
      localStorage.setItem('taxease_user', JSON.stringify(data.user));
    }
    return data;
  },
  register: async (userData) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('taxease_token', data.access_token);
      localStorage.setItem('taxease_user', JSON.stringify(data.user));
    }
    return data;
  },
  forgotPassword: (email) =>
    apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (password) =>
    apiFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('taxease_token');
      localStorage.removeItem('taxease_user');
    }
  },
  getProfile: () => apiFetch('/api/auth/me'),
};

export const businessApi = {
  getDashboard: () => apiFetch('/api/dashboard'),
  getDocuments: () => apiFetch('/api/documents'),
  uploadDocument: async (file, docType = 'Financial Statements') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    return apiFetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },
  deleteDocument: (docId) =>
    apiFetch('/api/documents/' + docId, {
      method: 'DELETE',
    }),
  getFinancials: () => apiFetch('/api/financials'),
  submitToAuditor: () =>
    apiFetch('/api/financials/submit-to-auditor', {
      method: 'POST',
    }),
  getAuditorReview: () => apiFetch('/api/auditor-review'),
};

export const auditorApi = {
  getDashboard: () => apiFetch('/api/auditor/dashboard'),
  getCompanies: (search) =>
    apiFetch('/api/auditor/companies' + (search ? '?search=' + encodeURIComponent(search) : '')),
  addCompany: (companyData) =>
    apiFetch('/api/auditor/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    }),
  getReviewQueue: (statusFilter = 'All') =>
    apiFetch('/api/auditor/review-queue?status_filter=' + encodeURIComponent(statusFilter)),
  updateStatus: (companyId, status, notes) =>
    apiFetch('/api/auditor/review-queue/' + companyId + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
  getRequests: () => apiFetch('/api/auditor/requests'),
  createRequest: (requestData) =>
    apiFetch('/api/auditor/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    }),
  sendReminder: (requestId) =>
    apiFetch('/api/auditor/requests/' + requestId + '/remind', {
      method: 'POST',
    }),
  getDiscussions: () => apiFetch('/api/auditor/discussions'),
  getMessages: (discussionId) =>
    apiFetch('/api/auditor/discussions/' + discussionId + '/messages'),
  sendMessage: (discussionId, content) =>
    apiFetch('/api/auditor/discussions/' + discussionId + '/messages', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  resolveDiscussion: (discussionId) =>
    apiFetch('/api/auditor/discussions/' + discussionId + '/resolve', {
      method: 'PATCH',
    }),
};
