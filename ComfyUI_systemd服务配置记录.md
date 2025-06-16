# ComfyUI Systemd 服务配置记录

## 📋 项目信息

- **服务器**: AWS EC2 (ip-172-31-29-66)
- **ComfyUI安装路径**: `/home/wwwroot/comfyui/comfyui`
- **运行模式**: CPU模式
- **服务端口**: 8188
- **后端访问地址**: `http://testapi.maxmuse.ai:8188`
- **配置日期**: 2025年1月
- **配置状态**: ✅ 已完成并测试通过

---

## 🎯 配置目标

实现ComfyUI后端服务的持续运行，确保：
- SSH断开连接后服务仍然运行
- 服务器重启后自动启动
- 服务异常时自动重启
- 统一的日志管理

---

## 📁 目录结构确认

```
/home/wwwroot/comfyui/comfyui/
├── venv/                          # Python虚拟环境
├── main.py                        # ComfyUI主程序
├── start_comfyui.sh              # 启动脚本（新创建）
├── models/                        # 模型文件目录
├── requirements.txt              # Python依赖
└── ...其他ComfyUI文件
```

---

## 🚀 详细配置步骤

### 第一步：环境确认

```bash
# 1. 确认当前目录
pwd
# 输出：/home/wwwroot/comfyui/comfyui

# 2. 检查是否有运行中的进程
ps aux | grep "python main.py"
# 应该只看到grep命令本身

# 3. 停止可能存在的进程
pkill -f "python main.py"

# 4. 确认关键文件存在
ls -la main.py venv/
```

### 第二步：创建启动脚本

```bash
# 创建专用启动脚本
sudo tee /home/wwwroot/comfyui/comfyui/start_comfyui.sh > /dev/null <<'EOF'
#!/bin/bash

# 进入ComfyUI目录
cd /home/wwwroot/comfyui/comfyui

# 激活Python虚拟环境
source venv/bin/activate

# 设置CPU优化参数
export OMP_NUM_THREADS=4
export MKL_NUM_THREADS=4
export TORCH_NUM_THREADS=4

# 启动ComfyUI服务
python main.py --cpu --listen 0.0.0.0 --port 8188 --preview-method auto --enable-cors-header
EOF
```

### 第三步：设置脚本权限

```bash
# 添加执行权限
sudo chmod +x /home/wwwroot/comfyui/comfyui/start_comfyui.sh

# 验证权限设置
ls -la /home/wwwroot/comfyui/comfyui/start_comfyui.sh
# 应该显示：-rwxr-xr-x 1 root root ...
```

### 第四步：测试启动脚本

```bash
# 手动运行脚本测试
/home/wwwroot/comfyui/comfyui/start_comfyui.sh

# 正常输出示例：
# Device: cpu
# Total RAM XXXX MB
# pytorch version: X.X.X+cpu
# ComfyUI version: 0.3.15
# Starting server

# 测试完成后按 Ctrl+C 停止
```

### 第五步：创建systemd服务文件

```bash
# 创建系统服务配置
sudo tee /etc/systemd/system/comfyui.service > /dev/null <<'EOF'
[Unit]
Description=ComfyUI Backend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/wwwroot/comfyui/comfyui
ExecStart=/home/wwwroot/comfyui/comfyui/start_comfyui.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

### 第六步：启用和启动服务

```bash
# 1. 重新加载systemd配置
sudo systemctl daemon-reload

# 2. 启用开机自启动
sudo systemctl enable comfyui
# 输出：Created symlink /etc/systemd/system/multi-user.target.wants/comfyui.service → /etc/systemd/system/comfyui.service.

# 3. 启动服务
sudo systemctl start comfyui

# 4. 检查服务状态
sudo systemctl status comfyui
```

### 第七步：验证服务运行

```bash
# 1. 检查服务状态
sudo systemctl status comfyui
# 应该显示：Active: active (running)

# 2. 检查进程
ps aux | grep "python main.py"
# 应该看到Python进程在运行

# 3. 检查端口监听
netstat -tlnp | grep 8188
# 应该显示：tcp 0 0 0.0.0.0:8188 0.0.0.0:* LISTEN

# 4. 测试HTTP接口
curl http://localhost:8188/system_stats

# 5. 测试外部访问
curl http://testapi.maxmuse.ai:8188/system_stats
```

---

## 🔧 服务管理命令

### 基本控制命令

```bash
# 启动服务
sudo systemctl start comfyui

# 停止服务
sudo systemctl stop comfyui

# 重启服务
sudo systemctl restart comfyui

# 重新加载配置
sudo systemctl reload comfyui

# 查看服务状态
sudo systemctl status comfyui

# 查看详细状态
sudo systemctl status comfyui -l
```

### 自启动管理

```bash
# 启用开机自启动
sudo systemctl enable comfyui

# 禁用开机自启动
sudo systemctl disable comfyui

# 检查是否已启用自启动
sudo systemctl is-enabled comfyui
```

### 日志管理

```bash
# 查看实时日志
sudo journalctl -u comfyui -f

