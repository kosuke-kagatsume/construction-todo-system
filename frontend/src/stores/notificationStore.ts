import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 
  | 'task_assigned'      // タスク割り当て
  | 'task_deadline'      // タスク期限
  | 'stage_completed'    // ステージ完了
  | 'stage_delayed'      // ステージ遅延
  | 'handoff_request'    // 引き継ぎ要求
  | 'handoff_completed'  // 引き継ぎ完了
  | 'project_milestone'  // プロジェクトマイルストーン
  | 'bottleneck_alert'   // ボトルネック警告
  | 'approval_required'  // 承認要求
  | 'system_update'      // システム更新
  | 'mention'           // メンション
  | 'comment';          // コメント

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  fromUser?: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  relatedProject?: {
    id: string;
    name: string;
    stage?: string;
  };
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  enableDesktopNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSoundNotifications: boolean;
  enablePushNotifications: boolean;
  
  // 通知タイプ別の設定
  preferences: {
    [key in NotificationType]: {
      enabled: boolean;
      desktop: boolean;
      email: boolean;
      sound: boolean;
      push: boolean;
      minimumPriority: NotificationPriority;
    };
  };
  
  // 勤務時間外の通知設定
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
    allowUrgent: boolean;
  };
  
  // 通知グループ化設定
  grouping: {
    enabled: boolean;
    timeWindow: number; // minutes
  };
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  soundEnabled: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  clearOldNotifications: (daysToKeep: number) => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  updateTypePreference: (type: NotificationType, settings: Partial<NotificationPreferences['preferences'][NotificationType]>) => void;
  toggleSound: () => void;
  
  // Filtering
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[];
  getUnreadNotifications: () => Notification[];
  getRecentNotifications: (hours: number) => Notification[];
  
  // Utilities
  requestPermission: () => Promise<boolean>;
  showDesktopNotification: (notification: Notification) => void;
  playNotificationSound: () => void;
}

