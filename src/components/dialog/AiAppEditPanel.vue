<template>
  <div class="ai-app-edit-panel-container">
    <!-- 标题栏 -->
    <div class="panel-header">
      <div class="header-left">
        <h2 class="panel-title">{{ $t('aiAppEdit.title', '编辑AI应用') }}</h2>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="panel-content">
      <!-- 参数选择区域 -->
      <div class="parameter-section">
        <p class="section-description">
          {{ $t('aiAppEdit.parameterDescription', '请设置开放给用户配置的参数，并基于区域性的名称') }}
        </p>
        <div class="section-header">
          <CustomPopover 
            ref="parameterPopover" 
            placement="right-start"
            :offset="12"
            @show="onParameterPopoverShow"
            @hide="onParameterPopoverHide"
          >
            <template #trigger>
              <button class="select-params-btn">
                <i class="pi pi-plus"></i>
                {{ $t('aiAppEdit.selectParameters', '选择参数') }}
              </button>
            </template>
            <template #content>
              <div class="popover-container">
                <div class="popover-header">
                  <h3 class="popover-title">{{ $t('aiAppEdit.selectRequiredParameters', '选择需要配置的参数:') }}</h3>
                  <button @click="hideParameterSelector" class="close-popover-btn">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
                <div class="popover-content">
                  <div class="search-box">
                    <i class="pi pi-search"></i>
                    <input 
                      type="text" 
                      v-model="searchQuery"
                      :placeholder="$t('aiAppEdit.searchNodes', '搜索节点')"
                      class="search-input"
                    />
                  </div>
                  <div class="node-list">
                    <div
                      v-for="nodeGroup in filteredNodeGroups"
                      :key="nodeGroup.nodeId"
                      class="node-group-selector"
                    >
                      <div class="node-header-selector" @click="toggleNodeInSelector(nodeGroup.nodeId)">
                        <i 
                          :class="nodeGroup.expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                          class="expand-icon"
                        ></i>
                        <span class="node-title-selector">
                          #{{ nodeGroup.nodeId }} {{ nodeGroup.title }}
                        </span>
                      </div>
                      
                      <!-- 节点参数列表 -->
                      <div v-if="nodeGroup.expanded" class="node-parameters-selector">
                        <div
                          v-for="param in nodeGroup.parameters"
                          :key="param.name"
                          class="parameter-item-selector"
                        >
                          <label class="parameter-checkbox-selector">
                            <input
                              type="checkbox"
                              :checked="isParameterSelected(nodeGroup.nodeId, param.name)"
                              @change="(event) => toggleParameterSelection(nodeGroup, param, (event.target as HTMLInputElement)?.checked || false)"
                            />
                            <span class="parameter-name-selector">{{ param.displayName }}</span>
                          </label>
                          <div v-if="param.currentValue" class="parameter-value-selector">
                            {{ param.currentValue }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </CustomPopover>
        </div>

        <!-- 已选择的参数列表 -->
        <div class="selected-parameters">
          <draggable
            v-model="sortedSelectedParameters"
            item-key="nodeId"
            handle=".drag-handle"
            ghost-class="ghost"
            chosen-class="chosen"
            drag-class="drag"
          >
            <template #item="{ element: nodeGroup }">
              <div class="selected-node-group">
                <div class="node-group-header">
                  <span class="node-group-title">
                    <i class="pi pi-bars drag-handle"></i>
                    #{{ nodeGroup.nodeId }} {{ nodeGroup.nodeTitle }}
                  </span>
                  <button @click="removeAllNodeParameters(nodeGroup.nodeId)" class="remove-node-btn">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
                <div class="node-group-parameters">
                  <div
                    v-for="param in nodeGroup.parameters"
                    :key="`${param.nodeId}-${param.paramName}`"
                    class="selected-parameter-item"
                  >
                    <div class="parameter-field">
                      <label class="parameter-label">{{ param.paramDisplayName }}</label>
                      <div class="parameter-input-container">
                        <input 
                          type="text" 
                          :value="param.currentValue || ''"
                          class="parameter-input"
                          disabled
                        />
                        <button @click="removeSelectedParameter(param)" class="remove-param-btn">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- 输出结果区域 -->
      <div class="output-section">
        <div class="section-description output-description">
          {{ $t('aiAppEdit.outputDescription', '请设置输出结果，若有多组输出，请分别名区域分组') }}
        </div>
        <div class="section-header">
          <CustomPopover 
            ref="outputPopover" 
            placement="right-start"
            :offset="12"
            @show="onOutputPopoverShow"
            @hide="onOutputPopoverHide"
          >
            <template #trigger>
              <button class="select-output-btn">
                <i class="pi pi-plus"></i>
                {{ $t('aiAppEdit.setOutputResults', '设置输出结果') }}
              </button>
            </template>
            <template #content>
              <div class="popover-container">
                <div class="popover-header">
                  <h3 class="popover-title">{{ $t('aiAppEdit.selectOutputNodes', '选择输出节点:') }}</h3>
                  <button @click="hideOutputSelector" class="close-popover-btn">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
                <div class="popover-content">
                  <div class="search-box">
                    <i class="pi pi-search"></i>
                    <input 
                      type="text" 
                      v-model="outputSearchQuery"
                      :placeholder="$t('aiAppEdit.searchNodes', '搜索节点')"
                      class="search-input"
                    />
                  </div>
                  <div class="output-node-list">
                    <div
                      v-for="outputNode in filteredOutputNodes"
                      :key="outputNode.nodeId"
                      class="output-node-group-selector"
                    >
                      <div class="output-node-header-selector" @click="toggleOutputNodeInSelector(outputNode.nodeId)">
                        <i 
                          :class="outputNode.expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                          class="expand-icon"
                        ></i>
                        <span class="output-node-title-selector">
                          #{{ outputNode.nodeId }} {{ outputNode.title }}
                        </span>
                      </div>
                      
                      <!-- 输出节点详情 -->
                      <div v-if="outputNode.expanded" class="output-node-details-selector">
                        <div class="output-node-item-selector">
                          <label class="output-checkbox-selector">
                            <input
                              type="checkbox"
                              :checked="isOutputSelected(outputNode.nodeId)"
                              @change="toggleOutputSelection(outputNode)"
                            />
                            <span class="output-item-name">{{ outputNode.description }}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </CustomPopover>
        </div>
        
        <!-- 已选择的输出节点列表 -->
        <div class="selected-outputs">
          <draggable
            v-model="sortedSelectedOutputs"
            item-key="nodeId"
            handle=".drag-handle"
            ghost-class="ghost"
            chosen-class="chosen"
            drag-class="drag"
          >
            <template #item="{ element: outputGroup }">
              <div class="selected-node-group">
                <div class="node-group-header">
                  <span class="node-group-title">
                    <i class="pi pi-bars drag-handle"></i>
                    #{{ outputGroup.nodeId }} {{ outputGroup.nodeTitle }}
                  </span>
                  <button @click="removeAllOutputsFromNode(outputGroup.nodeId)" class="remove-node-btn">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
                <div class="node-group-parameters">
                  <div
                    v-for="output in outputGroup.outputs"
                    :key="output.nodeId"
                    class="selected-parameter-item"
                  >
                    <div class="parameter-field">
                      <label class="parameter-label">{{ output.description }}</label>
                      <div class="parameter-input-container">
                        <input 
                          type="text" 
                          :value="output.type"
                          class="parameter-input"
                          disabled
                        />
                        <button @click="removeSelectedOutput(output)" class="remove-param-btn">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { app } from '@/scripts/app'
import CustomPopover from '@/components/common/CustomPopover.vue'
import draggable from 'vuedraggable'

// 定义参数接口
interface NodeParameter {
  name: string
  displayName: string
  type: string
  currentValue?: any
}

interface NodeGroup {
  nodeId: number
  title: string
  type: string
  expanded: boolean
  parameters: NodeParameter[]
}

interface OutputNode {
  nodeId: number
  title: string
  type: string
  description: string
  expanded: boolean
}

interface SelectedParameter {
  nodeId: number
  nodeTitle: string
  paramName: string
  paramDisplayName: string
  paramType: string
  currentValue?: any
}

interface SelectedOutput {
  nodeId: number
  nodeTitle: string
  type: string
  description: string
}

interface SelectedNodeGroup {
  nodeId: number
  nodeTitle: string
  parameters: SelectedParameter[]
}

// 响应式数据
const nodeGroups = ref<NodeGroup[]>([])
const availableOutputNodes = ref<OutputNode[]>([])
const selectedParameters = ref<SelectedParameter[]>([])
const selectedOutputs = ref<SelectedOutput[]>([])

// 拖拽排序状态
const parameterGroupOrder = ref<number[]>([])
const outputGroupOrder = ref<number[]>([])

// Popover组件引用
const parameterPopover = ref()
const outputPopover = ref()

// 对话框显示状态
const searchQuery = ref('')
const outputSearchQuery = ref('')

// 计算属性
const filteredNodeGroups = computed(() => {
  let nodes = nodeGroups.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    nodes = nodes.filter(node => 
      node.title.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query) ||
      node.parameters.some(param => param.displayName.toLowerCase().includes(query))
    )
  }
  
  // 根据 nodeId 从小到大排序
  return nodes.sort((a, b) => a.nodeId - b.nodeId)
})

