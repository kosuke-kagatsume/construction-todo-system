import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Alert,
  AlertTitle,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Warning,
  TrendingUp,
  TrendingDown,
  Speed,
  Timer,
  Group,
  Assignment,
  ErrorOutline,
  CheckCircle,
  ExpandMore,
  FilterList,
  Download,
  Print,
  ArrowUpward,
  ArrowDownward,
  AccessTime,
  SwapHoriz,
  Timeline,
  Insights,
  PriorityHigh,
  Engineering,
  Build,
  Architecture,
  BusinessCenter,
  HomeWork,
  AutoGraph,
  TrendingFlat,
} from '@mui/icons-material';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter,
  AreaChart, Area,
  Treemap,
  Sankey,
  FunnelChart, Funnel, LabelList,
} from 'recharts';
import { useRouter } from 'next/router';
import { excelTasks, tasksByRole } from '@/data/excelTaskData';
import { mockProjects } from '@/data/mockData';

// 役割別のカラー定義
const ROLE_COLORS = {
  '営業': '#2196F3',
  '設計': '#4CAF50',
  'IC': '#FF9800',
  '工務': '#F44336',
};

// タスク遅延の詳細データ
const getTaskDelayDetails = () => {
  const delays: any[] = [];
  const roles = ['営業', '設計', 'IC', '工務'];
  
  roles.forEach(role => {
    const tasks = tasksByRole[role as keyof typeof tasksByRole] || [];
    tasks.slice(0, 5).forEach(task => {
      delays.push({
        id: task.id,
        role,
        taskName: task.name,
        phase: task.phase,
        plannedDays: Math.floor(Math.random() * 10 + 3),
        actualDays: Math.floor(Math.random() * 15 + 5),
        delayDays: Math.floor(Math.random() * 7),
        frequency: Math.floor(Math.random() * 10 + 1),
        impact: Math.random() > 0.5 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
        projects: Math.floor(Math.random() * 5 + 1),
        rootCause: ['リソース不足', '仕様変更', '前工程遅延', '書類不備', '天候影響'][Math.floor(Math.random() * 5)],
      });
    });
  });
  
  return delays.sort((a, b) => b.delayDays - a.delayDays);
};

// 遅延パターン分析
const getDelayPatterns = () => {
  return [
    { pattern: '月末集中型', count: 15, percentage: 35, trend: 'up' },
    { pattern: '前工程待ち型', count: 12, percentage: 28, trend: 'stable' },
    { pattern: '仕様変更型', count: 8, percentage: 19, trend: 'down' },
    { pattern: 'リソース不足型', count: 5, percentage: 12, trend: 'up' },
    { pattern: 'その他', count: 3, percentage: 6, trend: 'stable' },
  ];
};

// 時系列遅延トレンド
const getDelayTrends = () => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
  return months.map(month => ({
    month,
    営業: Math.floor(Math.random() * 10 + 5),
    設計: Math.floor(Math.random() * 8 + 3),
    IC: Math.floor(Math.random() * 12 + 4),
    工務: Math.floor(Math.random() * 6 + 2),
    total: Math.floor(Math.random() * 30 + 10),
  }));
};

// 役割間の依存関係マップ
const getDependencyMap = () => {
  return [
    { source: '営業', target: '設計', value: 85, delay: 12 },
    { source: '設計', target: 'IC', value: 75, delay: 8 },
    { source: 'IC', target: '工務', value: 90, delay: 15 },
    { source: '設計', target: '工務', value: 30, delay: 5 },
    { source: '営業', target: 'IC', value: 20, delay: 3 },
  ];
};

