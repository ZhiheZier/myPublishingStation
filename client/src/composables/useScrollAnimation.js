import { onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '../stores/theme'

// 全局单例，所有组件共享同一个滚动监听器
let globalScrollManager = null

function createScrollManager() {
  const elements = new Map() // element -> { isVisible, isAnimating, options }
  let lastScrollY = 0
  let scrollDirection = 'down'
  let ticking = false
  let isInitialized = false

  // 更新滚动方向
  const updateScrollDirection = () => {
    const currentScrollY = window.scrollY || window.pageYOffset
    scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up'
    lastScrollY = currentScrollY
  }

  // 检查元素是否应该显示（元素顶部距离视口底部达到阈值百分比）
  const shouldShow = (element, viewportHeight, showThreshold) => {
    const rect = element.getBoundingClientRect()
    const elementTop = rect.top
    // 元素顶部距离视口底部的距离
    const distanceFromBottom = viewportHeight - elementTop
    // 阈值（视口高度的百分比）
    const threshold = (showThreshold / 100) * viewportHeight
    
    // 如果距离大于等于阈值，应该显示
    return distanceFromBottom >= threshold
  }

  // 检查元素是否应该隐藏（元素顶部距离视口底部低于阈值百分比）
  const shouldHide = (element, viewportHeight, hideThreshold) => {
    const rect = element.getBoundingClientRect()
    const elementTop = rect.top
    // 元素顶部距离视口底部的距离
    const distanceFromBottom = viewportHeight - elementTop
    // 阈值（视口高度的百分比）
    const threshold = (hideThreshold / 100) * viewportHeight
    
    // 如果距离小于阈值，应该隐藏（向上滚动时，元素从底部离开）
    return distanceFromBottom < threshold
  }

  // 检查元素是否在视口内（用于初始加载判断）
  // 根据元素顶部到浏览器顶部的距离判断（元素顶部在视口内）
  const isInViewport = (element, viewportHeight) => {
    const rect = element.getBoundingClientRect()
    // 元素顶部在视口内（0 到 viewportHeight 之间）
    // rect.top 是元素顶部到视口顶部的距离
    return rect.top >= 0 && rect.top < viewportHeight
  }

  // 处理滚动
  const handleScroll = () => {
    if (ticking) return
    ticking = true
    
    updateScrollDirection()
    const viewportHeight = window.innerHeight

    requestAnimationFrame(() => {
      elements.forEach((data, element) => {
        if (!element || !element.parentElement) {
          elements.delete(element)
          return
        }

        const { isVisible, isAnimating, options } = data
        const { showThreshold, hideThreshold, onShow, onHide } = options
        
        if (scrollDirection === 'down') {
          // 向下滚动：检查是否应该显示
          if (!isVisible && !isAnimating && shouldShow(element, viewportHeight, showThreshold)) {
            data.isVisible = true
            data.isAnimating = true
            onShow(element, false)
            // 动画完成后重置 isAnimating
            setTimeout(() => {
              const currentData = elements.get(element)
              if (currentData) {
                currentData.isAnimating = false
              }
            }, 800)
          }
        } else {
          // 向上滚动：检查是否应该隐藏
          if (isVisible && !isAnimating && shouldHide(element, viewportHeight, hideThreshold)) {
            data.isVisible = false
            data.isAnimating = true
            onHide(element)
            // 动画完成后重置 isAnimating
            setTimeout(() => {
              const currentData = elements.get(element)
              if (currentData) {
                currentData.isAnimating = false
              }
            }, 600)
          }
        }
      })
      
      ticking = false
    })
  }

  // 初始化检查（页面加载时或元素注册后）
  // 根据每个元素顶部到浏览器顶部的距离（rect.top）判断是否在视口内
  // rect.top >= 0 且 < viewportHeight 表示元素顶部在视口范围内，应该显示
  // shouldAnimate: true表示在视口内的元素也播放进入动画，false表示直接显示（不播放动画）
  // animateAllThenHide: true表示所有元素都播放进入动画，然后不在视口内的播放退出动画并隐藏
  const checkInitialState = (newElement = null, shouldAnimate = false, animateAllThenHide = false) => {
    const viewportHeight = window.innerHeight
    const elementsToCheck = newElement ? [newElement] : Array.from(elements.keys())
    
    if (animateAllThenHide) {
      // 特殊模式：所有元素都播放进入动画，然后不在视口内的播放退出动画并隐藏
      elementsToCheck.forEach((element) => {
        const data = elements.get(element)
        if (!data) return
        
        const { options } = data
        
        // 第一步：所有元素都播放进入动画
        data.isVisible = true
        data.isAnimating = true
        options.onShow(element, false)
        
        // 第二步：动画完成后，检查位置，不在视口内的播放退出动画并隐藏
        setTimeout(() => {
          const currentData = elements.get(element)
          if (!currentData) return
          
          currentData.isAnimating = false
          
          // 检查元素是否在视口内
          if (!isInViewport(element, viewportHeight)) {
            // 不在视口内，播放退出动画并隐藏
            currentData.isVisible = false
            currentData.isAnimating = true
            options.onHide(element)
            setTimeout(() => {
              const finalData = elements.get(element)
              if (finalData) {
                finalData.isAnimating = false
              }
            }, 600)
          }
        }, 800) // 进入动画持续时间
      })
    } else {
      // 正常模式：只在视口内的元素处理
      elementsToCheck.forEach((element) => {
        const data = elements.get(element)
        if (!data) return
        
        const { options } = data
        // 判断元素顶部到浏览器顶部的距离是否在视口内
        if (isInViewport(element, viewportHeight)) {
          // 元素在视口内
          data.isVisible = true
          if (shouldAnimate) {
            // 需要播放动画（用于侧边栏等场景）
            data.isAnimating = true
            options.onShow(element, false)
            setTimeout(() => {
              const currentData = elements.get(element)
              if (currentData) {
                currentData.isAnimating = false
              }
            }, 800)
          } else {
            // 直接显示（不播放动画，用于文章卡片等场景）
            options.onShow(element, true)
          }
        }
        // 如果不在视口内，保持隐藏状态，等待滚动触发动画
      })
    }
  }

  // 初始化滚动监听
  const init = () => {
    if (isInitialized) return
    isInitialized = true
    lastScrollY = window.scrollY || window.pageYOffset
    window.addEventListener('scroll', handleScroll, { passive: true })
    // 延迟检查初始状态，确保DOM已渲染（文章卡片直接显示，不播放动画）
    setTimeout(() => checkInitialState(null, false), 100)
  }

  // 注册元素
  const registerElement = (element, options) => {
    if (!element) return
    
    elements.set(element, {
      el: element,
      isVisible: false,
      isAnimating: false,
      options
    })
    
    // 首次注册时初始化
    if (!isInitialized) {
      init()
    }
  }
  
  // 批量检查所有元素的初始状态（用于侧边栏等批量注册的场景）
  // shouldAnimate: true表示在视口内的元素播放进入动画，false表示直接显示
  // animateAllThenHide: true表示所有元素都播放进入动画，然后不在视口内的播放退出动画并隐藏
  const checkAllInitialState = (shouldAnimate = false, animateAllThenHide = false) => {
    checkInitialState(null, shouldAnimate, animateAllThenHide)
  }

  // 注销元素
  const unregisterElement = (element) => {
    elements.delete(element)
  }

  return {
    registerElement,
    unregisterElement,
    checkInitialState,
    checkAllInitialState
  }
}

/**
 * 统一的滚动动画管理
 * @param {Object} options - 配置选项
 * @param {number} options.showThreshold - 显示阈值百分比（0-100），元素顶部距离视口底部的距离
 * @param {number} options.hideThreshold - 隐藏阈值百分比（0-100），元素顶部距离视口底部的距离
 * @param {Function} options.onShow - 显示时的回调函数 (element, isInitial) => void
 * @param {Function} options.onHide - 隐藏时的回调函数 (element) => void
 * @returns {Object} - { registerElement, unregisterElement }
 */
export function useScrollAnimation(options = {}) {
  const {
    showThreshold = 20, // 默认20%，元素顶部距离视口底部20%视口高度时显示
    hideThreshold = 10, // 默认10%，元素顶部距离视口底部10%视口高度时隐藏
    onShow = () => {},
    onHide = () => {}
  } = options

  const themeStore = useThemeStore()

  // 如果是去特效版，直接返回不启用动画的版本
  if (themeStore.isSimpleTheme) {
    return {
      registerElement: (element) => {
        if (!element) return
        // 直接显示，不启用动画
        onShow(element, true)
      },
      unregisterElement: () => {},
      checkAllInitialState: () => {}
    }
  }

  // 使用全局单例
  if (!globalScrollManager) {
    globalScrollManager = createScrollManager()
  }

  // 注册当前组件的元素
  const registerElement = (element) => {
    globalScrollManager.registerElement(element, {
      showThreshold,
      hideThreshold,
      onShow,
      onHide
    })
  }

  // 注销元素
  const unregisterElement = (element) => {
    globalScrollManager.unregisterElement(element)
  }

  return {
    registerElement,
    unregisterElement,
    checkAllInitialState: (shouldAnimate = false, animateAllThenHide = false) => {
      // 调用全局管理器的 checkAllInitialState
      if (globalScrollManager) {
        globalScrollManager.checkAllInitialState(shouldAnimate, animateAllThenHide)
      }
    }
  }
}