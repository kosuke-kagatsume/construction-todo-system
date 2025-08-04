from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: bool = True
    is_superuser: bool = False
    role_code: Optional[str] = None


class UserCreate(UserBase):
    password: str
    tenant_id: UUID


class UserUpdate(UserBase):
    password: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    role_code: Optional[str] = None


class UserInDBBase(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str