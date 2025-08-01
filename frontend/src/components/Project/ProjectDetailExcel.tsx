import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  CalendarToday,
  AttachMoney,
  Warning,
  CheckCircle,
  Schedule,
  Assignment,
  Comment,
  AttachFile,
  Add,
  Search,
} from '@mui/icons-material';
import { mockProjects, getProjectDetails, phases, allStages } from '@/data/mockData';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProjectDetailExcel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [tabValue, setTabValue] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');
  const [searchTask, setSearchTask] = useState('');
  
  const project = mockProjects.find(p => p.id === projectId);
  const allTasks = getProjectDetails(projectId);
  
  // Filter tasks
  const tasks = allTasks.filter(task => {
    // Status filter
    if (taskFilter !== 'all' && task.status !== taskFilter) {
      return false;
    }
    
    // Search filter
    if (searchTask) {
      const searchLower = searchTask.toLowerCase();
      if (!task.stageName.toLowerCase().includes(searchLower) &&
          !task.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });
  
  if (!project) {
    return (
      <Alert severity="error">
        プロジェクトが見つかりません
      </Alert>
    );
  }
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = Math.round((completedTasks / tasks.length) * 100);
  
  return (
    <Box>
      {/* プロジェクト概要カード */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {project.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {project.customer} 様
              </Typography>
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">進捗状況</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {progressPercentage}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        開始日
                      </Typography>
                      <Typography variant="body2">
                        {project.startDate}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        完成予定
                      </Typography>
                      <Typography variant="body2">
                        {project.completionDate}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        予算
                      </Typography>
                      <Typography variant="body2">
                        ¥{project.budget.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning 
                      fontSize="small" 
                      color={
                        project.delayRisk === 'high' ? 'error' :
                        project.delayRisk === 'medium' ? 'warning' :
                        'success'
                      } 
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        遅延リスク
                      </Typography>
                      <Typography variant="body2">
                        {project.delayRisk === 'high' ? '高' :
                         project.delayRisk === 'medium' ? '中' : '低'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                担当者
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>営</Avatar>
                    <Typography variant="body2">{project.sales}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>設</Avatar>
                    <Typography variant="body2">{project.design}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>IC</Avatar>
                    <Typography variant="body2">{project.ic}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>工</Avatar>
                    <Typography variant="body2">{project.construction}</Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`ランク ${project.grade}`}
                  color={
                    project.grade === 'S' ? 'warning' :
                    project.grade === 'A' ? 'primary' :
                    'default'
                  }
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={project.phase}
                  size="small"
                  sx={{
                    backgroundColor: phases.find(p => p.name.includes(project.phase.split('・')[0]))?.color || '#ccc',
                    color: 'white',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* タブ */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="タスク一覧" />
          <Tab label="フェーズ別表示" />
          <Tab label="活動履歴" />
          <Tab label="ファイル" />
        </Tabs>
      </Paper>
      
      {/* タスク一覧タブ */}
      <TabPanel value={tabValue} index={0}>
        {/* タスクフィルター */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="タスクを検索..."
            value={searchTask}
            onChange={(e) => setSearchTask(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label="すべて"
              onClick={() => setTaskFilter('all')}
              color={taskFilter === 'all' ? 'primary' : 'default'}
              variant={taskFilter === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label="未着手"
              onClick={() => setTaskFilter('pending')}
              color={taskFilter === 'pending' ? 'default' : 'default'}
              variant={taskFilter === 'pending' ? 'filled' : 'outlined'}
            />
            <Chip
              label="進行中"
              onClick={() => setTaskFilter('in_progress')}
              color={taskFilter === 'in_progress' ? 'primary' : 'default'}
              variant={taskFilter === 'in_progress' ? 'filled' : 'outlined'}
            />
            <Chip
              label="完了"
              onClick={() => setTaskFilter('completed')}
              color={taskFilter === 'completed' ? 'success' : 'default'}
              variant={taskFilter === 'completed' ? 'filled' : 'outlined'}
            />
            <Chip
              label="遅延"
              onClick={() => setTaskFilter('delayed')}
              color={taskFilter === 'delayed' ? 'error' : 'default'}
              variant={taskFilter === 'delayed' ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          {tasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircle 
                          color={task.status === 'completed' ? 'success' : 'disabled'} 
                          fontSize="small"
                        />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {task.stageName}
                        </Typography>
                        {task.priority === 'high' && (
                          <Chip label="重要" color="error" size="small" />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {task.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          担当: {task.assignee}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          期限: {task.dueDate ? format(new Date(task.dueDate), 'yyyy/MM/dd', { locale: ja }) : '未設定'}
                        </Typography>
                        {task.completedDate && (
                          <Typography variant="caption" color="success.main">
                            完了: {task.completedDate}
                          </Typography>
                        )}
                      </Box>
                      
                      {/* チェックリスト */}
                      {task.checklist.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            チェックリスト ({task.checklist.filter(c => c.completed).length}/{task.checklist.length})
                          </Typography>
                          <List dense sx={{ mt: 0 }}>
                            {task.checklist.map((item) => (
                              <ListItem key={item.id} sx={{ py: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <Checkbox 
                                    checked={item.completed} 
                                    size="small"
                                    disabled={task.status === 'completed'}
                                  />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={item.text}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                      
                      {/* コメント */}
                      {task.comments.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            コメント ({task.comments.length})
                          </Typography>
                          {task.comments.map((comment) => (
                            <Box key={comment.id} sx={{ mt: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" fontWeight="bold">
                                  {comment.author}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(new Date(comment.timestamp), 'MM/dd HH:mm', { locale: ja })}
                                </Typography>
                              </Box>
                              <Typography variant="body2">
                                {comment.text}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                      
                      {/* 添付ファイル */}
                      {task.attachments.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            添付ファイル ({task.attachments.length})
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                            {task.attachments.map((file) => (
                              <Chip
                                key={file.id}
                                icon={<AttachFile />}
                                label={`${file.name} (${file.size})`}
                                size="small"
                                variant="outlined"
                                onClick={() => {}}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                    
                    <Box>
                      <Chip
                        label={
                          task.status === 'completed' ? '完了' :
                          task.status === 'in_progress' ? '進行中' :
                          task.status === 'delayed' ? '遅延' :
                          '未着手'
                        }
                        color={
                          task.status === 'completed' ? 'success' :
                          task.status === 'in_progress' ? 'primary' :
                          task.status === 'delayed' ? 'error' :
                          'default'
                        }
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      
      {/* フェーズ別表示タブ */}
      <TabPanel value={tabValue} index={1}>
        {phases.map((phase) => {
          const phaseTasks = tasks.filter(t => {
            const stageIndex = allStages.indexOf(t.stageName);
            let startIndex = 0;
            for (let i = 0; i < parseInt(phase.id) - 1; i++) {
              startIndex += phases[i].stages;
            }
            const endIndex = startIndex + phase.stages;
            return stageIndex >= startIndex && stageIndex < endIndex;
          });
          
          const completedCount = phaseTasks.filter(t => t.status === 'completed').length;
          const phaseProgress = phaseTasks.length > 0 ? Math.round((completedCount / phaseTasks.length) * 100) : 0;
          
          return (
            <Card key={phase.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: phase.color }}>
                    {phase.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">
                      {completedCount}/{phaseTasks.length} 完了
                    </Typography>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={phaseProgress}
                        sx={{ 
                          height: 6,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: phase.color
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Grid container spacing={1}>
                  {phaseTasks.map((task) => (
                    <Grid item xs={12} sm={6} md={4} key={task.id}>
                      <Box
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          backgroundColor: task.status === 'completed' ? 'success.50' : 'background.paper',
                          opacity: task.status === 'completed' ? 0.8 : 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckCircle 
                            color={task.status === 'completed' ? 'success' : 'disabled'} 
                            sx={{ fontSize: 16 }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                            {task.stageName}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {task.assignee} | {task.dueDate ? format(new Date(task.dueDate), 'MM/dd') : '未定'}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          );
        })}
      </TabPanel>
      
      {/* 活動履歴タブ */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              最近の活動
            </Typography>
            <List>
              {tasks
                .filter(t => t.comments.length > 0)
                .flatMap(t => t.comments.map(c => ({ ...c, taskName: t.stageName })))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10)
                .map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '14px' }}>
                          {activity.author[0]}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                              <strong>{activity.author}</strong> が <strong>{activity.taskName}</strong> にコメント
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(activity.timestamp), 'MM/dd HH:mm', { locale: ja })}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {activity.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < 9 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* ファイルタブ */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                プロジェクトファイル
              </Typography>
              <Button variant="outlined" startIcon={<Add />} size="small">
                ファイルを追加
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {tasks
                .filter(t => t.attachments.length > 0)
                .flatMap(t => t.attachments.map(a => ({ ...a, taskName: t.stageName })))
                .map((file) => (
                  <Grid item xs={12} sm={6} md={4} key={file.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                          <AttachFile color="action" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {file.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {file.taskName} | {file.size}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {file.uploadedBy} | {format(new Date(file.uploadedAt), 'yyyy/MM/dd', { locale: ja })}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};