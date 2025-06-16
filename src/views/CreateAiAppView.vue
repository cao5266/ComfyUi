<!--
使用说明：从编辑工作流页面跳转到此页面

在编辑工作流页面使用以下代码跳转：

```javascript
// 保存工作流数据到 localStorage
localStorage.setItem('currentWorkflow', JSON.stringify(workflowData))
localStorage.setItem('currentWorkflowFileName', 'my-workflow.json')

// 跳转到创建AI应用页面
router.push('/create-ai-app')
```

工作流数据会在用户进入第二步（编辑版本）时自动从 localStorage 读取并显示预览
-->

<template>
    <div class="create-ai-app-container">
        <!-- 步骤指示器 -->
        <StepIndicator :steps="steps" :active-step="activeStep" />

        <!-- 滚动内容区域 -->
        <div class="content-scroll">
            <div class="content-wrapper">
                <!-- 第一步：编辑AI应用 -->
                <div v-if="activeStep === 0" class="step-content">
                    <div class="content-grid">
                        <!-- 左侧表单 -->
                        <div class="form-section">
                            <FormField 
                                :label="$t('createAiApp.appName')"
                                :model-value="formData.appName"
                                :max-length="30"
                                :show-char-count="true"
                                required
                            >
                                <InputText 
                                    v-model="formData.appName"
                                    :placeholder="$t('createAiApp.appNamePlaceholder')" 
                                    :maxlength="30" 
                                />
                                <Message v-if="!appNameValid && appNameTouched" severity="error" size="small" variant="simple">{{ $t('createAiApp.appNameRequired') }}</Message>
                            </FormField>

                            <FormField 
                                :label="$t('createAiApp.contentCategory')"
                                :hint="$t('createAiApp.categoryHint')"
                                :link-text="$t('createAiApp.categoryGuide')"
                                link-href="#"
                            >
                                <Select 
                                    name="category"
                                    v-model="formData.category" 
                                    :options="categories" 
                                    optionLabel="label"
                                    optionValue="value" 
                                    :placeholder="$t('createAiApp.selectCategory')" 
                                    fluid
                                />
                                <Message v-if="!categoryValid && categoryTouched" severity="error" size="small" variant="simple">{{ $t('createAiApp.categoryRequired') }}</Message>
                            </FormField>

                            <FormField 
                                :label="$t('createAiApp.participateActivity')"
                                :hint="$t('createAiApp.activityHint')"
                                :link-text="$t('createAiApp.activityDetails')"
                                link-href="#"
                            >
                                <Select 
                                    name="activity"
                                    v-model="formData.activity" 
                                    :options="activities" 
                                    optionLabel="label"
                                    optionValue="value" 
                                    :placeholder="$t('createAiApp.selectActivity')" 
                                    fluid
                                />
                                <Message v-if="!activityValid && activityTouched" severity="error" size="small" variant="simple">{{ $t('createAiApp.activityRequired') }}</Message>
                            </FormField>
                        </div>

                        <!-- 右侧配置 -->
                        <div class="config-section">
                            <!-- 可见性模块 -->
                            <ConfigCard :title="$t('createAiApp.visibility')">
                                <RadioGroup 
                                    v-model="formData.isPublic"
                                    :options="publicOptions"
                                    direction="row"
                                />
                                <div v-if="formData.isPublic" class="visibility-hint public">
                                    {{ $t('createAiApp.publicHint') }}
                                </div>
                                <div v-else class="visibility-hint private">
                                    {{ $t('createAiApp.privateHint') }}
                                </div>
                            </ConfigCard>

                            <!-- 原创性模块 -->
                            <ConfigCard :title="$t('createAiApp.originalWork')">
                                <RadioGroup 
                                    v-model="formData.isOriginal"
                                    :options="originalOptions"
                                    direction="row"
                                />
                                <div v-if="formData.isOriginal" class="originality-hint original">
                                    {{ $t('createAiApp.originalHint') }}
                                </div>
                                <div v-else class="originality-hint reproduced">
                                    {{ $t('createAiApp.reproducedHint') }}
                                </div>
                            </ConfigCard>

                            <!-- 使用权限与声明模块 -->
                            <ConfigCard :title="$t('createAiApp.usagePermissionsAndStatement')">
                                <div class="checkbox-list">
                                    <div class="checkbox-item">
                                        <Checkbox v-model="formData.allowCommercialUse" binary />
                                        <span>{{ $t('createAiApp.allowCommercialUse') }}</span>
                                    </div>
                                    <div class="checkbox-item">
                                        <Checkbox v-model="formData.allowModification" binary />
                                        <span>{{ $t('createAiApp.allowModification') }}</span>
                                    </div>
                                </div>
                                <ul class="agreement-list">
                                    <li>请勿转载境外模型</li>
                                    <li>请勿上传色情、暴力等违法内容</li>
                                    <li>不得侵害他人依法享有的知识产权</li>
                                    <li>您所上传的内容需使用具有合法来源的数据</li>
                                    <li>Lib将会对上传的所有内容进行安全审核</li>
                                    <li>许可范围为创作者本人设置，使用者需按规范使用</li>
                                </ul>
                            </ConfigCard>
                        </div>
                    </div>
                </div>

                <!-- 第二步：编辑版本 -->
                <div v-else-if="activeStep === 1" class="step-content">
                    <!-- 版本管理头部 -->
                    <div class="version-management-header">
                        <div class="version-actions">
                            <Button 
                                :label="$t('createAiApp.addVersion')" 
                                icon="pi pi-plus"
                                class="version-btn primary" 
                                @click="addVersion" 
                            />
                            <Button 
                                :label="isVersionInfoExpanded ? $t('createAiApp.collapseVersionInfo') : $t('createAiApp.expandVersionInfo')" 
                                :icon="isVersionInfoExpanded ? 'pi pi-eye-slash' : 'pi pi-eye'"
                                class="version-btn secondary"
                                @click="isVersionInfoExpanded = !isVersionInfoExpanded" 
                            />
                        </div>
                        <div class="version-hint">
                            {{ $t('createAiApp.versionHint') }}
                        </div>
                    </div>

                    <!-- 版本列表 -->
                    <div class="versions-container">
                        <div 
                            v-for="(version, index) in versions" 
                            :key="version.id"
                            class="version-card"
                        >
                            <div class="version-card-content">
                                <div class="version-form">
                                    <!-- 版本名 -->
                                    <FormField 
                                        :label="$t('createAiApp.versionName')"
                                        :model-value="version.name"
                                        :max-length="15"
                                        :show-char-count="isVersionInfoExpanded"
                                        required
                                    >
                                        <!-- 展开状态：可编辑 -->
                                        <InputText 
                                            v-if="isVersionInfoExpanded"
                                            v-model="version.name"
                                            :placeholder="$t('createAiApp.versionNamePlaceholder')" 
                                            :maxlength="15"
                                        />
                                        <!-- 收起状态：只读显示 -->
                                        <div 
                                            v-else
                                            class="version-name-preview"
                                            :class="{ 'placeholder-text': !version.name }"
                                            v-tooltip="$t('createAiApp.expandToEditHint')"
                                        >
                                            {{ version.name || $t('createAiApp.versionNamePlaceholder') }}
                                        </div>
                                        <Message v-if="!isVersionNameValid(version) && version.touched?.name" severity="error" size="small" variant="simple">
                                            {{ $t('createAiApp.versionNameRequired') }}
                                        </Message>
                                    </FormField>

                                    <!-- 版本描述 -->
                                    <!-- 展开状态：显示富文本编辑器 -->
                                    <FormField 
                                        v-if="isVersionInfoExpanded"
                                        :label="$t('createAiApp.versionDescription')"
                                        :hint="$t('createAiApp.descriptionHint')"
                                        required
                                    >
                                        <RichTextEditor 
                                            v-model="version.description"
                                            :placeholder="$t('createAiApp.descriptionPlaceholder')"
                                            height="200px"
                                            :invalid="!isVersionDescriptionValid(version) && version.touched?.description"
                                        />
                                        <Message v-if="!isVersionDescriptionValid(version) && version.touched?.description" severity="error" size="small" variant="simple">
                                            {{ $t('createAiApp.versionDescriptionRequired') }}
                                        </Message>
                                    </FormField>

                                    <!-- 收起状态：显示HTML解析的内容（只读） -->
                                    <FormField 
                                        v-else
                                        :label="$t('createAiApp.versionDescription')"
                                        required
                                    >
                                        <div 
                                            class="version-description-preview"
                                            v-html="version.description || `<span class='placeholder-text'>${$t('createAiApp.descriptionPlaceholder')}</span>`"
                                            v-tooltip="$t('createAiApp.expandToEditHint')"
                                        ></div>
                                        <Message v-if="!isVersionDescriptionValid(version) && version.touched?.description" severity="error" size="small" variant="simple">
                                            {{ $t('createAiApp.versionDescriptionRequired') }}
                                        </Message>
                                    </FormField>

                                    <!-- 工作流文件上传/预览 - 只在展开状态显示 -->
                                    <template v-if="isVersionInfoExpanded">
                                        <div v-if="!version.workflowData" class="workflow-upload-section">
                                            <h4 class="upload-section-title">{{ $t('createAiApp.uploadWorkflow') }}</h4>

                                            <div class="workflow-upload-area">
                                                <input
                                                    :ref="el => setFileInputRef(el, index)"
                                                    type="file"
                                                    accept=".json"
                                                    @change="(event) => handleFileUpload(event, index)"
                                                    style="display: none"
                                                />
                                                <div 
                                                    class="workflow-upload-zone" 
                                                    @click="() => triggerFileUpload(index)" 
                                                    @dragover.prevent 
                                                    @dragenter.prevent
                                                >
                                                    <i class="pi pi-cloud-upload workflow-upload-icon"></i>
                                                    <div class="workflow-upload-text">
                                                        <p class="workflow-upload-main">{{ $t('createAiApp.dragDropWorkflow') }}</p>
                                                        <p class="workflow-upload-sub">.JSON</p>
                                                    </div>
                                                    <Button 
                                                        :label="$t('createAiApp.uploadFile')"
                                                        class="workflow-upload-btn"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <WorkflowPreview 
                                            v-else
                                            :file-name="version.workflowData.fileName"
                                            :node-count="version.workflowData.nodeCount"
                                            :connection-count="version.workflowData.connectionCount"
                                            :workflow="version.workflowData.workflow"
                                            @remove-file="() => removeWorkflowFile(index)"
                                        />
                                    </template>
                                </div>
                            </div>
                            
                            <!-- 右侧操作按钮 -->
                            <div class="version-card-actions">
                                <!-- 删除按钮 -->
                                <Button 
                                    icon="pi pi-trash" 
                                    severity="danger" 
                                    text 
                                    :disabled="versions.length === 1"
                                    @click="removeVersion(index)"
                                    :aria-label="$t('createAiApp.deleteVersion')"
                                    v-tooltip="$t('createAiApp.deleteVersion')"
                                />
                                <!-- 上移按钮 -->
                                <Button 
                                    icon="pi pi-sort-up-fill" 
                                    severity="secondary" 
                                    text 
                                    :disabled="index === 0"
                                    @click="moveVersionUp(index)"
                                    :aria-label="$t('createAiApp.moveUp')"
                                    v-tooltip="$t('createAiApp.moveUp')"
                                />
                                <!-- 下移按钮 -->
                                <Button 
                                    icon="pi pi-sort-down-fill" 
                                    severity="secondary" 
                                    text 
                                    :disabled="index === versions.length - 1"
                                    @click="moveVersionDown(index)"
                                    :aria-label="$t('createAiApp.moveDown')"
                                    v-tooltip="$t('createAiApp.moveDown')"
                                />
                                <!-- 复制当前版本按钮 -->
                                <Button 
                                    icon="pi pi-clone" 
                                    severity="secondary" 
                                    text 
                                    @click="duplicateVersion(index)"
                                    :aria-label="$t('createAiApp.duplicateVersion')"
                                    v-tooltip="$t('createAiApp.duplicateVersion')"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 第三步：上传图片 -->
                <div v-else-if="activeStep === 2" class="step-content">
                    <div class="images-upload-section">
                        <div class="images-upload-header">
                            <h2 class="images-upload-title">{{ $t('createAiApp.uploadImages') }}</h2>
                            <div class="images-upload-hint">{{ $t('createAiApp.uploadDescription') }}</div>
                        </div>

                        <!-- 版本图片上传列表 -->
                        <div class="version-images-container">
                            <div 
                                v-for="(version, index) in versions" 
                                :key="version.id"
                                class="version-images-card"
                            >
                                <!-- 版本头部 -->
                                <div class="version-images-header">
                                    <h3 class="version-images-name">
                                        {{ $t('createAiApp.versionName') }}: {{ version.name || $t('createAiApp.versionNamePlaceholder') }}
                                    </h3>
                                    <a href="#" class="version-images-info-link">
                                        {{ $t('createAiApp.crossVersionImageInfo') }}
                                    </a>
                                </div>



                                <!-- 添加版本示例图片标题 -->
                                <div class="version-images-section-title">
                                    {{ $t('createAiApp.addVersionExampleImages') }}
                                    <span class="version-images-limit">{{ $t('createAiApp.imageUploadLimit') }}</span>
                                </div>

                                <!-- 图片上传区域 -->
                                <div class="version-images-upload-area">
                                    <!-- 未上传状态：显示上传按钮 -->
                                    <div v-if="!version.images || version.images.length === 0" class="version-images-upload-zone">
                                        <input
                                            :ref="el => setImageInputRef(el, index)"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            @change="(event) => handleImageUpload(event, index)"
                                            style="display: none"
                                        />
                                        <i class="pi pi-cloud-upload version-images-upload-icon"></i>
                                        <div class="version-images-upload-text">
                                            <p class="version-images-upload-main">{{ $t('createAiApp.dragDropImageOrClick') }}</p>
                                            <p class="version-images-upload-sub">{{ $t('createAiApp.imageFormatsHint') }}</p>
                                        </div>
                                        <Button 
                                            :label="$t('createAiApp.uploadImage')"
                                            class="version-images-upload-btn"
                                            @click="() => triggerImageUpload(index)"
                                        />
                                    </div>

                                    <!-- 已上传状态：显示虚线框和上传按钮 -->
                                    <div v-else class="version-images-upload-zone-dashed">
                                        <input
                                            :ref="el => setImageInputRef(el, index)"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            @change="(event) => handleImageUpload(event, index)"
                                            style="display: none"
                                        />
                                        <div class="version-images-upload-dashed-content">
                                            <i class="pi pi-cloud-upload version-images-upload-icon-small"></i>
                                            <span class="version-images-upload-dashed-text">{{ $t('createAiApp.dragDropImageOrClick') }}</span>
                                            <Button 
                                                :label="$t('createAiApp.uploadImage')"
                                                class="version-images-upload-btn-small"
                                                @click="() => triggerImageUpload(index)"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <!-- 图片预览网格 -->
                                <div class="version-images-preview-section">
                                    <!-- 制作封面图模块 - 有封面时显示封面图，无封面时显示制作封面图按钮 -->
                                    <div class="version-cover-image-card">
                                        <!-- 没有封面图时显示制作按钮 -->
                                        <div v-if="!version.coverImage" class="version-cover-image-content">
                                            <Button 
                                                :label="$t('createAiApp.createCoverImage')"
                                                severity="secondary"
                                                outlined
                                                class="version-cover-image-btn"
                                                @click="() => createCoverImage(index)"
                                            />
                                            <div class="version-cover-image-hint">
                                                {{ $t('createAiApp.coverImageHint') }}
                                            </div>
                                        </div>
                                        
                                        <!-- 有封面图时显示封面图 -->
                                        <div v-else class="version-cover-display">
                                            <img :src="version.coverImage.url" :alt="version.coverImage.name" class="version-cover-display-image" />
                                            
                                            <!-- 默认显示的操作按钮 -->
                                            <div class="version-cover-actions">
                                                <Button 
                                                    icon="pi pi-pencil" 
                                                    severity="secondary" 
                                                    text 
                                                    size="small"
                                                    @click="() => createCoverImage(index)"
                                                    :aria-label="$t('createAiApp.replaceCoverImage')"
                                                    v-tooltip="$t('createAiApp.replaceCoverImage')"
                                                />
                                                <Button 
                                                    icon="pi pi-trash" 
                                                    severity="danger" 
                                                    text 
                                                    size="small"
                                                    @click="() => removeVersionCoverImage(index)"
                                                    :aria-label="$t('createAiApp.deleteCoverImage')"
                                                    v-tooltip="$t('createAiApp.deleteCoverImage')"
                                                />
                                            </div>
                                            
                                            <!-- 悬浮时显示的放大镜遮罩 -->
                                            <div class="version-cover-hover-overlay">
                                                <Button 
                                                    icon="pi pi-search-plus" 
                                                    severity="secondary" 
                                                    text 
                                                    size="large"
                                                    @click="() => viewCoverImageFullscreen(index)"
                                                    :aria-label="$t('createAiApp.viewFullscreen')"
                                                    class="version-cover-zoom-btn"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 上传的图片网格 -->
                                    <div 
                                        v-for="image in version.images" 
                                        :key="image.id"
                                        class="version-image-preview-item"
                                    >
                                        <!-- 上传中的Loading状态 -->
                                        <div v-if="image.isUploading" class="version-image-loading">
                                            <div class="version-image-loading-content">
                                                <i class="pi pi-spin pi-spinner version-image-loading-spinner"></i>
                                                <div class="version-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                                <div class="version-image-loading-progress">
                                                    <div class="version-image-loading-bar"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- 上传完成的图片 -->
                                        <template v-else>
                                            <img :src="image.url" :alt="image.name" class="version-image-preview" />
                                            
                                            <!-- 默认显示的操作按钮 -->
                                            <div class="version-image-actions">
                                                <Button 
                                                    icon="pi pi-pencil" 
                                                    severity="secondary" 
                                                    text 
                                                    size="small"
                                                    @click="() => editImage(index, image.id)"
                                                    :aria-label="$t('createAiApp.editImage')"
                                                    v-tooltip="$t('createAiApp.editImage')"
                                                />
                                                <Button 
                                                    icon="pi pi-trash" 
                                                    severity="danger" 
                                                    text 
                                                    size="small"
                                                    @click="() => removeImage(index, image.id)"
                                                    :aria-label="$t('createAiApp.deleteImage')"
                                                    v-tooltip="$t('createAiApp.deleteImage')"
                                                />
                                            </div>
                                            
                                            <!-- 悬浮时显示的放大镜遮罩 -->
                                            <div class="version-image-hover-overlay">
                                                <Button 
                                                    icon="pi pi-search-plus" 
                                                    severity="secondary" 
                                                    text 
                                                    size="large"
                                                    @click="() => viewImageFullscreen(index, image.id)"
                                                    :aria-label="$t('createAiApp.viewFullscreen')"
                                                    class="version-image-zoom-btn"
                                                />
                                            </div>
                                            
                                            <!-- 固定在底部的图片信息 -->
                                            <div class="version-image-info">
                                                {{ $t('createAiApp.imageDetailInfo') }}
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部操作栏 -->
            <div class="footer-fixed">
                <div class="footer-actions">
                    <Button 
                        v-if="activeStep > 0" 
                        :label="$t('createAiApp.previousStep')" 
                        severity="secondary" 
                        @click="previousStep"
                        class="action-btn"
                    />
                    <Button 
                        :label="activeStep === steps.length - 1 ? $t('createAiApp.publish') : $t('createAiApp.nextStep')"
                        @click="nextStep"
                        class="action-btn primary"
                    />
                </div>
            </div>
        </div>

        <!-- 制作封面图弹窗 -->
        <div v-if="coverModalVisible" class="cover-modal" @click="closeCoverModal">
            <div class="cover-modal-container" @click.stop>
                <div class="cover-modal-header">
                    <h3 class="cover-modal-title">{{ $t('createAiApp.createCoverTitle') }}</h3>
                    <Button 
                        icon="pi pi-times" 
                        severity="secondary" 
                        text 
                        size="small"
                        class="cover-modal-close"
                        @click="closeCoverModal"
                    />
                </div>
                
                <div class="cover-modal-content">
                    <!-- 左侧封面类型选择 -->
                    <div class="cover-types-section">
                        <div 
                            v-for="(type, index) in coverTypes" 
                            :key="type.id"
                            class="cover-type-item"
                            :class="{ 'active': selectedCoverType === type.id }"
                            @click="selectCoverType(type.id)"
                        >
                            <img :src="type.image" :alt="type.name" class="cover-type-image" />
                        </div>
                    </div>
                    
                    <!-- 右侧上传区域 -->
                    <div class="cover-upload-section">
                        <!-- 类型1：单个上传框 -->
                        <div v-if="selectedCoverType === '1'" class="cover-upload-layout cover-layout-single">
                            <div class="cover-upload-area">
                                <div v-if="!coverImages[selectedCoverType]?.[0]" class="cover-upload-zone" @click="() => triggerCoverUpload(0)">
                                    <i class="pi pi-plus cover-upload-icon"></i>
                                </div>
                                <div v-else-if="coverImages[selectedCoverType][0].isUploading" class="cover-image-loading">
                                    <div class="cover-image-loading-content">
                                        <i class="pi pi-spin pi-spinner cover-image-loading-spinner"></i>
                                        <div class="cover-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                        <div class="cover-image-loading-progress">
                                            <div class="cover-image-loading-bar"></div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="cover-image-preview">
                                    <img :src="coverImages[selectedCoverType][0].url" :alt="coverImages[selectedCoverType][0].name" class="cover-preview-img" />
                                    <div class="cover-image-overlay">
                                        <Button 
                                            icon="pi pi-trash" 
                                            severity="danger" 
                                            text 
                                            size="small"
                                            @click="() => removeCoverImage(0)"
                                            class="cover-delete-btn"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 类型2：上下两个上传框 -->
                        <div v-else-if="selectedCoverType === '2'" class="cover-upload-layout cover-layout-vertical">
                            <div class="cover-upload-area cover-upload-half-height">
                                <div v-if="!coverImages[selectedCoverType]?.[0]" class="cover-upload-zone" @click="() => triggerCoverUpload(0)">
                                    <i class="pi pi-plus cover-upload-icon"></i>
                                </div>
                                <div v-else-if="coverImages[selectedCoverType][0].isUploading" class="cover-image-loading">
                                    <div class="cover-image-loading-content">
                                        <i class="pi pi-spin pi-spinner cover-image-loading-spinner"></i>
                                        <div class="cover-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                        <div class="cover-image-loading-progress">
                                            <div class="cover-image-loading-bar"></div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="cover-image-preview">
                                    <img :src="coverImages[selectedCoverType][0].url" :alt="coverImages[selectedCoverType][0].name" class="cover-preview-img" />
                                    <div class="cover-image-overlay">
                                        <Button 
                                            icon="pi pi-trash" 
                                            severity="danger" 
                                            text 
                                            size="small"
                                            @click="() => removeCoverImage(0)"
                                            class="cover-delete-btn"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="cover-upload-area cover-upload-half-height">
                                <div v-if="!coverImages[selectedCoverType]?.[1]" class="cover-upload-zone" @click="() => triggerCoverUpload(1)">
                                    <i class="pi pi-plus cover-upload-icon"></i>
                                </div>
                                <div v-else-if="coverImages[selectedCoverType][1].isUploading" class="cover-image-loading">
                                    <div class="cover-image-loading-content">
                                        <i class="pi pi-spin pi-spinner cover-image-loading-spinner"></i>
                                        <div class="cover-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                        <div class="cover-image-loading-progress">
                                            <div class="cover-image-loading-bar"></div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="cover-image-preview">
                                    <img :src="coverImages[selectedCoverType][1].url" :alt="coverImages[selectedCoverType][1].name" class="cover-preview-img" />
                                    <div class="cover-image-overlay">
                                        <Button 
                                            icon="pi pi-trash" 
                                            severity="danger" 
                                            text 
                                            size="small"
                                            @click="() => removeCoverImage(1)"
                                            class="cover-delete-btn"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 类型3：左右两个上传框 -->
                        <div v-else-if="selectedCoverType === '3'" class="cover-upload-layout cover-layout-horizontal">
                            <div class="cover-upload-area cover-upload-half-width">
                                <div v-if="!coverImages[selectedCoverType]?.[0]" class="cover-upload-zone" @click="() => triggerCoverUpload(0)">
                                    <i class="pi pi-plus cover-upload-icon"></i>
                                </div>
                                <div v-else-if="coverImages[selectedCoverType][0].isUploading" class="cover-image-loading">
                                    <div class="cover-image-loading-content">
                                        <i class="pi pi-spin pi-spinner cover-image-loading-spinner"></i>
                                        <div class="cover-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                        <div class="cover-image-loading-progress">
                                            <div class="cover-image-loading-bar"></div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="cover-image-preview">
                                    <img :src="coverImages[selectedCoverType][0].url" :alt="coverImages[selectedCoverType][0].name" class="cover-preview-img" />
                                    <div class="cover-image-overlay">
                                        <Button 
                                            icon="pi pi-trash" 
                                            severity="danger" 
                                            text 
                                            size="small"
                                            @click="() => removeCoverImage(0)"
                                            class="cover-delete-btn"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="cover-upload-area cover-upload-half-width">
                                <div v-if="!coverImages[selectedCoverType]?.[1]" class="cover-upload-zone" @click="() => triggerCoverUpload(1)">
                                    <i class="pi pi-plus cover-upload-icon"></i>
                                </div>
                                <div v-else-if="coverImages[selectedCoverType][1].isUploading" class="cover-image-loading">
                                    <div class="cover-image-loading-content">
                                        <i class="pi pi-spin pi-spinner cover-image-loading-spinner"></i>
                                        <div class="cover-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                        <div class="cover-image-loading-progress">
                                            <div class="cover-image-loading-bar"></div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="cover-image-preview">
                                    <img :src="coverImages[selectedCoverType][1].url" :alt="coverImages[selectedCoverType][1].name" class="cover-preview-img" />
                                    <div class="cover-image-overlay">
                                        <Button 
                                            icon="pi pi-trash" 
                                            severity="danger" 
                                            text 
                                            size="small"
                                            @click="() => removeCoverImage(1)"
                                            class="cover-delete-btn"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 类型4：上面两个，下面一个 -->
                        <div v-else-if="selectedCoverType === '4'" class="cover-upload-layout cover-layout-top-two-bottom-one">
                            <div class="cover-upload-row cover-upload-half-height">
                                <div class="cover-upload-area cover-upload-half-width">
                                    <div v-if="!coverImages[selectedCoverType]?.[0]" class="cover-upload-zone" @click="() => triggerCoverUpload(0)">
                                        <i class="pi pi-plus cover-upload-icon"></i>
                                    </div>
                                    <div v-else-if="coverImages[selectedCoverType][0].isUploading" class="cover-image-loading">
                                        <div class="cover-image-loading-content">
                                            <i class="pi pi-spin pi-spinner cover-image-loading-spinner"></i>
                                            <div class="cover-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                            <div class="cover-image-loading-progress">
                                                <div class="cover-image-loading-bar"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="cover-image-preview">
                                        <img :src="coverImages[selectedCoverType][0].url" :alt="coverImages[selectedCoverType][0].name" class="cover-preview-img" />
                                        <div class="cover-image-overlay">
                                            <Button 
                                                icon="pi pi-trash" 
                                                severity="danger" 
                                                text 
                                                size="small"
                                                @click="() => removeCoverImage(0)"
                                                class="cover-delete-btn"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div class="cover-upload-area cover-upload-half-width">
                                    <div v-if="!coverImages[selectedCoverType]?.[1]" class="cover-upload-zone" @click="() => triggerCoverUpload(1)">
                                        <i class="pi pi-plus cover-upload-icon"></i>
                                    </div>
                                    <div v-else-if="coverImages[selectedCoverType][1].isUploading" class="cover-image-loading">
                                        <div class="cover-image-loading-content">
                                            <i class="pi pi-spin pi-spinner cover-image-loading-spinner"></i>
                                            <div class="cover-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                            <div class="cover-image-loading-progress">
                                                <div class="cover-image-loading-bar"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="cover-image-preview">
                                        <img :src="coverImages[selectedCoverType][1].url" :alt="coverImages[selectedCoverType][1].name" class="cover-preview-img" />
                                        <div class="cover-image-overlay">
                                            <Button 
                                                icon="pi pi-trash" 
                                                severity="danger" 
                                                text 
                                                size="small"
                                                @click="() => removeCoverImage(1)"
                                                class="cover-delete-btn"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="cover-upload-area cover-upload-half-height">
                                <div v-if="!coverImages[selectedCoverType]?.[2]" class="cover-upload-zone" @click="() => triggerCoverUpload(2)">
                                    <i class="pi pi-plus cover-upload-icon"></i>
                                </div>
                                <div v-else-if="coverImages[selectedCoverType][2].isUploading" class="cover-image-loading">
                                    <div class="cover-image-loading-content">
                                        <i class="pi pi-spin pi-spinner cover-image-loading-spinner"></i>
                                        <div class="cover-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                        <div class="cover-image-loading-progress">
                                            <div class="cover-image-loading-bar"></div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="cover-image-preview">
                                    <img :src="coverImages[selectedCoverType][2].url" :alt="coverImages[selectedCoverType][2].name" class="cover-preview-img" />
                                    <div class="cover-image-overlay">
                                        <Button 
                                            icon="pi pi-trash" 
                                            severity="danger" 
                                            text 
                                            size="small"
                                            @click="() => removeCoverImage(2)"
                                            class="cover-delete-btn"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 类型5：左侧两个，右侧一个 -->
                        <div v-else-if="selectedCoverType === '5'" class="cover-upload-layout cover-layout-left-two-right-one">
                            <div class="cover-upload-column cover-upload-half-width">
                                <div class="cover-upload-area cover-upload-half-height">
                                    <div v-if="!coverImages[selectedCoverType]?.[0]" class="cover-upload-zone" @click="() => triggerCoverUpload(0)">
                                        <i class="pi pi-plus cover-upload-icon"></i>
                                    </div>
                                    <div v-else-if="coverImages[selectedCoverType][0].isUploading" class="cover-image-loading">
                                        <div class="cover-image-loading-content">
                                            <i class="pi pi-spin pi-spinner cover-image-loading-spinner"></i>
                                            <div class="cover-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                            <div class="cover-image-loading-progress">
                                                <div class="cover-image-loading-bar"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="cover-image-preview">
                                        <img :src="coverImages[selectedCoverType][0].url" :alt="coverImages[selectedCoverType][0].name" class="cover-preview-img" />
                                        <div class="cover-image-overlay">
                                            <Button 
                                                icon="pi pi-trash" 
                                                severity="danger" 
                                                text 
                                                size="small"
                                                @click="() => removeCoverImage(0)"
                                                class="cover-delete-btn"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div class="cover-upload-area cover-upload-half-height">
                                    <div v-if="!coverImages[selectedCoverType]?.[1]" class="cover-upload-zone" @click="() => triggerCoverUpload(1)">
                                        <i class="pi pi-plus cover-upload-icon"></i>
                                    </div>
                                    <div v-else-if="coverImages[selectedCoverType][1].isUploading" class="cover-image-loading">
                                        <div class="cover-image-loading-content">
                                            <i class="pi pi-spin pi-spinner cover-image-loading-spinner"></i>
                                            <div class="cover-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                            <div class="cover-image-loading-progress">
                                                <div class="cover-image-loading-bar"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="cover-image-preview">
                                        <img :src="coverImages[selectedCoverType][1].url" :alt="coverImages[selectedCoverType][1].name" class="cover-preview-img" />
                                        <div class="cover-image-overlay">
                                            <Button 
                                                icon="pi pi-trash" 
                                                severity="danger" 
                                                text 
                                                size="small"
                                                @click="() => removeCoverImage(1)"
                                                class="cover-delete-btn"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="cover-upload-area cover-upload-half-width">
                                <div v-if="!coverImages[selectedCoverType]?.[2]" class="cover-upload-zone" @click="() => triggerCoverUpload(2)">
                                    <i class="pi pi-plus cover-upload-icon"></i>
                                </div>
                                <div v-else-if="coverImages[selectedCoverType][2].isUploading" class="cover-image-loading">
                                    <div class="cover-image-loading-content">
                                        <i class="pi pi-spin pi-spinner cover-image-loading-spinner"></i>
                                        <div class="cover-image-loading-text">{{ $t('createAiApp.uploading') }}</div>
                                        <div class="cover-image-loading-progress">
                                            <div class="cover-image-loading-bar"></div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="cover-image-preview">
                                    <img :src="coverImages[selectedCoverType][2].url" :alt="coverImages[selectedCoverType][2].name" class="cover-preview-img" />
                                    <div class="cover-image-overlay">
                                        <Button 
                                            icon="pi pi-trash" 
                                            severity="danger" 
                                            text 
                                            size="small"
                                            @click="() => removeCoverImage(2)"
                                            class="cover-delete-btn"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="cover-modal-footer">
                    <Button 
                        :label="$t('createAiApp.createComplete')"
                        class="cover-create-btn"
                        @click="createCoverComplete"
                    />
                </div>
            </div>
        </div>

        <!-- 图片预览模态框 -->
        <div v-if="imagePreviewVisible" class="image-preview-modal" @click="closeImagePreview">
            <div class="image-preview-container">
                <img 
                    :src="currentPreviewImage?.url" 
                    :alt="currentPreviewImage?.name" 
                    class="image-preview-img"
                    @click.stop
                />
                <Button 
                    icon="pi pi-times" 
                    severity="secondary" 
                    text 
                    size="large"
                    class="image-preview-close"
                    @click="closeImagePreview"
                    :aria-label="$t('createAiApp.closePreview')"
                />
            </div>
        </div>

        <!-- 发布成功提示弹窗 -->
        <div v-if="publishSuccessVisible" class="publish-success-modal" @click="closePublishSuccess">
            <div class="publish-success-container" @click.stop>
                <div class="publish-success-content">
                    <h3 class="publish-success-title">保存成功</h3>
                    <p class="publish-success-message">工作流发布成功，可至个人中心查看状态</p>
                    <Button 
                        label="确认"
                        class="publish-success-btn"
                        @click="closePublishSuccess"
                    />
                </div>
            </div>
        </div>

        <!-- 错误提示弹窗 -->
        <div v-if="errorMessageVisible" class="error-message-modal" @click="closeErrorMessage">
            <div class="error-message-container" @click.stop>
                <div class="error-message-content">
                    <h3 class="error-message-title">{{ errorMessageTitle }}</h3>
                    <p class="error-message-text">{{ errorMessageContent }}</p>
                    <Button 
                        label="确认"
                        class="error-message-btn"
                        @click="closeErrorMessage"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Message from 'primevue/message'
