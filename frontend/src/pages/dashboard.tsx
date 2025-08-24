import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  AvatarGroup,
  Alert,
  AlertTitle,
  Badge,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Construction,
  People,
  Schedule,
  Assignment,
  ArrowForward,
  Home,
  AccountTree,
  DateRange,
  ErrorOutline,
  Speed,
  Groups,
  Person,
  Architecture,
  HomeRepairService,
  Engineering,
  Timeline,
  Assessment,
  Refresh,
  SwapHoriz,
  AccessTime,
  Block,
} from '@mui/icons-material';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  AreaChart, Area,
  Treemap,
  Sankey,
  ComposedChart,
} from 'recharts';
import { mockProjects } from '@/data/mockData';
import { excelTasks, tasksByRole } from '@/data/excelTaskData';
import { useRouter } from 'next/router';
import { hasChecksheet, getChecksheetProgress } from '@/data/checksheets';

// 役割別のカラー定義
const ROLE_COLORS = {
  '営業': '#2196F3',
  '設計': '#4CAF50',
  'IC': '#FF9800',
  '工務': '#F44336',
};

// 統計データの計算
const calculateStats = () => {
  const totalProjects = mockProjects.length;
  const inProgressProjects = mockProjects.filter(p => p.status === 'IN_PROGRESS').length;
  const completedProjects = mockProjects.filter(p => p.status === 'COMPLETED').length;
  const delayedProjects = mockProjects.filter(p => p.delayRisk === 'high').length;
  
  return {
    total: totalProjects,
    inProgress: inProgressProjects,
    completed: completedProjects,
    delayed: delayedProjects,
    completionRate: Math.round((completedProjects / totalProjects) * 100),
    onTimeRate: Math.round(((totalProjects - delayedProjects) / totalProjects) * 100),
  };
};

// 役割別タスク進捗データ
const getRoleProgress = () => {
  return Object.entries(tasksByRole).map(([role, tasks]) => {
    // ダミーの進捗データ（実際はプロジェクトから計算）
    const completed = Math.floor(Math.random() * tasks.length * 0.6);
    const inProgress = Math.floor(Math.random() * (tasks.length - completed) * 0.7);
    const pending = tasks.length - completed - inProgress;
    
    return {
      role,
      total: tasks.length,
      completed,
      inProgress,
      pending,
      completionRate: Math.round((completed / tasks.length) * 100),
    };
  });
};

// 役割間の引き継ぎ状況
const getRoleHandoffStatus = () => {
  return [
    { from: '営業', to: '設計', tasks: 12, delayed: 2, avgDays: 3.5 },
    { from: '設計', to: 'IC', tasks: 8, delayed: 1, avgDays: 2.8 },
    { from: 'IC', to: '工務', tasks: 15, delayed: 3, avgDays: 4.2 },
    { from: '工務', to: '完了', tasks: 5, delayed: 0, avgDays: 1.5 },
  ];
};

// ボトルネック分析
const getBottlenecks = () => {
  return [
    { 
      role: '設計',
      task: '実施設計図書作成',
      delayDays: 5,
      impact: 'high',
      affectedProjects: 3,
      reason: 'リソース不足',
    },
    {
      role: 'IC',
      task: '配線計画',
      delayDays: 3,
      impact: 'medium',
      affectedProjects: 2,
      reason: '仕様変更対応',
    },
    {
      role: '営業',
      task: '融資申請サポート',
      delayDays: 7,
      impact: 'high',
      affectedProjects: 4,
      reason: '書類不備',
    },
  ];
};

// タスクフロー効率
const getTaskFlowEfficiency = () => {
  const phases = ['契約前', '契約前打合せ', '設計・申請・着工', '工事・完了'];
  return phases.map(phase => ({
    phase,
    営業: Math.floor(Math.random() * 100),
    設計: Math.floor(Math.random() * 100),
    IC: Math.floor(Math.random() * 100),
    工務: Math.floor(Math.random() * 100),
  }));
};

