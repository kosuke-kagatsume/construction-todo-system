from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID


class TenantBase(BaseModel):
    name: str
    code: str
    contact_email: EmailStr
    is_active: bool = True


class TenantCreate(TenantBase):
    pass


class TenantUpdate(BaseModel):
    name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class TenantInDBBase(TenantBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime
    updated_at: datetime


class Tenant(TenantInDBBase):
    pass