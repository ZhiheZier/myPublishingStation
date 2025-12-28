<template>
  <div>
    <!-- Page Header -->
    <div class="bg-white/30 rounded mb-6 p-6 transition-all duration-300" style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);">
      <h1 class="text-3xl font-bold text-center mb-2">
        <span class="inline-block px-4 py-2 rounded text-white" style="background-color: rgba(79, 195, 247, 0.6);">
          留言板
        </span>
      </h1>
      <p class="text-center text-gray-600 mt-2">留下你的想法和建议</p>
    </div>

    <!-- Comments Title -->
    <div class="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm mb-4 px-4 py-3 flex items-center gap-2">
      <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
      </svg>
      <span class="text-blue-500 font-medium">{{ commentsTotal }} 条留言</span>
    </div>

    <!-- Comments Loading State -->
    <div v-if="commentsLoading" class="text-center py-8 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
    
    <!-- Comments Empty State -->
    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm">
      暂无留言，快来发表第一条留言吧！
    </div>
    
    <!-- Comments List -->
    <template v-else>
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-white/80 rounded-lg border border-gray-200 overflow-hidden hover:bg-white/95 transition-colors mb-4"
      >
            <!-- Comment Header -->
            <div class="flex items-start gap-4 p-4 border-b border-gray-200">
              <!-- Avatar -->
              <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  class="w-8 h-8 text-gray-500"
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
              
              <!-- User Info and Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium text-gray-900">{{ comment.username }}</span>
                    <span class="text-gray-600">说道:</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-500 whitespace-nowrap">{{ formatDateTime(comment.created_at) }}</span>
                    <button
                      v-if="authStore.user && (authStore.user.id === comment.user_id || authStore.user.role === 'admin')"
                      @click="deleteCommentHandler(comment.id)"
                      class="text-red-500 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
                
                <!-- Comment Content -->
                <div class="text-gray-800 whitespace-pre-wrap break-words overflow-wrap-anywhere" style="word-wrap: break-word; word-break: break-word; overflow-wrap: anywhere;">{{ comment.content }}</div>
              </div>
            </div>
            
            <!-- Reply Button (if not logged in) -->
            <div v-if="!authStore.user" class="p-3 border-t border-gray-200 bg-gray-50/50 text-center">
              <button
                @click="handleLoginToReply"
                class="text-sm text-blue-500 hover:text-blue-700"
              >
                登录以回复
              </button>
            </div>
      </div>
    </template>

    <!-- Comments Pagination -->
    <div v-if="commentsTotalPages > 1 && !commentsLoading" class="flex justify-center items-center gap-2 mt-4 mb-6">
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

    <!-- Comment Form -->
    <div v-if="authStore.user" class="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white/80 transition-colors p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">发表留言</h2>
      <form @submit.prevent="submitComment" class="space-y-4">
        <textarea
          v-model="newComment"
          placeholder="写下你想说的话..."
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
            {{ commentLoading ? '提交中...' : '发表留言' }}
          </button>
        </div>
      </form>
    </div>
    <div v-else class="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm p-6 text-center">
      <p class="text-gray-600 mb-4">请<a href="#" @click.prevent="handleLoginToComment" class="text-primary-600 hover:text-primary-700">登录</a>后发表留言</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getGuestbook, addGuestbookMessage, deleteGuestbookMessage } from '../api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const comments = ref([])
const commentsLoading = ref(false)
const commentsPage = ref(1)
const commentsTotal = ref(0)
const commentsLimit = 10
const newComment = ref('')
const commentLoading = ref(false)

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
    minute: '2-digit'
  })
  return `${dateStr} ${timeStr}`
}

const loadComments = async () => {
  commentsLoading.value = true
  try {
    const res = await getGuestbook({ page: commentsPage.value, limit: commentsLimit })
    comments.value = res.data.comments || res.data
    if (res.data.total !== undefined) {
      commentsTotal.value = res.data.total
    } else {
      commentsTotal.value = res.data.length
    }
  } catch (err) {
    console.error('Failed to load guestbook messages:', err)
  } finally {
    commentsLoading.value = false
  }
}

const submitComment = async () => {
  if (!authStore.user) {
    return
  }

  commentLoading.value = true
  try {
    await addGuestbookMessage(newComment.value)
    newComment.value = ''
    commentsPage.value = 1 // Reset to first page to show new message
    await loadComments()
  } catch (err) {
    console.error('Failed to add message:', err)
    alert(err.response?.data?.error || '留言失败，请重试')
  } finally {
    commentLoading.value = false
  }
}

const deleteCommentHandler = async (commentId) => {
  if (!confirm('确定要删除这条留言吗？')) {
    return
  }

  try {
    await deleteGuestbookMessage(commentId)
    await loadComments()
    if (comments.value.length === 0 && commentsPage.value > 1) {
      commentsPage.value--
      await loadComments()
    }
  } catch (err) {
    console.error('Failed to delete message:', err)
    alert(err.response?.data?.error || '删除失败，请重试')
  }
}

const handleLoginToReply = () => {
  sessionStorage.setItem('redirectAfterLogin', route.fullPath)
  router.push('/login')
}

const handleLoginToComment = () => {
  sessionStorage.setItem('redirectAfterLogin', route.fullPath)
  router.push('/login')
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
/* 可以添加一些自定义样式 */
</style>
