<template>
  <div class="bg-white/30 rounded shadow-lg p-4 hover:bg-white/50 transition-all duration-300 overflow-hidden sidebar-widget">
    <h3 class="text-sm font-semibold text-white rounded-t px-3 py-1.5 mb-3 -mx-4 -mt-4 flex items-center gap-2" style="background-color: rgba(0, 0, 0, 0.6);">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="isLogin" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      {{ isLogin ? '请登录' : '注册' }}
    </h3>


    <div class="space-y-4">
      <!-- Username (for register only) -->
      <div v-if="!isLogin" class="relative">
        <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <input
          type="text"
          v-model="username"
          placeholder="用户名"
          class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-900"
        />
      </div>

      <!-- Email -->
      <div class="relative">
        <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <input
          type="text"
          v-model="email"
          :placeholder="isLogin ? '邮箱或用户名' : '邮箱'"
          class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-900"
        />
      </div>

      <!-- Password (for login and register) -->
      <div class="relative">
        <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <input
          type="password"
          v-model="password"
          placeholder="密码"
          class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-900"
        />
      </div>

      <!-- Remember me and Forgot password link (only for login) -->
      <div v-if="isLogin" class="flex items-center justify-between text-sm">
        <label class="flex items-center text-black">
          <input
            type="checkbox"
            v-model="rememberMe"
            class="mr-2"
          />
          记住我
        </label>
        <button
          type="button"
          @click="goToForgotPassword"
          class="text-primary-600 hover:text-primary-700 text-black"
        >
          忘记密码？
        </button>
      </div>

      <!-- Login/Register buttons row (same style as title) -->
      <div class="text-sm font-semibold text-white rounded px-3 py-1.5 flex items-center justify-center gap-2" style="background-color: rgba(0, 0, 0, 0.6);">
        <button
          type="button"
          @click="goToRegisterPage"
          class="text-white hover:text-red-500 transition-colors duration-200 flex-1 text-center py-1"
          :class="{ 'text-red-500': !isLogin }"
        >
          注册
        </button>
        <span class="text-white/50">|</span>
        <button
          type="button"
          @click="goToLoginPage"
          class="text-white hover:text-red-500 transition-colors duration-200 flex-1 text-center py-1"
          :class="{ 'text-red-500': isLogin }"
        >
          登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLogin = ref(true)
const email = ref('')
const username = ref('')
const password = ref('')
const rememberMe = ref(false)

const goToLoginPage = () => {
  // 保存表单数据到sessionStorage
  const formData = {
    email: email.value,
    password: password.value,
    rememberMe: rememberMe.value
  }
  sessionStorage.setItem('loginFormData', JSON.stringify(formData))
  // 保存当前路径，用于登录后返回
  sessionStorage.setItem('redirectAfterLogin', router.currentRoute.value.fullPath)
  // 跳转到登录页面
  router.push('/login')
}

const goToRegisterPage = () => {
  // 保存表单数据到sessionStorage
  const formData = {
    username: username.value,
    email: email.value,
    password: password.value
  }
  sessionStorage.setItem('registerFormData', JSON.stringify(formData))
  // 保存当前路径，用于注册后返回
  sessionStorage.setItem('redirectAfterRegister', router.currentRoute.value.fullPath)
  // 跳转到注册页面
  router.push('/register')
}

const goToForgotPassword = () => {
  // 直接跳转到登录页面，并设置忘记密码状态
  sessionStorage.setItem('showForgotPassword', 'true')
  router.push('/login')
}
</script>

<style scoped>
.sidebar-widget {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.sidebar-widget:hover {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
}
</style>
