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
  </div>

  <!-- Post Content -->
  <div v-else class="space-y-6">
    <article class="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm transition-all p-6" style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);" @mouseenter="hoveringArticle = true" @mouseleave="hoveringArticle = false" :style="{ boxShadow: hoveringArticle ? '0 8px 24px rgba(0, 0, 0, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.4)' }">
      <!-- Article Header - Centered Title and Date -->
      <header class="text-center mb-6">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 break-words" style="word-wrap: break-word; word-break: break-word;">
          {{ post.title }}
        </h1>
        <div class="flex items-center justify-center gap-3 text-xs">
          <span class="flex items-center gap-1 px-2 py-1 rounded text-white" style="background-color: rgba(0, 0, 0, 0.6);">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formatDateTime(post.created_at) }}
          </span>
        </div>
      </header>

      <!-- Article Content -->
      <div class="mb-6">
        <div class="prose prose-lg max-w-none">
          <div 
            ref="richContentRef"
            class="text-gray-800 leading-relaxed rich-content" 
            v-html="post.content"
            @click="handleContentClick"
          ></div>
        </div>
      </div>
      
      <!-- Image Viewer (Teleported to body) -->
      <Teleport to="body">
        <ImageViewer
          :images="articleImages"
          :initial-index="currentImageIndex"
          :visible="imageViewerVisible"
          @close="closeImageViewer"
          @update:visible="imageViewerVisible = $event"
        />
      </Teleport>

      <!-- Article Footer - Tags on left, Favorite on right -->
      <footer class="flex items-center justify-between pt-4 border-t border-gray-200/50">
        <!-- Tags on the left -->
        <div class="flex items-center gap-2 flex-wrap">
          <div v-if="post.tags && post.tags.length > 0" class="flex items-center gap-1 px-2 py-1 rounded text-white" style="background-color: rgba(0, 0, 0, 0.6);">
            <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <div class="flex items-center gap-1 flex-wrap">
              <router-link 
                v-for="(tag, index) in (post.tags || [])" 
                :key="tag.id || tag.name" 
                :to="`/category/${encodeURIComponent(tag.name)}`" 
                class="transition-colors duration-300 hover:text-red-500"
              >
                {{ tag.name }}<span v-if="index < post.tags.length - 1">,</span>
              </router-link>
            </div>
          </div>
        </div>
        
        <!-- Favorite button on the right -->
        <div class="flex items-center">
          <button
            v-if="authStore.user"
            @click="toggleFavoriteHandler"
            :disabled="favoriteLoading"
            class="flex items-center gap-1 px-2 py-1 rounded text-white transition-all duration-300 disabled:opacity-50 cursor-pointer"
            :style="post.is_favorited ? 'background-color: rgba(239, 68, 68, 0.8);' : 'background-color: rgba(0, 0, 0, 0.6);'"
          >
            <svg
              class="w-3 h-3"
              :class="post.is_favorited ? 'fill-current' : ''"
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
            {{ post.favorites_count || 0 }} 收藏
          </button>
          <span
            v-else
            class="flex items-center gap-1 px-2 py-1 rounded text-white cursor-default"
            style="background-color: rgba(0, 0, 0, 0.6);"
          >
            <svg
              class="w-3 h-3"
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
            {{ post.favorites_count || 0 }} 收藏
          </span>
        </div>
      </footer>
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
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUpdated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPost, toggleFavorite, getComments, addComment, deleteComment } from '../api'
import { useAuthStore } from '../stores/auth'
import CommentItem from '../components/CommentItem.vue'
import ImageViewer from '../components/ImageViewer.vue'

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
const replyingTo = ref(null) // { id: commentId, username: string, parentId: number }
const articleImages = ref([])
const currentImageIndex = ref(0)
const imageViewerVisible = ref(false)
const richContentRef = ref(null)
const hoveringArticle = ref(false)

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

const extractImages = (htmlContent) => {
  if (!htmlContent) return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  const images = Array.from(doc.querySelectorAll('img'))
  return images.map(img => img.src).filter(src => src)
}

// Get computed background color from element style or computed style
const getBackgroundColor = (el) => {
  if (!el) return null
  
  // First check inline style
  const inlineStyle = el.getAttribute('style') || ''
  const bgColorMatch = inlineStyle.match(/background-color\s*:\s*([^;]+)/i)
  if (bgColorMatch) {
    return bgColorMatch[1].trim()
  }
  
  // Then check computed style (for elements with default background from CSS)
  const computedStyle = window.getComputedStyle(el)
  const bgColor = computedStyle.backgroundColor
  
  // Return the computed color if it's not transparent
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    return bgColor
  }
  
  return null
}

