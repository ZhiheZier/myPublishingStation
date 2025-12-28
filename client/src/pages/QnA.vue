<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>

    <!-- Q&A Content -->
    <div v-else-if="qaContent" class="space-y-6">
      <article class="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white/80 transition-colors p-6">
        <!-- Article Header -->
        <header class="text-center mb-6">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 break-words" style="word-wrap: break-word; word-break: break-word;">
            {{ qaContent.title }}
          </h1>
          <div v-if="qaContent.updated_at" class="flex items-center justify-center gap-3 text-xs">
            <span class="flex items-center gap-1 px-2 py-1 rounded text-white" style="background-color: rgba(0, 0, 0, 0.6);">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ formatDateTime(qaContent.updated_at) }}
            </span>
          </div>
        </header>

        <!-- Article Content -->
        <div class="mb-6">
          <div class="prose prose-lg max-w-none">
            <div class="text-gray-800 leading-relaxed rich-content" v-html="qaContent.content"></div>
          </div>
        </div>
      </article>

      <!-- Comments Section (using post ID from qa if available, or a special ID) -->
      <div id="comments">
        <!-- Comments will be loaded here if needed -->
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-colors">
      <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-500 text-lg">暂无问答内容</p>
      <router-link 
        to="/" 
        class="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getQa } from '../api'

const qaContent = ref(null)
const loading = ref(true)

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
    minute: '2-digit',
    second: '2-digit'
  })
  return `${dateStr} ${timeStr}`
}

const loadQa = async () => {
  loading.value = true
  try {
    const res = await getQa()
    if (res.data && res.data.id) {
      qaContent.value = res.data
    } else {
      qaContent.value = null
    }
  } catch (err) {
    console.error('Failed to load Q&A:', err)
    qaContent.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadQa()
})
</script>

<style scoped>
/* 可以添加一些自定义样式 */
</style>