const filteredOutputNodes = computed(() => {
  if (!outputSearchQuery.value) return availableOutputNodes.value
  
  const query = outputSearchQuery.value.toLowerCase()
  return availableOutputNodes.value.filter(node => 
    node.title.toLowerCase().includes(query) ||
    node.type.toLowerCase().includes(query) ||
    node.description.toLowerCase().includes(query)
  )
})

const groupedSelectedParameters = computed(() => {
  const groups: Record<number, SelectedNodeGroup> = {}
  selectedParameters.value.forEach(param => {
    if (!groups[param.nodeId]) {
      groups[param.nodeId] = {
        nodeId: param.nodeId,
        nodeTitle: param.nodeTitle,
        parameters: []
      }
    }
    groups[param.nodeId].parameters.push(param)
  })
  
  const groupsArray = Object.values(groups)
  
  // 如果有排序状态，按照排序状态排列
  if (parameterGroupOrder.value.length > 0) {
    return parameterGroupOrder.value
      .map(nodeId => groupsArray.find(group => group.nodeId === nodeId))
      .filter(Boolean) as SelectedNodeGroup[]
  }
  
  return groupsArray
})

const groupedSelectedOutputs = computed(() => {
  const groups: Record<number, { nodeId: number, nodeTitle: string, outputs: SelectedOutput[] }> = {}
  selectedOutputs.value.forEach(output => {
    if (!groups[output.nodeId]) {
      groups[output.nodeId] = {
        nodeId: output.nodeId,
        nodeTitle: output.nodeTitle,
        outputs: []
      }
    }
    groups[output.nodeId].outputs.push(output)
  })
  
  const groupsArray = Object.values(groups)
  
  // 如果有排序状态，按照排序状态排列
  if (outputGroupOrder.value.length > 0) {
    return outputGroupOrder.value
      .map(nodeId => groupsArray.find(group => group.nodeId === nodeId))
      .filter(Boolean) as { nodeId: number, nodeTitle: string, outputs: SelectedOutput[] }[]
  }
  
  return groupsArray
})

