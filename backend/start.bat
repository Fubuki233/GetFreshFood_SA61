@echo off
chcp 65001 >nul
echo =============================================================
echo 🚀 产品管理系统 FastAPI 后端启动脚本
echo =============================================================

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python未安装或未添加到PATH
    echo 请先安装Python 3.8+
    pause
    exit /b 1
)

echo ✅ Python已安装

REM 检查是否在正确目录
if not exist "requirements.txt" (
    echo ❌ 找不到requirements.txt文件
    echo 请确保在backend目录中运行此脚本
    pause
    exit /b 1
)

echo ✅ 工作目录正确

REM 安装依赖
echo.
echo 📦 检查并安装依赖包...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成

REM 运行启动脚本
echo.
echo 🚀 启动服务器...
python start.py

pause
