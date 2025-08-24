#!/usr/bin/env python3
"""
Test script for the email notification service
This can be used to test email templates and formatting
"""

import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any

# Mock notification class for testing
class MockNotification:
    def __init__(self, **kwargs):
        self.id = str(uuid.uuid4())
        self.type = kwargs.get('type', 'task_assigned')
        self.priority = kwargs.get('priority', 'medium')
        self.title = kwargs.get('title', 'Test Notification')
        self.message = kwargs.get('message', 'This is a test notification')
        self.action_url = kwargs.get('action_url')
        self.metadata = kwargs.get('metadata', {})
        self.created_at = datetime.utcnow()
        self.recipient_id = kwargs.get('recipient_id', str(uuid.uuid4()))

# Mock email service for testing (without SMTP)
class MockEmailService:
    def __init__(self):
        # Use the same templates as the real service
        from app.services.email_service import EmailService
        real_service = EmailService()
        self.templates = real_service.templates
        self._get_template = real_service._get_template
        self._render_template = real_service._render_template
        
    async def test_template_rendering(self, notification_type: str, context: Dict[str, Any]) -> Dict[str, str]:
        """Test template rendering without sending email"""
        from app.models.notification import NotificationTypeEnum
        
        # Convert string to enum
        notification_enum = getattr(NotificationTypeEnum, notification_type.upper(), NotificationTypeEnum.TASK_ASSIGNED)
        
        # Get template
        template = self._get_template(notification_enum)
        
        # Render templates
        subject = self._render_template(template['subject'], context)
        html_content = self._render_template(template['html'], context)
        
        # Create text version
        text_content = f"""
{context['title']}

{context['message']}

プロジェクト: {context['metadata'].get('project_name', 'N/A')}
優先度: {context['priority']}
作成日時: {context['created_at'].strftime('%Y年%m月%d日 %H:%M')}

{context.get('action_url', '')}

---
このメールは Dandori TODO System から自動送信されています。
        """.strip()
        
        return {
            'subject': subject,
            'html': html_content,
            'text': text_content
        }

async def test_task_assigned_email():
    """Test task assigned email template"""
    print("📧 Testing Task Assigned Email Template")
    print("=" * 60)
    
    email_service = MockEmailService()
    
    # Create test notification
    notification = MockNotification(
        type='task_assigned',
        priority='medium',
        title='新しいタスクが割り当てられました',
        message='「基礎工事の図面作成」が割り当てられました（山田邸新築工事）',
        action_url='http://localhost:3000/projects/123',
        metadata={
            'project_name': '山田邸新築工事',
            'task_name': '基礎工事の図面作成',
            'assigned_by': '田中設計士'
        }
    )
    
    # Prepare context
    context = {
        'title': notification.title,
        'message': notification.message,
        'priority': notification.priority,
        'action_url': notification.action_url,
        'metadata': notification.metadata,
        'created_at': notification.created_at,
        'notification_type': notification.type
    }
    
    # Test template rendering
    rendered = await email_service.test_template_rendering('task_assigned', context)
    
    print("✅ Email Subject:")
    print(f"   {rendered['subject']}")
    print()
    
    print("✅ Text Version:")
    print(rendered['text'])
    print()
    
    print("✅ HTML Version Generated (preview first 500 chars):")
    print(rendered['html'][:500] + "...")
    print()

async def test_task_deadline_email():
    """Test task deadline email template"""
    print("⏰ Testing Task Deadline Email Template")
    print("=" * 60)
    
    email_service = MockEmailService()
    
    # Create test notification
    notification = MockNotification(
        type='task_deadline',
        priority='high',
        title='⏰ タスクの期限が迫っています',
        message='「屋根工事」の期限まで24時間（佐藤邸新築工事）',
        action_url='http://localhost:3000/projects/456',
        metadata={
            'project_name': '佐藤邸新築工事',
            'task_name': '屋根工事',
            'hours_remaining': 24
        }
    )
    
    # Prepare context
    context = {
        'title': notification.title,
        'message': notification.message,
        'priority': notification.priority,
        'action_url': notification.action_url,
        'metadata': notification.metadata,
        'created_at': notification.created_at,
        'notification_type': notification.type
    }
    
    # Test template rendering
    rendered = await email_service.test_template_rendering('task_deadline', context)
    
    print("✅ Email Subject:")
    print(f"   {rendered['subject']}")
    print()
    
    print("✅ Text Version:")
    print(rendered['text'])
    print()

async def test_stage_delayed_email():
    """Test stage delayed email template"""
    print("🚨 Testing Stage Delayed Email Template")
    print("=" * 60)
    
    email_service = MockEmailService()
    
    # Create test notification
    notification = MockNotification(
        type='stage_delayed',
        priority='urgent',
        title='🚨 ステージ遅延が発生しています',
        message='「設計段階」が10日遅延しています（田中邸リフォーム工事）',
        action_url='http://localhost:3000/projects/789',
        metadata={
            'project_name': '田中邸リフォーム工事',
            'stage_name': '設計段階',
            'delay_days': 10,
            'reason': '追加設計変更による遅延'
        }
    )
    
    # Prepare context
    context = {
        'title': notification.title,
        'message': notification.message,
        'priority': notification.priority,
        'action_url': notification.action_url,
        'metadata': notification.metadata,
        'created_at': notification.created_at,
        'notification_type': notification.type
    }
    
    # Test template rendering
    rendered = await email_service.test_template_rendering('stage_delayed', context)
    
    print("✅ Email Subject:")
    print(f"   {rendered['subject']}")
    print()
    
    print("✅ Text Version:")
    print(rendered['text'])
    print()