// 用于拖拽排序的参数列表
const sortedSelectedParameters = computed({
  get: () => groupedSelectedParameters.value,
  set: (newValue) => {
    // 更新排序状态
    parameterGroupOrder.value = newValue.map(group => group.nodeId)
  }
})

// 用于拖拽排序的输出列表
const sortedSelectedOutputs = computed({
  get: () => groupedSelectedOutputs.value,
  set: (newValue) => {
    // 更新排序状态
    outputGroupOrder.value = newValue.map(group => group.nodeId)
  }
})

/**
 * 隐藏参数选择器
 */
const hideParameterSelector = () => {
  parameterPopover.value?.hide()
  searchQuery.value = ''
}

/**
 * 隐藏输出选择器
 */
const hideOutputSelector = () => {
  outputPopover.value?.hide()
  outputSearchQuery.value = ''
}

/**
 * 参数popover显示事件
 */
const onParameterPopoverShow = () => {
  // 当显示参数选择器时，隐藏输出选择器
  outputPopover.value?.hide()
}

/**
 * 参数popover隐藏事件
 */
const onParameterPopoverHide = () => {
  searchQuery.value = ''
}

/**
 * 输出popover显示事件
 */
const onOutputPopoverShow = () => {
  // 当显示输出选择器时，隐藏参数选择器
  parameterPopover.value?.hide()
}

/**
 * 输出popover隐藏事件
 */
const onOutputPopoverHide = () => {
  outputSearchQuery.value = ''
}

/**
 * 切换节点展开状态（在选择器中）
 */