import Tooltip from 'primevue/tooltip'
import Textarea from 'primevue/textarea'
// 导入我们的组件
import StepIndicator from '@/components/StepIndicator.vue'
import FormField from '@/components/FormField.vue'
import ConfigCard from '@/components/ConfigCard.vue'
import RadioGroup from '@/components/RadioGroup.vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import WorkflowPreview from '@/components/WorkflowPreview.vue'

// 注册指令
const vTooltip = Tooltip

const { t } = useI18n()
const router = useRouter()

// 平滑滚动到顶部的函数
const scrollToTop = async () => {
    await nextTick()
    const contentScroll = document.querySelector('.content-scroll')
    if (contentScroll) {
        contentScroll.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
}

// 步骤配置
const steps = ref([
    { label: t('createAiApp.editApp') },
    { label: t('createAiApp.editVersion') },
    { label: t('createAiApp.uploadImages') }
])

const activeStep = ref(0)

// 版本数据结构
interface VersionData {
    id: string
    name: string
    description: string
    workflowData: {
        fileName: string
        nodeCount: number
        connectionCount: number
        workflow: any
    } | null
    images?: {
        id: string
        file: File
        url: string
        name: string
        isUploading?: boolean
    }[]
    coverImage?: {
        id: string
        url: string
        name: string
        type: string
        sourceImages: string[]
    }
    touched?: {
        name?: boolean
        description?: boolean
    }
}

// 表单数据
const formData = ref({
    appName: '',
    isPublic: true,
    category: null,
    activity: null,
    isOriginal: true,
    allowCommercialUse: false,
    allowModification: false
})

// 版本数据 - 支持多版本
const versions = ref<VersionData[]>([
    {
        id: generateVersionId(),
    name: '',
        description: '',
        workflowData: null,
        touched: {}
    }
])

// 生成版本ID
function generateVersionId(): string {
    return 'version_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 工作流数据 - 保留用于向后兼容
const workflowData = ref<{
    fileName: string
    nodeCount: number
    connectionCount: number
    workflow: any
} | null>(null)

// 可见性选项
const publicOptions = ref([
    { label: t('createAiApp.public'), value: true },
    { label: t('createAiApp.private'), value: false }
])

// 原创性选项
const originalOptions = ref([
    { label: t('createAiApp.originalWork'), value: true },
    { label: t('createAiApp.reproduced'), value: false }
])

// 分类选项
const categories = ref([
    { label: t('createAiApp.categories.art'), value: 'art' },
    { label: t('createAiApp.categories.photo'), value: 'photo' },
    { label: t('createAiApp.categories.video'), value: 'video' },
    { label: t('createAiApp.categories.text'), value: 'text' },
    { label: t('createAiApp.categories.audio'), value: 'audio' },
    { label: t('createAiApp.categories.other'), value: 'other' }
])

// 活动选项
const activities = ref([
    { label: t('createAiApp.activities.none'), value: 'none' },
    { label: t('createAiApp.activities.contest'), value: 'contest' },
    { label: t('createAiApp.activities.challenge'), value: 'challenge' }
])

// 是否可以进行下一步
const canProceed = computed(() => {
    if (activeStep.value === 0) {
        return formData.value.appName.trim() !== '' &&
            formData.value.category !== null &&
            formData.value.activity !== null
    } else if (activeStep.value === 1) {
        return versions.value.every(version => version.name.trim() !== '' && version.description.trim() !== '')
    } else if (activeStep.value === 2) {
        return true
    }
    return false
})

// 下一步
const nextStep = async () => {
    // 验证当前步骤
    if (activeStep.value === 0) {
        // 标记所有字段为已触碰
        appNameTouched.value = true
        categoryTouched.value = true
        activityTouched.value = true
        
        // 检查验证是否通过
        if (!canProceed.value) {
            return // 验证失败，不进行下一步
        }
    } else if (activeStep.value === 1) {
        // 标记所有版本的字段为已触碰
        versions.value.forEach(version => {
            if (!version.touched) version.touched = {}
            version.touched.name = true
            version.touched.description = true
        })
        
        if (!canProceed.value) {
            return
        }
    }
    
    if (activeStep.value < steps.value.length - 1) {
        activeStep.value++
        scrollToTop()
    } else {
        // 发布时校验每个版本的封面图
        const versionsWithoutCover = versions.value.filter(version => !version.coverImage)
        if (versionsWithoutCover.length > 0) {
            showErrorMessage('发布失败', `请为所有版本制作封面图，当前有 ${versionsWithoutCover.length} 个版本缺少封面图`)
            return
        }
        
        // 校验通过，显示发布成功提示
        showPublishSuccess()
    }
}

// 上一步
const previousStep = async () => {
    if (activeStep.value > 0) {
        activeStep.value--
        scrollToTop()
    }
}

// 添加版本
const addVersion = () => {
    versions.value.unshift({
        id: generateVersionId(),
        name: '',
        description: '',
        workflowData: null,
        touched: {}
    })
}

// 工作流解析工具函数
const calculateNodeCount = (workflow: any): number => {
    if (!workflow || typeof workflow !== 'object') return 0
    
    // ComfyUI 工作流格式通常包含 nodes 数组或对象形式的节点
    if (workflow.nodes && Array.isArray(workflow.nodes)) {
        return workflow.nodes.length
    }
    
    // 如果是对象形式（键值对形式的节点）
    if (typeof workflow === 'object') {
        return Object.keys(workflow).filter(key => {
            const node = workflow[key]
            return node && typeof node === 'object' && 
                   (node.class_type || node.type || node.widget_values !== undefined)
        }).length
    }
    
    return 0
}

const calculateConnectionCount = (workflow: any): number => {
    if (!workflow || typeof workflow !== 'object') return 0
    
    let connections = 0
    
    // 统计节点间的连接
    if (workflow.nodes && Array.isArray(workflow.nodes)) {
        workflow.nodes.forEach((node: any) => {
            if (node.inputs) {
                connections += Object.keys(node.inputs).length
            }
        })
    } else if (typeof workflow === 'object') {
        Object.values(workflow).forEach((node: any) => {
            if (node && typeof node === 'object' && node.inputs) {
                Object.values(node.inputs).forEach((input: any) => {
                    if (Array.isArray(input) && input.length >= 2) {
                        connections++
                    }
                })
            }
        })
    }
    
    return connections
}

// 验证工作流文件格式
const validateWorkflowFile = (workflow: any): boolean => {
    if (!workflow || typeof workflow !== 'object') {
        console.error('工作流文件格式无效：不是有效的 JSON 对象')
        return false
    }
    
    // 添加调试日志，查看实际的工作流结构
    console.log('开始校验工作流，结构预览:', {
        hasNodes: !!workflow.nodes,
        nodesType: Array.isArray(workflow.nodes) ? 'array' : typeof workflow.nodes,
        nodesLength: workflow.nodes ? workflow.nodes.length : 0,
        topLevelKeys: Object.keys(workflow).slice(0, 10), // 只显示前10个键
        sampleNode: workflow.nodes ? workflow.nodes[0] : Object.values(workflow)[0]
    })
    
    // 检查是否是有效的 ComfyUI 工作流格式
    const hasNodes = (workflow.nodes && Array.isArray(workflow.nodes)) || 
                     Object.keys(workflow).some(key => {
                         const node = workflow[key]
                         return node && typeof node === 'object' && 
                                (node.class_type || node.type)
                     })
    
    if (!hasNodes) {
        console.error('工作流文件格式无效：未找到有效的节点定义')
        return false
    }

    // 简化的节点完整性检查
    try {
        if (workflow.nodes && Array.isArray(workflow.nodes)) {
            // 检查新格式工作流（数组格式）
            console.log('检测到数组格式工作流，节点数量:', workflow.nodes.length)
            return validateArrayFormatWorkflowSimple(workflow)
        } else {
            // 检查旧格式工作流（对象格式）
            const nodeCount = Object.keys(workflow).filter(key => {
                const node = workflow[key]
                return node && typeof node === 'object' && (node.class_type || node.type)
            }).length
            console.log('检测到对象格式工作流，节点数量:', nodeCount)
            return validateObjectFormatWorkflowSimple(workflow)
        }
    } catch (error) {
        console.error('工作流校验过程中发生错误:', error)
        return false
    }
}

// 简化的数组格式工作流校验
const validateArrayFormatWorkflowSimple = (workflow: any): boolean => {
    const { nodes } = workflow
    
    if (!Array.isArray(nodes) || nodes.length === 0) {
        console.error('工作流校验失败：nodes 必须是非空数组')
        return false
    }

    // 简化的节点检查 - 只检查最基本的字段
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (!validateNodeStructureSimple(node, i)) {
            return false
        }
    }

    console.log('数组格式工作流校验通过')
    return true
}

// 简化的对象格式工作流校验
const validateObjectFormatWorkflowSimple = (workflow: any): boolean => {
    const nodeIds = Object.keys(workflow).filter(key => {
        const node = workflow[key]
        return node && typeof node === 'object' && (node.class_type || node.type)
    })

    if (nodeIds.length === 0) {
        console.error('工作流校验失败：未找到有效的节点')
        return false
    }

    // 简化的节点检查
    for (const nodeId of nodeIds) {
        const node = workflow[nodeId]
        if (!validateObjectFormatNodeSimple(node, nodeId)) {
            return false
        }
    }

    console.log('对象格式工作流校验通过')
    return true
}

// 简化的节点结构校验（数组格式）
const validateNodeStructureSimple = (node: any, index: number): boolean => {
    if (!node || typeof node !== 'object') {
        console.error(`工作流校验失败：节点 ${index} 不是有效对象`)
        return false
    }

    // 只检查最基本的必需字段
    if (!('id' in node)) {
        console.error(`工作流校验失败：节点 ${index} 缺少 id 字段`)
        return false
    }

    if (!('type' in node) || typeof node.type !== 'string') {
        console.error(`工作流校验失败：节点 ${index} 缺少有效的 type 字段`)
        return false
    }

    console.log(`节点 ${index} (${node.type}) 校验通过`)
    return true
}

// 简化的节点结构校验（对象格式）
const validateObjectFormatNodeSimple = (node: any, nodeId: string): boolean => {
    if (!node || typeof node !== 'object') {
        console.error(`工作流校验失败：节点 ${nodeId} 不是有效对象`)
        return false
    }

    // 检查节点类型
    if (!node.class_type || typeof node.class_type !== 'string') {
        console.error(`工作流校验失败：节点 ${nodeId} 缺少有效的 class_type`)
        return false
    }

    console.log(`节点 ${nodeId} (${node.class_type}) 校验通过`)
    return true
}

// 处理上传的文件
const processUploadedFile = async (file: File, index: number) => {
    // 检查文件类型
    const validTypes = ['application/json']
    const isValidType = validTypes.includes(file.type) || file.name.endsWith('.json')
    
    if (!isValidType) {
        showErrorMessage('文件类型错误', '请上传 JSON 格式的工作流文件')
        return
    }
    
    try {
        // 读取文件内容
        const fileContent = await readFileAsText(file)
        let workflow
        
        try {
            workflow = JSON.parse(fileContent)
        } catch (parseError) {
            showErrorMessage('文件解析失败', 'JSON 文件格式错误，请检查文件内容是否正确')
            return
        }
        
        // 验证工作流格式
        if (!validateWorkflowFile(workflow)) {
            showErrorMessage('工作流校验失败', '上传的文件不是有效的 ComfyUI 工作流格式，请检查节点完整性')
            return
        }
        
        // 计算节点和连接数量
        const nodeCount = calculateNodeCount(workflow)
        const connectionCount = calculateConnectionCount(workflow)
        
        // 更新工作流数据
        versions.value[index].workflowData = {
            fileName: file.name,
            nodeCount,
            connectionCount,
            workflow
        }
        
        console.log('工作流上传成功:', {
            fileName: file.name,
            nodeCount,
            connectionCount
        })
        
        showSuccessMessage('上传成功', `成功上传工作流文件：${file.name}，包含 ${nodeCount} 个节点，${connectionCount} 个连接`)
        
    } catch (error) {
        console.error('处理工作流文件时发生错误:', error)
        showErrorMessage('处理失败', '处理工作流文件时发生未知错误，请重试')
    }
}

// 显示错误信息的辅助函数
const showErrorMessage = (title: string, message: string) => {
    console.error(`${title}: ${message}`)
    errorMessageTitle.value = title
    errorMessageContent.value = message
    errorMessageVisible.value = true
}

// 显示成功信息的辅助函数
const showSuccessMessage = (title: string, message: string) => {
    console.log(`${title}: ${message}`)
    // 这里可以集成项目中的 toast 组件来显示成功信息
    // 例如：toast.success({ title, message })
}

// 读取文件内容
const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
            resolve(event.target?.result as string)
        }
        reader.onerror = () => {
            reject(new Error('Failed to read file'))
        }
        reader.readAsText(file)
    })
}

