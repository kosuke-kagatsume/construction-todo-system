import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Chip,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Stack,
  Alert,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  NotificationsOff,
  MarkEmailRead,
  Delete,
  Settings,
  Close,
  CheckCircle,
  Warning,
  Error,
  Info,
  Person,
  Assignment,
  SwapHoriz,
  Block,
  Update,
  Comment,
  AlternateEmail,
  VolumeUp,
  VolumeOff,
  Schedule,
  FiberManualRecord,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useNotificationStore, NotificationType, NotificationPriority } from '@/stores/notificationStore';
import { useRouter } from 'next/router';

// 通知タイプのアイコンマップ
const notificationIcons: Record<NotificationType, React.ReactElement> = {
  task_assigned: <Assignment />,
  task_deadline: <Schedule />,
  stage_completed: <CheckCircle />,
  stage_delayed: <Warning />,
  handoff_request: <SwapHoriz />,
  handoff_completed: <SwapHoriz />,
  project_milestone: <FiberManualRecord />,
  bottleneck_alert: <Block />,
  approval_required: <Info />,
  system_update: <Update />,
  mention: <AlternateEmail />,
  comment: <Comment />,
};

// 優先度の色マップ
const priorityColors: Record<NotificationPriority, 'default' | 'info' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
};

// 通知タイプの日本語ラベル
const notificationTypeLabels: Record<NotificationType, string> = {
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

export const NotificationCenter: React.FC = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    notifications,
    unreadCount,
    preferences,
    soundEnabled,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    toggleSound,
    getUnreadNotifications,
    requestPermission,
    updatePreferences,
  } = useNotificationStore();
  
  const open = Boolean(anchorEl);
  const unreadNotifications = getUnreadNotifications();
  
  // 初回マウント時に通知許可をリクエスト
  useEffect(() => {
    if (preferences.enableDesktopNotifications) {
      requestPermission();
    }
  }, []);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
    setShowSettings(false);
  };
  
  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      handleClose();
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  
  const filteredNotifications = selectedTab === 0 
    ? notifications 
    : unreadNotifications;
  
  const NotificationItem = ({ notification }: { notification: typeof notifications[0] }) => {
    const isUnread = !notification.read;
    
    return (
      <ListItem
        button
        onClick={() => handleNotificationClick(notification)}
        sx={{
          backgroundColor: isUnread ? 'action.hover' : 'transparent',
          '&:hover': {
            backgroundColor: 'action.selected',
          },
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: isUnread ? `${priorityColors[notification.priority]}.main` : 'grey.400',
              width: 36,
              height: 36,
            }}
          >
            {notificationIcons[notification.type]}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isUnread ? 600 : 400,
                  flex: 1,
                  mr: 1,
                }}
              >
                {notification.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(notification.timestamp), {
                  addSuffix: true,
                  locale: ja,
                })}
              </Typography>
            </Box>
          }
          secondary={
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 0.5,
                }}
              >
                {notification.message}
              </Typography>
              <Box display="flex" gap={0.5} alignItems="center">
                <Chip
                  label={notificationTypeLabels[notification.type]}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
                {notification.relatedProject && (
                  <Chip
                    label={notification.relatedProject.name}
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                {notification.fromUser && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Person sx={{ fontSize: 14 }} />
                    <Typography variant="caption">
                      {notification.fromUser.name}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          }
        />
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
          }}
          sx={{ ml: 1 }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </ListItem>
    );
  };
  
  const SettingsPanel = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        通知設定
      </Typography>
      
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.enableDesktopNotifications}
              onChange={(e) => updatePreferences({ enableDesktopNotifications: e.target.checked })}
            />
          }
          label="デスクトップ通知"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={soundEnabled}
              onChange={toggleSound}
            />
          }
          label="通知音"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={preferences.quietHours.enabled}
              onChange={(e) => updatePreferences({
                quietHours: { ...preferences.quietHours, enabled: e.target.checked }
              })}
            />
          }
          label="勤務時間外は通知を制限"
        />
        
        {preferences.quietHours.enabled && (
          <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
            {preferences.quietHours.startTime} - {preferences.quietHours.endTime} は通知を制限
            {preferences.quietHours.allowUrgent && '（緊急通知は除く）'}
          </Alert>
        )}
        
        <Button
          variant="outlined"
          size="small"
          startIcon={<Settings />}
          onClick={() => router.push('/settings/notifications')}
        >
          詳細設定
        </Button>
      </Stack>
    </Box>
  );
  
  return (
    <>
      <Tooltip title="通知">
        <IconButton
          onClick={handleClick}
          color="inherit"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: unreadCount > 0 ? 'error.main' : 'transparent',
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? (
              <NotificationsActive />
            ) : (
              <Notifications />
            )}
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 420,
            maxHeight: 600,
          },
        }}
      >
        <Box>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6">
              通知センター
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title={soundEnabled ? '通知音オン' : '通知音オフ'}>
                <IconButton size="small" onClick={toggleSound}>
                  {soundEnabled ? <VolumeUp /> : <VolumeOff />}
                </IconButton>
              </Tooltip>
              <Tooltip title="設定">
                <IconButton
                  size="small"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings />
                </IconButton>
              </Tooltip>
              <Tooltip title="閉じる">
                <IconButton size="small" onClick={handleClose}>
                  <Close />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {showSettings ? (
            <SettingsPanel />
          ) : (
            <>
              {/* Tabs */}
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label={`すべて (${notifications.length})`} />
                <Tab label={`未読 (${unreadCount})`} />
              </Tabs>
              
              {/* Actions */}
              {filteredNotifications.length > 0 && (
                <Box
                  sx={{
                    p: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    size="small"
                    startIcon={<MarkEmailRead />}
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    すべて既読
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    onClick={clearAll}
                    color="error"
                  >
                    すべて削除
                  </Button>
                </Box>
              )}
              
              {/* Notification List */}
              <List
                sx={{
                  maxHeight: 400,
                  overflow: 'auto',
                  py: 0,
                }}
              >
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <NotificationItem notification={notification} />
                      {index < filteredNotifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    <NotificationsOff sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="body2">
                      {selectedTab === 0 ? '通知はありません' : '未読の通知はありません'}
                    </Typography>
                  </Box>
                )}
              </List>
            </>
          )}
        </Box>
      </Popover>
    </>
  );
};