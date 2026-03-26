import axios from 'axios';

const api = axios.create({
  baseURL: 'https://project-6-1-on-1-mentorship-platform.onrender.com/api',
});

// Add token to headers if it exists
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