const toggleNodeInSelector = (nodeId: number) => {
  const node = nodeGroups.value.find(n => n.nodeId === nodeId)
  if (node) {
    node.expanded = !node.expanded
  }
}

/**
 * 检查参数是否已选择
 */
const isParameterSelected = (nodeId: number, paramName: string) => {
  return selectedParameters.value.some(p => p.nodeId === nodeId && p.paramName === paramName)
}

/**
 * 切换参数选择状态
 */
const toggleParameterSelection = (nodeGroup: NodeGroup, param: NodeParameter, selected: boolean) => {
  if (selected) {
    selectedParameters.value.push({
      nodeId: nodeGroup.nodeId,
      nodeTitle: nodeGroup.title,
      paramName: param.name,
      paramDisplayName: param.displayName,
      paramType: param.type,
      currentValue: param.currentValue
    })
    
    // 如果是新节点，添加到排序状态
    if (!parameterGroupOrder.value.includes(nodeGroup.nodeId)) {
      parameterGroupOrder.value.push(nodeGroup.nodeId)
    }
  } else {
    const index = selectedParameters.value.findIndex(p => 
      p.nodeId === nodeGroup.nodeId && p.paramName === param.name
    )
    if (index !== -1) {
      selectedParameters.value.splice(index, 1)
    }
    
    // 如果节点没有参数了，从排序状态中移除
    const hasOtherParams = selectedParameters.value.some(p => p.nodeId === nodeGroup.nodeId && p.paramName !== param.name)
    if (!hasOtherParams) {
      const orderIndex = parameterGroupOrder.value.indexOf(nodeGroup.nodeId)
      if (orderIndex !== -1) {
        parameterGroupOrder.value.splice(orderIndex, 1)
      }
    }
  }
}

/**
 * 移除已选择的参数
 */
const removeSelectedParameter = (selectedParam: SelectedParameter) => {
  const index = selectedParameters.value.findIndex(p => 
    p.nodeId === selectedParam.nodeId && p.paramName === selectedParam.paramName
  )
  if (index !== -1) {
    selectedParameters.value.splice(index, 1)
    
    // 如果节点没有参数了，从排序状态中移除
    const hasOtherParams = selectedParameters.value.some(p => p.nodeId === selectedParam.nodeId)
    if (!hasOtherParams) {
      const orderIndex = parameterGroupOrder.value.indexOf(selectedParam.nodeId)
      if (orderIndex !== -1) {
        parameterGroupOrder.value.splice(orderIndex, 1)
      }
    }
  }
}

/**
 * 检查输出节点是否已选择
 */
const isOutputSelected = (nodeId: number) => {
  return selectedOutputs.value.some(o => o.nodeId === nodeId)
}

/**
 * 切换输出节点选择状态
 */
const toggleOutputSelection = (outputNode: OutputNode) => {
  const index = selectedOutputs.value.findIndex(o => o.nodeId === outputNode.nodeId)
  if (index !== -1) {
    selectedOutputs.value.splice(index, 1)
    // 从排序状态中移除
    const orderIndex = outputGroupOrder.value.indexOf(outputNode.nodeId)
    if (orderIndex !== -1) {
      outputGroupOrder.value.splice(orderIndex, 1)
    }
  } else {
    selectedOutputs.value.push({
      nodeId: outputNode.nodeId,
      nodeTitle: outputNode.title,
      type: outputNode.type,
      description: outputNode.description
    })
    // 添加到排序状态
    if (!outputGroupOrder.value.includes(outputNode.nodeId)) {
      outputGroupOrder.value.push(outputNode.nodeId)
    }
  }
}

/**
 * 移除已选择的输出
 */
const removeSelectedOutput = (selectedOutput: SelectedOutput) => {
  const index = selectedOutputs.value.findIndex(o => o.nodeId === selectedOutput.nodeId)
  if (index !== -1) {
    selectedOutputs.value.splice(index, 1)
  }
}

/**
 * 移除节点的所有输出
 */
const removeAllOutputsFromNode = (nodeId: number) => {
  selectedOutputs.value = selectedOutputs.value.filter(o => o.nodeId !== nodeId)
  // 从排序状态中移除
  const orderIndex = outputGroupOrder.value.indexOf(nodeId)
  if (orderIndex !== -1) {
    outputGroupOrder.value.splice(orderIndex, 1)
  }
}

