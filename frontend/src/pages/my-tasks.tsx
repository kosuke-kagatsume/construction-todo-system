import React from 'react';
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
} from '@mui/material';
import { 
  Today, 
  DateRange, 
  Assignment,
  Home,
  Schedule,
} from '@mui/icons-material';
import { format, isToday, isThisWeek, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function MyTasksPage() {
  const [timeFilter, setTimeFilter] = React.useState('today');

  const handleTimeFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: string,
  ) => {
    if (newFilter !== null) {
      setTimeFilter(newFilter);
    }
  };

  // ダミーのタスクデータ
  const tasks = [
    {
      id: '1',
      name: '田中邸 - 基礎着工準備',
      projectName: '田中邸',
      dueDate: new Date(),
      priority: 'high',
      status: 'pending',
    },
    {
      id: '2',
      name: '佐藤邸 - プランヒアリング',
      projectName: '佐藤邸',
      dueDate: new Date(),
      priority: 'medium',
      status: 'pending',
    },
    {
      id: '3',
      name: '鈴木邸 - 2nd仕様打合せ',
      projectName: '鈴木邸',
      dueDate: addDays(new Date(), 2),
      priority: 'medium',
      status: 'pending',
    },
    {
      id: '4',
      name: '高橋邸 - 完成検査',
      projectName: '高橋邸',
      dueDate: addDays(new Date(), 5),
      priority: 'low',
      status: 'completed',
    },
  ];

  const filteredTasks = tasks.filter(task => {
    if (timeFilter === 'today') {
      return isToday(task.dueDate);
    } else if (timeFilter === 'week') {
      return isThisWeek(task.dueDate, { weekStartsOn: 1 });
    }
    return true;
  });

  const TaskSummaryCard = ({ icon, title, count, color }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="subtitle2" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ color }}>
          {count}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          マイタスク
        </Typography>
        <Typography variant="body1" color="text.secondary">
          あなたに割り当てられたタスクを管理します
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TaskSummaryCard
            icon={<Today color="primary" />}
            title="今日のタスク"
            count={tasks.filter(t => isToday(t.dueDate) && t.status !== 'completed').length}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TaskSummaryCard
            icon={<DateRange color="info" />}
            title="今週のタスク"
            count={tasks.filter(t => isThisWeek(t.dueDate, { weekStartsOn: 1 }) && t.status !== 'completed').length}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TaskSummaryCard
            icon={<Assignment color="warning" />}
            title="遅延タスク"
            count={0}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TaskSummaryCard
            icon={<Schedule color="success" />}
            title="完了タスク"
            count={tasks.filter(t => t.status === 'completed').length}
            color="success.main"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">タスク一覧</Typography>
          <ToggleButtonGroup
            value={timeFilter}
            exclusive
            onChange={handleTimeFilterChange}
            size="small"
          >
            <ToggleButton value="today">今日</ToggleButton>
            <ToggleButton value="week">今週</ToggleButton>
            <ToggleButton value="all">すべて</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Divider sx={{ mb: 2 }} />

        <List>
          {filteredTasks.map((task) => (
            <ListItem
              key={task.id}
              sx={{
                mb: 1,
                backgroundColor: task.status === 'completed' ? '#f5f5f5' : '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
              }}
            >
              <ListItemIcon>
                <Checkbox checked={task.status === 'completed'} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {task.name}
                    </Typography>
                    <Chip
                      label={task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                      size="small"
                      color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Home sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {task.projectName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {format(task.dueDate, 'MM月dd日(E)', { locale: ja })}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </MainLayout>
  );
}