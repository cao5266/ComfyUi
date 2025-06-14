<template>
    <div class="form-field">
        <label v-if="label" class="form-label" :class="{ required }">
            {{ label }}
        </label>
        <div v-if="hint" class="form-hint">
            {{ hint }}
        </div>
        <slot />
        <div v-if="showCharCount && maxLength" class="char-count">
            {{ (modelValue || '').length }}/{{ maxLength }}
        </div>
        <a v-if="linkText && linkHref" :href="linkHref" class="form-link">
            {{ linkText }}
        </a>
    </div>
</template>

<script setup lang="ts">
interface Props {
    label?: string
    hint?: string
    required?: boolean
    modelValue?: string
    maxLength?: number
    showCharCount?: boolean
    linkText?: string
    linkHref?: string
}

defineProps<Props>()
</script>

<style scoped>
.form-field {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.form-label {
    font-size: 15px;
    font-weight: 700;
    color: var(--p-surface-900);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.form-label.required::after {
    content: '*';
    color: var(--p-red-500);
    font-size: 16px;
    font-weight: 800;
}

.form-hint {
    font-size: 13px;
    line-height: 1.5;
    color: var(--p-surface-600);
    background: var(--p-surface-50);
    padding: 8px 12px;
    border-radius: 8px;
    border-left: 3px solid var(--p-primary-200);
    margin-bottom: 8px;
}

.char-count {
    text-align: right;
    font-size: 12px;
    color: var(--p-surface-500);
    font-weight: 500;
    margin-top: 4px;
}

.form-link {
    text-decoration: none;
    font-size: 13px;
    margin-top: 8px;
    color: var(--p-primary-color);
    font-weight: 600;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.form-link:hover {
    text-decoration: underline;
    color: var(--p-primary-600);
    transform: translateX(2px);
}

.form-link:after {
    content: "→";
    font-size: 12px;
    transition: transform 0.3s ease;
}

.form-link:hover:after {
    transform: translateX(2px);
}
</style> 