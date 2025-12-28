<template>
  <article 
    ref="cardRef"
    class="bg-white/30 rounded shadow-sm transition-all duration-300 p-6" 
    style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);" 
    :style="{ 
      boxShadow: hovering ? '0 12px 32px rgba(0, 0, 0, 0.8)' : '0 4px 12px rgba(0, 0, 0, 0.4)'
    }"
    @mouseenter="hovering = true" 
    @mouseleave="hovering = false"
  >
    <!-- Title - Centered -->
    <h2 class="text-3xl font-bold text-center mb-3">
      <a 
        @click.prevent="openInNewTab(`/post/${post.id}`)"
        href="#" 
        class="post-title inline-block px-4 py-2 rounded text-white transition-all duration-300 hover:!bg-transparent title-link cursor-pointer" 
        style="background-color: rgba(79, 195, 247, 0.6);"
      >
        {{ post.title }}
      </a>
    </h2>

    <!-- Meta Info - Centered -->
    <div class="flex items-center justify-center gap-3 mb-4 text-xs flex-wrap">
      <span class="flex items-center gap-1 px-2 py-1 rounded text-white hover:!bg-red-500 transition-all duration-300 cursor-default" style="background-color: rgba(0, 0, 0, 0.6);">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ formatDateTime(post.created_at) }}
      </span>
      
      <!-- Tags grouped together -->
      <div v-if="post.tags && post.tags.length > 0" class="flex items-center gap-1 px-2 py-1 rounded text-white hover:!bg-red-500 transition-all duration-300" style="background-color: rgba(0, 0, 0, 0.6);">
        <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <div class="flex items-center gap-1 flex-wrap">
          <router-link 
            v-for="(tag, index) in (post.tags || [])" 
            :key="tag.id || tag.name" 
            :to="`/category/${encodeURIComponent(tag.name)}`" 
            class="transition-colors duration-300"
          >
            {{ tag.name }}<span v-if="index < post.tags.length - 1">,</span>
          </router-link>
        </div>
      </div>
      
      <span class="flex items-center gap-1 px-2 py-1 rounded text-white hover:!bg-red-500 transition-all duration-300 cursor-default" style="background-color: rgba(0, 0, 0, 0.6);">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {{ post.favorites_count || 0 }} 收藏
      </span>
      <a 
        @click.prevent="openInNewTab(`/post/${post.id}#comments`)"
        href="#" 
        class="flex items-center gap-1 px-2 py-1 rounded text-white hover:!bg-red-500 transition-all duration-300 cursor-pointer" 
        style="background-color: rgba(0, 0, 0, 0.6);"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {{ post.comments_count || 0 }} 评论
      </a>
    </div>

    <!-- Cover Image Box with Overlay Description -->
    <div class="image-container rounded-lg overflow-hidden relative p-2" style="height: 500px; background: rgba(255, 255, 255, 0.15); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);">
      <div 
        class="inner-image-box block w-full h-full relative overflow-hidden rounded"
        style="background: rgba(255, 255, 255, 0.25); box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.25);"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
      >
        <a 
          @click.prevent="openInNewTab(`/post/${post.id}`)"
          href="#" 
          class="block w-full h-full relative cursor-pointer"
        >
          <img
            v-if="post.cover_image"
            :src="post.cover_image"
            :alt="post.title"
            class="image-zoom w-full h-full object-cover transition-transform duration-500"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
            <svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <!-- Overlay Description (appears on hover) -->
          <div 
            class="description-overlay absolute inset-0 w-full h-full pointer-events-none"
            :class="{ 'overlay-visible': isHovering }"
          >
            <div class="overlay-bg absolute inset-0 bg-gray-800/60">
            </div>
            <div class="overlay-content absolute inset-0 p-6 overflow-hidden">
              <div class="text-2xl text-white leading-relaxed max-w-none description-text" v-html="getRichContent(post.content)"></div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScrollAnimation } from '../composables/useScrollAnimation'

const router = useRouter()

const openInNewTab = (path) => {
  const routeData = router.resolve(path)
  window.open(routeData.href, '_blank', 'noopener,noreferrer')
}

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
})

const hovering = ref(false)
const isHovering = ref(false)
const isHoveringImage = ref(false)
const cardRef = ref(null)

