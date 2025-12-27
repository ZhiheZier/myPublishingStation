import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBackgroundImages } from '../api'

export const useThemeStore = defineStore('theme', () => {
  // 'simple' 去特效版, 'full' 全特效版
  const theme = ref(localStorage.getItem('theme') || 'simple')
  const simpleBgMode = ref(localStorage.getItem('simpleBgMode') || 'light')
  
  // 背景图片列表（全特效版使用）
  const backgroundImages = ref([])
  const currentBackgroundIndex = ref(0)
  let rotationTimer = null
  const isLoadingNextBatch = ref(false)

  const isSimpleTheme = computed(() => theme.value === 'simple')
  const isFullTheme = computed(() => theme.value === 'full')
  const isSimpleDark = computed(() => simpleBgMode.value === 'dark')

  const setTheme = (newTheme) => {
    if (newTheme === 'simple' || newTheme === 'full') {
      theme.value = newTheme
      localStorage.setItem('theme', newTheme)
      
      // 如果切换到全特效版，启动轮换
      if (newTheme === 'full' && backgroundImages.value.length > 0) {
        startRotation()
      } else {
        stopRotation()
      }
    }
  }

  const setSimpleBgMode = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      simpleBgMode.value = mode
      localStorage.setItem('simpleBgMode', mode)
    }
  }

  const loadBackgroundImages = async () => {
    // 持续重试直到成功加载到图片
    const tryLoad = async () => {
      try {
        const response = await getBackgroundImages()
        if (response.data && response.data.images && Array.isArray(response.data.images)) {
          const images = response.data.images.map(item => item.url).filter(Boolean)
          
          if (images.length > 0) {
            backgroundImages.value = images
            
            // 输出加载的图片URL到控制台
            console.log('Loaded background images:')
            backgroundImages.value.forEach((url, index) => {
              console.log(`${index + 1}. ${url}`)
            })
            
            // 成功加载到图片后，启动轮换
            if (isFullTheme.value) {
              startRotation()
            }
            return true // 加载成功
          }
        }
      } catch (error) {
        console.error('Failed to load background images:', error)
      }
      
      // 加载失败，延迟1秒后重试
      if (isFullTheme.value && backgroundImages.value.length === 0) {
        setTimeout(() => {
          if (isFullTheme.value && backgroundImages.value.length === 0) {
            tryLoad()
          }
        }, 1000)
      }
      return false // 加载失败
    }
    
    await tryLoad()
  }

  const startRotation = () => {
    stopRotation() // 清除已有定时器
    
    // 检查并加载图片直到达到20张
    ensureImageCount()
    
    rotationTimer = setInterval(() => {
      const currentLength = backgroundImages.value.length
      
      // 如果只有一张图片，不进行轮换，但继续尝试加载
      if (currentLength <= 1) {
        ensureImageCount()
        return
      }
      
      // 循环轮换：到达最后一张后从头开始
      currentBackgroundIndex.value = (currentBackgroundIndex.value + 1) % currentLength
      
      // 在轮换过程中持续检查并加载图片，直到达到20张
      ensureImageCount()
    }, 10000) // 10秒切换
  }

  const ensureImageCount = async () => {
    // 如果图片数量少于20且当前没有在加载，则加载新图片
    // 即使当前没有图片（长度为0），也要继续尝试加载
    if (backgroundImages.value.length < 20 && !isLoadingNextBatch.value) {
      await loadNextBatch()
    }
  }

  const loadNextBatch = async () => {
    if (isLoadingNextBatch.value) return // 防止重复加载
    if (backgroundImages.value.length >= 20) return // 已达到20张，不需要加载
    
    isLoadingNextBatch.value = true
    try {
      const response = await getBackgroundImages()
      if (response.data && response.data.images && Array.isArray(response.data.images)) {
        const newImages = response.data.images.map(item => item.url).filter(Boolean)
        
        if (newImages.length > 0) {
          // 只添加需要的数量，确保不超过20张
          const remainingCount = 20 - backgroundImages.value.length
          const imagesToAdd = newImages.slice(0, remainingCount)
          
          if (imagesToAdd.length > 0) {
            console.log(`Loaded ${imagesToAdd.length} new background images (Total: ${backgroundImages.value.length + imagesToAdd.length}):`)
            imagesToAdd.forEach((url, index) => {
              console.log(`${backgroundImages.value.length + index + 1}. ${url}`)
            })
            
            // 将新图片追加到当前数组
            backgroundImages.value = [...backgroundImages.value, ...imagesToAdd]
          }
        }
      }
    } catch (error) {
      console.error('Failed to load next batch of background images:', error)
    } finally {
      isLoadingNextBatch.value = false
    }
  }

  const stopRotation = () => {
    if (rotationTimer) {
      clearInterval(rotationTimer)
      rotationTimer = null
    }
  }

  const getCurrentBackgroundImage = computed(() => {
    if (isFullTheme.value && backgroundImages.value.length > 0) {
      return backgroundImages.value[currentBackgroundIndex.value % backgroundImages.value.length]
    }
    return null
  })

  const nextBackground = () => {
    if (backgroundImages.value.length > 0) {
      currentBackgroundIndex.value = (currentBackgroundIndex.value + 1) % backgroundImages.value.length
    }
  }

  return {
    theme,
    simpleBgMode,
    isSimpleTheme,
    isFullTheme,
    isSimpleDark,
    backgroundImages,
    currentBackgroundIndex,
    setTheme,
    setSimpleBgMode,
    loadBackgroundImages,
    getCurrentBackgroundImage,
    nextBackground,
    startRotation,
    stopRotation,
    loadNextBatch
  }
})