// 移除工作流文件
const removeWorkflowFile = (index: number) => {
    if (versions.value[index]) {
        versions.value[index].workflowData = null
    }
    
    // 如果是第一个版本，也清理全局的workflowData（向后兼容）
    if (index === 0) {
        workflowData.value = null
        // 注意：不删除 localStorage，只是移除当前版本中的工作流数据
        // 用户可能想要在其他版本中重新使用这些数据，或者重新加载
        // localStorage.removeItem('currentWorkflow')
        // localStorage.removeItem('currentWorkflowFileName')
        
        // 重置加载标记，允许重新加载工作流数据
        workflowDataLoaded.value = false
    }
    
    console.log(`版本 ${index + 1} 的工作流文件已移除，localStorage数据保留`)
}

// 重新加载localStorage中的工作流数据
const reloadWorkflowFromStorage = (index: number) => {
    // 重置加载标记，允许重新加载
    workflowDataLoaded.value = false
    
    // 调用初始化函数重新加载数据
    initializeWorkflow()
    
    console.log(`重新加载localStorage中的工作流数据到版本 ${index + 1}`)
}

// 文件上传相关
const fileInputRefs = ref<{ [key: number]: HTMLInputElement }>({})

// 图片上传相关
const imageInputRefs = ref<{ [key: number]: HTMLInputElement }>({})

