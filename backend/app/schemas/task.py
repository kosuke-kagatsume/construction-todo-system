from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict
from uuid import UUID


class TaskBase(BaseModel):
    project_id: UUID
    stage_code: str
    title: str
    description: Optional[str] = None
    assignee_id: Optional[UUID] = None
    due_date: Optional[date] = None
    priority: str = "MEDIUM"
    status: str = "PENDING"
    checklist_items: Optional[List[Dict[str, Any]]] = []
    custom_fields: Optional[Dict[str, Any]] = {}


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[UUID] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    completed_at: Optional[datetime] = None
    checklist_items: Optional[List[Dict[str, Any]]] = None
    custom_fields: Optional[Dict[str, Any]] = None


class TaskInDBBase(TaskBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    tenant_id: UUID
    completed_at: Optional[datetime] = None
    created_by_id: UUID
    created_at: datetime
    updated_at: datetime


class Task(TaskInDBBase):
    pass