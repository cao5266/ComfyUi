# ComfyUI 节点类型说明文档

## 概述

ComfyUI 是一个基于节点的稳定扩散图形界面，提供了丰富的节点类型来构建复杂的AI图像生成工作流。本文档详细介绍了ComfyUI中所有主要的节点类型和分类。

## 主要节点分类

### 1. 采样节点 (Sampling)

采样节点是生成图像的核心，负责从噪声中逐步生成清晰的图像。

#### 基础采样器
- **KSampler**: 基础采样器，用于图像生成的核心节点
- **KSampler (Advanced)**: 高级采样器，提供更多控制选项
- **SamplerCustom**: 自定义采样器，提供灵活的采样配置

#### 专用采样器
- **SamplerDPMPP_2M_SDE**: DPM++2M SDE采样器
- **SamplerDPMPP_SDE**: DPM++SDE采样器
- **KSamplerSelect**: 采样器选择节点

#### 调度器 (Schedulers)
- **BasicScheduler**: 基础调度器  
- **KarrasScheduler**: Karras调度器
- **ExponentialScheduler**: 指数调度器
- **PolyexponentialScheduler**: 多指数调度器
- **SDTurboScheduler**: SD Turbo调度器
- **VPScheduler**: VP调度器

#### 信号处理 (Sigmas)
- **FlipSigmas**: 翻转信号序列
- **SplitSigmas**: 分割信号序列

### 2. 加载器节点 (Loaders)

负责加载各种模型和资源文件。

#### 模型加载器
- **CheckpointLoaderSimple**: 简单检查点加载器，加载SD模型
- **UNETLoader**: UNET模型加载器
- **DiffusersLoader**: Diffusers模型加载器

#### CLIP相关加载器
- **CLIPLoader**: CLIP模型加载器
- **CLIPVisionLoader**: CLIP视觉模型加载器  
- **DualCLIPLoader**: 双CLIP加载器
- **QuadrupleCLIPLoader**: 四CLIP加载器

#### 专用模型加载器
- **ControlNetLoader**: ControlNet模型加载器
- **DiffControlNetLoader**: 差分ControlNet加载器
- **LoraLoader**: LoRA模型加载器
- **LoraLoaderModelOnly**: 仅模型LoRA加载器
- **VAELoader**: VAE模型加载器
- **UpscaleModelLoader**: 放大模型加载器
- **StyleModelLoader**: 风格模型加载器
- **GLIGENLoader**: GLIGEN模型加载器
- **HypernetworkLoader**: 超网络加载器
- **unCLIPCheckpointLoader**: unCLIP检查点加载器

#### 视频模型加载器
- **ImageOnlyCheckpointLoader**: 仅图像检查点加载器（用于img2vid模型）

### 3. 条件控制节点 (Conditioning)

控制生成过程的条件和引导。

#### 文本编码
- **CLIPTextEncode**: CLIP文本编码（提示词）
- **CLIPTextEncodeSDXL**: SDXL专用文本编码
- **CLIPTextEncodeSDXLRefiner**: SDXL精炼器文本编码
- **CLIPTextEncodeHunyuanDiT**: 混元DiT文本编码
- **CLIPTextEncodeFlux**: Flux文本编码

#### 视觉编码
- **CLIPVisionEncode**: CLIP视觉编码
- **CLIPSetLastLayer**: 设置CLIP最后一层

#### 条件操作
- **ConditioningAverage**: 条件平均
- **ConditioningCombine**: 条件合并
- **ConditioningConcat**: 条件连接
- **ConditioningSetArea**: 设置条件区域
- **ConditioningSetAreaWithPercentage**: 按百分比设置条件区域
- **ConditioningSetAreaStrength**: 设置区域条件强度
- **ConditioningSetMask**: 设置条件遮罩
- **ConditioningSetTimestepRange**: 设置时间步范围
- **ConditioningZeroOut**: 条件归零

#### 控制网络
- **ApplyControlNet**: 应用ControlNet
- **ApplyControlNetAdvanced**: 高级ControlNet应用

#### 专用条件
- **FluxGuidance**: Flux引导
- **GLIGENTextBoxApply**: GLIGEN文本框应用
- **InpaintModelConditioning**: 修复模型条件
- **StyleModelApply**: 风格模型应用
- **unCLIPConditioning**: unCLIP条件

#### 3D模型条件
- **StableZero123_Conditioning**: Stable Zero123条件
- **StableZero123_Conditioning_Batched**: 批处理Stable Zero123条件

#### 放大扩散条件
- **SD_4XUpscale_Conditioning**: SD 4倍放大条件

#### 视频模型条件
- **SVD_img2vid_Conditioning**: SVD图转视频条件
- **WanFunControlToVideo**: Wan趣味控制转视频

### 4. 图像处理节点 (Image)

处理和操作图像数据。

#### 基础图像操作
- **LoadImage**: 加载图像
- **SaveImage**: 保存图像
- **PreviewImage**: 预览图像
- **EmptyImage**: 空白图像
- **InvertImage**: 反转图像

#### 图像合成
- **ImageBatch**: 图像批处理
- **ImageCompositeMasked**: 遮罩图像合成

#### 图像变换
- **ImageCrop**: 图像裁剪
- **ImagePadForOutpaint**: 图像填充用于外绘

#### 批处理操作
- **ImageFromBatch**: 从批次中提取图像
- **RebatchImages**: 重新批处理图像
- **RepeatImageBatch**: 重复图像批次

#### 后处理 (Postprocessing)
- **ImageBlend**: 图像混合
- **ImageBlur**: 图像模糊
- **ImageQuantize**: 图像量化
- **ImageSharpen**: 图像锐化

