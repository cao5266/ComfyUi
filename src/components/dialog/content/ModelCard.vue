<template>
  <div
    class="model-card bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-400"
    :class="{
      'ring-2 ring-blue-400': selected,
      'opacity-50': !model.isInstalled && showOnlyInstalled
    }"
    @click="$emit('select', model.id)"
  >
    <!-- Preview Image -->
    <div
      class="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-900"
    >
      <img
        v-if="model.previewImage"
        :src="model.previewImage"
        :alt="model.displayName || model.name"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="onImageError"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-400"
      >
        <i class="pi pi-image text-4xl"></i>
      </div>

      <!-- Version Badge -->
      <div class="absolute top-2 right-2">
        <Tag :value="model.version" severity="secondary" class="text-xs" />
      </div>

      <!-- Star Badge -->
      <div v-if="model.isStarred" class="absolute top-2 left-2">
        <Tag icon="pi pi-star-fill" severity="warning" class="text-xs" />
      </div>

      <!-- Installation Status -->
      <div v-if="!model.isInstalled" class="absolute bottom-2 right-2">
        <Tag :value="$t('manager.install')" severity="info" class="text-xs" />
      </div>
    </div>

    <!-- Model Info -->
    <div class="p-3">
      <h3
        class="font-medium text-sm text-gray-900 dark:text-gray-100 truncate mb-1"
        :title="model.displayName || model.name"
      >
        {{ model.displayName || model.name }}
      </h3>

      <p
        v-if="model.author"
        class="text-xs text-gray-500 dark:text-gray-400 truncate mb-2"
      >
        {{ model.author }}
      </p>

      <div class="flex flex-wrap gap-1 mb-2">
        <Tag
          v-for="tag in model.tags?.slice(0, 2)"
          :key="tag"
          :value="tag"
          severity="secondary"
          class="text-xs"
        />
        <span
          v-if="model.tags && model.tags.length > 2"
          class="text-xs text-gray-400"
        >
          +{{ model.tags.length - 2 }}
        </span>
      </div>

      <div
        class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
      >
        <span v-if="model.size">{{ model.size }}</span>
        <span v-if="model.updatedAt">{{ formatDate(model.updatedAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'

import type { ModelInfo } from '@/types/model'

const {
  model,
  selected = false,
  showOnlyInstalled = false
} = defineProps<{
  model: ModelInfo
  selected?: boolean
  showOnlyInstalled?: boolean
}>()

defineEmits<{
  select: [modelId: string]
}>()

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString()
  } catch {
    return dateStr
  }
}

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<style scoped>
.model-card {
  transition: all 0.2s ease-in-out;
}

.model-card:hover {
  transform: translateY(-2px);
}
</style>