/**
 * 从工作流中提取节点信息
 */
const extractNodesFromWorkflow = () => {
  const workflowNodes = app.graph?.nodes || []
  
  const extractedNodes: NodeGroup[] = []
  const extractedOutputs: OutputNode[] = []

  // 定义输出节点类型
  const outputNodeTypes = [
    'SaveImage', 
    'PreviewImage', 
    'SaveVideo',
    'SaveAudio',
    'SaveLatent',
    'VHSVideoCombine',
    'SaveAnimatedWEBP',
    'SaveGIF',
    'LoadVideo'
  ]

  workflowNodes.forEach((node: any) => {
    // 检查是否为输出节点
    if (outputNodeTypes.includes(node.type)) {
      extractedOutputs.push({
        nodeId: node.id,
        title: node.title || node.type,
        type: node.type,
        description: getOutputNodeDescription(node.type),
        expanded: false
      })
    }

    // 提取输入参数
    const parameters: NodeParameter[] = []
    
    // 从widgets中提取参数
    if (node.widgets) {
      node.widgets.forEach((widget: any) => {
        if (widget.name && widget.type && isEditableParameter(widget)) {
          parameters.push({
            name: widget.name,
            displayName: widget.displayName,
            type: widget.type,
            currentValue: widget.value
          })
        }
      })
    }

    // 如果节点有可编辑的参数且不是输出节点，添加到节点组
    if (parameters.length > 0 && !outputNodeTypes.includes(node.type)) {
      extractedNodes.push({
        nodeId: node.id,
        title: node.title || node.type,
        type: node.type,
        expanded: false,
        parameters
      })
    }
  })

  nodeGroups.value = extractedNodes
  availableOutputNodes.value = extractedOutputs
}

/**
 * 获取输出节点描述
 */
const getOutputNodeDescription = (nodeType: string): string => {
  const descriptions: Record<string, string> = {
    'SaveImage': '保存图像',
    'PreviewImage': '预览图像',
    'SaveVideo': '保存视频',
    'SaveAudio': '保存音频',
    'SaveLatent': '保存Latent',
    'VHSVideoCombine': '合并视频',
    'SaveAnimatedWEBP': '保存动画WEBP',
    'SaveGIF': '保存GIF',
    'LoadVideo': '加载视频'
  }
  return descriptions[nodeType] || nodeType
}

/**
 * 检查参数是否可编辑
 */
const isEditableParameter = (widget: any): boolean => {
  // 排除一些不需要用户配置的参数
  const excludeTypes = ['button', 'info']
  const excludeNames = ['upload', 'clear', 'load_default']
  
  return !excludeTypes.includes(widget.type) && 
         !excludeNames.includes(widget.name?.toLowerCase())
}

/**
 * 获取参数显示名称
 */
const getParameterDisplayName = (paramName: string): string => {
  const nameMap: Record<string, string> = {
    'seed': '随机种',
    'steps': '步数',
    'cfg': 'CFG',
    'sampler_name': '采样器',
    'scheduler': '调度器',
    'denoise': '降噪',
    'ckpt_name': 'Checkpoint名称',
    'width': '宽度',
    'height': '高度',
    'batch_size': '批次大小',
    'text': '文本',
    'clip': 'CLIP',
    'positive': '正面提示词',
    'negative': '负面提示词'
  }
  return nameMap[paramName] || paramName
}

/**
 * 移除所有节点参数
 */
const removeAllNodeParameters = (nodeId: number) => {
  selectedParameters.value = selectedParameters.value.filter(p => p.nodeId !== nodeId)
  // 从排序状态中移除
  const orderIndex = parameterGroupOrder.value.indexOf(nodeId)
  if (orderIndex !== -1) {
    parameterGroupOrder.value.splice(orderIndex, 1)
  }
}

/**
 * 切换输出节点展开状态（在选择器中）
 */
const toggleOutputNodeInSelector = (nodeId: number) => {
  const node = availableOutputNodes.value.find(n => n.nodeId === nodeId)
  if (node) {
    node.expanded = !node.expanded
  }
}

// 组件挂载时提取节点信息
onMounted(() => {
  extractNodesFromWorkflow()
})
</script>

<style scoped>
.ai-app-edit-panel-container {
  width: 400px;
  height: calc(100vh - 48px);
  background: var(--comfy-color-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  height:64px;
  border-bottom: 1px solid var(--border-color);
  background: var(--comfy-color-bg);
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--comfy-color-text);
}

