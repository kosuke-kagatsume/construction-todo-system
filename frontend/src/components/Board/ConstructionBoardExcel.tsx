import React from 'react';
import { Box, Paper, Typography, Tabs, Tab, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { mockProjects, phases, allStages } from '@/data/mockData';

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
  backgroundColor: '#f5f5f5',
  borderRight: '2px solid #d0d0d0',
  minWidth: '300px',
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
    backgroundColor: isHeader ? '#217346' : isFixed ? '#f5f5f5' : '#ffffff',
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
    status === 'COMPLETED' ? '#d4edda' :
    status === 'IN_PROGRESS' ? '#cce5ff' :
    status === 'DELAYED' ? '#f8d7da' :
    '#ffffff',
  color:
    status === 'COMPLETED' ? '#155724' :
    status === 'IN_PROGRESS' ? '#004085' :
    status === 'DELAYED' ? '#721c24' :
    '#000000',
  fontWeight: status ? 'bold' : 'normal',
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

export const ConstructionBoardExcel: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const router = useRouter();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <Box>
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
            {mockProjects.map((project) => (
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
              {mockProjects.map((project) => (
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

      {/* 凡例 */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', fontSize: '12px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 12, backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }} />
          <Typography variant="caption">完了</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 12, backgroundColor: '#cce5ff', border: '1px solid #b8daff' }} />
          <Typography variant="caption">進行中</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 12, backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' }} />
          <Typography variant="caption">遅延</Typography>
        </Box>
      </Box>
    </Box>
  );
};