// Normalize color strings for comparison (handle rgba, rgb, hex, etc.)
const normalizeColor = (color) => {
  if (!color) return null
  
  // Remove all whitespace and convert to lowercase
  let normalized = color.trim().toLowerCase().replace(/\s/g, '')
  
  // Handle rgba/rgb - normalize format (remove spaces in parentheses)
  if (normalized.startsWith('rgba') || normalized.startsWith('rgb')) {
    // Ensure consistent format: rgba(255,255,255,0.4) not rgba(255, 255, 255, 0.4)
    normalized = normalized.replace(/\s*,\s*/g, ',')
    return normalized
  }
  
  // Handle hex colors - normalize to lowercase, ensure 6 digits
  if (normalized.startsWith('#')) {
    // Expand short hex (#fff -> #ffffff)
    if (normalized.length === 4) {
      normalized = '#' + normalized[1] + normalized[1] + normalized[2] + normalized[2] + normalized[3] + normalized[3]
    }
    return normalized
  }
  
  return normalized
}

// Transfer span background-color to parent p/div and handle empty elements
const transferSpanBackgroundToParent = () => {
  if (!richContentRef.value) return
  
  const richContent = richContentRef.value
  
  // Hide empty or whitespace-only p/div elements
  const isEmptyOrWhitespace = (el) => {
    const text = el.textContent?.trim() || ''
    // Check if element is empty or only contains whitespace/line breaks
    const hasOnlyBreaks = Array.from(el.children).every(child => 
      child.tagName === 'BR' || (child.tagName === 'SPAN' && !child.textContent?.trim())
    )
    return text === '' && (el.children.length === 0 || hasOnlyBreaks)
  }
  
  const allPElements = richContent.querySelectorAll('p')
  const allDivElements = richContent.querySelectorAll('div')
  
  allPElements.forEach(p => {
    if (isEmptyOrWhitespace(p) && !p.hasAttribute('data-announcement')) {
      p.style.display = 'none'
    }
  })
  
  allDivElements.forEach(div => {
    // Skip ql-editor and other Quill classes
    if (!div.classList.contains('ql-editor') && 
        !div.classList.contains('ql-clipboard') &&
        !div.hasAttribute('data-announcement') &&
        isEmptyOrWhitespace(div)) {
      div.style.display = 'none'
    }
  })
  
  // Find all span elements with background-color
  const spansWithBg = richContent.querySelectorAll('span[style*="background-color"]')
  
  spansWithBg.forEach(span => {
    const parent = span.parentElement
    // Check if parent is p or div within rich-content
    if ((parent.tagName === 'P' || parent.tagName === 'DIV') && 
        parent.closest('.rich-content') === richContent &&
        !parent.hasAttribute('data-announcement')) {
      // Get the background-color from span's style
      const spanStyle = span.getAttribute('style') || ''
      const bgColorMatch = spanStyle.match(/background-color\s*:\s*([^;]+)/i)
      
      if (bgColorMatch) {
        const bgColor = bgColorMatch[1].trim()
        // Set background-color on parent, preserving other styles
        const parentStyle = parent.getAttribute('style') || ''
        // Remove existing background-color from parent style if any
        const cleanedParentStyle = parentStyle.replace(/background-color\s*:\s*[^;]+;?/gi, '').trim()
        // Add the background-color from span
        const newParentStyle = cleanedParentStyle 
          ? `${cleanedParentStyle}; background-color: ${bgColor}`
          : `background-color: ${bgColor}`
        parent.setAttribute('style', newParentStyle)
        // Remove background-color from span so it doesn't show
        const cleanedSpanStyle = spanStyle.replace(/background-color\s*:\s*[^;]+;?/gi, '').trim()
        if (cleanedSpanStyle) {
          span.setAttribute('style', cleanedSpanStyle)
        } else {
          span.removeAttribute('style')
        }
      }
    }
  })
  
  // Merge adjacent elements with same background color
  const allBlockElements = Array.from(richContent.children).filter(el => {
    return (el.tagName === 'P' || el.tagName === 'DIV') && 
           !el.hasAttribute('data-announcement') &&
           el.style.display !== 'none' &&
           !el.classList.contains('ql-editor') &&
           !el.classList.contains('ql-clipboard')
  })
  
  // First pass: merge adjacent blocks with same background color by moving content
  // Process from end to beginning to avoid index issues when removing elements
  for (let i = allBlockElements.length - 2; i >= 0; i--) {
    const currentEl = allBlockElements[i]
    const nextEl = allBlockElements[i + 1]
    
    // Skip if either element is hidden or already merged
    if (!currentEl || !nextEl ||
        currentEl.style.display === 'none' || 
        nextEl.style.display === 'none' ||
        currentEl.dataset.merged === 'true' ||
        nextEl.dataset.merged === 'true') {
      continue
    }
    
    // Get background colors
    const currentBg = getBackgroundColor(currentEl)
    const nextBg = getBackgroundColor(nextEl)
    
    // Normalize colors for comparison
    const normalizedCurrentBg = normalizeColor(currentBg)
    const normalizedNextBg = normalizeColor(nextBg)
    
    // If both have the same background color (and it's not transparent/default)
    if (normalizedCurrentBg && 
        normalizedNextBg && 
        normalizedCurrentBg === normalizedNextBg &&
        normalizedCurrentBg !== 'rgba(0,0,0,0)' &&
        normalizedCurrentBg !== 'transparent') {
      // Merge next element's content into current element
      const nextContent = nextEl.innerHTML
      if (nextContent.trim()) {
        // Add content from next element to current element
        // Preserve line breaks between merged blocks
        if (currentEl.innerHTML.trim()) {
          // Add a line break between merged content to preserve the original line break
          currentEl.innerHTML += '<br>' + nextContent
        } else {
          currentEl.innerHTML = nextContent
        }
        // Mark next element as merged and hide it
        nextEl.dataset.merged = 'true'
        nextEl.style.display = 'none'
      }
    }
  }
  
  // Second pass: remove margins/padding between remaining adjacent blocks with same background
  const remainingBlocks = allBlockElements.filter(el => 
    el && el.style.display !== 'none' && el.dataset.merged !== 'true'
  )
  
  for (let i = 0; i < remainingBlocks.length - 1; i++) {
    const currentEl = remainingBlocks[i]
    const nextEl = remainingBlocks[i + 1]
    
    if (!currentEl || !nextEl) continue
    
    // Get background colors
    const currentBg = getBackgroundColor(currentEl)
    const nextBg = getBackgroundColor(nextEl)
    
    // Normalize colors for comparison
    const normalizedCurrentBg = normalizeColor(currentBg)
    const normalizedNextBg = normalizeColor(nextBg)
    
    // If both have the same background color (and it's not transparent/default)
    if (normalizedCurrentBg && 
        normalizedNextBg && 
        normalizedCurrentBg === normalizedNextBg &&
        normalizedCurrentBg !== 'rgba(0,0,0,0)' &&
        normalizedCurrentBg !== 'transparent') {
      // Remove bottom margin/padding from current element and top margin/padding from next element
      currentEl.style.marginBottom = '0'
      currentEl.style.paddingBottom = '0'
      nextEl.style.marginTop = '0'
      nextEl.style.paddingTop = '0'
      // Mark elements that we've adjusted
      currentEl.dataset.marginAdjusted = 'true'
      nextEl.dataset.marginAdjusted = 'true'
    } else {
      // Reset margins/padding if colors don't match
      if (currentEl.dataset.marginAdjusted === 'true') {
        currentEl.style.marginBottom = ''
        currentEl.style.paddingBottom = ''
        currentEl.dataset.marginAdjusted = 'false'
      }
      if (nextEl.dataset.marginAdjusted === 'true') {
        nextEl.style.marginTop = ''
        nextEl.style.paddingTop = ''
        nextEl.dataset.marginAdjusted = 'false'
      }
    }
  }
}

