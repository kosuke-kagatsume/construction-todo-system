import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import asyncio
from jinja2 import Template

from app.core.config import settings
from app.models.notification import Notification, NotificationTypeEnum

logger = logging.getLogger(__name__)


class EmailService:
    """
    Email notification service for construction project notifications
    Supports SMTP configuration and HTML templates
    """
    
    def __init__(self):
        self.smtp_server = getattr(settings, 'EMAIL_SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'EMAIL_SMTP_PORT', 587)
        self.sender_email = getattr(settings, 'EMAIL_SENDER', '')
        self.sender_password = getattr(settings, 'EMAIL_PASSWORD', '')
        self.sender_name = getattr(settings, 'EMAIL_SENDER_NAME', 'Dandori TODO System')
        self.use_tls = getattr(settings, 'EMAIL_USE_TLS', True)
        
        # Email templates
        self.templates = self._initialize_templates()
    
    def _initialize_templates(self) -> Dict[str, Dict[str, str]]:
        """Initialize email templates for different notification types"""
        return {
            NotificationTypeEnum.TASK_ASSIGNED: {
                'subject': '【{{ project_name }}】新しいタスクが割り当てられました',
                'html': '''
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="border-left: 4px solid #007bff; padding-left: 20px; margin-bottom: 25px;">
                            <h2 style="color: #007bff; margin: 0 0 10px 0;">📋 新しいタスクが割り当てられました</h2>
                            <p style="color: #666; margin: 0; font-size: 14px;">{{ created_at.strftime('%Y年%m月%d日 %H:%M') }}</p>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <h3 style="color: #333; margin: 0 0 15px 0;">プロジェクト情報</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">プロジェクト:</td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ metadata.project_name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">タスク名:</td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ metadata.task_name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">優先度:</td>
                                    <td style="padding: 8px 0;">
                                        <span style="background-color: {% if priority == 'urgent' %}#dc3545{% elif priority == 'high' %}#fd7e14{% elif priority == 'medium' %}#ffc107{% else %}#28a745{% endif %}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">{{ priority }}</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <p style="color: #333; line-height: 1.6; margin: 0;">{{ message }}</p>
                        </div>
                        
                        {% if action_url %}
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{ action_url }}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">プロジェクトを確認する</a>
                        </div>
                        {% endif %}
                        
                        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                            <p>このメールは Dandori TODO System から自動送信されています。</p>
                        </div>
                    </div>
                </div>
                '''
            },
            
            NotificationTypeEnum.TASK_DEADLINE: {
                'subject': '【緊急】{{ project_name }} - タスクの期限が迫っています',
                'html': '''
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="border-left: 4px solid #dc3545; padding-left: 20px; margin-bottom: 25px;">
                            <h2 style="color: #dc3545; margin: 0 0 10px 0;">⏰ タスクの期限が迫っています</h2>
                            <p style="color: #666; margin: 0; font-size: 14px;">{{ created_at.strftime('%Y年%m月%d日 %H:%M') }}</p>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-bottom: 25px;">
                            <p style="margin: 0; color: #856404; font-weight: bold;">
                                ⚠️ 残り時間: {{ metadata.hours_remaining }}時間
                            </p>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <h3 style="color: #333; margin: 0 0 15px 0;">詳細情報</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">プロジェクト:</td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ metadata.project_name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">タスク名:</td>
                                    <td style="padding: 8px 0;">{{ metadata.task_name }}</td>
                                </tr>
                            </table>
                        </div>
                        
                        {% if action_url %}
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{ action_url }}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">今すぐ確認する</a>
                        </div>
                        {% endif %}
                        
                        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                            <p>このメールは Dandori TODO System から自動送信されています。</p>
                        </div>
                    </div>
                </div>
                '''
            },
            
            NotificationTypeEnum.STAGE_DELAYED: {
                'subject': '【緊急】{{ project_name }} - ステージ遅延が発生',
                'html': '''
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="border-left: 4px solid #dc3545; padding-left: 20px; margin-bottom: 25px;">
                            <h2 style="color: #dc3545; margin: 0 0 10px 0;">🚨 ステージ遅延が発生しています</h2>
                            <p style="color: #666; margin: 0; font-size: 14px;">{{ created_at.strftime('%Y年%m月%d日 %H:%M') }}</p>
                        </div>
                        
                        <div style="background-color: #f8d7da; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545; margin-bottom: 25px;">
                            <p style="margin: 0; color: #721c24; font-weight: bold;">
                                📅 遅延: {{ metadata.delay_days }}日
                            </p>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <h3 style="color: #333; margin: 0 0 15px 0;">プロジェクト情報</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">プロジェクト:</td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ metadata.project_name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">ステージ名:</td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ metadata.stage_name }}</td>
                                </tr>
                                {% if metadata.reason %}
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">遅延理由:</td>
                                    <td style="padding: 8px 0;">{{ metadata.reason }}</td>
                                </tr>
                                {% endif %}
                            </table>
                        </div>
                        
                        {% if action_url %}
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{ action_url }}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">プロジェクトを確認する</a>
                        </div>
                        {% endif %}
                        
                        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                            <p>このメールは Dandori TODO System から自動送信されています。</p>
                        </div>
                    </div>
                </div>
                '''
            },
            
            NotificationTypeEnum.HANDOFF_REQUEST: {
                'subject': '【引き継ぎ要求】{{ project_name }} - {{ metadata.from_role }}から{{ metadata.to_role }}への引き継ぎ',
                'html': '''
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="border-left: 4px solid #28a745; padding-left: 20px; margin-bottom: 25px;">
                            <h2 style="color: #28a745; margin: 0 0 10px 0;">🤝 引き継ぎ要求があります</h2>
                            <p style="color: #666; margin: 0; font-size: 14px;">{{ created_at.strftime('%Y年%m月%d日 %H:%M') }}</p>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <h3 style="color: #333; margin: 0 0 15px 0;">引き継ぎ情報</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">プロジェクト:</td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ metadata.project_name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">引き継ぎ元:</td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ metadata.from_role }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">引き継ぎ先:</td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ metadata.to_role }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">タスク数:</td>
                                    <td style="padding: 8px 0;">{{ metadata.task_count }}件</td>
                                </tr>
                            </table>
                        </div>
                        
                        {% if action_url %}
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{ action_url }}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">引き継ぎを確認する</a>
                        </div>
                        {% endif %}
                        
                        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                            <p>このメールは Dandori TODO System から自動送信されています。</p>
                        </div>
                    </div>
                </div>
                '''
            }
        }
    
    def _get_template(self, notification_type: NotificationTypeEnum) -> Dict[str, str]:
        """Get email template for notification type"""
        return self.templates.get(notification_type, self.templates[NotificationTypeEnum.TASK_ASSIGNED])
    
    def _render_template(self, template_string: str, context: Dict[str, Any]) -> str:
        """Render Jinja2 template with context"""
        template = Template(template_string)
        return template.render(**context)
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email using SMTP"""
        if not self.sender_email or not self.sender_password:
            logger.warning("Email credentials not configured")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.sender_name} <{self.sender_email}>"
            msg['To'] = to_email
            
            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, 'plain', 'utf-8')
                msg.attach(text_part)
            
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    async def send_notification_email(
        self,
        notification: Notification,
        recipient_email: str
    ) -> bool:
        """Send notification as email"""
        try:
            # Get template for notification type
            template = self._get_template(notification.type)
            
            # Prepare template context
            context = {
                'title': notification.title,
                'message': notification.message,
                'priority': notification.priority,
                'action_url': notification.action_url,
                'metadata': notification.metadata or {},
                'created_at': notification.created_at,
                'notification_type': notification.type
            }
            
            # Render templates
            subject = self._render_template(template['subject'], context)
            html_content = self._render_template(template['html'], context)
            
            # Create simple text version
            text_content = f"""
{notification.title}

{notification.message}

プロジェクト: {context['metadata'].get('project_name', 'N/A')}
優先度: {notification.priority}
作成日時: {notification.created_at.strftime('%Y年%m月%d日 %H:%M')}

{notification.action_url if notification.action_url else ''}

---
このメールは Dandori TODO System から自動送信されています。
            """.strip()
            
            # Send email
            success = await self.send_email(
                to_email=recipient_email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send notification email: {e}")
            return False
    
    async def send_bulk_notification_emails(
        self,
        notifications: List[Notification],
        recipient_emails: Dict[str, str]  # user_id -> email mapping
    ) -> List[bool]:
        """Send multiple notification emails concurrently"""
        tasks = []
        for notification in notifications:
            recipient_email = recipient_emails.get(str(notification.recipient_id))
            if recipient_email:
                tasks.append(
                    self.send_notification_email(notification, recipient_email)
                )
        
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            return [isinstance(result, bool) and result for result in results]
        
        return []
    
    def test_connection(self) -> bool:
        """Test SMTP connection"""
        if not self.sender_email or not self.sender_password:
            logger.warning("Email credentials not configured")
            return False
        
        try:
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
            
            logger.info("Email connection test successful")
            return True
            
        except Exception as e:
            logger.error(f"Email connection test failed: {e}")
            return False


# Global email service instance
email_service = EmailService()