// 设置文件输入引用
const setFileInputRef = (el: any, index: number) => {
    if (el && el instanceof HTMLInputElement) {
        fileInputRefs.value[index] = el
    }
}

// 设置图片输入引用
const setImageInputRef = (el: any, index: number) => {
    if (el && el instanceof HTMLInputElement) {
        imageInputRefs.value[index] = el
    }
}

// 触发文件选择
const triggerFileUpload = (index: number) => {
    fileInputRefs.value[index]?.click()
}

// 触发图片选择
const triggerImageUpload = (index: number) => {
    imageInputRefs.value[index]?.click()
}

// 处理文件上传
const handleFileUpload = (event: Event, index: number) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        processUploadedFile(file, index)
    }
}

// 处理图片上传
const handleImageUpload = (event: Event, index: number) => {
    const target = event.target as HTMLInputElement
    const files = target.files
    if (files && files.length > 0) {
        processUploadedImages(files, index)
    }
}

// 处理上传的图片文件
const processUploadedImages = async (files: FileList, versionIndex: number) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 30 * 1024 * 1024 // 30MB
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // 检查文件类型
        if (!validTypes.includes(file.type)) {
            showErrorMessage('文件类型错误', `文件 ${file.name} 不是支持的图片格式`)
            continue
        }
        
        // 检查文件大小
        if (file.size > maxSize) {
            showErrorMessage('文件过大', `文件 ${file.name} 超过30MB限制`)
            continue
        }
        
        try {
            // 生成图片ID
            const imageId = 'image_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            
            // 初始化版本的图片数组
            if (!versions.value[versionIndex].images) {
                versions.value[versionIndex].images = []
            }
            
            // 先添加Loading状态的图片
            versions.value[versionIndex].images!.push({
                id: imageId,
                file: file,
                url: '',
                name: file.name,
                isUploading: true
            })
            
            // 模拟1秒的上传时间
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // 创建图片URL
            const imageUrl = URL.createObjectURL(file)
            
            // 找到对应的图片并更新状态
            const imageIndex = versions.value[versionIndex].images!.findIndex(img => img.id === imageId)
            if (imageIndex !== -1) {
                versions.value[versionIndex].images![imageIndex] = {
                    id: imageId,
                    file: file,
                    url: imageUrl,
                    name: file.name,
                    isUploading: false
                }
            }
            
            console.log(`图片上传成功: ${file.name}`)
            showSuccessMessage('上传成功', `成功上传图片：${file.name}`)
            
        } catch (error) {
            console.error('处理图片文件时发生错误:', error)
            showErrorMessage('处理失败', `处理图片文件 ${file.name} 时发生错误`)
            
            // 移除失败的图片
            if (versions.value[versionIndex].images) {
                const imageIndex = versions.value[versionIndex].images.findIndex(img => img.name === file.name && img.isUploading)
                if (imageIndex !== -1) {
                    versions.value[versionIndex].images.splice(imageIndex, 1)
                }
            }
        }
    }
}

