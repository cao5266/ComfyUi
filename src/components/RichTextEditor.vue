<template>
    <div class="rich-text-editor-container">
        <Editor 
            v-model="content"
            :editorStyle="`height: ${height}`"
            :placeholder="placeholder"
            :readonly="disabled"
            :invalid="invalid"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Editor from 'primevue/editor'

// 组件属性定义
interface Props {
    modelValue?: string
    placeholder?: string
    height?: string
    disabled?: boolean
    invalid?: boolean
}

interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '请输入内容...',
    height: '200px',
    disabled: false,
    invalid: false
})

const emit = defineEmits<Emits>()

const content = ref(props.modelValue)

// 监听内容变化
watch(content, (newValue) => {
    emit('update:modelValue', newValue)
    emit('change', newValue)
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
    if (newValue !== content.value) {
        content.value = newValue || ''
    }
}, { immediate: true })
</script>

<style scoped>
.rich-text-editor-container {
    width: 100%;
}

.rich-text-editor-container :deep(.p-editor-container) {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    background: var(--p-surface-0);
}

.rich-text-editor-container :deep(.p-editor-container.p-invalid) {
    border-color: var(--p-red-500);
}

.rich-text-editor-container :deep(.p-editor-container:focus-within) {
    border-color: var(--p-primary-color);
    box-shadow: 0 0 0 3px rgba(var(--p-primary-color-rgb), 0.15);
}

.rich-text-editor-container :deep(.p-editor-container.p-invalid:focus-within) {
    border-color: var(--p-red-500);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.rich-text-editor-container :deep(.p-editor-toolbar) {
    background: var(--p-surface-50);
    border-bottom: 1px solid var(--p-surface-200);
    padding: 8px 12px;
}

.rich-text-editor-container :deep(.p-editor-content) {
    background: var(--p-surface-0);
}

.rich-text-editor-container :deep(.ql-editor) {
    font-size: 14px;
    line-height: 1.6;
    color: var(--p-surface-900);
    padding: 16px;
}

.rich-text-editor-container :deep(.ql-editor.ql-blank::before) {
    color: var(--p-surface-500);
    font-style: normal;
}
</style> 