<template>
  <div>
    <!-- Page Header -->
    <div class="bg-white/30 rounded mb-6 p-6 transition-all duration-300" style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);">
      <h1 class="text-3xl font-bold text-center mb-2">
        <span class="inline-block px-4 py-2 rounded text-white" style="background-color: rgba(79, 195, 247, 0.6);">
          我的收藏
        </span>
      </h1>
      <p class="text-center text-gray-600 mt-2">共 {{ total }} 篇收藏文章</p>
    </div>

    <!-- Posts List -->
    <div v-if="posts.length > 0">
      <div class="space-y-6">
        <PostCard v-for="(post, index) in posts" :key="post.id" :post="post" :index="index" />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8 mb-4">
        <button
          @click="page = Math.max(1, page - 1)"
          :disabled="page === 1"
          :class="[
            'px-3 py-1 rounded transition-colors text-sm text-black border border-black',
            page === 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary-600 hover:text-white hover:border-primary-600'
          ]"
        >
          <<
        </button>
        
        <div class="flex items-center gap-1">
          <template v-for="pageNum in visiblePages" :key="pageNum">
            <span v-if="pageNum === '...'" class="px-2 text-gray-500">...</span>
            <button
              v-else
              @click="page = pageNum"
              :class="[
                'px-3 py-1 rounded transition-colors text-sm text-black',
                page === pageNum
                  ? 'bg-primary-600 text-white border border-primary-600'
                  : 'border border-black hover:bg-primary-600 hover:text-white hover:border-primary-600'
              ]"
            >
              {{ pageNum }}
            </button>
          </template>
        </div>
        
        <button
          @click="page = Math.min(totalPages, page + 1)"
          :disabled="page === totalPages"
          :class="[
            'px-3 py-1 rounded transition-colors text-sm text-black border border-black',
            page === totalPages
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary-600 hover:text-white hover:border-primary-600'
          ]"
        >
          >>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-colors">
      <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <p class="text-gray-500 text-lg">还没有收藏任何文章</p>
      <router-link 
        to="/" 
        class="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        去首页看看
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserFavorites } from '../api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const router = useRouter()

const posts = ref([])
const loading = ref(true)
const page = ref(parseInt(route.query.page) || 1)
const total = ref(0)
const limit = 10

const totalPages = computed(() => Math.ceil(total.value / limit))

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 10
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    if (page.value <= 5) {
      for (let i = 1; i <= 9; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages.value)
    } else if (page.value >= totalPages.value - 4) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages.value - 8; i <= totalPages.value; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = page.value - 4; i <= page.value + 4; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages.value)
    }
  }
  
  return pages
})

const loadFavorites = async () => {
  loading.value = true
  try {
    const res = await getUserFavorites({ page: page.value, limit })
    posts.value = res.data.posts
    total.value = res.data.total
  } catch (err) {
    console.error('Failed to load favorites:', err)
    if (err.response?.status === 401) {
      // User not authenticated, redirect to login
      window.location.href = '/login'
    }
  } finally {
    loading.value = false
  }
}

watch(page, (newPage) => {
  // Update URL query parameter when page changes
  router.replace({ query: { ...route.query, page: newPage } })
  loadFavorites()
})

// Watch for route query changes (e.g., on page refresh or browser back/forward)
watch(() => route.query.page, (newPage) => {
  const pageNum = parseInt(newPage) || 1
  if (pageNum !== page.value && pageNum >= 1) {
    page.value = pageNum
  }
})

onMounted(async () => {
  // Initialize page from URL query parameter
  const queryPage = parseInt(route.query.page)
  if (queryPage && queryPage >= 1 && queryPage !== page.value) {
    page.value = queryPage
  } else {
    await loadFavorites()
  }
})
</script>

<style scoped>
/* 可以添加一些自定义样式 */
</style>
