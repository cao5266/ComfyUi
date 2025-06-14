<template>
    <div class="workflow-preview-container">
        <div class="workflow-header">
            <div class="workflow-info">
                <h3 class="workflow-title">{{ $t('createAiApp.workflowPreview') }}</h3>
                <div class="workflow-stats">
                    <span class="stat-item">
                        <i class="pi pi-sitemap"></i>
                        {{ nodeCount }} {{ $t('createAiApp.nodes') }}
                    </span>
                    <span class="stat-item">
                        <i class="pi pi-arrow-right-arrow-left"></i>
                        {{ linkCount }} {{ $t('createAiApp.connections') }}
                    </span>
                </div>
            </div>
            <div class="workflow-actions">
                <Button
                    :icon="showPreview ? 'pi pi-eye-slash' : 'pi pi-eye'"
                    :label="showPreview ? $t('createAiApp.hidePreview') : $t('createAiApp.preview')"
                    severity="secondary"
                    size="small"
                    @click="togglePreview"
                />
                <Button
                    icon="pi pi-trash"
                    :label="$t('common.remove')"
                    severity="danger"
                    size="small"
                    outlined
                    @click="$emit('remove-file')"
                />
            </div>
        </div>

        <!-- 工作流可视化预览 -->
        <div v-show="showPreview" class="workflow-canvas-container">
            <div class="canvas-toolbar">
                <div class="zoom-controls">
                    <Button
                        icon="pi pi-minus"
                        severity="secondary"
                        size="small"
                        @click="zoomOut"
                    />
                    <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
                    <Button
                        icon="pi pi-plus"
                        severity="secondary"
                        size="small"
                        @click="zoomIn"
                    />
                    <Button
                        icon="pi pi-refresh"
                        severity="secondary"
                        size="small"
                        @click="resetView"
                        :label="$t('createAiApp.resetView')"
                    />
                </div>
            </div>

            <!-- 真正的 LiteGraph 画布 -->
            <canvas
                ref="canvasRef"
                class="workflow-canvas"
                tabindex="1"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import { LGraph, LGraphCanvas, LGraphNode, LiteGraph } from '@comfyorg/litegraph'

// Props 定义
interface Props {
    fileName?: string
    nodeCount?: number
}

const props = withDefaults(defineProps<Props>(), {
    fileName: '',
    nodeCount: 0
})

// Emits 定义
const emit = defineEmits<{
    'remove-file': []
}>()

const { t } = useI18n()

// 响应式数据
const showPreview = ref(true)
const zoomLevel = ref(1)
const canvasRef = ref<HTMLCanvasElement>()

// LiteGraph 相关
let graph: LGraph | null = null
let canvas: LGraphCanvas | null = null

