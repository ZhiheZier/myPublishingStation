import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Home from '../pages/Home.vue'
import PostDetail from '../pages/PostDetail.vue'
import Category from '../pages/Category.vue'
import Search from '../pages/Search.vue'
import Profile from '../pages/Profile.vue'
import AdminDashboard from '../pages/Admin/AdminDashboard.vue'
import PostEdit from '../pages/Admin/PostEdit.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail
  },
  {
    path: '/category/:category',
    name: 'Category',
    component: Category
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/post/new',
    name: 'PostNew',
    component: PostEdit,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/post/:id',
    name: 'PostEdit',
    component: PostEdit,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.user) {
    next('/')
    return
  }
  
  if (to.meta.requiresAdmin && (!authStore.user || authStore.user.role !== 'admin')) {
    next('/')
    return
  }
  
  next()
})

export default router
