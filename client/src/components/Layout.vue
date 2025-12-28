<template>
  <div 
    class="min-h-screen flex flex-col"
    :class="[
      themeStore.isSimpleTheme ? 'starry-background' : 'full-theme-background',
      { 'dark-mode': themeStore.isSimpleDark }
    ]"
    :style="themeStore.isSimpleTheme ? simpleBgStyle : null"
  >
    <!-- Background images with fade transition -->
    <div 
      v-if="themeStore.isFullTheme"
      class="background-container z-0"
    >
      <!-- Dark white background layer at the bottom -->
      <div class="background-base-layer"></div>
      <div
        v-for="(imageUrl, index) in themeStore.backgroundImages"
        :key="`bg-${index}-${imageUrl}`"
        class="background-image"
        :class="{ 'active': index === themeStore.currentBackgroundIndex }"
        :style="{
          backgroundImage: `url('${imageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }"
      ></div>
    </div>
    <div class="content-wrapper flex flex-col min-h-screen">
      <!-- Header -->
      <header v-if="!isFullscreen" class="border-b border-gray-200/20 sticky top-0 z-50 shadow-md" style="background-color: rgba(0, 0, 0, 0.6);">
        <div class="container-custom py-2">
          <div class="flex items-center justify-between">
            <!-- Logo and Title -->
            <div class="flex items-center gap-4">
              <router-link to="/" @click="handleHomeClick" class="flex flex-col">
                <span class="text-xl font-bold text-white">我的发布站</span>
                <span class="text-xs text-gray-300">By 兴趣使然</span>
              </router-link>
              
              <!-- Navigation -->
              <nav class="flex items-center gap-3 flex-wrap">
                <router-link
                  to="/"
                  @click="handleHomeClick"
                  class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200"
                >
                  首页
                </router-link>
                <span class="text-gray-400">|</span>
                <div 
                  class="relative theme-dropdown inline-block"
                  @mouseenter="showThemeMenu = true"
                  @mouseleave="showThemeMenu = false"
                >
                  <a 
                    href="#" 
                    class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200 block"
                    @click.prevent
                  >
                    主题切换
                  </a>
                  <div 
                    v-if="showThemeMenu"
                    class="absolute top-full left-0 pt-2 bg-transparent z-50"
                    @mouseenter="showThemeMenu = true"
                    @mouseleave="showThemeMenu = false"
                  >
                    <div class="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg py-2 min-w-[150px] border border-white/70">
                      <a
                        href="#"
                        @click.prevent="switchTheme('simple')"
                        class="block px-4 py-2.5 text-sm text-black hover:bg-white/50 transition-colors cursor-pointer"
                        :class="{ 'bg-white/50': themeStore.isSimpleTheme }"
                      >
                        {{ themeStore.isSimpleTheme ? '✓ ' : '' }}去特效版
                      </a>
                      <a
                        href="#"
                        @click.prevent="switchTheme('full')"
                        class="block px-4 py-2.5 text-sm text-black hover:bg-white/50 transition-colors cursor-pointer"
                        :class="{ 'bg-white/50': themeStore.isFullTheme }"
                      >
                        {{ themeStore.isFullTheme ? '✓ ' : '' }}全特效版
                      </a>
                    </div>
                  </div>
                </div>
                <span class="text-gray-400">|</span>
                <router-link
                  to="/tools"
                  @click="handleToolsClick"
                  class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200"
                >
                  小工具
                </router-link>
                <template v-if="authStore.user">
                  <span class="text-gray-400">|</span>
                  <router-link
                    to="/favorites"
                    @click="handleFavoritesClick"
                    class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200"
                  >
                    收藏夹
                  </router-link>
                </template>
                <span class="text-gray-400">|</span>
                <router-link
                  to="/qna"
                  @click="handleQnAClick"
                  class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200"
                >
                  问答专区
                </router-link>
                <span class="text-gray-400">|</span>
                <router-link
                  to="/guestbook"
                  @click="handleGuestbookClick"
                  class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200"
                >
                  留言板
                </router-link>
              </nav>
            </div>
            <div class="flex items-center gap-3">
              <button
                v-if="themeStore.isSimpleTheme"
                class="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-white/20 border border-white/40 text-white"
                @click="toggleSimpleBg"
                title="切换背景色"
              >
                <svg v-if="themeStore.isSimpleDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1" :class="isFullscreen ? '' : 'py-6'">
        <template v-if="isFullscreen">
          <slot />
        </template>
        <template v-else>
          <div class="container-custom">
            <div class="flex gap-6">
              <div 
                :class="hideSidebar ? 'w-full' : 'flex-1 min-w-0'"
                :style="hideSidebar ? {} : { flex: '0 0 68%' }"
              >
                <slot />
              </div>
              <div 
                v-if="!hideSidebar"
                class="flex-shrink-0" 
                style="flex: 0 0 30%; max-width: 30%; overflow: visible; position: relative; z-index: 40;"
              >
                <Sidebar />
              </div>
            </div>
          </div>
        </template>
      </main>

      <!-- Footer -->
      <footer v-if="!isFullscreen" class="bg-transparent mt-auto">
        <div class="container-custom py-6">
          <div class="text-center text-white text-sm">
            <p>© 2025 我的发布站. 使用 Vue + Express + SQLite 构建</p>
          </div>
        </div>
      </footer>

      <!-- Back to Top Button -->
      <button
        v-if="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 z-50 w-12 h-12 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
        title="返回顶部"
        :style="{ 
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          opacity: showBackToTop ? 1 : 0, 
          pointerEvents: showBackToTop ? 'auto' : 'none' 
        }"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const route = useRoute()
const showThemeMenu = ref(false)
const showBackToTop = ref(false)
const simpleBgStyle = computed(() => {
  return themeStore.isSimpleDark
    ? { background: 'linear-gradient(135deg, #0f172a 0%, #1f2937 50%, #334155 100%)' }
    : { background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)' }
})

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// Check if sidebar should be hidden based on route meta
const hideSidebar = computed(() => route.meta.hideSidebar === true)
const isFullscreen = computed(() => route.meta.fullscreen === true)

const handleHomeClick = (event) => {
  // 无论当前在哪个页面，点击首页都触发重定向并重新加载
  event.preventDefault()
  // 使用 window.location.href 跳转到首页并重新加载页面
  window.location.href = '/'
}

const handleFavoritesClick = (event) => {
  // 无论当前在哪个页面，点击收藏夹都触发重定向并重新加载
  event.preventDefault()
  // 使用 window.location.href 跳转到收藏夹并重新加载页面
  window.location.href = '/favorites'
}

const handleQnAClick = (event) => {
  // 无论当前在哪个页面，点击问答专区都触发重定向并重新加载
  event.preventDefault()
  window.location.href = '/qna'
}

const handleGuestbookClick = (event) => {
  // 无论当前在哪个页面，点击留言板都触发重定向并重新加载
  event.preventDefault()
  window.location.href = '/guestbook'
}

const handleToolsClick = (event) => {
  // 无论当前在哪个页面，点击小工具都触发重定向并重新加载
  event.preventDefault()
  window.location.href = '/tools'
}

const switchTheme = (theme) => {
  themeStore.setTheme(theme)
  showThemeMenu.value = false
  // 如果切换到全特效版，加载背景图片
  if (theme === 'full' && themeStore.backgroundImages.length === 0) {
    themeStore.loadBackgroundImages()
  }
  // 切换主题后重新加载页面以确保所有组件应用新主题
  window.location.reload()
}

const toggleSimpleBg = () => {
  themeStore.setSimpleBgMode(themeStore.isSimpleDark ? 'light' : 'dark')
}

// 初始化时，如果是全特效版，确保加载背景图片
onMounted(async () => {
  if (themeStore.isFullTheme) {
    if (themeStore.backgroundImages.length === 0) {
      // 没有图片时，loadBackgroundImages 会持续重试直到成功，成功后会自动启动轮换
      await themeStore.loadBackgroundImages()
    } else {
      // 如果已经有图片，直接启动轮换
      themeStore.startRotation()
    }
  }
  
  // Add scroll listener for back to top button
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Initial check
})

// 监听主题变化，启动/停止轮换
watch(() => themeStore.isFullTheme, (isFull) => {
  if (isFull) {
    // 如果是全特效版，先尝试加载图片
    if (themeStore.backgroundImages.length === 0) {
      // loadBackgroundImages 会持续重试直到成功，成功后会自动启动轮换
      themeStore.loadBackgroundImages()
    } else {
      // 如果已经有图片，直接启动轮换
      themeStore.startRotation()
    }
  } else {
    themeStore.stopRotation()
  }
})

// 清理定时器和事件监听
onUnmounted(() => {
  themeStore.stopRotation()
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.theme-dropdown {
  display: inline-block;
}

.full-theme-background {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.full-theme-background .content-wrapper {
  position: relative;
  z-index: 1;
}

.background-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.background-base-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(150, 150, 150);
  z-index: 0;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: scale(1);
  background-repeat: no-repeat;
  transition: opacity 2s ease-in-out, transform 0.3s ease-in-out;
  z-index: 1;
}

.background-image.active {
  opacity: 1;
  animation: zoom 5s ease-in-out forwards;
}

.background-image:not(.active) {
  opacity: 0 !important;
  transform: scale(1.1);
}

@keyframes zoom {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

</style>
