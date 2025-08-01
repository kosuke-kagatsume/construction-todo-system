import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Switch,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import {
  Person,
  Business,
  Notifications,
  Security,
  Email,
  Phone,
  Language,
  DarkMode,
  Edit,
  Save,
  Cancel,
  Add,
  Delete,
  CheckCircle,
  Schedule,
  Build,
  AccountTree,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '山田太郎',
    email: 'yamada@construction.co.jp',
    phone: '03-1234-5678',
    role: '営業',
    department: '営業部',
  });

  const [companyData, setCompanyData] = useState({
    name: '〇〇建設株式会社',
    address: '東京都千代田区〇〇1-2-3',
    phone: '03-9876-5432',
    website: 'https://construction.co.jp',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    taskAssigned: true,
    taskCompleted: true,
    phaseChanged: true,
    delayAlert: true,
    commentAdded: false,
    fileUploaded: false,
    emailNotifications: true,
    pushNotifications: false,
  });

  const [themeSettings, setThemeSettings] = useState({
    darkMode: false,
    language: 'ja',
    timezone: 'Asia/Tokyo',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveProfile = () => {
    // TODO: API call to save profile
    console.log('Saving profile:', profileData);
    setEditMode(false);
  };

  const handleNotificationChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: event.target.checked,
    });
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
          設定
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<Person />} label="プロフィール" />
            <Tab icon={<Business />} label="会社情報" />
            <Tab icon={<Notifications />} label="通知設定" />
            <Tab icon={<Security />} label="セキュリティ" />
          </Tabs>
        </Paper>

        {/* プロフィールタブ */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      fontSize: '48px',
                    }}
                  >
                    {profileData.name[0]}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {profileData.name}
                  </Typography>
                  <Chip
                    label={profileData.role}
                    color="primary"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {profileData.department}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    startIcon={<Edit />}
                  >
                    写真を変更
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      プロフィール情報
                    </Typography>
                    {!editMode ? (
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setEditMode(true)}
                      >
                        編集
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={<Save />}
                          onClick={handleSaveProfile}
                        >
                          保存
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={() => setEditMode(false)}
                        >
                          キャンセル
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="氏名"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="メールアドレス"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="電話番号"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="役職"
                        value={profileData.role}
                        onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="部署"
                        value={profileData.department}
                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        disabled={!editMode}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    表示設定
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>言語</InputLabel>
                        <Select
                          value={themeSettings.language}
                          onChange={(e) => setThemeSettings({ ...themeSettings, language: e.target.value })}
                          label="言語"
                        >
                          <MenuItem value="ja">日本語</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>タイムゾーン</InputLabel>
                        <Select
                          value={themeSettings.timezone}
                          onChange={(e) => setThemeSettings({ ...themeSettings, timezone: e.target.value })}
                          label="タイムゾーン"
                        >
                          <MenuItem value="Asia/Tokyo">東京 (JST)</MenuItem>
                          <MenuItem value="Asia/Shanghai">上海 (CST)</MenuItem>
                          <MenuItem value="America/New_York">ニューヨーク (EST)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={themeSettings.darkMode}
                            onChange={(e) => setThemeSettings({ ...themeSettings, darkMode: e.target.checked })}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DarkMode />
                            ダークモード
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 会社情報タブ */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                会社情報
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="会社名"
                    value={companyData.name}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="住所"
                    value={companyData.address}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="電話番号"
                    value={companyData.phone}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ウェブサイト"
                    value={companyData.website}
                    disabled
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                部署一覧
              </Typography>
              <List>
                {['営業部', '設計部', 'IC部', '工務部', '管理部'].map((dept) => (
                  <ListItem key={dept}>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText primary={dept} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                工程テンプレート
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                各フェーズの標準工程と期間を設定できます
              </Alert>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccountTree color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="追客・設計フェーズ"
                    secondary="6工程 / 標準期間: 45日"
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <Edit />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountTree color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="契約フェーズ"
                    secondary="3工程 / 標準期間: 14日"
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <Edit />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountTree color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="打ち合わせフェーズ"
                    secondary="10工程 / 標準期間: 60日"
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <Edit />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountTree color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="施工フェーズ"
                    secondary="17工程 / 標準期間: 120日"
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <Edit />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountTree sx={{ color: '#8b5cf6' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="竣工フェーズ"
                    secondary="4工程 / 標準期間: 21日"
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <Edit />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* 通知設定タブ */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    タスク通知
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.taskAssigned}
                          onChange={handleNotificationChange('taskAssigned')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">タスクが割り当てられたとき</Typography>
                          <Typography variant="caption" color="text.secondary">
                            新しいタスクが自分に割り当てられた際に通知
                          </Typography>
                        </Box>
                      }
                    />
                    <Divider sx={{ my: 1 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.taskCompleted}
                          onChange={handleNotificationChange('taskCompleted')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">タスクが完了したとき</Typography>
                          <Typography variant="caption" color="text.secondary">
                            担当タスクが完了した際に通知
                          </Typography>
                        </Box>
                      }
                    />
                    <Divider sx={{ my: 1 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.phaseChanged}
                          onChange={handleNotificationChange('phaseChanged')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">フェーズが変更されたとき</Typography>
                          <Typography variant="caption" color="text.secondary">
                            プロジェクトのフェーズが進行した際に通知
                          </Typography>
                        </Box>
                      }
                    />
                    <Divider sx={{ my: 1 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.delayAlert}
                          onChange={handleNotificationChange('delayAlert')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">遅延アラート</Typography>
                          <Typography variant="caption" color="text.secondary">
                            タスクの期限が近づいた際に通知
                          </Typography>
                        </Box>
                      }
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    コミュニケーション通知
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.commentAdded}
                          onChange={handleNotificationChange('commentAdded')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">コメントが追加されたとき</Typography>
                          <Typography variant="caption" color="text.secondary">
                            タスクに新しいコメントが追加された際に通知
                          </Typography>
                        </Box>
                      }
                    />
                    <Divider sx={{ my: 1 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.fileUploaded}
                          onChange={handleNotificationChange('fileUploaded')}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">ファイルがアップロードされたとき</Typography>
                          <Typography variant="caption" color="text.secondary">
                            新しいファイルが追加された際に通知
                          </Typography>
                        </Box>
                      }
                    />
                  </FormGroup>
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    通知方法
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange('emailNotifications')}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email />
                          メール通知
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.pushNotifications}
                          onChange={handleNotificationChange('pushNotifications')}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Notifications />
                          プッシュ通知
                        </Box>
                      }
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<Save />}>
              通知設定を保存
            </Button>
          </Box>
        </TabPanel>

        {/* セキュリティタブ */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                パスワード変更
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="現在のパスワード"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="新しいパスワード"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="新しいパスワード（確認）"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained">
                    パスワードを変更
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                二要素認証
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                二要素認証は現在無効になっています
              </Alert>
              <Button variant="outlined" color="primary">
                二要素認証を有効にする
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ログイン履歴
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Windows PC - Chrome"
                    secondary="2024/03/28 09:15 - 東京"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="iPhone - Safari"
                    secondary="2024/03/27 18:30 - 東京"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Windows PC - Chrome"
                    secondary="2024/03/27 08:45 - 東京"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </MainLayout>
  );
}