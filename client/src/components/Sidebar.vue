<template>
  <aside class="space-y-6">
    <!-- Search Widget -->
    <div class="bg-white rounded-lg shadow-lg p-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">搜索</h3>
      <form @submit.prevent="handleSearch">
        <div class="flex">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="输入关键词..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>

    <!-- Login/User Widget -->
    <LoginForm v-if="!authStore.user" />
    <div v-else class="bg-white rounded-lg shadow-lg p-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">用户信息</h3>
      <div class="space-y-3">
        <div>
          <p class="text-sm text-gray-600">用户名</p>
          <p class="text-gray-900 font-medium">{{ authStore.user.username }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">邮箱</p>
          <p class="text-gray-900 font-medium text-sm">{{ authStore.user.email }}</p>
        </div>
        <button
          @click="authStore.logout()"
          class="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
        >
          退出登录
        </button>
      </div>
    </div>

    <!-- Categories/Tags Widget -->
    <div class="bg-white rounded-lg shadow-lg p-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">分类标签</h3>
      <div class="flex flex-wrap gap-2">
        <router-link
          v-for="cat in categories"
          :key="cat.category"
          :to="`/category/${encodeURIComponent(cat.category)}`"
          class="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-primary-100 hover:text-primary-700 transition-colors text-sm"
        >
          {{ cat.category }} ({{ cat.count }})
        </router-link>
      </div>
    </div>

    <!-- Recent Posts Widget -->
    <div class="bg-white rounded-lg shadow-lg p-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">最新文章</h3>
      <ul class="space-y-3">
        <li v-for="post in recentPosts" :key="post.id">
          <router-link
            :to="`/post/${post.id}`"
            class="block hover:text-primary-600 transition-colors"
          >
            <div class="flex gap-3">
              <img
                v-if="post.cover_image"
                :src="post.cover_image"
                :alt="post.title"
                class="w-16 h-16 object-cover rounded flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                  {{ post.title }}
                </h4>
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatDate(post.created_at) }}
                </p>
              </div>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories, getPosts } from '../api'
import { useAuthStore } from '../stores/auth'
import LoginForm from './LoginForm.vue'

const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')
const categories = ref([])
const recentPosts = ref([])

onMounted(() => {
  // Load categories
  getCategories()
    .then(res => categories.value = res.data)
    .catch(err => console.error('Failed to load categories:', err))

  // Load recent posts
  getPosts({ page: 1, limit: 5 })
    .then(res => recentPosts.value = res.data.posts)
    .catch(err => console.error('Failed to load recent posts:', err))
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}
</script>
