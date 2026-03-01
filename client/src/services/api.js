// client/src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Add these exports to the BOTTOM of your existing api.js file.
// The full file is shown for reference — only the "Symptoms" section is new.

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hercare_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hercare_token');
      localStorage.removeItem('hercare_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const registerUser      = (data) => api.post('/auth/register', data);
export const loginUser         = (data) => api.post('/auth/login', data);
export const firebaseAuthSync  = (data) => api.post('/auth/firebase', data);
export const getProfile        = ()     => api.get('/auth/profile');
export const updateProfile     = (data) => api.put('/auth/profile', data);
export const deleteAccount     = ()     => api.delete('/auth/account');

// ── Cycle ─────────────────────────────────────────────────────────────────
export const createCycleLog    = (data)     => api.post('/cycle', data);
export const getCycleLogs      = ()         => api.get('/cycle');
export const updateCycleLog    = (id, data) => api.put(`/cycle/${id}`, data);
export const addSymptom        = (id, data) => api.post(`/cycle/${id}/symptom`, data);

// ── Pregnancy ─────────────────────────────────────────────────────────────
export const createPregnancy   = (data) => api.post('/pregnancy', data);
export const getPregnancy      = ()     => api.get('/pregnancy');
export const updatePregnancy   = (data) => api.put('/pregnancy', data);

// ── Diet ──────────────────────────────────────────────────────────────────
export const getDietPlan       = (params) => api.get('/diet', { params });

// ── Reminders ─────────────────────────────────────────────────────────────
export const createReminder    = (data)     => api.post('/reminder', data);
export const getReminders      = ()         => api.get('/reminder');
export const updateReminder    = (id, data) => api.put(`/reminder/${id}`, data);
export const deleteReminder    = (id)       => api.delete(`/reminder/${id}`);



// ── Symptoms  ← NEW ───────────────────────────────────────────────────────
export const createSymptomLog  = (data)     => api.post('/symptoms', data);
export const getSymptomLogs    = (days = 90)=> api.get(`/symptoms?days=${days}`);
export const getTodaySymptoms  = ()         => api.get('/symptoms/today');
export const getSymptomTrends  = (days = 30)=> api.get(`/symptoms/trends?days=${days}`);
export const updateSymptomLog  = (id, data) => api.put(`/symptoms/${id}`, data);
export const deleteSymptomLog  = (id)       => api.delete(`/symptoms/${id}`);


// ── AI Chat  ← NEW (Step 3) ────────────────────────────────────────────────
// messages: Array<{role: 'user'|'assistant', content: string}>
// language: 'en' | 'hi' | 'mr'
export const sendChatMessage = (messages, language) =>
  api.post('/chat', { messages, language });

// client/src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// ADD these exports to the bottom of your existing api.js file:
// ─────────────────────────────────────────────────────────────────────────────

// ── Exercise Poses  ← NEW (Step 5) ────────────────────────────────────────
// phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
export const getPosesByPhase     = (phase)     => api.get(`/poses?phase=${phase}`);
// trimester: 1 | 2 | 3
export const getPosesByTrimester = (trimester) => api.get(`/poses?trimester=${trimester}`);
export const getPoseById         = (id)        => api.get(`/poses/${id}`);
export const seedPoses           = ()          => api.post('/poses/seed');


// client/src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// ADD these exports to the bottom of your existing api.js file:
// ─────────────────────────────────────────────────────────────────────────────

// ── Admin: Stats & Users  ← NEW (Step 8) ─────────────────────────────────
export const getAdminStats          = ()            => api.get('/admin/stats');
export const getAdminUsers          = (page, search)=> api.get(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
export const toggleUserStatus       = (id)          => api.patch(`/admin/users/${id}/toggle-status`);
export const deleteUser             = (id)          => api.delete(`/admin/users/${id}`);

// ── Admin: Symptom Trends ─────────────────────────────────────────────────
export const getAdminSymptomTrends  = (days)        => api.get(`/admin/symptom-trends?days=${days}`);

// ── Admin: Diet Plans ─────────────────────────────────────────────────────
export const getAdminDietPlans      = ()            => api.get('/admin/diet-plans');
export const createAdminDietPlan    = (data)        => api.post('/admin/diet-plans', data);
export const updateAdminDietPlan    = (id, data)    => api.put(`/admin/diet-plans/${id}`, data);
export const deleteAdminDietPlan    = (id)          => api.delete(`/admin/diet-plans/${id}`);

// ── Admin: Poses ──────────────────────────────────────────────────────────
export const getAdminPoses          = ()            => api.get('/admin/poses');
export const updateAdminPose        = (id, data)    => api.put(`/admin/poses/${id}`, data);
export const deleteAdminPose        = (id)          => api.delete(`/admin/poses/${id}`);

// ── Daily Wellness Logs ──────────────────────────────────────────────────
export const getTodayLog = () => api.get('/daily-log/today');
export const updateDailyLog = (data) => api.put('/daily-log/update', data);

export default api;