async def test_handoff_request_email():
    """Test handoff request email template"""
    print("🤝 Testing Handoff Request Email Template")
    print("=" * 60)
    
    email_service = MockEmailService()
    
    # Create test notification
    notification = MockNotification(
        type='handoff_request',
        priority='high',
        title='引き継ぎ要求があります',
        message='営業から設計への引き継ぎ（5件のタスク） - 鈴木邸新築工事',
        action_url='http://localhost:3000/projects/101',
        metadata={
            'project_name': '鈴木邸新築工事',
            'from_role': '営業',
            'to_role': '設計',
            'task_count': 5
        }
    )
    
    # Prepare context
    context = {
        'title': notification.title,
        'message': notification.message,
        'priority': notification.priority,
        'action_url': notification.action_url,
        'metadata': notification.metadata,
        'created_at': notification.created_at,
        'notification_type': notification.type
    }
    
    # Test template rendering
    rendered = await email_service.test_template_rendering('handoff_request', context)
    
    print("✅ Email Subject:")
    print(f"   {rendered['subject']}")
    print()
    
    print("✅ Text Version:")
    print(rendered['text'])
    print()

def save_html_preview(html_content: str, filename: str):
    """Save HTML content to file for preview"""
    filepath = f"/Users/dw100/claude-playground/construction-todo-system/backend/{filename}"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"📄 HTML preview saved to: {filepath}")

async def generate_html_previews():
    """Generate HTML preview files for all templates"""
    print("🎨 Generating HTML Preview Files")
    print("=" * 60)
    
    email_service = MockEmailService()
    
    test_cases = [
        {
            'type': 'task_assigned',
            'notification': MockNotification(
                type='task_assigned',
                priority='medium',
                title='新しいタスクが割り当てられました',
                message='「基礎工事の図面作成」が割り当てられました（山田邸新築工事）',
                action_url='http://localhost:3000/projects/123',
                metadata={
                    'project_name': '山田邸新築工事',
                    'task_name': '基礎工事の図面作成'
                }
            ),
            'filename': 'email_preview_task_assigned.html'
        },
        {
            'type': 'task_deadline',
            'notification': MockNotification(
                type='task_deadline',
                priority='high',
                title='⏰ タスクの期限が迫っています',
                message='「屋根工事」の期限まで24時間（佐藤邸新築工事）',
                action_url='http://localhost:3000/projects/456',
                metadata={
                    'project_name': '佐藤邸新築工事',
                    'task_name': '屋根工事',
                    'hours_remaining': 24
                }
            ),
            'filename': 'email_preview_task_deadline.html'
        },
        {
            'type': 'stage_delayed',
            'notification': MockNotification(
                type='stage_delayed',
                priority='urgent',
                title='🚨 ステージ遅延が発生しています',
                message='「設計段階」が10日遅延しています（田中邸リフォーム工事）',
                action_url='http://localhost:3000/projects/789',
                metadata={
                    'project_name': '田中邸リフォーム工事',
                    'stage_name': '設計段階',
                    'delay_days': 10,
                    'reason': '追加設計変更による遅延'
                }
            ),
            'filename': 'email_preview_stage_delayed.html'
        }
    ]
    
    for test_case in test_cases:
        notification = test_case['notification']
        
        context = {
            'title': notification.title,
            'message': notification.message,
            'priority': notification.priority,
            'action_url': notification.action_url,
            'metadata': notification.metadata,
            'created_at': notification.created_at,
            'notification_type': notification.type
        }
        
        rendered = await email_service.test_template_rendering(test_case['type'], context)
        save_html_preview(rendered['html'], test_case['filename'])
    
    print()

async def main():
    """Run all email tests"""
    print("📧 Starting Email Service Tests")
    print("=" * 80)
    print()
    
    # Run template tests
    await test_task_assigned_email()
    await test_task_deadline_email()
    await test_stage_delayed_email()
    await test_handoff_request_email()
    
    # Generate HTML previews
    await generate_html_previews()
    
    print("🎉 All email tests completed successfully!")
    print("=" * 80)
    print()
    print("📝 Next steps:")
    print("1. Configure email settings in .env file:")
    print("   - EMAIL_SMTP_SERVER=smtp.gmail.com")
    print("   - EMAIL_SMTP_PORT=587")
    print("   - EMAIL_SENDER=your-email@domain.com")
    print("   - EMAIL_PASSWORD=your-app-password")
    print("   - EMAIL_SENDER_NAME='Dandori TODO System'")
    print()
    print("2. Test with real SMTP server")
    print("3. Integrate with notification preferences")
    print("4. Set up email scheduling for different priorities")
    print()
    print("📄 HTML preview files generated for testing email templates")

if __name__ == "__main__":
    try:
        # Add the current directory to Python path for imports
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        
        asyncio.run(main())
    except ImportError as e:
        print(f"Import error: {e}")
        print("Note: This test requires the app modules to be available")
        print("Run this from the backend directory with proper Python environment")