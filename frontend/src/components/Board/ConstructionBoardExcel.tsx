import React from 'react';
import { Box, Paper, Typography, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';

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

// フェーズとステージのデータ
const phases = [
  { id: '1', name: '追客・設計', color: '#2196F3', stages: 6 },
  { id: '2', name: '契約', color: '#4CAF50', stages: 3 },
  { id: '3', name: '打ち合わせ', color: '#FF9800', stages: 10 },
  { id: '4', name: '施工', color: '#F44336', stages: 17 },
  { id: '5', name: '竣工', color: '#9C27B0', stages: 4 },
];

const allStages = [
  '設計申込', 'プランヒアリング', '1stプラン', '2ndプラン', '3rdプラン', 'EXプラン',
  '契約前打合せ', '請負契約', '建築請負契約',
  '1st仕様', '2nd仕様', '3rd仕様', '4th仕様', '5th仕様', 'EX仕様', 'FB', '三者会議', 'プレカット', '着工前確認',
  '地鎮祭準備', '地鎮祭', '地盤改良', '基礎着工', '配筋検査', 'アンカー', '土台伏せ', '上棟',
  'ルーフィング', '金物検査', '透湿防水', '断熱検査', '外壁確認', '木完', '追加変更', '保証書', '社内完了',
  '見学会', '施主完了', '完成検査', '引渡式'
];

// ダミーデータ
const projects = [
  {
    id: '1',
    name: '田中邸',
    customer: '田中太郎',
    phase: '施工',
    grade: 'A',
    sales: '山田',
    design: '佐藤',
    ic: '鈴木',
    construction: '高橋',
    foundation: '03/15',
    roofing: '04/20',
    stages: {
      '設計申込': '01/15',
      'プランヒアリング': '01/20',
      '1stプラン': '01/25',
      '基礎着工': '03/15',
      '上棟': '04/20',
    }
  },
  {
    id: '2',
    name: '佐藤邸',
    customer: '佐藤花子',
    phase: '契約',
    grade: 'B',
    sales: '田中',
    design: '山田',
    ic: '高橋',
    construction: '鈴木',
    foundation: '04/10',
    roofing: '05/15',
    stages: {
      '設計申込': '02/01',
      'プランヒアリング': '02/05',
      '1stプラン': '02/10',
      '2ndプラン': '02/15',
    }
  },
];

export const ConstructionBoardExcel: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
              <GridCell width={90} isHeader>フェーズ</GridCell>
            </GridRow>
            {/* データ行 */}
            {projects.map((project) => (
              <GridRow key={project.id}>
                <GridCell width={80} isFixed>{project.name}</GridCell>
                <GridCell width={80} isFixed>{project.customer}</GridCell>
                <GridCell width={50} isFixed>{project.grade}</GridCell>
                <GridCell width={90} isFixed>
                  <Box
                    sx={{
                      backgroundColor: phases.find(p => p.name.includes(project.phase.split('・')[0]))?.color || '#ccc',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '2px',
                      fontSize: '11px',
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    {project.phase}
                  </Box>
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
              {projects.map((project) => (
                <GridRow key={project.id}>
                  {allStages.map((stage) => {
                    const date = project.stages[stage];
                    const isCompleted = !!date;
                    return (
                      <StatusCell
                        key={stage}
                        width={80}
                        status={isCompleted ? 'COMPLETED' : undefined}
                        title={date ? `${stage}: ${date}` : stage}
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