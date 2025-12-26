<template>
  <div>
    <!-- Category Header -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        {{ decodedCategory }}
      </h1>
      <p class="text-gray-500 text-sm">
        共 {{ total }} 篇文章
      </p>
    </div>

    <!-- Posts List -->
    <div v-if="posts.length > 0">
      <div class="space-y-0">
        <PostCard v-for="post in posts" :key="post.id" :post="post" />
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
    <div v-else class="text-center py-12 bg-white rounded-lg">
      <p class="text-gray-500 text-lg">该分类下暂无文章</p>
      <router-link
        to="/"
        class="text-primary-600 hover:text-primary-700 mt-4 inline-block"
      >
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPosts } from '../api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const decodedCategory = computed(() => decodeURIComponent(route.params.category))
const posts = ref([])
const loading = ref(true)
const page = ref(1)
const total = ref(0)
const limit = 9

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
    const res = await getPosts({ category: decodedCategory.value, page: page.value, limit })
    posts.value = res.data.posts
    total.value = res.data.total
  } catch (err) {
    console.error('Failed to load posts:', err)
  } finally {
    loading.value = false
  }
}

watch([() => route.params.category, page], () => {
  loadPosts()
})

onMounted(() => {
  loadPosts()
})
</script>
