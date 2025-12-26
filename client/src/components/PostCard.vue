<template>
  <article 
    ref="cardRef"
    class="bg-white/30 rounded shadow-sm transition-all duration-300 p-6" 
    style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);" 
    :style="{ 
      boxShadow: hovering ? '0 8px 24px rgba(0, 0, 0, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.4)'
    }"
    @mouseenter="hovering = true; isHovering = true" 
    @mouseleave="hovering = false; isHovering = false"
  >
    <!-- Title - Centered -->
    <h2 class="text-xl font-bold text-center mb-3">
      <router-link :to="`/post/${post.id}`" class="post-title inline-block px-4 py-2 rounded text-white transition-all duration-300 hover:!bg-transparent" style="background-color: rgba(79, 195, 247, 0.6);">
        {{ post.title }}
      </router-link>
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
      <router-link :to="`/post/${post.id}#comments`" class="flex items-center gap-1 px-2 py-1 rounded text-white hover:!bg-red-500 transition-all duration-300" style="background-color: rgba(0, 0, 0, 0.6);">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {{ post.comments_count || 0 }} 评论
      </router-link>
    </div>

    <!-- Cover Image Box with Overlay Description -->
    <div class="image-container rounded-lg overflow-hidden relative p-2" style="height: 500px; background: rgba(255, 255, 255, 0.15); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);">
      <div 
        class="inner-image-box block w-full h-full relative overflow-hidden rounded"
        style="background: rgba(255, 255, 255, 0.25); box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.25);"
      >
        <router-link 
          :to="`/post/${post.id}`" 
          class="block w-full h-full relative"
          @mouseenter.native="isHovering = true"
          @mouseleave.native="isHovering = false"
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
            <div class="overlay-content absolute inset-0 p-4 overflow-auto">
              <div class="text-base text-white leading-relaxed max-w-none rich-content" v-html="getRichContent(post.content)"></div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

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
const hasEntered = ref(false)
const isAnimating = ref(false)
let animationTimeout = null

onMounted(() => {
  if (!cardRef.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const rect = entry.boundingClientRect
        const viewportHeight = window.innerHeight
        
        if (entry.isIntersecting) {
          // Entering viewport
          if (!hasEntered.value) {
            // First time entering
            if (rect.top <= 0 && rect.bottom >= viewportHeight) {
              // Already fully visible on page load: show immediately without animation
              if (cardRef.value) {
                cardRef.value.classList.remove('card-exit', 'card-enter')
                cardRef.value.classList.add('card-no-animation')
                hasEntered.value = true
              }
            } else {
              // Entering from bottom: play enter animation (rootMargin controls when this triggers)
              if (cardRef.value && !isAnimating.value) {
                isAnimating.value = true
                cardRef.value.classList.remove('card-exit', 'card-no-animation', 'card-enter')
                cardRef.value.offsetWidth
                requestAnimationFrame(() => {
                  if (cardRef.value) {
                    cardRef.value.classList.add('card-enter')
                    hasEntered.value = true
                    animationTimeout = setTimeout(() => {
                      isAnimating.value = false
                    }, 800)
                  }
                })
              }
            }
          } else {
            // Re-entering viewport
            if (rect.top > 0) {
              // Re-entering from bottom: play enter animation (rootMargin controls when)
              if (cardRef.value && !isAnimating.value) {
                isAnimating.value = true
                cardRef.value.classList.remove('card-exit', 'card-no-animation', 'card-enter')
                cardRef.value.offsetWidth
                requestAnimationFrame(() => {
                  if (cardRef.value) {
                    cardRef.value.classList.add('card-enter')
                    animationTimeout = setTimeout(() => {
                      isAnimating.value = false
                    }, 800)
                  }
                })
              }
            } else {
              // Re-entering from top: no animation
              if (cardRef.value && !isAnimating.value) {
                cardRef.value.classList.remove('card-exit', 'card-enter')
                cardRef.value.classList.add('card-no-animation')
              }
            }
          }
        } else {
          // Leaving viewport - determine direction based on element position
          const elementCenter = rect.top + rect.height / 2
          
          if (elementCenter < viewportHeight / 2) {
            // Element center is in upper half - leaving from top (scrolling down)
            // Keep visible without animation
            if (cardRef.value && !isAnimating.value) {
              cardRef.value.classList.remove('card-exit', 'card-enter')
              cardRef.value.classList.add('card-no-animation')
            }
          } else {
            // Element center is in lower half - leaving from bottom (scrolling up)
            // Play exit animation
            if (cardRef.value && !isAnimating.value) {
              isAnimating.value = true
              cardRef.value.classList.remove('card-enter', 'card-no-animation')
              cardRef.value.classList.add('card-exit')
              animationTimeout = setTimeout(() => {
                isAnimating.value = false
              }, 600)
            }
          }
        }
      })
    },
      {
        threshold: 0.1,
        rootMargin: '0px 0px 300px 0px'
      }
  )

  observer.observe(cardRef.value)

  onUnmounted(() => {
    if (cardRef.value) {
      observer.unobserve(cardRef.value)
    }
    if (animationTimeout) {
      clearTimeout(animationTimeout)
    }
  })
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

.image-container:hover .image-zoom {
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
.description-overlay :deep(.rich-content a) {
  color: white !important;
}

.description-overlay :deep(.rich-content img) {
  max-width: 100%;
  height: auto;
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
