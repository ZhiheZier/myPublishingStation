<template>
  <aside 
    v-if="isContentLoaded"
    class="space-y-6" 
    style="max-width: 100%; overflow: visible; position: relative; z-index: 50;"
  >
    <!-- Search Widget -->
    <div 
      ref="searchWidget"
      class="widget-initial bg-white/30 rounded shadow-lg p-2 hover:bg-white/50 transition-all duration-300 overflow-hidden sidebar-widget" 
      :class="{ 'widget-animate': widgetStates.search }"
      style="max-width: 100%;"
    >
      <form @submit.prevent="handleSearch">
        <div class="flex">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索"
            class="flex-1 px-2 py-1.5 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            class="px-2 py-1.5 bg-primary-600 text-white rounded-r hover:bg-primary-700 transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>

    <!-- Login/User Widget -->
    <div 
      ref="loginWidget"
      class="widget-initial-flip"
      :class="{ 'widget-animate-flip': widgetStates.login }"
    >
      <LoginForm v-if="!authStore.user" />
    </div>
    <div 
      v-if="authStore.user"
      ref="userWidget"
      class="widget-initial-flip bg-white/30 rounded shadow-lg p-4 pb-0 hover:bg-white/50 transition-all duration-300 overflow-hidden sidebar-widget" 
      :class="{ 'widget-animate-flip': widgetStates.user }"
      style="max-width: 100%;"
    >
      <p class="text-sm font-semibold text-white rounded-t px-3 py-1.5 mb-0 -mx-4 -mt-4 flex items-center gap-2" style="background-color: rgba(0, 0, 0, 0.6);">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        欢迎!
      </p>
      <div class="flex items-center justify-center px-0 py-5 gap-4">
        <div class="flex items-center gap-4">
          <router-link
            :to="authStore.user.role === 'admin' ? '/admin' : '/profile'"
            class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 transition-transform duration-500 hover:rotate-360 bg-gray-300"
          >
            <img
              v-if="authStore.user.avatar"
              :src="authStore.user.avatar"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
            <svg
              v-else
              class="w-7 h-7 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clip-rule="evenodd"
              />
            </svg>
          </router-link>
          <router-link
            :to="authStore.user.role === 'admin' ? '/admin' : '/profile'"
            class="text-gray-900 font-medium text-base transition-colors duration-200 hover:text-red-500"
          >
            {{ authStore.user.username }}
          </router-link>
        </div>
        <button
          @click="authStore.logout()"
          class="px-4 py-2 text-white rounded text-sm hover:bg-red-500 transition-colors"
          style="background-color: rgba(0, 0, 0, 0.6);"
        >
          退出登录
        </button>
      </div>
    </div>

    <!-- Recent Posts Widget -->
    <div 
      ref="recentPostsWidget"
      class="widget-initial bg-white/30 rounded shadow-lg p-4 pb-0 hover:bg-white/50 transition-all duration-300 overflow-hidden sidebar-widget" 
      :class="{ 'widget-animate': widgetStates.recentPosts }"
      style="max-width: 100%;"
    >
      <h3 class="text-sm font-semibold text-white rounded-t px-3 py-1.5 mb-0 -mx-4 -mt-4 flex items-center gap-2" style="background-color: rgba(0, 0, 0, 0.6);">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        最新文章
      </h3>
      <ul class="space-y-0 -mx-4">
        <li v-for="post in recentPosts" :key="post.id">
          <router-link
            :to="{ name: 'PostDetail', params: { id: post.id } }"
            class="block px-4 py-2 hover:bg-white/60 hover:shadow-md transition-all duration-200 group"
          >
            <h4 class="text-sm font-medium text-gray-900 group-hover:text-red-500 transition-colors duration-200 truncate">
              {{ formatDate(post.created_at) }} {{ post.title }}
            </h4>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Recent Comments Widget -->
    <div 
      ref="recentCommentsWidget"
      class="widget-initial bg-white/30 rounded shadow-lg p-4 pb-0 hover:bg-white/50 transition-all duration-300 sidebar-widget" 
      :class="{ 'widget-animate': widgetStates.recentComments }"
      style="max-width: 100%; position: relative; z-index: 100; overflow: visible;"
    >
      <h3 class="text-sm font-semibold text-white rounded-t px-3 py-1.5 mb-0 -mx-4 -mt-4 flex items-center gap-2" style="background-color: rgba(0, 0, 0, 0.6);">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        最新留言
      </h3>
      <ul class="space-y-0 -mx-4" style="position: relative; z-index: 200; overflow: visible;">
        <li v-for="comment in recentComments" :key="comment.id" class="relative" style="position: relative; z-index: 300; overflow: visible;">
          <router-link
            :to="`/post/${comment.post_id}#comments`"
            class="block px-4 py-2 hover:bg-white/60 transition-all duration-200 group"
          >
            <div class="flex items-center gap-2 relative">
              <!-- Tooltip on hover (left side of avatar) -->
              <div class="absolute right-[calc(100%+0.5rem)] px-3 py-1.5 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap" style="top: 50%; transform: translateY(-50%); background-color: rgba(0, 0, 0, 0.6); z-index: 9999;">
                来自《{{ comment.post_title }}》{{ comment.username }}:
                <div class="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent" style="border-left-color: rgba(0, 0, 0, 0.6);"></div>
              </div>
              <div class="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative z-0 bg-gray-300">
                <img
                  v-if="comment.avatar"
                  :src="comment.avatar"
                  alt="Avatar"
                  class="w-full h-full object-cover"
                />
                <svg
                  v-else
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
              <div class="bg-gray-100/80 rounded px-3 py-1.5 flex-1 min-w-0">
                <p class="text-sm text-gray-800 group-hover:text-red-500 transition-colors duration-200 truncate">
                  {{ comment.content }}
                </p>
              </div>
            </div>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Random Posts Widget -->
    <div 
      ref="randomPostsWidget"
      class="widget-initial bg-white/30 rounded shadow-lg p-4 pb-0 hover:bg-white/50 transition-all duration-300 overflow-hidden sidebar-widget" 
      :class="{ 'widget-animate': widgetStates.randomPosts }"
      style="max-width: 100%;"
    >
      <h3 class="text-sm font-semibold text-white rounded-t px-3 py-1.5 mb-0 -mx-4 -mt-4 flex items-center gap-2" style="background-color: rgba(0, 0, 0, 0.6);">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        随机文章
      </h3>
      <ul v-if="randomPosts && randomPosts.length > 0" class="space-y-0 -mx-4">
        <li v-for="post in randomPosts" :key="post.id">
          <router-link
            :to="{ name: 'PostDetail', params: { id: post.id } }"
            class="block px-4 py-3 hover:bg-white/60 hover:shadow-md transition-all duration-200 group"
          >
            <h4 class="text-sm font-medium text-gray-900 group-hover:text-red-500 line-clamp-2 transition-colors duration-200 truncate">
              {{ post.title }}
            </h4>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Categories/Tags Widget -->
    <div 
      ref="categoriesWidget"
      class="widget-initial bg-white/30 rounded shadow-lg p-4 hover:bg-white/50 transition-all duration-300 overflow-hidden sidebar-widget" 
      :class="{ 'widget-animate': widgetStates.categories }"
      style="max-width: 100%;"
    >
      <h3 class="text-sm font-semibold text-white rounded-t px-3 py-1.5 mb-3 -mx-4 -mt-4 flex items-center gap-2" style="background-color: rgba(0, 0, 0, 0.6);">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        分类标签
      </h3>
      <div class="flex flex-wrap gap-2">
        <router-link
          v-for="tag in tags"
          :key="tag.name"
          :to="`/category/${encodeURIComponent(tag.name)}`"
          class="px-3 py-1 bg-gray-100/60 text-gray-700 rounded-md hover:bg-primary-100/80 hover:text-primary-700 transition-colors text-sm"
        >
          {{ tag.name }} ({{ tag.count }})
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getTags, getPosts, getRecentComments, getRandomPosts } from '../api'
import { useAuthStore } from '../stores/auth'
import LoginForm from './LoginForm.vue'

