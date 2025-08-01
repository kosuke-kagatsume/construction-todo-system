from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal

router = APIRouter()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/")
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    # TODO: Implement user list logic
    return []


@router.get("/{user_id}")
async def read_user(user_id: str, db: AsyncSession = Depends(get_db)):
    # TODO: Implement user retrieval logic
    return {"id": user_id, "email": "user@example.com"}


@router.post("/")
async def create_user(db: AsyncSession = Depends(get_db)):
    # TODO: Implement user creation logic
    return {"id": "new-user-id", "email": "new@example.com"}


@router.put("/{user_id}")
async def update_user(user_id: str, db: AsyncSession = Depends(get_db)):
    # TODO: Implement user update logic
    return {"id": user_id, "email": "updated@example.com"}