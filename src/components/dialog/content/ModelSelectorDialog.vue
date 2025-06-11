<template>
  <div class="model-selector-dialog mx-auto" style="width: 1000px;">
    <!-- Title Header -->
    <!-- <div class="dialog-header flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('g.selectCheckpoint') }}
      </h2>
      <Button
        icon="pi pi-times"
        severity="secondary"
        text
        rounded
        @click="closeDialog"
        class="p-2"
      />
    </div> -->

    <!-- Filter Tabs -->
    <div class="mb-2">
      <div class="flex items-center justify-between mb-2">
        <!-- Tab Navigation - ElementUI Style -->
        <div class="tabs-container">
          <div class="tabs-nav">
            <div
              v-for="(tab, index) in filterTabs"
              :key="tab.value"
              @click="activeTabIndex = index"
              class="tab-item"
              :class="{
                'is-active': activeTabIndex === index
              }"
            >
              <i :class="tab.icon" class="tab-icon"></i>
              {{ tab.label }}
            </div>
          </div>
        </div>
        
        <!-- Search Input and Sort Dropdown -->
        <div class="flex items-center gap-4">
          <!-- Search Input -->
          <div class="w-64">
            <div class="relative">
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText
                  v-model="searchQuery"
                  :placeholder="$t('g.searchModelPlaceholder')"
                  class="w-full pr-8"
                />
              </IconField>
              <!-- Clear Button -->
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="clearbtn absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200 bg-transparent border-none outline-none cursor-pointer"
                type="button"
              >
                <i class="pi pi-times text-xs"></i>
              </button>
            </div>
          </div>
          
          <!-- Sort Dropdown -->
          <div class="sort-dropdown-container">
            <Dropdown
              v-model="sortBy"
              :options="sortOptions"
              optionLabel="label"
              optionValue="value"
              class="sort-dropdown"
              :placeholder="$t('g.sortBy')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Models Grid -->
    <div class="flex-1 min-h-0">
      <div v-if="loading" class="flex justify-center py-8">
        <ProgressSpinner />
      </div>

      <div v-else-if="filteredModels.length === 0" class="text-center py-8">
        <div class="text-gray-500 dark:text-gray-400">
          <i class="pi pi-search text-4xl mb-4 block"></i>
          <p class="text-lg font-medium mb-2">{{ $t('g.noModelsFound') }}</p>
          <p class="text-sm">{{ $t('manager.tryDifferentSearch') }}</p>
        </div>
      </div>

      <div
        v-else
        class="models-grid grid grid-cols-5 gap-4 overflow-y-auto pr-2"
        :style="{ maxHeight: '600px', minHeight: '600px', gridAutoRows: 'max-content' }"
      >
        <ModelCard
          v-for="model in filteredModels"
          :key="model.id"
          :model="model"
          :selected="selectedModelId === model.id"
          :show-only-installed="currentFilter === 'installed'"
          @select="selectModel"
          @apply="applyModel"
        />
      </div>
    </div>

    <!-- Footer -->
    <!-- <div
      class="dialog-footer flex justify-between items-center pt-4 mt-6 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('g.resultsCount', { count: filteredModels.length }) }}
      </div>

      <div class="flex gap-3">
        <Button
          :label="$t('g.cancel')"
          severity="secondary"
          @click="closeDialog"
          class="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        />
        <Button
          :label="$t('g.oneClickApply')"
          :disabled="!selectedModelId"
          @click="applySelectedModel"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        />
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDialogStore } from '@/stores/dialogStore'
import type { ModelFilterBy, ModelInfo } from '@/types/model'
import ModelCard from './ModelCard.vue'

import modle1Img from '@/assets/modle1.jpg'
import modle2Img from '@/assets/modle2.webp'
import modle3Img from '@/assets/modle3.webp'
import modle4Img from '@/assets/modle4.webp'
import modle5Img from '@/assets/modle5.webp'
import modle6Img from '@/assets/modle6.webp'

const { onSelect } = defineProps<{
  onSelect: (model: ModelInfo) => void
}>()

const { t } = useI18n()
const dialogStore = useDialogStore()

// Reactive data
const searchQuery = ref('')
const selectedModelId = ref<string | null>(null)
const loading = ref(true)
const models = ref<ModelInfo[]>([])
const activeTabIndex = ref(0)
const sortBy = ref('all')