const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')
const tags = ref([])
const recentPosts = ref([])
const recentComments = ref([])
const randomPosts = ref([])
const isContentLoaded = ref(false)
const widgetStates = ref({
  search: false,
  login: false,
  user: false,
  categories: false,
  recentPosts: false,
  recentComments: false,
  randomPosts: false
})
const widgetAnimating = ref({
  search: false,
  login: false,
  user: false,
  categories: false,
  recentPosts: false,
  recentComments: false,
  randomPosts: false
})
const widgetHasEntered = ref({
  search: false,
  login: false,
  user: false,
  categories: false,
  recentPosts: false,
  recentComments: false,
  randomPosts: false
})
const searchWidget = ref(null)
const loginWidget = ref(null)
const userWidget = ref(null)
const categoriesWidget = ref(null)
const recentPostsWidget = ref(null)
const recentCommentsWidget = ref(null)
const randomPostsWidget = ref(null)
const isFirstLoad = ref(true)
const animationTimeouts = {}

onMounted(async () => {
  // Load all content first
  const promises = [
    getTags().then(res => tags.value = res.data).catch(err => console.error('Failed to load tags:', err)),
    getPosts({ page: 1, limit: 3 }).then(res => recentPosts.value = res.data.posts).catch(err => console.error('Failed to load recent posts:', err)),
    getRecentComments(10).then(res => recentComments.value = res.data).catch(err => console.error('Failed to load recent comments:', err)),
    getRandomPosts(5).then(res => {
      randomPosts.value = Array.isArray(res.data) ? res.data : [];
    }).catch(err => {
      console.error('Failed to load random posts:', err);
      randomPosts.value = [];
    })
  ]
  
  // Wait for all content to load
  await Promise.all(promises)
  isContentLoaded.value = true
  
  // Wait for next tick to ensure DOM is rendered
  await nextTick()
  
  // Setup Intersection Observer for each widget
  const viewportHeight = window.innerHeight
  const widgets = [
    { ref: searchWidget, key: 'search' },
    { ref: loginWidget, key: 'login' },
    { ref: userWidget, key: 'user' },
    { ref: categoriesWidget, key: 'categories' },
    { ref: recentPostsWidget, key: 'recentPosts' },
    { ref: recentCommentsWidget, key: 'recentComments' },
    { ref: randomPostsWidget, key: 'randomPosts' }
  ]
  
  const observers = []
  
  widgets.forEach(({ ref: widgetRef, key }) => {
    if (widgetRef.value) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const rect = entry.boundingClientRect
            const isFlipWidget = key === 'login' || key === 'user'
            
            if (entry.isIntersecting) {
              // Entering viewport
              if (!widgetHasEntered.value[key]) {
                // First time entering
                if (isFirstLoad.value || (rect.top <= 0 && rect.bottom >= viewportHeight)) {
                  // Already fully visible on page load: show immediately
                  if (widgetRef.value && !widgetAnimating.value[key]) {
                    widgetRef.value.classList.remove(
                      isFlipWidget ? 'widget-initial-flip' : 'widget-initial',
                      'widget-exit', 
                      'widget-exit-flip',
                      'widget-animate',
                      'widget-animate-flip'
                    )
                    widgetRef.value.style.opacity = '1'
                    widgetRef.value.style.transform = isFlipWidget ? 'perspective(1000px) rotateY(0deg)' : 'translateY(0)'
                    widgetStates.value[key] = false
                    widgetHasEntered.value[key] = true
                  }
                } else if (rect.top > 0) {
                  // Entering from bottom (even far away due to large rootMargin): play enter animation
                  if (widgetRef.value && !widgetAnimating.value[key]) {
                    widgetAnimating.value[key] = true
                    widgetRef.value.classList.remove(
                      'widget-exit', 
                      'widget-exit-flip', 
                      'widget-animate', 
                      'widget-animate-flip'
                    )
                    void widgetRef.value.offsetWidth
                    widgetRef.value.classList.add(isFlipWidget ? 'widget-animate-flip' : 'widget-animate')
                    widgetStates.value[key] = true
                    widgetHasEntered.value[key] = true
                    animationTimeouts[key] = setTimeout(() => {
                      widgetAnimating.value[key] = false
                    }, 600)
                  }
                }
              } else {
                // Re-entering viewport
                if (rect.top > 0) {
                  // Re-entering from bottom: play enter animation
                  if (widgetRef.value && !widgetAnimating.value[key]) {
                    widgetAnimating.value[key] = true
                    widgetRef.value.classList.remove(
                      'widget-exit', 
                      'widget-exit-flip', 
                      'widget-animate', 
                      'widget-animate-flip'
                    )
                    void widgetRef.value.offsetWidth
                    widgetRef.value.classList.add(isFlipWidget ? 'widget-animate-flip' : 'widget-animate')
                    widgetStates.value[key] = true
                    animationTimeouts[key] = setTimeout(() => {
                      widgetAnimating.value[key] = false
                    }, 600)
                  }
                } else {
                  // Re-entering from top: no animation
                  if (widgetRef.value && !widgetAnimating.value[key]) {
                    widgetRef.value.classList.remove(
                      isFlipWidget ? 'widget-initial-flip' : 'widget-initial',
                      'widget-exit', 
                      'widget-exit-flip',
                      'widget-animate',
                      'widget-animate-flip'
                    )
                    widgetRef.value.style.opacity = '1'
                    widgetRef.value.style.transform = isFlipWidget ? 'perspective(1000px) rotateY(0deg)' : 'translateY(0)'
                    widgetStates.value[key] = false
                  }
                }
              }
            } else {
              // Leaving viewport - determine direction based on element position
              const elementCenter = rect.top + rect.height / 2
              
              if (elementCenter < viewportHeight / 2) {
                // Element center is in upper half - leaving from top (scrolling down)
                // Keep visible without animation
                if (widgetRef.value && !widgetAnimating.value[key]) {
                  widgetRef.value.classList.remove(
                    isFlipWidget ? 'widget-initial-flip' : 'widget-initial',
                    'widget-exit', 
                    'widget-exit-flip',
                    'widget-animate',
                    'widget-animate-flip'
                  )
                  widgetRef.value.style.opacity = '1'
                  widgetRef.value.style.transform = isFlipWidget ? 'perspective(1000px) rotateY(0deg)' : 'translateY(0)'
                }
              } else {
                // Element center is in lower half - leaving from bottom (scrolling up)
                // Play exit animation
                if (widgetRef.value && !widgetAnimating.value[key]) {
                  widgetAnimating.value[key] = true
                  widgetRef.value.classList.remove('widget-animate', 'widget-animate-flip')
                  widgetRef.value.classList.add(isFlipWidget ? 'widget-exit-flip' : 'widget-exit')
                  animationTimeouts[key] = setTimeout(() => {
                    widgetAnimating.value[key] = false
                  }, 600)
                }
              }
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px 20px 0px' 
        }
      )
      
      observer.observe(widgetRef.value)
      observers.push(observer)
    }
  })
  
  // Mark first load as complete after animation
  if (isFirstLoad.value) {
    setTimeout(() => {
      isFirstLoad.value = false
    }, 600)
  }
  
  onUnmounted(() => {
    observers.forEach(observer => observer.disconnect())
    Object.values(animationTimeouts).forEach(timeout => clearTimeout(timeout))
  })
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.sidebar-widget {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.sidebar-widget:hover {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
}

.avatar-rotate {
  transition: transform 0.5s ease-in-out;
}

.avatar-rotate:hover {
  transform: rotate(360deg);
}

/* Widget initial state: hidden */
.widget-initial {
  opacity: 0;
  transform: translateY(100%);
}

/* User widget flip animation initial state */
.widget-initial-flip {
  opacity: 0;
  transform: perspective(1000px) rotateY(-90deg);
  transform-origin: center center;
}

@keyframes bulletShoot {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bulletExit {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(100%);
  }
}

@keyframes flipIn {
  0% {
    opacity: 0;
    transform: perspective(1000px) rotateY(-90deg);
  }
  100% {
    opacity: 1;
    transform: perspective(1000px) rotateY(0deg);
  }
}

@keyframes flipExit {
  0% {
    opacity: 1;
    transform: perspective(1000px) rotateY(0deg);
  }
  100% {
    opacity: 0;
    transform: perspective(1000px) rotateY(90deg);
  }
}

.widget-animate {
  animation: bulletShoot 0.6s ease-out forwards !important;
}

.widget-animate-flip {
  animation: flipIn 0.6s ease-out forwards !important;
}

.widget-exit {
  animation: bulletExit 0.6s ease-in forwards !important;
}

.widget-exit-flip {
  animation: flipExit 0.6s ease-in forwards !important;
}

.widget-initial:not(.widget-animate) {
  opacity: 1;
  transform: translateY(0);
  transition: none;
}

.widget-initial-flip:not(.widget-animate-flip) {
  opacity: 1;
  transform: perspective(1000px) rotateY(0deg);
  transition: none;
}
</style>

