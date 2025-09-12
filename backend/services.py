from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models import Product
from schemas import ProductCreate, ProductUpdate, ProductSearchParams
from typing import List, Optional
from decimal import Decimal

class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_products(self, skip: int = 0, limit: int = 100) -> List[Product]:
        """获取所有产品"""
        return self.db.query(Product).offset(skip).limit(limit).all()

    def get_product_by_id(self, product_id: int) -> Optional[Product]:
        """根据ID获取产品"""
        return self.db.query(Product).filter(Product.product_id == product_id).first()

    def search_products(self, params: ProductSearchParams) -> tuple[List[Product], int]:
        """搜索产品"""
        query = self.db.query(Product)
        
        # 构建搜索条件
        conditions = []
        
        if params.name:
            conditions.append(Product.name.contains(params.name))
        
        if params.category:
            conditions.append(Product.category.contains(params.category))
            
        if params.product_type:
            conditions.append(Product.product_type == params.product_type)
            
        if params.min_price is not None:
            conditions.append(Product.sales_price >= params.min_price)
            
        if params.max_price is not None:
            conditions.append(Product.sales_price <= params.max_price)
        
        if conditions:
            query = query.filter(and_(*conditions))
        
        # 获取总数
        total = query.count()
        
        # 应用分页
        products = query.offset(params.offset).limit(params.limit).all()
        
        return products, total

    def create_product(self, product_data: ProductCreate) -> Product:
        """创建新产品"""
        # 计算含税价格
        product_dict = product_data.model_dump()
        if product_dict.get('sales_price') and not product_dict.get('sales_price_incl_tax'):
            tax_rate = self._parse_tax_rate(product_dict.get('sales_tax_rate', '0%'))
            sales_price = Decimal(str(product_dict['sales_price']))
            tax_multiplier = Decimal(str(1 + tax_rate / 100))
            product_dict['sales_price_incl_tax'] = sales_price * tax_multiplier
        
        db_product = Product(**product_dict)
        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        return db_product

    def update_product(self, product_id: int, product_data: ProductUpdate) -> Optional[Product]:
        """更新产品"""
        db_product = self.get_product_by_id(product_id)
        if not db_product:
            return None
        
        update_dict = product_data.model_dump(exclude_unset=True)
        
        # 重新计算含税价格
        if 'sales_price' in update_dict or 'sales_tax_rate' in update_dict:
            sales_price = update_dict.get('sales_price', db_product.sales_price)
            tax_rate_str = update_dict.get('sales_tax_rate', db_product.sales_tax_rate)
            
            if sales_price:
                tax_rate = self._parse_tax_rate(tax_rate_str or '0%')
                sales_price = Decimal(str(sales_price))
                tax_multiplier = Decimal(str(1 + tax_rate / 100))
                update_dict['sales_price_incl_tax'] = sales_price * tax_multiplier
        
        for field, value in update_dict.items():
            setattr(db_product, field, value)
        
        self.db.commit()
        self.db.refresh(db_product)
        return db_product

    def delete_product(self, product_id: int) -> bool:
        """删除产品"""
        db_product = self.get_product_by_id(product_id)
        if not db_product:
            return False
        
        self.db.delete(db_product)
        self.db.commit()
        return True

    def get_categories(self) -> List[str]:
        """获取所有分类"""
        categories = self.db.query(Product.category).distinct().filter(Product.category.isnot(None)).all()
        return [cat[0] for cat in categories if cat[0]]

    def get_product_types(self) -> List[str]:
        """获取所有产品类型"""
        types = self.db.query(Product.product_type).distinct().filter(Product.product_type.isnot(None)).all()
        return [ptype[0] for ptype in types if ptype[0]]

    def _parse_tax_rate(self, tax_rate_str: str) -> float:
        """解析税率字符串，返回数字"""
        if not tax_rate_str:
            return 0.0
        
        # 提取数字部分
        import re
        numbers = re.findall(r'\d+\.?\d*', tax_rate_str)
        if numbers:
            return float(numbers[0])
        return 0.0

    def bulk_import_csv(self, csv_file_path: str) -> dict:
        """批量导入CSV数据"""
        import pandas as pd
        try:
            df = pd.read_csv(csv_file_path)
            
            # 数据清洗和转换
            success_count = 0
            error_count = 0
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # 构建产品数据
                    product_data = {
                        'name': row.get('name', ''),
                        'product_type': row.get('product_type'),
                        'sales_price': self._safe_decimal(row.get('sales_price')),
                        'sales_tax_rate': row.get('sales_tax_rate'),
                        'sales_price_incl_tax': self._safe_decimal(row.get('sales_price_incl_tax')),
                        'cost': self._safe_decimal(row.get('cost')),
                        'purchase_tax_rate': row.get('purchase_tax_rate'),
                        'category': row.get('category'),
                        'reference': row.get('reference'),
                        'barcode': row.get('barcode'),
                        'internal_notes': row.get('internal_notes'),
                        'description': row.get('description', ''),
                        'invoicing_policy': row.get('invoicing_policy'),
                        'created_by': row.get('created_by'),
                    }
                    
                    # 过滤None值
                    product_data = {k: v for k, v in product_data.items() if v is not None and v != ''}
                    
                    if product_data.get('name'):  # 确保有产品名称
                        product_create = ProductCreate(**product_data)
                        self.create_product(product_create)
                        success_count += 1
                    else:
                        error_count += 1
                        errors.append(f"第{index + 1}行: 产品名称为空")
                        
                except Exception as e:
                    error_count += 1
                    errors.append(f"第{index + 1}行: {str(e)}")
            
            return {
                'success_count': success_count,
                'error_count': error_count,
                'errors': errors
            }
            
        except Exception as e:
            return {
                'success_count': 0,
                'error_count': 0,
                'errors': [f"文件读取失败: {str(e)}"]
            }

    def _safe_decimal(self, value) -> Optional[Decimal]:
        """安全转换为Decimal"""
        if value is None or value == '':
            return None
        try:
            return Decimal(str(value))
        except:
            return None
