import React from 'react';
import { Box, Paper, Typography, Chip, Tabs, Tab } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Phase, Project, Stage } from '@/types';
import { format } from 'date-fns';

// ダミーデータ（後でAPIから取得）
const phases: Phase[] = [
  { id: '1', code: 'LEAD', name: '追客・設計', displayOrder: 1, colorCode: '#2196F3' },
  { id: '2', code: 'CONTRACT', name: '契約', displayOrder: 2, colorCode: '#4CAF50' },
  { id: '3', code: 'MEETING', name: '打ち合わせ', displayOrder: 3, colorCode: '#FF9800' },
  { id: '4', code: 'CONSTRUCTION', name: '施工', displayOrder: 4, colorCode: '#F44336' },
  { id: '5', code: 'COMPLETION', name: '竣工', displayOrder: 5, colorCode: '#9C27B0' },
];

const stages: Stage[] = [
  { id: '1', phaseId: '1', code: 'DESIGN_APP', name: '設計申込', displayOrder: 1, isMilestone: false },
  { id: '2', phaseId: '1', code: 'PLAN_HEARING', name: 'プランヒアリング', displayOrder: 2, isMilestone: false },
  // ... 他のステージ
];

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
      id={`board-tabpanel-${index}`}
      aria-labelledby={`board-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ConstructionBoard: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 基本列定義
  const baseColumns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: '邸名', 
      width: 150,
    },
    { 
      field: 'customerName', 
      headerName: '顧客名', 
      width: 120,
    },
    { 
      field: 'phase', 
      headerName: 'フェーズ', 
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: phases.find(p => p.name.includes(params.value))?.colorCode || '#ccc',
            color: 'white',
          }}
        />
      ),
    },
    { 
      field: 'salesUser', 
      headerName: '営業', 
      width: 100,
    },
    { 
      field: 'designUser', 
      headerName: '設計', 
      width: 100,
    },
    { 
      field: 'icUser', 
      headerName: 'IC', 
      width: 100,
    },
    { 
      field: 'constructionUser', 
      headerName: '工務', 
      width: 100,
    },
  ];

  // ステージごとの列を動的に追加
  const stageColumns: GridColDef[] = stages.map((stage) => ({
    field: `stage_${stage.id}`,
    headerName: stage.name,
    width: 120,
    renderCell: (params: GridRenderCellParams) => {
      const date = params.value as string | undefined;
      if (!date) return '-';
      
      return (
        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
          {format(new Date(date), 'MM/dd')}
        </Typography>
      );
    },
  }));

  const columns = [...baseColumns, ...stageColumns];

  // ダミーの行データ
  const rows = [
    {
      id: '1',
      name: '田中邸',
      customerName: '田中太郎',
      phase: '施工',
      salesUser: '山田',
      designUser: '佐藤',
      icUser: '鈴木',
      constructionUser: '高橋',
      stage_1: '2024-01-15',
      stage_2: '2024-01-20',
    },
    // ... 他の行
  ];

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="board tabs">
          <Tab label="実施済日程ボード" />
          <Tab label="予測日程ボード" />
          <Tab label="実施・予測日程ボード" />
          <Tab label="一覧確認" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            height: 'calc(100vh - 300px)',
            '& .MuiDataGrid-cell': {
              borderRight: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#f5f5f5',
              borderRight: '1px solid #e0e0e0',
            },
          }}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography>予測日程ボード（実装予定）</Typography>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Typography>実施・予測日程ボード（実装予定）</Typography>
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Typography>一覧確認（実装予定）</Typography>
      </TabPanel>
    </Paper>
  );
};