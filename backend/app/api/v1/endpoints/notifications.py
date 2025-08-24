from datetime import datetime
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.services.notification_service import NotificationService, ConstructionNotificationHelpers
from app.services.websocket_manager import notification_websocket_handler
from app.schemas.notification import (
    NotificationCreate,
    NotificationCreateBulk,
    NotificationResponse,
    NotificationListResponse,
    NotificationPreferencesCreate,
    NotificationPreferencesUpdate,
    NotificationPreferencesResponse,
    NotificationStats,
    TaskAssignedNotification,
    TaskDeadlineNotification,
    StageCompletedNotification,
    StageDelayedNotification,
    HandoffRequestNotification,
    BottleneckAlertNotification,
)

router = APIRouter()


# 通知一覧取得
@router.get("/", response_model=NotificationListResponse)
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    type_filter: Optional[str] = Query(None),
    priority_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """通知一覧を取得"""
    service = NotificationService(db)
    
    notifications, total = service.get_notifications(
        user_id=current_user.id,
        tenant_id=current_user.tenant_id,
        skip=skip,
        limit=limit,
        unread_only=unread_only,
        notification_type=type_filter,
        priority=priority_filter
    )
    
    # 未読数を取得
    _, unread_count = service.get_notifications(
        user_id=current_user.id,
        tenant_id=current_user.tenant_id,
        unread_only=True,
        skip=0,
        limit=1
    )
    
    return NotificationListResponse(
        notifications=[NotificationResponse.from_orm(n) for n in notifications],
        total=total,
        unread_count=unread_count,
        has_more=skip + limit < total
    )


# 通知詳細取得
@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """通知詳細を取得"""
    service = NotificationService(db)
    notification = service.get_notification_by_id(
        notification_id, current_user.id, current_user.tenant_id
    )
    
    if not notification:
        raise HTTPException(status_code=404, detail="通知が見つかりません")
    
    return NotificationResponse.from_orm(notification)


# 通知既読
@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """通知を既読にする"""
    service = NotificationService(db)
    notification = service.mark_as_read(
        notification_id, current_user.id, current_user.tenant_id
    )
    
    if not notification:
        raise HTTPException(status_code=404, detail="通知が見つかりません")
    
    return NotificationResponse.from_orm(notification)


# 全通知既読
@router.patch("/mark-all-read")
async def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """全通知を既読にする"""
    service = NotificationService(db)
    updated_count = service.mark_all_as_read(current_user.id, current_user.tenant_id)
    
    return {"message": f"{updated_count}件の通知を既読にしました"}


# 通知削除
@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """通知を削除"""
    service = NotificationService(db)
    success = service.delete_notification(
        notification_id, current_user.id, current_user.tenant_id
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="通知が見つかりません")
    
    return {"message": "通知を削除しました"}


# 通知統計
@router.get("/stats/summary", response_model=NotificationStats)
async def get_notification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """通知統計を取得"""
    service = NotificationService(db)
    return service.get_notification_stats(current_user.id, current_user.tenant_id)


# 通知設定取得
@router.get("/preferences/me", response_model=NotificationPreferencesResponse)
async def get_my_notification_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """自分の通知設定を取得"""
    service = NotificationService(db)
    preferences = service.get_notification_preferences(
        current_user.id, current_user.tenant_id
    )
    
    if not preferences:
        # デフォルト設定を作成
        default_preferences = NotificationPreferencesUpdate()
        preferences = service.create_or_update_preferences(
            current_user.id, current_user.tenant_id, default_preferences
        )
    
    return NotificationPreferencesResponse.from_orm(preferences)


# 通知設定更新
@router.patch("/preferences/me", response_model=NotificationPreferencesResponse)
async def update_my_notification_preferences(
    preferences_update: NotificationPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """自分の通知設定を更新"""
    service = NotificationService(db)
    preferences = service.create_or_update_preferences(
        current_user.id, current_user.tenant_id, preferences_update
    )
    
    return NotificationPreferencesResponse.from_orm(preferences)


# WebSocket接続
@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    current_user: User = Depends(get_current_active_user)
):
    """通知用WebSocket接続"""
    await notification_websocket_handler.handle_connection(
        websocket, str(current_user.id)
    )


# === 建築業界特化の通知作成エンドポイント ===

