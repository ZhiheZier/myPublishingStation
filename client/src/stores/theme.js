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
    try {
      const response = await getBackgroundImages()
      console.log('Background images API response:', response.data)
      if (response.data && response.data.images && Array.isArray(response.data.images)) {
        const images = response.data.images.map(item => item.url).filter(Boolean)
        
        if (images.length > 0) {
          backgroundImages.value = images
          // 确保当前索引指向第一张图片
          currentBackgroundIndex.value = 0
          
          // 输出加载的图片URL到控制台
          console.log(`Loaded ${images.length} background image(s):`)
          backgroundImages.value.forEach((url, index) => {
            console.log(`${index + 1}. ${url}`)
          })
          console.log('Current background index:', currentBackgroundIndex.value)
          console.log('Is full theme:', isFullTheme.value)
          
          // 成功加载到图片后，如果有多张图片则启动轮换
          if (isFullTheme.value) {
            startRotation()
          }
        } else {
          console.warn('No background images found')
        }
      }
    } catch (error) {
      console.error('Failed to load background images:', error)
    }
  }

  const startRotation = () => {
    stopRotation() // 清除已有定时器
    
    const currentLength = backgroundImages.value.length
    
    // 如果没有图片，不启动轮换
    if (currentLength === 0) {
      console.warn('No background images available')
      return
    }
    
    // 如果只有一张图片，不进行轮换，但图片仍然会显示
    if (currentLength <= 1) {
      console.log('Only one background image, rotation disabled (image will still display)')
      return
    }
    
    // 循环轮换：到达最后一张后从头开始
    rotationTimer = setInterval(() => {
      currentBackgroundIndex.value = (currentBackgroundIndex.value + 1) % backgroundImages.value.length
    }, 5000) // 5秒切换
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
    stopRotation
  }
})
