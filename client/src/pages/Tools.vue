<template>
  <div class="max-w-6xl mx-auto px-4">
    <!-- Search Box -->
    <div class="mb-8">
      <div class="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索小工具..."
            class="w-full px-4 py-3 pl-10 pr-4 text-gray-800 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <svg
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
        </div>
      </div>
    </div>

    <!-- Tools Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div
        v-for="tool in displayedTools"
        :key="tool.id"
        class="tile-wrap"
        @click="tool.onClick && tool.onClick()"
      >
        <div class="tile" :style="{ '--tile-ratio': tileRatio }">
          <div class="tile-inner">
            <component
              v-if="tool.icon"
              :is="tool.icon"
              class="w-12 h-12 text-white opacity-90"
            />
            <div v-else class="circle">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12M6 12h12"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="tool-caption">{{ tool.name }}</div>
        <div class="tool-desc">{{ tool.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PomodoroIcon from '../components/icons/PomodoroIcon.vue'

const searchQuery = ref('')
const router = useRouter()
const tileRatio = ref('1 / 1')

const tools = ref([
  {
    id: 1,
    name: '番茄钟',
    description: '专注计时器，工作/休息循环',
    icon: PomodoroIcon,
    onClick: () => router.push({ name: 'Pomodoro' })
  },
  {
    id: 2,
    name: '作品集',
    description: '管理画集与画作，支持标签与上传',
    icon: null,
    onClick: () => router.push({ name: 'Portfolio' })
  },
  {
    id: 10,
    name: '学习日记',
    description: '查看历史学习日记（来自番茄钟）',
    icon: null,
    onClick: () => router.push({ name: 'Diary' })
  },
  {
    id: 3,
    name: '工具 3',
    description: '工具描述...',
    icon: null,
    onClick: null
  },
  {
    id: 4,
    name: '工具 4',
    description: '工具描述...',
    icon: null,
    onClick: null
  },
  {
    id: 5,
    name: '工具 5',
    description: '工具描述...',
    icon: null,
    onClick: null
  },
  {
    id: 6,
    name: '工具 6',
    description: '工具描述...',
    icon: null,
    onClick: null
  },
  {
    id: 7,
    name: '工具 7',
    description: '工具描述...',
    icon: null,
    onClick: null
  },
  {
    id: 8,
    name: '工具 8',
    description: '工具描述...',
    icon: null,
    onClick: null
  },
  {
    id: 9,
    name: '工具 9',
    description: '工具描述...',
    icon: null,
    onClick: null
  }
])

// Filter tools based on search query
const displayedTools = computed(() => {
  if (!searchQuery.value.trim()) {
    return tools.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return tools.value.filter(tool =>
    tool.name.toLowerCase().includes(query) ||
    tool.description.toLowerCase().includes(query)
  )
})
</script>

<style scoped>
.diary-card { background: rgba(255,255,255,0.3); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.6); border-radius: 12px; padding: 16px; box-shadow: 0 10px 24px rgba(0,0,0,0.14); }
.diary-title { font-weight: 700; color: #111827; margin-bottom: 8px; }
.diary-note { white-space: pre-wrap; color: #111827; line-height: 1.6; }
.diary-empty { color: #374151; opacity: 0.9; }
@media (prefers-color-scheme: dark) {
  .diary-title { color: #fff; }
  .diary-note { color: #fff; }
  .diary-empty { color: #fff; opacity: 0.85; }
}
.open-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 9999px; background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35); transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease; }
.open-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(22, 163, 74, 0.45); opacity: 0.95; }
.open-btn:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4); }
.tile { aspect-ratio: var(--tile-ratio, 1 / 1); border: 2px dashed rgba(255,255,255,0.5); border-radius: 16px; cursor: pointer; position: relative; background: rgba(255,255,255,0.12); backdrop-filter: blur(10px) saturate(120%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 10px 30px rgba(0,0,0,0.12); perspective: 800px; transform-style: preserve-3d; transition: box-shadow .25s ease, background .25s ease, border-color .25s ease; }
.tile:hover { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.18); box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 16px 36px rgba(0,0,0,0.16); }
.tile-inner { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transition: transform .25s ease, box-shadow .25s ease; transform: translateZ(0); }
.tile:hover .tile-inner { transform: translateZ(14px) rotateX(1.6deg) rotateY(1.6deg); box-shadow: 0 12px 24px rgba(0,0,0,0.18); }
.tile-wrap { display: flex; flex-direction: column; gap: 6px; }
.circle { width: 56px; height: 56px; border-radius: 9999px; background: linear-gradient(135deg, rgba(0,0,0,0.65), rgba(0,0,0,0.45)); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25); }
.tool-caption { text-align: center; font-weight: 700; color: #111827; text-shadow: 0 1px 2px rgba(255,255,255,0.6); }
.tool-desc { text-align: center; font-size: 12px; color: #374151; opacity: 0.9; }
/* Dark mode text color support restored */
.tool-caption { text-align: center; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.35); }
.tool-desc { text-align: center; font-size: 12px; color: #fff; opacity: 0.9; }

@media (prefers-color-scheme: dark) {
  .tool-caption { color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.35); }
  .tool-desc { color: #fff; opacity: 0.9; }
}
:global(.dark-mode) .tool-caption { color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.35); }
:global(.dark-mode) .tool-desc { color: #fff; opacity: 0.9; }
</style>