// 编辑图片
const editImage = (versionIndex: number, imageId: string) => {
    console.log(`编辑图片: 版本${versionIndex + 1}, 图片ID: ${imageId}`)
    // TODO: 实现图片编辑功能
}

// 删除图片
const removeImage = (versionIndex: number, imageId: string) => {
    const version = versions.value[versionIndex]
    if (version.images) {
        const imageIndex = version.images.findIndex(img => img.id === imageId)
        if (imageIndex !== -1) {
            // 释放URL对象
            URL.revokeObjectURL(version.images[imageIndex].url)
            // 从数组中移除
            version.images.splice(imageIndex, 1)
            console.log(`图片删除成功: 版本${versionIndex + 1}, 图片ID: ${imageId}`)
        }
    }
}

// 制作封面图
const createCoverImage = (versionIndex: number) => {
    console.log(`制作封面图: 版本${versionIndex + 1}`)
    currentCoverVersionIndex.value = versionIndex
    openCoverModal()
}

// 查看图片全屏
const viewImageFullscreen = (versionIndex: number, imageId: string) => {
    const version = versions.value[versionIndex]
    if (version.images) {
        const image = version.images.find(img => img.id === imageId)
        if (image) {
            openImagePreview({
                url: image.url,
                name: image.name
            })
        }
    }
}

// 查看封面图全屏
const viewCoverImageFullscreen = (versionIndex: number) => {
    const version = versions.value[versionIndex]
    if (version.coverImage) {
        openImagePreview({
            url: version.coverImage.url,
            name: version.coverImage.name
        })
    }
}

// 本地验证状态
const appNameValid = computed(() => formData.value.appName.trim() !== '')
const categoryValid = computed(() => formData.value.category !== null)
const activityValid = computed(() => formData.value.activity !== null)
const versionNameValid = computed(() => versions.value.every(version => version.name.trim() !== ''))
const versionDescriptionValid = computed(() => versions.value.every(version => version.description.trim() !== ''))

const appNameTouched = ref(false)
const categoryTouched = ref(false)
const activityTouched = ref(false)

// 从路由或其他地方获取初始工作流数据
const initializeWorkflow = () => {
    // 如果已经加载过工作流数据，则不重复加载
    if (workflowDataLoaded.value) {
        return
    }
    
    // 从 localStorage 中获取工作流数据
    try {
        const savedWorkflow = localStorage.getItem('currentWorkflow')
        const savedFileName = localStorage.getItem('currentWorkflowFileName')
        
        if (savedWorkflow) {
            let workflow
            
            try {
                workflow = JSON.parse(savedWorkflow)
            } catch (parseError) {
                console.error('localStorage 中的工作流数据解析失败:', parseError)
                // 清理损坏的数据
                localStorage.removeItem('currentWorkflow')
                localStorage.removeItem('currentWorkflowFileName')
                showErrorMessage('数据加载失败', '本地存储的工作流数据已损坏，已自动清理')
                return
            }
            
            if (validateWorkflowFile(workflow)) {
                const nodeCount = calculateNodeCount(workflow)
                const connectionCount = calculateConnectionCount(workflow)
                
                // 将工作流数据加载到第一个版本
                if (versions.value.length > 0) {
                    versions.value[0].workflowData = {
                        fileName: savedFileName || '当前工作流.json',
                        nodeCount,
                        connectionCount,
                        workflow
                    }
                }
                
                // 保持向后兼容
                workflowData.value = {
                    fileName: savedFileName || '当前工作流.json',
                    nodeCount,
                    connectionCount,
                    workflow
                }
                
                console.log('成功加载工作流数据到版本 1:', {
                    fileName: savedFileName || '当前工作流.json',
                    nodeCount,
                    connectionCount
                })
                
                // 标记工作流数据已加载，避免重复加载
                workflowDataLoaded.value = true
                
                // 不再立即清理 localStorage，保留数据以支持页面刷新
                // localStorage.removeItem('currentWorkflow')
                // localStorage.removeItem('currentWorkflowFileName')
            } else {
                console.error('localStorage 中的工作流数据校验失败')
                // 清理无效数据
                localStorage.removeItem('currentWorkflow')
                localStorage.removeItem('currentWorkflowFileName')
                showErrorMessage('数据校验失败', '本地存储的工作流数据格式无效，已自动清理')
            }
        }
    } catch (error) {
        console.error('从 localStorage 加载工作流数据时发生错误:', error)
        // 清理可能损坏的数据
        localStorage.removeItem('currentWorkflow')
        localStorage.removeItem('currentWorkflowFileName')
        showErrorMessage('加载失败', '加载本地工作流数据时发生错误，已自动清理')
    }
}

// 组件挂载时初始化
onMounted(() => {
    // 移除页面加载时的工作流初始化
})

// 监听步骤变化，只在进入第二步时加载工作流数据
watch(activeStep, (newStep, oldStep) => {
    if (newStep === 1 && oldStep !== 1) {
        // 进入第二步时，检查并加载工作流数据
        initializeWorkflow()
    }
}, { immediate: true })

// 移除版本
const removeVersion = (index: number) => {
    if (versions.value.length > 1) {
        versions.value.splice(index, 1)
    }
}

// 版本验证方法
const isVersionNameValid = (version: VersionData): boolean => {
    return version.name.trim() !== ''
}

