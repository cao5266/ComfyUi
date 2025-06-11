import { t } from '@/i18n'
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

    // 添加全局测试函数
    if (typeof window !== 'undefined') {
      ;(window as any).testModelSelector = () => {
        console.log('🧪 Testing model selector...')
        try {
          const result = showModelSelector({
            title: t('g.selectCheckpointModel'),
            onSelect: (selectedModel: ModelInfo) => {
              console.log('✅ Test model selected:', selectedModel.displayName)
            }
          })
          console.log('📋 Test result:', result)
        } catch (error) {
          console.error('❌ Test error:', error)
        }
      }
      console.log('🧪 Added window.testModelSelector() for testing')
    }
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

                  // 标记这个widget为被拦截的
                  widget._isIntercepted = true

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

                    // 拦截左键点击事件
                    if (event.button === 0) {
                      console.log(
                        '🎉 Intercepting left click for checkpoint widget!',
                        event.type
                      )

                      // 阻止默认行为和事件传播
                      event.preventDefault()
                      event.stopPropagation()
                      event.stopImmediatePropagation()

                      // 显示自定义模型选择器
                      console.log('🚀 Showing model selector...')
                      try {
                        const result = showModelSelector({
                          title: t('g.selectCheckpointModel'),
                          onSelect: (selectedModel: ModelInfo) => {
                            console.log(
                              '✅ Model selected:',
                              selectedModel.displayName
                            )
                            widget.value = selectedModel.displayName
                            if (originalCallback) {
                              originalCallback.call(
                                widget,
                                selectedModel.displayName
                              )
                            }
                            app.canvas.setDirty(true)
                          }
                        })
                        console.log('📋 showModelSelector result:', result)
                      } catch (error) {
                        console.error('❌ Error showing model selector:', error)
                      }

                      // 完全阻止进一步处理
                      return true
                    }

                    // 其他所有事件都正常处理
                    if (originalMouse) {
                      return originalMouse.call(this, event, pos, node)
                    }

                    return false
                  }

                  // 重写 onMouseDown 来阻止默认的 combo 行为
                  const originalOnMouseDown = widget.onMouseDown
                  widget.onMouseDown = function (event: any) {
                    if (event.button === 0) {
                      console.log('🚫 Blocking default combo onMouseDown')
                      // 显示自定义模型选择器
                      showModelSelector({
                        title: t('g.selectCheckpointModel'),
                        onSelect: (selectedModel: ModelInfo) => {
                          console.log(
                            '✅ Model selected via onMouseDown:',
                            selectedModel.displayName
                          )
                          widget.value = selectedModel.displayName
                          if (originalCallback) {
                            originalCallback.call(
                              widget,
                              selectedModel.displayName
                            )
                          }
                          app.canvas.setDirty(true)
                        }
                      })
                      return true // 阻止默认处理
                    }

                    // 其他按钮正常处理
                    if (originalOnMouseDown) {
                      return originalOnMouseDown.call(this, event)
                    }
                    return false
                  }

                  // 重写 combo 的点击处理
                  if (widget.options && widget.options.values) {
                    // 备份原始选项
                    widget._originalOptions = [...widget.options.values]
                  }

                  // 重写 widget 的属性以阻止默认下拉显示
                  Object.defineProperty(widget, 'options', {
                    get: function () {
                      // 返回空选项来阻止下拉菜单显示
                      return { values: [] }
                    },
                    set: function (value) {
                      // 保存真实选项但不显示
                      this._realOptions = value
                    }
                  })
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
                        title: t('g.selectCheckpointModel'),
                        onSelect: (selectedModel: ModelInfo) => {
                          widget.value = selectedModel.displayName
                          if (widget.callback) {
                            widget.callback(selectedModel.displayName)
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
