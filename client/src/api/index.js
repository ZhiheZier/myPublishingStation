import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Posts API
export const getPosts = (params = {}) => {
  return api.get('/posts', { params });
};

export const getPost = (id) => {
  return api.get(`/posts/${id}`);
};

export const getCategories = () => {
  return api.get('/categories');
};

export const createPost = (data) => {
  return api.post('/posts', data);
};

export const updatePost = (id, data) => {
  return api.put(`/posts/${id}`, data);
};

export const deletePost = (id) => {
  return api.delete(`/posts/${id}`);
};

// Auth API
export const login = (data) => {
  return api.post('/auth/login', data);
};

export const register = (data) => {
  return api.post('/auth/register', data);
};

export const getCurrentUser = () => {
  return api.get('/auth/me');
};

export default api;
