# ComfyUI 后端部署完整指南

## 📋 项目概述

本文档详细记录了在Linux服务器上部署ComfyUI后端服务的完整过程，包括环境配置、模型下载、前端连接等所有步骤。**支持GPU和CPU两种部署模式**。

### 🎯 部署目标

- **服务器**: AWS EC2 (ip-172-31-29-66)
- **操作系统**: Amazon Linux / Ubuntu / CentOS
- **部署路径**: `/home/wwwroot/comfyui`
- **运行模式**: GPU模式 / CPU模式
- **后端地址**: `http://testapi.maxmuse.ai:8188`
- **前端项目**: Vue 3 + TypeScript

---

## 🚀 第一阶段：环境准备

### 1.1 系统环境检查

```bash
# 检查操作系统版本
cat /etc/os-release

# 检查Python版本（需要3.9+）
python3 --version

# 检查内存和CPU
free -h
lscpu

# 检查GPU硬件（如果有的话）
lspci | grep -i nvidia
nvidia-smi  # 如果安装了NVIDIA驱动
```

### 1.2 检查GPU支持

#### 1.2.1 检查NVIDIA GPU

```bash
# 检查是否有NVIDIA GPU
lspci | grep -i nvidia

# 如果有输出，表示有NVIDIA GPU，继续检查驱动
nvidia-smi

# 检查CUDA版本
nvcc --version

# 检查CUDA库
ls -la /usr/local/cuda*/lib64/libcudart.so*
```

#### 1.2.2 检查AMD GPU

```bash
# 检查AMD GPU
lspci | grep -i amd

# 检查ROCm支持
rocm-smi  # 如果安装了ROCm
```

### 1.3 安装必要的系统依赖

#### 1.3.1 基础依赖（所有系统）

```bash
# Amazon Linux / CentOS
sudo yum update -y
sudo yum install python3 python3-pip python3-venv git wget curl htop screen -y

# Ubuntu / Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv git wget curl htop screen -y
```

#### 1.3.2 GPU驱动安装（可选）

**NVIDIA GPU驱动安装:**

```bash
# Ubuntu/Debian系统
sudo apt update
sudo apt install nvidia-driver-535 nvidia-cuda-toolkit -y

# CentOS/RHEL系统
sudo yum install nvidia-driver nvidia-cuda-toolkit -y

# 重启系统使驱动生效
sudo reboot

# 验证安装
nvidia-smi
nvcc --version
```

**AMD GPU驱动安装:**

```bash
# Ubuntu系统
sudo apt install rocm-dev rocm-libs -y

# 添加用户到render组
sudo usermod -a -G render,video $USER

# 重启系统
sudo reboot

# 验证安装
rocm-smi
```

### 1.4 创建部署目录

```bash
# 创建部署根目录
sudo mkdir -p /home/wwwroot
cd /home/wwwroot

# 设置目录权限
sudo chown -R $USER:$USER /home/wwwroot
```

---

## 🛠️ 第二阶段：ComfyUI后端安装

### 2.1 克隆ComfyUI仓库

```bash
# 切换到部署目录
cd /home/wwwroot

# 克隆ComfyUI v0.3.15版本
git clone https://github.com/comfyanonymous/ComfyUI.git comfyui
cd comfyui
git checkout v0.3.15

# 检查项目结构
ls -la
```

### 2.2 创建Python虚拟环境

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 验证虚拟环境
which python
python --version
```

### 2.3 安装Python依赖

#### 2.3.1 安装基础依赖

```bash
# 安装ComfyUI基础依赖
pip install -r requirements.txt
```

#### 2.3.2 安装GPU支持（根据硬件选择）

**NVIDIA GPU (CUDA) 版本:**

```bash
# CUDA 12.4版本（推荐）
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# CUDA 12.1版本
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# CUDA 11.8版本
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 验证CUDA安装
python -c "import torch; print(f'CUDA可用: {torch.cuda.is_available()}')"
python -c "import torch; print(f'CUDA设备数: {torch.cuda.device_count()}')"
python -c "import torch; print(f'GPU名称: {torch.cuda.get_device_name(0)}' if torch.cuda.is_available() else 'No GPU')"
```

**AMD GPU (ROCm) 版本:**

```bash
# ROCm 6.0版本
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.0

