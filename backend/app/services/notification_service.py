from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
import json
import asyncio

from app.models.notification import (
    Notification, 
    NotificationPreferences, 
    NotificationDeliveryLog,
    NotificationTypeEnum,
    NotificationPriorityEnum
)
from app.models.user import User
from app.models.project import Project
from app.schemas.notification import (
    NotificationCreate,
    NotificationCreateBulk,
    NotificationUpdate,
    NotificationResponse,
    NotificationPreferencesCreate,
    NotificationPreferencesUpdate,
    NotificationStats
)


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
    
    # 通知作成
    async def create_notification(
        self, 
        notification_data: NotificationCreate,
        tenant_id: UUID
    ) -> Notification:
        """単一通知を作成"""
        notification = Notification(
            **notification_data.dict(),
            tenant_id=tenant_id
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        # 通知配信を実行
        await self._deliver_notification(notification)
        return notification
    
    async def create_bulk_notification(
        self, 
        notification_data: NotificationCreateBulk,
        tenant_id: UUID
    ) -> List[Notification]:
        """一括通知作成"""
        notifications = []
        base_data = notification_data.dict()
        recipient_ids = base_data.pop('recipient_ids')
        
        for recipient_id in recipient_ids:
            notification = Notification(
                **base_data,
                recipient_id=recipient_id,
                tenant_id=tenant_id
            )
            notifications.append(notification)
            self.db.add(notification)
        
        self.db.commit()
        
        # 通知配信を並行実行
        await asyncio.gather(*[
            self._deliver_notification(notification) 
            for notification in notifications
        ])
        
        return notifications
    
    # 通知取得
    def get_notifications(
        self,
        user_id: UUID,
        tenant_id: UUID,
        skip: int = 0,
        limit: int = 20,
        unread_only: bool = False,
        notification_type: Optional[NotificationTypeEnum] = None,
        priority: Optional[NotificationPriorityEnum] = None
    ) -> tuple[List[Notification], int]:
        """ユーザーの通知一覧を取得"""
        query = self.db.query(Notification).filter(
            Notification.recipient_id == user_id,
            Notification.tenant_id == tenant_id
        )
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        if notification_type:
            query = query.filter(Notification.type == notification_type)
        
        if priority:
            query = query.filter(Notification.priority == priority)
        
        # 有効期限チェック
        now = datetime.utcnow()
        query = query.filter(
            or_(
                Notification.expires_at.is_(None),
                Notification.expires_at > now
            )
        )
        
        total = query.count()
        notifications = query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()
        
        return notifications, total
    
    def get_notification_by_id(
        self, 
        notification_id: UUID, 
        user_id: UUID, 
        tenant_id: UUID
    ) -> Optional[Notification]:
        """特定の通知を取得"""
        return self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.recipient_id == user_id,
            Notification.tenant_id == tenant_id
        ).first()
    
    # 通知更新
    def mark_as_read(
        self, 
        notification_id: UUID, 
        user_id: UUID, 
        tenant_id: UUID
    ) -> Optional[Notification]:
        """通知を既読にする"""
        notification = self.get_notification_by_id(notification_id, user_id, tenant_id)
        if notification and not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(notification)
        return notification
    
    def mark_all_as_read(self, user_id: UUID, tenant_id: UUID) -> int:
        """全通知を既読にする"""
        updated = self.db.query(Notification).filter(
            Notification.recipient_id == user_id,
            Notification.tenant_id == tenant_id,
            Notification.is_read == False
        ).update({
            'is_read': True,
            'read_at': datetime.utcnow()
        })
        self.db.commit()
        return updated
    
    def delete_notification(
        self, 
        notification_id: UUID, 
        user_id: UUID, 
        tenant_id: UUID
    ) -> bool:
        """通知を削除"""
        notification = self.get_notification_by_id(notification_id, user_id, tenant_id)
        if notification:
            self.db.delete(notification)
            self.db.commit()
            return True
        return False
    
    # 統計情報
    def get_notification_stats(self, user_id: UUID, tenant_id: UUID) -> NotificationStats:
        """通知統計を取得"""
        base_query = self.db.query(Notification).filter(
            Notification.recipient_id == user_id,
            Notification.tenant_id == tenant_id
        )
        
        total = base_query.count()
        unread = base_query.filter(Notification.is_read == False).count()
        
        # タイプ別集計
        type_stats = self.db.query(
            Notification.type,
            func.count(Notification.id)
        ).filter(
            Notification.recipient_id == user_id,
            Notification.tenant_id == tenant_id,
            Notification.is_read == False
        ).group_by(Notification.type).all()
        
        by_type = {str(type_): count for type_, count in type_stats}
        
        # 優先度別集計
        priority_stats = self.db.query(
            Notification.priority,
            func.count(Notification.id)
        ).filter(
            Notification.recipient_id == user_id,
            Notification.tenant_id == tenant_id,
            Notification.is_read == False
        ).group_by(Notification.priority).all()
        
        by_priority = {str(priority): count for priority, count in priority_stats}
        
        # 直近24時間の通知数
        recent_count = base_query.filter(
            Notification.created_at >= datetime.utcnow() - timedelta(hours=24)
        ).count()
        
        return NotificationStats(
            total=total,
            unread=unread,
            by_type=by_type,
            by_priority=by_priority,
            recent_count=recent_count
        )
    
    # 通知設定
    def get_notification_preferences(
        self, 
        user_id: UUID, 
        tenant_id: UUID
    ) -> Optional[NotificationPreferences]:
        """ユーザーの通知設定を取得"""
        return self.db.query(NotificationPreferences).filter(
            NotificationPreferences.user_id == user_id,
            NotificationPreferences.tenant_id == tenant_id
        ).first()
    
    def create_or_update_preferences(
        self,
        user_id: UUID,
        tenant_id: UUID,
        preferences_data: NotificationPreferencesUpdate
    ) -> NotificationPreferences:
        """通知設定を作成または更新"""
        preferences = self.get_notification_preferences(user_id, tenant_id)
        
        if preferences:
            # 更新
            for field, value in preferences_data.dict(exclude_unset=True).items():
                setattr(preferences, field, value)
            preferences.updated_at = datetime.utcnow()
        else:
            # 新規作成
            preferences = NotificationPreferences(
                user_id=user_id,
                tenant_id=tenant_id,
                **preferences_data.dict(exclude_unset=True)
            )
            self.db.add(preferences)
        
        self.db.commit()
        self.db.refresh(preferences)
        return preferences
    
    # 通知配信
    async def _deliver_notification(self, notification: Notification):
        """通知を配信する"""
        preferences = self.get_notification_preferences(
            notification.recipient_id, 
            notification.tenant_id
        )
        
        if not preferences:
            # デフォルト設定で配信
            await self._send_websocket_notification(notification)
            return
        
        # 勤務時間外チェック
        if not self._should_deliver_now(notification, preferences):
            return
        
        # 配信方法に応じて送信
        delivery_methods = notification.delivery_methods or ["websocket"]
        
        tasks = []
        if "websocket" in delivery_methods:
            tasks.append(self._send_websocket_notification(notification))
        if "email" in delivery_methods and preferences.enable_email_notifications:
            tasks.append(self._send_email_notification(notification))
        if "push" in delivery_methods and preferences.enable_push_notifications:
            tasks.append(self._send_push_notification(notification))
        
        if tasks:
            await asyncio.gather(*tasks)
    
    def _should_deliver_now(
        self, 
        notification: Notification, 
        preferences: NotificationPreferences
    ) -> bool:
        """現在時刻に通知を配信すべきかチェック"""
        if not preferences.quiet_hours_enabled:
            return True
        
        # 緊急通知は勤務時間外でも配信
        if (notification.priority == NotificationPriorityEnum.URGENT and 
            preferences.allow_urgent_in_quiet_hours):
            return True
        
        now = datetime.utcnow()
        current_time = now.strftime("%H:%M")
        
        start_time = preferences.quiet_hours_start
        end_time = preferences.quiet_hours_end
        
        # 日付をまたぐ場合の処理
        if start_time > end_time:
            is_quiet_time = current_time >= start_time or current_time <= end_time
        else:
            is_quiet_time = start_time <= current_time <= end_time
        
        return not is_quiet_time
    
    async def _send_websocket_notification(self, notification: Notification):
        """WebSocket通知を送信"""
        # WebSocketマネージャーに送信
        from app.services.websocket_manager import websocket_manager
        
        message = {
            "type": "notification",
            "data": {
                "id": str(notification.id),
                "type": notification.type,
                "priority": notification.priority,
                "title": notification.title,
                "message": notification.message,
                "action_url": notification.action_url,
                "created_at": notification.created_at.isoformat(),
                "metadata": notification.metadata
            }
        }
        
        await websocket_manager.send_personal_message(
            str(notification.recipient_id),
            json.dumps(message)
        )
        
        # 配信ログ記録
        self._log_delivery(notification.id, "websocket", "sent")
    
    async def _send_email_notification(self, notification: Notification):
        """メール通知を送信"""
        try:
            # Get user email from database
            user = self.db.query(User).filter(User.id == notification.recipient_id).first()
            if not user or not user.email:
                self._log_delivery(notification.id, "email", "failed", "Recipient email not found")
                return
            
            # Import email service
            from app.services.email_service import email_service
            
            # Send email notification
            success = await email_service.send_notification_email(notification, user.email)
            
            if success:
                self._log_delivery(notification.id, "email", "sent")
                notification.is_delivered = True
                notification.delivered_at = datetime.utcnow()
                self.db.commit()
            else:
                self._log_delivery(notification.id, "email", "failed", "Email sending failed")
                
        except Exception as e:
            self._log_delivery(notification.id, "email", "failed", str(e))
    
    async def _send_push_notification(self, notification: Notification):
        """プッシュ通知を送信"""
        # プッシュ通知の実装（後で実装）
        self._log_delivery(notification.id, "push", "pending")
    
    def _log_delivery(
        self, 
        notification_id: UUID, 
        method: str, 
        status: str,
        error_message: Optional[str] = None
    ):
        """配信ログを記録"""
        log = NotificationDeliveryLog(
            notification_id=notification_id,
            delivery_method=method,
            status=status,
            error_message=error_message
        )
        self.db.add(log)
        self.db.commit()


