import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Tabs, 
  Tab, 
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Badge,
  Collapse,
  Button,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { mockProjects, phases, allStages } from '@/data/mockData';
import { 
  Search, 
  FilterList, 
  Clear,
  ExpandMore,
  ExpandLess,
  Sort,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

// エクセル風のスタイル定義
const ExcelContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: 'calc(100vh - 200px)',
  overflow: 'hidden',
  border: '1px solid #d0d0d0',
  borderRadius: 0,
  backgroundColor: '#ffffff',
}));

const ExcelGrid = styled('div')({
  display: 'flex',
  height: '100%',
  position: 'relative',
});

const FixedColumn = styled('div')({
  position: 'sticky',
  left: 0,
  zIndex: 2,
  backgroundColor: '#f8f9fa',
  borderRight: '2px solid #e0e0e0',
  minWidth: '330px',
  overflowY: 'auto',
  overflowX: 'hidden',
});

const ScrollableArea = styled('div')({
  flex: 1,
  overflowX: 'auto',
  overflowY: 'auto',
  backgroundColor: '#ffffff',
});

const GridTable = styled('div')({
  display: 'inline-block',
  minWidth: 'max-content',
});

const GridRow = styled('div')({
  display: 'flex',
  borderBottom: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: '#f8f8f8',
  },
});

const GridCell = styled('div')<{ width?: number; isHeader?: boolean; isFixed?: boolean }>(
  ({ width = 120, isHeader, isFixed }) => ({
    width: `${width}px`,
    minWidth: `${width}px`,
    padding: '4px 8px',
    borderRight: '1px solid #e0e0e0',
    fontSize: '12px',
    fontFamily: '"メイリオ", "Meiryo", sans-serif',
    backgroundColor: isHeader ? '#1976d2' : isFixed ? '#f8f9fa' : '#ffffff',
    color: isHeader ? '#ffffff' : '#000000',
    fontWeight: isHeader ? 'bold' : 'normal',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    position: 'relative',
    cursor: 'cell',
    userSelect: 'none',
  })
);

const PhaseHeader = styled('div')<{ color: string }>(({ color }) => ({
  backgroundColor: color,
  color: '#ffffff',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 'bold',
  textAlign: 'center',
  borderBottom: '1px solid #d0d0d0',
}));

const StatusCell = styled(GridCell)<{ status?: string }>(({ status }) => ({
  backgroundColor: 
    status === 'COMPLETED' ? '#e8f5e9' :
    status === 'IN_PROGRESS' ? '#e3f2fd' :
    status === 'DELAYED' ? '#ffebee' :
    '#ffffff',
  color:
    status === 'COMPLETED' ? '#2e7d32' :
    status === 'IN_PROGRESS' ? '#1565c0' :
    status === 'DELAYED' ? '#c62828' :
    '#000000',
  fontWeight: status ? '500' : 'normal',
}));

// タブスタイル
const ExcelTabs = styled(Tabs)({
  minHeight: '30px',
  backgroundColor: '#f0f0f0',
  borderBottom: '1px solid #d0d0d0',
  '& .MuiTab-root': {
    minHeight: '30px',
    padding: '4px 16px',
    fontSize: '12px',
    fontFamily: '"メイリオ", "Meiryo", sans-serif',
    textTransform: 'none',
    backgroundColor: '#e0e0e0',
    border: '1px solid #d0d0d0',
    borderBottom: 'none',
    marginRight: '2px',
    '&.Mui-selected': {
      backgroundColor: '#ffffff',
      color: '#000000',
    },
  },
});

// 進捗率に応じた行の背景色を決定
const getRowBackgroundColor = (progress: number, delayRisk: string) => {
  if (delayRisk === 'high') return 'rgba(255, 0, 0, 0.05)';
  if (progress === 100) return 'rgba(76, 175, 80, 0.05)';
  if (progress >= 75) return 'rgba(33, 150, 243, 0.03)';
  return 'transparent';
};

interface FilterState {
  search: string;
  phase: string;
  grade: string;
  assignee: string;
  status: string;
  delayRisk: string;
}

type SortField = 'name' | 'rank' | 'phase' | 'foundation' | 'roofing' | 'progress';
type SortDirection = 'asc' | 'desc';

