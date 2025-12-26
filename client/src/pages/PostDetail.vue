<template>
  <!-- Loading State -->
  <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>
  </div>

  <!-- Not Found -->
  <div v-else-if="!post" class="text-center py-12 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-colors">
    <p class="text-gray-500 text-lg">文章不存在</p>
    <router-link to="/" class="text-primary-600 hover:text-primary-700 mt-4 inline-block">
      返回首页
    </router-link>
  </div>

  <!-- Post Content -->
  <div v-else class="space-y-6">
    <article class="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white/80 transition-colors">
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
    <footer class="px-6 py-4 border-t border-gray-200 bg-gray-50/60 backdrop-blur-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 flex-wrap">
          <router-link
            v-for="tag in (post.tags || [])"
            :key="tag.id || tag.name"
            :to="`/category/${encodeURIComponent(tag.name)}`"
            class="inline-flex items-center px-4 py-2 bg-white/80 text-gray-700 rounded-lg hover:bg-white transition-colors text-sm border border-gray-200"
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
            {{ tag.name }}
          </router-link>
          <button
            v-if="authStore.user"
            @click="toggleFavoriteHandler"
            :disabled="favoriteLoading"
            class="inline-flex items-center px-4 py-2 bg-white/80 text-gray-700 rounded-lg hover:bg-white transition-colors text-sm border border-gray-200 disabled:opacity-50"
          >
            <svg
              class="w-4 h-4 mr-2"
              :class="post.is_favorited ? 'text-red-500 fill-current' : 'text-gray-500'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {{ post.favorites_count || 0 }}
          </button>
        </div>
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

  <!-- Comments Section -->
  <div id="comments" class="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white/80 transition-colors p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">评论</h2>

    <!-- Comments List -->
    <div v-if="commentsLoading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500 mb-6">
      暂无评论，快来发表第一条评论吧！
    </div>
    <div v-else class="mb-6">
      <div class="space-y-4">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="p-4 bg-gray-50/80 rounded-lg"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  class="w-5 h-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="font-medium text-gray-900">{{ comment.username }}</span>
              <span class="text-sm text-gray-500">{{ formatDate(comment.created_at) }}</span>
            </div>
            <button
              v-if="authStore.user && (authStore.user.id === comment.user_id || authStore.user.role === 'admin')"
              @click="deleteCommentHandler(comment.id)"
              class="text-red-500 hover:text-red-700 text-sm"
            >
              删除
            </button>
          </div>
          <p class="text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>
        </div>
      </div>

      <!-- Comments Pagination -->
      <div v-if="commentsTotalPages > 1" class="flex justify-center items-center gap-2 mt-6">
        <button
          @click="commentsPage = Math.max(1, commentsPage - 1); loadComments()"
          :disabled="commentsPage === 1"
          class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm"
        >
          上一页
        </button>
        
        <div class="flex items-center gap-1">
          <template v-for="pageNum in commentsVisiblePages" :key="pageNum">
            <span v-if="pageNum === '...'" class="px-2 text-gray-500">...</span>
            <button
              v-else
              @click="commentsPage = pageNum; loadComments()"
              :class="[
                'px-3 py-1 rounded transition-colors text-sm',
                commentsPage === pageNum
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
              ]"
            >
              {{ pageNum }}
            </button>
          </template>
        </div>
        
        <button
          @click="commentsPage = Math.min(commentsTotalPages, commentsPage + 1); loadComments()"
          :disabled="commentsPage === commentsTotalPages"
          class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- Comment Form (only if logged in) -->
    <div v-if="authStore.user" class="mt-6">
      <form @submit.prevent="submitComment" class="space-y-4">
        <textarea
          v-model="newComment"
          placeholder="写下你的评论..."
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          required
        ></textarea>
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="commentLoading"
            class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ commentLoading ? '提交中...' : '发表评论' }}
          </button>
        </div>
      </form>
    </div>
    <div v-else class="mt-6 p-4 bg-gray-50 rounded-lg text-center text-gray-600">
      请<a href="#" @click.prevent="$router.push('/')" class="text-primary-600 hover:text-primary-700">登录</a>后发表评论
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPost, toggleFavorite, getComments, addComment, deleteComment } from '../api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const post = ref(null)
const loading = ref(true)
const comments = ref([])
const commentsLoading = ref(false)
const commentsPage = ref(1)
const commentsTotal = ref(0)
const commentsLimit = 10
const newComment = ref('')
const commentLoading = ref(false)
const favoriteLoading = ref(false)

