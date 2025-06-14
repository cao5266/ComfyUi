<template>
    <div class="steps-header">
        <div class="step-progress">
            <div 
                v-for="(step, index) in steps" 
                :key="index" 
                class="step-item" 
                :class="{
                    active: index === activeStep,
                    completed: index < activeStep,
                    future: index > activeStep
                }"
            >
                <div class="step-circle">
                    <span v-if="index < activeStep" class="step-check">✓</span>
                    <span v-else>{{ index + 1 }}</span>
                </div>
                <span class="step-label">{{ step.label }}</span>
                <div v-if="index < steps.length - 1" class="step-line"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Step {
    label: string
}

interface Props {
    steps: Step[]
    activeStep: number
}

defineProps<Props>()
</script>

<style scoped>
/* 步骤指示器 */
.steps-header {
    padding: 24px 0;
    background: var(--p-surface-0);
    border-bottom: 1px solid var(--p-surface-200);
}

.step-progress {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
    position: relative;
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    flex: 1;
    position: relative;
}

.step-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
    border: 3px solid transparent;
}

.step-item.completed .step-circle {
    background: var(--p-primary-color);
    color: var(--p-primary-contrast-color);
    border-color: var(--p-primary-color);
    box-shadow: 0 4px 12px rgba(var(--p-primary-color-rgb), 0.3);
}

.step-item.active .step-circle {
    background: var(--p-primary-color);
    color: var(--p-primary-contrast-color);
    border-color: var(--p-primary-color);
    box-shadow: 0 4px 16px rgba(var(--p-primary-color-rgb), 0.4);
    transform: scale(1.1);
}

.step-item.future .step-circle {
    background: var(--p-surface-100);
    color: var(--p-surface-500);
    border-color: var(--p-surface-300);
}

.step-check {
    font-size: 18px;
    font-weight: 900;
}

.step-label {
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
    transition: color 0.3s ease;
}

.step-item.completed .step-label,
.step-item.active .step-label {
    color: var(--p-primary-color);
}

.step-item.future .step-label {
    color: var(--p-surface-500);
}

.step-line {
    position: absolute;
    top: 20px;
    left: 50%;
    width: 100%;
    height: 3px;
    background: var(--p-surface-200);
    z-index: 1;
    border-radius: 2px;
}

.step-item.completed .step-line {
    background: var(--p-primary-color);
}

.step-item.active .step-line {
    background: linear-gradient(to right, var(--p-primary-color) 60%, var(--p-surface-200) 60%);
}

/* 夜间主题 */
.dark .step-item.completed .step-circle,
.dark .step-item.active .step-circle {
    box-shadow: 0 4px 12px rgba(var(--p-primary-color-rgb), 0.6);
}
</style> 