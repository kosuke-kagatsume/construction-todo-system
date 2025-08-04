#!/usr/bin/env python
"""
データベース初期化スクリプト
- データベースの作成
- マイグレーションの実行
- 初期データの投入
"""

import asyncio
import logging
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.db.initial_data import PHASES, STAGES, ROLES, TASK_TEMPLATES
from app.models import Phase, Stage, Role, TaskTemplate, Tenant, User
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_database():
    """データベースが存在しない場合は作成"""
    # データベース名を除いた接続URLを作成
    db_url_parts = settings.DATABASE_URL.split('/')
    db_name = db_url_parts[-1]
    base_url = '/'.join(db_url_parts[:-1]) + '/postgres'
    
    engine = create_async_engine(base_url, isolation_level="AUTOCOMMIT")
    
    async with engine.connect() as conn:
        # データベースの存在確認
        result = await conn.execute(
            text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        )
        exists = result.scalar()
        
        if not exists:
            logger.info(f"Creating database: {db_name}")
            await conn.execute(text(f"CREATE DATABASE {db_name}"))
            logger.info("Database created successfully")
        else:
            logger.info(f"Database {db_name} already exists")
    
    await engine.dispose()


async def init_master_data():
    """マスターデータの初期投入"""
    async with AsyncSessionLocal() as session:
        try:
            # フェーズデータの投入
            logger.info("Inserting phases...")
            for phase_data in PHASES:
                phase = Phase(**phase_data)
                session.add(phase)
            
            await session.commit()
            logger.info(f"Inserted {len(PHASES)} phases")
            
            # ステージデータの投入
            logger.info("Inserting stages...")
            for stage_data in STAGES:
                stage = Stage(**stage_data)
                session.add(stage)
            
            await session.commit()
            logger.info(f"Inserted {len(STAGES)} stages")
            
            # ロールデータの投入
            logger.info("Inserting roles...")
            for role_data in ROLES:
                role = Role(**role_data)
                session.add(role)
            
            await session.commit()
            logger.info(f"Inserted {len(ROLES)} roles")
            
            # タスクテンプレートの投入
            logger.info("Inserting task templates...")
            for template_data in TASK_TEMPLATES:
                checklist_items = template_data.pop('checklist_items', [])
                template = TaskTemplate(**template_data)
                template.checklist_items = checklist_items
                session.add(template)
            
            await session.commit()
            logger.info(f"Inserted {len(TASK_TEMPLATES)} task templates")
            
        except Exception as e:
            logger.error(f"Error inserting master data: {e}")
            await session.rollback()
            raise


async def create_demo_tenant():
    """デモ用テナントとユーザーの作成"""
    async with AsyncSessionLocal() as session:
        try:
            # デモテナントの作成
            tenant = Tenant(
                name="デモ建設株式会社",
                code="DEMO001",
                contact_email="demo@construction-todo.com",
                is_active=True
            )
            session.add(tenant)
            await session.flush()
            
            logger.info(f"Created demo tenant: {tenant.name}")
            
            # 管理者ユーザーの作成
            admin_user = User(
                tenant_id=tenant.id,
                email="admin@demo.com",
                full_name="システム管理者",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                is_superuser=True,
                role_code="SALES"
            )
            session.add(admin_user)
            
            # 各ロールのデモユーザーを作成
            demo_users = [
                {"email": "sales@demo.com", "full_name": "営業太郎", "role": "SALES", "password": "sales123"},
                {"email": "design@demo.com", "full_name": "設計花子", "role": "DESIGN", "password": "design123"},
                {"email": "ic@demo.com", "full_name": "IC次郎", "role": "IC", "password": "ic123"},
                {"email": "construction@demo.com", "full_name": "工務三郎", "role": "CONSTRUCTION", "password": "const123"},
            ]
            
            for user_data in demo_users:
                user = User(
                    tenant_id=tenant.id,
                    email=user_data["email"],
                    full_name=user_data["full_name"],
                    hashed_password=get_password_hash(user_data["password"]),
                    is_active=True,
                    is_superuser=False,
                    role_code=user_data["role"]
                )
                session.add(user)
            
            await session.commit()
            logger.info("Created demo users successfully")
            
        except Exception as e:
            logger.error(f"Error creating demo tenant: {e}")
            await session.rollback()
            raise


async def main():
    """メイン処理"""
    logger.info("Starting database initialization...")
    
    # データベースの作成
    await create_database()
    
    # Alembicマイグレーションの実行はCLIから実行
    logger.info("Please run 'alembic upgrade head' to apply migrations")
    
    # マスターデータの投入
    await init_master_data()
    
    # デモテナントの作成
    await create_demo_tenant()
    
    logger.info("Database initialization completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())