# 查看最近的日志
sudo journalctl -u comfyui -n 50

# 查看指定时间范围的日志
sudo journalctl -u comfyui --since "1 hour ago"
sudo journalctl -u comfyui --since "2024-01-01" --until "2024-01-02"

# 查看今天的日志
sudo journalctl -u comfyui --since today
```

---

## 🧪 测试验证清单

### ✅ 功能测试

- [x] 手动启动脚本测试
- [x] systemd服务启动测试
- [x] HTTP接口访问测试
- [x] 外部网络访问测试
- [x] SSH断开连接测试
- [x] 服务器重启后自启动测试

### ✅ 性能验证

```bash
# 检查CPU使用率
top -p $(pgrep -f "python main.py")

# 检查内存使用
ps aux --sort=-%mem | head -10

# 检查系统负载
uptime

# 检查磁盘使用
df -h
```

---

## 🚨 故障排除

### 常见问题和解决方案

#### 1. 服务启动失败

```bash
# 查看详细错误信息
sudo systemctl status comfyui -l
sudo journalctl -u comfyui -n 20

# 检查脚本权限
ls -la /home/wwwroot/comfyui/comfyui/start_comfyui.sh

# 手动测试脚本
/home/wwwroot/comfyui/comfyui/start_comfyui.sh
```

#### 2. 端口被占用

```bash
# 查找占用端口的进程
sudo lsof -i:8188
sudo netstat -tlnp | grep 8188

# 终止占用进程
sudo kill -9 <PID>
```

#### 3. 虚拟环境问题

```bash
# 检查虚拟环境
cd /home/wwwroot/comfyui/comfyui
source venv/bin/activate
python --version
pip list | grep torch
```

#### 4. 权限问题

```bash
# 修复权限
sudo chown -R root:root /home/wwwroot/comfyui/comfyui/
sudo chmod +x /home/wwwroot/comfyui/comfyui/start_comfyui.sh
```

### 日志分析

```bash
# 查看启动过程日志
sudo journalctl -u comfyui --since "10 minutes ago"

# 过滤错误日志
sudo journalctl -u comfyui -p err

# 查看服务重启记录
sudo journalctl -u comfyui | grep "Started\|Stopped"
```

---

## 📊 性能优化建议

### CPU优化设置

当前脚本中已包含的优化：
```bash
export OMP_NUM_THREADS=4
export MKL_NUM_THREADS=4
export TORCH_NUM_THREADS=4
```

### 系统级优化

```bash
# CPU调度器优化
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# 内存优化
echo 1 | sudo tee /proc/sys/vm/swappiness

# 增加文件描述符限制
echo "* soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65535" | sudo tee -a /etc/security/limits.conf
```

---

## 🔄 维护计划

### 日常维护

```bash
# 每日检查服务状态
sudo systemctl status comfyui

# 每周检查日志
sudo journalctl -u comfyui --since "1 week ago" | tail -100

# 每月清理旧日志
sudo journalctl --vacuum-time=30d
```

### 定期更新

```bash
# 更新ComfyUI
cd /home/wwwroot/comfyui/comfyui
git pull origin main

# 重启服务应用更新
sudo systemctl restart comfyui
```

### 备份建议

```bash
# 备份配置文件
sudo cp /etc/systemd/system/comfyui.service /root/backup/
sudo cp /home/wwwroot/comfyui/comfyui/start_comfyui.sh /root/backup/

# 备份整个ComfyUI目录
tar -czf /root/backup/comfyui_backup_$(date +%Y%m%d).tar.gz /home/wwwroot/comfyui/comfyui/
```

---

## 📝 配置文件备份

### 启动脚本内容
```bash
#!/bin/bash

# 进入ComfyUI目录
cd /home/wwwroot/comfyui/comfyui

# 激活Python虚拟环境
source venv/bin/activate

# 设置CPU优化参数
export OMP_NUM_THREADS=4
export MKL_NUM_THREADS=4
export TORCH_NUM_THREADS=4

# 启动ComfyUI服务
python main.py --cpu --listen 0.0.0.0 --port 8188 --preview-method auto --enable-cors-header
```

### systemd服务配置
```ini
[Unit]
Description=ComfyUI Backend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/wwwroot/comfyui/comfyui
ExecStart=/home/wwwroot/comfyui/comfyui/start_comfyui.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

---

## 🌐 访问信息

- **本地访问**: `http://localhost:8188`
- **外部访问**: `http://testapi.maxmuse.ai:8188`
- **API接口**: `http://testapi.maxmuse.ai:8188/system_stats`
- **Web界面**: `http://testapi.maxmuse.ai:8188`

---

## 📞 联系信息

**配置完成时间**: 2025年1月  
**配置状态**: ✅ 成功运行  
**测试状态**: ✅ 已通过所有测试  
**维护责任人**: 系统管理员

---

**注意**: 此配置已经过完整测试，包括SSH断开连接和服务器重启测试，确保服务能够持续稳定运行。 