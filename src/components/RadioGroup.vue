<template>
    <div class="radio-group" :class="{ 'flex-row': direction === 'row' }">
        <div 
            v-for="option in options" 
            :key="option.value"
            class="radio-option"
            :class="{ active: modelValue === option.value }"
            @click="handleSelect(option.value)"
        >
            <RadioButton 
                :model-value="modelValue" 
                :input-id="option.value" 
                :value="option.value"
                @update:model-value="handleSelect"
            />
            <label :for="option.value" class="radio-label">
                {{ option.label }}
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import RadioButton from 'primevue/radiobutton'

interface Option {
    label: string
    value: any
}

interface Props {
    modelValue: any
    options: Option[]
    direction?: 'row' | 'column'
}

interface Emits {
    (e: 'update:modelValue', value: any): void
}

withDefaults(defineProps<Props>(), {
    direction: 'column'
})

const emit = defineEmits<Emits>()

const handleSelect = (value: any) => {
    emit('update:modelValue', value)
}
</script>

<style scoped>
.radio-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.radio-group.flex-row {
    flex-direction: row;
    gap: 16px;
    flex-wrap: wrap;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 12px;
    transition: all 0.3s ease;
    font-weight: 600;
    cursor: pointer;
    background: var(--p-surface-0);
    border: 2px solid var(--p-surface-200);
    flex: 1;
    min-width: 0;
    position: relative;
    overflow: hidden;
}

.radio-option:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--p-primary-50), var(--p-primary-100));
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 0;
}

.radio-option > * {
    position: relative;
    z-index: 1;
}

.radio-option:hover {
    border-color: var(--p-primary-300);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.radio-option:hover:before {
    opacity: 0.3;
}

.radio-option.active {
    border-color: var(--p-primary-color) !important;
    background: linear-gradient(135deg, var(--p-primary-50), var(--p-primary-100)) !important;
    box-shadow: 0 6px 20px rgba(var(--p-primary-color-rgb), 0.25) !important;
    transform: translateY(-3px);
}

.radio-option.active:before {
    opacity: 1;
}

.radio-label {
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    color: var(--p-surface-700);
    transition: color 0.3s ease;
}

.radio-option.active .radio-label {
    color: var(--p-primary-color);
    font-weight: 700;
}

/* 夜间主题 */
.dark .radio-option {
    background: var(--p-surface-700);
    border-color: var(--p-surface-600);
}

.dark .radio-option:hover {
    background: var(--p-surface-600);
    border-color: var(--p-primary-400);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.dark .radio-option.active {
    background: linear-gradient(135deg, rgba(var(--p-primary-color-rgb), 0.2), rgba(var(--p-primary-color-rgb), 0.3)) !important;
    border-color: var(--p-primary-color) !important;
    box-shadow: 0 6px 20px rgba(var(--p-primary-color-rgb), 0.4) !important;
}
</style> 