# 建築業界特化のヘルパー関数
class ConstructionNotificationHelpers:
    def __init__(self, service: NotificationService):
        self.service = service
    
    async def notify_task_assigned(
        self,
        task_name: str,
        project_name: str,
        assigned_by_id: UUID,
        recipient_id: UUID,
        tenant_id: UUID,
        project_id: UUID,
        task_id: Optional[UUID] = None
    ):
        """タスク割り当て通知"""
        notification_data = NotificationCreate(
            type=NotificationTypeEnum.TASK_ASSIGNED,
            priority=NotificationPriorityEnum.MEDIUM,
            title="新しいタスクが割り当てられました",
            message=f"「{task_name}」が割り当てられました（{project_name}）",
            recipient_id=recipient_id,
            sender_id=assigned_by_id,
            related_project_id=project_id,
            related_task_id=task_id,
            action_url=f"/projects/{project_id}",
            metadata={
                "task_name": task_name,
                "project_name": project_name
            }
        )
        
        return await self.service.create_notification(notification_data, tenant_id)
    
    async def notify_task_deadline(
        self,
        task_name: str,
        project_name: str,
        hours_remaining: int,
        recipient_id: UUID,
        tenant_id: UUID,
        project_id: UUID,
        task_id: Optional[UUID] = None
    ):
        """タスク期限通知"""
        if hours_remaining <= 0:
            priority = NotificationPriorityEnum.URGENT
            title = "⚠️ タスクの期限が過ぎています"
        elif hours_remaining <= 24:
            priority = NotificationPriorityEnum.HIGH
            title = "⏰ タスクの期限が迫っています"
        else:
            priority = NotificationPriorityEnum.MEDIUM
            title = "タスクの期限が近づいています"
        
        notification_data = NotificationCreate(
            type=NotificationTypeEnum.TASK_DEADLINE,
            priority=priority,
            title=title,
            message=f"「{task_name}」の期限まで{hours_remaining}時間（{project_name}）",
            recipient_id=recipient_id,
            related_project_id=project_id,
            related_task_id=task_id,
            action_url=f"/projects/{project_id}",
            metadata={
                "task_name": task_name,
                "project_name": project_name,
                "hours_remaining": hours_remaining
            }
        )
        
        return await self.service.create_notification(notification_data, tenant_id)
    
    async def notify_stage_delayed(
        self,
        stage_name: str,
        project_name: str,
        delay_days: int,
        recipient_ids: List[UUID],
        tenant_id: UUID,
        project_id: UUID,
        stage_id: Optional[UUID] = None,
        reason: Optional[str] = None
    ):
        """ステージ遅延通知"""
        priority = NotificationPriorityEnum.URGENT if delay_days > 7 else NotificationPriorityEnum.HIGH
        
        message = f"「{stage_name}」が{delay_days}日遅延しています（{project_name}）"
        if reason:
            message += f"\n理由: {reason}"
        
        notification_data = NotificationCreateBulk(
            type=NotificationTypeEnum.STAGE_DELAYED,
            priority=priority,
            title="🚨 ステージ遅延が発生しています",
            message=message,
            recipient_ids=recipient_ids,
            related_project_id=project_id,
            related_stage_id=stage_id,
            action_url=f"/projects/{project_id}",
            metadata={
                "stage_name": stage_name,
                "project_name": project_name,
                "delay_days": delay_days,
                "reason": reason
            }
        )
        
        return await self.service.create_bulk_notification(notification_data, tenant_id)
    
    async def notify_bottleneck_alert(
        self,
        role: str,
        task_name: str,
        impact_count: int,
        severity: str,
        recipient_ids: List[UUID],
        tenant_id: UUID
    ):
        """ボトルネック警告通知"""
        priority_map = {
            "medium": NotificationPriorityEnum.HIGH,
            "high": NotificationPriorityEnum.URGENT,
            "critical": NotificationPriorityEnum.URGENT
        }
        
        notification_data = NotificationCreateBulk(
            type=NotificationTypeEnum.BOTTLENECK_ALERT,
            priority=priority_map.get(severity, NotificationPriorityEnum.HIGH),
            title="⚠️ ボトルネックが検出されました",
            message=f"{role}の「{task_name}」が{impact_count}件のプロジェクトに影響しています",
            recipient_ids=recipient_ids,
            action_url="/analytics",
            metadata={
                "role": role,
                "task_name": task_name,
                "impact_count": impact_count,
                "severity": severity
            }
        )
        
        return await self.service.create_bulk_notification(notification_data, tenant_id)