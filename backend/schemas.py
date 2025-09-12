from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="产品名称")
    product_type: Optional[str] = Field(None, max_length=100, description="产品类型")
    sales_price: Optional[Decimal] = Field(None, ge=0, description="销售价格")
    sales_tax_rate: Optional[str] = Field(None, max_length=50, description="销售税率")
    sales_price_incl_tax: Optional[Decimal] = Field(None, ge=0, description="含税销售价格")
    cost: Optional[Decimal] = Field(None, ge=0, description="成本")
    purchase_tax_rate: Optional[str] = Field(None, max_length=50, description="采购税率")
    category: Optional[str] = Field(None, max_length=100, description="产品分类")
    reference: Optional[str] = Field(None, max_length=100, description="产品编号")
    barcode: Optional[str] = Field(None, max_length=100, description="条形码")
    internal_notes: Optional[str] = Field(None, description="内部备注")
    description: Optional[str] = Field(None, description="产品描述")
    invoicing_policy: Optional[str] = Field(None, max_length=100, description="开票政策")
    created_by: Optional[str] = Field(None, max_length=100, description="创建者")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="产品名称")
    product_type: Optional[str] = Field(None, max_length=100, description="产品类型")
    sales_price: Optional[Decimal] = Field(None, ge=0, description="销售价格")
    sales_tax_rate: Optional[str] = Field(None, max_length=50, description="销售税率")
    sales_price_incl_tax: Optional[Decimal] = Field(None, ge=0, description="含税销售价格")
    cost: Optional[Decimal] = Field(None, ge=0, description="成本")
    purchase_tax_rate: Optional[str] = Field(None, max_length=50, description="采购税率")
    category: Optional[str] = Field(None, max_length=100, description="产品分类")
    reference: Optional[str] = Field(None, max_length=100, description="产品编号")
    barcode: Optional[str] = Field(None, max_length=100, description="条形码")
    internal_notes: Optional[str] = Field(None, description="内部备注")
    description: Optional[str] = Field(None, description="产品描述")
    invoicing_policy: Optional[str] = Field(None, max_length=100, description="开票政策")
    created_by: Optional[str] = Field(None, max_length=100, description="创建者")

class ProductResponse(ProductBase):
    product_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductSearchParams(BaseModel):
    name: Optional[str] = Field(None, description="按名称搜索")
    category: Optional[str] = Field(None, description="按分类搜索")
    product_type: Optional[str] = Field(None, description="按产品类型搜索")
    min_price: Optional[Decimal] = Field(None, ge=0, description="最低价格")
    max_price: Optional[Decimal] = Field(None, ge=0, description="最高价格")
    limit: int = Field(100, ge=1, le=1000, description="返回数量限制")
    offset: int = Field(0, ge=0, description="偏移量")

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class ProductListResponse(BaseModel):
    success: bool
    message: str
    data: list[ProductResponse]
    total: int