# ROCm 5.4版本
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.4

# 验证ROCm安装
python -c "import torch; print(f'ROCm可用: {torch.cuda.is_available()}')"
```

**CPU版本（无GPU服务器）:**

```bash
# CPU版本PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# 验证CPU安装
python -c "import torch; print(f'PyTorch版本: {torch.__version__}')"
python -c "import torch; print(f'CPU线程数: {torch.get_num_threads()}')"
```

### 2.4 首次启动测试

#### 2.4.1 GPU模式启动测试

```bash
# NVIDIA GPU模式测试
python main.py --listen 0.0.0.0 --port 8188

# AMD GPU模式测试
python main.py --listen 0.0.0.0 --port 8188

# 成功输出示例：
# Device: cuda
# VRAM: 8192 MB
# ComfyUI version: 0.3.15
# Starting server
```

#### 2.4.2 CPU模式启动测试

```bash
# CPU模式测试
python main.py --cpu --listen 0.0.0.0 --port 8188

# 成功输出示例：
# Device: cpu
# Total RAM 7727 MB
# pytorch version: 2.7.1+cpu
# ComfyUI version: 0.3.15
# Starting server
```

---

## 📦 第三阶段：模型下载配置

### 3.1 检查模型目录结构

```bash
# 查看模型目录结构
cd /home/wwwroot/comfyui
ls -lah models/

# 模型目录说明：
# checkpoints/    - 主要模型文件（SD 1.5, SDXL等）
# vae/           - VAE模型文件
# loras/         - LoRA模型文件
# controlnet/    - ControlNet模型文件
# upscale_models/ - 图像放大模型
# embeddings/    - 文本嵌入模型
```

### 3.2 下载基础模型

#### 3.2.1 Stable Diffusion 1.5模型（适合入门和CPU）

```bash
cd /home/wwwroot/comfyui/models/checkpoints

# SD 1.5 EMA Only（约4GB，CPU友好）
sudo wget https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors

# SD 1.5完整版（约7GB，GPU推荐）
sudo wget https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned.safetensors
```

#### 3.2.2 Stable Diffusion XL模型（GPU推荐）

```bash
# SDXL Base模型（约6.6GB，需要较好的GPU）
sudo wget https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors

# SDXL Refiner模型（约6.1GB，可选）
sudo wget https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/resolve/main/sd_xl_refiner_1.0.safetensors
```

#### 3.2.3 快速生成模型

```bash
# SD Turbo（1-4步快速生成，约5GB）
sudo wget https://huggingface.co/stabilityai/sd-turbo/resolve/main/sd_turbo.safetensors

# SDXL Turbo（快速SDXL，约6.6GB）
sudo wget https://huggingface.co/stabilityai/sdxl-turbo/resolve/main/sd_xl_turbo_1.0.safetensors
```

### 3.3 下载VAE模型（提升图像质量）

```bash
cd /home/wwwroot/comfyui/models/vae

# SD 1.5专用VAE（约335MB）
sudo wget https://huggingface.co/stabilityai/sd-vae-ft-mse-original/resolve/main/vae-ft-mse-840000-ema-pruned.safetensors

# SDXL专用VAE（约335MB）
sudo wget https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors
```

### 3.4 下载预览模型（加速预览）

```bash
cd /home/wwwroot/comfyui/models/vae_approx

# TAESD for SD 1.5（约5MB）
sudo wget https://github.com/madebyollin/taesd/raw/main/taesd_decoder.pth

# TAESDXL for SDXL（约5MB）
sudo wget https://github.com/madebyollin/taesd/raw/main/taesdxl_decoder.pth
```

### 3.5 下载ControlNet模型（精确控制）

```bash
cd /home/wwwroot/comfyui/models/controlnet

# Canny边缘检测（约1.4GB）
sudo wget https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11p_sd15_canny.pth

# OpenPose人体姿态（约1.4GB）
sudo wget https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11p_sd15_openpose.pth

# Depth深度图（约1.4GB）
sudo wget https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11f1p_sd15_depth.pth
```

### 3.6 下载上采样模型

```bash
cd /home/wwwroot/comfyui/models/upscale_models

# Real-ESRGAN 4x（约67MB）
sudo wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth

