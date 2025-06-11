<template>
  <div
    class="model-card group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 ease-out"
    @click="$emit('select', model.id)"
  >
    <!-- Background Image -->
    <div class="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-900">
      <img
        v-if="model.previewImage"
        :src="model.previewImage"
        :alt="model.displayName || model.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        @error="onImageError"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 dark:bg-gray-800"
      >
        <i class="pi pi-image text-4xl"></i>
      </div>

      <!-- Version Badge -->
      <div class="absolute top-3 right-3 z-10">
        <div class="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
          {{ model.version }}
        </div>
      </div>

      <!-- Star Badge -->
      <div v-if="model.isStarred" class="absolute top-3 left-3 z-10">
        <div class="bg-yellow-500 text-white p-1 rounded-full starBadge">
          <i class="pi pi-star-fill text-xs"></i>
        </div>
      </div>

      <!-- Installation Status -->
      <div v-if="!model.isInstalled" class="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
        <div class="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
          {{ $t('manager.install') }}
        </div>
      </div>
    </div>

    <!-- Bottom Info Overlay -->
    <div class="absolute bottom-0 left-0 right-0 z-20">
      <!-- Background Overlay -->
      <div class="bg-gradient-to-t from-black via-black/80 to-transparent h-28 absolute inset-0 transition-all duration-300 group-hover:h-36"></div>
      
      <!-- Content Container -->
      <div class="contentContainer  relative p-4 text-white transition-all duration-300 group-hover:pb-16">
        <!-- Model Info -->
        <div class="transition-all duration-300 group-hover:-translate-y-2">
          <h3 class="font-medium text-sm truncate mb-1" :title="model.displayName || model.name">
            {{ model.displayName || model.name }}
          </h3>
          
          <div class="flex items-center justify-between text-xs opacity-90">
            <span v-if="model.author" class="truncate">{{ model.author }}</span>
          </div>
        </div>

        <!-- Action Button - Appears on Hover -->
        <div class="absolute bottom-4 left-4 right-4 transition-all duration-300 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            class="apply-button w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors duration-200"
            @click.stop="handleApply"
          >
            {{ $t('g.oneClickApply') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
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

const emit = defineEmits<{
  select: [modelId: string]
  apply: [model: ModelInfo]
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

const handleApply = () => {
  emit('apply', model)
}
</script>

<style scoped>

.aspect-square{
    aspect-ratio: 3 / 4;
}

.starBadge{
    padding: 4px 7px;
}

.contentContainer{
    background-color: rgba(0, 0, 0, 0.2);
    padding: 8px 10px;
}

.apply-button {
  border: none;
  outline: none;
  box-shadow: none;
  cursor: pointer;
  background-color: #037af1;
}

.apply-button:hover {
  background-color: #1987f5;
}

.apply-button:focus {
  outline: none;
  box-shadow: none;
}

.apply-button:active {
  outline: none;
  box-shadow: none;
}

.model-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  height: auto;
}

.model-card:hover .aspect-square img{
    transform: scale(1.1);
}

</style>
