<template>
  <div class="my-works-container">
    <!-- 用户信息顶部栏 -->
    <div class="user-info-header">
      <div class="user-info-left">
        <div class="user-avatar">
          <img src="@/assets/avatar.png" alt="用户头像" />
        </div>
        <div class="user-details">
          <div class="user-phone">192****7022</div>
          <div class="user-stats">
            <span class="stat-item">
              <span class="stat-value">0</span>
              <span class="stat-label">{{ $t('myWorks.credits') }}</span>
            </span>
            <span class="stat-item">
              <span class="stat-value">0</span>
              <span class="stat-label">{{ $t('myWorks.balance') }}</span>
            </span>
            <span class="stat-item">
              <span class="stat-value">2</span>
              <span class="stat-label">{{ $t('myWorks.usageCount') }}</span>
            </span>
            <span class="stat-item">
              <span class="stat-value">0</span>
              <span class="stat-label">{{ $t('myWorks.publishedCount') }}</span>
            </span>
          </div>
        </div>
      </div>
      <!-- <div class="user-info-right">
        <div class="platform-logo">
          <span class="logo-text">LibLib<sup>AI</sup></span>
        </div>
      </div> -->
    </div>

    <!-- 筛选和排序工具栏 -->
    <div class="works-toolbar">
      <div class="toolbar-left">
        <!-- 顶部标签页：全部、工作流、AI应用 -->
        <div class="category-tabs">
          <button 
            v-for="category in categoryOptions" 
            :key="category.value"
            class="category-tab"
            :class="{ 'active': selectedCategory === category.value }"
            @click="selectedCategory = category.value"
          >
            {{ category.label }}
          </button>
        </div>
      </div>
      
      <div class="toolbar-right">
        <!-- 状态筛选下拉菜单 -->
        <Select 
          v-model="selectedStatus" 
          :options="statusFilterOptions" 
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('myWorks.allStatus')"
          class="status-filter-select"
        />
        
        <!-- 最新排序下拉菜单 -->
        <Select 
          v-model="sortBy" 
          :options="sortOptions" 
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('myWorks.sortBy')"
          class="sort-select"
        />
        
        <!-- 删除按钮 -->
        <!-- <Button 
          icon="pi pi-trash" 
          severity="secondary"
          outlined
          class="delete-btn"
          v-tooltip="$t('myWorks.batchDelete')"
        /> -->
        
        <!-- 日期筛选按钮 -->
        <Button 
          :label="dateFilterLabel"
          icon="pi pi-calendar"
          severity="secondary"
          outlined
          class="date-filter-btn"
          @click="openDatePicker"
        />
        
        <!-- 日期选择器弹窗 -->
        <div v-if="showDatePicker" class="date-picker-overlay" @click="cancelDateRange">
          <div class="date-picker-container" @click.stop>
            <div class="date-picker-header">
              <h4>{{ $t('myWorks.selectDateRange') }}</h4>
              <Button 
                icon="pi pi-times" 
                severity="secondary" 
                text 
                size="small"
                @click="cancelDateRange"
              />
            </div>
            <div class="date-picker-content">
              <Calendar 
                v-model="tempDateRange"
                selectionMode="range"
                :inline="true"
                dateFormat="yy-mm-dd"
                :showButtonBar="true"
                @date-select="handleDateSelect"
              />
            </div>
            <div class="date-picker-footer">
              <Button 
                :label="$t('myWorks.cancelDateRange')"
                severity="secondary"
                outlined
                @click="cancelDateRange"
              />
              <Button 
                :label="$t('myWorks.confirmDateRange')"
                severity="primary"
                @click="confirmDateRange"
              />
              <!-- <Button 
                :label="$t('myWorks.clearDateRange')"
                severity="secondary"
                text
                @click="clearDateRange"
              /> -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 作品网格 -->
    <div class="works-grid">
      <div 
        v-for="work in filteredWorks" 
        :key="work.id"
        class="work-card"
        @click="viewWork(work)"
      >
        <!-- 封面图 -->
        <div class="work-cover">
          <img 
            v-if="work.coverImage" 
            :src="work.coverImage" 
            :alt="work.name"
            class="cover-image"
          />
          <div v-else class="cover-placeholder">
            <i class="pi pi-image"></i>
          </div>
          
          <!-- 状态标签 -->
          <div class="status-badge" :class="work.status">
            {{ getStatusLabel(work.status) }}
          </div>
          
          <!-- 悬浮操作按钮 -->
          <div class="work-actions">
            <Button 
              icon="pi pi-eye" 
              severity="secondary" 
              text 
              size="small"
              @click.stop="viewWork(work)"
              :aria-label="$t('myWorks.view')"
              v-tooltip="$t('myWorks.view')"
            />
            <Button 
              icon="pi pi-pencil" 
              severity="secondary" 
              text 
              size="small"
              @click.stop="editWork(work)"
              :aria-label="$t('myWorks.edit')"
              v-tooltip="$t('myWorks.edit')"
            />
            <Button 
              icon="pi pi-trash" 
              severity="danger" 
              text 
              size="small"
              @click.stop="deleteWork(work)"
              :aria-label="$t('myWorks.delete')"
              v-tooltip="$t('myWorks.delete')"
            />
          </div>
        </div>

        <!-- 作品信息 -->
        <div class="work-info">
          <h3 class="work-title">{{ work.name }}</h3>
          <p class="work-description">{{ work.description }}</p>
          
          <div class="work-meta">
            <div class="meta-item">
              <i class="pi pi-calendar"></i>
              <span>{{ formatDate(work.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <i class="pi pi-eye"></i>
              <span>{{ work.views || 0 }}</span>
            </div>
            <div class="meta-item">
              <i class="pi pi-heart"></i>
              <span>{{ work.likes || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredWorks.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="pi pi-folder-open"></i>
      </div>
      <h3 class="empty-title">{{ $t('myWorks.noWorks') }}</h3>
      <p class="empty-message">{{ $t('myWorks.noWorksMessage') }}</p>
      <Button 
        :label="$t('myWorks.createFirst')"
        icon="pi pi-plus"
        class="empty-action-btn"
        @click="createNewWork"
      />
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination-wrapper">
      <Paginator 
        v-model:first="first"
        :rows="rows"
        :totalRecords="totalRecords"
        :rowsPerPageOptions="[12, 24, 48]"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n' 
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Paginator from 'primevue/paginator'
import Tooltip from 'primevue/tooltip'
import Calendar from 'primevue/calendar'

// 注册指令
const vTooltip = Tooltip

const { t } = useI18n()
const router = useRouter()

// 作品数据接口
interface Work {
  id: string
  name: string
  description: string
  coverImage?: string
  status: 'published' | 'draft' | 'pending' | 'rejected'
  isPublic?: boolean
  createdAt: Date
  updatedAt: Date
  views?: number
  likes?: number
  category: string
  versions: {
    id: string
    name: string
    description: string
    images: string[]
  }[]
}

// 响应式数据
const works = ref<Work[]>([])
const selectedStatus = ref('all')
const sortBy = ref('updatedAt')
const first = ref(0)
const rows = ref(12)
const selectedCategory = ref('workflow')
const showDatePicker = ref(false)
const selectedDateRange = ref<Date[]>([])
const tempDateRange = ref<Date[]>([])

// 分类选项
const categoryOptions = ref([
  { label: t('myWorks.workflows'), value: 'workflow' },
  { label: t('myWorks.images'), value: 'image' }
])

// 状态筛选选项
const statusFilterOptions = ref([
  { label: t('myWorks.allStatus'), value: 'all' },
  { label: t('myWorks.publishedPublic'), value: 'published-public' },
  { label: t('myWorks.publishedPrivate'), value: 'published-private' },
  { label: t('myWorks.pending'), value: 'pending' },
  { label: t('myWorks.rejected'), value: 'rejected' }
])

// 日期筛选标签
const dateFilterLabel = computed(() => {
  if (selectedDateRange.value && selectedDateRange.value.length === 2) {
    const start = selectedDateRange.value[0]
    const end = selectedDateRange.value[1]
    if (start && end) {
      return `${formatDate(start)} - ${formatDate(end)}`
    }
  }
  return t('myWorks.selectDate')
})

// 排序选项
const sortOptions = ref([
  { label: t('myWorks.sortByUpdated'), value: 'updatedAt' },
  { label: t('myWorks.sortByCreated'), value: 'createdAt' },
  { label: t('myWorks.sortByName'), value: 'name' },
  { label: t('myWorks.sortByViews'), value: 'views' },
  { label: t('myWorks.sortByLikes'), value: 'likes' }
])

// 过滤后的作品
const filteredWorks = computed(() => {
  let filtered = works.value
  
  // 按分类过滤
  if (selectedCategory.value === 'workflow') {
    // 工作流包含原来的workflow和ai-app
    filtered = filtered.filter(work => work.category === 'workflow' || work.category === 'ai-app')
  } else if (selectedCategory.value === 'image') {
    filtered = filtered.filter(work => work.category === 'image')
  }
  
  // 按状态过滤
  if (selectedStatus.value !== 'all') {
    if (selectedStatus.value === 'published-public') {
      filtered = filtered.filter(work => work.status === 'published' && work.isPublic === true)
    } else if (selectedStatus.value === 'published-private') {
      filtered = filtered.filter(work => work.status === 'published' && work.isPublic === false)
    } else {
      filtered = filtered.filter(work => work.status === selectedStatus.value)
    }
  }
  
  // 按日期过滤
  if (selectedDateRange.value && selectedDateRange.value.length === 2) {
    const startDate = selectedDateRange.value[0]
    const endDate = selectedDateRange.value[1]
    if (startDate && endDate) {
      filtered = filtered.filter(work => {
        const workDate = new Date(work.createdAt)
        return workDate >= startDate && workDate <= endDate
      })
    }
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'views':
        return (b.views || 0) - (a.views || 0)
      case 'likes':
        return (b.likes || 0) - (a.likes || 0)
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'updatedAt':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })
  
  return filtered
})

// 分页相关
const totalRecords = computed(() => filteredWorks.value.length)
const totalPages = computed(() => Math.ceil(totalRecords.value / rows.value))

// 获取状态标签
const getStatusLabel = (status: string): string => {
  const labels = {
    published: t('myWorks.statusPublished'),
    draft: t('myWorks.statusDraft'),
    pending: t('myWorks.statusPending'),
    rejected: t('myWorks.statusRejected')
  }
  return labels[status as keyof typeof labels] || status
}

// 格式化日期
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

// 操作方法
const createNewWork = () => {
  // 使用 window.location.href 进行跳转，这会自动刷新页面
  window.location.href = '/#/create-ai-app'
}

const viewWork = (work: Work) => {
  console.log('查看作品:', work)
  // TODO: 跳转到作品详情页面
}

const editWork = (work: Work) => {
  console.log('编辑作品:', work)
  // TODO: 跳转到编辑页面
}

const deleteWork = (work: Work) => {
  console.log('删除作品:', work)
  // TODO: 实现删除确认和删除逻辑
}

// 加载作品数据
const loadWorks = async () => {
  // 模拟数据
  works.value = [
    {
      id: '1',
      name: '梦幻风景生成器',
      description: '创建美丽的梦幻风景图像，支持多种风格调节',
      coverImage: 'https://picsum.photos/200/300?text=梦幻风景',
      status: 'published',
      isPublic: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      views: 1250,
      likes: 89,
      category: 'ai-app',
      versions: [
        {
          id: 'v1',
          name: '版本 1.0',
          description: '基础版本',
          images: []
        }
      ]
    },
    {
      id: '2',
      name: '人物肖像优化',
      description: '专业的人物肖像图像增强和优化工具',
      coverImage: 'https://picsum.photos/200/300?text=人物肖像',
      status: 'pending',
      isPublic: false,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
      views: 45,
      likes: 12,
      category: 'ai-app',
      versions: [
        {
          id: 'v1',
          name: '版本 1.0',
          description: '基础版本',
          images: []
        }
      ]
    },
    {
      id: '3',
      name: '动漫风格转换',
      description: '将普通照片转换为精美的动漫风格图像',
      status: 'draft',
      isPublic: false,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-22'),
      views: 0,
      likes: 0,
      category: 'workflow',
      versions: [
        {
          id: 'v1',
          name: '版本 1.0',
          description: '草稿版本',
          images: []
        }
      ]
    },
    {
      id: '4',
      name: '机器人设计图',
      description: '未来科技感机器人概念设计',
      coverImage: 'https://picsum.photos/200/300?text=机器人',
      status: 'published',
      isPublic: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15'),
      views: 892,
      likes: 156,
      category: 'image',
      versions: [
        {
          id: 'v1',
          name: '版本 1.0',
          description: '高清版本',
          images: []
        }
      ]
    },
    {
      id: '5',
      name: '日式庭院',
      description: '传统日式庭院景观设计图',
      coverImage: 'https://picsum.photos/200/300?text=日式庭院',
      status: 'published',
      isPublic: false,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-16'),
      views: 234,
      likes: 67,
      category: 'image',
      versions: [
        {
          id: 'v1',
          name: '版本 1.0',
          description: '标准版本',
          images: []
        }
      ]
    },
    {
      id: '6',
      name: '抽象艺术作品',
      description: '现代抽象风格艺术创作',
      status: 'draft',
      isPublic: false,
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
      views: 0,
      likes: 0,
      category: 'image',
      versions: [
        {
          id: 'v1',
          name: '版本 1.0',
          description: '草稿版本',
          images: []
        }
      ]
    }
  ]
}

// 组件挂载时加载数据
onMounted(() => {
  loadWorks()
})

// 处理日期选择
const handleDateSelect = (date: Date) => {
  console.log('Selected date:', date)
  // 在这里可以添加日期选择的逻辑
}

// 确认日期范围选择
const confirmDateRange = () => {
  selectedDateRange.value = [...tempDateRange.value]
  showDatePicker.value = false
}

// 取消日期范围选择
const cancelDateRange = () => {
  tempDateRange.value = [...selectedDateRange.value]
  showDatePicker.value = false
}

// 清除日期范围
const clearDateRange = () => {
  selectedDateRange.value = []
  tempDateRange.value = []
  showDatePicker.value = false
}

// 打开日期选择器时初始化临时日期
const openDatePicker = () => {
  tempDateRange.value = [...selectedDateRange.value]
  showDatePicker.value = true
}
</script>

<style scoped>
.my-works-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.6s ease-out;
  height: 100%;
  box-sizing: border-box;
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

/* 用户信息顶部栏 */
.user-info-header {
  background: var(--p-surface-0);
  padding: 20px 24px;
  margin: -24px -24px 32px -24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--p-surface-900);
  border-bottom: 1px solid var(--p-surface-200);
}

.user-info-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--p-surface-200);
  background: var(--p-surface-100);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-phone {
  font-size: 18px;
  font-weight: 600;
  color: var(--p-surface-900);
}

.user-stats {
  display: flex;
  gap: 24px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  color: var(--p-primary-600);
}

.stat-label {
  color: var(--p-surface-600);
}

.user-info-right {
  /* 保持原有样式 */
}

.platform-logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: var(--p-primary-600);
  letter-spacing: -0.5px;
}

.logo-text sup {
  font-size: 14px;
  font-weight: 500;
  color: var(--p-surface-600);
  margin-left: 2px;
}

/* 筛选和排序工具栏 */
.works-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 24px;
}

