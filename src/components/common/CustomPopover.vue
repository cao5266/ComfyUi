<template>
  <div class="custom-popover" ref="popoverContainer">
    <!-- 触发器插槽 -->
    <div 
      ref="triggerRef"
      @click="toggle"
      class="popover-trigger"
    >
      <slot name="trigger"></slot>
    </div>

    <!-- Popover内容 -->
    <Teleport to="body">
      <div
        v-if="visible"
        ref="popoverRef"
        class="popover-overlay"
        :class="{
          'popover-entering': isEntering,
          'popover-visible': isVisible,
          [`popover-placement-${currentPlacement}`]: true
        }"
        :style="popoverStyle"
        @click.stop
      >
        <!-- 箭头指示器 -->
        <div 
          class="popover-arrow" 
          :class="`arrow-${getArrowPosition()}`"
          :style="arrowStyle"
        ></div>
        
        <div class="popover-content-wrapper">
          <slot name="content"></slot>
        </div>
      </div>
    </Teleport>

    <!-- 遮罩层 -->
    <!-- <Teleport to="body">
      <div
        v-if="visible"
        class="popover-backdrop"
        @click="hide"
      ></div>
    </Teleport> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'
  offset?: number
  arrowSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom',
  offset: 8,
  arrowSize: 8
})

const emit = defineEmits<{
  show: []
  hide: []
}>()

const visible = ref(false)
const isEntering = ref(false)
const isVisible = ref(false)
const currentPlacement = ref(props.placement)
const triggerRef = ref<HTMLElement>()
const popoverRef = ref<HTMLElement>()
const popoverContainer = ref<HTMLElement>()

const popoverStyle = reactive({
  position: 'fixed' as const,
  top: '0px',
  left: '0px',
  zIndex: 9999
})

const arrowStyle = reactive({
  position: 'absolute' as const,
  top: '0px',
  left: '0px'
})

/**
 * 获取箭头位置类名
 */
const getArrowPosition = () => {
  const placement = currentPlacement.value
  if (placement.includes('top')) return 'bottom'
  if (placement.includes('bottom')) return 'top'
  if (placement.includes('left')) return 'right'
  if (placement.includes('right')) return 'left'
  return 'bottom'
}

/**
 * 计算箭头位置
 */
const calculateArrowPosition = (triggerRect: DOMRect, popoverRect: DOMRect) => {
  const placement = currentPlacement.value
  const arrowSize = props.arrowSize
  
  let top = 0
  let left = 0
  
  // 获取触发器相对于弹出框的位置
  const popoverLeft = parseFloat(popoverStyle.left)
  const popoverTop = parseFloat(popoverStyle.top)
  
  switch (placement) {
    case 'top':
    case 'top-start':
    case 'top-end':
      top = popoverRect.height - 1
      // 箭头水平位置应该对齐触发器中心
      left = (triggerRect.left + triggerRect.width / 2) - popoverLeft - arrowSize
      break
      
    case 'bottom':
    case 'bottom-start': 
    case 'bottom-end':
      top = -arrowSize - 1
      // 箭头水平位置应该对齐触发器中心
      left = (triggerRect.left + triggerRect.width / 2) - popoverLeft - arrowSize
      break
      
    case 'left':
    case 'left-start':
    case 'left-end':
      left = popoverRect.width - 1
      // 箭头垂直位置应该对齐触发器中心
      top = (triggerRect.top + triggerRect.height / 2) - popoverTop - arrowSize
      break
      
    case 'right':
    case 'right-start':
    case 'right-end':
      left = -arrowSize - 1
      // 箭头垂直位置应该对齐触发器中心
      top = (triggerRect.top + triggerRect.height / 2) - popoverTop - arrowSize
      break
  }
  
  // 确保箭头不会超出弹出框边界
  const minOffset = 12 // 最小距离边缘的距离
  const maxLeft = popoverRect.width - arrowSize * 2 - minOffset
  const maxTop = popoverRect.height - arrowSize * 2 - minOffset
  
  if (placement.includes('top') || placement.includes('bottom')) {
    left = Math.max(minOffset, Math.min(left, maxLeft))
  } else {
    top = Math.max(minOffset, Math.min(top, maxTop))
  }
  
  arrowStyle.top = top + 'px'
  arrowStyle.left = left - 7 + 'px'
}

/**
 * 计算popover位置
 */
