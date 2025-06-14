<template>
  <div class="publish-selector-dialog">
    <!-- 对话框标题 -->
    <!-- <div class="dialog-header text-center mb-6">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        {{ $t('publishSelector.title') }}
      </h2>
    </div> -->

    <!-- 发布选项 -->
    <div class="publish-options grid grid-cols-2 gap-6">
      <!-- 左侧：仅发布工作流 -->
      <div class="publish-option">
        <div class="option-preview mb-4">
          <div class="preview-card workflow-preview">
            <!-- 工作流预览内容 -->
            <div class="workflow-preview-content">
              <div class="workflow-nodes">
                <div class="node node-1"></div>
                <div class="node node-2"></div>
                <div class="node node-3"></div>
                <div class="node node-4"></div>
              </div>
              <div class="workflow-connections">
                <div class="connection connection-1"></div>
                <div class="connection connection-2"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="option-description mb-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('publishSelector.workflowOnly.description') }}
          </p>
        </div>
        <button
          @click="publishWorkflowOnly"
          class="publish-btn ai-app-btn workflow-only-btn w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
        >
          <i class="pi pi-send mr-2"></i>
          {{ $t('publishSelector.workflowOnly.button') }}
        </button>
      </div>

      <!-- 右侧：编辑AI应用 -->
      <div class="publish-option">
        <!-- 推荐标签 -->
        <!-- <div class="recommend-badge">
          <span class="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {{ $t('common.recommended') }}
          </span>
        </div> -->
        <div class="option-preview mb-4">
          <div class="preview-card app-preview">
            <!-- AI应用预览内容 -->
            <div class="app-preview-content">
              <div class="app-grid">
                <div class="app-item" v-for="i in 8" :key="i"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="option-description mb-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('publishSelector.aiApp.description') }}
          </p>
        </div>
        <button
          @click="editAiApp"
          class="publish-btn ai-app-btn w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
        >
          <i class="pi pi-send mr-2"></i>
          {{ $t('publishSelector.aiApp.button') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { app } from '@/scripts/app'
import { useDialogStore } from '@/stores/dialogStore'
import WorkflowListDialog from './WorkflowListDialog.vue'

const dialogStore = useDialogStore()

/**
 * 仅发布工作流
 */
const publishWorkflowOnly = () => {
  console.log('仅发布工作流')

  // 显示工作流列表弹窗
  dialogStore.showDialog({
    key: 'workflow-list',
    title: '发布工作流',
    component: WorkflowListDialog,
    dialogComponentProps: {
      pt: {
        content: { class: 'w-[820px] max-w-[90vw]' }
      }
    }
  })

  // 关闭当前对话框
  dialogStore.closeDialog()
}

/**
 * 编辑AI应用
 */
const editAiApp = () => {
  console.log('编辑AI应用')

  // 进入AI应用编辑模式
  dialogStore.enterAiAppEditMode()

  // 获取当前工作流的所有节点信息
  const workflowNodes = app.graph?.nodes || []
  console.log('工作流节点信息:', workflowNodes)

  // 提取节点的基本信息
  const nodeInfos = workflowNodes.map((node) => ({
    id: node.id,
    type: node.type,
    title: node.title,
    inputs: node.inputs,
    outputs: node.outputs,
    properties: node.properties,
    widgets: node.widgets,
    pos: node.pos, // 节点位置
    size: node.size // 节点大小
  }))

  console.log('节点详细信息:', JSON.stringify(nodeInfos))

  // TODO: 实现编辑AI应用的逻辑
  // 这里可以将节点信息传递给AI应用编辑器

  // 关闭对话框
  dialogStore.closeDialog()

  // 可能跳转到AI应用编辑页面或打开新的对话框
}
</script>

<style scoped>
.publish-selector-dialog {
  width: 700px;
  max-width: 90vw;
  padding: 1.5rem;
}

.publish-option {
  display: flex;
  flex-direction: column;
  position: relative;
}

.recommend-badge {
  position: absolute;
  top: -8px;
  right: 8px;
  z-index: 1;
}

.preview-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.dark .preview-card {
  background: #2d3748;
  border-color: #4a5568;
}

.publish-btn {
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 左侧按钮样式 - 仅发布工作流 */
.workflow-only-btn {
  background-color: #3f4559;
  color: white;
}

.workflow-only-btn:hover {
  background-color: #353d4f;
}

/* 右侧按钮样式 - 编辑AI应用 */
.ai-app-btn {
  background: linear-gradient(
    90deg,
    rgb(50, 107, 255) 0%,
    rgb(44, 77, 255) 100%
  );
  color: white;
}

.ai-app-btn:hover {
  background: linear-gradient(
    90deg,
    rgb(45, 97, 230) 0%,
    rgb(39, 69, 230) 100%
  );
}

/* 响应式设计 */
@media (max-width: 768px) {
  .publish-selector-dialog {
    width: 100%;
    padding: 1rem;
  }

  .publish-options {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* 工作流预览样式 */
.workflow-preview-content {
  position: relative;
  width: 100%;
  height: 160px;
}

.workflow-nodes {
  position: relative;
  width: 100%;
  height: 100%;
}

.node {
  position: absolute;
  width: 60px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  border: 2px solid #4c51bf;
}

.node-1 {
  top: 20px;
  left: 20px;
}

.node-2 {
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-color: #e53e3e;
}

.node-3 {
  bottom: 20px;
  left: 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-color: #3182ce;
}

.node-4 {
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border-color: #38a169;
}

.workflow-connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connection {
  position: absolute;
  height: 2px;
  background: #9ca3af;
  border-radius: 1px;
}

.connection-1 {
  top: 40px;
  left: 80px;
  width: 60px;
}

.connection-2 {
  bottom: 40px;
  left: 80px;
  width: 60px;
}

/* AI应用预览样式 */
.app-preview-content {
  width: 100%;
  height: 160px;
  padding: 10px;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 8px;
  width: 100%;
  height: 100%;
}

.app-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  opacity: 0.7;
}

.app-item:nth-child(1) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.app-item:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.app-item:nth-child(5) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.app-item:nth-child(7) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}
</style>