// 改善提案
const getImprovementSuggestions = () => {
  return [
    {
      priority: 'high',
      area: '設計',
      issue: '実施設計図書作成の遅延',
      suggestion: 'CADテンプレートの標準化と自動化ツールの導入',
      expectedImprovement: '30%の時間短縮',
      effort: 'medium',
      impact: 'high',
    },
    {
      priority: 'high',
      area: '営業',
      issue: '融資申請書類の不備',
      suggestion: 'チェックリストの強化と事前確認フローの追加',
      expectedImprovement: '50%のエラー削減',
      effort: 'low',
      impact: 'high',
    },
    {
      priority: 'medium',
      area: 'IC',
      issue: '配線計画の手戻り',
      suggestion: '3Dシミュレーションツールの活用',
      expectedImprovement: '手戻り40%削減',
      effort: 'high',
      impact: 'medium',
    },
    {
      priority: 'medium',
      area: '工務',
      issue: '資材調達の遅れ',
      suggestion: 'サプライヤー管理システムの導入',
      expectedImprovement: '納期遅延20%改善',
      effort: 'medium',
      impact: 'medium',
    },
  ];
};

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

export default function AnalyticsPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [viewMode, setViewMode] = useState<string>('table');
  
  const taskDelays = getTaskDelayDetails();
  const delayPatterns = getDelayPatterns();
  const delayTrends = getDelayTrends();
  const dependencyMap = getDependencyMap();
  const improvements = getImprovementSuggestions();

  // フィルタリング
  const filteredDelays = taskDelays.filter(delay => {
    if (selectedRole !== 'all' && delay.role !== selectedRole) return false;
    if (selectedImpact !== 'all' && delay.impact !== selectedImpact) return false;
    return true;
  });

  // 統計計算
  const totalDelayDays = filteredDelays.reduce((sum, d) => sum + d.delayDays, 0);
  const avgDelayDays = filteredDelays.length > 0 ? (totalDelayDays / filteredDelays.length).toFixed(1) : '0';
  const highImpactCount = filteredDelays.filter(d => d.impact === 'high').length;
  const affectedProjects = new Set(filteredDelays.flatMap(d => Array(d.projects).fill(0).map((_, i) => `P${i}`))).size;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <MainLayout>
      <Box className="fade-in">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            ボトルネック詳細分析
          </Typography>
          <Typography variant="body1" color="text.secondary">
            タスクの遅延要因を詳細に分析し、改善提案を提示します
          </Typography>
        </Box>

        {/* サマリーカード */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Timer color="error" />
                  <Typography variant="subtitle2" color="text.secondary">
                    総遅延日数
                  </Typography>
                </Box>
                <Typography variant="h4" color="error.main">
                  {totalDelayDays}日
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filteredDelays.length}タスク
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Speed color="warning" />
                  <Typography variant="subtitle2" color="text.secondary">
                    平均遅延
                  </Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {avgDelayDays}日
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  タスクあたり
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PriorityHigh color="error" />
                  <Typography variant="subtitle2" color="text.secondary">
                    高影響度
                  </Typography>
                </Box>
                <Typography variant="h4" color="error.main">
                  {highImpactCount}件
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  要対応タスク
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <HomeWork color="info" />
                  <Typography variant="subtitle2" color="text.secondary">
                    影響プロジェクト
                  </Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {affectedProjects}件
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  遅延影響あり
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* フィルターバー */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FilterList />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>役割</InputLabel>
              <Select
                value={selectedRole}
                label="役割"
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <MenuItem value="all">全て</MenuItem>
                <MenuItem value="営業">営業</MenuItem>
                <MenuItem value="設計">設計</MenuItem>
                <MenuItem value="IC">IC</MenuItem>
                <MenuItem value="工務">工務</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>影響度</InputLabel>
              <Select
                value={selectedImpact}
                label="影響度"
                onChange={(e) => setSelectedImpact(e.target.value)}
              >
                <MenuItem value="all">全て</MenuItem>
                <MenuItem value="high">高</MenuItem>
                <MenuItem value="medium">中</MenuItem>
                <MenuItem value="low">低</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ flexGrow: 1 }} />
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="table">
                <Assignment />
              </ToggleButton>
              <ToggleButton value="chart">
                <AutoGraph />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button startIcon={<Download />} variant="outlined" size="small">
              エクスポート
            </Button>
          </Box>
        </Paper>

        {/* タブコンテンツ */}
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="遅延タスク一覧" icon={<Warning />} iconPosition="start" />
              <Tab label="遅延パターン分析" icon={<Insights />} iconPosition="start" />
              <Tab label="依存関係マップ" icon={<SwapHoriz />} iconPosition="start" />
              <Tab label="改善提案" icon={<TrendingUp />} iconPosition="start" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {viewMode === 'table' ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>タスク名</TableCell>
                      <TableCell>役割</TableCell>
                      <TableCell>フェーズ</TableCell>
                      <TableCell align="center">予定日数</TableCell>
                      <TableCell align="center">実績日数</TableCell>
                      <TableCell align="center">遅延日数</TableCell>
                      <TableCell align="center">頻度</TableCell>
                      <TableCell>影響度</TableCell>
                      <TableCell>原因</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDelays.slice(0, 10).map((delay) => (
                      <TableRow key={delay.id}>
                        <TableCell>{delay.taskName}</TableCell>
                        <TableCell>
                          <Chip
                            label={delay.role}
                            size="small"
                            sx={{
                              bgcolor: ROLE_COLORS[delay.role as keyof typeof ROLE_COLORS],
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{delay.phase}</Typography>
                        </TableCell>
                        <TableCell align="center">{delay.plannedDays}</TableCell>
                        <TableCell align="center">{delay.actualDays}</TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                            {delay.delayDays > 5 ? (
                              <ArrowUpward color="error" fontSize="small" />
                            ) : (
                              <TrendingFlat color="warning" fontSize="small" />
                            )}
                            <Typography color={delay.delayDays > 5 ? 'error' : 'warning.main'}>
                              {delay.delayDays}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{delay.frequency}回</TableCell>
                        <TableCell>
                          <Chip
                            label={delay.impact === 'high' ? '高' : delay.impact === 'medium' ? '中' : '低'}
                            size="small"
                            color={delay.impact === 'high' ? 'error' : delay.impact === 'medium' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{delay.rootCause}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 3 }}>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plannedDays" name="予定日数" />
                    <YAxis dataKey="delayDays" name="遅延日数" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    {Object.keys(ROLE_COLORS).map((role) => (
                      <Scatter
                        key={role}
                        name={role}
                        data={filteredDelays.filter(d => d.role === role)}
                        fill={ROLE_COLORS[role as keyof typeof ROLE_COLORS]}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  遅延パターン分布
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={delayPatterns}
                      dataKey="percentage"
                      nameKey="pattern"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ pattern, percentage }) => `${pattern} ${percentage}%`}
                    >
                      {delayPatterns.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  月別遅延トレンド
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={delayTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="営業" stackId="1" stroke={ROLE_COLORS['営業']} fill={ROLE_COLORS['営業']} />
                    <Area type="monotone" dataKey="設計" stackId="1" stroke={ROLE_COLORS['設計']} fill={ROLE_COLORS['設計']} />
                    <Area type="monotone" dataKey="IC" stackId="1" stroke={ROLE_COLORS['IC']} fill={ROLE_COLORS['IC']} />
                    <Area type="monotone" dataKey="工務" stackId="1" stroke={ROLE_COLORS['工務']} fill={ROLE_COLORS['工務']} />
                  </AreaChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  パターン別詳細
                </Typography>
                <List>
                  {delayPatterns.map((pattern, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'][index] }}>
                            {pattern.count}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={pattern.pattern}
                          secondary={`${pattern.percentage}% of total delays`}
                        />
                        <Box display="flex" alignItems="center" gap={1}>
                          {pattern.trend === 'up' ? (
                            <TrendingUp color="error" />
                          ) : pattern.trend === 'down' ? (
                            <TrendingDown color="success" />
                          ) : (
                            <TrendingFlat color="action" />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {pattern.trend === 'up' ? '増加傾向' : pattern.trend === 'down' ? '減少傾向' : '横ばい'}
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < delayPatterns.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  役割間の依存関係と遅延影響
                </Typography>
                <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                  {dependencyMap.map((dep, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip
                          label={dep.source}
                          sx={{
                            bgcolor: ROLE_COLORS[dep.source as keyof typeof ROLE_COLORS],
                            color: 'white',
                          }}
                        />
                        <Box sx={{ flexGrow: 1, position: 'relative' }}>
                          <LinearProgress
                            variant="determinate"
                            value={dep.value}
                            sx={{
                              height: 20,
                              borderRadius: 10,
                              backgroundColor: 'grey.200',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'text.primary' }}>
                              {dep.value}%の依存度
                            </Typography>
                            {dep.delay > 10 && (
                              <Warning color="error" fontSize="small" />
                            )}
                          </Box>
                        </Box>
                        <Chip
                          label={dep.target}
                          sx={{
                            bgcolor: ROLE_COLORS[dep.target as keyof typeof ROLE_COLORS] || '#757575',
                            color: 'white',
                          }}
                        />
                        <Chip
                          label={`遅延${dep.delay}件`}
                          size="small"
                          color={dep.delay > 10 ? 'error' : 'warning'}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Alert severity="warning">
                  <AlertTitle>主要ボトルネック</AlertTitle>
                  <Typography variant="body2">
                    IC → 工務 の引き継ぎで最も多く遅延が発生しています（15件）。
                    配線計画の確定遅れが主な原因です。
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={6}>
                <Alert severity="info">
                  <AlertTitle>改善ポイント</AlertTitle>
                  <Typography variant="body2">
                    設計 → IC の依存度を下げることで、全体の流れを改善できます。
                    並行作業可能なタスクの洗い出しを推奨します。
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              {improvements.map((improvement, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Accordion defaultExpanded={improvement.priority === 'high'}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center" gap={2} width="100%">
                        <Chip
                          label={improvement.priority === 'high' ? '優先度: 高' : '優先度: 中'}
                          size="small"
                          color={improvement.priority === 'high' ? 'error' : 'warning'}
                        />
                        <Chip
                          label={improvement.area}
                          size="small"
                          sx={{
                            bgcolor: ROLE_COLORS[improvement.area as keyof typeof ROLE_COLORS],
                            color: 'white',
                          }}
                        />
                        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                          {improvement.issue}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Alert severity="success" sx={{ mb: 2 }}>
                          <AlertTitle>改善提案</AlertTitle>
                          {improvement.suggestion}
                        </Alert>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Box textAlign="center">
                              <Typography variant="caption" color="text.secondary">
                                期待効果
                              </Typography>
                              <Typography variant="h6" color="success.main">
                                {improvement.expectedImprovement}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box textAlign="center">
                              <Typography variant="caption" color="text.secondary">
                                実装難易度
                              </Typography>
                              <Typography variant="h6">
                                {improvement.effort === 'low' ? '低' : improvement.effort === 'medium' ? '中' : '高'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box textAlign="center">
                              <Typography variant="caption" color="text.secondary">
                                影響範囲
                              </Typography>
                              <Typography variant="h6">
                                {improvement.impact === 'high' ? '大' : '中'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        <Box mt={2}>
                          <Button variant="outlined" size="small" fullWidth>
                            実装計画を作成
                          </Button>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
            <Box mt={3}>
              <Alert severity="info">
                <AlertTitle>実装ロードマップ</AlertTitle>
                <Typography variant="body2">
                  優先度「高」の改善提案から順次実装することで、3ヶ月以内に全体の遅延を30%削減できる見込みです。
                  まずはチェックリストの強化など、実装難易度が低く効果の高い施策から着手することをお勧めします。
                </Typography>
              </Alert>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </MainLayout>
  );
}