export const ConstructionBoardExcel: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    phase: 'all',
    grade: 'all',
    assignee: 'all',
    status: 'all',
    delayRisk: 'all',
  });
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const router = useRouter();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };
  
  const handleFilterChange = (field: keyof FilterState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      phase: 'all',
      grade: 'all',
      assignee: 'all',
      status: 'all',
      delayRisk: 'all',
    });
  };
  
  // Get unique assignees
  const allAssignees = useMemo(() => {
    const assignees = new Set<string>();
    mockProjects.forEach(project => {
      assignees.add(project.sales);
      assignees.add(project.design);
      assignees.add(project.ic);
      assignees.add(project.construction);
    });
    return Array.from(assignees).sort();
  }, []);
  
  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    // First filter
    const filtered = mockProjects.filter(project => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!project.name.toLowerCase().includes(searchLower) &&
            !project.customer.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Phase filter
      if (filters.phase !== 'all' && !project.phase.includes(filters.phase)) {
        return false;
      }
      
      // Grade filter
      if (filters.grade !== 'all' && project.grade !== filters.grade) {
        return false;
      }
      
      // Assignee filter
      if (filters.assignee !== 'all') {
        if (project.sales !== filters.assignee &&
            project.design !== filters.assignee &&
            project.ic !== filters.assignee &&
            project.construction !== filters.assignee) {
          return false;
        }
      }
      
      // Status filter
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }
      
      // Delay risk filter
      if (filters.delayRisk !== 'all' && project.delayRisk !== filters.delayRisk) {
        return false;
      }
      
      return true;
    });
    
    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortField) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'rank':
          const rankOrder: { [key: string]: number } = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 };
          compareValue = rankOrder[a.grade] - rankOrder[b.grade];
          break;
        case 'phase':
          const phaseOrder: { [key: string]: number } = phases.reduce((acc, phase, index) => ({ ...acc, [phase.name]: index }), {});
          compareValue = (phaseOrder[a.phase] || 999) - (phaseOrder[b.phase] || 999);
          break;
        case 'foundation':
          const aFoundationDate = a.stages['基礎着工'] ? new Date(a.stages['基礎着工']).getTime() : Infinity;
          const bFoundationDate = b.stages['基礎着工'] ? new Date(b.stages['基礎着工']).getTime() : Infinity;
          compareValue = aFoundationDate - bFoundationDate;
          break;
        case 'roofing':
          const aRoofingDate = a.stages['上棟'] ? new Date(a.stages['上棟']).getTime() : Infinity;
          const bRoofingDate = b.stages['上棟'] ? new Date(b.stages['上棟']).getTime() : Infinity;
          compareValue = aRoofingDate - bRoofingDate;
          break;
        case 'progress':
          compareValue = b.progress - a.progress;
          break;
      }
      
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
    
    return sorted;
  }, [filters, sortField, sortDirection]);
  
  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length;

  return (
    <Box>
      {/* フィルターセクション */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: showFilters ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '16px' }}>
              フィルター
            </Typography>
            <Badge badgeContent={activeFilterCount} color="primary">
              <FilterList />
            </Badge>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeFilterCount > 0 && (
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={clearFilters}
              >
                クリア
              </Button>
            )}
            <IconButton
              size="small"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>
        
        <Collapse in={showFilters}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <TextField
                fullWidth
                size="small"
                label="検索（邸名・顧客名）"
                value={filters.search}
                onChange={handleFilterChange('search')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={3} lg={2}>
              <FormControl fullWidth size="small">
                <InputLabel>フェーズ</InputLabel>
                <Select
                  value={filters.phase}
                  onChange={handleFilterChange('phase')}
                  label="フェーズ"
                >
                  <MenuItem value="all">すべて</MenuItem>
                  {phases.map(phase => (
                    <MenuItem key={phase.id} value={phase.name.split('・')[0]}>
                      {phase.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={3} lg={2}>
              <FormControl fullWidth size="small">
                <InputLabel>ランク</InputLabel>
                <Select
                  value={filters.grade}
                  onChange={handleFilterChange('grade')}
                  label="ランク"
                >
                  <MenuItem value="all">すべて</MenuItem>
                  <MenuItem value="S">S</MenuItem>
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                  <MenuItem value="C">C</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={3} lg={2}>
              <FormControl fullWidth size="small">
                <InputLabel>担当者</InputLabel>
                <Select
                  value={filters.assignee}
                  onChange={handleFilterChange('assignee')}
                  label="担当者"
                >
                  <MenuItem value="all">すべて</MenuItem>
                  {allAssignees.map(assignee => (
                    <MenuItem key={assignee} value={assignee}>
                      {assignee}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={3} lg={2}>
              <FormControl fullWidth size="small">
                <InputLabel>ステータス</InputLabel>
                <Select
                  value={filters.status}
                  onChange={handleFilterChange('status')}
                  label="ステータス"
                >
                  <MenuItem value="all">すべて</MenuItem>
                  <MenuItem value="PLANNING">計画中</MenuItem>
                  <MenuItem value="IN_PROGRESS">進行中</MenuItem>
                  <MenuItem value="COMPLETED">完了</MenuItem>
                  <MenuItem value="ON_HOLD">保留中</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={3} lg={2}>
              <FormControl fullWidth size="small">
                <InputLabel>遅延リスク</InputLabel>
                <Select
                  value={filters.delayRisk}
                  onChange={handleFilterChange('delayRisk')}
                  label="遅延リスク"
                >
                  <MenuItem value="all">すべて</MenuItem>
                  <MenuItem value="low">低</MenuItem>
                  <MenuItem value="medium">中</MenuItem>
                  <MenuItem value="high">高</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>
      
      {/* クイックフィルターと並び替え */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="進行中のみ"
            onClick={() => setFilters({ ...filters, status: filters.status === 'IN_PROGRESS' ? 'all' : 'IN_PROGRESS' })}
            color={filters.status === 'IN_PROGRESS' ? 'primary' : 'default'}
            variant={filters.status === 'IN_PROGRESS' ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip
            label="遅延リスク高"
            onClick={() => setFilters({ ...filters, delayRisk: filters.delayRisk === 'high' ? 'all' : 'high' })}
            color={filters.delayRisk === 'high' ? 'error' : 'default'}
            variant={filters.delayRisk === 'high' ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip
            label="施工フェーズ"
            onClick={() => setFilters({ ...filters, phase: filters.phase === '施工' ? 'all' : '施工' })}
            color={filters.phase === '施工' ? 'primary' : 'default'}
            variant={filters.phase === '施工' ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip
            label="ランクS"
            onClick={() => setFilters({ ...filters, grade: filters.grade === 'S' ? 'all' : 'S' })}
            color={filters.grade === 'S' ? 'warning' : 'default'}
            variant={filters.grade === 'S' ? 'filled' : 'outlined'}
            size="small"
          />
        </Box>
        
        {/* 並び替えコントロール */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sort fontSize="small" />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              displayEmpty
            >
              <MenuItem value="name">邸名</MenuItem>
              <MenuItem value="rank">ランク</MenuItem>
              <MenuItem value="phase">フェーズ</MenuItem>
              <MenuItem value="foundation">基礎着工日</MenuItem>
              <MenuItem value="roofing">上棟日</MenuItem>
              <MenuItem value="progress">進捗率</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={sortDirection}
            exclusive
            onChange={(e, newDirection) => newDirection && setSortDirection(newDirection)}
            size="small"
          >
            <ToggleButton value="asc" aria-label="昇順">
              <ArrowUpward fontSize="small" />
            </ToggleButton>
            <ToggleButton value="desc" aria-label="降順">
              <ArrowDownward fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      
      {/* 検索結果 */}
      {(filters.search || activeFilterCount > 0) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredProjects.length} 件のプロジェクトが見つかりました
            {filters.search && ` (検索: "${filters.search}")`}
          </Typography>
        </Box>
      )}
      
      <ExcelTabs value={tabValue} onChange={handleTabChange}>
        <Tab label="実施済日程ボード" />
        <Tab label="予測日程ボード" />
        <Tab label="実施・予測日程ボード" />
        <Tab label="一覧確認" />
      </ExcelTabs>

      <ExcelContainer elevation={0}>
        <ExcelGrid>
          {/* 固定列（プロジェクト情報） */}
          <FixedColumn>
            {/* ヘッダー */}
            <GridRow style={{ position: 'sticky', top: 0, zIndex: 3 }}>
              <GridCell width={80} isHeader>邸名</GridCell>
              <GridCell width={80} isHeader>顧客名</GridCell>
              <GridCell width={50} isHeader>ランク</GridCell>
              <GridCell width={50} isHeader>進捗</GridCell>
              <GridCell width={70} isHeader>フェーズ</GridCell>
            </GridRow>
            {/* データ行 */}
            {filteredProjects.map((project) => (
              <GridRow 
                key={project.id}
                style={{ 
                  backgroundColor: getRowBackgroundColor(project.progress, project.delayRisk),
                  cursor: 'pointer'
                }}
                onClick={() => handleProjectClick(project.id)}
              >
                <GridCell width={80} isFixed>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {project.name}
                    {project.delayRisk === 'high' && (
                      <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold' }}>!</Typography>
                    )}
                  </Box>
                </GridCell>
                <GridCell width={80} isFixed>{project.customer}</GridCell>
                <GridCell width={50} isFixed>
                  <Chip 
                    label={project.grade} 
                    size="small" 
                    sx={{ 
                      height: 18, 
                      fontSize: '11px',
                      backgroundColor: 
                        project.grade === 'S' ? '#ffd700' :
                        project.grade === 'A' ? '#c0c0c0' :
                        project.grade === 'B' ? '#cd7f32' :
                        '#e0e0e0',
                      color: project.grade === 'S' ? '#000' : '#fff'
                    }} 
                  />
                </GridCell>
                <GridCell width={50} isFixed>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ 
                      width: '100%', 
                      height: 4, 
                      backgroundColor: '#e0e0e0', 
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: `${project.progress}%`, 
                        height: '100%', 
                        backgroundColor: 
                          project.progress === 100 ? '#4caf50' :
                          project.progress >= 75 ? '#2196f3' :
                          project.progress >= 50 ? '#ff9800' :
                          '#f44336',
                        transition: 'width 0.3s ease'
                      }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '10px', minWidth: '25px' }}>
                      {project.progress}%
                    </Typography>
                  </Box>
                </GridCell>
                <GridCell width={70} isFixed>
                  <Chip
                    label={project.phase}
                    size="small"
                    sx={{
                      backgroundColor: phases.find(p => p.name.includes(project.phase.split('・')[0]))?.color || '#ccc',
                      color: 'white',
                      fontSize: '10px',
                      height: 20,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </GridCell>
              </GridRow>
            ))}
          </FixedColumn>

          {/* スクロール可能エリア（ステージ列） */}
          <ScrollableArea>
            <GridTable>
              {/* フェーズヘッダー行 */}
              <Box style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 1 }}>
                {phases.map((phase) => (
                  <PhaseHeader
                    key={phase.id}
                    color={phase.color}
                    style={{ width: `${phase.stages * 80}px` }}
                  >
                    {phase.name}
                  </PhaseHeader>
                ))}
              </Box>

              {/* ステージヘッダー行 */}
              <GridRow style={{ position: 'sticky', top: 22, zIndex: 1 }}>
                {allStages.map((stage) => (
                  <GridCell key={stage} width={80} isHeader>
                    {stage}
                  </GridCell>
                ))}
              </GridRow>

              {/* データ行 */}
              {filteredProjects.map((project) => (
                <GridRow 
                  key={project.id}
                  style={{ 
                    backgroundColor: getRowBackgroundColor(project.progress, project.delayRisk),
                    cursor: 'pointer'
                  }}
                  onClick={() => handleProjectClick(project.id)}
                >
                  {allStages.map((stage) => {
                    const date = project.stages[stage];
                    const isCompleted = !!date;
                    const isMilestone = stage === '基礎着工' || stage === '上棟';
                    return (
                      <StatusCell
                        key={stage}
                        width={80}
                        status={isCompleted ? 'COMPLETED' : undefined}
                        title={date ? `${stage}: ${date}` : stage}
                        sx={{
                          fontWeight: isMilestone ? 'bold' : 'normal',
                          backgroundColor: isMilestone && isCompleted ? '#ffeb3b' : undefined,
                          color: isMilestone && isCompleted ? '#000' : undefined,
                        }}
                      >
                        {date || '-'}
                      </StatusCell>
                    );
                  })}
                </GridRow>
              ))}
            </GridTable>
          </ScrollableArea>
        </ExcelGrid>
      </ExcelContainer>

      {/* 凡例と統計 */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Typography variant="body2" fontWeight="medium">ステータス:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 16, height: 16, backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '2px' }} />
                <Typography variant="caption">完了</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 16, height: 16, backgroundColor: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '2px' }} />
                <Typography variant="caption">進行中</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 16, height: 16, backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '2px' }} />
                <Typography variant="caption">遅延</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 16, height: 16, backgroundColor: '#ffeb3b', border: '1px solid #f9a825', borderRadius: '2px' }} />
                <Typography variant="caption">重要マイルストーン</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'flex-end' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">{filteredProjects.length}</Typography>
                <Typography variant="caption" color="text.secondary">プロジェクト</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="success.main">
                  {filteredProjects.filter(p => p.status === 'IN_PROGRESS').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">進行中</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="error.main">
                  {filteredProjects.filter(p => p.delayRisk === 'high').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">遅延リスク高</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};