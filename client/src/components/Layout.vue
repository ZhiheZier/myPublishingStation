<template>
  <div class="min-h-screen flex flex-col starry-background">
    <div class="content-wrapper flex flex-col min-h-screen">
      <!-- Header -->
      <header class="bg-black/30 border-b border-gray-200/20 sticky top-0 z-50 shadow-md">
        <div class="container-custom py-2">
          <div class="flex items-center justify-between">
            <!-- Logo and Title -->
            <div class="flex items-center gap-4">
              <router-link to="/" class="flex flex-col">
                <span class="text-xl font-bold text-white">我的发布站</span>
                <span class="text-xs text-gray-300">By 兴趣使然</span>
              </router-link>
              
              <!-- Navigation -->
              <nav class="flex items-center gap-3 flex-wrap">
                <router-link
                  to="/"
                  class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200"
                >
                  首页
                </router-link>
                <span class="text-gray-400">|</span>
                <a href="#" class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200">
                  主题切换
                </a>
                <span class="text-gray-400">|</span>
                <a href="#" class="px-3 py-1 text-sm text-white hover:text-red-500 transition-colors duration-200">
                  小工具
                </a>
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

      <!-- Main Content - Two Column Layout -->
      <main class="flex-1 py-6">
        <div class="container-custom">
          <div class="flex gap-6">
            <!-- Main Content Area -->
            <div class="flex-1 min-w-0" style="flex: 0 0 68%;">
              <slot />
            </div>

            <!-- Sidebar -->
            <div class="flex-shrink-0" style="flex: 0 0 30%; max-width: 30%; overflow: visible; position: relative; z-index: 40;">
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
import Sidebar from './Sidebar.vue'
</script>
