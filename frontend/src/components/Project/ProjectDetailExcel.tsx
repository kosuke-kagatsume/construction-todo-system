import React, { useState } from 'react';
import { useRouter } from 'next/router';
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
  RadioButtonUnchecked,
} from '@mui/icons-material';
import { mockProjects, getProjectDetails, phases, allStages } from '@/data/mockData';
import { sampleSharedItems, sharedItemDefinitions } from '@/data/sharedItems';
import { Select, MenuItem, FormControl } from '@mui/material';
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
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0); // Changed to 0 since we're swapping tab order
  const [newComment, setNewComment] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');
  const [searchTask, setSearchTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [editingSharedItems, setEditingSharedItems] = useState<{ [key: string]: boolean }>({});
  const [sharedItemValues, setSharedItemValues] = useState(sampleSharedItems.items);
  const [editingItems, setEditingItems] = useState<{ [itemId: string]: boolean }>({});
  
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
  
  const handleTaskToggle = (taskId: string) => {
    setCompletedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };
  
  const completedTasksCount = tasks.filter(t => t.status === 'completed' || completedTasks.includes(t.id)).length;
  const progressPercentage = Math.round((completedTasksCount / tasks.length) * 100);
  
  // 重要共有事項の取得
  const loanStatus = sharedItemValues['10']?.value || '未設定';
  const landStatus = sharedItemValues['9']?.value || '未設定';
  const loanStatusDef = sharedItemDefinitions.find(d => d.id === '10');
  const landStatusDef = sharedItemDefinitions.find(d => d.id === '9');
  
  const handleSharedItemSave = (itemId: string, value: string | number | boolean) => {
    setSharedItemValues({
      ...sharedItemValues,
      [itemId]: {
        itemId,
        value,
        updatedAt: new Date().toISOString(),
        updatedBy: '現在のユーザー',
      },
    });
    setEditingItems({ ...editingItems, [itemId]: false });
  };
  
  // カテゴリごとにグループ化（基本情報の営業・設計・IC・工務を除外）
  const excludedIds = ['4', '5', '6', '7']; // 営業、設計、IC、工務
  const filteredDefinitions = sharedItemDefinitions.filter(item => !excludedIds.includes(item.id));
  const groupedItems = filteredDefinitions.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as { [category: string]: typeof sharedItemDefinitions });
  
  const renderSharedItemValue = (def: typeof sharedItemDefinitions[0]) => {
    const value = sharedItemValues[def.id]?.value || null;
    const isEditing = editingItems[def.id];
    
    if (isEditing) {
      switch (def.type) {
        case 'select':
          return (
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={value || ''}
                onChange={(e) => handleSharedItemSave(def.id, e.target.value as string)}
                onBlur={() => setEditingItems({ ...editingItems, [def.id]: false })}
                autoFocus
                sx={{ 
                  height: 24,
                  fontSize: '12px',
                  '& .MuiSelect-select': { py: 0.25 },
                }}
              >
                <MenuItem value="" sx={{ fontSize: '12px' }}>
                  <em>未設定</em>
                </MenuItem>
                {def.options?.map(option => (
                  <MenuItem key={option} value={option} sx={{ fontSize: '12px' }}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        case 'text':
          return (
            <TextField
              size="small"
              value={value || ''}
              onChange={(e) => handleSharedItemSave(def.id, e.target.value)}
              onBlur={() => setEditingItems({ ...editingItems, [def.id]: false })}
              autoFocus
              sx={{
                width: 150,
                '& .MuiInputBase-input': {
                  fontSize: '12px',
                  py: 0.25,
                },
              }}
            />
          );
        case 'date':
          return (
            <TextField
              size="small"
              type="date"
              value={value || ''}
              onChange={(e) => handleSharedItemSave(def.id, e.target.value)}
              onBlur={() => setEditingItems({ ...editingItems, [def.id]: false })}
              autoFocus
              sx={{
                width: 130,
                '& .MuiInputBase-input': {
                  fontSize: '12px',
                  py: 0.25,
                },
              }}
            />
          );
        case 'boolean':
          return (
            <Checkbox
              size="small"
              checked={value === true}
              onChange={(e) => handleSharedItemSave(def.id, e.target.checked)}
              sx={{ p: 0 }}
            />
          );
        default:
          return null;
      }
    }
    
    // 表示モード
    if (value === null || value === '') {
      return (
        <Chip
          label="未設定"
          size="small"
          variant="outlined"
          sx={{ 
            height: 20,
            fontSize: '11px',
            color: 'text.secondary',
            borderColor: 'divider',
            cursor: 'pointer',
          }}
          onClick={() => setEditingItems({ ...editingItems, [def.id]: true })}
        />
      );
    }
    
    const getChipColor = () => {
      if (def.id === '10') { // ローン状況
        return value === '承認済' ? 'success' :
               value === '審査中' ? 'warning' :
               value === '申請前' ? 'default' : 'default';
      }
      if (def.id === '9') { // 土地状況
        return value === '所有' ? 'success' :
               value === '契約済' ? 'primary' :
               value === '検討中' ? 'warning' : 'default';
      }
      return 'default';
    };
    
    switch (def.type) {
      case 'boolean':
        return (
          <Chip
            label={value ? '有' : '無'}
            size="small"
            color={value ? 'success' : 'default'}
            variant={value ? 'filled' : 'outlined'}
            onClick={() => setEditingItems({ ...editingItems, [def.id]: true })}
            sx={{ 
              height: 24,
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s',
              '&:hover': { 
                transform: 'scale(1.05)',
                boxShadow: 2,
              },
            }}
          />
        );
      case 'date':
        return (
          <Chip
            label={format(new Date(value as string), 'yy/MM/dd')}
            size="small"
            variant="outlined"
            onClick={() => setEditingItems({ ...editingItems, [def.id]: true })}
            sx={{ 
              height: 24,
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s',
              '&:hover': { 
                transform: 'scale(1.05)',
                boxShadow: 2,
              },
            }}
          />
        );
      default:
        return (
          <Chip
            label={value as string}
            size="small"
            color={getChipColor() as any}
            onClick={() => setEditingItems({ ...editingItems, [def.id]: true })}
            sx={{ 
              height: 24,
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s',
              '&:hover': { 
                transform: 'scale(1.05)',
                boxShadow: 2,
              },
            }}
          />
        );
    }
  };
  
  return (
    <Box>
      {/* プロジェクト概要カード */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {/* ヘッダー部分 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {project.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {project.customer} 様
              </Typography>
            </Box>
            
            {/* 担当者情報 */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              p: 1.5,
              backgroundColor: 'grey.50',
              borderRadius: 1,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: 'primary.main', color: 'white' }}>営</Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>営業</Typography>
                  <Typography variant="body2" sx={{ fontSize: '12px' }}>{project.sales}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: 'secondary.main', color: 'white' }}>設</Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>設計</Typography>
                  <Typography variant="body2" sx={{ fontSize: '12px' }}>{project.design}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: 'info.main', color: 'white' }}>IC</Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>IC</Typography>
                  <Typography variant="body2" sx={{ fontSize: '12px' }}>{project.ic}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: 'warning.main', color: 'white' }}>工</Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>工務</Typography>
                  <Typography variant="body2" sx={{ fontSize: '12px' }}>{project.construction}</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* ランクとフェーズ */}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Chip 
                label={`ランク ${project.grade}`}
                color={
                  project.grade === 'S' ? 'warning' :
                  project.grade === 'A' ? 'primary' :
                  'default'
                }
                size="small"
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
          </Box>
          
          {/* 共有事項 */}
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: 'grey.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              共有事項
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(groupedItems).map(([category, items]) => (
                <Grid item xs={12} md={6} lg={3} key={category}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block',
                      mb: 1,
                      fontWeight: 'medium',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: '10px',
                    }}
                  >
                    {category}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {items.map(def => (
                      <Box key={def.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: '11px', minWidth: '60px' }}
                        >
                          {def.name}:
                        </Typography>
                        {renderSharedItemValue(def)}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          {/* 進捗状況と基本情報 */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">進捗状況</Typography>
              <Typography variant="body2" fontWeight="bold">
                {progressPercentage}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ height: 8, borderRadius: 4, mb: 3 }}
            />
            
            <Grid container spacing={2}>
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
          </Box>
        </CardContent>
      </Card>
      
      {/* タブ */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="フェーズ別表示" />
          <Tab label="タスク一覧" />
          <Tab label="活動履歴" />
          <Tab label="ファイル" />
        </Tabs>
      </Paper>
      
      {/* タスク一覧タブ */}
      <TabPanel value={tabValue} index={1}>
        {/* タスクフィルター */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
          
          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
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
          
          <Typography variant="body2" color="text.secondary">
            {tasks.length} 件のタスク
          </Typography>
        </Box>
        
        {/* タスクリスト改善版 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            
            if (phaseTasks.length === 0) return null;
            
            return (
              <Box key={phase.id}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 1,
                  p: 1,
                  backgroundColor: phase.color + '10',
                  borderRadius: 1,
                  borderLeft: `4px solid ${phase.color}`,
                }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ color: phase.color, fontWeight: 'bold' }}
                  >
                    {phase.name}
                  </Typography>
                  <Chip 
                    label={`${phaseTasks.filter(t => t.status === 'completed' || completedTasks.includes(t.id)).length}/${phaseTasks.length}`}
                    size="small"
                    sx={{ height: 20, fontSize: '11px' }}
                  />
                </Box>
                
                <Grid container spacing={1.5}>
                  {phaseTasks.map((task) => (
                    <Grid item xs={12} md={6} lg={4} key={task.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          borderLeft: `3px solid ${
                            task.status === 'completed' ? '#4caf50' :
                            task.status === 'in_progress' ? '#2196f3' :
                            task.status === 'delayed' ? '#f44336' :
                            '#e0e0e0'
                          }`,
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s',
                          },
                        }}
                        onClick={() => router.push(`/projects/${projectId}/tasks/${encodeURIComponent(task.stageName)}`)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
                              <Checkbox
                                size="small"
                                checked={task.status === 'completed' || completedTasks.includes(task.id)}
                                onChange={() => handleTaskToggle(task.id)}
                                onClick={(e) => e.stopPropagation()}
                                icon={<RadioButtonUnchecked />}
                                checkedIcon={<CheckCircle />}
                                sx={{
                                  p: 0,
                                  color: 'grey.400',
                                  '&.Mui-checked': {
                                    color: 'success.main',
                                  }
                                }}
                              />
                              <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '14px' }}>
                                {task.stageName}
                              </Typography>
                            </Box>
                            {task.priority === 'high' && (
                              <Box 
                                sx={{ 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  backgroundColor: 'error.main',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Avatar sx={{ width: 20, height: 20, fontSize: '10px', bgcolor: 'primary.main', color: 'white' }}>
                              {task.assignee[0]}
                            </Avatar>
                            <Typography variant="caption" color="text.secondary">
                              {task.assignee}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              • {task.dueDate ? format(new Date(task.dueDate), 'MM/dd') : '期限未定'}
                            </Typography>
                          </Box>
                          
                          {task.checklist.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={(task.checklist.filter(c => c.completed).length / task.checklist.length) * 100}
                                sx={{ height: 4, borderRadius: 2 }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                                チェック: {task.checklist.filter(c => c.completed).length}/{task.checklist.length}
                              </Typography>
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {task.comments.length > 0 && (
                              <Chip
                                icon={<Comment sx={{ fontSize: 14 }} />}
                                label={task.comments.length}
                                size="small"
                                sx={{ height: 20, fontSize: '11px' }}
                              />
                            )}
                            {task.attachments.length > 0 && (
                              <Chip
                                icon={<AttachFile sx={{ fontSize: 14 }} />}
                                label={task.attachments.length}
                                size="small"
                                sx={{ height: 20, fontSize: '11px' }}
                              />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}
        </Box>
      </TabPanel>
      
      {/* フェーズ別表示タブ - カンバンスタイル */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto',
          pb: 2,
          minHeight: '600px',
        }}>
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
            
            const completedCount = phaseTasks.filter(t => t.status === 'completed' || completedTasks.includes(t.id)).length;
            const phaseProgress = phaseTasks.length > 0 ? Math.round((completedCount / phaseTasks.length) * 100) : 0;
            
            return (
              <Paper 
                key={phase.id} 
                sx={{ 
                  minWidth: 320,
                  maxWidth: 320,
                  backgroundColor: 'grey.50',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
                elevation={0}
              >
                {/* フェーズヘッダー */}
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: phase.color,
                  color: 'white',
                }}>
                  <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold', mb: 1 }}>
                    {phase.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {completedCount}/{phaseTasks.length} タスク完了
                    </Typography>
                    <Chip 
                      label={`${phaseProgress}%`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={phaseProgress}
                    sx={{ 
                      mt: 1,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                      }
                    }}
                  />
                </Box>
                
                {/* タスクリスト */}
                <Box sx={{ 
                  flex: 1, 
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}>
                  {phaseTasks.map((task) => (
                    <Card 
                      key={task.id}
                      sx={{ 
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => router.push(`/projects/${projectId}/tasks/${encodeURIComponent(task.stageName)}`)}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        {/* タスク名とステータス */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, flex: 1 }}>
                            <Checkbox
                              size="small"
                              checked={task.status === 'completed' || completedTasks.includes(task.id)}
                              onChange={() => handleTaskToggle(task.id)}
                              onClick={(e) => e.stopPropagation()}
                              icon={<RadioButtonUnchecked />}
                              checkedIcon={<CheckCircle />}
                              sx={{
                                p: 0,
                                mt: 0.2,
                                color: 'grey.300',
                                '&.Mui-checked': {
                                  color: 'success.main',
                                }
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                                {task.stageName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                {task.description}
                              </Typography>
                            </Box>
                          </Box>
                          {task.priority === 'high' && (
                            <Chip 
                              label="重要" 
                              size="small" 
                              sx={{ 
                                height: 18,
                                fontSize: '10px',
                                backgroundColor: 'error.main',
                                color: 'white',
                              }} 
                            />
                          )}
                        </Box>
                        
                        {/* 担当者と期限 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: 'grey.400', color: 'white' }}>
                              {task.assignee[0]}
                            </Avatar>
                            <Typography variant="caption" color="text.secondary">
                              {task.assignee}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {task.dueDate ? format(new Date(task.dueDate), 'MM/dd') : '未定'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* プログレスバー */}
                        {task.checklist.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                チェックリスト
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {task.checklist.filter(c => c.completed).length}/{task.checklist.length}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={(task.checklist.filter(c => c.completed).length / task.checklist.length) * 100}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: 'grey.200',
                              }}
                            />
                          </Box>
                        )}
                        
                        {/* メタ情報 */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          {task.comments.length > 0 && (
                            <Chip
                              icon={<Comment sx={{ fontSize: 14 }} />}
                              label={task.comments.length}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22, fontSize: '11px' }}
                            />
                          )}
                          {task.attachments.length > 0 && (
                            <Chip
                              icon={<AttachFile sx={{ fontSize: 14 }} />}
                              label={task.attachments.length}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22, fontSize: '11px' }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            );
          })}
        </Box>
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
                        <Avatar sx={{ width: 32, height: 32, fontSize: '14px', bgcolor: 'grey.500', color: 'white' }}>
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