# Real-ESRGAN 2x（约67MB）
sudo wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth

# LDSR超分辨率（约2GB，GPU推荐）
sudo wget https://heibox.uni-heidelberg.de/f/578df07c8fc04ffbadf3/?dl=1 -O LDSR.ckpt
```

---

## ⚙️ 第四阶段：服务配置

### 4.1 创建启动脚本

#### 4.1.1 GPU模式启动脚本

```bash
# 创建GPU启动脚本
sudo tee /home/wwwroot/comfyui/start_comfyui_gpu.sh > /dev/null <<'EOF'
#!/bin/bash
cd /home/wwwroot/comfyui
source venv/bin/activate

# GPU优化设置
export CUDA_VISIBLE_DEVICES=0  # 使用第一个GPU
export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:128

# 启动ComfyUI GPU模式
python main.py \
  --listen 0.0.0.0 \
  --port 8188 \
  --preview-method auto \
  --enable-cors-header \
  --highvram  # 或 --normalvram 或 --lowvram
EOF

chmod +x /home/wwwroot/comfyui/start_comfyui_gpu.sh
```

#### 4.1.2 CPU模式启动脚本

```bash
# 创建CPU启动脚本
sudo tee /home/wwwroot/comfyui/start_comfyui_cpu.sh > /dev/null <<'EOF'
#!/bin/bash
cd /home/wwwroot/comfyui
source venv/bin/activate

# CPU优化设置
export OMP_NUM_THREADS=4
export MKL_NUM_THREADS=4
export TORCH_NUM_THREADS=4

# 启动ComfyUI CPU模式
python main.py \
  --cpu \
  --listen 0.0.0.0 \
  --port 8188 \
  --preview-method auto \
  --enable-cors-header
EOF

chmod +x /home/wwwroot/comfyui/start_comfyui_cpu.sh
```

#### 4.1.3 智能启动脚本（自动检测GPU）

```bash
# 创建智能启动脚本
sudo tee /home/wwwroot/comfyui/start_comfyui_auto.sh > /dev/null <<'EOF'
#!/bin/bash
cd /home/wwwroot/comfyui
source venv/bin/activate

# 检测GPU
if command -v nvidia-smi &> /dev/null && nvidia-smi &> /dev/null; then
    echo "检测到NVIDIA GPU，使用GPU模式启动"
    export CUDA_VISIBLE_DEVICES=0
    export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:128
    
    python main.py \
      --listen 0.0.0.0 \
      --port 8188 \
      --preview-method auto \
      --enable-cors-header \
      --normalvram
elif command -v rocm-smi &> /dev/null && rocm-smi &> /dev/null; then
    echo "检测到AMD GPU，使用GPU模式启动"
    
    python main.py \
      --listen 0.0.0.0 \
      --port 8188 \
      --preview-method auto \
      --enable-cors-header
else
    echo "未检测到GPU，使用CPU模式启动"
    export OMP_NUM_THREADS=4
    export MKL_NUM_THREADS=4
    export TORCH_NUM_THREADS=4
    
    python main.py \
      --cpu \
      --listen 0.0.0.0 \
      --port 8188 \
      --preview-method auto \
      --enable-cors-header
fi
EOF

chmod +x /home/wwwroot/comfyui/start_comfyui_auto.sh
```

### 4.2 配置systemd服务

```bash
# 创建systemd服务文件（使用智能启动脚本）
sudo tee /etc/systemd/system/comfyui.service > /dev/null <<'EOF'
[Unit]
Description=ComfyUI Backend Service (Auto GPU/CPU)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/wwwroot/comfyui
ExecStart=/home/wwwroot/comfyui/start_comfyui_auto.sh
Restart=always
RestartSec=10
Environment=PATH=/home/wwwroot/comfyui/venv/bin
Environment=PYTHONPATH=/home/wwwroot/comfyui

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd配置
sudo systemctl daemon-reload

# 启用自启动
sudo systemctl enable comfyui

# 启动服务
sudo systemctl start comfyui

# 检查服务状态
sudo systemctl status comfyui
```

### 4.3 配置防火墙

```bash
# Amazon Linux / CentOS
sudo firewall-cmd --permanent --add-port=8188/tcp
sudo firewall-cmd --reload

