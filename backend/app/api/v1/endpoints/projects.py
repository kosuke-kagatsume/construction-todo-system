from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal

router = APIRouter()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/")
async def read_projects(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    # TODO: Implement project list logic
    return []


@router.get("/{project_id}")
async def read_project(project_id: str, db: AsyncSession = Depends(get_db)):
    # TODO: Implement project retrieval logic
    return {"id": project_id, "name": "Sample Project"}


@router.post("/")
async def create_project(db: AsyncSession = Depends(get_db)):
    # TODO: Implement project creation logic
    return {"id": "new-project-id", "name": "New Project"}


@router.put("/{project_id}")
async def update_project(project_id: str, db: AsyncSession = Depends(get_db)):
    # TODO: Implement project update logic
    return {"id": project_id, "name": "Updated Project"}


@router.get("/{project_id}/tasks")
async def read_project_tasks(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    # TODO: Implement project tasks retrieval logic
    return []