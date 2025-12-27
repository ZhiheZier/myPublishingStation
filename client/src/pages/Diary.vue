<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <div class="grid grid-cols-3 items-center mb-4">
      <div class="text-left">
        <button class="back-btn" @click="router.back()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          返回上一页
        </button>
      </div>
      <div class="text-center">
        <h2 class="title">学习日记</h2>
      </div>
      <div></div>
    </div>
    <div v-if="entries.length === 0" class="empty">
      还没有日记内容。请在番茄钟页面填写日记。
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="item in entries" :key="item.date" class="note-card">
        <div class="note-head">{{ item.date }}</div>
        <div class="note-body">{{ item.text }}</div>
      </div>
    </div>
  </div>
  </template>
<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const router = useRouter()

const storeKey = computed(() => (user.value ? `blog_pomodoro_u${user.value.id}_diary` : 'blog_pomodoro_guest_diary'))
const entries = computed(() => {
  try {
    const all = JSON.parse(localStorage.getItem(storeKey.value) || '{}')
    return Object.keys(all)
      .sort((a, b) => (a < b ? 1 : -1))
      .map(d => ({ date: d, text: all[d] }))
      .filter(e => e.text && e.text.trim())
  } catch { return [] }
})
</script>
<style scoped>
.title { font-weight: 700; color: #111827; }
.empty { background: rgba(255,255,255,0.3); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.6); border-radius: 12px; padding: 16px; box-shadow: 0 10px 24px rgba(0,0,0,0.14); color: #374151; }
.note-card { background: rgba(255,255,255,0.3); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.6); border-radius: 12px; padding: 16px; box-shadow: 0 10px 24px rgba(0,0,0,0.14); display: flex; flex-direction: column; gap: 8px; }
.note-head { font-weight: 700; color: #111827; }
.note-body { white-space: pre-wrap; color: #111827; line-height: 1.7; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 9999px; background: rgba(255,255,255,0.2); color: #111827; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.12); transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease; }
.back-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.18); opacity: 0.95; }
.back-btn:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(0,0,0,0.14); }
/* Dark mode text color support restored */
.title { color: #fff; }
.empty { color: #fff; }
.note-head { color: #fff; }
.note-body { color: #fff; }
.back-btn { color: #fff; border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.16); }

@media (prefers-color-scheme: dark) {
  .title { color: #fff; }
  .empty { color: #fff; }
  .note-head { color: #fff; }
  .note-body { color: #fff; }
  .back-btn { color: #fff; border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.16); }
}
:global(.dark-mode) .title { color: #fff; }
:global(.dark-mode) .empty { color: #fff; }
:global(.dark-mode) .note-head { color: #fff; }
:global(.dark-mode) .note-body { color: #fff; }
:global(.dark-mode) .back-btn { color: #fff; border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.16); }
</style>