# Ubuntu
sudo ufw allow 8188

# 验证端口监听
netstat -tlnp | grep 8188
```

---

## 🌐 第五阶段：前端配置

### 5.1 前端项目环境配置

在本地Windows环境的ComfyUI_frontend项目中：

```bash
# 创建环境配置文件 .env
DEV_SERVER_COMFYUI_URL=http://testapi.maxmuse.ai:8188
VITE_REMOTE_DEV=true
PLAYWRIGHT_TEST_URL=http://localhost:5173
ENABLE_MINIFY=false
```

### 5.2 安装前端依赖

```bash
# 在ComfyUI_frontend目录下
npm install

# 启动开发服务器
npm run dev
```

### 5.3 验证前后端连接

```bash
# 测试后端API
curl http://testapi.maxmuse.ai:8188/system_stats

# 检查模型列表
curl http://testapi.maxmuse.ai:8188/object_info | grep -A 5 "CheckpointLoaderSimple"
```

---

## 🧪 第六阶段：测试验证

### 6.1 后端服务验证

```bash
# 检查ComfyUI进程
ps aux | grep "python main.py"

# 检查服务日志
sudo journalctl -u comfyui -f

# 检查端口状态
netstat -tlnp | grep 8188

# 检查GPU使用情况（如果有GPU）
nvidia-smi  # NVIDIA GPU
rocm-smi    # AMD GPU
```

### 6.2 性能测试

#### 6.2.1 GPU性能测试

```bash
# 测试GPU内存使用
watch -n 1 nvidia-smi

# 生成测试（通过Web界面）
# - 分辨率: 1024x1024 (SDXL) 或 512x512 (SD 1.5)
# - 采样步数: 30-50步
# - 批处理: 1-4个图像
```

#### 6.2.2 CPU性能测试

```bash
# 监控CPU和内存使用
htop

# 生成测试（通过Web界面）
# - 分辨率: 512x512
# - 采样步数: 20-30步
# - 批处理: 1个图像
```

### 6.3 模型加载验证

```bash
# 检查所有已下载的模型
echo "=== Checkpoints ==="
ls -lah /home/wwwroot/comfyui/models/checkpoints/

echo "=== VAE ==="
ls -lah /home/wwwroot/comfyui/models/vae/

echo "=== ControlNet ==="
ls -lah /home/wwwroot/comfyui/models/controlnet/

echo "=== LoRA ==="
ls -lah /home/wwwroot/comfyui/models/loras/

echo "=== Upscale Models ==="
ls -lah /home/wwwroot/comfyui/models/upscale_models/
```

---

## 🔧 故障排除

### 7.1 GPU相关问题

#### 问题1：CUDA out of memory

**症状**: `RuntimeError: CUDA out of memory`
**解决方案**:

```bash
# 降低VRAM使用
python main.py --lowvram --listen 0.0.0.0 --port 8188

# 或者使用CPU模式
python main.py --cpu --listen 0.0.0.0 --port 8188

# 减少图像尺寸和批处理大小
```

#### 问题2：GPU not detected

**症状**: `torch.cuda.is_available()` 返回 `False`
**解决方案**:

```bash
# 检查NVIDIA驱动
nvidia-smi

# 重新安装CUDA版本的PyTorch
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# 检查CUDA环境变量
echo $CUDA_HOME
echo $LD_LIBRARY_PATH
```

#### 问题3：AMD GPU not working

**症状**: AMD GPU无法使用
**解决方案**:

```bash
# 检查ROCm安装
rocm-smi

# 重新安装ROCm版本的PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.0

# 检查用户组权限
groups $USER  # 应该包含render和video组
```

### 7.2 CPU相关问题

#### 问题1：CPU模式太慢

**优化方案**:

```bash
# 设置CPU线程数
export OMP_NUM_THREADS=8  # 根据CPU核心数调整

# 使用更小的模型
# SD Turbo instead of SD 1.5
# 512x512 instead of 1024x1024

# 减少采样步数
# 15-20步 instead of 50步
```

#### 问题2：内存不足

**解决方案**:

```bash
# 添加swap空间
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久启用
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 7.3 通用问题

#### 问题1：模型列表为空

**解决**: 确保模型文件正确下载并有正确权限

