import { useNotificationStore, NotificationType, NotificationPriority } from '@/stores/notificationStore';

// 通知を生成するヘルパー関数
export const notificationHelpers = {
  // タスク割り当て通知
  taskAssigned: (taskName: string, projectName: string, assignedBy: string) => {
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'task_assigned',
      priority: 'medium',
      title: '新しいタスクが割り当てられました',
      message: `${assignedBy}さんから「${taskName}」が割り当てられました`,
      actionUrl: `/projects/${encodeURIComponent(projectName)}`,
      fromUser: {
        id: 'user1',
        name: assignedBy,
        role: '営業',
      },
      relatedProject: {
        id: 'proj1',
        name: projectName,
      },
    });
  },

  // タスク期限通知
  taskDeadline: (taskName: string, projectName: string, hoursRemaining: number) => {
    const { addNotification } = useNotificationStore.getState();
    let priority: NotificationPriority = 'low';
    let title = '';
    
    if (hoursRemaining <= 0) {
      priority = 'urgent';
      title = '⚠️ タスクの期限が過ぎています';
    } else if (hoursRemaining <= 24) {
      priority = 'high';
      title = '⏰ タスクの期限が迫っています';
    } else if (hoursRemaining <= 72) {
      priority = 'medium';
      title = 'タスクの期限が近づいています';
    } else {
      priority = 'low';
      title = 'タスクの期限リマインダー';
    }
    
    addNotification({
      type: 'task_deadline',
      priority,
      title,
      message: `「${taskName}」の期限まで${hoursRemaining > 0 ? `あと${Math.floor(hoursRemaining)}時間` : '期限超過'}`,
      actionUrl: `/projects/${encodeURIComponent(projectName)}`,
      relatedProject: {
        id: 'proj1',
        name: projectName,
      },
    });
  },

  // ステージ完了通知
  stageCompleted: (stageName: string, projectName: string, completedBy: string) => {
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'stage_completed',
      priority: 'low',
      title: 'ステージが完了しました',
      message: `${completedBy}さんが「${stageName}」を完了しました`,
      actionUrl: `/projects/${encodeURIComponent(projectName)}`,
      fromUser: {
        id: 'user1',
        name: completedBy,
        role: '工務',
      },
      relatedProject: {
        id: 'proj1',
        name: projectName,
        stage: stageName,
      },
    });
  },

  // ステージ遅延通知
  stageDelayed: (stageName: string, projectName: string, delayDays: number, reason?: string) => {
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'stage_delayed',
      priority: delayDays > 7 ? 'urgent' : 'high',
      title: '🚨 ステージ遅延が発生しています',
      message: `「${stageName}」が${delayDays}日遅延しています${reason ? `（理由: ${reason}）` : ''}`,
      actionUrl: `/projects/${encodeURIComponent(projectName)}`,
      relatedProject: {
        id: 'proj1',
        name: projectName,
        stage: stageName,
      },
      metadata: {
        delayDays,
        reason,
      },
    });
  },

  // 引き継ぎ要求通知
  handoffRequest: (fromRole: string, toRole: string, projectName: string, taskCount: number) => {
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'handoff_request',
      priority: 'high',
      title: '引き継ぎ要求があります',
      message: `${fromRole}から${toRole}への引き継ぎ（${taskCount}件のタスク）`,
      actionUrl: `/projects/${encodeURIComponent(projectName)}`,
      relatedProject: {
        id: 'proj1',
        name: projectName,
      },
      metadata: {
        fromRole,
        toRole,
        taskCount,
      },
    });
  },

  // 引き継ぎ完了通知
  handoffCompleted: (fromRole: string, toRole: string, projectName: string) => {
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'handoff_completed',
      priority: 'medium',
      title: '引き継ぎが完了しました',
      message: `${fromRole}から${toRole}への引き継ぎが正常に完了しました`,
      actionUrl: `/projects/${encodeURIComponent(projectName)}`,
      relatedProject: {
        id: 'proj1',
        name: projectName,
      },
    });
  },

  // プロジェクトマイルストーン通知
  projectMilestone: (milestoneName: string, projectName: string, daysUntil: number) => {
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'project_milestone',
      priority: daysUntil <= 7 ? 'high' : 'medium',
      title: '🎯 重要マイルストーンが近づいています',
      message: `「${milestoneName}」まであと${daysUntil}日（${projectName}）`,
      actionUrl: `/projects/${encodeURIComponent(projectName)}`,
      relatedProject: {
        id: 'proj1',
        name: projectName,
      },
      metadata: {
        milestoneName,
        daysUntil,
      },
    });
  },

  // ボトルネック警告通知
  bottleneckAlert: (role: string, taskName: string, impactCount: number, severity: 'medium' | 'high' | 'critical') => {
    const { addNotification } = useNotificationStore.getState();
    const priorityMap = {
      medium: 'high' as NotificationPriority,
      high: 'urgent' as NotificationPriority,
      critical: 'urgent' as NotificationPriority,
    };
    
    addNotification({
      type: 'bottleneck_alert',
      priority: priorityMap[severity],
      title: '⚠️ ボトルネックが検出されました',
      message: `${role}の「${taskName}」が${impactCount}件のプロジェクトに影響しています`,
      actionUrl: '/analytics',
      metadata: {
        role,
        taskName,
        impactCount,
        severity,
      },
    });
  },

  // 承認要求通知
  approvalRequired: (itemName: string, requestedBy: string, urgency: 'normal' | 'urgent') => {
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'approval_required',
      priority: urgency === 'urgent' ? 'urgent' : 'high',
      title: urgency === 'urgent' ? '🔴 緊急承認要求' : '承認が必要です',
      message: `${requestedBy}さんから「${itemName}」の承認要求があります`,
      actionUrl: '/approvals',
      actionLabel: '承認する',
      fromUser: {
        id: 'user1',
        name: requestedBy,
        role: '設計',
      },
    });
  },

  // システム更新通知
  systemUpdate: (updateType: 'feature' | 'maintenance' | 'bug_fix', description: string) => {
    const { addNotification } = useNotificationStore.getState();
    const titles = {
      feature: '✨ 新機能が追加されました',
      maintenance: 'システムメンテナンスのお知らせ',
      bug_fix: '不具合が修正されました',
    };
    
    addNotification({
      type: 'system_update',
      priority: 'low',
      title: titles[updateType],
      message: description,
      actionUrl: '/updates',
    });
  },

  // メンション通知
  mention: (mentionedBy: string, context: string, projectName?: string) => {
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'mention',
      priority: 'medium',
      title: `@${mentionedBy}さんからメンション`,
      message: context,
      actionUrl: projectName ? `/projects/${encodeURIComponent(projectName)}` : '/messages',
      fromUser: {
        id: 'user1',
        name: mentionedBy,
        role: 'IC',
      },
      relatedProject: projectName ? {
        id: 'proj1',
        name: projectName,
      } : undefined,
    });
  },

  // コメント通知
  comment: (commentBy: string, itemName: string, comment: string, projectName?: string) => {
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'comment',
      priority: 'low',
      title: '新しいコメント',
      message: `${commentBy}さん: ${comment}`,
      actionUrl: projectName ? `/projects/${encodeURIComponent(projectName)}` : '/comments',
      fromUser: {
        id: 'user1',
        name: commentBy,
        role: '営業',
      },
      relatedProject: projectName ? {
        id: 'proj1',
        name: projectName,
      } : undefined,
      metadata: {
        itemName,
        comment,
      },
    });
  },
};

