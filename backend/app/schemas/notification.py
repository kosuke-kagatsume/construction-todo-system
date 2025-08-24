from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.notification import NotificationTypeEnum, NotificationPriorityEnum


# 基本スキーマ
class NotificationBase(BaseModel):
    type: NotificationTypeEnum
    priority: NotificationPriorityEnum = NotificationPriorityEnum.MEDIUM
    title: str = Field(..., max_length=255)
    message: str
    action_url: Optional[str] = Field(None, max_length=500)
    action_label: Optional[str] = Field(None, max_length=100)
    metadata: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None


# 通知作成用スキーマ
class NotificationCreate(NotificationBase):
    recipient_id: UUID
    sender_id: Optional[UUID] = None
    related_project_id: Optional[UUID] = None
    related_task_id: Optional[UUID] = None
    related_stage_id: Optional[UUID] = None
    delivery_methods: Optional[List[str]] = None


# 一括通知作成用スキーマ
class NotificationCreateBulk(NotificationBase):
    recipient_ids: List[UUID]
    sender_id: Optional[UUID] = None
    related_project_id: Optional[UUID] = None
    related_task_id: Optional[UUID] = None
    related_stage_id: Optional[UUID] = None
    delivery_methods: Optional[List[str]] = None


# 通知更新用スキーマ
class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_delivered: Optional[bool] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None


# 通知レスポンス用スキーマ
class NotificationResponse(NotificationBase):
    id: UUID
    recipient_id: UUID
    tenant_id: UUID
    sender_id: Optional[UUID] = None
    is_read: bool
    is_delivered: bool
    related_project_id: Optional[UUID] = None
    related_task_id: Optional[UUID] = None
    related_stage_id: Optional[UUID] = None
    delivery_methods: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    read_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    
    # リレーション情報
    sender_name: Optional[str] = None
    project_name: Optional[str] = None
    
    class Config:
        from_attributes = True


# 通知一覧レスポンス
class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
    has_more: bool


# 通知設定用スキーマ
class NotificationPreferencesBase(BaseModel):
    enable_desktop_notifications: bool = True
    enable_email_notifications: bool = False
    enable_sound_notifications: bool = True
    enable_push_notifications: bool = False
    type_preferences: Optional[Dict[str, Dict[str, Any]]] = None
    quiet_hours_enabled: bool = False
    quiet_hours_start: str = Field("22:00", regex=r"^\d{2}:\d{2}$")
    quiet_hours_end: str = Field("08:00", regex=r"^\d{2}:\d{2}$")
    allow_urgent_in_quiet_hours: bool = True
    grouping_enabled: bool = True
    grouping_time_window: int = Field(5, ge=1, le=60)


class NotificationPreferencesCreate(NotificationPreferencesBase):
    pass


class NotificationPreferencesUpdate(BaseModel):
    enable_desktop_notifications: Optional[bool] = None
    enable_email_notifications: Optional[bool] = None
    enable_sound_notifications: Optional[bool] = None
    enable_push_notifications: Optional[bool] = None
    type_preferences: Optional[Dict[str, Dict[str, Any]]] = None
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = Field(None, regex=r"^\d{2}:\d{2}$")
    quiet_hours_end: Optional[str] = Field(None, regex=r"^\d{2}:\d{2}$")
    allow_urgent_in_quiet_hours: Optional[bool] = None
    grouping_enabled: Optional[bool] = None
    grouping_time_window: Optional[int] = Field(None, ge=1, le=60)


class NotificationPreferencesResponse(NotificationPreferencesBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# WebSocket用スキーマ
class NotificationWebSocketMessage(BaseModel):
    type: str = "notification"
    data: NotificationResponse


# 通知統計用スキーマ
class NotificationStats(BaseModel):
    total: int
    unread: int
    by_type: Dict[str, int]
    by_priority: Dict[str, int]
    recent_count: int  # 直近24時間


# 通知テンプレート用スキーマ
class NotificationTemplateBase(BaseModel):
    name: str = Field(..., max_length=100)
    type: NotificationTypeEnum
    language: str = Field("ja", max_length=10)
    title_template: str = Field(..., max_length=255)
    message_template: str
    email_subject_template: Optional[str] = Field(None, max_length=255)
    email_body_template: Optional[str] = None
    default_priority: NotificationPriorityEnum = NotificationPriorityEnum.MEDIUM
    is_active: bool = True


class NotificationTemplateCreate(NotificationTemplateBase):
    pass


class NotificationTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    language: Optional[str] = Field(None, max_length=10)
    title_template: Optional[str] = Field(None, max_length=255)
    message_template: Optional[str] = None
    email_subject_template: Optional[str] = Field(None, max_length=255)
    email_body_template: Optional[str] = None
    default_priority: Optional[NotificationPriorityEnum] = None
    is_active: Optional[bool] = None


class NotificationTemplateResponse(NotificationTemplateBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# 建築業界特化の通知ヘルパースキーマ
class TaskAssignedNotification(BaseModel):
    task_name: str
    project_name: str
    assigned_by: str
    recipient_id: UUID
    project_id: UUID
    task_id: Optional[UUID] = None


class TaskDeadlineNotification(BaseModel):
    task_name: str
    project_name: str
    hours_remaining: int
    recipient_id: UUID
    project_id: UUID
    task_id: Optional[UUID] = None


class StageCompletedNotification(BaseModel):
    stage_name: str
    project_name: str
    completed_by: str
    recipient_ids: List[UUID]
    project_id: UUID
    stage_id: Optional[UUID] = None


class StageDelayedNotification(BaseModel):
    stage_name: str
    project_name: str
    delay_days: int
    reason: Optional[str] = None
    recipient_ids: List[UUID]
    project_id: UUID
    stage_id: Optional[UUID] = None


class HandoffRequestNotification(BaseModel):
    from_role: str
    to_role: str
    project_name: str
    task_count: int
    recipient_ids: List[UUID]
    project_id: UUID


class BottleneckAlertNotification(BaseModel):
    role: str
    task_name: str
    impact_count: int
    severity: str  # "medium", "high", "critical"
    recipient_ids: List[UUID]