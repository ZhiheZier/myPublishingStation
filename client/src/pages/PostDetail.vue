<template>
  <!-- Loading State -->
  <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>
  </div>

  <!-- Not Found -->
  <div v-else-if="!post" class="text-center py-12 bg-white rounded-lg">
    <p class="text-gray-500 text-lg">文章不存在</p>
    <router-link to="/" class="text-primary-600 hover:text-primary-700 mt-4 inline-block">
      返回首页
    </router-link>
  </div>

  <!-- Post Content -->
  <article v-else class="bg-white rounded-lg shadow-sm">
    <!-- Article Header -->
    <header class="p-6 border-b border-gray-200">
      <div class="flex items-center gap-3 mb-4">
        <router-link
          :to="`/category/${encodeURIComponent(post.category || '未分类')}`"
          class="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
        >
          {{ post.category || '未分类' }}
        </router-link>
        <span class="text-gray-400">|</span>
        <time class="text-gray-500 text-sm">{{ formatDate(post.created_at) }}</time>
      </div>

      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {{ post.title }}
      </h1>
    </header>

    <!-- Cover Image -->
    <div v-if="post.cover_image" class="w-full">
      <img
        :src="post.cover_image"
        :alt="post.title"
        class="w-full h-96 object-cover"
      />
    </div>

    <!-- Article Content -->
    <div class="p-6">
      <div class="prose prose-lg max-w-none">
        <div class="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {{ post.content }}
        </div>
      </div>
    </div>

    <!-- Article Footer -->
    <footer class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between">
        <router-link
          :to="`/category/${encodeURIComponent(post.category || '未分类')}`"
          class="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm border border-gray-200"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          {{ post.category || '未分类' }}
        </router-link>
        <router-link
          to="/"
          class="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm"
        >
          <svg
            class="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          返回首页
        </router-link>
      </div>
    </footer>
  </article>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPost } from '../api'

const route = useRoute()
const router = useRouter()
const post = ref(null)
const loading = ref(true)

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadPost = async () => {
  loading.value = true
  try {
    const res = await getPost(route.params.id)
    post.value = res.data
  } catch (err) {
    console.error('Failed to load post:', err)
    router.push('/')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPost()
})
</script>
