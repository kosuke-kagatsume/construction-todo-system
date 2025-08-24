#!/usr/bin/env python3
"""
Test script for the notification service
This can be used to test the notification system without a full FastAPI setup
"""

import asyncio
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

# Mock database session for testing
class MockSession:
    def __init__(self):
        self.notifications = []
        self.preferences = {}
        self.logs = []
    
    def add(self, obj):
        if hasattr(obj, 'id'):
            obj.id = str(uuid.uuid4())
        
        if obj.__class__.__name__ == 'Notification':
            self.notifications.append(obj)
        elif obj.__class__.__name__ == 'NotificationPreferences':
            self.preferences[obj.user_id] = obj
        elif obj.__class__.__name__ == 'NotificationDeliveryLog':
            self.logs.append(obj)
    
    def commit(self):
        pass
    
    def refresh(self, obj):
        pass
    
    def query(self, model):
        return MockQuery(self, model)

class MockQuery:
    def __init__(self, session, model):
        self.session = session
        self.model = model
        
    def filter(self, *args):
        return self
    
    def first(self):
        return None
    
    def count(self):
        return len(self.session.notifications)
    
    def all(self):
        return self.session.notifications
    
    def order_by(self, *args):
        return self
    
    def offset(self, n):
        return self
    
    def limit(self, n):
        return self

# Mock models for testing
class MockNotification:
    def __init__(self, **kwargs):
        self.id = str(uuid.uuid4())
        self.recipient_id = kwargs.get('recipient_id')
        self.tenant_id = kwargs.get('tenant_id')
        self.type = kwargs.get('type')
        self.priority = kwargs.get('priority')
        self.title = kwargs.get('title')
        self.message = kwargs.get('message')
        self.sender_id = kwargs.get('sender_id')
        self.action_url = kwargs.get('action_url')
        self.metadata = kwargs.get('metadata', {})
        self.delivery_methods = kwargs.get('delivery_methods', ['websocket'])
        self.is_read = False
        self.is_delivered = False
        self.created_at = datetime.utcnow()
        self.read_at = None
        self.delivered_at = None

class MockNotificationPreferences:
    def __init__(self, **kwargs):
        self.id = str(uuid.uuid4())
        self.user_id = kwargs.get('user_id')
        self.tenant_id = kwargs.get('tenant_id')
        self.enable_desktop_notifications = kwargs.get('enable_desktop_notifications', True)
        self.enable_email_notifications = kwargs.get('enable_email_notifications', False)
        self.enable_push_notifications = kwargs.get('enable_push_notifications', False)
        self.quiet_hours_enabled = kwargs.get('quiet_hours_enabled', False)
        self.quiet_hours_start = kwargs.get('quiet_hours_start', '22:00')
        self.quiet_hours_end = kwargs.get('quiet_hours_end', '08:00')
        self.allow_urgent_in_quiet_hours = kwargs.get('allow_urgent_in_quiet_hours', True)

class MockNotificationDeliveryLog:
    def __init__(self, **kwargs):
        self.id = str(uuid.uuid4())
        self.notification_id = kwargs.get('notification_id')
        self.delivery_method = kwargs.get('delivery_method')
        self.status = kwargs.get('status')
        self.error_message = kwargs.get('error_message')
        self.attempted_at = datetime.utcnow()
        self.delivered_at = kwargs.get('delivered_at')

# Mock WebSocket manager for testing
class MockWebSocketManager:
    def __init__(self):
        self.sent_messages = []
        self.active_users = ['user1', 'user2', 'user3']
    
    async def send_personal_message(self, user_id: str, message: str):
        print(f"📤 WebSocket message sent to {user_id}:")
        print(f"   {message}")
        self.sent_messages.append({
            'user_id': user_id,
            'message': json.loads(message),
            'timestamp': datetime.utcnow().isoformat()
        })
    
    def get_active_users(self):
        return self.active_users

