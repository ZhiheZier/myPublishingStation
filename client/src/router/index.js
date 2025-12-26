import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import PostDetail from '../pages/PostDetail.vue'
import Category from '../pages/Category.vue'
import Search from '../pages/Search.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