.tutorial-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--comfy-color-text);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.tutorial-btn:hover {
  background: var(--comfy-color-bg-hover);
}

.close-btn {
  padding: 8px;
  background: transparent;
  border: none;
  color: var(--comfy-color-text);
  cursor: pointer;
  font-size: 16px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--comfy-color-bg-hover);
}

.panel-content {
  height: calc(100% - 65px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  box-sizing: border-box;
}

.parameter-section {
    display: flex;
    max-height: calc(100% - 200px);
    flex-direction: column;
}

.section-header {
    width: 100%;
  margin-bottom: 8px;
}

.select-params-btn,
.select-output-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: var(--comfy-color-bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--comfy-color-text);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.select-params-btn:hover,
.select-output-btn:hover {
  background: var(--comfy-color-bg-dark);
}

.section-description {
  font-size: 12px;
  color: var(--comfy-color-text-secondary);
  margin: 8px 0 16px 0;
  line-height: 1.4;
}

.selected-parameters {
  flex:1;
  overflow-y: auto;
  padding-right: 5px;
  box-sizing: border-box;
}

.selected-node-group {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 12px;
  overflow: hidden;
}

.node-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--comfy-color-bg-hover);
}

.node-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--comfy-color-text);
  font-size: 14px;
}

.node-group-title i {
  font-size: 12px;
  color: var(--comfy-color-text-secondary);
}

.remove-node-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--comfy-color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.remove-node-btn:hover {
  background: var(--comfy-color-bg-dark);
  color: var(--comfy-color-text);
}

.node-group-parameters {
  padding: 0px 16px 12px 16px;
  background: var(--comfy-color-bg);
}

.selected-parameter-item {
  padding: 4px 0;
  border-bottom: 1px solid var(--border-color-light);
}

.selected-parameter-item:last-child {
  border-bottom: none;
}

.parameter-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.parameter-label {
  font-size: 12px;
  color: var(--comfy-color-text-secondary);
  font-weight: 500;
  margin: 0;
}

.parameter-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.parameter-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--comfy-color-bg-hover);
  color: var(--comfy-color-text);
  font-size: 13px;
  font-family: monospace;
}

.parameter-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.remove-param-btn {
  padding: 2px 6px;
  background: transparent;
  border: none;
  color: var(--comfy-color-text-secondary);
  cursor: pointer;
  border-radius: 3px;
  font-size: 12px;
  transition: all 0.2s;
}

.remove-param-btn:hover {
  background: var(--comfy-color-bg-hover);
  color: var(--comfy-color-text);
}

.output-section {
  height:200px;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
}

.selected-outputs {
  flex:1;
  overflow-y: auto;
  padding-right: 5px;
  box-sizing: border-box;
}



/* 拖拽相关样式 */
.drag-handle {
  cursor: grab;
  color: var(--comfy-color-text-secondary);
  margin-right: 8px;
  transition: color 0.2s;
}

.drag-handle:hover {
  color: var(--primary-color);
}

.drag-handle:active {
  cursor: grabbing;
}

.ghost {
  opacity: 0.5;
  background: var(--comfy-color-bg-hover);
}

.chosen {
  background: var(--comfy-color-bg-hover);
}

.drag {
  transform: rotate(5deg);
  opacity: 0.8;
}

/* CSS变量定义 */
:root {
  --border-color: #e1e5e9;
  --border-color-light: #f1f3f4;
  --error-color: #ef4444;
}

.dark-theme {
  --border-color: #374151;
  --border-color-light: #4b5563;
}

.popover-container {
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--comfy-color-bg-hover);
}

.popover-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--comfy-color-text);
}

.close-popover-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: var(--comfy-color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-popover-btn:hover {
  background: var(--comfy-color-bg-hover);
  color: var(--comfy-color-text);
}

.popover-content {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--comfy-color-bg);
}

.search-box {
  position: relative;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.search-box .pi-search {
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--comfy-color-text-secondary);
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--comfy-color-bg);
  color: var(--comfy-color-text);
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.node-list,
.output-node-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  max-height: 60%;
}

.node-group-selector {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 8px;
  overflow: hidden;
}

.node-header-selector {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--comfy-color-bg-hover);
  cursor: pointer;
  transition: background 0.2s;
}