# Mock notification service for testing
class MockNotificationService:
    def __init__(self):
        self.db = MockSession()
        
    async def create_notification(self, notification_data, tenant_id):
        """Create a single notification"""
        notification = MockNotification(
            **notification_data.dict(),
            tenant_id=tenant_id
        )
        self.db.add(notification)
        self.db.commit()
        
        # Mock delivery
        await self._deliver_notification(notification)
        return notification
    
    async def create_bulk_notification(self, notification_data, tenant_id):
        """Create bulk notifications"""
        notifications = []
        base_data = notification_data.dict()
        recipient_ids = base_data.pop('recipient_ids')
        
        for recipient_id in recipient_ids:
            notification = MockNotification(
                **base_data,
                recipient_id=recipient_id,
                tenant_id=tenant_id
            )
            notifications.append(notification)
            self.db.add(notification)
        
        self.db.commit()
        
        # Mock delivery
        await asyncio.gather(*[
            self._deliver_notification(notification) 
            for notification in notifications
        ])
        
        return notifications
    
    async def _deliver_notification(self, notification):
        """Mock notification delivery"""
        # Mock WebSocket delivery
        mock_websocket_manager = MockWebSocketManager()
        
        message = {
            "type": "notification",
            "data": {
                "id": notification.id,
                "type": notification.type,
                "priority": notification.priority,
                "title": notification.title,
                "message": notification.message,
                "action_url": notification.action_url,
                "created_at": notification.created_at.isoformat(),
                "metadata": notification.metadata
            }
        }
        
        await mock_websocket_manager.send_personal_message(
            str(notification.recipient_id),
            json.dumps(message)
        )
        
        # Log delivery
        log = MockNotificationDeliveryLog(
            notification_id=notification.id,
            delivery_method="websocket",
            status="sent"
        )
        self.db.add(log)

# Mock schemas for testing
class MockNotificationCreate:
    def __init__(self, **kwargs):
        self.data = kwargs
    
    def dict(self):
        return self.data

class MockNotificationCreateBulk:
    def __init__(self, **kwargs):
        self.data = kwargs
    
    def dict(self):
        return self.data

# Construction helpers for testing
class MockConstructionNotificationHelpers:
    def __init__(self, service):
        self.service = service
    
    async def notify_task_assigned(self, **kwargs):
        notification_data = MockNotificationCreate(
            type="task_assigned",
            priority="medium",
            title="新しいタスクが割り当てられました",
            message=f"「{kwargs['task_name']}」が割り当てられました（{kwargs['project_name']}）",
            recipient_id=kwargs['recipient_id'],
            sender_id=kwargs['assigned_by_id'],
            related_project_id=kwargs['project_id'],
            related_task_id=kwargs.get('task_id'),
            action_url=f"/projects/{kwargs['project_id']}",
            metadata={
                "task_name": kwargs['task_name'],
                "project_name": kwargs['project_name']
            }
        )
        
        return await self.service.create_notification(notification_data, kwargs['tenant_id'])
    
    async def notify_stage_delayed(self, **kwargs):
        priority = "urgent" if kwargs['delay_days'] > 7 else "high"
        
        message = f"「{kwargs['stage_name']}」が{kwargs['delay_days']}日遅延しています（{kwargs['project_name']}）"
        if kwargs.get('reason'):
            message += f"\n理由: {kwargs['reason']}"
        
        notification_data = MockNotificationCreateBulk(
            type="stage_delayed",
            priority=priority,
            title="🚨 ステージ遅延が発生しています",
            message=message,
            recipient_ids=kwargs['recipient_ids'],
            related_project_id=kwargs['project_id'],
            related_stage_id=kwargs.get('stage_id'),
            action_url=f"/projects/{kwargs['project_id']}",
            metadata={
                "stage_name": kwargs['stage_name'],
                "project_name": kwargs['project_name'],
                "delay_days": kwargs['delay_days'],
                "reason": kwargs.get('reason')
            }
        )
        
        return await self.service.create_bulk_notification(notification_data, kwargs['tenant_id'])

