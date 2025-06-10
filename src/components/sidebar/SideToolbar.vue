<template>
  <teleport :to="teleportTarget">
    <nav class="side-tool-bar-container" :class="{ 'small-sidebar': isSmall }">
      <SidebarIcon
        v-for="tab in tabs"
        :key="tab.id"
        :icon="tab.icon"
        :icon-badge="tab.iconBadge"
        :tooltip="getTabTooltip(tab) + getTabTooltipSuffix(tab)"
        :selected="tab.id === selectedTab?.id"
        :class="tab.id + '-tab-button'"
        @click="onTabClick(tab)"
      />
      <div class="side-tool-bar-end">
        <SidebarLogoutIcon v-if="userStore.isMultiUserServer" />
        <!-- 已隐藏：主题切换和设置按钮 -->
        <!-- <SidebarThemeToggleIcon /> -->
        <SidebarSettingsToggleIcon />
      </div>
    </nav>
  </teleport>
  <div
    v-if="selectedTab"
    class="sidebar-content-container h-full overflow-y-auto overflow-x-hidden"
  >
    <ExtensionSlot :extension="selectedTab" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ExtensionSlot from '@/components/common/ExtensionSlot.vue'
import { useKeybindingStore } from '@/stores/keybindingStore'
import { useSettingStore } from '@/stores/settingStore'
import { useUserStore } from '@/stores/userStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { SidebarTabExtension } from '@/types/extensionTypes'

import SidebarIcon from './SidebarIcon.vue'
import SidebarLogoutIcon from './SidebarLogoutIcon.vue'
// 已隐藏的组件导入
import SidebarSettingsToggleIcon from './SidebarSettingsToggleIcon.vue'

// import SidebarThemeToggleIcon from './SidebarThemeToggleIcon.vue'

const workspaceStore = useWorkspaceStore()
const settingStore = useSettingStore()
const userStore = useUserStore()
const { t } = useI18n()

const teleportTarget = computed(() =>
  settingStore.get('Comfy.Sidebar.Location') === 'left'
    ? '.comfyui-body-left'
    : '.comfyui-body-right'
)

const isSmall = computed(
  () => settingStore.get('Comfy.Sidebar.Size') === 'small'
)

const tabs = computed(() => workspaceStore.getSidebarTabs())
const selectedTab = computed(() => workspaceStore.sidebarTab.activeSidebarTab)
const onTabClick = (item: SidebarTabExtension) => {
  workspaceStore.sidebarTab.toggleSidebarTab(item.id)
}
const keybindingStore = useKeybindingStore()

/**
 * 动态获取tab的tooltip，支持国际化
 */
const getTabTooltip = (tab: SidebarTabExtension): string => {
  // 为已知的tab ID提供动态国际化支持
  const tooltipMap: Record<string, string> = {
    'node-library': t('sideToolbar.nodeLibrary'),
    queue: t('sideToolbar.queue'),
    workflows: t('sideToolbar.workflows'),
    'model-library': t('sideToolbar.modelLibrary'),
    downloads: t('sideToolbar.downloads')
  }

  // 如果找到映射的国际化key，使用动态翻译；否则使用原始tooltip
  return tooltipMap[tab.id] || tab.tooltip || tab.title || ''
}

const getTabTooltipSuffix = (tab: SidebarTabExtension) => {
  const keybinding = keybindingStore.getKeybindingByCommandId(
    `Workspace.ToggleSidebarTab.${tab.id}`
  )
  return keybinding ? ` (${keybinding.combo.toString()})` : ''
}
</script>

<style scoped>
.side-tool-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: var(--sidebar-width);
  height: 100%;

  background-color: var(--comfy-menu-secondary-bg);
  color: var(--fg-color);
  box-shadow: var(--bar-shadow);

  --sidebar-width: 3rem;
  --sidebar-icon-size: 1.25rem;
}

.side-tool-bar-container.small-sidebar {
  --sidebar-width: 2.5rem;
  --sidebar-icon-size: 1rem;
}

.side-tool-bar-end {
  align-self: flex-end;
  margin-top: auto;
}
</style>