const isVersionDescriptionValid = (version: VersionData): boolean => {
    return version.description.trim() !== ''
}

// 移动版本
const moveVersionUp = (index: number) => {
    if (index > 0) {
        const temp = versions.value[index - 1]
        versions.value[index - 1] = versions.value[index]
        versions.value[index] = temp
    }
}

const moveVersionDown = (index: number) => {
    if (index < versions.value.length - 1) {
        const temp = versions.value[index + 1]
        versions.value[index + 1] = versions.value[index]
        versions.value[index] = temp
    }
}

// 复制版本
const duplicateVersion = (index: number) => {
    const originalVersion = versions.value[index]
    const newVersion = {
        id: generateVersionId(),
        name: originalVersion.name ? `${originalVersion.name}-副本` : '副本',
        description: originalVersion.description,
        workflowData: originalVersion.workflowData,
        touched: {}
    }
    versions.value.splice(index, 0, newVersion)
}

// 版本信息展开状态
const isVersionInfoExpanded = ref(true)

// 工作流数据加载标记，避免重复加载
const workflowDataLoaded = ref(false)

// 检查localStorage是否有工作流数据
const hasWorkflowInStorage = computed(() => {
    return localStorage.getItem('currentWorkflow') !== null
})

// 图片预览相关
const imagePreviewVisible = ref(false)
const currentPreviewImage = ref<{ url: string; name: string } | null>(null)

// 发布成功提示相关
const publishSuccessVisible = ref(false)

// 错误提示相关
const errorMessageVisible = ref(false)
const errorMessageTitle = ref('')
const errorMessageContent = ref('')

const openImagePreview = (image: { url: string; name: string }) => {
    currentPreviewImage.value = image
    imagePreviewVisible.value = true
}

const closeImagePreview = () => {
    currentPreviewImage.value = null
    imagePreviewVisible.value = false
}

// 显示发布成功提示
const showPublishSuccess = () => {
    publishSuccessVisible.value = true
}

// 关闭发布成功提示
const closePublishSuccess = () => {
    publishSuccessVisible.value = false
    
    // 发布成功后清理 localStorage
    localStorage.removeItem('currentWorkflow')
    localStorage.removeItem('currentWorkflowFileName')
    
    // 发布成功后跳转到我的作品页面
    console.log('创建AI应用完成', {
        formData: formData.value,
        versions: versions.value
    })
    // 使用 window.location.href 进行跳转，这会自动刷新页面
    window.location.href = '/#/my-works'
}

// 关闭错误提示
const closeErrorMessage = () => {
    errorMessageVisible.value = false
    errorMessageTitle.value = ''
    errorMessageContent.value = ''
}

// 制作封面图相关
const coverModalVisible = ref(false)
const selectedCoverType = ref('1')
const coverFileInput = ref<HTMLInputElement>()
const currentCoverVersionIndex = ref<number>(0)

// 封面图片数据
const coverImages = ref<{
    [key: string]: {
        id: string
        file: File
        url: string
        name: string
        isUploading?: boolean
    }[]
}>({})

// 封面类型数据
const coverTypes = ref([
    { id: '1', name: '类型1', image: new URL('@/assets/thumb/1.svg', import.meta.url).href },
    { id: '2', name: '类型2', image: new URL('@/assets/thumb/2.svg', import.meta.url).href },
    { id: '3', name: '类型3', image: new URL('@/assets/thumb/3.svg', import.meta.url).href },
    { id: '4', name: '类型4', image: new URL('@/assets/thumb/4.svg', import.meta.url).href },
    { id: '5', name: '类型5', image: new URL('@/assets/thumb/5.svg', import.meta.url).href }
])

// 制作封面图相关函数
const openCoverModal = () => {
    coverModalVisible.value = true
}

const closeCoverModal = () => {
    coverModalVisible.value = false
    selectedCoverType.value = '1'
    // 清理上传的图片
    Object.values(coverImages.value).forEach(images => {
        images.forEach(image => URL.revokeObjectURL(image.url))
    })
    coverImages.value = {}
}

const selectCoverType = (typeId: string) => {
    selectedCoverType.value = typeId
}

const triggerCoverUpload = (slotIndex?: number) => {
    // 创建临时的文件输入
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (event) => handleCoverImageUpload(event, slotIndex)
    input.click()
}

const handleCoverImageUpload = async (event: Event, slotIndex?: number) => {
    const target = event.target as HTMLInputElement
    const files = target.files
    if (files && files.length > 0) {
        const file = files[0]
        
        // 检查文件类型
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!validTypes.includes(file.type)) {
            showErrorMessage('文件类型错误', `文件 ${file.name} 不是支持的图片格式`)
            return
        }
        
        // 检查文件大小 (30MB)
        const maxSize = 30 * 1024 * 1024
        if (file.size > maxSize) {
            showErrorMessage('文件过大', `文件 ${file.name} 超过30MB限制`)
            return
        }
        
        try {
            // 生成图片ID
            const imageId = 'cover_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            
            // 初始化当前类型的图片数组
            if (!coverImages.value[selectedCoverType.value]) {
                coverImages.value[selectedCoverType.value] = []
            }
            
            // 先添加Loading状态的图片
            const loadingImage = {
                id: imageId,
                file: file,
                url: '',
                name: file.name,
                isUploading: true
            }
            
            // 根据插槽索引添加或替换图片
            if (slotIndex !== undefined) {
                // 如果指定了插槽索引，替换对应位置的图片
                if (coverImages.value[selectedCoverType.value][slotIndex]) {
                    // 释放旧图片的URL
                    URL.revokeObjectURL(coverImages.value[selectedCoverType.value][slotIndex].url)
                }
                // 确保数组有足够的长度
                while (coverImages.value[selectedCoverType.value].length <= slotIndex) {
                    coverImages.value[selectedCoverType.value].push({
                        id: '',
                        file: new File([], ''),
                        url: '',
                        name: ''
                    })
                }
                coverImages.value[selectedCoverType.value][slotIndex] = loadingImage
            } else {
                // 否则添加到数组末尾
                coverImages.value[selectedCoverType.value].push(loadingImage)
            }
            
            // 模拟1秒的上传时间
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // 创建图片URL
            const imageUrl = URL.createObjectURL(file)
            
            // 找到对应的图片并更新状态
            const imageIndex = slotIndex !== undefined ? slotIndex : coverImages.value[selectedCoverType.value].length - 1
            if (imageIndex !== -1 && coverImages.value[selectedCoverType.value][imageIndex]) {
                coverImages.value[selectedCoverType.value][imageIndex] = {
                    id: imageId,
                    file: file,
                    url: imageUrl,
                    name: file.name,
                    isUploading: false
                }
            }
            
            console.log(`封面图片上传成功: ${file.name}`)
            showSuccessMessage('上传成功', `成功上传封面图片：${file.name}`)
            
        } catch (error) {
            console.error('处理封面图片时发生错误:', error)
            showErrorMessage('处理失败', `处理图片文件 ${file.name} 时发生错误`)
            
            // 移除失败的图片
            if (slotIndex !== undefined && coverImages.value[selectedCoverType.value]) {
                coverImages.value[selectedCoverType.value].splice(slotIndex, 1)
            }
        }
    }
}

// 图片合成功能
const createCoverComplete = async () => {
    const currentImages = coverImages.value[selectedCoverType.value]
    if (!currentImages || currentImages.length === 0) {
        showErrorMessage('制作失败', '请先上传图片')
        return
    }
    
    try {
        // 创建合成的封面图
        const compositeImageUrl = await compositeImages(currentImages, selectedCoverType.value)
        
        // 生成封面图数据
        const coverId = 'cover_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        const coverData = {
            id: coverId,
            url: compositeImageUrl,
            name: `封面图_类型${selectedCoverType.value}_${Date.now()}.png`,
            type: selectedCoverType.value,
            sourceImages: currentImages.map(img => img.name)
        }
        
        // 将封面图添加到对应版本
        if (versions.value[currentCoverVersionIndex.value]) {
            // 如果已有封面图，先释放旧的URL
            if (versions.value[currentCoverVersionIndex.value].coverImage) {
                URL.revokeObjectURL(versions.value[currentCoverVersionIndex.value].coverImage!.url)
            }
            versions.value[currentCoverVersionIndex.value].coverImage = coverData
        }
        
        console.log('封面图制作完成', {
            type: selectedCoverType.value,
            images: currentImages.length,
            versionIndex: currentCoverVersionIndex.value
        })
        
        showSuccessMessage('制作完成', `成功为版本 ${currentCoverVersionIndex.value + 1} 制作封面图`)
        closeCoverModal()
        
    } catch (error) {
        console.error('制作封面图时发生错误:', error)
        showErrorMessage('制作失败', '制作封面图时发生错误，请重试')
    }
}

// 图片合成函数
const compositeImages = async (images: any[], layoutType: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
            reject(new Error('无法创建Canvas上下文'))
            return
        }
        
        // 设置画布尺寸 (正方形)
        const canvasSize = 800
        canvas.width = canvasSize
        canvas.height = canvasSize
        
        // 设置白色背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvasSize, canvasSize)
        
        // 加载所有图片
        const imagePromises = images.map(imgData => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.onload = () => resolve(img)
                img.onerror = () => reject(new Error(`图片加载失败: ${imgData.name}`))
                img.src = imgData.url
            })
        })
        
        Promise.all(imagePromises).then(loadedImages => {
            // 根据布局类型绘制图片
            drawImagesWithLayout(ctx, loadedImages, layoutType, canvasSize)
            
            // 转换为Blob URL
            canvas.toBlob(blob => {
                if (blob) {
                    const url = URL.createObjectURL(blob)
                    resolve(url)
                } else {
                    reject(new Error('Canvas转换失败'))
                }
            }, 'image/png', 0.9)
        }).catch(reject)
    })
}

// 根据布局类型绘制图片
const drawImagesWithLayout = (ctx: CanvasRenderingContext2D, images: HTMLImageElement[], layoutType: string, canvasSize: number) => {
    const gap = 4 // 图片间隙
    
    switch (layoutType) {
        case '1': // 单个图片
            if (images[0]) {
                drawImageFit(ctx, images[0], 0, 0, canvasSize, canvasSize)
            }
            break
            
        case '2': // 上下两个
            if (images[0]) {
                drawImageFit(ctx, images[0], 0, 0, canvasSize, (canvasSize - gap) / 2)
            }
            if (images[1]) {
                drawImageFit(ctx, images[1], 0, (canvasSize + gap) / 2, canvasSize, (canvasSize - gap) / 2)
            }
            break
            
        case '3': // 左右两个
            if (images[0]) {
                drawImageFit(ctx, images[0], 0, 0, (canvasSize - gap) / 2, canvasSize)
            }
            if (images[1]) {
                drawImageFit(ctx, images[1], (canvasSize + gap) / 2, 0, (canvasSize - gap) / 2, canvasSize)
            }
            break
            
        case '4': // 上面两个，下面一个
            if (images[0]) {
                drawImageFit(ctx, images[0], 0, 0, (canvasSize - gap) / 2, (canvasSize - gap) / 2)
            }
            if (images[1]) {
                drawImageFit(ctx, images[1], (canvasSize + gap) / 2, 0, (canvasSize - gap) / 2, (canvasSize - gap) / 2)
            }
            if (images[2]) {
                drawImageFit(ctx, images[2], 0, (canvasSize + gap) / 2, canvasSize, (canvasSize - gap) / 2)
            }
            break
            
        case '5': // 左侧两个，右侧一个
            if (images[0]) {
                drawImageFit(ctx, images[0], 0, 0, (canvasSize - gap) / 2, (canvasSize - gap) / 2)
            }
            if (images[1]) {
                drawImageFit(ctx, images[1], 0, (canvasSize + gap) / 2, (canvasSize - gap) / 2, (canvasSize - gap) / 2)
            }
            if (images[2]) {
                drawImageFit(ctx, images[2], (canvasSize + gap) / 2, 0, (canvasSize - gap) / 2, canvasSize)
            }
            break
    }
}

