#!/usr/bin/env python3
"""
启动脚本 - 检查环境并启动API服务器
"""

import sys
import os
import subprocess

def check_dependencies():
    """检查依赖包是否安装"""
    required_packages = [
        'fastapi', 'uvicorn', 'sqlalchemy', 'pymysql', 
        'python-dotenv', 'pydantic', 'pandas'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ 缺少以下依赖包:")
        for package in missing_packages:
            print(f"   - {package}")
        
        print("\n请运行以下命令安装依赖:")
        print("pip install -r requirements.txt")
    
    print("✅ 所有依赖包已安装")
    return True

def check_environment():
    """检查环境变量"""
    env_file = ".env"
    if not os.path.exists(env_file):
        print("❌ 找不到 .env 文件")
        print("请创建 .env 文件并配置数据库连接信息")
        return False
    
    print("✅ 环境配置文件存在")
    return True

def run_database_check():
    """运行数据库检查"""
    try:
        print("🔍 运行数据库检查...")
        result = subprocess.run([sys.executable, "check_db.py"], 
                              capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("错误输出:", result.stderr)
        
        return result.returncode == 0
    except Exception as e:
        print(f"❌ 数据库检查失败: {e}")
        return False

def start_server():
    """启动API服务器"""
    print("🚀 启动FastAPI服务器...")
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ])
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 启动服务器失败: {e}")

def main():
    print("=" * 60)
    print("🚀 产品管理系统 FastAPI 后端")
    print("=" * 60)
    
    # 检查依赖
    if not check_dependencies():
        sys.exit(1)
    
    # 检查环境
    if not check_environment():
        sys.exit(1)
    
    # 检查数据库
    if not run_database_check():
        print("❌ 数据库检查失败")
        response = input("是否强制启动服务器? (y/N): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # 启动服务器
    print("\n🎉 准备就绪，启动服务器...")
    print("API文档地址: http://localhost:8000/docs")
    print("按 Ctrl+C 停止服务器\n")
    
    start_server()

if __name__ == "__main__":
    main()
