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
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 24px;
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

/* 夜间主题 */
.dark .config-card {
    background: var(--p-surface-700);
    border-color: var(--p-surface-600);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.dark .config-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    border-color: var(--p-surface-500);
}
</style> 