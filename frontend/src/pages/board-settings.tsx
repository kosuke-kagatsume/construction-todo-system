import React, { useState, useEffect } from 'react';
import { useBoardSettings } from '@/hooks/useBoardSettings';
import { MainLayout } from '@/components/Layout/MainLayout';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  AlertTitle,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Settings,
  Save,
  Cancel,
  Person,
  Group,
  Visibility,
  VisibilityOff,
  DragIndicator,
  Add,
  Delete,
  Edit,
  ExpandMore,
  ViewColumn,
  TableChart,
  Dashboard,
  BusinessCenter,
  Architecture,
  Engineering,
  Construction,
  Home,
  AccountTree,
  DateRange,
  Schedule,
  AssignmentTurnedIn,
  Checklist,
  Info,
  Warning,
  Error,
  CheckCircle,
  Refresh,
  ContentCopy,
  Share,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useRouter } from 'next/router';

// 役割の定義
const ROLES = [
  { id: 'sales', name: '営業', icon: <BusinessCenter />, color: '#2196F3' },
  { id: 'design', name: '設計', icon: <Architecture />, color: '#4CAF50' },
  { id: 'ic', name: 'IC', icon: <Engineering />, color: '#FF9800' },
  { id: 'construction', name: '工務', icon: <Construction />, color: '#F44336' },
];

// 共有事項の定義
const SHARED_ITEMS = [
  { id: 'projectName', name: '邸名', category: '基本情報', required: true },
  { id: 'phase', name: 'フェーズ', category: '基本情報', required: true },
  { id: 'stage', name: '階数', category: '基本情報', required: false },
  { id: 'sales', name: '営業', category: '基本情報', required: false },
  { id: 'design', name: '設計', category: '基本情報', required: false },
  { id: 'ic', name: 'IC', category: '基本情報', required: false },
  { id: 'construction', name: '工務', category: '基本情報', required: false },
  { id: 'customerLand', name: '仮案土地', category: '契約情報', required: false },
  { id: 'landStatus', name: '土地状況', category: '契約情報', required: false },
  { id: 'loanStatus', name: 'ローン状況', category: '契約情報', required: false },
  { id: 'deliveryDate', name: '引き渡し日', category: '契約情報', required: false },
  { id: 'constructionStart', name: '着工日', category: '工事情報', required: false },
  { id: 'foundation', name: '基礎着工', category: '工事情報', required: false },
  { id: 'framing', name: '上棟', category: '工事情報', required: false },
  { id: 'completion', name: '竣工', category: '工事情報', required: false },
];

