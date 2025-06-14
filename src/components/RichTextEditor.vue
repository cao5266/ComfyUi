<template>
    <div class="wang-editor-container">
        <Toolbar 
            :editor="editorRef" 
            :default-config="toolbarConfig" 
            mode="default" 
        />
        <Editor 
            v-model="html" 
            :default-config="editorConfig" 
            mode="default" 
            @on-created="handleCreated"
            @on-change="handleChange"
            @on-destroyed="handleDestroyed"
        />
    </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css'
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

// 简化类型定义
interface Props {
    modelValue?: string
    placeholder?: string
    height?: string
    disabled?: boolean
}

interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '请输入内容...',
    height: '300px',
    disabled: false
})

const emit = defineEmits<Emits>()

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
const html = ref(props.modelValue)

// 工具栏配置
const toolbarConfig = {
    excludeKeys: [
        'fullScreen'  // 排除全屏功能
    ],
    toolbarKeys: [
        'headerSelect',
        '|',
        'bold',
        'italic', 
        'underline',
        '|',
        'color',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'insertLink',
        'uploadImage',
        '|',
        'undo',
        'redo'
    ]
}

// 编辑器配置
const editorConfig = {
    placeholder: props.placeholder,
    readOnly: props.disabled,
    autoFocus: false,
    scroll: true,
    MENU_CONF: {
        // 配置上传图片
        uploadImage: {
            server: '/api/upload-image', // 上传接口地址
            fieldName: 'file',
            maxFileSize: 5 * 1024 * 1024, // 5M
            allowedFileTypes: ['image/*'],
            metaWithUrl: false,
            withCredentials: true,
            timeout: 15 * 1000, // 15秒
            // 自定义上传
            customUpload: (file: File, insertFn: Function) => {
                // 这里可以自定义上传逻辑
                console.log('自定义上传', file)
                // 示例：直接插入一个临时URL
                const tempUrl = URL.createObjectURL(file)
                insertFn(tempUrl, file.name, tempUrl)
            }
        },
        // 配置颜色
        color: {
            colors: [
                '#000000', '#ffffff', '#eeece0', '#1c487f', '#4d80bf',
                '#c24f4a', '#8baa4a', '#7b5ba1', '#46acc8', '#f9963b'
            ]
        },
        // 配置字体
        fontFamily: {
            fontFamilyList: [
                'Arial',
                'Tahoma',
                'Verdana',
                '微软雅黑',
                '宋体',
                '黑体',
                '楷体',
                '隶书'
            ]
        }
    }
}

// 组件销毁时，及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

// 监听 props 变化
watch(() => props.modelValue, (newVal) => {
    if (newVal !== html.value) {
        html.value = newVal || ''
    }
}, { immediate: true })

watch(() => props.disabled, (newVal) => {
    const editor = editorRef.value
    if (editor == null) return
    
    if (newVal) {
        editor.disable()
    } else {
        editor.enable()
    }
})

const handleCreated = (editor: any) => {
    editorRef.value = editor // 记录 editor 实例，重要！
    
    // 设置初始内容
    if (props.modelValue) {
        editor.setHtml(props.modelValue)
    }
    
    // 设置禁用状态
    if (props.disabled) {
        editor.disable()
    }
}

const handleChange = (editor: any) => {
    const htmlContent = editor.getHtml()
    html.value = htmlContent
    emit('update:modelValue', htmlContent)
    emit('change', htmlContent)
}

const handleDestroyed = () => {
    editorRef.value = undefined
}
</script>

<style scoped>
.wang-editor-container {
    border: 2px solid var(--p-surface-300);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    background: var(--p-surface-0);
}