#### 预处理器 (Preprocessors)
- **Canny**: Canny边缘检测

#### 放大 (Upscaling)
- **ImageScale**: 图像缩放
- **ImageScaleBy**: 按比例缩放图像
- **ImageScaleToTotalPixels**: 按总像素数缩放图像
- **ImageUpscaleWithModel**: 使用模型放大图像

#### 动画
- **SaveAnimatedPNG**: 保存动画PNG
- **SaveAnimatedWEBP**: 保存动画WEBP

### 5. 潜空间节点 (Latent)

处理潜空间表示的操作。

#### 基础潜空间操作
- **EmptyLatentImage**: 空潜空间图像
- **VAEEncode**: VAE编码
- **VAEDecode**: VAE解码
- **LatentUpscale**: 潜空间放大
- **LatentUpscaleBy**: 按比例潜空间放大

#### 潜空间合成
- **LatentComposite**: 潜空间合成
- **LatentCompositeMasked**: 遮罩潜空间合成

#### 高级潜空间操作
- **LatentAdd**: 潜空间加法
- **LatentSubtract**: 潜空间减法
- **LatentMultiply**: 潜空间乘法
- **LatentInterpolate**: 潜空间插值
- **LatentBatchSeedBehavior**: 潜空间批次种子行为

#### 批处理操作
- **LatentBatch**: 潜空间批处理
- **LatentFromBatch**: 从批次提取潜空间
- **RebatchLatents**: 重新批处理潜空间
- **RepeatLatentBatch**: 重复潜空间批次

#### 修复 (Inpaint)
- **SetLatentNoiseMask**: 设置潜空间噪声遮罩
- **VAEEncodeForInpaint**: VAE修复编码

#### 变换 (Transform)
- **CropLatent**: 裁剪潜空间
- **FlipLatent**: 翻转潜空间
- **RotateLatent**: 旋转潜空间

#### 视频
- **EmptyHunyuanLatentVideo**: 空混元潜空间视频

### 6. 遮罩节点 (Mask)

创建和操作遮罩数据。

#### 基础遮罩操作
- **LoadImageMask**: 加载图像遮罩
- **MaskToImage**: 遮罩转图像
- **ImageToMask**: 图像转遮罩
- **InvertMask**: 反转遮罩
- **SolidMask**: 纯色遮罩

#### 遮罩变换
- **CropMask**: 裁剪遮罩
- **FeatherMask**: 羽化遮罩
- **GrowMask**: 扩展遮罩

#### 遮罩合成
- **MaskComposite**: 遮罩合成
- **ImageColorToMask**: 图像颜色转遮罩

#### 合成操作 (Compositing)
- **JoinImageWithAlpha**: 连接图像与Alpha通道
- **SplitImageWithAlpha**: 分离图像与Alpha通道
- **PorterDuffImageComposite**: Porter-Duff图像合成

### 7. 高级节点 (Advanced)

高级功能和设置。

#### 模型操作
- **ModelSamplingContinuousEDM**: 模型连续EDM采样
- **ModelSamplingDiscrete**: 模型离散采样
- **RescaleCFG**: 重新缩放CFG

#### 模型合并 (Model Merging)
- **CheckpointSave**: 检查点保存
- **CLIPMergeSimple**: 简单CLIP合并
- **CLIPSave**: CLIP保存
- **ModelMergeAdd**: 模型合并加法
- **ModelMergeBlocks**: 模型块合并
- **ModelMergeSimple**: 简单模型合并
- **ModelMergeSubtract**: 模型合并减法
- **VAESave**: VAE保存

### 8. 实用工具节点 (Utils)

辅助功能节点。

- **Note**: 注释节点
- **Primitive**: 原始值节点
- **Reroute**: 重新路由节点
- **TerminalLog**: 终端日志节点（Manager）

## 节点来源分类

### 核心节点 (Core)
- 来自ComfyUI核心模块
- 包括基础的采样、加载、条件控制等功能
- 标识：🦊 Comfy Core

### 自定义节点 (Custom Nodes)  
- 由社区开发的扩展节点
- 通过ComfyUI Manager安装
- 提供额外的功能和特殊效果

### 未知来源 (Unknown)
- 来源不明的节点
- 可能是实验性或测试节点

## 节点分组策略

ComfyUI支持多种节点分组方式：

1. **按类别分组**: 根据功能分类（如采样、加载器等）
2. **按来源分组**: 区分核心节点和自定义节点
3. **按用途分组**: 根据具体应用场景分类

## 常用工作流节点组合

### 基础文生图工作流
1. CheckpointLoaderSimple（加载模型）
2. CLIPTextEncode（正向提示词）
3. CLIPTextEncode（负向提示词）
4. EmptyLatentImage（空白潜空间）
5. KSampler（采样器）
6. VAEDecode（VAE解码）
7. SaveImage（保存图像）

### ControlNet工作流
- 基础工作流 + ControlNetLoader + ApplyControlNet

### LoRA工作流
- 基础工作流 + LoraLoader

### 修复工作流
- LoadImage + VAEEncodeForInpaint + InpaintModelConditioning

## 总结

ComfyUI提供了超过200种不同类型的节点，覆盖了AI图像生成的各个方面。通过合理组合这些节点，用户可以构建从简单到复杂的各种图像生成工作流。

每个节点都有特定的输入和输出类型，确保了工作流的类型安全性。用户可以根据具体需求选择合适的节点组合来实现所需的图像生成效果。

---

*本文档基于ComfyUI当前版本编写，节点类型可能随版本更新而变化。建议定期查看官方文档获取最新信息。* 