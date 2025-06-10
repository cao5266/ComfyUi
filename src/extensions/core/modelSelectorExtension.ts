import { app } from '@/scripts/app'
import { useModelSelectorService } from '@/services/modelSelectorService'
import type { ModelInfo } from '@/types/model'

console.log('🚀 Model Selector Extension - File loaded!')

const { showModelSelector } = useModelSelectorService()

// 扩展注册
app.registerExtension({
  name: 'Comfy.ModelSelectorExtension',

  init() {
    console.log('🎯 Model Selector Extension - Init called!')
  },

  beforeRegisterNodeDef(nodeType: any, nodeData: any) {
    console.log('🔍 Checking node type:', nodeData.name)

    // 检查是否是 checkpoint 相关节点
    if (nodeData.name && nodeData.name.includes('Checkpoint')) {
      console.log('✅ Found checkpoint node definition:', nodeData.name)

      // 保存原始的 onAdded 方法
      const origOnAdded = nodeType.prototype.onAdded

      nodeType.prototype.onAdded = function () {
        console.log('📝 Checkpoint node added to canvas:', this.type)

        // 调用原始方法
        const result = origOnAdded?.apply(this, arguments)

        // 延迟处理 widgets
        setTimeout(() => {
          console.log('🔧 Processing widgets for node:', this.type)

          if (this.widgets) {
            console.log('📋 Node has', this.widgets.length, 'widgets')

            this.widgets.forEach((widget: any, index: number) => {
              console.log(
                `🎮 Widget ${index}:`,
                widget.name,
                widget.type,
                'value:',
                widget.value
              )

              if (widget.type === 'combo') {
                // 检查是否是 checkpoint 相关的 widget
                const isCheckpointWidget =
                  widget.name &&
                  (widget.name.includes('ckpt_name') ||
                    widget.name.includes('checkpoint') ||
                    widget.name.includes('model_name'))

                if (isCheckpointWidget) {
                  console.log(
                    '🎯 Found checkpoint widget, applying minimal interception...'
                  )

                  // 保存原始方法
                  const originalCallback = widget.callback
                  const originalMouse = widget.mouse

                  // 只重写鼠标处理，保持其他功能不变
                  widget.mouse = function (event: any, pos: any, node: any) {
                    console.log(
                      '🖱️ Checkpoint widget mouse event:',
                      event.type,
                      event.button
                    )

                    // 拦截所有可能触发下拉菜单的左键事件
                    if (
                      event.button === 0 &&
                      (event.type === 'pointerdown' ||
                        event.type === 'pointerup' ||
                        event.type === 'mousedown' ||
                        event.type === 'mouseup' ||
                        event.type === 'click')
                    ) {
                      console.log(
                        '🎉 Intercepting mouse event for checkpoint widget!',
                        event.type
                      )

                      // 显示自定义模型选择器
                      showModelSelector({
                        title: '选择检查点模型',
                        onSelect: (selectedModel: ModelInfo) => {
                          console.log('✅ Model selected:', selectedModel.name)
                          widget.value = selectedModel.name
                          if (originalCallback) {
                            originalCallback.call(widget, selectedModel.name)
                          }
                          app.canvas.setDirty(true)
                        }
                      })

                      // 阻止默认下拉菜单
                      return true
                    }

                    // 其他所有事件都正常处理
                    if (originalMouse) {
                      return originalMouse.call(this, event, pos, node)
                    }

                    return false
                  }
                }

                // 为所有 combo widget 添加右键菜单选项
                const originalGetContextMenu = widget.getContextMenu
                widget.getContextMenu = function () {
                  const menu = originalGetContextMenu?.call(this) || []

                  // 添加自定义选项
                  menu.push({
                    content: '🔍 浏览模型...',
                    callback: () => {
                      showModelSelector({
                        title: '选择检查点模型',
                        onSelect: (selectedModel: ModelInfo) => {
                          widget.value = selectedModel.name
                          if (widget.callback) {
                            widget.callback(selectedModel.name)
                          }
                          app.canvas.setDirty(true)
                        }
                      })
                    }
                  })

                  return menu
                }
              }
            })
          }
        }, 100) // 减少延迟

        return result
      }
    }
  }
})
