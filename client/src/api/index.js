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

export const getUserFavorites = (params = {}) => {
  return api.get('/user/favorites', { params });
};

// Comments API
export const getComments = (postId, params = {}) => {
  return api.get(`/posts/${postId}/comments`, { params });
};

export const addComment = (postId, content, parentId = null) => {
  return api.post(`/posts/${postId}/comments`, { content, parent_id: parentId });
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

// Background Images API
export const getBackgroundImages = () => {
  return api.get('/background-images');
};

// Announcement API
export const getAnnouncement = () => {
  return api.get('/announcement');
};

export const updateAnnouncement = (content) => {
  return api.put('/announcement', { content });
};

// Q&A API
export const getQa = () => {
  return api.get('/qa');
};

export const updateQa = (title, content) => {
  return api.put('/qa', { title, content });
};

// Guestbook API
export const getGuestbook = (params = {}) => {
  return api.get('/guestbook', { params });
};

export const addGuestbookMessage = (content) => {
  return api.post('/guestbook', { content });
};

export const deleteGuestbookMessage = (id) => {
  return api.delete(`/guestbook/${id}`);
};

export default api;
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // Only redirect to login if we're not already on the login/register page
      // and if the request is not for /auth/me (which is used for initialization)
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthRequest = error?.config?.url?.includes('/auth/me');
        const isAuthPage = currentPath === '/login' || currentPath === '/register';
        
        // Don't redirect if it's an auth initialization request or we're already on auth page
        if (!isAuthRequest && !isAuthPage) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
