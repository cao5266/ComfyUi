<template>
  <div class="execution-control-buttons flex items-center gap-1">
    <!-- 普通模式按钮 -->
    <Button
      :label="t('executionControl.normal')"
      severity="secondary"
      text
      class="execution-mode-btn normal-mode"
      :class="{ active: executionMode === 'normal' }"
      @click="setExecutionMode('normal')"
    />

    <!-- 加速模式按钮 -->
    <Button
      severity="secondary"
      text
      class="execution-mode-btn accelerated-mode flex items-center gap-1"
      :class="{ active: executionMode === 'accelerated' }"
      @click="setExecutionMode('accelerated')"
    >
      <i class="pi pi-star-fill text-yellow-500" />
      <span>{{ t('executionControl.accelerated') }}</span>
    </Button>

    <!-- 开始生图按钮 -->
    <Button
      severity="primary"
      class="start-generation-btn flex items-center gap-2 px-4"
      :disabled="isGenerating"
      @click="startGeneration"
    >
      <span>{{ t('executionControl.startGeneration') }}</span>
      <i class="pi pi-bolt text-white" />
      <span class="generation-count">{{ queueCount }}</span>
    </Button>

    <!-- 中断按钮 -->
    <!-- <Button
      v-if="executingPrompt"
      icon="pi pi-times"
      severity="danger"
      size="small"
      text
      @click="interruptGeneration"
      v-tooltip.bottom="'中断当前任务'"
    /> -->

    <!-- 清空队列按钮 -->
    <!-- <Button
      v-if="hasPendingTasks"
      icon="pi pi-stop"
      severity="danger"
      size="small"
      text
      @click="clearPendingTasks"
      v-tooltip.bottom="'清空待处理任务'"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCommandStore } from '@/stores/commandStore'
import {
  useQueuePendingTaskCountStore,
  useQueueSettingsStore,
  useQueueStore
} from '@/stores/queueStore'
import { useToastStore } from '@/stores/toastStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

// 国际化
const { t } = useI18n()

// 执行模式状态
const executionMode = ref<'normal' | 'accelerated'>('normal')

// 队列相关状态
const queueStore = useQueueStore()
const toastStore = useToastStore()
const commandStore = useCommandStore()
const workspaceStore = useWorkspaceStore()

// 集成原ComfyQueueButton的功能
const queueCountStore = storeToRefs(useQueuePendingTaskCountStore())
const { mode: queueMode, batchCount } = storeToRefs(useQueueSettingsStore())

// 计算属性
const queueCount = computed(() => queueStore.pendingTasks.length)
const isGenerating = computed(() => queueStore.runningTasks.length > 0)
const executingPrompt = computed(() => !!queueCountStore.count.value)
const hasPendingTasks = computed(
  () => queueCountStore.count.value > 1 || queueMode.value !== 'disabled'
)

/**
 * 设置执行模式
 * @param mode 执行模式：normal 普通模式，accelerated 加速模式
 */
const setExecutionMode = (mode: 'normal' | 'accelerated') => {
  executionMode.value = mode

  // 这里可以添加实际的模式切换逻辑
  console.log(
    `切换到${mode === 'normal' ? t('executionControl.normal') : t('executionControl.accelerated')}模式`
  )

  toastStore.add({
    severity: 'info',
    summary: t('executionControl.modeSwitch'),
    detail: t('executionControl.modeSwitchDetail', {
      mode:
        mode === 'normal'
          ? t('executionControl.normal')
          : t('executionControl.accelerated')
    }),
    life: 2000
  })
}

/**
 * 开始生图 - 执行工作流
 * 集成原ComfyQueueButton的完整功能
 */
const startGeneration = async (e?: Event) => {
  try {
    // 确定执行模式和队列位置
    const isAccelerated = executionMode.value === 'accelerated'
    const isShiftPressed = e && 'shiftKey' in e && e.shiftKey
    const shouldRunFirst =
      isAccelerated || isShiftPressed || workspaceStore.shiftDown

    // 使用批次数量
    const batchSize = batchCount.value || 1

    // 执行工作流
    const commandId = shouldRunFirst
      ? 'Comfy.QueuePromptFront'
      : 'Comfy.QueuePrompt'

    // 执行多个批次
    for (let i = 0; i < batchSize; i++) {
      await commandStore.execute(commandId)
    }

    // 显示相应的提示信息
    const modeText = shouldRunFirst
      ? t('executionControl.priorityExecution')
      : t('executionControl.normalExecution')
    const batchText =
      batchSize > 1
        ? ` (${t('executionControl.batchCount', { count: batchSize })})`
        : ''

    toastStore.add({
      severity: shouldRunFirst ? 'success' : 'info',
      summary: t('executionControl.generationStarted', { mode: modeText }),
      detail: t('executionControl.workflowQueued') + batchText,
      life: 3000
    })
  } catch (error) {
    console.error('执行工作流失败:', error)
    toastStore.add({
      severity: 'error',
      summary: t('executionControl.generationFailed'),
      detail: t('executionControl.checkWorkflowConfig'),
      life: 5000
    })
  }
}

/**
 * 中断当前任务
 */
const interruptGeneration = async () => {
  try {
    await commandStore.execute('Comfy.Interrupt')
    toastStore.add({
      severity: 'warn',
      summary: t('executionControl.taskInterrupted'),
      detail: t('executionControl.currentTaskInterrupted'),
      life: 3000
    })
  } catch (error) {
    console.error('中断任务失败:', error)
  }
}

/**
 * 清空待处理任务
 */
const clearPendingTasks = async () => {
  try {
    if (queueCountStore.count.value > 1) {
      await commandStore.execute('Comfy.ClearPendingTasks')
    }
    queueMode.value = 'disabled'
    toastStore.add({
      severity: 'info',
      summary: t('executionControl.queueCleared'),
      detail: t('executionControl.allPendingTasksCleared'),
      life: 3000
    })
  } catch (error) {
    console.error('清空队列失败:', error)
  }
}
</script>

<style scoped>
.execution-control-buttons {
  min-width: 0;
}

/* 执行模式按钮样式 */
.execution-mode-btn {
  min-width: 4rem;
  font-size: 0.875rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  padding: 4px 10px;
  height: 30px;
  color: var(--p-inputtext-color);
}

.execution-mode-btn.active {
  background-color: var(--p-primary-color) !important;
  color: var(--p-primary-contrast-color) !important;
  font-weight: 500;
}

.execution-mode-btn:not(.active):hover {
  background-color: var(--p-content-hover-background);
}

/* 加速模式按钮特殊样式 */
.accelerated-mode.active .pi-star-fill {
  color: var(--p-primary-contrast-color) !important;
}

/* 开始生图按钮样式 */
.start-generation-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 4px;
  /* font-weight: 600; */
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
  min-width: 7rem;
  padding: 5px 10px;
  height: 30px;
  color: var(--p-inputtext-color);
}

.start-generation-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  /* transform: translateY(-1px); */
}

.start-generation-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.generation-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 1.25rem;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .execution-mode-btn {
    min-width: 3rem;
    font-size: 0.75rem;
  }

  .start-generation-btn {
    min-width: 6rem;
    font-size: 0.75rem;
  }

  .start-generation-btn span:first-child {
    display: none;
  }
}
</style>
