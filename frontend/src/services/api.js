import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Chat API
export const sendChatMessage = async (message, sessionId = null) => {
  const response = await axios.post(
    `${API}/chat/message`,
    { message, session_id: sessionId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getChatHistory = async (sessionId = null) => {
  const url = sessionId ? `${API}/chat/history?session_id=${sessionId}` : `${API}/chat/history`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
};

// Symptom Checker API
export const analyzeSymptoms = async (symptoms, duration, severity) => {
  const response = await axios.post(
    `${API}/symptoms/analyze`,
    { symptoms, duration, severity },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getSymptomHistory = async () => {
  const response = await axios.get(`${API}/symptoms/history`, { headers: getAuthHeaders() });
  return response.data;
};

// Health Metrics API
export const addHealthMetric = async (metricData) => {
  const response = await axios.post(
    `${API}/metrics`,
    metricData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getHealthMetrics = async (metricType = null) => {
  const url = metricType ? `${API}/metrics?metric_type=${metricType}` : `${API}/metrics`;
  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteHealthMetric = async (metricId) => {
  const response = await axios.delete(`${API}/metrics/${metricId}`, { headers: getAuthHeaders() });
  return response.data;
};

// Reminders API
export const createReminder = async (reminderData) => {
  const response = await axios.post(
    `${API}/reminders`,
    reminderData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getReminders = async () => {
  const response = await axios.get(`${API}/reminders`, { headers: getAuthHeaders() });
  return response.data;
};

export const completeReminder = async (reminderId) => {
  const response = await axios.patch(
    `${API}/reminders/${reminderId}/complete`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteReminder = async (reminderId) => {
  const response = await axios.delete(`${API}/reminders/${reminderId}`, { headers: getAuthHeaders() });
  return response.data;
};