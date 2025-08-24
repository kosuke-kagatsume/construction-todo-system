import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Notifications,
  VolumeUp,
  VolumeOff,
  Email,
  PhonelinkRing,
  Schedule,
  Save,
  Refresh,
  Info,
  Warning,
  Error,
  CheckCircle,
} from '@mui/icons-material';
import { useNotificationStore, NotificationType, NotificationPriority } from '@/stores/notificationStore';
import { notificationHelpers } from '@/utils/notificationHelpers';

// 通知タイプの設定情報
const notificationTypeConfig = {
  task_assigned: {
    label: 'タスク割り当て',
    description: '新しいタスクが割り当てられたとき',
    icon: '📋',
    category: 'タスク',
  },
  task_deadline: {
    label: 'タスク期限',
    description: 'タスクの期限が迫っているとき',
    icon: '⏰',
    category: 'タスク',
  },
  stage_completed: {
    label: 'ステージ完了',
    description: 'ステージが完了したとき',
    icon: '✅',
    category: 'プロジェクト',
  },
  stage_delayed: {
    label: 'ステージ遅延',
    description: 'ステージに遅延が発生したとき',
    icon: '🚨',
    category: 'プロジェクト',
  },
  handoff_request: {
    label: '引き継ぎ要求',
    description: '他の役割から引き継ぎ要求があったとき',
    icon: '🔄',
    category: '引き継ぎ',
  },
  handoff_completed: {
    label: '引き継ぎ完了',
    description: '引き継ぎが完了したとき',
    icon: '✔️',
    category: '引き継ぎ',
  },
  project_milestone: {
    label: 'マイルストーン',
    description: '重要なマイルストーンが近づいているとき',
    icon: '🎯',
    category: 'プロジェクト',
  },
  bottleneck_alert: {
    label: 'ボトルネック警告',
    description: 'ボトルネックが検出されたとき',
    icon: '⚠️',
    category: 'システム',
  },
  approval_required: {
    label: '承認要求',
    description: '承認が必要な項目があるとき',
    icon: '✋',
    category: '承認',
  },
  system_update: {
    label: 'システム更新',
    description: 'システムの更新情報があるとき',
    icon: '🔄',
    category: 'システム',
  },
  mention: {
    label: 'メンション',
    description: '他のユーザーからメンションされたとき',
    icon: '@',
    category: 'コミュニケーション',
  },
  comment: {
    label: 'コメント',
    description: '新しいコメントが追加されたとき',
    icon: '💬',
    category: 'コミュニケーション',
  },
};

const priorityLabels: Record<NotificationPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
};

const priorityColors: Record<NotificationPriority, 'default' | 'info' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
};

