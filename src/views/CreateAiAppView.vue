<template>
    <div class="create-ai-app-container">
        <!-- 步骤指示器 -->
        <StepIndicator :steps="steps" :active-step="activeStep" />

        <!-- 滚动内容区域 -->
        <div class="content-scroll">
            <div class="content-wrapper">
                <!-- 第一步：编辑AI应用 -->
                <div v-if="activeStep === 0" class="step-content">
                    <div class="content-grid">
                        <!-- 左侧表单 -->
                        <div class="form-section">
                            <FormField 
                                :label="$t('createAiApp.appName')"
                                :model-value="formData.appName"
                                :max-length="30"
                                :show-char-count="true"
                                required
                            >
                                <InputText 
                                    v-model="formData.appName"
                                    :placeholder="$t('createAiApp.appNamePlaceholder')" 
                                    :maxlength="30" 
                                />
                            </FormField>

                            <FormField 
                                :label="$t('createAiApp.contentCategory')"
                                :hint="$t('createAiApp.categoryHint')"
                                :link-text="$t('createAiApp.categoryGuide')"
                                link-href="#"
                            >
                                <Dropdown 
                                    v-model="formData.category" 
                                    :options="categories" 
                                    option-label="label"
                                    option-value="value" 
                                    :placeholder="$t('createAiApp.selectCategory')" 
                                />
                            </FormField>

                            <FormField 
                                :label="$t('createAiApp.participateActivity')"
                                :hint="$t('createAiApp.activityHint')"
                                :link-text="$t('createAiApp.activityDetails')"
                                link-href="#"
                            >
                                <Dropdown 
                                    v-model="formData.activity" 
                                    :options="activities" 
                                    option-label="label"
                                    option-value="value" 
                                    :placeholder="$t('createAiApp.selectActivity')" 
                                />
                            </FormField>
                        </div>

                        <!-- 右侧配置 -->
                        <div class="config-section">
                            <!-- 可见性模块 -->
                            <ConfigCard :title="$t('createAiApp.visibility')">
                                <RadioGroup 
                                    v-model="formData.isPublic"
                                    :options="publicOptions"
                                    direction="row"
                                />
                            </ConfigCard>

                            <!-- 原创性模块 -->
                            <ConfigCard :title="$t('createAiApp.originalWork')">
                                <RadioGroup 
                                    v-model="formData.isOriginal"
                                    :options="originalOptions"
                                    direction="row"
                                />
                            </ConfigCard>

                            <!-- 使用权限与声明模块 -->
                            <ConfigCard :title="$t('createAiApp.usagePermissionsAndStatement')">
                                <div class="checkbox-list">
                                    <div class="checkbox-item">
                                        <Checkbox v-model="formData.allowCommercialUse" binary />
                                        <span>{{ $t('createAiApp.allowCommercialUse') }}</span>
                                    </div>
                                    <div class="checkbox-item">
                                        <Checkbox v-model="formData.allowModification" binary />
                                        <span>{{ $t('createAiApp.allowModification') }}</span>
                                    </div>
                                </div>
                                <ul class="agreement-list">
                                    <li>{{ $t('createAiApp.agreement1') }}</li>
                                    <li>{{ $t('createAiApp.agreement2') }}</li>
                                    <li>{{ $t('createAiApp.agreement3') }}</li>
                                    <li>{{ $t('createAiApp.agreement4') }}</li>
                                    <li>{{ $t('createAiApp.agreement5') }}</li>
                                    <li>{{ $t('createAiApp.agreement6') }}</li>
                                </ul>
                            </ConfigCard>
                        </div>
                    </div>
                </div>

                <!-- 第二步：编辑版本 -->
                <div v-else-if="activeStep === 1" class="step-content">
                    <div class="version-header">
                        <div class="version-actions">
                            <Button 
                                :label="$t('createAiApp.addVersion')" 
                                icon="pi pi-plus"
                                class="version-btn primary" 
                                @click="addVersion" 
                            />
                            <Button 
                                :label="$t('createAiApp.copyFromOther')" 
                                icon="pi pi-copy"
                                class="version-btn secondary"
                                @click="copyFromOther" 
                            />
                        </div>
                        <div class="version-hint">
                            {{ $t('createAiApp.versionHint') }}
                        </div>
                    </div>

                    <div class="version-form">
                        <FormField 
                            :label="$t('createAiApp.versionName')"
                            :model-value="versionData.name"
                            :max-length="15"
                            :show-char-count="true"
                            required
                        >
                            <InputText 
                                v-model="versionData.name"
                                :placeholder="$t('createAiApp.versionNamePlaceholder')" 
                                :maxlength="15" 
                            />
                        </FormField>

                        <FormField 
                            :label="$t('createAiApp.versionDescription')"
                            :hint="$t('createAiApp.descriptionHint')"
                            required
                        >
                            <RichTextEditor 
                                v-model="versionData.description"
                                :placeholder="$t('createAiApp.descriptionPlaceholder')"
                                height="200px"
                            />
                        </FormField>

                        <WorkflowPreview 
                            :file-name="workflowFileName"
                            :node-count="7"
                            @remove-file="removeWorkflowFile"
                        />
                    </div>
                </div>

                <!-- 第三步：上传图片 -->
                <div v-else-if="activeStep === 2" class="step-content">
                    <div class="upload-section">
                        <div class="upload-header">
                            <h2 class="upload-title">{{ $t('createAiApp.uploadImages') }}</h2>
                            <div class="upload-hint">{{ $t('createAiApp.uploadDescription') }}</div>
                        </div>

                        <div class="upload-area">
                            <div class="upload-zone">
                                <i class="pi pi-cloud-upload upload-icon"></i>
                                <div class="upload-text">
                                    <p class="upload-main">拖拽图片到此处或点击上传</p>
                                    <p class="upload-sub">支持JPG、PNG格式，建议尺寸1024x1024</p>
                                </div>
                                <Button 
                                    :label="$t('createAiApp.uploadImages')"
                                    class="upload-btn"
                                />
                            </div>
                        </div>

                        <div class="preview-section">
                            <div class="preview-header">
                                <span class="preview-title">预览效果</span>
                                <span class="preview-count">最多20张图片，目前已上传0张</span>
                            </div>
                            <div class="preview-grid">
                                <div class="preview-placeholder">
                                    <i class="pi pi-image"></i>
                                    <span>暂无预览图片</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部操作栏 -->
            <div class="footer-fixed">
                <div class="footer-actions">
                    <Button 
                        v-if="activeStep > 0" 
                        :label="$t('common.back')" 
                        severity="secondary" 
                        @click="previousStep"
                        class="action-btn"
                    />
                    <Button 
                        :label="activeStep === steps.length - 1 ? $t('common.confirm') : $t('createAiApp.nextStep')"
                        @click="nextStep"
                        class="action-btn primary"
                        :disabled="!canProceed" 
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
// 导入我们的组件
import StepIndicator from '@/components/StepIndicator.vue'
import FormField from '@/components/FormField.vue'
import ConfigCard from '@/components/ConfigCard.vue'
import RadioGroup from '@/components/RadioGroup.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import WorkflowPreview from '@/components/WorkflowPreview.vue'

