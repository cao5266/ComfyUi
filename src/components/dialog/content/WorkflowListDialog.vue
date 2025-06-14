<template>
    <div class="workflow-list-dialog">
        <!-- 工作流网格 -->
        <div class="workflow-grid">
            <!-- 新建工作流卡片 -->
            <div class="workflow-card new-workflow-card" @click="createNewWorkflow">
                <div class="card-content">
                    <div class="addNewBox">
                        <img src="@/assets/add.svg" alt="" class="new-workflow-icon">
                        <div class="card-title">
                            {{ $t("workflowList.newWorkflow") }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 历史工作流卡片 -->
            <div v-for="workflow in publishedWorkflows" :key="workflow.id"
                class="workflow-card published-workflow-card">
                <div class="card-content">
                    <!-- 工作流缩略图 -->
                    <div class="workflow-thumbnail">
                        <img v-if="workflow.thumbnail" :src="workflow.thumbnail" :alt="workflow.name"
                            class="thumbnail-image" />
                        <div v-else class="thumbnail-placeholder">
                            <i class="pi pi-image"></i>
                        </div>
                    </div>

                    <!-- 工作流名称 -->
                    <div class="card-title">
                        {{ workflow.name }}
                    </div>

                    <!-- 悬浮时显示的刷新按钮 -->
                    <div class="refresh-button" @click.stop="refreshWorkflow(workflow)">
                        <i class="pi pi-refresh"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- 如果没有历史工作流，显示空状态 -->
        <div v-if="publishedWorkflows.length === 0" class="empty-state">
            <div class="empty-icon">
                <i class="pi pi-folder-open"></i>
            </div>
            <p class="empty-text">
                {{ $t("workflowList.noPublishedWorkflows") }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDialogStore } from "@/stores/dialogStore";

interface PublishedWorkflow {
    id: string;
    name: string;
    thumbnail?: string;
    publishDate: Date;
    description?: string;
}

const dialogStore = useDialogStore();
const router = useRouter();

// 已发布的工作流列表
const publishedWorkflows = ref<PublishedWorkflow[]>([]);

/**
 * 组件挂载时加载历史工作流
 */
onMounted(() => {
    loadPublishedWorkflows();
});

/**
 * 加载已发布的工作流列表
 */
const loadPublishedWorkflows = async () => {
    try {
        // TODO: 从API或本地存储加载已发布的工作流
        // 这里先使用模拟数据
        publishedWorkflows.value = [
            {
                id: "1",
                name: "5218511515",
                thumbnail: "https://picsum.photos/200/300",
                publishDate: new Date("2024-01-15"),
                description: "用于生成可爱动物角色的工作流",
            },
            {
                id: "2",
                name: "的产品",
                thumbnail: "https://picsum.photos/200/300",
                publishDate: new Date("2024-01-10"),
                description: "人物头像生成工作流",
            },
        ];
    } catch (error) {
        console.error("加载工作流列表失败:", error);
    }
};

/**
 * 创建新工作流
 */
const createNewWorkflow = () => {
    console.log("创建新工作流");
    dialogStore.closeDialog();
    // 使用Vue Router进行导航
    router.push('/create-ai-app');
};

/**
 * 选择已发布的工作流
 */
const selectWorkflow = (workflow: PublishedWorkflow) => {
    console.log("选择工作流:", workflow);
    // TODO: 实现选择工作流的逻辑，比如重新发布或编辑
    dialogStore.closeDialog();
};

/**
 * 刷新工作流
 */
const refreshWorkflow = (workflow: PublishedWorkflow) => {
    console.log("刷新工作流:", workflow);
    // TODO: 实现刷新工作流的逻辑
};

</script>

<style scoped>
.workflow-list-dialog {
    width: 100%;
    max-width: 90vw;
    padding: 1.5rem;
    max-height: 70vh;
    overflow-y: auto;
    box-sizing: border-box;
}

.workflow-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.workflow-card {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 180px;
    height: 245px;
    border-radius: 12px;
    cursor: pointer;
    background: white;
    position: relative;
    overflow: hidden;
}

.dark .workflow-card {
    background: #2d3748;
    border-color: #4a5568;
}

.workflow-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.dark .workflow-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.card-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
}

.addNewBox {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
}

.addNewBox .card-title {
    position: static;
    font-size: 14px;
    color: #326bff;
}

.card-content:hover .refresh-button {
    opacity: 1;
}

.card-content:hover .thumbnail-image {
    transform: scale(1.1);
}

/* 新建工作流卡片样式 */
.new-workflow-card {
    width: 180px;
    height: 245px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
}

.dark .new-workflow-card {
    background: #374151;
    border: 1px solid #4b5563;
}

.new-workflow-card:hover {
    background: #e5e7eb;
    border-color: #3b82f6;
}

.dark .new-workflow-card:hover {
    background: #4b5563;
}

.new-workflow-icon {
    width: 40px;
    height: 40px;
}


/* 已发布工作流卡片样式 */
.published-workflow-card {
    border-color: #d1d5db;
}

.workflow-thumbnail {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.dark .workflow-thumbnail {
    background: #4b5563;
}

.thumbnail-image {
    width: 100%;
    height: 100%;
    transition: all 0.3s ease;
    object-fit: cover;
}

.thumbnail-placeholder {
    font-size: 32px;
    color: #9ca3af;
}

.dark .thumbnail-placeholder {
    color: #6b7280;
}

.card-title {
    position: absolute;
    bottom: 20px;
    font-weight: 500;
    color: #ffffff;
    font-size: 14px;
    line-height: 1.4;
    word-break: break-word;
}

.dark .card-title {
    color: #f9fafb;
}

/* 刷新按钮样式 */
.refresh-button {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    opacity: 0;
    background-color: rgba(0, 0, 0, 0.5);
}

.pi-refresh {
    font-size: 24px;
}

/* 空状态样式 */
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6b7280;
}

.dark .empty-state {
    color: #9ca3af;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-text {
    font-size: 16px;
    margin: 0;
}
</style>
 