<template>
  <div 
    class="min-h-screen flex flex-col"
    :class="themeStore.isSimpleTheme ? 'starry-background' : 'full-theme-background'"
  >
    <!-- Background images with fade transition -->
    <div 
      v-if="themeStore.isFullTheme"
      class="fixed inset-0 z-0 background-container"
    >
      <!-- Dark white background layer at the bottom -->
      <div class="background-base-layer"></div>
      <div
        v-for="(imageUrl, index) in themeStore.backgroundImages"
        :key="index"
        class="background-image"
        :class="{ 'active': index === themeStore.currentBackgroundIndex }"
        :style="{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }"
      ></div>
    </div>
    <div class="content-wrapper flex flex-col min-h-screen">
      <!-- Header -->
      <header class="border-b border-gray-200/20 sticky top-0 z-50 shadow-md" style="background-color: rgba(0, 0, 0, 0.6);">
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
                  class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200"
                >
                  小工具
                </router-link>
                <span class="text-gray-400">|</span>
                <a href="#" class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200">
                  收藏夹
                </a>
                <span class="text-gray-400">|</span>
                <a href="#" class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200">
                  问答专区
                </a>
                <span class="text-gray-400">|</span>
                <a href="#" class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200">
                  留言板
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content - Two Column Layout or Single Column -->
      <main class="flex-1 py-6">
        <div class="container-custom">
          <div class="flex gap-6">
            <!-- Main Content Area -->
            <div 
              :class="hideSidebar ? 'w-full' : 'flex-1 min-w-0'"
              :style="hideSidebar ? {} : { flex: '0 0 68%' }"
            >
              <slot />
            </div>

            <!-- Sidebar -->
            <div 
              v-if="!hideSidebar"
              class="flex-shrink-0" 
              style="flex: 0 0 30%; max-width: 30%; overflow: visible; position: relative; z-index: 40;"
            >
              <Sidebar />
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-transparent mt-auto">
        <div class="container-custom py-6">
          <div class="text-center text-white text-sm">
            <p>© 2025 我的发布站. 使用 Vue + Express + SQLite 构建</p>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const route = useRoute()
const showThemeMenu = ref(false)

// Check if sidebar should be hidden based on route meta
const hideSidebar = computed(() => route.meta.hideSidebar === true)

const handleHomeClick = (event) => {
  // 无论当前在哪个页面，点击首页都触发重定向并重新加载
  event.preventDefault()
  // 使用 window.location.href 跳转到首页并重新加载页面
  window.location.href = '/'
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

// 清理定时器
onUnmounted(() => {
  themeStore.stopRotation()
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
  width: 100%;
  height: 100%;
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
  animation: zoom 10s ease-in-out forwards;
}

.background-image:not(.active) {
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

.background-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  z-index: 0;
  pointer-events: none;
}
</style>
