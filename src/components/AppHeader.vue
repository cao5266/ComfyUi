<template>
  <header class="app-header">
    <div class="header-content">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-logo">
            <img src="/assets/images/favicon_progress_16x16/frame_9.png" alt=""  class="logo-icon">
          <span class="brand-text">Comfyui</span>
        </div>
      </div>

      <!-- 右侧导航区域 -->
      <div class="nav-section">
        <div class="nav-item recharge">
          <i class="pi pi-folder"></i>
          <span>{{ $t('header.recharge') }}</span>
        </div>
        <div class="user-avatar">
          <img src="@/assets/avatar.png" :alt="$t('header.userAvatar')" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Header组件逻辑
</script>

<style scoped>
.app-header {
  width: 100%;
  height: 48px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
  z-index: 1000;
  transition: all 0.3s ease;
}

.dark .app-header {
  background: #1f2937;
  border-bottom: 1px solid #374151;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
  max-width: 100%;
}

.brand-section {
  display: flex;
  align-items: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1f2937;
}

.dark .brand-logo {
  color: #ffffff;
}

.logo-icon {
  width: 24px;
  height: 24px;
  color: #4F46E5;
}

.brand-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.brand-ai {
  color: #60A5FA;
  font-weight: 700;
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

.recharge{
    background: #f3f4f6;
}

.dark .nav-item {
  color: #d1d5db;
}

.nav-item:hover {
  background: #e7e7e7;
  color: #1f2937;
}


.dark .nav-item:hover {
  color: #ffffff;
}

.nav-item i {
  font-size: 16px;
}

.notification {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: 8px;
  background: #EF4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  line-height: 1;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark .user-avatar {
  border-color: #4b5563;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 12px;
  }
  
  .nav-section {
    gap: 16px;
  }
  
  .nav-item span {
    display: none;
  }
  
  .nav-item {
    padding: 6px;
  }
}

@media (max-width: 480px) {
  .nav-section {
    gap: 12px;
  }
  
  .brand-text {
    font-size: 16px;
  }
}
</style> 