// 定期的な通知チェック（実際のAPIと連携する場合に使用）
export const startNotificationPolling = (interval: number = 30000) => {
  const checkNotifications = async () => {
    try {
      // APIから新しい通知を取得
      // const response = await fetch('/api/notifications/unread');
      // const data = await response.json();
      
      // デモ用：ランダムに通知を生成
      if (Math.random() > 0.8) {
        const demoNotifications = [
          () => notificationHelpers.taskAssigned('基礎工事チェック', '田中様邸新築工事', '山田太郎'),
          () => notificationHelpers.taskDeadline('実施設計図書作成', '佐藤様邸新築工事', 12),
          () => notificationHelpers.stageDelayed('上棟', '鈴木様邸新築工事', 3, '資材納期遅延'),
          () => notificationHelpers.handoffRequest('設計', 'IC', '高橋様邸新築工事', 5),
          () => notificationHelpers.bottleneckAlert('IC', '配線計画', 4, 'high'),
          () => notificationHelpers.projectMilestone('基礎着工', '伊藤様邸新築工事', 3),
        ];
        
        const randomNotification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
        randomNotification();
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };
  
  // 初回実行
  checkNotifications();
  
  // 定期実行
  const intervalId = setInterval(checkNotifications, interval);
  
  // クリーンアップ関数を返す
  return () => clearInterval(intervalId);
};

// 通知音の初期化
export const initializeNotificationSound = () => {
  // 通知音ファイルをプリロード
  const audio = new Audio('/notification-sound.mp3');
  audio.volume = 0;
  audio.play().catch(() => {
    // ユーザーインタラクションなしでは再生できない場合がある
    console.log('Notification sound preload requires user interaction');
  });
};