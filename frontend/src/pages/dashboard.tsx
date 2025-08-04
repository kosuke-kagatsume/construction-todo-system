import React from 'react';
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
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockProjects } from '@/data/mockData';
import { useRouter } from 'next/router';
import { hasChecksheet, getChecksheetProgress } from '@/data/checksheets';

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

// フェーズ別プロジェクト数
const getPhaseData = () => {
  const phaseCount: { [key: string]: number } = {};
  mockProjects.forEach(project => {
    const phase = project.phase.split('・')[0];
    phaseCount[phase] = (phaseCount[phase] || 0) + 1;
  });
  
  return Object.entries(phaseCount).map(([phase, count]) => ({
    name: phase,
    value: count,
  }));
};

// チーム別負荷
const getTeamWorkload = () => {
  const workload: { [key: string]: number } = {};
  mockProjects.forEach(project => {
    if (project.status === 'IN_PROGRESS') {
      [project.sales, project.design, project.ic, project.construction].forEach(member => {
        workload[member] = (workload[member] || 0) + 1;
      });
    }
  });
  
  return Object.entries(workload)
    .map(([name, projects]) => ({ name, projects }))
    .sort((a, b) => b.projects - a.projects)
    .slice(0, 5);
};

// 今週の重要タスク
interface Milestone {
  projectName: string;
  stage: string;
  date: string;
  status: string;
}

const getWeeklyMilestones = (): Milestone[] => {
  const milestones: Milestone[] = [];
  const importantStages = ['基礎着工', '上棟', '引き渡し'];
  
  mockProjects.forEach(project => {
    importantStages.forEach(stage => {
      if (project.stages[stage]) {
        milestones.push({
          projectName: project.name,
          stage,
          date: project.stages[stage] as string,
          status: project.status,
        });
      }
    });
  });
  
  return milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardPage() {
  const router = useRouter();
  const stats = calculateStats();
  const phaseData = getPhaseData();
  const teamWorkload = getTeamWorkload();
  const weeklyMilestones = getWeeklyMilestones();
  
  // サンプルの進捗データ（実際はAPIから取得）
  const progressTrend = [
    { month: '1月', 完了: 2, 進行中: 5, 計画: 3 },
    { month: '2月', 完了: 3, 進行中: 6, 計画: 2 },
    { month: '3月', 完了: 5, 進行中: 4, 計画: 4 },
    { month: '4月', 完了: 7, 進行中: 5, 計画: 3 },
  ];

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
              {Math.abs(trend)}% 前月比
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
            ダッシュボード
          </Typography>
          <Typography variant="body1" color="text.secondary">
            プロジェクト全体の状況を俯瞰できます
          </Typography>
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
              title="遅延リスク"
              value={stats.delayed}
              subtitle="要注意プロジェクト"
              icon={<Warning sx={{ fontSize: 40 }} />}
              color="error.main"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* フェーズ別分布 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                フェーズ別プロジェクト分布
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={phaseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {phaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* 進捗トレンド */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                月別進捗トレンド
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="完了" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="進行中" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="計画" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* チーム別負荷 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                チーム別負荷状況
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={teamWorkload} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="projects" fill="#8884d8">
                    {teamWorkload.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.projects > 3 ? '#ff7043' : '#66bb6a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* 今週の重要マイルストーン */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  今週の重要マイルストーン
                </Typography>
                <IconButton size="small" onClick={() => router.push('/projects')}>
                  <ArrowForward />
                </IconButton>
              </Box>
              <List>
                {weeklyMilestones.map((milestone, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 
                          milestone.stage === '基礎着工' ? 'info.main' :
                          milestone.stage === '上棟' ? 'warning.main' :
                          'success.main'
                        }}>
                          <Construction />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle2">
                              {milestone.projectName} - {milestone.stage}
                            </Typography>
                            <Chip 
                              label={milestone.date} 
                              size="small" 
                              icon={<DateRange />}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            ステータス: {milestone.status === 'IN_PROGRESS' ? '進行中' : '完了'}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < weeklyMilestones.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* 遅延リスクアラート */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorOutline color="error" />
                  遅延リスクアラート
                </Typography>
              </Box>
              <List>
                {mockProjects
                  .filter(p => p.delayRisk === 'high')
                  .slice(0, 5)
                  .map((project, index) => (
                    <React.Fragment key={project.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.light' }}>
                            <Warning />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={project.name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                フェーズ: {project.phase} | 進捗: {project.progress}%
                              </Typography>
                              <Typography variant="caption" color="error">
                                {project.notes}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < 4 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
}