#### 问题2：端口被占用

**解决**: 更改端口或杀死占用进程

```bash
sudo lsof -i:8188
sudo kill -9 <PID>
```

---

## 📊 部署总结

### 🎯 硬件要求

#### GPU模式推荐配置

- **NVIDIA GPU**: GTX 1060 6GB / RTX 3060 12GB / RTX 4090 24GB
- **AMD GPU**: RX 6700 XT / RX 7900 XTX
- **内存**: 16GB+ RAM
- **存储**: 50GB+ 可用空间

#### CPU模式最低配置

- **CPU**: 4核心以上
- **内存**: 8GB+ RAM (推荐16GB+)
- **存储**: 20GB+ 可用空间

### 🚀 性能对比

| 模式 | 分辨率 | 采样步数 | 生成时间 | 推荐模型 |
|------|--------|----------|----------|----------|
| RTX 4090 | 1024x1024 | 30步 | 10-30秒 | SDXL |
| RTX 3060 | 512x512 | 30步 | 30-60秒 | SD 1.5 |
| CPU模式 | 512x512 | 20步 | 5-15分钟 | SD Turbo |

### 📁 完整文件结构

```
/home/wwwroot/comfyui/
├── models/
│   ├── checkpoints/
│   │   ├── v1-5-pruned-emaonly.safetensors (4.0GB)
│   │   ├── sd_xl_base_1.0.safetensors (6.6GB)
│   │   └── sd_turbo.safetensors (5.0GB)
│   ├── vae/
│   │   ├── vae-ft-mse-840000-ema-pruned.safetensors (335MB)
│   │   └── sdxl_vae.safetensors (335MB)
│   ├── vae_approx/
│   │   ├── taesd_decoder.pth (5MB)
│   │   └── taesdxl_decoder.pth (5MB)
│   ├── controlnet/
│   │   ├── control_v11p_sd15_canny.pth (1.4GB)
│   │   └── control_v11p_sd15_openpose.pth (1.4GB)
│   └── upscale_models/
│       └── RealESRGAN_x4plus.pth (67MB)
├── venv/ (Python虚拟环境)
├── start_comfyui_gpu.sh (GPU启动脚本)
├── start_comfyui_cpu.sh (CPU启动脚本)
├── start_comfyui_auto.sh (智能启动脚本)
└── main.py (ComfyUI主程序)
```

### 🔗 访问地址

- **后端API**: `http://testapi.maxmuse.ai:8188`
- **Web界面**: `http://testapi.maxmuse.ai:8188`
- **前端开发**: `http://localhost:5173` (开发模式)

---

## 📝 维护建议

### 日常维护

```bash
# 检查服务状态
sudo systemctl status comfyui

# 查看日志
sudo journalctl -u comfyui --since "1 hour ago"

# 更新ComfyUI
cd /home/wwwroot/comfyui
git pull origin main

# 备份配置
tar -czf comfyui_backup_$(date +%Y%m%d).tar.gz /home/wwwroot/comfyui/

# GPU监控（如果有GPU）
watch -n 1 nvidia-smi
```

### 性能调优

#### GPU优化

```bash
# NVIDIA GPU功耗管理
sudo nvidia-smi -pl 300  # 设置功耗限制为300W

# GPU风扇控制
sudo nvidia-settings -a "[gpu:0]/GPUFanControlState=1"
sudo nvidia-settings -a "[fan:0]/GPUTargetFanSpeed=80"
```

#### CPU优化

```bash
# CPU调度器优化
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# 内存优化
echo 1 | sudo tee /proc/sys/vm/swappiness
```

### 扩展建议

1. **硬件升级路径**: CPU → GTX 1060 → RTX 3060 → RTX 4090
2. **模型管理**: 安装ComfyUI Manager自动管理模型和节点
3. **负载均衡**: 配置Nginx反向代理支持多实例
4. **监控告警**: 配置Prometheus + Grafana监控GPU使用率
5. **自动备份**: 配置定时任务备份生成的图像和工作流

---

**文档版本**: v2.0  
**创建日期**: 2025年6月5日  
**最后更新**: 2025年6月5日  
**作者**: AI Assistant  
**支持环境**: AWS EC2, GPU/CPU双模式
