import React from 'react';
import { 
  Box, 
  Paper, 
  Grid, 
  Typography, 
  Card, 
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  LinearProgress,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Person, 
  Engineering, 
  Palette, 
  Construction,
  CalendarToday,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Task, Stage, Phase } from '@/types';

interface ProjectDetailProps {
  projectId: string;
}

// ダミーデータ
const phases: Phase[] = [
  { id: '1', code: 'LEAD', name: '追客・設計', displayOrder: 1, colorCode: '#2196F3' },
  { id: '2', code: 'CONTRACT', name: '契約', displayOrder: 2, colorCode: '#4CAF50' },
  { id: '3', code: 'MEETING', name: '打ち合わせ', displayOrder: 3, colorCode: '#FF9800' },
  { id: '4', code: 'CONSTRUCTION', name: '施工', displayOrder: 4, colorCode: '#F44336' },
  { id: '5', code: 'COMPLETION', name: '竣工', displayOrder: 5, colorCode: '#9C27B0' },
];

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId }) => {
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskUpdate = () => {
    // TODO: APIでタスクを更新
    setTaskDialogOpen(false);
  };

  // プロジェクト情報カード
  const ProjectInfoCard = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          プロジェクト情報
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">顧客名</Typography>
            <Typography variant="body1">田中太郎</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">フェーズ</Typography>
            <Chip label="施工" size="small" sx={{ backgroundColor: '#F44336', color: 'white' }} />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">基礎着工目標</Typography>
            <Typography variant="body1">2024/03/15</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">上棟目標</Typography>
            <Typography variant="body1">2024/04/20</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // 担当者カード
  const AssigneeCard = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          担当者
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon><Person /></ListItemIcon>
            <ListItemText primary="営業" secondary="山田太郎" />
          </ListItem>
          <ListItem>
            <ListItemIcon><Engineering /></ListItemIcon>
            <ListItemText primary="設計" secondary="佐藤花子" />
          </ListItem>
          <ListItem>
            <ListItemIcon><Palette /></ListItemIcon>
            <ListItemText primary="IC" secondary="鈴木一郎" />
          </ListItem>
          <ListItem>
            <ListItemIcon><Construction /></ListItemIcon>
            <ListItemText primary="工務" secondary="高橋次郎" />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );

  // 進捗サマリーカード
  const ProgressCard = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          進捗状況
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">全体進捗</Typography>
            <Typography variant="body2">65%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={65} sx={{ height: 8 }} />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4">15</Typography>
              <Typography variant="body2" color="text.secondary">完了</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">3</Typography>
              <Typography variant="body2" color="text.secondary">進行中</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error">2</Typography>
              <Typography variant="body2" color="text.secondary">遅延</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // タスクリスト
  const TaskList = () => {
    const tasks: Task[] = [
      {
        id: '1',
        projectId: projectId,
        seq: 1,
        name: '地鎮祭準備',
        status: 'COMPLETED',
        progressPercentage: 100,
        isCompleted: true,
        actualStart: '2024-02-01',
        actualFinish: '2024-02-05',
        assigneeRole: 'CONSTRUCTION',
      },
      {
        id: '2',
        projectId: projectId,
        seq: 2,
        name: '地鎮祭',
        status: 'COMPLETED',
        progressPercentage: 100,
        isCompleted: true,
        actualStart: '2024-02-10',
        actualFinish: '2024-02-10',
        assigneeRole: 'SALES',
      },
      {
        id: '3',
        projectId: projectId,
        seq: 3,
        name: '基礎着工',
        status: 'IN_PROGRESS',
        progressPercentage: 60,
        isCompleted: false,
        plannedStart: '2024-03-15',
        assigneeRole: 'CONSTRUCTION',
      },
    ];

    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          タスク一覧
        </Typography>
        <List>
          {phases.map((phase) => (
            <Box key={phase.id}>
              <Box sx={{ 
                backgroundColor: phase.colorCode, 
                color: 'white', 
                p: 1, 
                mt: 2,
                borderRadius: 1,
              }}>
                <Typography variant="subtitle2">{phase.name}</Typography>
              </Box>
              {tasks
                .filter(task => task.assigneeRole) // フェーズでフィルタリング（実際はstageIdで判定）
                .map((task) => (
                  <ListItem
                    key={task.id}
                    button
                    onClick={() => handleTaskClick(task)}
                    sx={{
                      borderLeft: task.status === 'COMPLETED' ? '4px solid #4CAF50' : 
                                 task.status === 'IN_PROGRESS' ? '4px solid #2196F3' : 
                                 '4px solid #ccc',
                      mb: 1,
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox checked={task.isCompleted} />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.name}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Chip 
                            icon={<Person />} 
                            label={task.assigneeRole} 
                            size="small" 
                          />
                          {task.actualStart && (
                            <Typography variant="caption">
                              実施: {format(new Date(task.actualStart), 'MM/dd')}
                            </Typography>
                          )}
                          {task.plannedStart && !task.actualStart && (
                            <Typography variant="caption" color="text.secondary">
                              予定: {format(new Date(task.plannedStart), 'MM/dd')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    {task.status === 'IN_PROGRESS' && (
                      <Box sx={{ width: 100, mr: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={task.progressPercentage} 
                          sx={{ height: 6 }}
                        />
                      </Box>
                    )}
                    {task.overrunDays && task.overrunDays > 0 && (
                      <Warning color="error" />
                    )}
                  </ListItem>
                ))}
            </Box>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ProjectInfoCard />
            </Grid>
            <Grid item xs={12}>
              <AssigneeCard />
            </Grid>
            <Grid item xs={12}>
              <ProgressCard />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={8}>
          <TaskList />
        </Grid>
      </Grid>

      {/* タスク詳細ダイアログ */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTask?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="進捗率"
                type="number"
                fullWidth
                value={selectedTask?.progressPercentage || 0}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="実施開始日"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={selectedTask?.actualStart || ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="実施完了日"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={selectedTask?.actualFinish || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="メモ"
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleTaskUpdate} variant="contained">更新</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};