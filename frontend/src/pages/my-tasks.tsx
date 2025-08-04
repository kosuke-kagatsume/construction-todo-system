import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Checkbox,
  Chip,
  Grid,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Collapse,
} from '@mui/material';
import { 
  Today, 
  DateRange, 
  Assignment,
  Home,
  Schedule,
  CheckCircle,
  RadioButtonUnchecked,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  TrendingDown,
  Groups,
  Person,
  FilterList,
  MoreVert,
  Flag,
  Timer,
  CalendarMonth,
  Lightbulb,
} from '@mui/icons-material';
import { format, isToday, isThisWeek, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays, isThisMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Task {
  id: string;
  name: string;
  projectName: string;
  projectId: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'in_progress';
  estimatedHours?: number;
  actualHours?: number;
  assignee: string;
  phase: string;
  description?: string;
  checklist?: { id: string; text: string; completed: boolean }[];
  comments?: number;
  attachments?: number;
}

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
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MyTasksPage() {
  const [timeFilter, setTimeFilter] = useState('today');
  const [tabValue, setTabValue] = useState(0);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isManager] = useState(true); // 管理者フラグ（実際はユーザー情報から取得）

  // ダミーのタスクデータ（実際はAPIから取得）
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: '基礎着工準備',
      projectName: '田中邸',
      projectId: '1',
      dueDate: new Date(),
      priority: 'high',
      status: 'in_progress',
      estimatedHours: 8,
      actualHours: 3,
      assignee: '山田太郎',
      phase: '施工',
      description: '基礎工事開始前の最終確認と準備作業',
      checklist: [
        { id: 'c1', text: '材料確認', completed: true },
        { id: 'c2', text: '職人手配', completed: true },
        { id: 'c3', text: '天候確認', completed: false },
        { id: 'c4', text: '安全対策', completed: false },
      ],
      comments: 2,
      attachments: 3,
    },
    {
      id: '2',
      name: 'プランヒアリング',
      projectName: '佐藤邸',
      projectId: '2',
      dueDate: new Date(),
      priority: 'medium',
      status: 'pending',
      estimatedHours: 3,
      assignee: '山田太郎',
      phase: '追客・設計',
    },
    {
      id: '3',
      name: '2nd仕様打合せ',
      projectName: '鈴木邸',
      projectId: '3',
      dueDate: addDays(new Date(), 2),
      priority: 'medium',
      status: 'pending',
      estimatedHours: 2,
      assignee: '山田太郎',
      phase: '打ち合わせ',
    },
    {
      id: '4',
      name: '完成検査',
      projectName: '高橋邸',
      projectId: '4',
      dueDate: addDays(new Date(), 5),
      priority: 'low',
      status: 'completed',
      estimatedHours: 4,
      actualHours: 4,
      assignee: '山田太郎',
      phase: '竣工',
    },
    {
      id: '5',
      name: '配筋検査立会い',
      projectName: '伊藤邸',
      projectId: '5',
      dueDate: addDays(new Date(), -1),
      priority: 'high',
      status: 'pending',
      estimatedHours: 2,
      assignee: '山田太郎',
      phase: '施工',
    },
  ]);

  // チームメンバーのダミーデータ（管理者用）
  const teamMembers = [
    { id: '1', name: '山田太郎', role: '営業', tasksToday: 5, tasksWeek: 23, workload: 85 },
    { id: '2', name: '佐藤花子', role: '設計', tasksToday: 3, tasksWeek: 18, workload: 65 },
    { id: '3', name: '鈴木一郎', role: 'IC', tasksToday: 4, tasksWeek: 20, workload: 75 },
    { id: '4', name: '高橋健一', role: '工務', tasksToday: 6, tasksWeek: 28, workload: 95 },
  ];

  const handleTimeFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: string) => {
    if (newFilter !== null) {
      setTimeFilter(newFilter);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
          : task
      )
    );
  };

  const handleExpandTask = (taskId: string) => {
    setExpandedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (timeFilter === 'today') {
      return isToday(task.dueDate);
    } else if (timeFilter === 'week') {
      return isThisWeek(task.dueDate, { weekStartsOn: 1 });
    } else if (timeFilter === 'month') {
      return isThisMonth(task.dueDate);
    }
    return true;
  });

  // 週間データの生成
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  const weeklyData = weekDays.map(day => ({
    day: format(day, 'E', { locale: ja }),
    date: format(day, 'MM/dd'),
    tasks: tasks.filter(task => isSameDay(task.dueDate, day)).length,
    completed: tasks.filter(task => isSameDay(task.dueDate, day) && task.status === 'completed').length,
  }));

  // タスク優先度の分布
  const priorityData = [
    { name: '高', value: tasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
    { name: '中', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { name: '低', value: tasks.filter(t => t.priority === 'low').length, color: '#6b7280' },
  ];

  // フェーズ別タスク数
  const phaseData = [
    { name: '追客・設計', tasks: tasks.filter(t => t.phase === '追客・設計').length },
    { name: '契約', tasks: tasks.filter(t => t.phase === '契約').length },
    { name: '打ち合わせ', tasks: tasks.filter(t => t.phase === '打ち合わせ').length },
    { name: '施工', tasks: tasks.filter(t => t.phase === '施工').length },
    { name: '竣工', tasks: tasks.filter(t => t.phase === '竣工').length },
  ];

  const TaskCard = ({ task }: { task: Task }) => {
    const isExpanded = expandedTasks.includes(task.id);
    const completedChecklist = task.checklist?.filter(item => item.completed).length || 0;
    const totalChecklist = task.checklist?.length || 0;
    const checklistProgress = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;

    return (
      <Card 
        sx={{ 
          mb: 2,
          border: '1px solid',
          borderColor: task.status === 'completed' ? 'grey.300' : 'grey.200',
          backgroundColor: task.status === 'completed' ? 'grey.50' : 'white',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-2px)',
          }
        }}
      >
        <CardContent sx={{ pb: isExpanded ? 2 : 1, '&:last-child': { pb: isExpanded ? 2 : 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Checkbox
              checked={task.status === 'completed'}
              onChange={() => handleTaskToggle(task.id)}
              icon={<RadioButtonUnchecked />}
              checkedIcon={<CheckCircle />}
              sx={{
                color: task.priority === 'high' ? 'error.main' : 'primary.main',
                '&.Mui-checked': {
                  color: 'success.main',
                }
              }}
            />
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    {task.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Home sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {task.projectName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography 
                        variant="caption" 
                        color={isToday(task.dueDate) ? 'error.main' : 'text.secondary'}
                        fontWeight={isToday(task.dueDate) ? 600 : 400}
                      >
                        {format(task.dueDate, 'MM月dd日(E)', { locale: ja })}
                      </Typography>
                    </Box>
                    {task.estimatedHours && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Timer sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {task.actualHours || 0}/{task.estimatedHours}h
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={<Flag sx={{ fontSize: 14 }} />}
                    label={task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                    size="small"
                    color={
                      task.priority === 'high' ? 'error' : 
                      task.priority === 'medium' ? 'warning' : 
                      'default'
                    }
                    sx={{ height: 24 }}
                  />
                  
                  <IconButton 
                    size="small"
                    onClick={() => handleExpandTask(task.id)}
                  >
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
              </Box>
              
              {/* チェックリストプログレス */}
              {task.checklist && task.checklist.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      チェックリスト
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {completedChecklist}/{totalChecklist}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={checklistProgress}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              )}
              
              {/* メタ情報 */}
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                {task.comments && task.comments > 0 && (
                  <Chip
                    label={`コメント ${task.comments}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '11px' }}
                  />
                )}
                {task.attachments && task.attachments > 0 && (
                  <Chip
                    label={`添付 ${task.attachments}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '11px' }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          
          {/* 展開時の詳細 */}
          <Collapse in={isExpanded}>
            <Box sx={{ mt: 2, pl: 6 }}>
              {task.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {task.description}
                </Typography>
              )}
              
              {task.checklist && task.checklist.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    チェックリスト
                  </Typography>
                  <List dense>
                    {task.checklist.map(item => (
                      <ListItem key={item.id} disablePadding>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Checkbox
                            edge="start"
                            checked={item.completed}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { 
                              textDecoration: item.completed ? 'line-through' : 'none',
                              color: item.completed ? 'text.secondary' : 'text.primary',
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button size="small" variant="outlined">
                  詳細を表示
                </Button>
                <Button size="small" variant="outlined">
                  時間を記録
                </Button>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  const StatCard = ({ icon, title, value, subValue, trend, color }: any) => (
    <Card className="hover-lift">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {icon}
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ color, fontWeight: 700 }}>
              {value}
            </Typography>
            {subValue && (
              <Typography variant="caption" color="text.secondary">
                {subValue}
              </Typography>
            )}
          </Box>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {trend > 0 ? (
                <TrendingUp color="success" />
              ) : trend < 0 ? (
                <TrendingDown color="error" />
              ) : null}
              {trend !== 0 && (
                <Typography 
                  variant="caption" 
                  color={trend > 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(trend)}%
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <Box className="fade-in">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            マイタスク
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {format(new Date(), 'yyyy年MM月dd日(E)', { locale: ja })} - あなたのタスクと進捗状況
          </Typography>
        </Box>

        {/* 統計カード */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<Today color="primary" />}
              title="今日のタスク"
              value={tasks.filter(t => isToday(t.dueDate) && t.status !== 'completed').length}
              subValue={`完了: ${tasks.filter(t => isToday(t.dueDate) && t.status === 'completed').length}`}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<DateRange color="info" />}
              title="今週のタスク"
              value={tasks.filter(t => isThisWeek(t.dueDate, { weekStartsOn: 1 }) && t.status !== 'completed').length}
              subValue={`完了: ${tasks.filter(t => isThisWeek(t.dueDate, { weekStartsOn: 1 }) && t.status === 'completed').length}`}
              color="info.main"
              trend={12}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<Assignment color="warning" />}
              title="遅延タスク"
              value={tasks.filter(t => t.dueDate < new Date() && t.status !== 'completed').length}
              subValue="要対応"
              color="warning.main"
              trend={-5}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<CheckCircle color="success" />}
              title="今月の達成率"
              value="78%"
              subValue={`${tasks.filter(t => isThisMonth(t.dueDate) && t.status === 'completed').length}/${tasks.filter(t => isThisMonth(t.dueDate)).length} タスク`}
              color="success.main"
              trend={8}
            />
          </Grid>
        </Grid>

        {/* タブ */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab icon={<Assignment />} label="タスク一覧" />
            <Tab icon={<CalendarMonth />} label="週間ビュー" />
            {isManager && <Tab icon={<Groups />} label="チーム管理" />}
            <Tab icon={<Lightbulb />} label="インサイト" />
          </Tabs>
        </Paper>

        {/* タスク一覧タブ */}
        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <ToggleButtonGroup
                value={timeFilter}
                exclusive
                onChange={handleTimeFilterChange}
                size="small"
              >
                <ToggleButton value="today">今日</ToggleButton>
                <ToggleButton value="week">今週</ToggleButton>
                <ToggleButton value="month">今月</ToggleButton>
                <ToggleButton value="all">すべて</ToggleButton>
              </ToggleButtonGroup>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Badge badgeContent={2} color="primary">
                  <IconButton size="small">
                    <FilterList />
                  </IconButton>
                </Badge>
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />

            {/* タスクリスト */}
            {filteredTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Assignment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  タスクがありません
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  素晴らしい！すべてのタスクが完了しています
                </Typography>
              </Box>
            ) : (
              <>
                {/* 遅延タスク */}
                {filteredTasks.filter(t => t.dueDate < new Date() && t.status !== 'completed').length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="error.main" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Flag /> 遅延タスク
                    </Typography>
                    {filteredTasks
                      .filter(t => t.dueDate < new Date() && t.status !== 'completed')
                      .map(task => <TaskCard key={task.id} task={task} />)
                    }
                  </Box>
                )}
                
                {/* 今日のタスク */}
                {filteredTasks.filter(t => isToday(t.dueDate)).length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Today /> 今日
                    </Typography>
                    {filteredTasks
                      .filter(t => isToday(t.dueDate))
                      .sort((a, b) => {
                        if (a.status === 'completed' && b.status !== 'completed') return 1;
                        if (a.status !== 'completed' && b.status === 'completed') return -1;
                        return 0;
                      })
                      .map(task => <TaskCard key={task.id} task={task} />)
                    }
                  </Box>
                )}
                
                {/* その他のタスク */}
                {filteredTasks.filter(t => !isToday(t.dueDate) && t.dueDate >= new Date()).length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      今後のタスク
                    </Typography>
                    {filteredTasks
                      .filter(t => !isToday(t.dueDate) && t.dueDate >= new Date())
                      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                      .map(task => <TaskCard key={task.id} task={task} />)
                    }
                  </Box>
                )}
              </>
            )}
          </Paper>
        </TabPanel>

        {/* 週間ビュータブ */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  週間タスク分布
                </Typography>
                <Box sx={{ height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="tasks" fill="#3b82f6" name="タスク数" />
                      <Bar dataKey="completed" fill="#10b981" name="完了数" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  優先度分布
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* チーム管理タブ（管理者のみ） */}
        {isManager && (
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    チームメンバーの状況
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {teamMembers.map(member => (
                      <Grid item xs={12} sm={6} md={3} key={member.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {member.name[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">
                                  {member.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {member.role}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption">
                                  ワークロード
                                </Typography>
                                <Typography variant="caption" color={member.workload > 80 ? 'error.main' : 'text.secondary'}>
                                  {member.workload}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={member.workload}
                                color={member.workload > 80 ? 'error' : 'primary'}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  今日
                                </Typography>
                                <Typography variant="h6">
                                  {member.tasksToday}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  今週
                                </Typography>
                                <Typography variant="h6">
                                  {member.tasksWeek}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Button size="small" fullWidth sx={{ mt: 2 }}>
                              詳細を表示
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    フェーズ別タスク分布
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={phaseData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <RechartsTooltip />
                        <Bar dataKey="tasks" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        )}

        {/* インサイトタブ */}
        <TabPanel value={tabValue} index={isManager ? 3 : 2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  生産性のヒント
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Lightbulb color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="朝の時間を有効活用"
                      secondary="最も重要なタスクを午前中に完了させると、1日の生産性が20%向上します"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Lightbulb color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="タスクの優先順位を見直す"
                      secondary="現在3つの高優先度タスクがあります。本当にすべて緊急でしょうか？"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Lightbulb color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="休憩を取りましょう"
                      secondary="45分作業したら5分休憩すると、集中力が持続します"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  今週の振り返り
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">
                      タスク完了率
                    </Typography>
                    <Typography variant="body2" color="success.main" fontWeight={600}>
                      85%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">
                      平均完了時間
                    </Typography>
                    <Typography variant="body2">
                      2.3時間/タスク
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">
                      最も生産的な時間帯
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                      9:00-11:00
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      改善ポイント
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      見積もり精度
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
      
      {/* メニュー */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem>完了タスクを非表示</MenuItem>
        <MenuItem>優先度でソート</MenuItem>
        <MenuItem>期限でソート</MenuItem>
        <Divider />
        <MenuItem>タスクをエクスポート</MenuItem>
      </Menu>
    </MainLayout>
  );
}