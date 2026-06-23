import axios from 'axios';

// Base URL points to backend API
const API_URL = 'https://study-sync-backend-sp35.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor to attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isSessionAlertActive = false;

// Interceptor to handle token expiration (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('adminToken');
        if (!isSessionAlertActive) {
          isSessionAlertActive = true;
          alert('Your session has expired. Please sign in again.');
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);


// REST API calls
export const login = (identifier: string, password: string) =>
  api.post('/auth/login', { identifier, password });

export const getStats = () =>
  api.get('/admin/stats');

export const getReps = () =>
  api.get('/admin/reps');

export const createRep = (data: any) =>
  api.post('/admin/create-rep', data);

export const deleteRep = (id: string) =>
  api.delete(`/admin/reps/${id}`);

export const getDepartments = () =>
  api.get('/departments');

export const createDepartment = (data: { name: string; code: string; levels: string[] }) =>
  api.post('/departments', data);

export const updateDepartment = (id: string, data: { name?: string; code?: string; levels?: string[] }) =>
  api.patch(`/departments/${id}`, data);

export const deleteDepartment = (id: string) =>
  api.delete(`/departments/${id}`);

export const getLecturers = () =>
  api.get('/admin/lecturers');

export const createLecturer = (data: any) =>
  api.post('/admin/create-lecturer', data);

export const deleteLecturer = (id: string) =>
  api.delete(`/admin/lecturers/${id}`);

export const getStudents = () =>
  api.get('/admin/students');

export const deleteStudent = (id: string) =>
  api.delete(`/admin/students/${id}`);

export const updateUser = (id: string, data: any) =>
  api.patch(`/admin/users/${id}`, data);

export const getCourses = () =>
  api.get('/admin/courses');

export const getCurrentSemester = () =>
  api.get('/settings/current');

export const updateCurrentSemester = (semester: string) =>
  api.post('/settings/current', { semester });

export const updateSystemSettings = (data: { semester?: string; repInviteCode?: string }) =>
  api.post('/settings/current', data);

