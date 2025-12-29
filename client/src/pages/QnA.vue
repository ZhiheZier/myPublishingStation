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

      <!-- Comments Section -->
      <div id="comments">
        <!-- Comments Title -->
        <div class="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm mb-4 px-4 py-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
          </svg>
          <span class="text-blue-500 font-medium">{{ commentsTotal }} 条评论</span>
        </div>

        <!-- Comments Loading State -->
        <div v-if="commentsLoading" class="text-center py-8 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
        
        <!-- Comments Empty State -->
        <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm">
          暂无评论，快来发表第一条评论吧！
        </div>
        
        <!-- Comments List -->
        <template v-else>
          <CommentItem
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
            :is-reply="false"
            @reply="replyToComment"
            @delete="deleteCommentHandler"
          />
          
          <!-- Reply Button (if not logged in) - only show if there are comments -->
          <div v-if="!authStore.user && comments.length > 0" class="mt-4 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm p-3 text-center">
            <button
              @click="handleLoginToReply"
              class="text-sm text-blue-500 hover:text-blue-700"
            >
              登录以回复
            </button>
          </div>
        </template>

        <!-- Comments Pagination -->
        <div v-if="commentsTotalPages > 1 && !commentsLoading" class="flex justify-center items-center gap-2 mt-4">
          <button
            @click="commentsPage = Math.max(1, commentsPage - 1); loadComments()"
            :disabled="commentsPage === 1"
            :class="[
              'px-3 py-1 rounded transition-colors text-sm text-black border border-black',
              commentsPage === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-primary-600 hover:text-white hover:border-primary-600'
            ]"
          >
            <<
          </button>
          
          <div class="flex items-center gap-1">
            <template v-for="pageNum in commentsVisiblePages" :key="pageNum">
              <span v-if="pageNum === '...'" class="px-2 text-gray-500">...</span>
              <button
                v-else
                @click="commentsPage = pageNum; loadComments()"
                :class="[
                  'px-3 py-1 rounded transition-colors text-sm text-black',
                  commentsPage === pageNum
                    ? 'bg-primary-600 text-white border border-primary-600'
                    : 'border border-black hover:bg-primary-600 hover:text-white hover:border-primary-600'
                ]"
              >
                {{ pageNum }}
              </button>
            </template>
          </div>
          
          <button
            @click="commentsPage = Math.min(commentsTotalPages, commentsPage + 1); loadComments()"
            :disabled="commentsPage === commentsTotalPages"
            :class="[
              'px-3 py-1 rounded transition-colors text-sm text-black border border-black',
              commentsPage === commentsTotalPages
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-primary-600 hover:text-white hover:border-primary-600'
            ]"
          >
            >>
          </button>
        </div>
      </div>

      <!-- Comment Form (only if logged in) -->
      <div v-if="authStore.user" class="mt-6">
        <div v-if="replyingTo" class="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <span class="text-sm text-blue-700">正在回复 <strong>{{ replyingTo.username }}</strong></span>
            <button @click="cancelReply" class="text-blue-600 hover:text-blue-800 text-sm">取消</button>
          </div>
        </div>
        <form @submit.prevent="submitComment" class="space-y-4">
          <textarea
            v-model="newComment"
            :placeholder="replyingTo ? `回复 ${replyingTo.username}:` : '写下你的评论...'"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-gray-900 bg-white"
            required
          ></textarea>
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="commentLoading"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ commentLoading ? '提交中...' : replyingTo ? '发表回复' : '发表评论' }}
            </button>
          </div>
        </form>
      </div>
      <div v-else class="mt-6 p-4 bg-gray-50 rounded-lg text-center text-gray-600">
        请<a href="#" @click.prevent="handleLoginToComment" class="text-primary-600 hover:text-primary-700">登录</a>后发表评论
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQa, getComments, addComment, deleteComment } from '../api'
import { useAuthStore } from '../stores/auth'
import CommentItem from '../components/CommentItem.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const qaContent = ref(null)
const loading = ref(true)
const comments = ref([])
const commentsLoading = ref(false)
const commentsPage = ref(1)
const commentsTotal = ref(0)
const commentsLimit = 10
const newComment = ref('')
const commentLoading = ref(false)
const replyingTo = ref(null) // { id: commentId, username: string, parentId: number }

// Use 999999 as special post_id for Q&A comments
const QA_POST_ID = 999999

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
      await loadComments()
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

const loadComments = async () => {
  commentsLoading.value = true
  try {
    const res = await getComments(QA_POST_ID)
    comments.value = res.data.comments || res.data
    if (res.data.total !== undefined) {
      commentsTotal.value = res.data.total
    } else {
      // Fallback for old API format
      commentsTotal.value = Array.isArray(res.data) ? res.data.length : 0
    }
  } catch (err) {
    console.error('Failed to load comments:', err)
  } finally {
    commentsLoading.value = false
  }
}

const replyToComment = (commentId, username) => {
  replyingTo.value = {
    id: commentId,
    username: username,
    parentId: commentId
  }
  setTimeout(() => {
    const form = document.querySelector('form')
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const textarea = form.querySelector('textarea')
      if (textarea) {
        textarea.focus()
      }
    }
  }, 100)
}

const cancelReply = () => {
  replyingTo.value = null
}

const submitComment = async () => {
  if (!authStore.user) {
    router.push('/')
    return
  }

  commentLoading.value = true
  try {
    const parentId = replyingTo.value ? replyingTo.value.id : null
    await addComment(QA_POST_ID, newComment.value, parentId)
    newComment.value = ''
    replyingTo.value = null
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
    await loadComments()
    if (comments.value.length === 0 && commentsPage.value > 1) {
      commentsPage.value--
      await loadComments()
    }
  } catch (err) {
    console.error('Failed to delete comment:', err)
    alert(err.response?.data?.error || '删除失败，请重试')
  }
}

const handleLoginToReply = () => {
  const pathWithoutHash = route.fullPath.split('#')[0]
  sessionStorage.setItem('redirectAfterLogin', pathWithoutHash + '#comments')
  router.push('/login')
}

const handleLoginToComment = () => {
  const pathWithoutHash = route.fullPath.split('#')[0]
  sessionStorage.setItem('redirectAfterLogin', pathWithoutHash + '#comments')
  router.push('/login')
}

onMounted(() => {
  loadQa()
  
  // 如果 URL 中有 hash，滚动到对应位置
  if (route.hash === '#comments') {
    setTimeout(() => {
      const commentsSection = document.getElementById('comments')
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
})
</script>

<style scoped>
/* 可以添加一些自定义样式 */
</style>
