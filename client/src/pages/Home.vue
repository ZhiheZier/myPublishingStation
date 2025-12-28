<template>
  <div>
    <!-- Announcement Section -->
    <div v-if="announcementLoading" class="bg-white/30 rounded mb-6 p-6 transition-all duration-300" style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);">
      <div class="text-center py-4">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-gray-600 text-sm">加载中...</p>
      </div>
    </div>
    <div v-else-if="announcement && announcement.content" class="bg-white/30 rounded mb-6 p-6 transition-all duration-300" style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);" @mouseenter="hoveringAnnouncement = true" @mouseleave="hoveringAnnouncement = false" :style="{ boxShadow: hoveringAnnouncement ? '0 8px 24px rgba(0, 0, 0, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.4)' }">
      <div class="p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4 text-center">公告栏</h3>
        <div class="text-gray-800 leading-relaxed rich-content break-words overflow-wrap-anywhere" data-announcement v-html="announcement.content" style="word-wrap: break-word; word-break: break-word; overflow-wrap: anywhere;"></div>
        <div v-if="announcement.updated_at" class="text-xs text-gray-500 mt-4 text-right">
          更新时间: {{ formatDateTime(announcement.updated_at) }}
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
          @click="handlePageChange(Math.max(1, page - 1))"
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
              @click="handlePageChange(pageNum)"
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
          @click="handlePageChange(Math.min(totalPages, page + 1))"
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
      <p class="text-gray-500 text-lg">暂无文章</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPosts, getAnnouncement } from '../api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()

const posts = ref([])
const loading = ref(true)
const page = ref(parseInt(route.query.page) || 1)
const total = ref(0)
const limit = 10
const hoveringAnnouncement = ref(false)
const announcement = ref(null)
const announcementLoading = ref(true)

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${dateStr} ${timeStr}`
}

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

const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value && newPage !== page.value) {
    // 使用window.location.href进行重定向，带上page参数
    const url = new URL(window.location.href)
    url.searchParams.set('page', newPage)
    window.location.href = url.toString()
  }
}

// Watch for route query changes (e.g., on page refresh or browser back/forward)
watch(() => route.query.page, (newPage) => {
  const pageNum = parseInt(newPage) || 1
  if (pageNum >= 1) {
    page.value = pageNum
    loadPosts()
  }
})

const loadAnnouncement = async () => {
  announcementLoading.value = true
  try {
    const res = await getAnnouncement()
    announcement.value = res.data
  } catch (err) {
    console.error('Failed to load announcement:', err)
  } finally {
    announcementLoading.value = false
  }
}

onMounted(() => {
  // Initialize page from route.query.page and load posts
  const queryPage = parseInt(route.query.page) || 1
  page.value = queryPage
  loadPosts()
  loadAnnouncement()
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
