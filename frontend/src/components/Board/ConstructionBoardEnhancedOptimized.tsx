import React, { useState, useMemo, useCallback, memo } from 'react';
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
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { mockProjects, phases, allStages } from '@/data/mockData';
import { sharedItemDefinitions } from '@/data/sharedItems';
import { sampleSharedItems } from '@/data/sharedItems';
import { BoardColumnSettings, defaultBoardSettings } from '@/data/boardSettings';
import { BoardSettingsDialog } from './BoardSettingsDialog';
import { useBoardSettings } from '@/hooks/useBoardSettings';
import { 
  Search, 
  FilterList, 
  Clear,
  ArrowUpward,
  ArrowDownward,
  Timeline,
  CalendarToday,
  Warning,
  CheckCircle,
  Schedule,
  Settings,
} from '@mui/icons-material';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';

// Styled components (移動して再レンダリングを防ぐ)
const CompactHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: '#f5f5f5',
  borderBottom: '1px solid #e0e0e0',
  minHeight: '48px',
}));

const ExcelContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: 'calc(100vh - 140px)',
  overflow: 'hidden',
  borderRadius: 4,
  backgroundColor: '#ffffff',
  boxShadow: theme.shadows[1],
  border: '1px solid #e0e0e0',
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
  minWidth: '240px',
  width: '240px',
  overflowY: 'auto',
  overflowX: 'hidden',
});

const ScrollableArea = styled('div')({
  flex: 1,
  overflowX: 'auto',
  overflowY: 'auto',
  backgroundColor: '#ffffff',
  // カスタムスクロールバー
  '&::-webkit-scrollbar': {
    height: '8px',
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#c1c1c1',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#a8a8a8',
    },
  },
});

const GridTable = styled('div')<{ totalWidth: number }>(({ totalWidth }) => ({
  display: 'inline-block',
  minWidth: `${totalWidth}px`,
  width: `${totalWidth}px`,
}));

const GridRow = styled('div')({
  display: 'flex',
  borderBottom: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: '#f8f8f8',
  },
});

const GridCell = styled('div')<{ width?: number; isHeader?: boolean; isFixed?: boolean; isPrediction?: boolean }>(
  ({ width = 120, isHeader, isFixed, isPrediction }) => ({
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
    padding: '4px 6px',
    borderRight: '1px solid #e0e0e0',
    boxSizing: 'border-box',
    fontSize: '12px',
    fontFamily: '"メイリオ", "Meiryo", sans-serif',
    backgroundColor: isHeader ? '#1976d2' : isFixed ? '#f8f9fa' : isPrediction ? '#fff3e0' : '#ffffff',
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
    height: '36px',
  })
);