// 週次パフォーマンストレンド
const getWeeklyTrend = () => {
  const weeks = ['W1', 'W2', 'W3', 'W4'];
  return weeks.map(week => ({
    week,
    完了タスク: Math.floor(Math.random() * 50 + 30),
    遅延タスク: Math.floor(Math.random() * 10),
    効率性: Math.floor(Math.random() * 30 + 70),
  }));
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('week');
  
  const stats = calculateStats();
  const roleProgress = getRoleProgress();
  const roleHandoffs = getRoleHandoffStatus();
  const bottlenecks = getBottlenecks();
  const taskFlowData = getTaskFlowEfficiency();
  const weeklyTrend = getWeeklyTrend();

  const StatCard = ({ title, value, subtitle, icon, trend, color = 'primary.main' }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color, mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.3 }}>
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box display="flex" alignItems="center" mt={1}>
            {trend > 0 ? (
              <TrendingUp sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', fontSize: 20, mr: 0.5 }} />
            )}
            <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
              {Math.abs(trend)}% 前週比
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <Box className="fade-in">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            建築現場BIダッシュボード
          </Typography>
          <Typography variant="body1" color="text.secondary">
            役割間のリレーション、タスク進捗、ボトルネックを可視化
          </Typography>
        </Box>

        {/* フィルターコントロール */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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
            <InputLabel>期間</InputLabel>
            <Select
              value={timeRange}
              label="期間"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="week">今週</MenuItem>
              <MenuItem value="month">今月</MenuItem>
              <MenuItem value="quarter">四半期</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<Refresh />}
            variant="outlined"
            size="small"
          >
            更新
          </Button>
        </Box>

        {/* KPIカード */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="総プロジェクト数"
              value={stats.total}
              subtitle={`進行中: ${stats.inProgress}`}
              icon={<AccountTree sx={{ fontSize: 40 }} />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="完了率"
              value={`${stats.completionRate}%`}
              subtitle={`${stats.completed}/${stats.total} 完了`}
              icon={<CheckCircle sx={{ fontSize: 40 }} />}
              trend={5}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="納期遵守率"
              value={`${stats.onTimeRate}%`}
              subtitle="予定通り進行"
              icon={<Schedule sx={{ fontSize: 40 }} />}
              trend={-2}
              color="info.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="ボトルネック"
              value={bottlenecks.length}
              subtitle="要対応箇所"
              icon={<Block sx={{ fontSize: 40 }} />}
              color="error.main"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* 役割別タスク進捗 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                役割別タスク進捗
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roleProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#4CAF50" name="完了" />
                  <Bar dataKey="inProgress" stackId="a" fill="#FF9800" name="進行中" />
                  <Bar dataKey="pending" stackId="a" fill="#9E9E9E" name="未着手" />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {roleProgress.map((role) => (
                  <Box key={role.role} sx={{ mb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{role.role}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {role.completionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={role.completionRate}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: ROLE_COLORS[role.role as keyof typeof ROLE_COLORS],
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* 役割間引き継ぎ状況 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                役割間引き継ぎ状況
              </Typography>
              <List>
                {roleHandoffs.map((handoff, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ 
                            bgcolor: ROLE_COLORS[handoff.from as keyof typeof ROLE_COLORS],
                            width: 32,
                            height: 32,
                            fontSize: 12,
                          }}>
                            {handoff.from[0]}
                          </Avatar>
                          <SwapHoriz sx={{ mx: 1, color: 'text.secondary' }} />
                          <Avatar sx={{ 
                            bgcolor: ROLE_COLORS[handoff.to as keyof typeof ROLE_COLORS] || '#757575',
                            width: 32,
                            height: 32,
                            fontSize: 12,
                          }}>
                            {handoff.to === '完了' ? '✓' : handoff.to[0]}
                          </Avatar>
                        </Box>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle2">
                              {handoff.from} → {handoff.to}
                            </Typography>
                            <Box display="flex" gap={1}>
                              <Chip 
                                label={`${handoff.tasks}件`} 
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              {handoff.delayed > 0 && (
                                <Chip 
                                  label={`遅延${handoff.delayed}件`} 
                                  size="small"
                                  color="error"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <AccessTime sx={{ fontSize: 14 }} />
                            <Typography variant="caption">
                              平均引き継ぎ日数: {handoff.avgDays}日
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < roleHandoffs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* ボトルネック分析 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning color="error" />
                  ボトルネック分析
                </Typography>
                <Button
                  size="small"
                  startIcon={<Assessment />}
                  onClick={() => router.push('/analytics')}
                >
                  詳細分析
                </Button>
              </Box>
              <Grid container spacing={2}>
                {bottlenecks.map((bottleneck, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Alert
                      severity={bottleneck.impact === 'high' ? 'error' : 'warning'}
                      sx={{ height: '100%' }}
                    >
                      <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={bottleneck.role}
                          size="small"
                          sx={{
                            bgcolor: ROLE_COLORS[bottleneck.role as keyof typeof ROLE_COLORS],
                            color: 'white',
                          }}
                        />
                        {bottleneck.task}
                      </AlertTitle>
                      <Box>
                        <Typography variant="body2">
                          遅延: {bottleneck.delayDays}日
                        </Typography>
                        <Typography variant="body2">
                          影響: {bottleneck.affectedProjects}プロジェクト
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          原因: {bottleneck.reason}
                        </Typography>
                      </Box>
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* タスクフロー効率 */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                フェーズ別タスクフロー効率
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={taskFlowData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="phase" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="営業" dataKey="営業" stroke={ROLE_COLORS['営業']} fill={ROLE_COLORS['営業']} fillOpacity={0.3} />
                  <Radar name="設計" dataKey="設計" stroke={ROLE_COLORS['設計']} fill={ROLE_COLORS['設計']} fillOpacity={0.3} />
                  <Radar name="IC" dataKey="IC" stroke={ROLE_COLORS['IC']} fill={ROLE_COLORS['IC']} fillOpacity={0.3} />
                  <Radar name="工務" dataKey="工務" stroke={ROLE_COLORS['工務']} fill={ROLE_COLORS['工務']} fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* 週次パフォーマンス */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                週次パフォーマンス
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="完了タスク" fill="#4CAF50" />
                  <Bar yAxisId="left" dataKey="遅延タスク" fill="#F44336" />
                  <Line yAxisId="right" type="monotone" dataKey="効率性" stroke="#2196F3" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
}