const { t } = useI18n()
const router = useRouter()

// 平滑滚动到顶部的函数
const scrollToTop = async () => {
    await nextTick()
    const contentScroll = document.querySelector('.content-scroll')
    if (contentScroll) {
        contentScroll.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
}

// 步骤配置
const steps = ref([
    { label: t('createAiApp.editApp') },
    { label: t('createAiApp.editVersion') },
    { label: t('createAiApp.uploadImages') }
])

const activeStep = ref(0)

// 表单数据
const formData = ref({
    appName: '',
    isPublic: true,
    category: null,
    activity: null,
    isOriginal: true,
    allowCommercialUse: false,
    allowModification: false
})

// 版本数据
const versionData = ref({
    name: '',
    description: ''
})

// 工作流文件名
const workflowFileName = ref('2025-06-13 00:51:07.json')

// 可见性选项
const publicOptions = ref([
    { label: t('createAiApp.public'), value: true },
    { label: t('createAiApp.private'), value: false }
])

// 原创性选项
const originalOptions = ref([
    { label: t('createAiApp.originalWork'), value: true },
    { label: t('createAiApp.reproduced'), value: false }
])

// 分类选项
const categories = ref([
    { label: t('createAiApp.categories.art'), value: 'art' },
    { label: t('createAiApp.categories.photo'), value: 'photo' },
    { label: t('createAiApp.categories.video'), value: 'video' },
    { label: t('createAiApp.categories.text'), value: 'text' },
    { label: t('createAiApp.categories.audio'), value: 'audio' },
    { label: t('createAiApp.categories.other'), value: 'other' }
])

// 活动选项
const activities = ref([
    { label: t('createAiApp.activities.none'), value: 'none' },
    { label: t('createAiApp.activities.contest'), value: 'contest' },
    { label: t('createAiApp.activities.challenge'), value: 'challenge' }
])

// 是否可以进行下一步
const canProceed = computed(() => {
    if (activeStep.value === 0) {
        return formData.value.appName.trim() !== '' &&
            formData.value.category !== null &&
            formData.value.activity !== null
    } else if (activeStep.value === 1) {
        return versionData.value.name.trim() !== '' &&
            versionData.value.description.trim() !== ''
    } else if (activeStep.value === 2) {
        return true
    }
    return false
})

// 下一步
const nextStep = async () => {
    if (activeStep.value < steps.value.length - 1) {
        activeStep.value++
        scrollToTop()
    } else {
        console.log('创建AI应用完成', formData.value)
        router.push('/')
    }
}

// 上一步
const previousStep = async () => {
    if (activeStep.value > 0) {
        activeStep.value--
        scrollToTop()
    }
}

// 添加版本
const addVersion = () => {
    // 实现添加版本的功能
}

// 从其他版本复制
const copyFromOther = () => {
    // 实现从其他版本复制功能
}

// 移除工作流文件
const removeWorkflowFile = () => {
    workflowFileName.value = ''
}
</script>

<style scoped>
.create-ai-app-container {
    height: 100vh;
    display: flex;
    overflow-y: auto;
    flex-direction: column;
    animation: fadeIn 0.6s ease-out;
    background: var(--p-surface-50);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 内容区域 */
.content-scroll {
    flex: 1;
    padding: 24px;
    background: linear-gradient(135deg, var(--p-surface-50) 0%, var(--p-surface-100) 100%);
}

.content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
}

.step-content {
    background: var(--p-surface-card);
    border-radius: 20px;
    padding: 40px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 2px solid var(--p-surface-200);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.step-content:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--p-primary-color), var(--p-primary-600), var(--p-primary-color));
    z-index: 1;
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

