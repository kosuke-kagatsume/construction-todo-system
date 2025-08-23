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
          <Tab label="予測日程表" />
          <Tab label="フェーズ別表示" />
          <Tab label="タスク一覧" />
          <Tab label="活動履歴" />
          <Tab label="ファイル" />
        </Tabs>
      </Paper>
      
      {/* 予測日程表タブ */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                工程予測日程表
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  全 {tasks.length} 工程
                </Typography>
                <Chip
                  label={`進捗 ${progressPercentage}%`}
                  color="primary"
                  size="small"
                />
              </Box>
            </Box>

            {/* 工程表 */}
            <Box sx={{ 
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden',
            }}>
              {/* ヘッダー */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '200px 80px 80px 100px 120px 120px 120px 1fr',
                backgroundColor: '#f5f5f5',
                borderBottom: '1px solid #e0e0e0',
                fontWeight: 'bold',
                fontSize: '12px',
              }}>
                <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0' }}>工程名</Box>
                <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0' }}>担当者</Box>
                <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0' }}>所要日数</Box>
                <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0' }}>状態</Box>
                <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0' }}>実施日程</Box>
                <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0' }}>予測日程</Box>
                <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0' }}>遅延日数</Box>
                <Box sx={{ p: 1 }}>備考</Box>
              </Box>

              {/* データ行 */}
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

                return phaseTasks.map((task, taskIndex) => {
                  const isCompleted = task.status === 'completed';
                  const actualDate = task.completedDate;
                  const predictedDate = task.predictedDate;
                  const delayDays = actualDate && predictedDate ? 
                    Math.ceil((new Date(actualDate).getTime() - new Date(predictedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

                  return (
                    <Box 
                      key={task.id}
                      sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '200px 80px 80px 100px 120px 120px 120px 1fr',
                        borderBottom: '1px solid #e0e0e0',
                        '&:hover': { backgroundColor: '#f9f9f9' },
                        backgroundColor: taskIndex === 0 ? `${phase.color}10` : 'white',
                      }}
                    >
                      <Box sx={{ 
                        p: 1, 
                        borderRight: '1px solid #e0e0e0',
                        fontSize: '12px',
                        borderLeft: taskIndex === 0 ? `3px solid ${phase.color}` : 'none',
                        fontWeight: taskIndex === 0 ? 'bold' : 'normal',
                      }}>
                        {task.stageName}
                      </Box>
                      <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', fontSize: '11px' }}>
                        {task.assignee}
                      </Box>
                      <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', fontSize: '11px', textAlign: 'center' }}>
                        {task.duration}日
                      </Box>
                      <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0' }}>
                        <Chip
                          label={
                            task.status === 'completed' ? '完了' :
                            task.status === 'in_progress' ? '進行中' :
                            task.status === 'delayed' ? '遅延' : '未着手'
                          }
                          size="small"
                          color={
                            task.status === 'completed' ? 'success' :
                            task.status === 'in_progress' ? 'primary' :
                            task.status === 'delayed' ? 'error' : 'default'
                          }
                          sx={{ height: 20, fontSize: '10px' }}
                        />
                      </Box>
                      <Box sx={{ 
                        p: 1, 
                        borderRight: '1px solid #e0e0e0', 
                        fontSize: '11px',
                        fontWeight: actualDate ? 'bold' : 'normal',
                        color: actualDate ? '#2e7d32' : '#666',
                      }}>
                        {actualDate ? format(new Date(actualDate), 'M/d') : '-'}
                      </Box>
                      <Box sx={{ 
                        p: 1, 
                        borderRight: '1px solid #e0e0e0', 
                        fontSize: '11px',
                        fontWeight: predictedDate && !actualDate ? 'bold' : 'normal',
                        color: predictedDate && !actualDate ? '#1565c0' : '#666',
                      }}>
                        {predictedDate ? format(new Date(predictedDate), 'M/d') : '-'}
                      </Box>
                      <Box sx={{ 
                        p: 1, 
                        borderRight: '1px solid #e0e0e0', 
                        fontSize: '11px',
                        textAlign: 'center',
                        color: delayDays > 0 ? '#f44336' : '#666',
                        fontWeight: delayDays > 0 ? 'bold' : 'normal',
                      }}>
                        {delayDays > 0 ? `+${delayDays}日` : delayDays < 0 ? `${delayDays}日` : '-'}
                      </Box>
                      <Box sx={{ p: 1, fontSize: '11px', color: '#666' }}>
                        {task.description}
                      </Box>
                    </Box>
                  );
                });
              })}
            </Box>

            {/* 予測日程の説明 */}
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                予測日程について
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                • 各工程の予測日程は、前工程の完了日（実績または予測）+ 所要日数で自動計算されます<br />
                • 営業日ベース（土日祝日除く）で計算されています<br />
                • 実績が入力されると、それ以降の工程の予測日程が自動更新されます<br />
                • 遅延日数は実施日程と予測日程の差分です
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* フェーズ別表示タブ */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
              フェーズ別進捗
            </Typography>
            {/* フェーズ別の内容をここに追加 */}
            <Typography variant="body2" color="text.secondary">
              フェーズ別の詳細表示機能を実装予定
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* タスク一覧タブ */}
      <TabPanel value={tabValue} index={2}>
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
      
      {/* 活動履歴タブ */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
              活動履歴
            </Typography>
            <Typography variant="body2" color="text.secondary">
              活動履歴機能を実装予定
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* ファイルタブ */}
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
              ファイル管理
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ファイル管理機能を実装予定
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

    </Box>
  );
};
