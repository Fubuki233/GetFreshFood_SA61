from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker  # 修改这行
from dotenv import load_dotenv
import os

# 加载环境变量
load_dotenv()

# 数据库配置
DB_HOST = os.getenv("DB_HOST", "192.168.100.121")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1")
DB_NAME = os.getenv("DB_NAME", "NUS")

# 创建数据库连接URL
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# 创建SQLAlchemy引擎
engine = create_engine(
    DATABASE_URL,
    echo=True,  # 设为True可以看到SQL语句
    pool_pre_ping=True,  # 连接池预检查
    pool_recycle=300,  # 连接回收时间
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()

# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 测试数据库连接
def test_connection():
    try:
        with engine.connect() as connection:
            print("✅ 数据库连接成功！")
            return True
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False

# 如果直接运行此文件，测试连接
if __name__ == "__main__":
    test_connection()