/* 表单样式 */
.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.config-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 24px;
}

.checkbox-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--p-surface-100);
    transition: all 0.3s ease;
}

.checkbox-item:last-child {
    border-bottom: none;
}

.checkbox-item:hover {
    background: var(--p-surface-50);
    border-radius: 8px;
    padding: 12px 16px;
    margin: 0 -16px;
}

.checkbox-item span {
    font-size: 14px;
    line-height: 1.6;
    color: var(--p-surface-700);
}

.agreement-list {
    list-style: none;
    padding: 20px;
    background: linear-gradient(135deg, var(--p-surface-50), var(--p-surface-100));
    border-radius: 12px;
    border-left: 4px solid var(--p-primary-color);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.agreement-list li {
    margin-bottom: 10px;
    color: var(--p-surface-600);
    font-size: 13px;
    line-height: 1.5;
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.agreement-list li:before {
    content: "•";
    color: var(--p-primary-color);
    font-weight: bold;
    font-size: 16px;
    line-height: 1.2;
    flex-shrink: 0;
}

/* 版本编辑样式 */
.version-header {
    margin-bottom: 32px;
}

.version-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}

.version-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    border: none;
}

.version-btn.primary {
    background: var(--p-primary-500);
    color: white;
}

.version-btn.secondary {
    background: var(--p-surface-100);
    color: var(--p-surface-700);
    border: 1px solid var(--p-surface-300);
}

.version-hint {
    font-size: 14px;
    line-height: 1.5;
    padding: 12px;
    border-radius: 8px;
    background: var(--p-blue-50);
    color: var(--p-blue-700);
    border-left: 4px solid var(--p-blue-500);
}

.version-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* 上传图片样式 */
.upload-section {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.upload-header {
    text-align: center;
}

.upload-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--p-surface-900);
    margin-bottom: 8px;
}

.upload-hint {
    color: var(--p-surface-600);
    font-size: 16px;
}

.upload-area {
    display: flex;
    justify-content: center;
}

.upload-zone {
    width: 100%;
    max-width: 400px;
    border: 2px dashed var(--p-surface-300);
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    background: var(--p-surface-50);
    transition: all 0.3s ease;
    cursor: pointer;
}

.upload-zone:hover {
    border-color: var(--p-primary-500);
    background: var(--p-blue-50);
}

.upload-icon {
    font-size: 48px;
    color: var(--p-surface-400);
    margin-bottom: 16px;
}

.upload-text {
    margin-bottom: 20px;
}

.upload-main {
    font-size: 16px;
    font-weight: 500;
    color: var(--p-surface-700);
    margin-bottom: 4px;
}

.upload-sub {
    font-size: 14px;
    color: var(--p-surface-500);
}

.upload-btn {
    background: var(--p-primary-500);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
}

.preview-section {
    background: var(--p-surface-50);
    border-radius: 12px;
    padding: 24px;
}

.preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.preview-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--p-surface-900);
}

