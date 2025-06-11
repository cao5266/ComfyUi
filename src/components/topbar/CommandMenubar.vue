<template>
  <Menubar
    :model="translatedItems"
    class="top-menubar border-none p-0 bg-transparent"
    :pt="{
      rootList: 'gap-0 flex-nowrap w-auto',
      submenu: `dropdown-direction-${dropdownDirection}`,
      item: 'relative'
    }"
  >
    <template #item="{ item, props, root }">
      <a
        class="p-menubar-item-link"
        :class="{ 'icon-only-root': root && isIconOnlyRootItem(item) }"
        v-bind="props.action"
        :href="item.url"
        target="_blank"
        :title="
          root && isIconOnlyRootItem(item) ? getItemLabel(item) : undefined
        "
      >
        <!-- 根级菜单项：只显示图标，添加tooltip -->
        <template v-if="root && isIconOnlyRootItem(item)">
          <span
            v-if="item.icon"
            class="p-menubar-item-icon"
            :class="item.icon"
          />
          <span
            v-else
            class="p-menubar-item-icon"
            :class="getMenuIcon(item.label)"
          />
        </template>
        <!-- 子菜单项：显示图标和文字 -->
        <template v-else>
          <span
            v-if="item.icon"
            class="p-menubar-item-icon"
            :class="item.icon"
          />
          <span class="p-menubar-item-label">{{ item.label }}</span>
          <span
            v-if="item?.comfyCommand?.keybinding"
            class="ml-auto border border-surface rounded text-muted text-xs text-nowrap p-1 keybinding-tag"
          >
            {{ item.comfyCommand.keybinding.combo.toString() }}
          </span>
          <i v-if="!root && item.items" class="ml-auto pi pi-angle-right" />
        </template>
      </a>
    </template>
  </Menubar>
</template>

<script setup lang="ts">
import Menubar from 'primevue/menubar'
import type { MenuItem } from 'primevue/menuitem'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useMenuItemStore } from '@/stores/menuItemStore'
import { useSettingStore } from '@/stores/settingStore'
import { normalizeI18nKey } from '@/utils/formatUtil'

const settingStore = useSettingStore()
const dropdownDirection = computed(() =>
  settingStore.get('Comfy.UseNewMenu') === 'Top' ? 'down' : 'up'
)

const menuItemsStore = useMenuItemStore()
const { t } = useI18n()

// 判断是否为只显示图标的根级菜单项
const isIconOnlyRootItem = (item: MenuItem): boolean => {
  const label = typeof item.label === 'function' ? item.label() : item.label
  // 支持所有语言的菜单标签 - 通过英文原始标签判断
  const originalLabel =
    typeof item.label === 'function' ? item.label() : item.label

  // 通过国际化key来判断，而不是依赖翻译后的文本
  const iconOnlyKeys = [
    'Browse Templates',
    'New',
    'Open',
    'Save',
    'Export',
    'Edit',
    'Publish'
  ]

  // 首先尝试通过原始英文标签判断
  if (iconOnlyKeys.includes(originalLabel as string)) {
    return true
  }

  // 如果是翻译后的标签，通过逆向查找原始key
  for (const key of iconOnlyKeys) {
    const translatedLabel = t(`menuLabels.${normalizeI18nKey(key)}`, key)
    if (translatedLabel === label) {
      return true
    }
  }

  return false
}

// 获取菜单项的label字符串
const getItemLabel = (item: MenuItem): string => {
  return typeof item.label === 'function' ? item.label() : item.label || ''
}

// 根据菜单标签获取对应的图标
const getMenuIcon = (
  label: string | ((...args: any) => string) | undefined
): string => {
  const labelStr = typeof label === 'function' ? label() : label || ''

  // 通过逆向查找原始英文key来获取图标
  const iconOnlyKeys = [
    'Browse Templates',
    'New',
    'Open',
    'Save',
    'Export',
    'Edit',
    'Publish'
  ]

  for (const key of iconOnlyKeys) {
    const translatedLabel = t(`menuLabels.${normalizeI18nKey(key)}`, key)
    if (translatedLabel === labelStr || key === labelStr) {
      // 根据英文原始key返回对应图标
      const iconMap: Record<string, string> = {
        'Browse Templates': 'pi pi-image', // 浏览模板图标
        New: 'pi pi-plus', // 新建图标
        Open: 'pi pi-folder-open', // 打开图标
        Save: 'pi pi-save', // 保存图标
        Export: 'pi pi-download', // 导出图标
        Edit: 'pi pi-pencil', // 编辑图标
        Publish: 'pi pi-send' // 发布图标
      }
      return iconMap[key] || 'pi pi-circle'
    }
  }

  return 'pi pi-circle'
}

const translateMenuItem = (item: MenuItem): MenuItem => {
  const label = typeof item.label === 'function' ? item.label() : item.label
  const translatedLabel = label
    ? t(`menuLabels.${normalizeI18nKey(label)}`, label)
    : undefined

  return {
    ...item,
    label: translatedLabel,
    items: item.items?.map(translateMenuItem)
  }
}

const translatedItems = computed(() =>
  menuItemsStore.menuItems.map(translateMenuItem)
)
</script>

<style scoped>
:deep(.p-menubar-submenu.dropdown-direction-up) {
  @apply top-auto bottom-full flex-col-reverse;
}

.keybinding-tag {
  background: var(--p-content-hover-background);
  border-color: var(--p-content-border-color);
  border-style: solid;
}

/* 根级菜单项只显示图标的样式 */
.icon-only-root {
  min-width: 2.5rem !important;
  padding: 0.5rem !important;
  justify-content: center !important;
}

.icon-only-root .p-menubar-item-icon {
  font-size: 1.2rem !important;
  margin: 0 !important;
}

/* 为根级图标菜单添加悬停效果 */
:deep(.p-menubar-root-list > .p-menubar-item > .icon-only-root:hover) {
  background-color: var(--p-content-hover-background) !important;
  border-radius: 6px;
}
</style>