// 工作流数据 - 从 default.json 中获取
const workflowData = {
    "last_node_id": 9,
    "last_link_id": 9,
    "nodes": [
        {
            "id": 4,
            "type": "CheckpointLoaderSimple",
            "pos": [50, 200],
            "size": [320, 110],
            "flags": {},
            "order": 0,
            "mode": 0,
            "outputs": [
                {
                    "name": "MODEL",
                    "type": "MODEL",
                    "links": [1],
                    "slot_index": 0
                },
                {
                    "name": "CLIP",
                    "type": "CLIP",
                    "links": [3, 5],
                    "slot_index": 1
                },
                {
                    "name": "VAE",
                    "type": "VAE",
                    "links": [8],
                    "slot_index": 2
                }
            ],
            "properties": {},
            "widgets_values": ["v1-5-pruned-emaonly-fp16.safetensors"]
        },
        {
            "id": 6,
            "type": "CLIPTextEncode",
            "pos": [420, 80],
            "size": [400, 140],
            "flags": {},
            "order": 2,
            "mode": 0,
            "inputs": [
                {
                    "name": "clip",
                    "type": "CLIP",
                    "link": 3
                }
            ],
            "outputs": [
                {
                    "name": "CONDITIONING",
                    "type": "CONDITIONING",
                    "links": [4],
                    "slot_index": 0
                }
            ],
            "properties": {},
            "widgets_values": ["beautiful scenery nature glass bottle landscape, purple galaxy bottle"]
        },
        {
            "id": 7,
            "type": "CLIPTextEncode",
            "pos": [420, 260],
            "size": [400, 140],
            "flags": {},
            "order": 3,
            "mode": 0,
            "inputs": [
                {
                    "name": "clip",
                    "type": "CLIP",
                    "link": 5
                }
            ],
            "outputs": [
                {
                    "name": "CONDITIONING",
                    "type": "CONDITIONING",
                    "links": [6],
                    "slot_index": 0
                }
            ],
            "properties": {},
            "widgets_values": ["text, watermark"]
        },
        {
            "id": 5,
            "type": "EmptyLatentImage",
            "pos": [420, 440],
            "size": [320, 110],
            "flags": {},
            "order": 1,
            "mode": 0,
            "outputs": [
                {
                    "name": "LATENT",
                    "type": "LATENT",
                    "links": [2],
                    "slot_index": 0
                }
            ],
            "properties": {},
            "widgets_values": [512, 512, 1]
        },
        {
            "id": 3,
            "type": "KSampler",
            "pos": [880, 160],
            "size": [320, 280],
            "flags": {},
            "order": 4,
            "mode": 0,
            "inputs": [
                {
                    "name": "model",
                    "type": "MODEL",
                    "link": 1
                },
                {
                    "name": "positive",
                    "type": "CONDITIONING",
                    "link": 4
                },
                {
                    "name": "negative",
                    "type": "CONDITIONING",
                    "link": 6
                },
                {
                    "name": "latent_image",
                    "type": "LATENT",
                    "link": 2
                }
            ],
            "outputs": [
                {
                    "name": "LATENT",
                    "type": "LATENT",
                    "links": [7],
                    "slot_index": 0
                }
            ],
            "properties": {},
            "widgets_values": [156680208700286, true, 20, 8, "euler", "normal", 1]
        },
        {
            "id": 8,
            "type": "VAEDecode",
            "pos": [1260, 200],
            "size": [220, 80],
            "flags": {},
            "order": 5,
            "mode": 0,
            "inputs": [
                {
                    "name": "samples",
                    "type": "LATENT",
                    "link": 7
                },
                {
                    "name": "vae",
                    "type": "VAE",
                    "link": 8
                }
            ],
            "outputs": [
                {
                    "name": "IMAGE",
                    "type": "IMAGE",
                    "links": [9],
                    "slot_index": 0
                }
            ],
            "properties": {}
        },
        {
            "id": 9,
            "type": "SaveImage",
            "pos": [1540, 200],
            "size": [220, 60],
            "flags": {},
            "order": 6,
            "mode": 0,
            "inputs": [
                {
                    "name": "images",
                    "type": "IMAGE",
                    "link": 9
                }
            ],
            "properties": {}
        }
    ],
    "links": [
        [1, 4, 0, 3, 0, "MODEL"],
        [2, 5, 0, 3, 3, "LATENT"],
        [3, 4, 1, 6, 0, "CLIP"],
        [4, 6, 0, 3, 1, "CONDITIONING"],
        [5, 4, 1, 7, 0, "CLIP"],
        [6, 7, 0, 3, 2, "CONDITIONING"],
        [7, 3, 0, 8, 0, "LATENT"],
        [8, 4, 2, 8, 1, "VAE"],
        [9, 8, 0, 9, 0, "IMAGE"]
    ],
    "groups": [],
    "config": {},
    "extra": {},
    "version": 0.4
}

// 计算属性
const linkCount = computed(() => workflowData.links.length)

// 方法
const togglePreview = async () => {
    showPreview.value = !showPreview.value
    if (showPreview.value) {
        await nextTick()
        if (!canvas) {
            initCanvas()
        }
    }
}

const zoomIn = () => {
    if (canvas) {
        canvas.ds.scale *= 1.1
        canvas.setDirty(true, true)
        zoomLevel.value = canvas.ds.scale
    }
}

const zoomOut = () => {
    if (canvas) {
        canvas.ds.scale *= 0.9
        canvas.setDirty(true, true)
        zoomLevel.value = canvas.ds.scale
    }
}

const resetView = () => {
    if (canvas) {
        canvas.ds.scale = 1
        canvas.ds.offset = [0, 0]
        canvas.setDirty(true, true)
        zoomLevel.value = 1
        fitView()
    }
}

const initCanvas = () => {
    if (!canvasRef.value) return

    try {
        // 注册节点类型
        registerNodeTypes()
        
        // 创建图形
        graph = new LGraph()
        
        // 创建画布
        canvas = new LGraphCanvas(canvasRef.value, graph)
        
        // 设置为只读模式
        canvas.read_only = true
        canvas.allow_interaction = false
        canvas.allow_dragcanvas = true
        canvas.allow_dragnodes = false
        canvas.allow_reconnect_links = false
        canvas.render_canvas_border = false
        
        // 禁用右键菜单
        // @ts-ignore - LiteGraph canvas 类型定义可能不完整
        canvas.onContextMenu = () => false
        
        // 加载工作流数据
        loadWorkflow()
        
        // 启动图形
        graph.start()
        
        // 调整画布大小
        resizeCanvas()
        
        // 适应视图
        setTimeout(() => {
            fitView()
        }, 100)
        
    } catch (error) {
        console.error('Failed to initialize canvas:', error)
    }
}