const commentsTotalPages = computed(() => Math.ceil(commentsTotal.value / commentsLimit))

const commentsVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 10
  
  if (commentsTotalPages.value <= maxVisible) {
    for (let i = 1; i <= commentsTotalPages.value; i++) {
      pages.push(i)
    }
  } else {
    if (commentsPage.value <= 5) {
      for (let i = 1; i <= 9; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(commentsTotalPages.value)
    } else if (commentsPage.value >= commentsTotalPages.value - 4) {
      pages.push(1)
      pages.push('...')
      for (let i = commentsTotalPages.value - 8; i <= commentsTotalPages.value; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = commentsPage.value - 4; i <= commentsPage.value + 4; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(commentsTotalPages.value)
    }
  }
  
  return pages
})

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
    await loadComments()
    // 如果 URL 中有 hash，滚动到对应位置
    if (route.hash === '#comments') {
      setTimeout(() => {
        const commentsSection = document.getElementById('comments')
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  } catch (err) {
    console.error('Failed to load post:', err)
    router.push('/')
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  commentsLoading.value = true
  try {
    const res = await getComments(route.params.id, { page: commentsPage.value, limit: commentsLimit })
    comments.value = res.data.comments || res.data
    if (res.data.total !== undefined) {
      commentsTotal.value = res.data.total
    } else {
      // Fallback for old API format
      commentsTotal.value = res.data.length
    }
  } catch (err) {
    console.error('Failed to load comments:', err)
  } finally {
    commentsLoading.value = false
  }
}

const toggleFavoriteHandler = async () => {
  if (!authStore.user) {
    router.push('/')
    return
  }

  favoriteLoading.value = true
  try {
    const res = await toggleFavorite(route.params.id)
    post.value.is_favorited = res.data.favorited
    // Reload post to get updated favorites count
    const postRes = await getPost(route.params.id)
    post.value.favorites_count = postRes.data.favorites_count
  } catch (err) {
    console.error('Failed to toggle favorite:', err)
    alert(err.response?.data?.error || '操作失败，请重试')
  } finally {
    favoriteLoading.value = false
  }
}

const submitComment = async () => {
  if (!authStore.user) {
    router.push('/')
    return
  }

  commentLoading.value = true
  try {
    await addComment(route.params.id, newComment.value)
    newComment.value = ''
    // Reload comments - since comments are ordered ASC (oldest first), new comment will be on the last page
    const newTotal = commentsTotal.value + 1
    const newTotalPages = Math.ceil(newTotal / commentsLimit)
    commentsPage.value = newTotalPages
    await loadComments()
  } catch (err) {
    console.error('Failed to add comment:', err)
    alert(err.response?.data?.error || '评论失败，请重试')
  } finally {
    commentLoading.value = false
  }
}

const deleteCommentHandler = async (commentId) => {
  if (!confirm('确定要删除这条评论吗？')) {
    return
  }

  try {
    await deleteComment(commentId)
    // Reload comments to refresh pagination
    await loadComments()
    // If current page is empty and not first page, go to previous page
    if (comments.value.length === 0 && commentsPage.value > 1) {
      commentsPage.value--
      await loadComments()
    }
  } catch (err) {
    console.error('Failed to delete comment:', err)
    alert(err.response?.data?.error || '删除失败，请重试')
  }
}

onMounted(() => {
  loadPost()
})

// 监听路由 hash 变化
watch(() => route.hash, (newHash) => {
  if (newHash === '#comments') {
    setTimeout(() => {
      const commentsSection = document.getElementById('comments')
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
})
</script>