export default function NotificationSettings() {
  const {
    preferences,
    updatePreferences,
    updateTypePreference,
    requestPermission,
  } = useNotificationStore();

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      updatePreferences({ enableDesktopNotifications: true });
    }
  };

  const testNotifications = [
    {
      label: 'タスク割り当て',
      action: () => notificationHelpers.taskAssigned('基礎工事チェック', '田中様邸新築工事', '山田太郎'),
    },
    {
      label: 'タスク期限',
      action: () => notificationHelpers.taskDeadline('実施設計図書作成', '佐藤様邸新築工事', 12),
    },
    {
      label: 'ステージ遅延',
      action: () => notificationHelpers.stageDelayed('上棟', '鈴木様邸新築工事', 3, '資材納期遅延'),
    },
    {
      label: 'ボトルネック',
      action: () => notificationHelpers.bottleneckAlert('IC', '配線計画', 4, 'high'),
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            通知設定
          </Typography>
          <Typography variant="body1" color="text.secondary">
            建築現場の重要な更新情報を受信する方法を設定します
          </Typography>
        </Box>

        {saved && (
          <Alert severity="success" sx={{ mb: 3 }}>
            設定が保存されました
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* 全体設定 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="通知方法"
                avatar={<Notifications color="primary" />}
              />
              <CardContent>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.enableDesktopNotifications}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handlePermissionRequest();
                          } else {
                            updatePreferences({ enableDesktopNotifications: false });
                          }
                        }}
                      />
                    }
                    label="デスクトップ通知"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.enableSoundNotifications}
                        onChange={(e) => updatePreferences({ enableSoundNotifications: e.target.checked })}
                      />
                    }
                    label="通知音"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.enableEmailNotifications}
                        onChange={(e) => updatePreferences({ enableEmailNotifications: e.target.checked })}
                      />
                    }
                    label="メール通知（開発中）"
                    disabled
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.enablePushNotifications}
                        onChange={(e) => updatePreferences({ enablePushNotifications: e.target.checked })}
                      />
                    }
                    label="プッシュ通知（開発中）"
                    disabled
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* 勤務時間外設定 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="勤務時間外の通知"
                avatar={<Schedule color="primary" />}
              />
              <CardContent>
                <Stack spacing={2}>
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
                    <>
                      <Box display="flex" gap={2}>
                        <TextField
                          label="開始時刻"
                          type="time"
                          value={preferences.quietHours.startTime}
                          onChange={(e) => updatePreferences({
                            quietHours: { ...preferences.quietHours, startTime: e.target.value }
                          })}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="終了時刻"
                          type="time"
                          value={preferences.quietHours.endTime}
                          onChange={(e) => updatePreferences({
                            quietHours: { ...preferences.quietHours, endTime: e.target.value }
                          })}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.quietHours.allowUrgent}
                            onChange={(e) => updatePreferences({
                              quietHours: { ...preferences.quietHours, allowUrgent: e.target.checked }
                            })}
                          />
                        }
                        label="緊急通知は制限時間中でも表示"
                      />
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* 通知タイプ別設定 */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="通知タイプ別設定"
                action={
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                  >
                    設定を保存
                  </Button>
                }
              />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>通知タイプ</TableCell>
                        <TableCell>有効</TableCell>
                        <TableCell>デスクトップ</TableCell>
                        <TableCell>音</TableCell>
                        <TableCell>最小優先度</TableCell>
                        <TableCell>テスト</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(notificationTypeConfig).map(([type, config]) => {
                        const typePrefs = preferences.preferences[type as NotificationType];
                        return (
                          <TableRow key={type}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2">
                                  {config.icon}
                                </Typography>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {config.label}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {config.description}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={typePrefs.enabled}
                                onChange={(e) => updateTypePreference(type as NotificationType, {
                                  enabled: e.target.checked
                                })}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={typePrefs.desktop}
                                onChange={(e) => updateTypePreference(type as NotificationType, {
                                  desktop: e.target.checked
                                })}
                                disabled={!typePrefs.enabled}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={typePrefs.sound}
                                onChange={(e) => updateTypePreference(type as NotificationType, {
                                  sound: e.target.checked
                                })}
                                disabled={!typePrefs.enabled}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <FormControl size="small" sx={{ minWidth: 80 }}>
                                <Select
                                  value={typePrefs.minimumPriority}
                                  onChange={(e) => updateTypePreference(type as NotificationType, {
                                    minimumPriority: e.target.value as NotificationPriority
                                  })}
                                  disabled={!typePrefs.enabled}
                                >
                                  {(['low', 'medium', 'high', 'urgent'] as NotificationPriority[]).map(priority => (
                                    <MenuItem key={priority} value={priority}>
                                      <Chip
                                        label={priorityLabels[priority]}
                                        size="small"
                                        color={priorityColors[priority]}
                                      />
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              {testNotifications.find(t => t.label.includes(config.label.slice(0, 3))) && (
                                <Tooltip title="テスト通知を送信">
                                  <IconButton
                                    size="small"
                                    onClick={testNotifications.find(t => t.label.includes(config.label.slice(0, 3)))?.action}
                                  >
                                    <Refresh />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* テスト用パネル */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="通知テスト"
                avatar={<Refresh color="primary" />}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  各種通知をテストして、設定が正しく動作することを確認できます
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {testNotifications.map((test, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      onClick={test.action}
                      size="small"
                    >
                      {test.label}をテスト
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
}