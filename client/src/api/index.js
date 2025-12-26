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

// Get recent comments
export const getRecentComments = (limit = 10) => {
  return api.get('/comments/recent', { params: { limit } });
};

// Get random posts
export const getRandomPosts = (limit = 5) => {
  return api.get('/posts/random', { params: { limit } });
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

// Favorites API
export const toggleFavorite = (postId) => {
  return api.post(`/posts/${postId}/favorite`);
};

// Comments API
export const getComments = (postId, params = {}) => {
  return api.get(`/posts/${postId}/comments`, { params });
};

export const addComment = (postId, content) => {
  return api.post(`/posts/${postId}/comments`, { content });
};

export const deleteComment = (commentId) => {
  return api.delete(`/comments/${commentId}`);
};

// User Profile API
export const getUserProfile = () => {
  return api.get('/user/profile');
};

export const updateUserProfile = (data) => {
  return api.put('/user/profile', data);
};

export const changePassword = (data) => {
  return api.post('/user/change-password', data);
};

export const resetPassword = (data) => {
  return api.post('/user/reset-password', data);
};

// Admin User Management API
export const getAllUsers = () => {
  return api.get('/admin/users');
};

export const updateUserRole = (userId, role) => {
  return api.put(`/admin/users/${userId}/role`, { role });
};

export const deleteUser = (userId) => {
  return api.delete(`/admin/users/${userId}`);
};

// Tags API
export const getTags = () => {
  return api.get('/tags');
};

export default api;
