from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import tempfile
import os

from database import get_db, test_connection, engine, Base
from models import Product
from schemas import (
    ProductResponse, ProductCreate, ProductUpdate, ProductSearchParams,
    APIResponse, ProductListResponse
)
from services import ProductService

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 创建FastAPI应用
app = FastAPI(
    title="产品管理系统API",
    description="基于FastAPI的产品管理系统，支持完整的CRUD操作",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """应用启动时测试数据库连接"""
    print("🚀 启动产品管理系统API...")
    test_connection()

@app.get("/", response_model=APIResponse)
async def root():
    """健康检查端点"""
    return APIResponse(
        success=True,
        message="产品管理系统API运行正常",
        data={"version": "1.0.0", "status": "healthy"}
    )

@app.get("/products", response_model=ProductListResponse)
async def get_products(
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回的记录数"),
    name: Optional[str] = Query(None, description="按名称搜索"),
    category: Optional[str] = Query(None, description="按分类搜索"),
    product_type: Optional[str] = Query(None, description="按产品类型搜索"),
    min_price: Optional[float] = Query(None, ge=0, description="最低价格"),
    max_price: Optional[float] = Query(None, ge=0, description="最高价格"),
    db: Session = Depends(get_db)
):
    """获取产品列表，支持搜索和分页"""
    try:
        service = ProductService(db)
        
        # 如果有搜索参数，使用搜索功能
        if any([name, category, product_type, min_price, max_price]):
            search_params = ProductSearchParams(
                name=name,
                category=category,
                product_type=product_type,
                min_price=min_price,
                max_price=max_price,
                limit=limit,
                offset=skip
            )
            products, total = service.search_products(search_params)
        else:
            products = service.get_all_products(skip=skip, limit=limit)
            total = len(products)
        
        return ProductListResponse(
            success=True,
            message=f"成功获取{len(products)}个产品",
            data=products,
            total=total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取产品列表失败: {str(e)}")

@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """根据ID获取单个产品"""
    try:
        service = ProductService(db)
        product = service.get_product_by_id(product_id)
        
        if not product:
            raise HTTPException(status_code=404, detail="产品不存在")
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取产品失败: {str(e)}")

@app.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """创建新产品"""
    try:
        service = ProductService(db)
        new_product = service.create_product(product)
        return new_product
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"创建产品失败: {str(e)}")

@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int, 
    product: ProductUpdate, 
    db: Session = Depends(get_db)
):
    """更新产品信息"""
    try:
        service = ProductService(db)
        updated_product = service.update_product(product_id, product)
        
        if not updated_product:
            raise HTTPException(status_code=404, detail="产品不存在")
        
        return updated_product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"更新产品失败: {str(e)}")

@app.delete("/products/{product_id}", response_model=APIResponse)
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """删除产品"""
    try:
        service = ProductService(db)
        success = service.delete_product(product_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="产品不存在")
        
        return APIResponse(
            success=True,
            message="产品删除成功",
            data={"deleted_id": product_id}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除产品失败: {str(e)}")

@app.get("/categories", response_model=List[str])
async def get_categories(db: Session = Depends(get_db)):
    """获取所有产品分类"""
    try:
        service = ProductService(db)
        categories = service.get_categories()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取分类失败: {str(e)}")

@app.get("/product-types", response_model=List[str])
async def get_product_types(db: Session = Depends(get_db)):
    """获取所有产品类型"""
    try:
        service = ProductService(db)
        types = service.get_product_types()
        return types
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取产品类型失败: {str(e)}")

@app.post("/import-csv", response_model=APIResponse)
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """导入CSV文件"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="只支持CSV文件")
    
    try:
        # 保存临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            service = ProductService(db)
            result = service.bulk_import_csv(tmp_file_path)
            
            return APIResponse(
                success=True,
                message=f"导入完成: 成功{result['success_count']}条, 失败{result['error_count']}条",
                data=result
            )
        finally:
            # 清理临时文件
            os.unlink(tmp_file_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")

@app.get("/health")
async def health_check():
    """详细的健康检查"""
    try:
        # 测试数据库连接
        db_status = test_connection()
        
        return {
            "status": "healthy" if db_status else "unhealthy",
            "database": "connected" if db_status else "disconnected",
            "api_version": "1.0.0"
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
