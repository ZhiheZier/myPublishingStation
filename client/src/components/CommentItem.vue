<template>
  <div class="comment-item" :class="isReply ? 'mb-2' : 'mb-4'">
    <!-- Comment/Reply Content -->
    <div :class="[
      isReply ? 'bg-white/60' : 'bg-white/80',
      'rounded-lg border border-gray-200 overflow-hidden',
      isReply ? 'hover:bg-white/80' : 'hover:bg-white/95',
      'transition-colors'
    ]">
      <!-- Comment Header -->
      <div :class="['flex items-start gap-3', isReply ? 'p-3' : 'p-4', isReply ? '' : 'border-b border-gray-200']">
        <!-- Avatar -->
        <div :class="[
          'bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0',
          isReply ? 'w-10 h-10' : 'w-12 h-12'
        ]">
          <svg
            :class="['text-gray-500', isReply ? 'w-6 h-6' : 'w-8 h-8']"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        
        <!-- User Info and Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span :class="['font-medium text-gray-900', isReply ? 'text-sm' : '']">{{ props.comment.username }}</span>
              <span v-if="props.comment.reply_to_username" class="text-xs text-gray-500">回复 {{ props.comment.reply_to_username }}</span>
              <span :class="['text-gray-600', isReply ? 'text-sm' : '']">说道:</span>
            </div>
            <div class="flex items-center gap-3">
              <span :class="['text-gray-500 whitespace-nowrap', isReply ? 'text-xs' : 'text-sm']">{{ formatDateTime(props.comment.created_at) }}</span>
              <div v-if="authStore.user" class="flex items-center gap-2">
                <button
                  @click="handleReply"
                  :class="['text-blue-500 hover:text-blue-700', isReply ? 'text-xs' : 'text-sm']"
                >
                  回复
                </button>
                <button
                  v-if="authStore.user.id === props.comment.user_id || authStore.user.role === 'admin'"
                  @click="handleDelete"
                  :class="['text-red-500 hover:text-red-700', isReply ? 'text-xs' : 'text-sm']"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
          
          <!-- Comment Content -->
          <div :class="[
            'text-gray-800 whitespace-pre-wrap break-words overflow-wrap-anywhere',
            isReply ? 'text-sm' : ''
          ]" style="word-wrap: break-word; word-break: break-word; overflow-wrap: anywhere;">
            {{ props.comment.content }}
          </div>
        </div>
      </div>
      
      <!-- Nested Replies (inside the comment container) -->
      <div v-if="props.comment.replies && props.comment.replies.length > 0" class="bg-gray-50/30 border-t border-gray-200/50 pl-4 pr-0 pt-3 pb-3">
        <CommentItem
          v-for="reply in props.comment.replies"
          :key="reply.id"
          :comment="reply"
          :is-reply="true"
          @reply="handleReplyEvent"
          @delete="handleDeleteEvent"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import CommentItem from './CommentItem.vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  isReply: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['reply', 'delete'])

const authStore = useAuthStore()

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  return `${dateStr} ${timeStr}`
}

const handleReply = () => {
  emit('reply', props.comment.id, props.comment.username)
}

const handleDelete = () => {
  emit('delete', props.comment.id)
}

const handleReplyEvent = (commentId, username) => {
  emit('reply', commentId, username)
}

const handleDeleteEvent = (commentId) => {
  emit('delete', commentId)
}
</script>