.node-header-selector:hover {
  background: var(--comfy-color-bg-dark);
}

.node-header-selector .expand-icon {
  margin-right: 8px;
  font-size: 12px;
  color: var(--comfy-color-text-secondary);
}

.node-title-selector {
  flex: 1;
  font-weight: 500;
  color: var(--comfy-color-text);
}

.node-parameters-selector {
  padding: 0px 16px 12px 16px;
  background: var(--comfy-color-bg);
}

.parameter-item-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color-light);
}

.parameter-item-selector:last-child {
  border-bottom: none;
}

.parameter-checkbox-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
}

.parameter-checkbox-selector input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
}

.parameter-name-selector {
  color: var(--comfy-color-text);
  font-size: 14px;
}

.parameter-value-selector {
  font-size: 14px;
  color: var(--comfy-color-text-secondary);
  font-family: monospace;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.output-node-group-selector {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 8px;
  overflow: hidden;
}

.output-node-header-selector {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--comfy-color-bg-hover);
  cursor: pointer;
  transition: background 0.2s;
}

.output-node-header-selector:hover {
  background: var(--comfy-color-bg-dark);
}

.output-node-header-selector .expand-icon {
  margin-right: 8px;
  font-size: 12px;
  color: var(--comfy-color-text-secondary);
}

.output-node-title-selector {
  flex: 1;
  font-weight: 500;
  color: var(--comfy-color-text);
}

.output-node-details-selector {
  padding: 0px 16px 12px 16px;
  background: var(--comfy-color-bg);
}

.output-node-item-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color-light);
}

.output-node-item-selector:last-child {
  border-bottom: none;
}

.output-checkbox-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
}

.output-checkbox-selector input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
}

.output-item-name {
  color: var(--comfy-color-text);
  font-size: 14px;
}

.selection-check {
  color: var(--primary-color);
  font-size: 16px;
}

.output-description {
  font-size: 12px;
  color: var(--comfy-color-text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.4;
}

/* 自定义滚动条样式 */
.node-list::-webkit-scrollbar,
.output-node-list::-webkit-scrollbar,
.selected-parameters::-webkit-scrollbar,
.selected-outputs::-webkit-scrollbar {
  width: 8px;
}

.node-list::-webkit-scrollbar-track,
.output-node-list::-webkit-scrollbar-track,
.selected-parameters::-webkit-scrollbar-track,
.selected-outputs::-webkit-scrollbar-track {
  background: var(--comfy-color-bg-hover);
  border-radius: 4px;
  margin: 4px 0;
}

.node-list::-webkit-scrollbar-thumb,
.output-node-list::-webkit-scrollbar-thumb,
.selected-parameters::-webkit-scrollbar-thumb,
.selected-outputs::-webkit-scrollbar-thumb {
  background: var(--comfy-color-text-secondary);
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.node-list::-webkit-scrollbar-thumb:hover,
.output-node-list::-webkit-scrollbar-thumb:hover,
.selected-parameters::-webkit-scrollbar-thumb:hover,
.selected-outputs::-webkit-scrollbar-thumb:hover {
  background: var(--comfy-color-text);
  opacity: 0.8;
}

.node-list::-webkit-scrollbar-thumb:active,
.output-node-list::-webkit-scrollbar-thumb:active,
.selected-parameters::-webkit-scrollbar-thumb:active,
.selected-outputs::-webkit-scrollbar-thumb:active {
  background: var(--primary-color);
  opacity: 1;
}

/* Firefox 滚动条样式 */
.node-list,
.output-node-list,
.selected-parameters,
.selected-outputs {
  scrollbar-width: thin;
  scrollbar-color: var(--comfy-color-text-secondary) var(--comfy-color-bg-hover);
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  .node-list::-webkit-scrollbar-track,
  .output-node-list::-webkit-scrollbar-track,
  .selected-parameters::-webkit-scrollbar-track,
  .selected-outputs::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .node-list::-webkit-scrollbar-thumb,
  .output-node-list::-webkit-scrollbar-thumb,
  .selected-parameters::-webkit-scrollbar-thumb,
  .selected-outputs::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .node-list::-webkit-scrollbar-thumb:hover,
  .output-node-list::-webkit-scrollbar-thumb:hover,
  .selected-parameters::-webkit-scrollbar-thumb:hover,
  .selected-outputs::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
}
</style>