const calculatePosition = () => {
  if (!triggerRef.value || !popoverRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popoverRect = popoverRef.value.getBoundingClientRect()
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  let top = 0
  let left = 0
  let finalPlacement = props.placement

  // 计算初始位置
  switch (props.placement) {
    case 'top':
      top = triggerRect.top - popoverRect.height - props.offset
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2
      break
    case 'top-start':
      top = triggerRect.top - popoverRect.height - props.offset
      left = triggerRect.left
      break
    case 'top-end':
      top = triggerRect.top - popoverRect.height - props.offset
      left = triggerRect.right - popoverRect.width
      break
    case 'bottom':
      top = triggerRect.bottom + props.offset
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2
      break
    case 'bottom-start':
      top = triggerRect.bottom + props.offset
      left = triggerRect.left
      break
    case 'bottom-end':
      top = triggerRect.bottom + props.offset
      left = triggerRect.right - popoverRect.width
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2
      left = triggerRect.left - popoverRect.width - props.offset
      break
    case 'left-start':
      top = triggerRect.top
      left = triggerRect.left - popoverRect.width - props.offset
      break
    case 'left-end':
      top = triggerRect.bottom - popoverRect.height
      left = triggerRect.left - popoverRect.width - props.offset
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2
      left = triggerRect.right + props.offset
      break
    case 'right-start':
      top = triggerRect.top
      left = triggerRect.right + props.offset
      break
    case 'right-end':
      top = triggerRect.bottom - popoverRect.height
      left = triggerRect.right + props.offset
      break
  }

  // 边界检测和自动调整位置
  if (left < 8) {
    left = 8
  } else if (left + popoverRect.width > viewport.width - 8) {
    left = viewport.width - popoverRect.width - 8
  }
  
  if (top < 8) {
    // 如果顶部超出，尝试翻转到底部
    if (props.placement.includes('top')) {
      top = triggerRect.bottom + props.offset
      finalPlacement = props.placement.replace('top', 'bottom') as typeof props.placement
    } else {
      top = 8
    }
  } else if (top + popoverRect.height > viewport.height - 8) {
    // 如果底部超出，尝试翻转到顶部
    if (props.placement.includes('bottom')) {
      top = triggerRect.top - popoverRect.height - props.offset
      finalPlacement = props.placement.replace('bottom', 'top') as typeof props.placement
    } else {
      top = viewport.height - popoverRect.height - 8
    }
  }

  currentPlacement.value = finalPlacement
  popoverStyle.top = top + 'px'
  popoverStyle.left = left + 'px'
  
  // 计算箭头位置
  calculateArrowPosition(triggerRect, popoverRect)
}

/**
 * 显示popover
 */
const show = async () => {
  if (visible.value) return
  
  visible.value = true
  isEntering.value = true
  emit('show')
  
  await nextTick()
  await nextTick() // 多等一帧确保元素渲染完成
  
  calculatePosition()
  
  // 开始进入动画
  await nextTick()
  isVisible.value = true
  
  // 动画完成后清理entering状态
  setTimeout(() => {
    isEntering.value = false
  }, 200)
}

/**
 * 隐藏popover
 */
const hide = () => {
  if (!visible.value) return
  
  isVisible.value = false
  isEntering.value = false
  
  setTimeout(() => {
    visible.value = false
    currentPlacement.value = props.placement
    emit('hide')
  }, 150)
}

/**
 * 切换显示状态
 */
const toggle = () => {
  if (visible.value) {
    hide()
  } else {
    show()
  }
}

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  if (visible.value && !isEntering.value) {
    calculatePosition()
  }
}

/**
 * 处理滚动
 */
const handleScroll = () => {
  if (visible.value && !isEntering.value) {
    calculatePosition()
  }
}

// 暴露方法给父组件
defineExpose({
  show,
  hide,
  toggle
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<style scoped>
.custom-popover {
    width: 100%;
  display: inline-block;
  
}

.popover-trigger {
  display: inline-block;
  width: 100%;
}

.popover-overlay {
  position: fixed;
  z-index: 9999;
  max-width: 90vw;
  max-height: 80vh;
  opacity: 0;
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
  pointer-events: none;
}

.popover-overlay.popover-entering {
  opacity: 0;
}

.popover-overlay.popover-visible {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}


.popover-content-wrapper {
  background: var(--p-togglebutton-hover-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 200px;
  position: relative;
}

/* .popover-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background: transparent;
} */

/* 箭头样式 */
.popover-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.popover-arrow.arrow-top {
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--border-color);
}

.popover-arrow.arrow-top::after {
  content: '';
  position: absolute;
  left: -7px;
  top: 1px;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid var(--comfy-color-bg);
}

.popover-arrow.arrow-bottom {
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid var(--border-color);
}

.popover-arrow.arrow-bottom::after {
  content: '';
  position: absolute;
  left: -7px;
  bottom: 1px;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid var(--comfy-color-bg);
}

.popover-arrow.arrow-left {
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid transparent;
  border-right: 8px solid var(--border-color);
}

.popover-arrow.arrow-left::after {
  content: '';
  position: absolute;
  top: -7px;
  right: 1px;
  border-left: 7px solid transparent;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-right: 7px solid var(--comfy-color-bg);
}

.popover-arrow.arrow-right {
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid var(--border-color);
}

.popover-arrow.arrow-right::after {
  content: '';
  position: absolute;
  top: -7px;
  left: 1px;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 7px solid var(--comfy-color-bg);
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .popover-content-wrapper {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
</style> 