.preview-count {
    font-size: 14px;
    color: var(--p-surface-600);
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
}

.preview-placeholder {
    aspect-ratio: 1;
    border: 1px dashed var(--p-surface-300);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--p-surface-400);
    font-size: 14px;
}

.preview-placeholder i {
    font-size: 24px;
}

/* 底部操作栏 */
.footer-fixed {
    padding: 24px 20px;
    margin: 32px 0;
    border-radius: 12px;
}

.footer-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;
}

.action-btn {
    min-width: 120px;
    padding: 14px 28px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
}

.action-btn:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.action-btn:hover:before {
    left: 100%;
}

.action-btn.primary {
    background: var(--p-primary-color);
    color: var(--p-primary-contrast-color);
    border-color: var(--p-primary-color);
    box-shadow: 0 4px 12px rgba(var(--p-primary-color-rgb), 0.3);
}

.action-btn.primary:hover:not(:disabled) {
    background: var(--p-primary-600);
    border-color: var(--p-primary-600);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(var(--p-primary-color-rgb), 0.4);
}

.action-btn:not(.primary) {
    background: var(--p-surface-0);
    color: var(--p-surface-700);
    border-color: var(--p-surface-300);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:not(.primary):hover {
    background: var(--p-surface-50);
    border-color: var(--p-surface-400);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
    background: var(--p-surface-200) !important;
    color: var(--p-surface-500) !important;
    border-color: var(--p-surface-200) !important;
    cursor: not-allowed !important;
    transform: none !important;
    box-shadow: none !important;
}

/* 强制表单组件高度一致 */
.create-ai-app-container :deep(.p-inputtext),
.create-ai-app-container :deep(.p-dropdown) {
    height: 44px !important;
    min-height: 44px !important;
    border-radius: 10px !important;
    font-size: 14px !important;
    border: 2px solid var(--p-surface-300) !important;
    background: var(--p-surface-0) !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.create-ai-app-container :deep(.p-inputtext) {
    padding: 0 16px !important;
    line-height: 44px !important;
}

.create-ai-app-container :deep(.p-dropdown .p-dropdown-label) {
    line-height: 44px !important;
    padding: 0 16px !important;
    display: flex !important;
    align-items: center !important;
}

.create-ai-app-container :deep(.p-dropdown .p-dropdown-trigger) {
    width: 44px !important;
    height: 44px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-left: 2px solid var(--p-surface-300) !important;
    background: var(--p-surface-50) !important;
    border-radius: 0 8px 8px 0 !important;
}

/* 焦点状态 */
.create-ai-app-container :deep(.p-inputtext:focus),
.create-ai-app-container :deep(.p-dropdown:focus),
.create-ai-app-container :deep(.p-dropdown.p-focus) {
    border-color: var(--p-primary-color) !important;
    box-shadow: 0 0 0 3px rgba(var(--p-primary-color-rgb), 0.15) !important;
    outline: none !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .content-scroll {
        padding: 16px;
    }

    .content-grid {
        grid-template-columns: 1fr;
        gap: 24px;
    }

    .step-content {
        padding: 24px;
    }

    .version-actions {
        flex-direction: column;
    }

    .footer-actions {
        flex-direction: column !important;
    }

    .footer-fixed {
        padding: 20px 16px !important;
        margin-top: 24px;
    }
}

/* 夜间主题 */
.dark .content-scroll {
    background: linear-gradient(135deg, var(--p-surface-900) 0%, var(--p-surface-800) 100%);
}

.dark .step-content {
    background: var(--p-surface-800);
    border-color: var(--p-surface-600);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.dark .action-btn.primary {
    box-shadow: 0 4px 12px rgba(var(--p-primary-color-rgb), 0.5);
}

.dark .action-btn.primary:hover:not(:disabled) {
    box-shadow: 0 8px 24px rgba(var(--p-primary-color-rgb), 0.6);
}

.dark .action-btn:not(.primary) {
    background: var(--p-surface-700);
    border-color: var(--p-surface-600);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.dark .action-btn:not(.primary):hover {
    background: var(--p-surface-600);
    border-color: var(--p-surface-500);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
}

.dark .create-ai-app-container :deep(.p-inputtext),
.dark .create-ai-app-container :deep(.p-dropdown) {
    background: var(--p-surface-700) !important;
    border-color: var(--p-surface-600) !important;
    color: var(--p-surface-100) !important;
}

.dark .create-ai-app-container :deep(.p-dropdown-trigger) {
    background: var(--p-surface-600) !important;
    border-left-color: var(--p-surface-500) !important;
}
</style>