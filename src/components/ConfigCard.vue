<template>
    <div class="config-card">
        <h3 class="config-title">
            {{ title }}
        </h3>
        <slot />
    </div>
</template>

<script setup lang="ts">
interface Props {
    title: string
}

defineProps<Props>()
</script>

<style scoped>
.config-card {
    border-radius: 16px;
    padding: 28px;
    background: var(--p-surface-card);
    border: 2px solid var(--p-surface-200);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.config-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--p-surface-300);
}

.config-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0px 0px 10px;
    color: var(--p-surface-900);
    display: flex;
    align-items: center;
    gap: 8px;
}

.config-title:before {
    content: "";
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, var(--p-primary-color), var(--p-primary-600));
    border-radius: 2px;
}


:deep(.p-radiobutton-icon),:deep(.p-checkbox-box),:deep(.p-radiobutton-box){
    background-color: #fff !important;
}

:deep(.p-radiobutton-input),:deep(.p-checkbox-box),:deep(.p-radiobutton-box){
   border: 1px solid #cbd5e1 !important;
}

:deep(.p-radiobutton-checked .p-radiobutton-box ),:deep(.p-checkbox-checked .p-checkbox-box){
    background-color: #3b82f6 !important;
    border: 1px solid #3b82f6 !important;
}
</style> 