// 使用统一的滚动动画管理
const { registerElement } = useScrollAnimation({
  showThreshold: -28, // 元素顶部距离视口底部视口高度时显示
  hideThreshold: 12, // 元素顶部距离视口底部视口高度时隐藏
  onShow: (element, isInitial) => {
    if (!element) return
    
    if (isInitial) {
      // 初始加载时在视口内，直接显示不播放动画
      element.classList.remove('card-exit', 'card-enter')
      element.classList.add('card-no-animation')
    } else {
      // 滚动时显示，播放动画
      element.classList.remove('card-exit', 'card-no-animation', 'card-enter')
      element.offsetWidth // 强制重排
      requestAnimationFrame(() => {
        element.classList.add('card-enter')
      })
    }
  },
  onHide: (element) => {
    if (!element) return
    
    // 播放退出动画
    element.classList.remove('card-enter', 'card-no-animation')
    element.classList.add('card-exit')
  }
})

onMounted(() => {
  if (cardRef.value) {
    registerElement(cardRef.value)
  }
})

const getRichContent = (htmlContent) => {
  if (!htmlContent) return ''
  // Remove image tags from HTML content
  const div = document.createElement('div')
  div.innerHTML = htmlContent
  // Remove all img elements
  const images = div.querySelectorAll('img')
  images.forEach(img => img.remove())
  // Return HTML without images
  return div.innerHTML
}

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
</script>

<style scoped>
.post-title:hover {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4);
  filter: brightness(1.3);
}

.inner-image-box:hover .image-zoom {
  transform: scale(1.1);
}

.description-overlay {
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.description-overlay.overlay-visible {
  opacity: 1;
}

.description-overlay.overlay-visible .overlay-content {
  pointer-events: auto;
}

.overlay-bg {
  opacity: 0;
  transition: opacity 0.3s ease;
  will-change: opacity;
}

.overlay-visible .overlay-bg {
  opacity: 1;
}

.overlay-content {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s;
  will-change: opacity, transform;
}

.overlay-visible .overlay-content {
  opacity: 1;
  transform: translateY(0);
}

/* Description text - plain text only, no styles */
.description-overlay :deep(.rich-content),
.description-overlay :deep(.rich-content *),
.description-overlay :deep(.rich-content p),
.description-overlay :deep(.rich-content div),
.description-overlay :deep(.rich-content span),
.description-overlay :deep(.rich-content h1),
.description-overlay :deep(.rich-content h2),
.description-overlay :deep(.rich-content h3),
.description-overlay :deep(.rich-content h4),
.description-overlay :deep(.rich-content h5),
.description-overlay :deep(.rich-content h6),
.description-overlay :deep(.rich-content li),
.description-overlay :deep(.rich-content a),
.description-overlay :deep(.rich-content strong),
.description-overlay :deep(.rich-content em),
.description-overlay :deep(.rich-content u),
.description-overlay :deep(.rich-content s) {
  color: white !important;
  background: transparent !important;
  background-color: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  font-weight: normal !important;
  font-style: normal !important;
  text-decoration: none !important;
  font-size: inherit !important;
  line-height: inherit !important;
}

.description-overlay :deep(.rich-content img) {
  max-width: 100%;
  height: auto;
}

/* Title自动换行并居中 */
.title-link {
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  text-align: center;
  display: inline-block;
  max-width: 100%;
}

/* 描述文本截断（使用多行省略） */
.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 8; /* 显示最多8行 */
  line-clamp: 8; /* 标准属性 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.6;
}

.description-text :deep(*) {
  display: inline;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  font-weight: normal !important;
  font-style: normal !important;
  text-decoration: none !important;
  font-size: inherit !important;
  line-height: inherit !important;
  color: white !important;
}

.description-text :deep(p) {
  display: inline;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  background-color: transparent !important;
}

.description-text :deep(br) {
  display: block;
  content: "";
  margin-top: 0.5em;
}

/* Card animation states - Flip inward from behind the screen (rotateX) */
article {
  opacity: 0;
  transform: perspective(1200px) translateZ(-300px) rotateX(-90deg);
  transform-origin: center center;
}

@keyframes cardEnter {
  0% {
    opacity: 0;
    transform: perspective(1200px) translateZ(-300px) rotateX(-90deg);
  }
  100% {
    opacity: 1;
    transform: perspective(1200px) translateZ(0) rotateX(0deg);
  }
}

@keyframes cardExit {
  0% {
    opacity: 1;
    transform: perspective(1200px) translateZ(0) rotateX(0deg);
  }
  100% {
    opacity: 0;
    transform: perspective(1200px) translateZ(-300px) rotateX(-90deg);
  }
}

.card-enter {
  animation: cardEnter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.card-exit {
  animation: cardExit 0.6s ease-in forwards;
}

.card-no-animation {
  opacity: 1;
  transform: perspective(1200px) translateZ(0) rotateX(0deg);
}
</style>
