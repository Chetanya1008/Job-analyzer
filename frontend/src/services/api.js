import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// Unified single-call analysis API
export const analyzeAllAPI = {
  analyze: (formData) =>
    api.post('/analyze-all', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// Legacy APIs kept for backward compat
export const resumeAPI = {
  upload: (formData) =>
    api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  get: (userId) => api.get(`/resume/${userId}`),
}

export const jobAPI = {
  analyze: (data) => api.post('/job/analyze', data),
  list: () => api.get('/job/list'),
  get: (jobId) => api.get(`/job/${jobId}`),
}

export const aiAPI = {
  skillGap: (jobId) => api.post('/ai/skill-gap', { jobId }),
  interviewQuestions: (jobId) => api.post('/ai/interview-questions', { jobId }),
  optimizeResume: (jobId) => api.post('/ai/optimize-resume', { jobId }),
}

export default api