// 绘制适配图片
const drawImageFit = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, width: number, height: number) => {
    const imgAspect = img.width / img.height
    const targetAspect = width / height
    
    let drawWidth, drawHeight, drawX, drawY
    
    if (imgAspect > targetAspect) {
        // 图片更宽，以高度为准
        drawHeight = height
        drawWidth = height * imgAspect
        drawX = x - (drawWidth - width) / 2
        drawY = y
    } else {
        // 图片更高，以宽度为准
        drawWidth = width
        drawHeight = width / imgAspect
        drawX = x
        drawY = y - (drawHeight - height) / 2
    }
    
    // 裁剪区域
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.clip()
    
    // 绘制图片
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
    ctx.restore()
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && imagePreviewVisible.value) {
        closeImagePreview()
    }
}

// 组件挂载时添加键盘事件监听
onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除键盘事件监听和清理localStorage
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    
    // 组件卸载时清理localStorage（用户离开页面）
    // 但只有在没有发布成功的情况下才清理，避免重复清理
    if (!publishSuccessVisible.value) {
        localStorage.removeItem('currentWorkflow')
        localStorage.removeItem('currentWorkflowFileName')
    }
})

// 移除封面图片
const removeCoverImage = (index: number) => {
    if (coverImages.value[selectedCoverType.value] && coverImages.value[selectedCoverType.value][index]) {
        // 释放URL对象
        URL.revokeObjectURL(coverImages.value[selectedCoverType.value][index].url)
        // 从数组中移除
        coverImages.value[selectedCoverType.value].splice(index, 1)
        console.log(`封面图片删除成功: 类型${selectedCoverType.value}, 索引${index}`)
    }
}

// 移除版本封面图片
const removeVersionCoverImage = (index: number) => {
    if (versions.value[index] && versions.value[index].coverImage) {
        // 释放URL对象
        URL.revokeObjectURL(versions.value[index].coverImage.url)
        // 从版本中移除
        versions.value[index].coverImage = undefined
        console.log(`版本封面图片删除成功: 版本${index + 1}`)
    }
}
</script>

<style scoped>
.create-ai-app-container {
    height: 100vh;
    display: flex;
    overflow-y: auto;
    flex-direction: column;
    animation: fadeIn 0.6s ease-out;
    background: var(--p-surface-50);
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

/* 内容区域 */
.content-scroll {
    flex: 1;
    padding: 24px;
    background: linear-gradient(135deg, var(--p-surface-50) 0%, var(--p-surface-100) 100%);
}

.content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
}

.step-content {
    background: var(--p-surface-card);
    border-radius: 20px;
    padding: 40px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 2px solid var(--p-surface-200);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.step-content:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--p-primary-color), var(--p-primary-600), var(--p-primary-color));
    z-index: 1;
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

/* 表单样式 */
.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.config-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.checkbox-list {
    display: flex;
    flex-direction: column;
}

.checkbox-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--p-surface-100);
    transition: all 0.3s ease;
}

.checkbox-item:last-child {
    border-bottom: none;
}

.checkbox-item:hover {
    background: var(--p-surface-50);
    border-radius: 8px;
    padding: 12px 16px;
    margin: 0 -16px;
}

.checkbox-item span {
    font-size: 14px;
    line-height: 1.6;
    color: var(--p-surface-700);
}

.agreement-list {
    list-style: none;
    padding: 20px;
    background: linear-gradient(135deg, var(--p-surface-50), var(--p-surface-100));
    border-radius: 12px;
    border-left: 4px solid var(--p-primary-color);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.agreement-list li {
    margin-bottom: 10px;
    color: var(--p-surface-600);
    font-size: 13px;
    line-height: 1.5;
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.agreement-list li:before {
    content: "•";
    color: var(--p-primary-color);
    font-weight: bold;
    font-size: 16px;
    line-height: 1.2;
    flex-shrink: 0;
}

/* 版本编辑样式 */
.version-management-header {
    margin-bottom: 32px;
}

.version-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.version-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    border: none;
}

.version-btn.primary {
    background: var(--p-primary-500);
    color: white;
}

.version-btn.secondary {
    background: var(--p-surface-100);
    color: var(--p-surface-700);
    border: 1px solid var(--p-surface-300);
}

.version-hint {
    font-size: 14px;
    line-height: 1.5;
    padding: 12px;
    border-radius: 8px;
    color: #999;
    text-align: center;
}

.versions-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.version-card {
    background: var(--p-surface-card);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 2px solid var(--p-surface-200);
    backdrop-filter: blur(10px);
    display: flex;
    gap: 24px;
    align-items: flex-start;
}

.version-card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.version-card-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    flex-shrink: 0;
    padding: 8px;
}

.version-card-actions .p-button {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--p-surface-100);
    border: 1px solid var(--p-surface-200);
    color: var(--p-surface-700);
}

.version-card-actions .p-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: var(--p-surface-100);
    border-color: var(--p-surface-300);
}

.version-card-actions .p-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background-color: var(--p-surface-50);
    color: var(--p-surface-400);
}

.version-card-actions .p-button[severity="danger"] {
    background-color: var(--p-red-100);
    border-color: var(--p-red-200);
    color: var(--p-red-600);
}

.version-card-actions .p-button[severity="danger"]:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: var(--p-red-100);
    border-color: var(--p-red-300);
    color: var(--p-red-700);
}

.version-card-actions .p-button[severity="secondary"] {
    background-color: var(--p-surface-100);
    border-color: var(--p-surface-200);
    color: var(--p-surface-700);
}

.version-card-actions .p-button[severity="secondary"]:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: var(--p-surface-100);
    border-color: var(--p-surface-300);
    color: var(--p-surface-800);
}

/* 上传图片样式 */
.images-upload-section {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.images-upload-header {
    text-align: center;
}

.images-upload-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--p-surface-900);
    margin-bottom: 8px;
}

.images-upload-hint {
    color: var(--p-surface-600);
    font-size: 16px;
}

.version-images-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.version-images-card {
    background: var(--p-surface-card);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 2px solid var(--p-surface-200);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.version-images-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.version-images-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--p-surface-900);
    margin: 0;
}

.version-images-info-link {
    color: var(--p-primary-500);
    font-size: 14px;
    text-decoration: none;
    transition: color 0.2s ease;
}

.version-images-info-link:hover {
    color: var(--p-primary-600);
    text-decoration: underline;
}

.version-images-section-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--p-surface-900);
    display: flex;
    align-items: center;
    gap: 8px;
}

.version-images-limit {
    font-size: 14px;
    color: var(--p-surface-500);
    font-weight: normal;
}

.version-images-preview-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 24px;
}

.version-cover-image-card {
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
}

.version-cover-image-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
}

.version-cover-image-btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    background: var(--p-surface-0);
    color: var(--p-surface-700);
    border: 1px solid var(--p-surface-300);
}

.version-cover-image-hint {
    font-size: 14px;
    color: var(--p-surface-600);
    text-align: center;
    line-height: 1.4;
}

.version-image-preview-item {
    position: relative;
    border: 1px solid var(--p-surface-200);
    border-radius: 8px;
    overflow: hidden;
    background: var(--p-surface-0);
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
}

.version-image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.version-image-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    z-index: 100;
}

.version-image-actions .p-button {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
}

.version-image-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 12px;
    font-size: 12px;
    text-align: center;
    z-index: 100;
}

.version-image-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    z-index: 3;
}

.version-image-loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
}

.version-image-loading-spinner {
    font-size: 28px;
    color: var(--p-primary-500);
    animation: spin 1s linear infinite;
}

.version-image-loading-text {
    color: var(--p-surface-700);
    font-size: 14px;
    font-weight: 500;
}

.version-image-loading-progress {
    width: 120px;
    height: 4px;
    background: var(--p-surface-200);
    border-radius: 2px;
    overflow: hidden;
}

.version-image-loading-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--p-primary-500), var(--p-primary-600));
    border-radius: 2px;
    animation: loading-progress 1s ease-in-out;
}

@keyframes loading-progress {
    0% {
        width: 0%;
    }
    100% {
        width: 100%;
    }
}

.version-image-hover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 2;
}

.version-image-preview-item:hover .version-image-hover-overlay {
    opacity: 1;
}

.version-image-zoom-btn {
    color: white !important;
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    font-size: 18px !important;
}

.version-image-zoom-btn:hover {
    background: transparent;
}

/* 底部操作栏 */
.footer-fixed {
    padding: 24px 20px;
    margin: 32px 0;
    border-radius: 12px;
}

.footer-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;
}

.action-btn {
    min-width: 150px;
    width: 150px;
    padding: 14px 28px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
}

.action-btn:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.action-btn:hover:before {
    left: 100%;
}

.action-btn.primary {
    background: var(--p-primary-color);
    color: var(--p-primary-contrast-color);
    border-color: var(--p-primary-color);
    box-shadow: 0 4px 12px rgba(var(--p-primary-color-rgb), 0.3);
}

.action-btn.primary:hover:not(:disabled) {
    background: var(--p-primary-600);
    border-color: var(--p-primary-600);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(var(--p-primary-color-rgb), 0.4);
}

.action-btn:not(.primary) {
    background: var(--p-surface-0);
    color: var(--p-surface-700);
    border-color: var(--p-surface-300);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:not(.primary):hover {
    background: var(--p-surface-50);
    border-color: var(--p-surface-400);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
    background: var(--p-surface-200) !important;
    color: var(--p-surface-500) !important;
    border-color: var(--p-surface-200) !important;
    cursor: not-allowed !important;
    transform: none !important;
    box-shadow: none !important;
}

/* 可见性和原创性提示样式 */
.visibility-hint,
.originality-hint {
    padding: 8px 0px;
    border-radius: 6px;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 500;
    animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.visibility-hint.public {
    color: #999;
}

.visibility-hint.private {
    background: #f0f9ff;
    color: #0369a1;
    border-left-color: #0369a1;
}

.originality-hint.original {
    color: #999;
}

.originality-hint.reproduced {
    background: #f3f4f6;
    color: #374151;
}

:deep(.p-inputtext),:deep(.p-select){
    height: 40px !important;
    background: #fff !important;
    border:1px solid #cbd5e1 !important;
}

/* 工作流上传样式 */
.workflow-upload-section {
    margin-bottom: 24px;
}

.upload-section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--p-surface-900);
    margin-bottom: 16px;
}

.workflow-upload-area {
    display: flex;
    justify-content: center;
}

.workflow-upload-zone {
    width: 100%;
    border: 2px dashed var(--p-surface-300);
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    background: var(--p-surface-50);
    transition: all 0.3s ease;
    cursor: pointer;
}

.workflow-upload-zone:hover {
    border-color: var(--p-primary-500);
    background: var(--p-blue-50);
}

.workflow-upload-icon {
    font-size: 48px;
    color: var(--p-surface-400);
}

.workflow-upload-text {
    margin-bottom: 20px;
}

.workflow-upload-main {
    font-size: 16px;
    font-weight: 500;
    color: var(--p-surface-700);
    margin-bottom: 4px;
}