const PhaseHeader = styled('div')<{ color: string }>(({ color }) => ({
  backgroundColor: color,
  color: '#ffffff',
  padding: '4px 4px',
  fontSize: '10px',
  fontWeight: 'bold',
  textAlign: 'center',
  borderBottom: '1px solid #d0d0d0',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const DateCell = styled(GridCell, {
  shouldForwardProp: (prop) => !['isActual', 'isPrediction', 'isDelayed'].includes(prop as string),
})<{ isActual?: boolean; isPrediction?: boolean; isDelayed?: boolean }>(
  ({ isActual, isPrediction, isDelayed }) => ({
    backgroundColor: 
      isDelayed ? '#ffebee' :
      isActual ? '#e8f5e9' :
      isPrediction ? '#fff3e0' :
      '#ffffff',
    color:
      isDelayed ? '#c62828' :
      isActual ? '#2e7d32' :
      isPrediction ? '#f57c00' :
      '#000000',
    fontWeight: isActual || isPrediction ? '500' : 'normal',
    fontSize: '11px',
  })
);

const DualDateCell = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  padding: '1px 2px',
  gap: '1px',
});

const PredictionDateCell = styled(GridCell, {
  shouldForwardProp: (prop) => !['showPrediction'].includes(prop as string),
})<{ showPrediction?: boolean }>(
  ({ showPrediction }) => ({
    backgroundColor: showPrediction ? '#f3f8ff' : '#ffffff',
    borderLeft: showPrediction ? '2px solid #2196f3' : '1px solid #e0e0e0',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: showPrediction ? '#1565c0' : '#666',
  })
);

const DualModeCell = styled(GridCell)<{ hasActual?: boolean; hasPrediction?: boolean }>(
  ({ hasActual, hasPrediction }) => ({
    backgroundColor: hasActual ? '#f1f8e9' : hasPrediction ? '#f3f8ff' : '#ffffff',
    borderLeft: hasActual ? '2px solid #4caf50' : hasPrediction ? '2px solid #2196f3' : '1px solid #e0e0e0',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: hasActual ? '#2e7d32' : hasPrediction ? '#1565c0' : '#666',
    minHeight: '30px',
  })
);

const CompactTabs = styled(Tabs)({
  minHeight: '32px',
  '& .MuiTab-root': {
    minHeight: '32px',
    padding: '4px 12px',
    fontSize: '12px',
    textTransform: 'none',
  },
});

// 標準的な工期設定（定数として外に出す）
const STANDARD_DURATIONS: { [key: string]: number } = {
  '設計申込': 0,
  'プランヒアリング': 7,
  '敷地調査': 14,
  'プラン提案': 21,
  '見積提出': 28,
  '設計契約': 35,
  '実施設計': 42,
  '確認申請': 49,
  '契約前打合せ': 56,
  '請負契約': 63,
  '建築請負契約': 70,
  '1st仕様': 77,
  '2nd仕様': 84,
  '3rd仕様': 91,
  '4th仕様': 98,
  '5th仕様': 105,
  '仕様決定': 112,
  '図面承認': 119,
  '建築確認申請': 126,
  '着工前準備': 133,
  '地鎮祭準備': 140,
  '地鎮祭': 142,
  '地盤改良': 147,
  '基礎着工': 154,
  '基礎配筋検査': 161,
  '基礎完了': 168,
  '土台敷き': 175,
  '上棟': 182,
  '上棟式': 183,
  '屋根工事': 189,
  '外装工事': 203,
  '内装下地': 217,
  '内装仕上げ': 231,
  '設備工事': 245,
  '外構工事': 259,
  '美装工事': 266,
  '社内検査': 270,
  '是正工事': 273,
  '竣工検査': 277,
  '完了検査': 280,
  '取扱説明': 284,
  '引き渡し準備': 287,
  '引き渡し': 290,
  'アフター点検': 320,
};

// メモ化された予測日程計算関数
const calculatePredictedDates = (
  startDate: string,
  actualDates: { [stage: string]: string | null },
  modifiedDurations?: { [stage: string]: number }
): { [stage: string]: string } => {
  const predicted: { [stage: string]: string } = {};
  const durations = { ...STANDARD_DURATIONS, ...modifiedDurations };
  
  let baseDate = parseISO(startDate);
  let delay = 0;

  // 最後の実施日程を見つける
  Object.entries(actualDates).forEach(([stage, date]) => {
    if (date && date !== 'null') {
      try {
        const actualDate = parseISO(date);
        const predictedDate = addDays(parseISO(startDate), durations[stage] || 0);
        delay = differenceInDays(actualDate, predictedDate);
      } catch (e) {
        console.warn(`Invalid date for stage ${stage}: ${date}`);
      }
    }
  });

  // 予測日程を計算
  Object.keys(durations).forEach((stage) => {
    if (actualDates[stage]) {
      return;
    }

    try {
      const predictedDate = addDays(baseDate, (durations[stage] || 0) + delay);
      predicted[stage] = format(predictedDate, 'yyyy-MM-dd');
    } catch (e) {
      console.warn(`Failed to calculate predicted date for stage ${stage}`);
    }
  });

  return predicted;
};

interface FilterState {
  search: string;
  phase: string;
  grade: string;
  assignee: string;
  status: string;
  delayRisk: string;
}

type SortField = 'name' | 'customer' | 'rank' | 'phase' | 'progress' | 'sales' | 'design' | 'ic' | 'construction' | string;
type SortDirection = 'asc' | 'desc';

// メモ化されたプロジェクトロウコンポーネント
const ProjectRow = memo(({ 
  project, 
  onClick,
  boardSettings,
  getSharedItemValue 
}: {
  project: any;
  onClick: () => void;
  boardSettings: BoardColumnSettings;
  getSharedItemValue: (projectId: string, itemId: string) => any;
}) => (
  <GridRow 
    style={{ cursor: 'pointer' }}
    onClick={onClick}
  >
    <GridCell width={60} isFixed>{project.name}</GridCell>
    <GridCell width={60} isFixed>{project.customer}</GridCell>
    <GridCell width={35} isFixed>
      <Chip 
        label={project.grade} 
        size="small" 
        sx={{ 
          height: 20, 
          fontSize: '11px',
          backgroundColor: 
            project.grade === 'S' ? '#ffd700' :
            project.grade === 'A' ? '#c0c0c0' :
            project.grade === 'B' ? '#cd7f32' :
            '#e0e0e0',
        }} 
      />
    </GridCell>
    <GridCell width={35} isFixed>
      <Typography variant="caption" sx={{ fontSize: '10px' }}>
        {project.progress}%
      </Typography>
    </GridCell>
    <GridCell width={50} isFixed>
      <Chip
        label={project.phase}
        size="small"
        sx={{
          backgroundColor: phases.find(p => p.name.includes(project.phase.split('・')[0]))?.color || '#ccc',
          color: 'white',
          fontSize: '11px',
          height: 20,
        }}
      />
    </GridCell>
  </GridRow>
));

ProjectRow.displayName = 'ProjectRow';

export const ConstructionBoardEnhancedOptimized: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
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
  
  // 表示設定
  const { settings: boardDisplaySettings, saveSettings } = useBoardSettings();
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  
  // BoardColumnSettingsとBoardDisplaySettingsのマッピング
  const boardSettings: BoardColumnSettings = {
    visibleStages: boardDisplaySettings.visibleStages,
    showAssignees: {
      sales: boardDisplaySettings.roles.sales,
      design: boardDisplaySettings.roles.design,
      ic: boardDisplaySettings.roles.ic,
      construction: boardDisplaySettings.roles.construction,
    },
    visibleSharedItems: boardDisplaySettings.visibleSharedItems,
  };
  
  const router = useRouter();

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleProjectClick = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`);
  }, [router]);
  
  const handleFilterChange = useCallback((field: keyof FilterState) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      setFilters(prev => ({
        ...prev,
        [field]: event.target.value,
      }));
    }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      phase: 'all',
      grade: 'all',
      assignee: 'all',
      status: 'all',
      delayRisk: 'all',
    });
  }, []);
  
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
  
  // Filter and sort projects with predicted dates - 最適化版
  const filteredProjectsWithPredictions = useMemo(() => {
    // First filter
    const filtered = mockProjects.filter(project => {
      // Early return for search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!project.name.toLowerCase().includes(searchLower) &&
            !project.customer.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Other filters
      if (filters.phase !== 'all' && !project.phase.includes(filters.phase)) return false;
      if (filters.grade !== 'all' && project.grade !== filters.grade) return false;
      if (filters.assignee !== 'all') {
        if (project.sales !== filters.assignee &&
            project.design !== filters.assignee &&
            project.ic !== filters.assignee &&
            project.construction !== filters.assignee) {
          return false;
        }
      }
      if (filters.status !== 'all' && project.status !== filters.status) return false;
      if (filters.delayRisk !== 'all' && project.delayRisk !== filters.delayRisk) return false;
      
      return true;
    });
    
    // Add predicted dates only when needed
    const withPredictions = tabValue !== 0 ? filtered : filtered.map(project => {
      const startDate = project.stages['設計申込'];
      let validStartDate = '2024-01-01';
      
      if (startDate && startDate !== 'null') {
        try {
          const parsed = parseISO(startDate);
          if (!isNaN(parsed.getTime())) {
            validStartDate = startDate;
          }
        } catch (e) {
          // Use default
        }
      }
      
      const predictedDates = calculatePredictedDates(validStartDate, project.stages);
      
      return {
        ...project,
        predictedStages: predictedDates,
      };
    });
    
    // Sorting
    const sorted = [...withPredictions].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortField) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'customer':
          compareValue = a.customer.localeCompare(b.customer);
          break;
        case 'rank':
          const rankOrder: { [key: string]: number } = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 };
          compareValue = rankOrder[a.grade] - rankOrder[b.grade];
          break;
        case 'phase':
          const phaseOrder = phases.reduce((acc, phase, index) => ({ ...acc, [phase.name]: index }), {} as { [key: string]: number });
          compareValue = (phaseOrder[a.phase] || 999) - (phaseOrder[b.phase] || 999);
          break;
        case 'progress':
          compareValue = a.progress - b.progress;
          break;
        default:
          compareValue = 0;
      }
      
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
    
    return sorted;
  }, [filters, sortField, sortDirection, tabValue]);
  
  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length;

  // スクロール可能エリアの幅を計算
  const calculateScrollableWidth = useCallback(() => {
    const assigneeWidth = Object.values(boardSettings.showAssignees).filter(Boolean).length * 60;
    const sharedItemsWidth = boardSettings.visibleSharedItems.length * 60;
    const stageWidth = boardSettings.visibleStages.length * 50;
    return assigneeWidth + sharedItemsWidth + stageWidth;
  }, [boardSettings]);

  // 共有事項の値を取得
  const getSharedItemValue = useCallback((projectId: string, itemId: string) => {
    const item = sampleSharedItems.items[itemId];
    return item ? item.value : null;
  }, []);

  // タブごとの表示内容
  const renderBoardContent = () => {
    switch (tabValue) {
      case 0: // 実施済日程ボード
        return renderActualBoard();
      case 1: // 予測日程ボード
        return renderPredictionBoard();
      case 2: // 実施・予測日程ボード
        return renderDualBoard();
      case 3: // 一覧確認
        return renderListView();
      default:
        return null;
    }
  };

  // 実施済日程ボードのレンダリング - 軽量化版
  const renderActualBoard = () => (
    <ExcelGrid>
      <FixedColumn>
        <Box style={{ position: 'sticky', top: 0, zIndex: 3 }}>
          <PhaseHeader color="#666" style={{ width: '240px', borderBottom: '1px solid #d0d0d0' }}>
            概要
          </PhaseHeader>
          <GridRow>
            <GridCell width={60} isHeader>邸名</GridCell>
            <GridCell width={60} isHeader>顧客名</GridCell>
            <GridCell width={35} isHeader>ランク</GridCell>
            <GridCell width={35} isHeader>進捗</GridCell>
            <GridCell width={50} isHeader>フェーズ</GridCell>
          </GridRow>
        </Box>
        {filteredProjectsWithPredictions.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onClick={() => handleProjectClick(project.id)}
            boardSettings={boardSettings}
            getSharedItemValue={getSharedItemValue}
          />
        ))}
      </FixedColumn>

      <ScrollableArea>
        <GridTable totalWidth={calculateScrollableWidth()}>
          <Box style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 1 }}>
            {/* 共通事項ヘッダー */}
            {(Object.values(boardSettings.showAssignees).some(Boolean) || boardSettings.visibleSharedItems.length > 0) && (
              <PhaseHeader
                color="#666"
                style={{ 
                  width: `${
                    Object.values(boardSettings.showAssignees).filter(Boolean).length * 60 +
                    boardSettings.visibleSharedItems.length * 60
                  }px` 
                }}
              >
                共通事項
              </PhaseHeader>
            )}
            {/* フェーズヘッダー */}
            {phases.map((phase) => {
              let startIndex = 0;
              for (let i = 0; i < parseInt(phase.id) - 1; i++) {
                startIndex += phases[i].stages;
              }
              const endIndex = startIndex + phase.stages;
              const phaseStages = allStages.slice(startIndex, endIndex);
              const visibleStageCount = phaseStages.filter(stage => boardSettings.visibleStages.includes(stage)).length;
              
              if (visibleStageCount === 0) return null;
              
              return (
                <PhaseHeader
                  key={phase.id}
                  color={phase.color}
                  style={{ width: `${visibleStageCount * 50}px` }}
                >
                  {phase.name}
                </PhaseHeader>
              );
            })}
          </Box>

          <GridRow style={{ position: 'sticky', top: 24, zIndex: 1 }}>
            {/* 担当者列 */}
            {boardSettings.showAssignees.sales && <GridCell width={60} isHeader>営業</GridCell>}
            {boardSettings.showAssignees.design && <GridCell width={60} isHeader>設計</GridCell>}
            {boardSettings.showAssignees.ic && <GridCell width={60} isHeader>IC</GridCell>}
            {boardSettings.showAssignees.construction && <GridCell width={60} isHeader>工務</GridCell>}
            
            {/* 共有事項列 */}
            {boardSettings.visibleSharedItems.map(itemId => {
              const itemDef = sharedItemDefinitions.find(d => d.id === itemId);
              return itemDef ? (
                <GridCell key={itemId} width={60} isHeader>
                  {itemDef.name}
                </GridCell>
              ) : null;
            })}
            
            {/* ステージ列 */}
            {allStages.filter(stage => boardSettings.visibleStages.includes(stage)).map((stage) => (
              <GridCell key={stage} width={50} isHeader>
                <Typography variant="caption" sx={{ fontSize: '10px', textAlign: 'center' }}>
                  {stage.length > 6 ? stage.substring(0, 6) + '...' : stage}
                </Typography>
              </GridCell>
            ))}
          </GridRow>

          {filteredProjectsWithPredictions.map((project) => (
            <GridRow 
              key={project.id}
              style={{ cursor: 'pointer' }}
              onClick={() => handleProjectClick(project.id)}
            >
              {/* 担当者データ */}
              {boardSettings.showAssignees.sales && (
                <GridCell width={60}>
                  <Typography variant="caption" sx={{ fontSize: '10px' }}>
                    {project.sales}
                  </Typography>
                </GridCell>
              )}
              {boardSettings.showAssignees.design && (
                <GridCell width={60}>
                  <Typography variant="caption" sx={{ fontSize: '10px' }}>
                    {project.design}
                  </Typography>
                </GridCell>
              )}
              {boardSettings.showAssignees.ic && (
                <GridCell width={60}>
                  <Typography variant="caption" sx={{ fontSize: '10px' }}>
                    {project.ic}
                  </Typography>
                </GridCell>
              )}
              {boardSettings.showAssignees.construction && (
                <GridCell width={60}>
                  <Typography variant="caption" sx={{ fontSize: '10px' }}>
                    {project.construction}
                  </Typography>
                </GridCell>
              )}
              
              {/* 共有事項データ */}
              {boardSettings.visibleSharedItems.map(itemId => {
                const value = getSharedItemValue(project.id, itemId);
                return (
                  <GridCell key={itemId} width={60}>
                    <Typography variant="caption" sx={{ fontSize: '10px' }}>
                      {value !== null ? String(value) : '-'}
                    </Typography>
                  </GridCell>
                );
              })}
              
              {/* ステージデータ */}
              {allStages.filter(stage => boardSettings.visibleStages.includes(stage)).map((stage) => {
                const date = project.stages[stage];
                let formattedDate = '-';
                if (date && date !== 'null') {
                  try {
                    formattedDate = format(parseISO(date), 'MM/dd');
                  } catch (e) {
                    formattedDate = '-';
                  }
                }
                return (
                  <DateCell
                    key={stage}
                    width={50}
                    isActual={!!date && date !== 'null'}
                  >
                    {formattedDate}
                  </DateCell>
                );
              })}
            </GridRow>
          ))}
        </GridTable>
      </ScrollableArea>
    </ExcelGrid>
  );

  // 他のビューは簡略化のため省略
  // 予測日程ボードのレンダリング - 予測スケジュールのみ表示
  const renderPredictionBoard = () => (
    <ExcelGrid>
      <FixedColumn>
        <Box style={{ position: 'sticky', top: 0, zIndex: 3 }}>
          <PhaseHeader color="#666" style={{ width: '240px', borderBottom: '1px solid #d0d0d0' }}>
            概要
          </PhaseHeader>
          <GridRow>
            <GridCell width={60} isHeader>邸名</GridCell>
            <GridCell width={60} isHeader>顧客名</GridCell>
            <GridCell width={35} isHeader>ランク</GridCell>
            <GridCell width={35} isHeader>進捗</GridCell>
            <GridCell width={50} isHeader>フェーズ</GridCell>
          </GridRow>
        </Box>
        {filteredProjectsWithPredictions.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onClick={() => handleProjectClick(project.id)}
            boardSettings={boardSettings}
            getSharedItemValue={getSharedItemValue}
          />
        ))}
      </FixedColumn>
      
      <ScrollableArea>
        <GridTable totalWidth={calculateScrollableWidth()}>
          <Box style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 1 }}>
            {/* 共通事項ヘッダー */}
            {(Object.values(boardSettings.showAssignees).some(Boolean) || boardSettings.visibleSharedItems.length > 0) && (
              <PhaseHeader
                color="#666"
                style={{ 
                  width: `${
                    Object.values(boardSettings.showAssignees).filter(Boolean).length * 60 +
                    boardSettings.visibleSharedItems.length * 60
                  }px` 
                }}
              >
                共通事項
              </PhaseHeader>
            )}
            {/* フェーズヘッダー */}
            {phases.map((phase) => {
              let startIndex = 0;
              for (let i = 0; i < parseInt(phase.id) - 1; i++) {
                startIndex += phases[i].stages;
              }
              const endIndex = startIndex + phase.stages;
              const phaseStages = allStages.slice(startIndex, endIndex);
              const visibleStageCount = phaseStages.filter(stage => boardSettings.visibleStages.includes(stage)).length;
              
              if (visibleStageCount === 0) return null;
              
              return (
                <PhaseHeader
                  key={phase.id}
                  color={phase.color}
                  style={{ width: `${visibleStageCount * 50}px` }}
                >
                  {phase.name}
                </PhaseHeader>
              );
            })}
          </Box>

          <GridRow style={{ position: 'sticky', top: 24, zIndex: 1 }}>
            {/* 担当者列 */}
            {boardSettings.showAssignees.sales && <GridCell width={60} isHeader>営業</GridCell>}
            {boardSettings.showAssignees.design && <GridCell width={60} isHeader>設計</GridCell>}
            {boardSettings.showAssignees.ic && <GridCell width={60} isHeader>IC</GridCell>}
            {boardSettings.showAssignees.construction && <GridCell width={60} isHeader>工務</GridCell>}
            
            {/* 共有事項列 */}
            {boardSettings.visibleSharedItems.map(itemId => {
              const itemDef = sharedItemDefinitions.find(d => d.id === itemId);
              return itemDef ? (
                <GridCell key={itemId} width={60} isHeader>
                  {itemDef.name}
                </GridCell>
              ) : null;
            })}
            
            {/* ステージ列 */}
            {allStages.filter(stage => boardSettings.visibleStages.includes(stage)).map((stage) => (
              <GridCell key={stage} width={50} isHeader>
                <Typography variant="caption" sx={{ fontSize: '10px', textAlign: 'center' }}>
                  {stage.length > 6 ? stage.substring(0, 6) + '...' : stage}
                </Typography>
              </GridCell>
            ))}
          </GridRow>
          
          {filteredProjectsWithPredictions.map((project) => (
            <GridRow key={project.id}>
              {/* 担当者列 */}
              {boardSettings.showAssignees.sales && (
                <GridCell width={60}>
                  {project.sales || '-'}
                </GridCell>
              )}
              {boardSettings.showAssignees.design && (
                <GridCell width={60}>
                  {project.design || '-'}
                </GridCell>
              )}
              {boardSettings.showAssignees.ic && (
                <GridCell width={60}>
                  {project.ic || '-'}
                </GridCell>
              )}
              {boardSettings.showAssignees.construction && (
                <GridCell width={60}>
                  {project.construction || '-'}
                </GridCell>
              )}
              
              {/* 共有事項列 */}
              {boardSettings.visibleSharedItems.map(itemId => (
                <GridCell key={itemId} width={60}>
                  {getSharedItemValue(project.id, itemId) || '-'}
                </GridCell>
              ))}
              
              {/* ステージ列 */}
              {allStages.filter(stage => boardSettings.visibleStages.includes(stage)).map((stage) => {
                const predictedDate = project.predictedDates?.[stage];
                const actualDate = project.actualDates?.[stage];
                
                // 予測日程ボードでは予測日程のみ表示（実績がない工程のみ）
                const shouldShowPrediction = Boolean(!actualDate && predictedDate);
                
                return (
                  <PredictionDateCell 
                    key={`${project.id}-${stage}`} 
                    width={50}
                    showPrediction={shouldShowPrediction}
                  >
                    {shouldShowPrediction && predictedDate ? 
                      format(parseISO(predictedDate), 'M/d') : 
                      ''
                    }
                  </PredictionDateCell>
                );
              })}
            </GridRow>
          ))}
        </GridTable>
      </ScrollableArea>
    </ExcelGrid>
  );
  
  // 実施・予測日程ボードのレンダリング - 実績と予測の組み合わせ表示
  const renderDualBoard = () => (
    <ExcelGrid>
      <FixedColumn>
        <Box style={{ position: 'sticky', top: 0, zIndex: 3 }}>
          <PhaseHeader color="#666" style={{ width: '240px', borderBottom: '1px solid #d0d0d0' }}>
            概要
          </PhaseHeader>
          <GridRow>
            <GridCell width={60} isHeader>邸名</GridCell>
            <GridCell width={60} isHeader>顧客名</GridCell>
            <GridCell width={35} isHeader>ランク</GridCell>
            <GridCell width={35} isHeader>進捗</GridCell>
            <GridCell width={50} isHeader>フェーズ</GridCell>
          </GridRow>
        </Box>
        {filteredProjectsWithPredictions.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onClick={() => handleProjectClick(project.id)}
            boardSettings={boardSettings}
            getSharedItemValue={getSharedItemValue}
          />
        ))}
      </FixedColumn>
      
      <ScrollableArea>
        <GridTable totalWidth={calculateScrollableWidth()}>
          <Box style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 1 }}>
            {/* 共通事項ヘッダー */}
            {(Object.values(boardSettings.showAssignees).some(Boolean) || boardSettings.visibleSharedItems.length > 0) && (
              <PhaseHeader
                color="#666"
                style={{ 
                  width: `${
                    Object.values(boardSettings.showAssignees).filter(Boolean).length * 60 +
                    boardSettings.visibleSharedItems.length * 60
                  }px` 
                }}
              >
                共通事項
              </PhaseHeader>
            )}
            {/* フェーズヘッダー */}
            {phases.map((phase) => {
              let startIndex = 0;
              for (let i = 0; i < parseInt(phase.id) - 1; i++) {
                startIndex += phases[i].stages;
              }
              const endIndex = startIndex + phase.stages;
              const phaseStages = allStages.slice(startIndex, endIndex);
              const visibleStageCount = phaseStages.filter(stage => boardSettings.visibleStages.includes(stage)).length;
              
              if (visibleStageCount === 0) return null;
              
              return (
                <PhaseHeader
                  key={phase.id}
                  color={phase.color}
                  style={{ width: `${visibleStageCount * 50}px` }}
                >
                  {phase.name}
                </PhaseHeader>
              );
            })}
          </Box>

          <GridRow style={{ position: 'sticky', top: 24, zIndex: 1 }}>
            {/* 担当者列 */}
            {boardSettings.showAssignees.sales && <GridCell width={60} isHeader>営業</GridCell>}
            {boardSettings.showAssignees.design && <GridCell width={60} isHeader>設計</GridCell>}
            {boardSettings.showAssignees.ic && <GridCell width={60} isHeader>IC</GridCell>}
            {boardSettings.showAssignees.construction && <GridCell width={60} isHeader>工務</GridCell>}
            
            {/* 共有事項列 */}
            {boardSettings.visibleSharedItems.map(itemId => {
              const itemDef = sharedItemDefinitions.find(d => d.id === itemId);
              return itemDef ? (
                <GridCell key={itemId} width={60} isHeader>
                  {itemDef.name}
                </GridCell>
              ) : null;
            })}
            
            {/* ステージ列 */}
            {allStages.filter(stage => boardSettings.visibleStages.includes(stage)).map((stage) => (
              <GridCell key={stage} width={50} isHeader>
                <Typography variant="caption" sx={{ fontSize: '10px', textAlign: 'center' }}>
                  {stage.length > 6 ? stage.substring(0, 6) + '...' : stage}
                </Typography>
              </GridCell>
            ))}
          </GridRow>
          
          {filteredProjectsWithPredictions.map((project) => (
            <GridRow key={project.id}>
              {/* 担当者列 */}
              {boardSettings.showAssignees.sales && (
                <GridCell width={60}>
                  {project.sales || '-'}
                </GridCell>
              )}
              {boardSettings.showAssignees.design && (
                <GridCell width={60}>
                  {project.design || '-'}
                </GridCell>
              )}
              {boardSettings.showAssignees.ic && (
                <GridCell width={60}>
                  {project.ic || '-'}
                </GridCell>
              )}
              {boardSettings.showAssignees.construction && (
                <GridCell width={60}>
                  {project.construction || '-'}
                </GridCell>
              )}
              
              {/* 共有事項列 */}
              {boardSettings.visibleSharedItems.map(itemId => (
                <GridCell key={itemId} width={60}>
                  {getSharedItemValue(project.id, itemId) || '-'}
                </GridCell>
              ))}
              
              {/* ステージ列 */}
              {allStages.filter(stage => boardSettings.visibleStages.includes(stage)).map((stage) => {
                const actualDate = project.actualDates?.[stage];
                const predictedDate = project.predictedDates?.[stage];
                const hasActual = Boolean(actualDate && actualDate !== 'null');
                const hasPrediction = Boolean(!hasActual && predictedDate);
                
                return (
                  <DualModeCell 
                    key={`${project.id}-${stage}`} 
                    width={50}
                    hasActual={hasActual}
                    hasPrediction={hasPrediction}
                  >
                    {hasActual && actualDate ? 
                      format(parseISO(actualDate), 'M/d') : 
                      hasPrediction && predictedDate ? 
                        format(parseISO(predictedDate), 'M/d') : 
                        ''
                    }
                  </DualModeCell>
                );
              })}
            </GridRow>
          ))}
        </GridTable>
      </ScrollableArea>
    </ExcelGrid>
  );
  
  // 一覧確認のレンダリング - 詳細データの一覧表示
  const renderListView = () => (
    <Box sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
            プロジェクト詳細一覧
          </Typography>
          <Typography variant="body2" color="text.secondary">
            全{filteredProjectsWithPredictions.length}件のプロジェクト詳細情報
          </Typography>
        </Box>
        
        <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th style={listHeaderStyle}>邸名</th>
                <th style={listHeaderStyle}>顧客名</th>
                <th style={listHeaderStyle}>ランク</th>
                <th style={listHeaderStyle}>進捗</th>
                <th style={listHeaderStyle}>フェーズ</th>
                <th style={listHeaderStyle}>営業</th>
                <th style={listHeaderStyle}>設計</th>
                <th style={listHeaderStyle}>IC</th>
                <th style={listHeaderStyle}>工務</th>
                <th style={listHeaderStyle}>予算</th>
                <th style={listHeaderStyle}>設計申込</th>
                <th style={listHeaderStyle}>プラン提案</th>
                <th style={listHeaderStyle}>請負契約</th>
                <th style={listHeaderStyle}>1st仕様</th>
                <th style={listHeaderStyle}>地鎮祭</th>
                <th style={listHeaderStyle}>基礎着工</th>
                <th style={listHeaderStyle}>上棟</th>
                <th style={listHeaderStyle}>屋根工事</th>
                <th style={listHeaderStyle}>内装仕上</th>
                <th style={listHeaderStyle}>引き渡し</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjectsWithPredictions.map((project, index) => (
                <tr 
                  key={project.id} 
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e3f2fd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
                  }}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <td style={listCellStyle}>{project.name}</td>
                  <td style={listCellStyle}>{project.customer}</td>
                  <td style={listCellStyle}>
                    <Chip 
                      label={project.rank} 
                      size="small" 
                      color={project.rank === 'A' ? 'error' : project.rank === 'B' ? 'warning' : 'default'}
                      sx={{ fontSize: '10px', height: '18px' }}
                    />
                  </td>
                  <td style={listCellStyle}>{project.progress}%</td>
                  <td style={listCellStyle}>{project.phase}</td>
                  <td style={listCellStyle}>{project.sales}</td>
                  <td style={listCellStyle}>{project.design}</td>
                  <td style={listCellStyle}>{project.ic}</td>
                  <td style={listCellStyle}>{project.construction}</td>
                  <td style={listCellStyle}>¥{(project.budget / 10000).toFixed(0)}万</td>
                  
                  {/* 主要工程の実績・予測日程 */}
                  <td style={listCellStyle}>
                    {project.actualDates?.['設計申込'] || 
                     (project.predictedDates?.['設計申込'] ? 
                       <span style={{ color: '#2196f3', fontStyle: 'italic' }}>{project.predictedDates['設計申込']}</span> : '-')}
                  </td>
                  <td style={listCellStyle}>
                    {project.actualDates?.['プラン提案'] || 
                     (project.predictedDates?.['プラン提案'] ? 
                       <span style={{ color: '#2196f3', fontStyle: 'italic' }}>{project.predictedDates['プラン提案']}</span> : '-')}
                  </td>
                  <td style={listCellStyle}>
                    {project.actualDates?.['請負契約'] || 
                     (project.predictedDates?.['請負契約'] ? 
                       <span style={{ color: '#2196f3', fontStyle: 'italic' }}>{project.predictedDates['請負契約']}</span> : '-')}
                  </td>
                  <td style={listCellStyle}>
                    {project.actualDates?.['1st仕様打合せ'] || 
                     (project.predictedDates?.['1st仕様打合せ'] ? 
                       <span style={{ color: '#2196f3', fontStyle: 'italic' }}>{project.predictedDates['1st仕様打合せ']}</span> : '-')}
                  </td>
                  <td style={listCellStyle}>
                    {project.actualDates?.['地鎮祭'] || 
                     (project.predictedDates?.['地鎮祭'] ? 
                       <span style={{ color: '#2196f3', fontStyle: 'italic' }}>{project.predictedDates['地鎮祭']}</span> : '-')}
                  </td>
                  <td style={listCellStyle}>
                    {project.actualDates?.['基礎着工'] || 
                     (project.predictedDates?.['基礎着工'] ? 
                       <span style={{ color: '#2196f3', fontStyle: 'italic' }}>{project.predictedDates['基礎着工']}</span> : '-')}
                  </td>
                  <td style={listCellStyle}>
                    {project.actualDates?.['上棟'] || 
                     (project.predictedDates?.['上棟'] ? 
                       <span style={{ color: '#2196f3', fontStyle: 'italic' }}>{project.predictedDates['上棟']}</span> : '-')}
                  </td>
                  <td style={listCellStyle}>
                    {project.actualDates?.['屋根工事'] || 
                     (project.predictedDates?.['屋根工事'] ? 
                       <span style={{ color: '#2196f3', fontStyle: 'italic' }}>{project.predictedDates['屋根工事']}</span> : '-')}
                  </td>
                  <td style={listCellStyle}>
                    {project.actualDates?.['内装仕上げ'] || 
                     (project.predictedDates?.['内装仕上げ'] ? 
                       <span style={{ color: '#2196f3', fontStyle: 'italic' }}>{project.predictedDates['内装仕上げ']}</span> : '-')}
                  </td>
                  <td style={listCellStyle}>
                    {project.actualDates?.['引き渡し'] || 
                     (project.predictedDates?.['引き渡し'] ? 
                       <span style={{ color: '#2196f3', fontStyle: 'italic' }}>{project.predictedDates['引き渡し']}</span> : '-')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );

  // 一覧表示用のスタイル
  const listHeaderStyle = {
    padding: '8px 6px',
    backgroundColor: '#e3f2fd',
    borderBottom: '2px solid #1976d2',
    borderRight: '1px solid #ccc',
    fontWeight: 'bold',
    fontSize: '11px',
    color: '#1565c0',
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
    minWidth: '80px',
  };

  const listCellStyle = {
    padding: '6px 4px',
    borderBottom: '1px solid #e0e0e0',
    borderRight: '1px solid #e0e0e0',
    fontSize: '11px',
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <Box>
      {/* コンパクトなヘッダー */}
      <CompactHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 'bold' }}>
            現場ボード
          </Typography>
          <Chip 
            label={`${filteredProjectsWithPredictions.length}件`} 
            size="small"
            color="primary"
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* クイックフィルター */}
          <Chip
            label="進行中"
            size="small"
            onClick={() => setFilters({ ...filters, status: filters.status === 'IN_PROGRESS' ? 'all' : 'IN_PROGRESS' })}
            color={filters.status === 'IN_PROGRESS' ? 'primary' : 'default'}
            variant={filters.status === 'IN_PROGRESS' ? 'filled' : 'outlined'}
          />
          <Chip
            label="遅延リスク"
            size="small"
            onClick={() => setFilters({ ...filters, delayRisk: filters.delayRisk === 'high' ? 'all' : 'high' })}
            color={filters.delayRisk === 'high' ? 'error' : 'default'}
            variant={filters.delayRisk === 'high' ? 'filled' : 'outlined'}
          />
          
          {/* フィルターボタン */}
          <IconButton
            size="small"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Badge badgeContent={activeFilterCount} color="primary">
              <FilterList />
            </Badge>
          </IconButton>
          
          {/* 設定ボタン */}
          <Tooltip title="現場ボード表示設定">
            <IconButton
              size="small"
              onClick={() => setSettingsDialogOpen(true)}
            >
              <Settings />
            </IconButton>
          </Tooltip>
          
          {/* 検索フィールド */}
          <TextField
            size="small"
            placeholder="検索..."
            value={filters.search}
            onChange={handleFilterChange('search')}
            sx={{ width: 150 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </CompactHeader>
      
      {/* フィルターパネル（折りたたみ） */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 1.5, borderRadius: 0, borderBottom: '1px solid #e0e0e0' }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
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
            
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
              >
                クリア
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
      
      {/* タブ */}
      <CompactTabs value={tabValue} onChange={handleTabChange}>
        <Tab label="実施済日程ボード" icon={<CheckCircle sx={{ fontSize: 16 }} />} iconPosition="start" />
        <Tab label="予測日程ボード" icon={<Timeline sx={{ fontSize: 16 }} />} iconPosition="start" />
        <Tab label="実施・予測日程ボード" icon={<CalendarToday sx={{ fontSize: 16 }} />} iconPosition="start" />
        <Tab label="一覧確認" />
      </CompactTabs>

      {/* ボードコンテンツ */}
      <ExcelContainer elevation={0}>
        {renderBoardContent()}
      </ExcelContainer>

      {/* 凡例（コンパクト） */}
      <Box sx={{ mt: 1, p: 1, backgroundColor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="caption" fontWeight="medium">凡例:</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '2px' }} />
            <Typography variant="caption">実施済</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#fff3e0', border: '1px solid #ff9800', borderRadius: '2px' }} />
            <Typography variant="caption">予測</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '2px' }} />
            <Typography variant="caption">遅延</Typography>
          </Box>
        </Box>
      </Box>
      
      {/* 設定ダイアログ */}
      <BoardSettingsDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        settings={boardSettings}
        onSave={(newSettings) => {
          // BoardColumnSettingsからBoardDisplaySettingsに変換して保存
          const newDisplaySettings = {
            ...boardDisplaySettings,
            roles: {
              sales: newSettings.showAssignees.sales,
              design: newSettings.showAssignees.design,
              ic: newSettings.showAssignees.ic,
              construction: newSettings.showAssignees.construction,
            },
            visibleSharedItems: newSettings.visibleSharedItems,
            visibleStages: newSettings.visibleStages,
          };
          saveSettings(newDisplaySettings);
          setSettingsDialogOpen(false);
        }}
      />
    </Box>
  );
};