// ステージ（工程）の定義
const STAGES = [
  { id: 'design_app', name: '設計申込', phase: '追客・設計' },
  { id: 'plan_hearing', name: 'プランヒアリング', phase: '追客・設計' },
  { id: 'first_plan', name: '初回プラン提示', phase: '追客・設計' },
  { id: 'estimate', name: '概算見積', phase: '追客・設計' },
  { id: 'contract_prep', name: '契約準備', phase: '契約' },
  { id: 'contract', name: '契約', phase: '契約' },
  { id: 'detail_meeting', name: '詳細打合せ', phase: '打ち合わせ' },
  { id: 'final_confirmation', name: '最終確認', phase: '打ち合わせ' },
  { id: 'construction_prep', name: '着工準備', phase: '施工' },
  { id: 'foundation_work', name: '基礎工事', phase: '施工' },
  { id: 'framing_work', name: '上棟工事', phase: '施工' },
  { id: 'completion_check', name: '竣工検査', phase: '竣工' },
  { id: 'delivery', name: '引き渡し', phase: '竣工' },
];

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
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BoardSettingsPage() {
  const router = useRouter();
  const { settings, saveSettings, resetSettings } = useBoardSettings();
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  
  // 担当者列の表示設定
  const [selectedRoles, setSelectedRoles] = useState(settings.roles);

  // 共有事項の表示設定
  const [selectedSharedItems, setSelectedSharedItems] = useState(settings.visibleSharedItems || []);

  // ステージの表示設定
  const [selectedStages, setSelectedStages] = useState(settings.visibleStages || []);

  // 表示モード設定
  const [displayMode, setDisplayMode] = useState(settings.displayMode);

  // カスタムビューの設定
  const [customViews, setCustomViews] = useState([
    { id: 1, name: '営業ビュー', roles: ['sales'], items: ['projectName', 'phase', 'customerLand', 'loanStatus'] },
    { id: 2, name: '設計ビュー', roles: ['design'], items: ['projectName', 'phase', 'design', 'constructionStart'] },
    { id: 3, name: '工務ビュー', roles: ['construction'], items: ['projectName', 'phase', 'foundation', 'framing', 'completion'] },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId as keyof typeof prev],
    }));
  };

  const handleSharedItemToggle = (itemId: string) => {
    const item = SHARED_ITEMS.find(i => i.id === itemId);
    if (item?.required) return; // 必須項目は変更不可
    
    setSelectedSharedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleStageToggle = (stageId: string) => {
    setSelectedStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const handleSaveSettings = () => {
    // 設定を保存
    const newSettings = {
      roles: selectedRoles,
      visibleSharedItems: selectedSharedItems,
      visibleStages: selectedStages,
      displayMode,
    };
    saveSettings(newSettings);
    
    // 成功メッセージを表示
    alert('設定を保存しました');
  };

  const handleResetSettings = () => {
    resetSettings();
    // ローカル状態も更新
    setSelectedRoles({
      sales: true,
      design: true,
      ic: true,
      construction: true,
    });
    // デフォルトの共有事項
    setSelectedSharedItems([
      '1',  // 邸名
      '2',  // フレーム
      '3',  // 階数
      '8',  // 仮案土地
      '9',  // 土地状況
      '10', // ローン状況
      '11', // 引込状況
      '14', // プレカット依頼
      '15', // 引渡希望月
      '16', // 地盤保証
      '17', // 見学会
      '18', // 農地転用確認書
      '19', // 許容応力度計算
      '20', // 防火
      '21', // 省エネ
      '22', // 大垣モ
    ]);
    // デフォルトのステージ
    setSelectedStages([
      // 追客・設計
      '設計申込', 'プランヒアリング', '敷地調査', 'プラン提案', '見積提出', 
      '設計契約', '実施設計', '確認申請',
      // 契約
      '契約前打合せ', '請負契約', '建築請負契約',
      // 打ち合わせ
      '1st仕様打合せ', '2nd仕様打合せ', '3rd仕様打合せ', '仕様決定', 
      '図面承認', '地鎮祭準備', '地鎮祭',
      // 施工
      '地盤改良', '基礎着工', '基礎配筋検査', '基礎完了', '土台敷き', 
      '上棟', '上棟式', '屋根工事', '外装工事', '内装下地', '内装仕上げ', 
      '設備工事', '外構工事', '美装工事', '社内検査', '竣工検査',
      // 竣工
      '引き渡し準備', '引き渡し', 'アフター点検'
    ]);
    setDisplayMode({
      compactMode: false,
      showProgress: true,
      showDelay: true,
      showAlert: true,
      colorCoding: true,
    });
  };

  const applyCustomView = (view: any) => {
    // カスタムビューを適用
    setSelectedRoles(
      ROLES.reduce((acc, role) => ({
        ...acc,
        [role.id]: view.roles.includes(role.id),
      }), {} as { sales: boolean; design: boolean; ic: boolean; construction: boolean; })
    );
    setSelectedSharedItems(view.items || []);
  };

  return (
    <MainLayout>
      <Box className="fade-in">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
            現場ボード表示設定
          </Typography>
          <Typography variant="body1" color="text.secondary">
            現場ボードに表示する項目をカスタマイズできます
          </Typography>
        </Box>

        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="担当者列" icon={<Group />} iconPosition="start" />
              <Tab label="共有事項" icon={<Info />} iconPosition="start" />
              <Tab label="ステージ設定" icon={<AccountTree />} iconPosition="start" />
              <Tab label="表示モード" icon={<Dashboard />} iconPosition="start" />
              <Tab label="カスタムビュー" icon={<ViewColumn />} iconPosition="start" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                担当者列の表示
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                現場ボードに表示する担当者の役割を選択してください
              </Typography>
              
              <Grid container spacing={2}>
                {ROLES.map(role => (
                  <Grid item xs={12} sm={6} md={3} key={role.id}>
                    <Card 
                      sx={{ 
                        border: selectedRoles[role.id as keyof typeof selectedRoles] ? 2 : 1,
                        borderColor: selectedRoles[role.id as keyof typeof selectedRoles] ? role.color : 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => handleRoleToggle(role.id)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ color: role.color }}>{role.icon}</Box>
                            <Typography variant="subtitle1">{role.name}</Typography>
                          </Box>
                          <Checkbox
                            checked={selectedRoles[role.id as keyof typeof selectedRoles]}
                            sx={{ color: role.color }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <AlertTitle>ヒント</AlertTitle>
                選択した役割の担当者列が現場ボードに表示されます。不要な列を非表示にすることで、画面をスッキリさせることができます。
              </Alert>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                共有事項の表示
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                現場ボードに表示する共有事項を選択してください
              </Typography>

              {['基本情報', '契約情報', '工事情報'].map(category => (
                <Accordion key={category} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">{category}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup>
                      {SHARED_ITEMS.filter(item => item.category === category).map(item => (
                        <FormControlLabel
                          key={item.id}
                          control={
                            <Checkbox
                              checked={selectedSharedItems.includes(item.id)}
                              onChange={() => handleSharedItemToggle(item.id)}
                              disabled={item.required}
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography>{item.name}</Typography>
                              {item.required && (
                                <Chip label="基本情報" size="small" color="primary" />
                              )}
                              {selectedSharedItems[item.id as keyof typeof selectedSharedItems] && !item.required && (
                                <Chip label="契約情報" size="small" variant="outlined" />
                              )}
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                ステージ（工程）の表示設定
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                現場ボードに表示するステージを選択してください
              </Typography>

              {['追客・設計', '契約', '打ち合わせ', '施工', '竣工'].map(phase => (
                <Box key={phase} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    {phase}
                  </Typography>
                  <Grid container spacing={1}>
                    {STAGES.filter(stage => stage.phase === phase).map(stage => (
                      <Grid item xs={12} sm={6} md={4} key={stage.id}>
                        <Card
                          sx={{
                            border: selectedStages.includes(stage.id) ? 2 : 1,
                            borderColor: selectedStages.includes(stage.id) ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => handleStageToggle(stage.id)}
                        >
                          <CardContent sx={{ py: 1 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedStages.includes(stage.id)}
                                  size="small"
                                />
                              }
                              label={stage.name}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                表示モード設定
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                現場ボードの表示方法をカスタマイズします
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <TableChart />
                  </ListItemIcon>
                  <ListItemText
                    primary="コンパクトモード"
                    secondary="行の高さを縮小して、より多くの情報を一画面に表示"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={displayMode.compactMode}
                      onChange={(e) => setDisplayMode(prev => ({ ...prev, compactMode: e.target.checked }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText
                    primary="進捗表示"
                    secondary="各プロジェクトの進捗率を表示"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={displayMode.showProgress}
                      onChange={(e) => setDisplayMode(prev => ({ ...prev, showProgress: e.target.checked }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Warning />
                  </ListItemIcon>
                  <ListItemText
                    primary="遅延警告"
                    secondary="遅延しているタスクをハイライト表示"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={displayMode.showDelay}
                      onChange={(e) => setDisplayMode(prev => ({ ...prev, showDelay: e.target.checked }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Error />
                  </ListItemIcon>
                  <ListItemText
                    primary="アラート表示"
                    secondary="重要な通知やアラートを表示"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={displayMode.showAlert}
                      onChange={(e) => setDisplayMode(prev => ({ ...prev, showAlert: e.target.checked }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Visibility />
                  </ListItemIcon>
                  <ListItemText
                    primary="カラーコーディング"
                    secondary="ステータスに応じて色分け表示"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={displayMode.colorCoding}
                      onChange={(e) => setDisplayMode(prev => ({ ...prev, colorCoding: e.target.checked }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6">
                    カスタムビュー
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    役割別に最適化された表示設定を保存・適用できます
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenDialog(true)}
                >
                  新規ビュー作成
                </Button>
              </Box>

              <Grid container spacing={2}>
                {customViews.map(view => (
                  <Grid item xs={12} md={4} key={view.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {view.name}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            対象役割:
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            {view.roles.map(roleId => {
                              const role = ROLES.find(r => r.id === roleId);
                              return role ? (
                                <Chip
                                  key={roleId}
                                  label={role.name}
                                  size="small"
                                  sx={{
                                    bgcolor: role.color,
                                    color: 'white',
                                  }}
                                />
                              ) : null;
                            })}
                          </Stack>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            表示項目: {view.items.length}個
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => applyCustomView(view)}
                          >
                            適用
                          </Button>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>
        </Paper>

        {/* アクションボタン */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleResetSettings}
          >
            リセット
          </Button>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => router.push('/')}
          >
            キャンセル
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
          >
            保存
          </Button>
        </Box>

        {/* カスタムビュー作成ダイアログ */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>新規カスタムビュー作成</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="ビュー名"
              margin="normal"
              placeholder="例: 営業専用ビュー"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>対象役割</InputLabel>
              <Select multiple value={[]} label="対象役割">
                {ROLES.map(role => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              表示項目は作成後に設定画面で調整できます
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>キャンセル</Button>
            <Button variant="contained" onClick={() => setOpenDialog(false)}>
              作成
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}