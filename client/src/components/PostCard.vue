<template>
  <article class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 mb-6 overflow-hidden">
    <!-- Cover Image and Content -->
    <div class="flex flex-col md:flex-row">
      <!-- Cover Image -->
      <router-link
        v-if="post.cover_image"
        :to="`/post/${post.id}`"
        class="md:w-64 md:flex-shrink-0"
      >
        <img
          :src="post.cover_image"
          :alt="post.title"
          class="w-full h-48 md:h-full object-cover"
        />
      </router-link>
      <router-link
        v-else
        :to="`/post/${post.id}`"
        class="md:w-64 md:flex-shrink-0 bg-gray-200 flex items-center justify-center"
      >
        <svg
          class="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </router-link>

      <!-- Content -->
      <div class="flex-1 p-6">
        <!-- Title -->
        <h2 class="text-2xl font-bold text-gray-900 mb-3">
          <router-link
            :to="`/post/${post.id}`"
            class="hover:text-primary-600 transition-colors duration-200"
          >
            {{ post.title }}
          </router-link>
        </h2>

        <!-- Meta Info: Date and Category -->
        <div class="flex items-center gap-4 mb-3 text-sm text-gray-500">
          <span class="flex items-center gap-1">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ formatDate(post.created_at) }}
          </span>
          <span v-if="post.category" class="text-gray-300">|</span>
          <router-link
            v-if="post.category"
            :to="`/category/${encodeURIComponent(post.category)}`"
            class="hover:text-primary-600 transition-colors"
          >
            {{ post.category }}
          </router-link>
        </div>

        <!-- Excerpt -->
        <p v-if="post.excerpt" class="text-gray-600 mb-4 line-clamp-3">
          {{ post.excerpt }}
        </p>

        <!-- Read More Link -->
        <router-link
          :to="`/post/${post.id}`"
          class="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          阅读更多
          <svg
            class="ml-1 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </router-link>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  }
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
</script>
