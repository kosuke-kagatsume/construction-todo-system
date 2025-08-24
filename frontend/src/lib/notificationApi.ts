import { api } from './api';

// API interfaces for notifications
export interface NotificationResponse {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  is_read: boolean;
  is_delivered: boolean;
  action_url?: string;
  action_label?: string;
  created_at: string;
  updated_at: string;
  read_at?: string;
  delivered_at?: string;
  metadata?: Record<string, any>;
  sender_name?: string;
  project_name?: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  total: number;
  unread_count: number;
  has_more: boolean;
}

export interface NotificationPreferencesResponse {
  id: string;
  user_id: string;
  enable_desktop_notifications: boolean;
  enable_email_notifications: boolean;
  enable_sound_notifications: boolean;
  enable_push_notifications: boolean;
  type_preferences?: Record<string, any>;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  allow_urgent_in_quiet_hours: boolean;
  grouping_enabled: boolean;
  grouping_time_window: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  recent_count: number;
}

export interface NotificationPreferencesUpdate {
  enable_desktop_notifications?: boolean;
  enable_email_notifications?: boolean;
  enable_sound_notifications?: boolean;
  enable_push_notifications?: boolean;
  type_preferences?: Record<string, any>;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  allow_urgent_in_quiet_hours?: boolean;
  grouping_enabled?: boolean;
  grouping_time_window?: number;
}

// Construction-specific notification interfaces
export interface TaskAssignedNotification {
  task_name: string;
  project_name: string;
  assigned_by: string;
  recipient_id: string;
  project_id: string;
  task_id?: string;
}

export interface TaskDeadlineNotification {
  task_name: string;
  project_name: string;
  hours_remaining: number;
  recipient_id: string;
  project_id: string;
  task_id?: string;
}

export interface StageCompletedNotification {
  stage_name: string;
  project_name: string;
  completed_by: string;
  recipient_ids: string[];
  project_id: string;
  stage_id?: string;
}

export interface StageDelayedNotification {
  stage_name: string;
  project_name: string;
  delay_days: number;
  reason?: string;
  recipient_ids: string[];
  project_id: string;
  stage_id?: string;
}

export interface HandoffRequestNotification {
  from_role: string;
  to_role: string;
  project_name: string;
  task_count: number;
  recipient_ids: string[];
  project_id: string;
}

export interface BottleneckAlertNotification {
  role: string;
  task_name: string;
  impact_count: number;
  severity: 'medium' | 'high' | 'critical';
  recipient_ids: string[];
}

class NotificationApi {
  private readonly baseUrl = '/api/v1/notifications';

  // Basic notification CRUD operations
  async getNotifications(params?: {
    skip?: number;
    limit?: number;
    unread_only?: boolean;
    type_filter?: string;
    priority_filter?: string;
  }): Promise<NotificationListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());
    if (params?.unread_only !== undefined) searchParams.set('unread_only', params.unread_only.toString());
    if (params?.type_filter) searchParams.set('type_filter', params.type_filter);
    if (params?.priority_filter) searchParams.set('priority_filter', params.priority_filter);

    const response = await api.get(`${this.baseUrl}?${searchParams.toString()}`);
    return response.data;
  }

  async getNotification(id: string): Promise<NotificationResponse> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<NotificationResponse> {
    const response = await api.patch(`${this.baseUrl}/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    const response = await api.patch(`${this.baseUrl}/mark-all-read`);
    return response.data;
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Notification statistics
  async getNotificationStats(): Promise<NotificationStats> {
    const response = await api.get(`${this.baseUrl}/stats/summary`);
    return response.data;
  }

  // Notification preferences
  async getNotificationPreferences(): Promise<NotificationPreferencesResponse> {
    const response = await api.get(`${this.baseUrl}/preferences/me`);
    return response.data;
  }

  async updateNotificationPreferences(
    preferences: NotificationPreferencesUpdate
  ): Promise<NotificationPreferencesResponse> {
    const response = await api.patch(`${this.baseUrl}/preferences/me`, preferences);
    return response.data;
  }

  // Construction-specific notification creation methods
  async notifyTaskAssigned(data: TaskAssignedNotification): Promise<{ message: string; notification_id: string }> {
    const response = await api.post(`${this.baseUrl}/construction/task-assigned`, data);
    return response.data;
  }

  async notifyTaskDeadline(data: TaskDeadlineNotification): Promise<{ message: string; notification_id: string }> {
    const response = await api.post(`${this.baseUrl}/construction/task-deadline`, data);
    return response.data;
  }

  async notifyStageCompleted(data: StageCompletedNotification): Promise<{ message: string; count: number }> {
    const response = await api.post(`${this.baseUrl}/construction/stage-completed`, data);
    return response.data;
  }

  async notifyStageDelayed(data: StageDelayedNotification): Promise<{ message: string; count: number }> {
    const response = await api.post(`${this.baseUrl}/construction/stage-delayed`, data);
    return response.data;
  }

  async notifyHandoffRequest(data: HandoffRequestNotification): Promise<{ message: string; count: number }> {
    const response = await api.post(`${this.baseUrl}/construction/handoff-request`, data);
    return response.data;
  }

  async notifyBottleneckAlert(data: BottleneckAlertNotification): Promise<{ message: string; count: number }> {
    const response = await api.post(`${this.baseUrl}/construction/bottleneck-alert`, data);
    return response.data;
  }

  // Admin functions (only for superusers)
  async broadcastSystemMessage(
    message: string,
    userIds?: string[]
  ): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/admin/broadcast`, {
      message,
      user_ids: userIds,
    });
    return response.data;
  }

  async getOnlineUsers(): Promise<{ online_users: string[]; count: number }> {
    const response = await api.get(`${this.baseUrl}/admin/online-users`);
    return response.data;
  }
}

// Export singleton instance
export const notificationApi = new NotificationApi();

// Utility functions for notification handling
export const formatNotificationTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) {
    return 'たった今';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else {
    return date.toLocaleDateString('ja-JP');
  }
};

export const getNotificationIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    task_assigned: '📋',
    task_deadline: '⏰',
    stage_completed: '✅',
    stage_delayed: '🚨',
    handoff_request: '🤝',
    handoff_completed: '✅',
    project_milestone: '🎯',
    bottleneck_alert: '⚠️',
    approval_required: 'ℹ️',
    system_update: '🔄',
    mention: '@',
    comment: '💬',
  };
  return iconMap[type] || '📄';
};

export const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    low: '#4caf50',
    medium: '#2196f3',
    high: '#ff9800',
    urgent: '#f44336',
  };
  return colorMap[priority] || '#2196f3';
};

export const getNotificationTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    task_assigned: 'タスク割当',
    task_deadline: '期限通知',
    stage_completed: 'ステージ完了',
    stage_delayed: 'ステージ遅延',
    handoff_request: '引き継ぎ要求',
    handoff_completed: '引き継ぎ完了',
    project_milestone: 'マイルストーン',
    bottleneck_alert: 'ボトルネック',
    approval_required: '承認要求',
    system_update: 'システム更新',
    mention: 'メンション',
    comment: 'コメント',
  };
  return labelMap[type] || type;
};