// Filter tabs configuration
const filterTabs = computed(() => [
  {
    label: t('g.myModels'),
    value: 'my-models' as ModelFilterBy, 
    icon: 'pi pi-user'
  },
  {
    label: t('g.starredModels'),
    value: 'starred' as ModelFilterBy,
    icon: 'pi pi-star'
  },
//   {
//     label: t('g.installed'),
//     value: 'installed' as ModelFilterBy,
//     icon: 'pi pi-check-circle'
//   }
])

// Sort options
const sortOptions = computed(() => [
  { label: t('g.all'), value: 'all' },
  { label: t('g.newest'), value: 'newest' },
  { label: t('g.popular'), value: 'popular' }
])

// Computed properties
const currentFilter = computed(() => {
  return filterTabs.value[activeTabIndex.value]?.value || 'my-models'
})

const filteredModels = computed(() => {
  let filtered = models.value

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.displayName?.toLowerCase().includes(query) ||
        model.author?.toLowerCase().includes(query) ||
        model.tags?.some((tag) => tag.toLowerCase().includes(query))
    )
  }

  // Apply category filter
  switch (currentFilter.value) {
    case 'starred':
      filtered = filtered.filter((model) => model.isStarred)
      break
    case 'installed':
      filtered = filtered.filter((model) => model.isInstalled)
      break
    case 'my-models':
      // This would be filtered by user's own models
      // For now, we'll just show installed models
      filtered = filtered.filter((model) => model.isInstalled)
      break
    default:
      // no additional filtering
      break
  }

  // Apply sorting
  switch (sortBy.value) {
    case 'newest':
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0).getTime()
        const dateB = new Date(b.updatedAt || 0).getTime()
        return dateB - dateA
      })
      break
    case 'popular':
      // Sort by some popularity metric (using size as proxy for now)
      filtered = filtered.sort((a, b) => {
        const sizeA = parseFloat((a.size || '0').replace('GB', ''))
        const sizeB = parseFloat((b.size || '0').replace('GB', ''))
        return sizeB - sizeA
      })
      break
    default:
      // 'all' - no sorting
      break
  }

  return filtered
})

// Methods
const selectModel = (modelId: string) => {
  selectedModelId.value = modelId
}

const applyModel = (model: ModelInfo) => {
  onSelect(model)
  closeDialog()
}

const applySelectedModel = () => {
  const selectedModel = models.value.find((m) => m.id === selectedModelId.value)
  if (selectedModel) {
    onSelect(selectedModel)
    closeDialog()
  }
}

const closeDialog = () => {
  dialogStore.closeDialog()
}

const clearSearch = () => {
  searchQuery.value = ''
}