// デフォルトの通知設定
const defaultPreferences: NotificationPreferences = {
  enableDesktopNotifications: true,
  enableEmailNotifications: false,
  enableSoundNotifications: true,
  enablePushNotifications: false,
  
  preferences: {
    task_assigned: {
      enabled: true,
      desktop: true,
      email: false,
      sound: true,
      push: true,
      minimumPriority: 'medium',
    },
    task_deadline: {
      enabled: true,
      desktop: true,
      email: true,
      sound: true,
      push: true,
      minimumPriority: 'high',
    },
    stage_completed: {
      enabled: true,
      desktop: false,
      email: false,
      sound: false,
      push: false,
      minimumPriority: 'low',
    },
    stage_delayed: {
      enabled: true,
      desktop: true,
      email: true,
      sound: true,
      push: true,
      minimumPriority: 'high',
    },
    handoff_request: {
      enabled: true,
      desktop: true,
      email: false,
      sound: true,
      push: true,
      minimumPriority: 'high',
    },
    handoff_completed: {
      enabled: true,
      desktop: false,
      email: false,
      sound: false,
      push: false,
      minimumPriority: 'medium',
    },
    project_milestone: {
      enabled: true,
      desktop: true,
      email: false,
      sound: false,
      push: false,
      minimumPriority: 'medium',
    },
    bottleneck_alert: {
      enabled: true,
      desktop: true,
      email: true,
      sound: true,
      push: true,
      minimumPriority: 'urgent',
    },
    approval_required: {
      enabled: true,
      desktop: true,
      email: false,
      sound: true,
      push: true,
      minimumPriority: 'high',
    },
    system_update: {
      enabled: true,
      desktop: false,
      email: false,
      sound: false,
      push: false,
      minimumPriority: 'low',
    },
    mention: {
      enabled: true,
      desktop: true,
      email: false,
      sound: true,
      push: true,
      minimumPriority: 'medium',
    },
    comment: {
      enabled: true,
      desktop: false,
      email: false,
      sound: false,
      push: false,
      minimumPriority: 'low',
    },
  },
  
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    allowUrgent: true,
  },
  
  grouping: {
    enabled: true,
    timeWindow: 5,
  },
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      preferences: defaultPreferences,
      soundEnabled: true,
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false,
        };
        
        set((state) => {
          const notifications = [newNotification, ...state.notifications];
          const unreadCount = notifications.filter(n => !n.read).length;
          
          // 通知設定を確認
          const typePrefs = state.preferences.preferences[notification.type];
          if (typePrefs.enabled) {
            // デスクトップ通知
            if (typePrefs.desktop && state.preferences.enableDesktopNotifications) {
              get().showDesktopNotification(newNotification);
            }
            
            // サウンド再生
            if (typePrefs.sound && state.preferences.enableSoundNotifications && state.soundEnabled) {
              get().playNotificationSound();
            }
          }
          
          return { notifications, unreadCount };
        });
      },
      
      markAsRead: (id) => {
        set((state) => {
          const notifications = state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          );
          const unreadCount = notifications.filter(n => !n.read).length;
          return { notifications, unreadCount };
        });
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      
      deleteNotification: (id) => {
        set((state) => {
          const notifications = state.notifications.filter(n => n.id !== id);
          const unreadCount = notifications.filter(n => !n.read).length;
          return { notifications, unreadCount };
        });
      },
      
      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
      
      clearOldNotifications: (daysToKeep) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        set((state) => {
          const notifications = state.notifications.filter(
            n => new Date(n.timestamp) > cutoffDate
          );
          const unreadCount = notifications.filter(n => !n.read).length;
          return { notifications, unreadCount };
        });
      },
      
      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        }));
      },
      
      updateTypePreference: (type, settings) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            preferences: {
              ...state.preferences.preferences,
              [type]: {
                ...state.preferences.preferences[type],
                ...settings,
              },
            },
          },
        }));
      },
      
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },
      
      getNotificationsByType: (type) => {
        return get().notifications.filter(n => n.type === type);
      },
      
      getNotificationsByPriority: (priority) => {
        return get().notifications.filter(n => n.priority === priority);
      },
      
      getUnreadNotifications: () => {
        return get().notifications.filter(n => !n.read);
      },
      
      getRecentNotifications: (hours) => {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - hours);
        return get().notifications.filter(n => new Date(n.timestamp) > cutoff);
      },
      
      requestPermission: async () => {
        if (!('Notification' in window)) {
          console.log('This browser does not support desktop notification');
          return false;
        }
        
        if (Notification.permission === 'granted') {
          return true;
        }
        
        if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        
        return false;
      },
      
      showDesktopNotification: (notification) => {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        
        // 勤務時間外チェック
        const prefs = get().preferences;
        if (prefs.quietHours.enabled) {
          const now = new Date();
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          const { startTime, endTime, allowUrgent } = prefs.quietHours;
          
          // 時間範囲内かチェック（日付をまたぐ場合も考慮）
          const isQuietTime = startTime > endTime
            ? currentTime >= startTime || currentTime <= endTime
            : currentTime >= startTime && currentTime <= endTime;
          
          if (isQuietTime && (!allowUrgent || notification.priority !== 'urgent')) {
            return;
          }
        }
        
        const options: NotificationOptions = {
          body: notification.message,
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          tag: notification.type,
          requireInteraction: notification.priority === 'urgent',
          silent: false,
          data: {
            url: notification.actionUrl,
            id: notification.id,
          },
        };
        
        const desktopNotification = new Notification(notification.title, options);
        
        desktopNotification.onclick = () => {
          window.focus();
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
          }
          get().markAsRead(notification.id);
          desktopNotification.close();
        };
      },
      
      playNotificationSound: () => {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Could not play notification sound:', e));
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 100), // 最新100件のみ保存
        preferences: state.preferences,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);