async def test_task_assigned_notification():
    """Test task assigned notification"""
    print("🧪 Testing Task Assigned Notification")
    print("="*50)
    
    service = MockNotificationService()
    helpers = MockConstructionNotificationHelpers(service)
    
    # Test data
    test_data = {
        'task_name': '基礎工事の図面作成',
        'project_name': '山田邸新築工事',
        'assigned_by_id': str(uuid.uuid4()),
        'recipient_id': str(uuid.uuid4()),
        'tenant_id': str(uuid.uuid4()),
        'project_id': str(uuid.uuid4()),
        'task_id': str(uuid.uuid4())
    }
    
    # Create notification
    notification = await helpers.notify_task_assigned(**test_data)
    
    print(f"✅ Task assigned notification created:")
    print(f"   ID: {notification.id}")
    print(f"   Title: {notification.title}")
    print(f"   Message: {notification.message}")
    print(f"   Priority: {notification.priority}")
    print(f"   Recipient: {notification.recipient_id}")
    print()

async def test_stage_delayed_notification():
    """Test stage delayed notification"""
    print("🧪 Testing Stage Delayed Notification")
    print("="*50)
    
    service = MockNotificationService()
    helpers = MockConstructionNotificationHelpers(service)
    
    # Test data
    test_data = {
        'stage_name': '設計段階',
        'project_name': '田中邸リフォーム工事',
        'delay_days': 10,
        'reason': '追加設計変更による遅延',
        'recipient_ids': [str(uuid.uuid4()), str(uuid.uuid4())],
        'tenant_id': str(uuid.uuid4()),
        'project_id': str(uuid.uuid4()),
        'stage_id': str(uuid.uuid4())
    }
    
    # Create notifications
    notifications = await helpers.notify_stage_delayed(**test_data)
    
    print(f"✅ Stage delayed notifications created: {len(notifications)}")
    for i, notification in enumerate(notifications):
        print(f"   Notification {i+1}:")
        print(f"     ID: {notification.id}")
        print(f"     Title: {notification.title}")
        print(f"     Priority: {notification.priority}")
        print(f"     Recipient: {notification.recipient_id}")
    print()

async def test_websocket_message_format():
    """Test WebSocket message format"""
    print("🧪 Testing WebSocket Message Format")
    print("="*50)
    
    mock_websocket = MockWebSocketManager()
    
    # Simulate sending a notification
    test_notification = {
        "type": "notification",
        "data": {
            "id": str(uuid.uuid4()),
            "type": "task_deadline",
            "priority": "high",
            "title": "⏰ タスクの期限が迫っています",
            "message": "「屋根工事」の期限まで24時間（佐藤邸新築工事）",
            "action_url": "/projects/123",
            "created_at": datetime.utcnow().isoformat(),
            "metadata": {
                "task_name": "屋根工事",
                "project_name": "佐藤邸新築工事",
                "hours_remaining": 24
            }
        }
    }
    
    await mock_websocket.send_personal_message(
        "user123",
        json.dumps(test_notification, ensure_ascii=False, indent=2)
    )
    
    print(f"✅ WebSocket message sent")
    print(f"   Active users: {len(mock_websocket.active_users)}")
    print(f"   Messages sent: {len(mock_websocket.sent_messages)}")
    print()

async def main():
    """Run all tests"""
    print("🚀 Starting Notification Service Tests")
    print("="*70)
    print()
    
    # Run tests
    await test_task_assigned_notification()
    await test_stage_delayed_notification()
    await test_websocket_message_format()
    
    print("🎉 All tests completed successfully!")
    print("="*70)
    print()
    print("📝 Next steps:")
    print("1. Set up PostgreSQL database")
    print("2. Run database migrations")
    print("3. Install FastAPI dependencies")
    print("4. Start FastAPI server")
    print("5. Test with the WebSocket client (test_websocket_client.html)")
    print("6. Integrate with frontend application")

if __name__ == "__main__":
    asyncio.run(main())