.toolbar-left {
  /* flex: 1; */
}

.category-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--p-surface-200);
  margin-bottom: 24px;
}

.category-tab {
  padding: 16px 24px;
  border: none;
  background: transparent;
  color: var(--p-surface-600);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-bottom: 3px solid transparent;
}

.category-tab:hover {
  color: var(--p-primary-500);
  background: var(--p-surface-50);
}

.category-tab.active {
  color: var(--p-primary-600);
  background: transparent;
  border-bottom-color: var(--p-primary-500);
  font-weight: 600;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.status-filter-select {
  min-width: 180px;
}

.sort-select {
  min-width: 180px;
}

.delete-btn {
  background: var(--p-primary-500);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: var(--p-primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--p-primary-color-rgb), 0.3);
}

.date-filter-btn {
  background: var(--p-surface-0);
  color: var(--p-surface-700);
  border: 1px solid var(--p-surface-300);
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 150px;
}

.date-filter-btn:hover {
  background: var(--p-surface-50);
  border-color: var(--p-primary-300);
  transform: translateY(-1px);
}

/* 作品网格 */
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.work-card {
  background: var(--p-surface-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--p-surface-200);
  transition: all 0.3s ease;
  cursor: pointer;
}

.work-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-color: var(--p-primary-200);
}

