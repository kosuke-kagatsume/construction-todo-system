from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict
from uuid import UUID


class ProjectBase(BaseModel):
    name: str
    code: str
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    address: Optional[str] = None
    estimated_start_date: Optional[date] = None
    estimated_end_date: Optional[date] = None
    actual_start_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    status: str = "PLANNING"
    notes: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    address: Optional[str] = None
    estimated_start_date: Optional[date] = None
    estimated_end_date: Optional[date] = None
    actual_start_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ProjectInDBBase(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    tenant_id: UUID
    created_by_id: UUID
    created_at: datetime
    updated_at: datetime


class Project(ProjectInDBBase):
    pass