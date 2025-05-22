/**
 * Axios instance for API requests.
 * All API calls should use this instance to ensure consistent baseURL and headers.
 */
import axios from 'axios';

// Tạo một instance axios với cấu hình mặc định cho toàn bộ dự án
const instance = axios.create({
  baseURL: 'http://localhost:8080/api', // Địa chỉ gốc của API backend
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Tự động đính kèm token vào header Authorization nếu có trong localStorage
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;