.work-cover {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: var(--p-surface-100);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.work-card:hover .cover-image {
  transform: scale(1.05);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--p-surface-400);
  font-size: 48px;
  background: linear-gradient(135deg, var(--p-surface-100), var(--p-surface-200));
}

.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.published {
  background: var(--p-green-100);
  color: var(--p-green-700);
}

.status-badge.draft {
  background: var(--p-surface-100);
  color: var(--p-surface-600);
}

.status-badge.pending {
  background: var(--p-orange-100);
  color: var(--p-orange-700);
}

.status-badge.rejected {
  background: var(--p-red-100);
  color: var(--p-red-700);
}

.work-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.work-card:hover .work-actions {
  opacity: 1;
}

.work-actions .p-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.work-info {
  padding: 20px;
}

.work-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--p-surface-900);
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.work-description {
  font-size: 14px;
  height: 40px;
  display: webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--p-surface-600);
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.work-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--p-surface-500);
}

.meta-item i {
  font-size: 14px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: var(--p-surface-card);
  border-radius: 16px;
  border: 1px solid var(--p-surface-200);
}

.empty-icon {
  font-size: 64px;
  color: var(--p-surface-300);
  margin-bottom: 24px;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--p-surface-700);
  margin: 0 0 12px 0;
}

.empty-message {
  font-size: 16px;
  color: var(--p-surface-500);
  line-height: 1.5;
  margin: 0 0 32px 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.empty-action-btn {
  background: var(--p-primary-500);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
}

.empty-action-btn:hover {
  background: var(--p-primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--p-primary-color-rgb), 0.3);
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-works-container {
    padding: 16px;
  }
  
  .works-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .toolbar-right {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .category-tabs {
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  
  .category-tabs::-webkit-scrollbar {
    display: none;
  }
  
  .category-tab {
    white-space: nowrap;
    padding: 14px 20px;
    font-size: 15px;
  }
  
  .works-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  
  .status-filter-select,
  .sort-select {
    min-width: 140px;
  }
  
  .date-filter-btn {
    min-width: 120px;
    font-size: 14px;
  }
  
  .user-info-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .user-info-left {
    flex-direction: column;
    gap: 12px;
  }
  
  .user-stats {
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .logo-text {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .works-grid {
    grid-template-columns: 1fr;
  }
  
  .work-meta {
    gap: 12px;
  }
  
  .empty-state {
    padding: 60px 16px;
  }
}

/* 日期选择器弹窗样式 */
.date-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.date-picker-container {
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: zoomIn 0.3s ease;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--p-surface-200);
  background: var(--p-surface-50);
}

.date-picker-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--p-surface-900);
}

.date-picker-content {
  padding: 24px;
}

.date-picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--p-surface-200);
  background: var(--p-surface-0);
}
</style> 