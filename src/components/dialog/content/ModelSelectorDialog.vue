<template>
  <div class="model-selector-dialog w-full max-w-6xl mx-auto">
    <!-- Header with Search -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <!-- Search Input -->
      <div class="flex-1">
        <IconField icon-position="left">
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText
            v-model="searchQuery"
            :placeholder="$t('g.searchModelPlaceholder')"
            class="w-full"
          />
        </IconField>
      </div>

      <!-- Close Button -->
      <Button
        icon="pi pi-times"
        severity="secondary"
        text
        @click="closeDialog"
      />
    </div>

    <!-- Filter Tabs -->
    <div class="mb-6">
      <TabMenu
        v-model:activeIndex="activeTabIndex"
        :model="filterTabs"
        class="model-selector-tabs"
      />
    </div>

    <!-- Models Grid -->
    <div class="mb-6">
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
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <ModelCard
          v-for="model in filteredModels"
          :key="model.id"
          :model="model"
          :selected="selectedModelId === model.id"
          :show-only-installed="currentFilter === 'installed'"
          @select="selectModel"
        />
      </div>
    </div>

    <!-- Footer -->
    <div
      class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('g.resultsCount', { count: filteredModels.length }) }}
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <Button
          :label="$t('g.cancel')"
          severity="secondary"
          @click="closeDialog"
        />
        <Button
          :label="$t('g.oneClickApply')"
          :disabled="!selectedModelId"
          @click="applySelectedModel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'
import TabMenu from 'primevue/tabmenu'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDialogStore } from '@/stores/dialogStore'
import type { ModelFilterBy, ModelInfo } from '@/types/model'

import ModelCard from './ModelCard.vue'

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

// Filter tabs configuration
const filterTabs = computed(() => [
  {
    label: t('g.all'),
    value: 'all' as ModelFilterBy,
    icon: 'pi pi-list'
  },
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
  {
    label: t('g.installed'),
    value: 'installed' as ModelFilterBy,
    icon: 'pi pi-check-circle'
  }
])

// Computed properties
const currentFilter = computed(() => {
  return filterTabs.value[activeTabIndex.value]?.value || 'all'
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
      // 'all' - no additional filtering
      break
  }

  return filtered
})

// Methods
const selectModel = (modelId: string) => {
  selectedModelId.value = modelId
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

const loadModels = async () => {
  loading.value = true
  try {
    // Mock data for demonstration
    // In a real implementation, this would fetch from an API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    models.value = [
      {
        id: '1',
        name: 'AWPainting',
        version: 'v1.5',
        displayName: 'AWPainting',
        previewImage: '/api/placeholder/300/300',
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
        displayName: 'majicMIX realistic 麦橘写实',
        previewImage: '/api/placeholder/300/300',
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
        displayName: 'GhostMix鬼混',
        previewImage: '/api/placeholder/300/300',
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
        displayName: 'ComicTrainee | 动漫见习生',
        previewImage: '/api/placeholder/300/300',
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
        displayName: '首发推荐 | SHMILY梦幻',
        previewImage: '/api/placeholder/300/300',
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
        displayName: 'LEOSAM HelloWorld 新手',
        previewImage: '/api/placeholder/300/300',
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
  min-height: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.model-selector-tabs :deep(.p-tabmenu-nav) {
  @apply border-b border-gray-200 dark:border-gray-700;
}

.model-selector-tabs :deep(.p-tabmenuitem-link) {
  @apply px-4 py-3 text-sm font-medium;
}

.model-selector-tabs :deep(.p-tabmenuitem-link:hover) {
  @apply bg-gray-100 dark:bg-gray-800;
}

.model-selector-tabs :deep(.p-tabmenuitem-link.p-highlight) {
  @apply text-blue-600 border-b-2 border-blue-600;
}
</style>
