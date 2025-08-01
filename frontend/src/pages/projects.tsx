import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Avatar,
  Tooltip,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Search,
  Edit,
  Delete,
  Visibility,
  Archive,
  CalendarToday,
  AttachMoney,
  Person,
  Category,
  CheckCircle,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { mockProjects, phases } from '@/data/mockData';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { defaultTemplates, generateTasksFromTemplate } from '@/data/projectTemplates';

export default function ProjectsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateStep, setTemplateStep] = useState(0); // 0: テンプレート選択, 1: プロジェクト詳細
  const [newProject, setNewProject] = useState({
    name: '',
    customer: '',
    grade: 'B',
    phase: '追客・設計',
    sales: '',
    design: '',
    ic: '',
    construction: '',
    budget: 0,
    startDate: '',
    completionDate: '',
    productType: '',
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, projectId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(projectId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleViewProject = () => {
    if (selectedProject) {
      router.push(`/projects/${selectedProject}`);
    }
    handleMenuClose();
  };

  const handleCreateProject = () => {
    // テンプレートからタスクを生成
    if (selectedTemplate && newProject.startDate) {
      const tasks = generateTasksFromTemplate(
        selectedTemplate,
        new Date(newProject.startDate),
        {
          sales: newProject.sales,
          design: newProject.design,
          ic: newProject.ic,
          construction: newProject.construction,
        }
      );
      console.log('Generated tasks:', tasks);
    }
    
    // TODO: API call to create project
    console.log('Creating project:', newProject);
    setOpenDialog(false);
    setTemplateStep(0);
    setSelectedTemplate('');
    setNewProject({
      name: '',
      customer: '',
      grade: 'B',
      phase: '追客・設計',
      sales: '',
      design: '',
      ic: '',
      construction: '',
      budget: 0,
      startDate: '',
      completionDate: '',
      productType: '',
    });
  };
  
  const handleTemplateSelect = () => {
    const template = defaultTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      setNewProject({
        ...newProject,
        productType: template.productType,
      });
      setTemplateStep(1);
    }
  };
  
  const handleDialogClose = () => {
    setOpenDialog(false);
    setTemplateStep(0);
    setSelectedTemplate('');
  };

  const filteredProjects = mockProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            プロジェクト管理
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            新規プロジェクト
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="プロジェクト名または顧客名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>プロジェクト名</TableCell>
                <TableCell>顧客名</TableCell>
                <TableCell>フェーズ</TableCell>
                <TableCell>ランク</TableCell>
                <TableCell>進捗</TableCell>
                <TableCell>担当者</TableCell>
                <TableCell>開始日</TableCell>
                <TableCell>完成予定</TableCell>
                <TableCell>予算</TableCell>
                <TableCell align="center">アクション</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {project.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{project.customer}</TableCell>
                  <TableCell>
                    <Chip
                      label={project.phase}
                      size="small"
                      sx={{
                        backgroundColor: phases.find(p => p.name.includes(project.phase.split('・')[0]))?.color || '#ccc',
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.grade}
                      size="small"
                      color={
                        project.grade === 'S' ? 'warning' :
                        project.grade === 'A' ? 'primary' :
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 60, mr: 1 }}>
                        <Box sx={{ 
                          position: 'relative',
                          width: '100%',
                          height: 6,
                          backgroundColor: 'grey.200',
                          borderRadius: 3,
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ 
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: `${project.progress}%`,
                            backgroundColor: 
                              project.progress === 100 ? 'success.main' :
                              project.progress >= 75 ? 'info.main' :
                              project.progress >= 50 ? 'warning.main' :
                              'error.main',
                            transition: 'width 0.3s ease'
                          }} />
                        </Box>
                      </Box>
                      <Typography variant="caption">
                        {project.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={`営業: ${project.sales}`}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '10px' }}>営</Avatar>
                      </Tooltip>
                      <Tooltip title={`設計: ${project.design}`}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '10px' }}>設</Avatar>
                      </Tooltip>
                      <Tooltip title={`IC: ${project.ic}`}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '10px' }}>IC</Avatar>
                      </Tooltip>
                      <Tooltip title={`工務: ${project.construction}`}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '10px' }}>工</Avatar>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(project.startDate), 'yyyy/MM/dd', { locale: ja })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(project.completionDate), 'yyyy/MM/dd', { locale: ja })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      ¥{(project.budget / 1000000).toFixed(1)}M
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, project.id)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewProject}>
            <Visibility fontSize="small" sx={{ mr: 1 }} />
            詳細を表示
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            編集
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Archive fontSize="small" sx={{ mr: 1 }} />
            アーカイブ
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            削除
          </MenuItem>
        </Menu>

        {/* 新規プロジェクト作成ダイアログ */}
        <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {templateStep === 0 ? 'プロジェクトテンプレートを選択' : '新規プロジェクト作成'}
          </DialogTitle>
          <DialogContent>
            {templateStep === 0 ? (
              // テンプレート選択画面
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  プロジェクトの種類に応じたテンプレートを選択してください。
                  各テンプレートには標準的なタスクと工程が設定されています。
                </Alert>
                <RadioGroup
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <Grid container spacing={2}>
                    {defaultTemplates.filter(t => t.isActive).map((template) => (
                      <Grid item xs={12} key={template.id}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            border: selectedTemplate === template.id ? '2px solid' : '1px solid',
                            borderColor: selectedTemplate === template.id ? 'primary.main' : 'grey.300',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-2px)',
                              boxShadow: 3,
                            },
                          }}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <Radio
                                value={template.id}
                                checked={selectedTemplate === template.id}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Typography variant="h6" component="span">
                                    {template.icon} {template.name}
                                  </Typography>
                                  <Chip
                                    label={template.productType}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {template.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      標準工期: {template.defaultDuration}日
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CheckCircle sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      タスク数: {template.tasks.length}個
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    主な工程:
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                    {template.tasks.slice(0, 5).map((task) => (
                                      <Chip
                                        key={task.id}
                                        label={task.name}
                                        size="small"
                                        sx={{ height: 20, fontSize: '11px' }}
                                      />
                                    ))}
                                    {template.tasks.length > 5 && (
                                      <Chip
                                        label={`他${template.tasks.length - 5}件`}
                                        size="small"
                                        sx={{ height: 20, fontSize: '11px' }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </Box>
            ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="プロジェクト名（邸名）"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="顧客名"
                  value={newProject.customer}
                  onChange={(e) => setNewProject({ ...newProject, customer: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>ランク</InputLabel>
                  <Select
                    value={newProject.grade}
                    onChange={(e) => setNewProject({ ...newProject, grade: e.target.value })}
                    label="ランク"
                  >
                    <MenuItem value="S">S</MenuItem>
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="C">C</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>フェーズ</InputLabel>
                  <Select
                    value={newProject.phase}
                    onChange={(e) => setNewProject({ ...newProject, phase: e.target.value })}
                    label="フェーズ"
                  >
                    {phases.map((phase) => (
                      <MenuItem key={phase.id} value={phase.name}>
                        {phase.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="予算（円）"
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="営業担当"
                  value={newProject.sales}
                  onChange={(e) => setNewProject({ ...newProject, sales: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="設計担当"
                  value={newProject.design}
                  onChange={(e) => setNewProject({ ...newProject, design: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="IC担当"
                  value={newProject.ic}
                  onChange={(e) => setNewProject({ ...newProject, ic: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="工務担当"
                  value={newProject.construction}
                  onChange={(e) => setNewProject({ ...newProject, construction: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="開始日"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="完成予定日"
                  type="date"
                  value={newProject.completionDate}
                  onChange={(e) => setNewProject({ ...newProject, completionDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>キャンセル</Button>
            {templateStep === 0 ? (
              <Button 
                onClick={handleTemplateSelect} 
                variant="contained"
                disabled={!selectedTemplate}
                startIcon={<Category />}
              >
                次へ
              </Button>
            ) : (
              <>
                <Button onClick={() => setTemplateStep(0)}>戻る</Button>
                <Button 
                  onClick={handleCreateProject} 
                  variant="contained"
                  disabled={!newProject.name || !newProject.customer}
                >
                  作成
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}