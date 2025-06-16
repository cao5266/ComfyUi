<template>
  <header class="app-header">
    <div class="header-content">
      <!-- 左侧品牌区域 -->
      <div class="brand-section" @click="router.push('/')">
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
        <!-- 用户头像下拉菜单 -->
        <div 
          class="user-avatar-wrapper"
          @mouseenter="showDropdown = true"
          @mouseleave="showDropdown = false"
        >
          <div class="user-avatar">
            <img src="@/assets/avatar.png" :alt="$t('header.userAvatar')" />
          </div>
          <!-- 下拉菜单 -->
          <div class="dropdown-menu" v-show="showDropdown">
            <div class="dropdown-item" @click="handleMyWorks">
              <i class="pi pi-briefcase"></i>
              <span>{{ $t('header.myWorks') }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout" @click="handleLogout">
              <i class="pi pi-sign-out"></i>
              <span>{{ $t('header.logout') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 控制下拉菜单显示状态
 */
const showDropdown = ref(false)

/**
 * 处理"我的作品"点击事件
 */
const handleMyWorks = () => {
  // 使用 window.location.href 进行跳转，这会自动刷新页面
  window.location.href = window.location.origin + '/#/my-works'
  showDropdown.value = false
}

/**
 * 处理"退出登录"点击事件  
 */
const handleLogout = () => {
  // TODO: 执行退出登录逻辑
  console.log('Logout')
  showDropdown.value = false
}
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
  cursor: pointer;
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

/* 用户头像下拉菜单样式 */
.user-avatar-wrapper {
  position: relative;
  display: inline-block;
  z-index: 9999;
}

/* .user-avatar-wrapper:hover .dropdown-menu {
  display: block;
} */

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  min-width: 160px;
  padding: 4px 0;
  animation: fadeInDown 0.2s ease-out;
  transition: height 0.2s ease-out;
}

/* 添加透明连接区域，避免鼠标移动时菜单消失 */
.dropdown-menu::after {
  content: '';
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  height: 8px;
  background: transparent;
}

.dark .dropdown-menu {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.dark .dropdown-item {
  color: #d1d5db;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.dark .dropdown-item:hover {
  background: #374151;
  color: #ffffff;
}

.dropdown-item.logout {
  color: #dc2626;
}

.dark .dropdown-item.logout {
  color: #f87171;
}

.dropdown-item.logout:hover {
  background: #fee2e2;
  color: #dc2626;
}

.dark .dropdown-item.logout:hover {
  background: #7f1d1d;
  color: #f87171;
}

.dropdown-item i {
  font-size: 16px;
  width: 16px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}

.dark .dropdown-divider {
  background: #374151;
}

/* 下拉菜单动画 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 下拉菜单箭头 */
.dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 12px;
  width: 12px;
  height: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-right: none;
  border-bottom: none;
  transform: rotate(45deg);
  z-index: 1002;
}

.dark .dropdown-menu::before {
  background: #1f2937;
  border-color: #374151;
  z-index: 1002;
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
  
  /* 移动端下拉菜单优化 */
  .dropdown-menu {
    right: -8px;
    min-width: 140px;
  }
  
  .dropdown-menu::before {
    right: 16px;
  }
}

@media (max-width: 480px) {
  .nav-section {
    gap: 12px;
  }
  
  .brand-text {
    font-size: 16px;
  }
  
  /* 小屏幕下拉菜单适配 */
  .dropdown-menu {
    right: -16px;
    left: auto;
    transform: none;
  }
  
  .dropdown-item {
    padding: 10px 12px;
    font-size: 15px;
  }
  
  .dropdown-item i {
    font-size: 18px;
  }
}
</style> 