const handleContentClick = (e) => {
  // Check if clicked element is an image
  if (e.target.tagName === 'IMG') {
    const imgSrc = e.target.src
    const index = articleImages.value.indexOf(imgSrc)
    if (index !== -1) {
      currentImageIndex.value = index
      imageViewerVisible.value = true
    }
  }
}

const closeImageViewer = () => {
  imageViewerVisible.value = false
}

const loadPost = async () => {
  loading.value = true
  try {
    const res = await getPost(route.params.id)
    post.value = res.data
    
    // Extract images from content
    await nextTick()
    articleImages.value = extractImages(post.value.content)
    // Transfer span background-color to parent
    await nextTick()
    transferSpanBackgroundToParent()
    
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
    const res = await getComments(route.params.id)
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

const replyToComment = (commentId, username) => {
  // commentId is the ID of the comment being replied to (could be top-level or a reply)
  // This will be used as parent_id when submitting
  replyingTo.value = {
    id: commentId, // The ID to use as parent_id
    username: username,
    parentId: commentId // The actual parent comment ID
  }
  // Scroll to comment form
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
    await addComment(route.params.id, newComment.value, parentId)
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

const handleLoginToReply = () => {
  // 移除现有hash，添加#comments
  const pathWithoutHash = route.fullPath.split('#')[0]
  sessionStorage.setItem('redirectAfterLogin', pathWithoutHash + '#comments')
  router.push('/login')
}

const handleLoginToComment = () => {
  // 移除现有hash，添加#comments
  const pathWithoutHash = route.fullPath.split('#')[0]
  sessionStorage.setItem('redirectAfterLogin', pathWithoutHash + '#comments')
  router.push('/login')
}

// Also transfer backgrounds when content updates
onUpdated(() => {
  transferSpanBackgroundToParent()
})

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
