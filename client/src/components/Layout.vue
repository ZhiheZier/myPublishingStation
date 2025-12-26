<template>
  <div class="min-h-screen flex flex-col starry-background">
    <div class="content-wrapper flex flex-col min-h-screen">
      <!-- Header -->
      <header class="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-md">
        <div class="container-custom py-2">
          <div class="flex items-center justify-between">
            <!-- Logo and Title -->
            <div class="flex items-center gap-4">
              <router-link to="/" class="flex flex-col">
                <span class="text-xl font-bold text-gray-900">我的发布站</span>
                <span class="text-xs text-gray-500">By 兴趣使然</span>
              </router-link>
              
              <!-- Navigation -->
              <nav class="flex items-center gap-3 flex-wrap">
                <router-link
                  to="/"
                  class="px-3 py-1 text-sm text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  首页
                </router-link>
                <span class="text-gray-300">|</span>
                <a href="#" class="px-3 py-1 text-sm text-gray-700 hover:text-primary-600 transition-colors duration-200">
                  主题切换
                </a>
                <span class="text-gray-300">|</span>
                <a href="#" class="px-3 py-1 text-sm text-gray-700 hover:text-primary-600 transition-colors duration-200">
                  小工具
                </a>
                <span class="text-gray-300">|</span>
                <a href="#" class="px-3 py-1 text-sm text-gray-700 hover:text-primary-600 transition-colors duration-200">
                  收藏夹
                </a>
                <span class="text-gray-300">|</span>
                <a href="#" class="px-3 py-1 text-sm text-gray-700 hover:text-primary-600 transition-colors duration-200">
                  问答专区
                </a>
                <span class="text-gray-300">|</span>
                <a href="#" class="px-3 py-1 text-sm text-gray-700 hover:text-primary-600 transition-colors duration-200">
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
            <div class="flex-1 min-w-0">
              <slot />
            </div>

            <!-- Sidebar -->
            <div class="w-80 flex-shrink-0">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-white/95 backdrop-blur-sm border-t border-gray-200 mt-auto">
        <div class="container-custom py-6">
          <div class="text-center text-gray-500 text-sm">
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