.workflow-upload-sub {
    font-size: 14px;
    color: var(--p-surface-500);
}

.workflow-upload-btn {
    background: var(--p-primary-500);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
}

/* 工作流重新加载区域样式 */
.workflow-reload-section {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--p-blue-50);
    border: 1px solid var(--p-blue-200);
    border-radius: 8px;
}

.workflow-reload-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: var(--p-blue-700);
    font-size: 14px;
}

.workflow-reload-hint i {
    color: var(--p-blue-500);
    font-size: 16px;
}

.workflow-reload-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.workflow-reload-btn {
    padding: 8px 16px;
    font-size: 14px;
    border-color: var(--p-blue-500);
    color: var(--p-blue-600);
}

.workflow-reload-btn:hover {
    background: var(--p-blue-100);
    border-color: var(--p-blue-600);
    color: var(--p-blue-700);
}

.workflow-reload-separator {
    color: var(--p-surface-500);
    font-size: 14px;
}

.version-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* 版本名预览样式 */
.version-name-preview {
    padding: 12px;
    border: 1px solid var(--p-surface-300);
    border-radius: 8px;
    background: var(--p-surface-0);
    min-height: 20px;
    line-height: 1.4;
    cursor: not-allowed;
    user-select: none;
}

.version-name-preview.placeholder-text {
    color: var(--p-surface-400);
    font-style: italic;
}

/* 版本描述预览样式 */
.version-description-preview {
    min-height: 60px;
   height: auto;
    /* overflow-y: auto; */
    padding: 12px;
    border: 1px solid var(--p-surface-300);
    border-radius: 8px;
    background: var(--p-surface-0);
    line-height: 1.6;
    word-wrap: break-word;
    cursor: not-allowed;
    user-select: none;
}

.version-description-preview .placeholder-text {
    color: var(--p-surface-400);
    font-style: italic;
}

/* 版本描述预览中的HTML元素样式 */
.version-description-preview p {
    margin: 0 0 8px 0;
}

.version-description-preview p:last-child {
    margin-bottom: 0;
}

.version-description-preview h1,
.version-description-preview h2,
.version-description-preview h3,
.version-description-preview h4,
.version-description-preview h5,
.version-description-preview h6 {
    margin: 8px 0 4px 0;
    font-weight: 600;
}

.version-description-preview ul,
.version-description-preview ol {
    margin: 8px 0;
    padding-left: 20px;
}

.version-description-preview li {
    margin: 4px 0;
}

.version-description-preview img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 8px 0;
}

.version-description-preview strong,
.version-description-preview b {
    font-weight: 600;
}

.version-description-preview em,
.version-description-preview i {
    font-style: italic;
}

.version-description-preview code {
    background: var(--p-surface-100);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
}

.version-description-preview blockquote {
    border-left: 4px solid var(--p-primary-500);
    padding-left: 12px;
    margin: 8px 0;
    color: var(--p-surface-600);
}

/* 图片上传区域样式 */
.version-images-upload-area {
    display: flex;
    justify-content: center;
     box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.version-images-upload-zone {
    width: 100%;
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
}

.version-images-upload-zone:hover {
    border-color: var(--p-primary-500);
    background: var(--p-blue-50);
}

.version-images-upload-icon {
    font-size: 48px;
    color: var(--p-surface-400);
    margin-bottom: 16px;
}

.version-images-upload-text {
    margin-bottom: 20px;
}

.version-images-upload-main {
    font-size: 16px;
    font-weight: 500;
    color: var(--p-surface-700);
    margin-bottom: 4px;
}

.version-images-upload-sub {
    font-size: 14px;
    color: var(--p-surface-500);
}

.version-images-upload-btn {
    background: var(--p-primary-500);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
}

.version-images-upload-zone-dashed {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 70px 40px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.version-images-upload-dashed-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.version-images-upload-icon-small {
    font-size: 48px;
    color: var(--p-surface-400);
}

.version-images-upload-dashed-text {
    font-size: 16px;
    font-weight: 500;
    color: var(--p-surface-700);
}

.version-images-upload-btn-small {
    background: var(--p-primary-500);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

/* 图片预览模态框样式 */
.image-preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.image-preview-container {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.image-preview-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.image-preview-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7) !important;
    color: white !important;
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    font-size: 18px !important;
    transition: all 0.2s ease;
}

.image-preview-close:hover {
    background: rgba(0, 0, 0, 0.9) !important;
    border-color: rgba(255, 255, 255, 0.5) !important;
    transform: scale(1.1);
}

/* 制作封面图弹窗样式 */
.cover-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.cover-modal-container {
    background: white;
    border-radius: 12px;
    width: 610px;
    max-width: 90vw;
    max-height: 70vh;
    overflow: hidden;
    animation: zoomIn 0.3s ease;
}

.cover-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--p-surface-200);
}

.cover-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--p-surface-900);
    margin: 0;
}

.cover-modal-close {
    background: transparent !important;
    color: var(--p-surface-600) !important;
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    border: none !important;
    font-size: 16px !important;
    transition: all 0.2s ease;
}

.cover-modal-close:hover {
    background: var(--p-surface-100) !important;
    color: var(--p-surface-800) !important;
}

.cover-modal-content {
    display: flex;
    padding: 24px;
    gap: 24px;
    min-height: 400px;
}

.cover-types-section {
    flex: 0 0 135px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    border-right: 1px solid var(--p-surface-200);
}

.cover-type-item {
    width: 80px;
    height: 80px;
    padding: 8px;
    border: 2px solid var(--p-surface-200);
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cover-type-item:hover {
    border-color: var(--p-primary-300);
}

.cover-type-item.active {
    border-color: var(--p-primary-500);
    background: var(--p-primary-50);
}

.cover-type-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.cover-upload-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px solid #cbd5e1;
    border-radius: 12px;
}

.cover-upload-layout {
    width: 100%;
    height: 100%;
    display: flex;
    gap: 8px;
}

/* 类型1：单个上传框 */
.cover-layout-single {
    flex-direction: column;
}

.cover-layout-single .cover-upload-area {
    width: 100%;
    height: 100%;
}

/* 类型2：上下两个上传框 */
.cover-layout-vertical {
    flex-direction: column;
}

/* 类型3：左右两个上传框 */
.cover-layout-horizontal {
    flex-direction: row;
}

/* 类型4：上面两个，下面一个 */
.cover-layout-top-two-bottom-one {
    flex-direction: column;
}

.cover-upload-row {
    display: flex;
    gap: 8px;
}

/* 类型5：左侧两个，右侧一个 */
.cover-layout-left-two-right-one {
    flex-direction: row;
}

.cover-upload-column {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* 尺寸控制类 */
.cover-upload-half-width {
    flex: 1;
}

.cover-upload-half-height {
    flex: 1;
}

.cover-upload-area {
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    cursor: pointer;
    min-height: 80px;
    background: #f2f2f2;
    position: relative;
    overflow: hidden;
}

.cover-upload-area:hover {
    border-color: var(--p-primary-500);
    background: var(--p-primary-50);
}

.cover-upload-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    height: 100%;
    padding: 20px;
    position: absolute;
    top: 0;
    left: 0;
}

.cover-upload-icon {
    font-size: 32px;
    color: var(--p-surface-400);
    transition: color 0.3s ease;
}

.cover-upload-area:hover .cover-upload-icon {
    color: var(--p-primary-500);
}

.cover-image-preview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    background: var(--p-surface-0);
}

.cover-preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.cover-image-overlay {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 100;
}

.cover-image-preview:hover .cover-image-overlay {
    opacity: 1;
}

.cover-edit-btn {
    width: 32px !important;
    height: 32px !important;
    border-radius: 6px !important;
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(4px);
    color: var(--p-surface-700) !important;
    font-size: 14px !important;
}

.cover-modal-footer {
    display: flex;
    justify-content: center;
    padding: 20px 24px;
    border-top: 1px solid var(--p-surface-200);
}

.cover-create-btn {
    background: var(--p-primary-500);
    color: white;
    padding: 12px 32px;
    border-radius: 8px;
    font-weight: 500;
    border: none;
}

.cover-image-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    z-index: 3;
}

.cover-image-loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
}

.cover-image-loading-spinner {
    font-size: 28px;
    color: var(--p-primary-500);
    animation: spin 1s linear infinite;
}

.cover-image-loading-text {
    color: var(--p-surface-700);
    font-size: 14px;
    font-weight: 500;
}

.cover-image-loading-progress {
    width: 120px;
    height: 4px;
    background: var(--p-surface-200);
    border-radius: 2px;
    overflow: hidden;
}

.cover-image-loading-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--p-primary-500), var(--p-primary-600));
    border-radius: 2px;
    animation: loading-progress 1s ease-in-out;
}

@keyframes loading-progress {
    0% {
        width: 0%;
    }
    100% {
        width: 100%;
    }
}

.cover-delete-btn {
    width: 32px !important;
    height: 32px !important;
    border-radius: 6px !important;
    background: rgba(239, 68, 68, 0.9) !important;
    backdrop-filter: blur(4px);
    color: white !important;
    font-size: 14px !important;
    border: none !important;
}

.cover-delete-btn:hover {
    background: rgba(220, 38, 38, 0.95) !important;
}



.version-cover-display {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    background: var(--p-surface-0);
    aspect-ratio: 1;
}

.version-cover-display-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.version-cover-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 100;
}

.version-cover-display:hover .version-cover-actions {
    opacity: 1;
}

.version-cover-actions .p-button {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
}

.version-cover-hover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 2;
}

.version-cover-display:hover .version-cover-hover-overlay {
    opacity: 1;
}

.version-cover-zoom-btn {
    color: white !important;
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    font-size: 18px !important;
}

.version-cover-zoom-btn:hover {
    background: transparent;
}

/* 发布成功提示弹窗样式 */
.publish-success-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    animation: fadeIn 0.3s ease;
}

.publish-success-container {
    background: white;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: zoomIn 0.3s ease;
    min-width: 400px;
    max-width: 90vw;
}

.publish-success-content {
    padding: 32px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
}

.publish-success-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--p-surface-900);
    margin: 0;
}

.publish-success-message {
    font-size: 16px;
    color: var(--p-surface-600);
    line-height: 1.5;
    margin: 0;
}

.publish-success-btn {
    background: var(--p-primary-500) !important;
    color: white !important;
    padding: 12px 32px !important;
    border-radius: 8px !important;
    font-weight: 500 !important;
    border: none !important;
    min-width: 120px;
    font-size: 16px;
    transition: all 0.2s ease;
}

.publish-success-btn:hover {
    background: var(--p-primary-600) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--p-primary-color-rgb), 0.3);
}

/* 错误提示弹窗样式 */
.error-message-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    animation: fadeIn 0.3s ease;
}

.error-message-container {
    background: white;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: zoomIn 0.3s ease;
    min-width: 400px;
    max-width: 90vw;
}

.error-message-content {
    padding: 32px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
}

.error-message-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--p-red-600);
    margin: 0;
}

.error-message-text {
    font-size: 16px;
    color: var(--p-surface-600);
    line-height: 1.5;
    margin: 0;
}

.error-message-btn {
    background: var(--p-red-500) !important;
    color: white !important;
    padding: 12px 32px !important;
    border-radius: 8px !important;
    font-weight: 500 !important;
    border: none !important;
    min-width: 120px;
    font-size: 16px;
    transition: all 0.2s ease;
}

.error-message-btn:hover {
    background: var(--p-red-600) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}
</style>