const loadModels = async () => {
  loading.value = true
  try {
    // // Mock data for demonstration
    // // In a real implementation, this would fetch from an API
    // await new Promise((resolve) => setTimeout(resolve, 1000))

    models.value = [
      {
        id: '1',
        name: 'AWPainting',
        version: 'v1.5',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle1Img,
        author: 'ArtistName',
        tags: ['anime', 'painting', 'artistic'],
        isStarred: false,
        isInstalled: true,
        size: '2.1GB',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'majicMIX realistic',
        version: 'v7',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle2Img,
        author: 'MajicMix',
        tags: ['realistic', 'photorealistic'],
        isStarred: true,
        isInstalled: true,
        size: '5.2GB',
        updatedAt: '2024-01-20'
      },
      {
        id: '3',
        name: 'GhostMix',
        version: 'V2.0',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle3Img,
        author: 'GhostMix',
        tags: ['anime', 'versatile'],
        isStarred: false,
        isInstalled: false,
        size: '4.1GB',
        updatedAt: '2024-01-18'
      },
      {
        id: '4',
        name: 'ComicTrainee',
        version: 'v2.0',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle4Img,
        author: 'ComicTrainee',
        tags: ['anime', 'comic', 'cartoon'],
        isStarred: true,
        isInstalled: true,
        size: '3.8GB',
        updatedAt: '2024-01-22'
      },
      {
        id: '5',
        name: 'SDXL-Anime',
        version: 'v3.1',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle5Img,
        author: 'SDXL',
        tags: ['anime', 'xl', 'fantasy'],
        isStarred: false,
        isInstalled: true,
        size: '6.5GB',
        updatedAt: '2024-01-25'
      },
      {
        id: '6',
        name: 'LEOSAM HelloWorld',
        version: 'v7.0',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle6Img,
        author: 'LEOSAM',
        tags: ['beginner', 'versatile'],
        isStarred: false,
        isInstalled: false,
        size: '4.2GB',
        updatedAt: '2024-01-20'
      },
      {
        id: '7',
        name: 'AWPainting',
        version: 'v1.5',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle1Img,
        author: 'ArtistName',
        tags: ['anime', 'painting', 'artistic'],
        isStarred: false,
        isInstalled: true,
        size: '2.1GB',
        updatedAt: '2024-01-15'
      },
      {
        id: '8',
        name: 'majicMIX realistic',
        version: 'v7',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle2Img,
        author: 'MajicMix',
        tags: ['realistic', 'photorealistic'],
        isStarred: true,
        isInstalled: true,
        size: '5.2GB',
        updatedAt: '2024-01-20'
      },
      {
        id: '9',
        name: 'GhostMix',
        version: 'V2.0',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle3Img,
        author: 'GhostMix',
        tags: ['anime', 'versatile'],
        isStarred: false,
        isInstalled: false,
        size: '4.1GB',
        updatedAt: '2024-01-18'
      },
      {
        id: '10',
        name: 'ComicTrainee',
        version: 'v2.0',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle4Img,
        author: 'ComicTrainee',
        tags: ['anime', 'comic', 'cartoon'],
        isStarred: true,
        isInstalled: true,
        size: '3.8GB',
        updatedAt: '2024-01-22'
      },
      {
        id: '11',
        name: 'SDXL-Anime',
        version: 'v3.1',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle5Img,
        author: 'SDXL',
        tags: ['anime', 'xl', 'fantasy'],
        isStarred: false,
        isInstalled: true,
        size: '6.5GB',
        updatedAt: '2024-01-25'
      },
      {
        id: '12',
        name: 'LEOSAM HelloWorld',
        version: 'v7.0',
        displayName: 'v1-5-pruned-emaonly.safetensors',
        previewImage: modle6Img,
        author: 'LEOSAM',
        tags: ['beginner', 'versatile'],
        isStarred: false,
        isInstalled: false,
        size: '4.2GB',
        updatedAt: '2024-01-20'
      }
    ]
  } catch (error) {
    console.error('Failed to load models:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadModels()
})
</script>

<style scoped>
.model-selector-dialog {
  min-height: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  flex-shrink: 0;
}

.dialog-footer {
  flex-shrink: 0;
}

/* 调整模型网格区域 */
.models-grid {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  grid-auto-rows: max-content;
  align-content: start;
  justify-content: start;
}

.models-grid::-webkit-scrollbar {
  width: 6px;
}

.models-grid::-webkit-scrollbar-track {
  background: transparent;
}

.models-grid::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.models-grid::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* ElementUI风格的标签页 */
.tabs-container {
  position: relative;
  padding-bottom: 5px;
}

.tabs-nav {
  display: flex;
  align-items: center;
}

.tab-item {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  transition: color 0.3s ease;
  position: relative;
  width: auto;
  justify-content: center;
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  color: #409eff;
}

.tab-item.is-active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.tab-icon {
  margin-right: 6px;
  font-size: 14px;
}

.tabs-active-bar {
  position: absolute;
  bottom: 0;
  width: 120px;
  height: 2px;
  background-color: #409eff;
  transition: transform 0.3s ease;
  z-index: 1;
}

.clearbtn{
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}

/* 深色模式适配 */
.dark .tabs-container {
  border-bottom-color: #4c4d4f;
}

.dark .tab-item {
  color: #a8abb2;
}

.dark .tab-item:hover,
.dark .tab-item.is-active {
  color: #409eff;
}

.p-inputtext{
    font-size: 14px;
}

.p-inputtext:focus{
    border-color:#7a7a7a !important;
}

/* 响应式布局调整 */
@media (max-width: 1280px) {
  .models-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1024px) {
  .models-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .models-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dialog-header h2 {
    font-size: 1.125rem;
  }
  
  .tab-item {
    padding: 0 12px;
    width: 100px;
    font-size: 13px;
  }

  .tabs-active-bar {
    width: 100px;
  }

  .model-selector-dialog {
    max-width: 100%;
    margin: 0 1rem;
  }
  
  /* 调整搜索框和下拉菜单的响应式布局 */
  .flex.items-center.justify-between.mb-4 {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .flex.items-center.gap-4 {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }
  
  .flex.items-center.gap-4 > div {
    width: 100% !important;
  }
}

@media (max-width: 640px) {
  .models-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .dialog-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .tab-item {
    padding: 0 8px;
    width: 80px;
    font-size: 12px;
  }

  .tabs-active-bar {
    width: 80px;
  }

  .tabs-nav {
    justify-content: center;
  }
}

/* 排序下拉菜单样式优化 */
.sort-dropdown-container {
  position: relative;
}

/* 暗色主题下的下拉菜单样式 */
.dark-theme .sort-dropdown,
:root:has(.dark-theme) .sort-dropdown {
  background: transparent !important;
  border: 1px solid #3f4248 !important;
  color: #e4e7ed !important;
  border-radius: 8px !important;
}

.dark-theme .sort-dropdown:hover,
:root:has(.dark-theme) .sort-dropdown:hover {
    border-color:#7a7a7a !important;
  /* background: #2f3237 !important; */
}

.dark-theme .sort-dropdown:focus,
:root:has(.dark-theme) .sort-dropdown:focus {
    border-color:#7a7a7a !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
  outline: none !important;
}

/* 暗色主题下的Dropdown输入框样式 */
.dark-theme :deep(.p-dropdown),
:root:has(.dark-theme) :deep(.p-dropdown) {
  background: #2a2d35 !important;
  border: 1px solid #3f4248 !important;
  color: #e4e7ed !important;
  border-radius: 8px !important;
}

.dark-theme :deep(.p-dropdown:not(.p-disabled):hover),
:root:has(.dark-theme) :deep(.p-dropdown:not(.p-disabled):hover) {
  /* border-color: #409eff !important; */
  background: #2f3237 !important;
}

.dark-theme :deep(.p-dropdown:focus),
:root:has(.dark-theme) :deep(.p-dropdown:focus) {
  /* border-color: #409eff !important; */
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
}

/* 暗色主题下的Dropdown面板样式 */
.dark-theme :deep(.p-dropdown-panel),
:root:has(.dark-theme) :deep(.p-dropdown-panel) {
  background: #2a2d35 !important;
  border: 1px solid #3f4248 !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
  margin-top: 4px !important;
}

.dark-theme :deep(.p-dropdown-items),
:root:has(.dark-theme) :deep(.p-dropdown-items) {
  padding: 4px 0 !important;
}

.dark-theme :deep(.p-dropdown-item),
:root:has(.dark-theme) :deep(.p-dropdown-item) {
  padding: 8px 12px !important;
  color: #e4e7ed !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
}

.dark-theme :deep(.p-dropdown-item:hover),
:root:has(.dark-theme) :deep(.p-dropdown-item:hover) {
  background: #409eff !important;
  color: #ffffff !important;
}

.dark-theme :deep(.p-dropdown-item.p-highlight),
:root:has(.dark-theme) :deep(.p-dropdown-item.p-highlight) {
  background: #409eff !important;
  color: #ffffff !important;
}

/* 暗色主题下的Dropdown箭头样式 */
.dark-theme :deep(.p-dropdown-trigger),
:root:has(.dark-theme) :deep(.p-dropdown-trigger) {
  color: #e4e7ed !important;
  width: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.dark-theme :deep(.p-dropdown-trigger:hover),
:root:has(.dark-theme) :deep(.p-dropdown-trigger:hover) {
  color: #409eff !important;
}

/* 暗色主题下的Dropdown标签样式 */
.dark-theme :deep(.p-dropdown-label),
:root:has(.dark-theme) :deep(.p-dropdown-label) {
  color: #e4e7ed !important;
  padding: 8px 12px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

/* 浅色主题下的样式 */
.sort-dropdown {
  min-width: 120px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  color: #606266;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
}

:deep(.p-select-option-label){
    font-size: 14px;
}

.sort-dropdown:hover {
  border-color: #409eff;
  background: #f8f9fa;
}

.sort-dropdown:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  outline: none;
}

:deep(.p-dropdown) {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  color: #606266 !important;
  border-radius: 8px !important;
}

:deep(.p-dropdown:not(.p-disabled):hover) {
  border-color: #409eff !important;
  background: #f8f9fa !important;
}

:deep(.p-dropdown:focus) {
  border-color: #409eff !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
}

:deep(.p-dropdown-panel) {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
}

:deep(.p-dropdown-items) {
  padding: 4px 0;
}

:deep(.p-dropdown-item) {
  padding: 8px 12px;
  color: #606266;
  background: transparent;
  border: none;
  border-radius: 0;
  transition: all 0.2s ease;
  cursor: pointer;
}

:deep(.p-dropdown-item:hover) {
  background: #409eff;
  color: #ffffff;
}

:deep(.p-dropdown-item.p-highlight) {
  background: #409eff;
  color: #ffffff;
}

:deep(.p-dropdown-trigger) {
  color: #909399 !important;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.p-dropdown-trigger:hover) {
  color: #409eff !important;
}

:deep(.p-dropdown-label) {
  color: #606266 !important;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
}
</style>
