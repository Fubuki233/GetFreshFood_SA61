from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class Product(Base):
    __tablename__ = "products"
    
    product_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    product_type = Column(String(100), nullable=True)
    sales_price = Column(DECIMAL(10, 2), nullable=True, default=0.00)
    sales_tax_rate = Column(String(50), nullable=True)
    sales_price_incl_tax = Column(DECIMAL(10, 2), nullable=True, default=0.00)
    cost = Column(DECIMAL(10, 2), nullable=True, default=0.00)
    purchase_tax_rate = Column(String(50), nullable=True)
    category = Column(String(100), nullable=True)
    reference = Column(String(100), nullable=True)
    barcode = Column(String(100), nullable=True)
    internal_notes = Column(Text, nullable=True)
    description = Column(Text, nullable=True)  # 新增字段
    invoicing_policy = Column(String(100), nullable=True)
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    
    def __repr__(self):
        return f"<Product(id={self.product_id}, name='{self.name}', price={self.sales_price})>"