const registerNodeTypes = () => {
    // 注册具体的节点类型，包含正确的输入输出和参数
    
    // CheckpointLoaderSimple 节点
    if (!LiteGraph.registered_node_types['CheckpointLoaderSimple']) {
        class CheckpointLoaderSimple extends LGraphNode {
            constructor() {
                super()
                this.title = 'CheckpointLoaderSimple'
                this.size = [320, 110]
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addOutput('MODEL', 'MODEL')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addOutput('CLIP', 'CLIP')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addOutput('VAE', 'VAE')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('combo', 'ckpt_name', 'v1-5-pruned-emaonly-fp16.safetensors', null, {
                    values: ['v1-5-pruned-emaonly-fp16.safetensors']
                })
            }
        }
        LiteGraph.registerNodeType('CheckpointLoaderSimple', CheckpointLoaderSimple)
    }
    
    // CLIPTextEncode 节点
    if (!LiteGraph.registered_node_types['CLIPTextEncode']) {
        class CLIPTextEncode extends LGraphNode {
            constructor() {
                super()
                this.title = 'CLIPTextEncode'
                this.size = [400, 200]
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addInput('clip', 'CLIP')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addOutput('CONDITIONING', 'CONDITIONING')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('text', 'text', 'beautiful scenery nature glass bottle landscape, purple galaxy bottle')
            }
        }
        LiteGraph.registerNodeType('CLIPTextEncode', CLIPTextEncode)
    }
    
    // EmptyLatentImage 节点
    if (!LiteGraph.registered_node_types['EmptyLatentImage']) {
        class EmptyLatentImage extends LGraphNode {
            constructor() {
                super()
                this.title = 'EmptyLatentImage'
                this.size = [320, 110]
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addOutput('LATENT', 'LATENT')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('number', 'width', 512)
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('number', 'height', 512)
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('number', 'batch_size', 1)
            }
        }
        LiteGraph.registerNodeType('EmptyLatentImage', EmptyLatentImage)
    }
    
    // KSampler 节点
    if (!LiteGraph.registered_node_types['KSampler']) {
        class KSampler extends LGraphNode {
            constructor() {
                super()
                this.title = 'KSampler'
                this.size = [320, 280]
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addInput('model', 'MODEL')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addInput('positive', 'CONDITIONING')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addInput('negative', 'CONDITIONING')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addInput('latent_image', 'LATENT')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addOutput('LATENT', 'LATENT')
                
                // 添加参数控件
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('number', 'seed', 156680208700286)
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('combo', 'control_after_generate', 'randomize', null, {
                    values: ['randomize', 'increment', 'decrement', 'fixed']
                })
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('number', 'steps', 20)
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('number', 'cfg', 8.0)
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('combo', 'sampler_name', 'euler', null, {
                    values: ['euler', 'euler_ancestral', 'heun', 'dpm_2', 'dpm_2_ancestral']
                })
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('combo', 'scheduler', 'normal', null, {
                    values: ['normal', 'karras', 'exponential', 'sgm_uniform', 'simple']
                })
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('number', 'denoise', 1.00)
            }
        }
        LiteGraph.registerNodeType('KSampler', KSampler)
    }
    
    // VAEDecode 节点
    if (!LiteGraph.registered_node_types['VAEDecode']) {
        class VAEDecode extends LGraphNode {
            constructor() {
                super()
                this.title = 'VAEDecode'
                this.size = [220, 80]
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addInput('samples', 'LATENT')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addInput('vae', 'VAE')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addOutput('IMAGE', 'IMAGE')
            }
        }
        LiteGraph.registerNodeType('VAEDecode', VAEDecode)
    }
    
    // SaveImage 节点
    if (!LiteGraph.registered_node_types['SaveImage']) {
        class SaveImage extends LGraphNode {
            constructor() {
                super()
                this.title = 'SaveImage'
                this.size = [220, 60]
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addInput('images', 'IMAGE')
                // @ts-ignore - LiteGraph 方法类型定义可能不完整
                this.addWidget('text', 'filename_prefix', 'ComfyUI')
            }
        }
        LiteGraph.registerNodeType('SaveImage', SaveImage)
    }
}

