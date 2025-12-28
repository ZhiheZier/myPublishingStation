<template>
  <!-- Image Viewer Modal -->
  <div
    v-if="visible"
    class="image-viewer-overlay"
    @click.self="close"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <!-- Control Bar -->
    <div
      class="image-viewer-controls"
      @mousedown.stop
    >
      <button @click="previousImage" class="control-btn" title="上一张">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button @click="playPause" class="control-btn" :title="isPlaying ? '暂停' : '播放'">
        <svg v-if="!isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      </button>
      <button @click="nextImage" class="control-btn" title="下一张">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button @click="toggleDrag" class="control-btn" :class="{ 'active': isDragging }" title="拖动">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </button>
      <button @click="toggleFullscreen" class="control-btn" :disabled="!canFullscreen" title="全屏">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
      <button @click="close" class="control-btn" title="关闭">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Image Container (draggable) -->
    <div
      class="image-viewer-container"
      :style="containerStyle"
      @mousedown.stop="handleContainerMouseDown"
    >
      <img
        :src="currentImageSrc"
        :alt="`Image ${currentIndex + 1}`"
        class="image-viewer-img"
        @load="handleImageLoad"
        @error="handleImageError"
      />
    </div>

    <!-- Image Counter -->
    <div class="image-viewer-counter">
      共{{ images.length }}张图,当前是第{{ currentIndex + 1 }}张
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  initialIndex: {
    type: Number,
    default: 0
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'update:visible'])

const currentIndex = ref(props.initialIndex)
const isPlaying = ref(false)
const isDragging = ref(false)
const canFullscreen = ref(false)
const playInterval = ref(null)
const containerPosition = ref({ x: 0, y: 0 })
const isDraggingContainer = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const imageLoaded = ref(false)

const currentImageSrc = computed(() => {
  if (props.images && props.images.length > 0 && props.images[currentIndex.value]) {
    return props.images[currentIndex.value]
  }
  return ''
})

const containerStyle = computed(() => {
  if (isDragging.value) {
    return {
      transform: `translate(${containerPosition.value.x}px, ${containerPosition.value.y}px)`,
      cursor: 'move'
    }
  }
  return {
    transform: `translate(${containerPosition.value.x}px, ${containerPosition.value.y}px)`,
    cursor: 'default'
  }
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    currentIndex.value = props.initialIndex
    containerPosition.value = { x: 0, y: 0 }
    imageLoaded.value = false
    stopSlideshow()
  }
})

watch(() => props.initialIndex, (newVal) => {
  if (props.visible) {
    currentIndex.value = newVal
    containerPosition.value = { x: 0, y: 0 }
    imageLoaded.value = false
  }
})

const previousImage = () => {
  if (props.images.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
  containerPosition.value = { x: 0, y: 0 }
  imageLoaded.value = false
}

const nextImage = () => {
  if (props.images.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % props.images.length
  containerPosition.value = { x: 0, y: 0 }
  imageLoaded.value = false
}

const playPause = () => {
  if (isPlaying.value) {
    stopSlideshow()
  } else {
    startSlideshow()
  }
}

const startSlideshow = () => {
  isPlaying.value = true
  playInterval.value = setInterval(() => {
    nextImage()
  }, 3000) // 3 seconds per image
}

const stopSlideshow = () => {
  isPlaying.value = false
  if (playInterval.value) {
    clearInterval(playInterval.value)
    playInterval.value = null
  }
}

const toggleDrag = () => {
  isDragging.value = !isDragging.value
  if (!isDragging.value) {
    containerPosition.value = { x: 0, y: 0 }
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      canFullscreen.value = true
    }).catch(() => {
      canFullscreen.value = false
    })
  } else {
    document.exitFullscreen().then(() => {
      canFullscreen.value = false
    })
  }
}

const close = () => {
  stopSlideshow()
  emit('close')
  emit('update:visible', false)
}

const handleMouseDown = (e) => {
  if (isDragging.value && e.target.classList.contains('image-viewer-overlay')) {
    isDraggingContainer.value = true
    dragStart.value = {
      x: e.clientX - containerPosition.value.x,
      y: e.clientY - containerPosition.value.y
    }
  }
}

const handleContainerMouseDown = (e) => {
  if (isDragging.value) {
    isDraggingContainer.value = true
    dragStart.value = {
      x: e.clientX - containerPosition.value.x,
      y: e.clientY - containerPosition.value.y
    }
  }
}

const handleMouseMove = (e) => {
  if (isDraggingContainer.value && isDragging.value) {
    containerPosition.value = {
      x: e.clientX - dragStart.value.x,
      y: e.clientY - dragStart.value.y
    }
  }
}

const handleMouseUp = () => {
  isDraggingContainer.value = false
}

const handleImageLoad = () => {
  imageLoaded.value = true
}

const handleImageError = () => {
  imageLoaded.value = false
}

// Keyboard navigation
const handleKeydown = (e) => {
  if (!props.visible) return
  
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      previousImage()
      break
    case 'ArrowRight':
      e.preventDefault()
      nextImage()
      break
    case 'Escape':
      e.preventDefault()
      close()
      break
    case ' ':
      e.preventDefault()
      playPause()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // Check fullscreen support
  canFullscreen.value = !!document.fullscreenEnabled
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopSlideshow()
})
</script>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 999999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.image-viewer-controls {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background-color: rgba(60, 60, 60, 0.9);
  padding: 8px 12px;
  border-radius: 8px;
  z-index: 1000000;
}

.control-btn {
  background: transparent;
  border: none;
  color: #d0d0d0;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-btn.active {
  background-color: rgba(79, 195, 247, 0.3);
  color: #4fc3f7;
}

.image-viewer-container {
  position: relative;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease-out;
}

.image-viewer-img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.image-viewer-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #d0d0d0;
  background-color: rgba(60, 60, 60, 0.9);
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 1000000;
}
</style>

