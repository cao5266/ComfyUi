#!/bin/bash

# ComfyUI服务状态检查脚本
# 使用方法: bash check_comfyui_status.sh

echo "======================================"
echo "   ComfyUI 后端服务状态检查"
echo "======================================"
echo "检查时间: $(date)"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查systemd服务状态
echo "🔍 1. SystemD服务状态检查"
echo "--------------------------------------"
if systemctl is-active --quiet comfyui; then
    echo -e "${GREEN}✅ ComfyUI服务正在运行${NC}"
    echo "服务状态: $(systemctl is-active comfyui)"
    echo "启动时间: $(systemctl show comfyui --property=ActiveEnterTimestamp --value)"
else
    echo -e "${RED}❌ ComfyUI服务未运行${NC}"
    echo "服务状态: $(systemctl is-active comfyui)"
fi
echo ""

# 2. 检查进程
echo "🔍 2. 进程状态检查"
echo "--------------------------------------"
PROCESS_COUNT=$(ps aux | grep -E "(python.*main\.py|comfyui)" | grep -v grep | wc -l)
if [ $PROCESS_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ 发现 $PROCESS_COUNT 个ComfyUI进程${NC}"
    ps aux | grep -E "(python.*main\.py)" | grep -v grep | while read line; do
        echo "进程: $line"
    done
else
    echo -e "${RED}❌ 未发现ComfyUI进程${NC}"
fi
echo ""

# 3. 检查端口监听
echo "🔍 3. 端口监听检查"
echo "--------------------------------------"
if netstat -tlnp 2>/dev/null | grep -q ":8188 "; then
    echo -e "${GREEN}✅ 端口8188正在监听${NC}"
    netstat -tlnp | grep ":8188 " | while read line; do
        echo "监听: $line"
    done
else
    echo -e "${RED}❌ 端口8188未监听${NC}"
fi
echo ""

# 4. 检查API响应
echo "🔍 4. API响应检查"
echo "--------------------------------------"
if curl -s --max-time 5 http://localhost:8188 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ API响应正常${NC}"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8188)
    echo "HTTP状态码: $HTTP_STATUS"
else
    echo -e "${RED}❌ API无响应${NC}"
fi

# 尝试获取系统状态
if curl -s --max-time 5 http://localhost:8188/system_stats >/dev/null 2>&1; then
    echo -e "${GREEN}✅ 系统状态API可用${NC}"
else
    echo -e "${YELLOW}⚠️  系统状态API不可用${NC}"
fi
echo ""

# 5. 资源使用情况
echo "🔍 5. 资源使用情况"
echo "--------------------------------------"
# 内存使用
TOTAL_MEM=$(free -h | awk '/^Mem:/ {print $2}')
USED_MEM=$(free -h | awk '/^Mem:/ {print $3}')
echo "内存使用: $USED_MEM / $TOTAL_MEM"

# CPU负载
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | xargs)
echo "系统负载: $LOAD_AVG"

# 磁盘使用
DISK_USAGE=$(df -h /home/wwwroot/comfyui 2>/dev/null | awk 'NR==2 {print $5}' || echo "N/A")
echo "ComfyUI目录磁盘使用: $DISK_USAGE"
echo ""

# 6. GPU状态检查（如果有GPU）
echo "🔍 6. GPU状态检查"
echo "--------------------------------------"
if command -v nvidia-smi &> /dev/null; then
    echo -e "${GREEN}✅ 检测到NVIDIA GPU${NC}"
    nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv,noheader,nounits | while read line; do
        echo "GPU: $line"
    done
elif command -v rocm-smi &> /dev/null; then
    echo -e "${GREEN}✅ 检测到AMD GPU${NC}"
    rocm-smi --showmemuse --csv | tail -n +2
else
    echo -e "${YELLOW}⚠️  未检测到GPU（CPU模式）${NC}"
fi
echo ""

# 7. 最近的错误日志
echo "🔍 7. 最近的日志检查"
echo "--------------------------------------"
if systemctl is-active --quiet comfyui; then
    echo "最近10分钟的日志："
    sudo journalctl -u comfyui --since "10 minutes ago" --no-pager | tail -5
    
    echo ""
    echo "检查是否有错误："
    ERROR_COUNT=$(sudo journalctl -u comfyui --since "1 hour ago" -p err | wc -l)
    if [ $ERROR_COUNT -gt 0 ]; then
        echo -e "${RED}⚠️  发现 $ERROR_COUNT 个错误日志${NC}"
        sudo journalctl -u comfyui --since "1 hour ago" -p err --no-pager | tail -3
    else
        echo -e "${GREEN}✅ 近1小时内无错误日志${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  服务未运行，无法获取日志${NC}"
fi
echo ""

# 8. 总结
echo "🎯 状态总结"
echo "--------------------------------------"
SERVICE_OK=$(systemctl is-active --quiet comfyui && echo "true" || echo "false")
PROCESS_OK=$([ $PROCESS_COUNT -gt 0 ] && echo "true" || echo "false")
PORT_OK=$(netstat -tlnp 2>/dev/null | grep -q ":8188 " && echo "true" || echo "false")
API_OK=$(curl -s --max-time 5 http://localhost:8188 >/dev/null 2>&1 && echo "true" || echo "false")

if [ "$SERVICE_OK" = "true" ] && [ "$PROCESS_OK" = "true" ] && [ "$PORT_OK" = "true" ] && [ "$API_OK" = "true" ]; then
    echo -e "${GREEN}🎉 ComfyUI后端服务运行正常！${NC}"
    echo ""
    echo "访问地址："
    echo "- 本地: http://localhost:8188"
    echo "- 外网: http://$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_IP"):8188"
elif [ "$SERVICE_OK" = "false" ]; then
    echo -e "${RED}❌ 服务状态异常，建议执行：${NC}"
    echo "sudo systemctl restart comfyui"
elif [ "$API_OK" = "false" ]; then
    echo -e "${YELLOW}⚠️  服务运行但API无响应，建议检查日志：${NC}"
    echo "sudo journalctl -u comfyui -f"
else
    echo -e "${YELLOW}⚠️  部分检查失败，请查看上述详细信息${NC}"
fi

echo ""
echo "======================================" 