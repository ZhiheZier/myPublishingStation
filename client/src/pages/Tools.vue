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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Tool Card - Placeholder for 9 tools (3 rows x 3 columns) -->
      <div
        v-for="tool in displayedTools"
        :key="tool.id"
        class="bg-white/60 backdrop-blur-sm rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
        @click="tool.onClick && tool.onClick()"
      >
        <!-- Tool Icon/Image Area -->
        <div class="h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <svg
            v-if="!tool.icon"
            class="w-16 h-16 text-white opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <component
            v-else
            :is="tool.icon"
            class="w-16 h-16 text-white opacity-80"
          />
        </div>
        
        <!-- Tool Content -->
        <div class="p-4">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            {{ tool.name }}
          </h3>
          <p class="text-gray-600 text-sm">
            {{ tool.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')

// Placeholder tools data (9 tools for 3 rows x 3 columns)
const tools = ref([
  {
    id: 1,
    name: '工具 1',
    description: '工具描述...',
    icon: null,
    onClick: null
  },
  {
    id: 2,
    name: '工具 2',
    description: '工具描述...',
    icon: null,
    onClick: null
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
/* Additional custom styles if needed */
</style>