.wang-editor-container:hover {
    border-color: var(--p-surface-400);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.wang-editor-container:focus-within {
    border-color: var(--p-primary-color);
    box-shadow: 0 0 0 3px rgba(var(--p-primary-color-rgb), 0.15);
}

/* 工具栏样式自定义 */
.wang-editor-container :deep(.w-e-toolbar) {
    background: var(--p-surface-50);
    border-bottom: 1px solid var(--p-surface-200);
    padding: 8px 12px;
}

.wang-editor-container :deep(.w-e-toolbar .w-e-bar-item button) {
    color: var(--p-surface-700);
    border-radius: 4px;
    transition: all 0.2s ease;
}

.wang-editor-container :deep(.w-e-toolbar .w-e-bar-item button:hover) {
    background: var(--p-surface-200);
    color: var(--p-surface-900);
}

.wang-editor-container :deep(.w-e-toolbar .w-e-bar-item button.active) {
    background: var(--p-primary-100);
    color: var(--p-primary-700);
}

/* 编辑器内容区域样式 */
.wang-editor-container :deep(.w-e-text-container) {
    background: var(--p-surface-0);
    min-height: v-bind(height);
}

.wang-editor-container :deep(.w-e-text-container .w-e-scroll) {
    font-size: 14px;
    line-height: 1.6;
    color: var(--p-surface-900);
}

.wang-editor-container :deep(.w-e-text-placeholder) {
    color: var(--p-surface-500);
    font-style: normal;
}

/* 夜间主题适配 */
.dark .wang-editor-container {
    background: var(--p-surface-800);
    border-color: var(--p-surface-600);
}

.dark .wang-editor-container :deep(.w-e-toolbar) {
    background: var(--p-surface-700);
    border-bottom-color: var(--p-surface-600);
}

.dark .wang-editor-container :deep(.w-e-toolbar .w-e-bar-item button) {
    color: var(--p-surface-300);
}

.dark .wang-editor-container :deep(.w-e-toolbar .w-e-bar-item button:hover) {
    background: var(--p-surface-600);
    color: var(--p-surface-100);
}

.dark .wang-editor-container :deep(.w-e-toolbar .w-e-bar-item button.active) {
    background: var(--p-primary-800);
    color: var(--p-primary-300);
}

.dark .wang-editor-container :deep(.w-e-text-container) {
    background: var(--p-surface-800);
}

.dark .wang-editor-container :deep(.w-e-text-container .w-e-scroll) {
    color: var(--p-surface-100);
}

.dark .wang-editor-container :deep(.w-e-text-placeholder) {
    color: var(--p-surface-400);
}

/* 下拉菜单样式适配 */
.wang-editor-container :deep(.w-e-panel-content) {
    background: var(--p-surface-0);
    border: 1px solid var(--p-surface-300);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark .wang-editor-container :deep(.w-e-panel-content) {
    background: var(--p-surface-700);
    border-color: var(--p-surface-600);
}

/* 链接、表格等弹窗样式 */
.wang-editor-container :deep(.w-e-modal) {
    background: var(--p-surface-0);
    border: 1px solid var(--p-surface-300);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.dark .wang-editor-container :deep(.w-e-modal) {
    background: var(--p-surface-800);
    border-color: var(--p-surface-600);
}

/* 按钮样式 */
.wang-editor-container :deep(.w-e-button) {
    background: var(--p-primary-500);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.wang-editor-container :deep(.w-e-button:hover) {
    background: var(--p-primary-600);
    transform: translateY(-1px);
}

/* 输入框样式 */
.wang-editor-container :deep(.w-e-input) {
    border: 2px solid var(--p-surface-300);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
    transition: all 0.3s ease;
    background: var(--p-surface-0);
    color: var(--p-surface-900);
}

.wang-editor-container :deep(.w-e-input:focus) {
    border-color: var(--p-primary-color);
    box-shadow: 0 0 0 3px rgba(var(--p-primary-color-rgb), 0.15);
    outline: none;
}

.dark .wang-editor-container :deep(.w-e-input) {
    background: var(--p-surface-700);
    border-color: var(--p-surface-600);
    color: var(--p-surface-100);
}
</style> 