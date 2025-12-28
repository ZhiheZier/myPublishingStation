import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Home from '../pages/Home.vue'
import PostDetail from '../pages/PostDetail.vue'
import Category from '../pages/Category.vue'
import Search from '../pages/Search.vue'
import Profile from '../pages/Profile.vue'
import Favorites from '../pages/Favorites.vue'
import QnA from '../pages/QnA.vue'
import Guestbook from '../pages/Guestbook.vue'
import Tools from '../pages/Tools.vue'
import Pomodoro from '../pages/Pomodoro.vue'
import Diary from '../pages/Diary.vue'
import Auth from '../pages/Auth.vue'
import Portfolio from '../pages/Portfolio.vue'
import Album from '../pages/Album.vue'
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
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { requiresAuth: true }
  },
  {
    path: '/qna',
    name: 'QnA',
    component: QnA
  },
  {
    path: '/guestbook',
    name: 'Guestbook',
    component: Guestbook
  },
  {
    path: '/tools',
    name: 'Tools',
    component: Tools,
    meta: { hideSidebar: true }
  },
  {
    path: '/tools/diary',
    name: 'Diary',
    component: Diary,
    meta: { hideSidebar: true }
  },
  {
    path: '/tools/pomodoro',
    name: 'Pomodoro',
    component: Pomodoro,
    meta: { hideSidebar: true }
  },
  {
    path: '/tools/portfolio',
    name: 'Portfolio',
    component: Portfolio,
    meta: { hideSidebar: true }
  },
  {
    path: '/tools/portfolio/:id',
    name: 'Album',
    component: Album,
    meta: { hideSidebar: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Auth,
    meta: { hideSidebar: true, fullscreen: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Auth,
    meta: { hideSidebar: true, fullscreen: true }
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth store to finish initialization
  if (authStore.loading) {
    await authStore.init()
  }
  
  if (to.meta.requiresAuth && !authStore.user) {
    // 保存当前路径，用于登录后重定向
    sessionStorage.setItem('redirectAfterLogin', to.fullPath)
    next('/login')
    return
  }
  
  if (to.meta.requiresAdmin && (!authStore.user || authStore.user.role !== 'admin')) {
    next('/')
    return
  }
  
  next()
})

export default router
