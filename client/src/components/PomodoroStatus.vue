<template>
  <div class="bg-white/30 rounded shadow-lg p-4 hover:bg-white/50 transition-all duration-300 overflow-hidden sidebar-widget">
    <h3 class="text-sm font-semibold text-white rounded-t px-3 py-1.5 mb-3 -mx-4 -mt-4 flex items-center gap-2" style="background-color: rgba(0, 0, 0, 0.6);">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      番茄钟今日概览
    </h3>
    <div class="space-y-2 text-sm">
      <p class="text-gray-900" v-if="checkedToday">今日已打卡！再接再厉！</p>
      <p class="text-gray-700" v-else>今日尚未打卡，去试试专注一轮吧。</p>
      <p class="text-gray-900">今日专注：<strong>{{ focusMinutesToday }}</strong> 分钟</p>
      <div class="mt-3">
        <router-link to="/tools/pomodoro" class="open-btn">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          打开番茄钟
        </router-link>
      </div>
    </div>
  </div>
  </template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const getToday = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const today = getToday()
const version = ref(0)
const bump = () => { version.value++ }
onMounted(() => {
  window.addEventListener('pomodoro-updated', bump)
  window.addEventListener('storage', bump)
})
onUnmounted(() => {
  window.removeEventListener('pomodoro-updated', bump)
  window.removeEventListener('storage', bump)
})
const storeKey = computed(() => {
  const u = user.value
  return u ? `blog_pomodoro_u${u.id}` : 'blog_pomodoro_guest'
})
const checkedToday = computed(() => {
  try {
    void version.value
    const saved = JSON.parse(localStorage.getItem(storeKey.value) || '{}')
    return Array.isArray(saved.checkins) ? saved.checkins.includes(today) : false
  } catch { return false }
})
const focusMinutesToday = computed(() => {
  try {
    void version.value
    const stats = JSON.parse(localStorage.getItem(`${storeKey.value}_stats`) || '{}')
    const sec = stats[today]?.focusSeconds || 0
    return Math.floor(sec / 60)
  } catch { return 0 }
})
</script>
<style scoped>
.sidebar-widget { box-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
.sidebar-widget:hover { box-shadow: 0 0 15px rgba(0, 0, 0, 0.4); }
.open-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35);
  transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
}
.open-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(22, 163, 74, 0.45); opacity: 0.95; }
.open-btn:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4); }
</style>