@router.post("/construction/task-assigned")
async def notify_task_assigned(
    notification_data: TaskAssignedNotification,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """タスク割り当て通知を送信"""
    service = NotificationService(db)
    helpers = ConstructionNotificationHelpers(service)
    
    notification = await helpers.notify_task_assigned(
        task_name=notification_data.task_name,
        project_name=notification_data.project_name,
        assigned_by_id=current_user.id,
        recipient_id=notification_data.recipient_id,
        tenant_id=current_user.tenant_id,
        project_id=notification_data.project_id,
        task_id=notification_data.task_id
    )
    
    return {"message": "タスク割り当て通知を送信しました", "notification_id": notification.id}


@router.post("/construction/task-deadline")
async def notify_task_deadline(
    notification_data: TaskDeadlineNotification,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """タスク期限通知を送信"""
    service = NotificationService(db)
    helpers = ConstructionNotificationHelpers(service)
    
    notification = await helpers.notify_task_deadline(
        task_name=notification_data.task_name,
        project_name=notification_data.project_name,
        hours_remaining=notification_data.hours_remaining,
        recipient_id=notification_data.recipient_id,
        tenant_id=current_user.tenant_id,
        project_id=notification_data.project_id,
        task_id=notification_data.task_id
    )
    
    return {"message": "タスク期限通知を送信しました", "notification_id": notification.id}


@router.post("/construction/stage-completed")
async def notify_stage_completed(
    notification_data: StageCompletedNotification,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ステージ完了通知を送信"""
    service = NotificationService(db)
    
    notification_create = NotificationCreateBulk(
        type="stage_completed",
        priority="low",
        title="ステージが完了しました",
        message=f"{notification_data.completed_by}さんが「{notification_data.stage_name}」を完了しました（{notification_data.project_name}）",
        recipient_ids=notification_data.recipient_ids,
        sender_id=current_user.id,
        related_project_id=notification_data.project_id,
        related_stage_id=notification_data.stage_id,
        action_url=f"/projects/{notification_data.project_id}",
        metadata={
            "stage_name": notification_data.stage_name,
            "project_name": notification_data.project_name,
            "completed_by": notification_data.completed_by
        }
    )
    
    notifications = await service.create_bulk_notification(
        notification_create, current_user.tenant_id
    )
    
    return {"message": "ステージ完了通知を送信しました", "count": len(notifications)}


@router.post("/construction/stage-delayed")
async def notify_stage_delayed(
    notification_data: StageDelayedNotification,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ステージ遅延通知を送信"""
    service = NotificationService(db)
    helpers = ConstructionNotificationHelpers(service)
    
    notifications = await helpers.notify_stage_delayed(
        stage_name=notification_data.stage_name,
        project_name=notification_data.project_name,
        delay_days=notification_data.delay_days,
        recipient_ids=notification_data.recipient_ids,
        tenant_id=current_user.tenant_id,
        project_id=notification_data.project_id,
        stage_id=notification_data.stage_id,
        reason=notification_data.reason
    )
    
    return {"message": "ステージ遅延通知を送信しました", "count": len(notifications)}


@router.post("/construction/handoff-request")
async def notify_handoff_request(
    notification_data: HandoffRequestNotification,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """引き継ぎ要求通知を送信"""
    service = NotificationService(db)
    
    notification_create = NotificationCreateBulk(
        type="handoff_request",
        priority="high",
        title="引き継ぎ要求があります",
        message=f"{notification_data.from_role}から{notification_data.to_role}への引き継ぎ（{notification_data.task_count}件のタスク） - {notification_data.project_name}",
        recipient_ids=notification_data.recipient_ids,
        sender_id=current_user.id,
        related_project_id=notification_data.project_id,
        action_url=f"/projects/{notification_data.project_id}",
        metadata={
            "from_role": notification_data.from_role,
            "to_role": notification_data.to_role,
            "project_name": notification_data.project_name,
            "task_count": notification_data.task_count
        }
    )
    
    notifications = await service.create_bulk_notification(
        notification_create, current_user.tenant_id
    )
    
    return {"message": "引き継ぎ要求通知を送信しました", "count": len(notifications)}


@router.post("/construction/bottleneck-alert")
async def notify_bottleneck_alert(
    notification_data: BottleneckAlertNotification,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ボトルネック警告通知を送信"""
    service = NotificationService(db)
    helpers = ConstructionNotificationHelpers(service)
    
    notifications = await helpers.notify_bottleneck_alert(
        role=notification_data.role,
        task_name=notification_data.task_name,
        impact_count=notification_data.impact_count,
        severity=notification_data.severity,
        recipient_ids=notification_data.recipient_ids,
        tenant_id=current_user.tenant_id
    )
    
    return {"message": "ボトルネック警告通知を送信しました", "count": len(notifications)}


# 管理者向けエンドポイント
@router.post("/admin/broadcast")
async def broadcast_system_message(
    message: str,
    user_ids: Optional[List[UUID]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """システムメッセージをブロードキャスト（管理者のみ）"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="管理者権限が必要です")
    
    user_id_strs = [str(uid) for uid in user_ids] if user_ids else None
    await notification_websocket_handler.send_system_message(message, user_id_strs)
    
    return {"message": "システムメッセージを送信しました"}


@router.get("/admin/online-users")
async def get_online_users(
    current_user: User = Depends(get_current_active_user)
):
    """オンラインユーザー一覧を取得（管理者のみ）"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="管理者権限が必要です")
    
    from app.services.websocket_manager import websocket_manager
    
    active_users = websocket_manager.get_active_users()
    return {
        "online_users": active_users,
        "count": len(active_users)
    }