const loadWorkflow = () => {
    if (!graph) return
    
    try {
        // 清空现有图形
        graph.clear()
        
        // 配置图形 - 使用 @ts-ignore 忽略类型检查
        // @ts-ignore - workflowData 格式与 LiteGraph 兼容
        graph.configure(workflowData)
        
        // 设置节点属性和参数值
        for (const node of graph.nodes) {
            // 设置节点为只读
            node.flags = node.flags || {}
            node.flags.collapsed = false
            
            // 禁用节点交互 - 使用 @ts-ignore 忽略类型检查
            // @ts-ignore - LiteGraph 节点方法可能不在类型定义中
            node.onMouseDown = () => false
            // @ts-ignore - LiteGraph 节点方法可能不在类型定义中
            node.onMouseUp = () => false
            // @ts-ignore - LiteGraph 节点方法可能不在类型定义中
            node.onMouseMove = () => false
            
            // 根据工作流数据设置 widget 值
            const nodeData = workflowData.nodes.find(n => n.id === node.id)
            if (nodeData && nodeData.widgets_values && node.widgets && node.widgets.length > 0) {
                nodeData.widgets_values.forEach((value, index) => {
                    if (node.widgets && node.widgets[index]) {
                        node.widgets[index].value = value
                    }
                })
            }
            
            // 强制更新节点显示
            node.setDirtyCanvas(true, true)
        }
        
        // 强制重绘画布
        if (canvas) {
            canvas.setDirty(true, true)
        }
        
    } catch (error) {
        console.error('Failed to load workflow:', error)
    }
}

const resizeCanvas = () => {
    if (!canvasRef.value || !canvas) return
    
    const container = canvasRef.value.parentElement
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    canvasRef.value.width = rect.width
    canvasRef.value.height = rect.height
    
    canvas.resize()
}

const fitView = () => {
    if (!canvas || !graph || graph.nodes.length === 0) return
    
    // 计算所有节点的边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    
    for (const node of graph.nodes) {
        const [x, y] = node.pos
        const [w, h] = node.size
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x + w)
        maxY = Math.max(maxY, y + h)
    }
    
    if (minX !== Infinity) {
        const padding = 50
        const bounds = [
            minX - padding,
            minY - padding,
            maxX - minX + padding * 2,
            maxY - minY + padding * 2
        ] as [number, number, number, number]
        
        // @ts-ignore - LiteGraph fitToBounds 方法可能有类型问题
        canvas.ds.fitToBounds(bounds)
        canvas.setDirty(true, true)
        zoomLevel.value = canvas.ds.scale
    }
}

onMounted(() => {
    // 确保 LiteGraph 已初始化
    if (typeof LiteGraph === 'undefined') {
        console.error('LiteGraph is not available')
        return
    }
    
    // 如果预览默认显示，立即初始化画布
    if (showPreview.value) {
        nextTick(() => {
            initCanvas()
        })
    }
})

onUnmounted(() => {
    if (graph) {
        graph.stop()
        graph = null
    }
    if (canvas) {
        canvas = null
    }
})
</script>

<style scoped>
.workflow-preview-container {
    background: var(--p-surface-0);
    border: 2px solid var(--p-surface-200);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.workflow-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--p-surface-50);
    border-bottom: 1px solid var(--p-surface-200);
}

.workflow-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.workflow-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--p-surface-900);
    margin: 0;
}

.workflow-stats {
    display: flex;
    gap: 20px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--p-surface-600);
}

.stat-item i {
    font-size: 12px;
    color: var(--p-primary-500);
}

.workflow-actions {
    display: flex;
    gap: 8px;
}

.workflow-canvas-container {
    background: var(--p-surface-25);
    border-top: 1px solid var(--p-surface-200);
    height: 500px;
    overflow: hidden;
    position: relative;
}

.canvas-toolbar {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--p-surface-300);
}

.zoom-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.zoom-level {
    font-size: 12px;
    font-weight: 500;
    color: var(--p-surface-700);
    min-width: 40px;
    text-align: center;
}

.workflow-canvas {
    width: 100%;
    height: 100%;
    display: block;
    outline: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .workflow-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .workflow-stats {
        flex-direction: column;
        gap: 8px;
    }

    .workflow-canvas-container {
        height: 400px;
    }

    .canvas-toolbar {
        position: relative;
        top: 0;
        right: 0;
        margin: 16px;
    }
}

/* 夜间模式 */
.dark .workflow-preview-container {
    background: var(--p-surface-800);
    border-color: var(--p-surface-600);
}

.dark .workflow-header {
    background: var(--p-surface-700);
    border-bottom-color: var(--p-surface-600);
}

.dark .canvas-toolbar {
    background: rgba(0, 0, 0, 0.8);
    border-color: var(--p-surface-500);
}

.dark .zoom-level {
    color: #ccc;
}
</style> 