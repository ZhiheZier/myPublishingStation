<template>
  <div>
    <!-- Personal Info Section -->
    <div class="bg-white/30 rounded mb-6 p-6 transition-all duration-300" style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);" @mouseenter="hoveringInfo = true" @mouseleave="hoveringInfo = false" :style="{ boxShadow: hoveringInfo ? '0 8px 24px rgba(0, 0, 0, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.4)' }">
      <div class="grid grid-cols-2 gap-4 p-6">
        <!-- Person 1 -->
        <div class="flex items-center gap-3">
          <div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="text-base font-medium text-gray-900">用户名 1</h4>
            <p class="text-sm text-gray-600">个人简介或标签</p>
          </div>
        </div>
        
        <!-- Person 2 -->
        <div class="flex items-center gap-3">
          <div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="text-base font-medium text-gray-900">用户名 2</h4>
            <p class="text-sm text-gray-600">个人简介或标签</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Posts List - Single Column -->
    <div v-if="posts.length > 0">
      <div class="space-y-6">
        <PostCard v-for="(post, index) in posts" :key="post.id" :post="post" :index="index" />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8 mb-4">
        <button
          @click="page = Math.max(1, page - 1)"
          :disabled="page === 1"
          class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm"
        >
          上一页
        </button>
        
        <div class="flex items-center gap-1">
          <template v-for="pageNum in visiblePages" :key="pageNum">
            <span v-if="pageNum === '...'" class="px-2 text-gray-500">...</span>
            <button
              v-else
              @click="page = pageNum"
              :class="[
                'px-3 py-1 rounded transition-colors text-sm',
                page === pageNum
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
              ]"
            >
              {{ pageNum }}
            </button>
          </template>
        </div>
        
        <button
          @click="page = Math.min(totalPages, page + 1)"
          :disabled="page === totalPages"
          class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm"
        >
          下一页
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
      <p class="text-gray-500 text-lg">暂无文章</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getPosts } from '../api'
import PostCard from '../components/PostCard.vue'

const posts = ref([])
const loading = ref(true)
const page = ref(1)
const total = ref(0)
const limit = 10
const hoveringInfo = ref(false)

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

const loadPosts = async () => {
  loading.value = true
  try {
    const res = await getPosts({ page: page.value, limit })
    posts.value = res.data.posts
    total.value = res.data.total
  } catch (err) {
    console.error('Failed to load posts:', err)
  } finally {
    loading.value = false
  }
}

watch(page, () => {
  loadPosts()
})

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.sidebar-widget {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.sidebar-widget:hover {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
}
</style>
