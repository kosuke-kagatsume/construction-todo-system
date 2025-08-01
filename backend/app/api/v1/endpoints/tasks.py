from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal

router = APIRouter()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/")
async def read_tasks(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    # TODO: Implement task list logic
    return []


@router.get("/{task_id}")
async def read_task(task_id: str, db: AsyncSession = Depends(get_db)):
    # TODO: Implement task retrieval logic
    return {"id": task_id, "name": "Sample Task"}


@router.patch("/{task_id}")
async def update_task(task_id: str, db: AsyncSession = Depends(get_db)):
    # TODO: Implement task update logic (progress, dates, assignee)
    return {"id": task_id, "name": "Updated Task"}


@router.post("/")
async def create_task(db: AsyncSession = Depends(get_db)):
    # TODO: Implement task creation logic
    return {"id": "new-task-id", "name": "New Task"}