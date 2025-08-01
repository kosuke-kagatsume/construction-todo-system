import React from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Save, Print, FileDownload } from '@mui/icons-material';

interface ProjectDetailExcelProps {
  projectId: string;
}

// エクセル風のスタイル
const ExcelSheet = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #d0d0d0',
  borderRadius: 0,
  padding: 0,
  overflow: 'hidden',
});

const ExcelHeader = styled(Box)({
  backgroundColor: '#217346',
  color: 'white',
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: 'bold',
  fontFamily: '"メイリオ", "Meiryo", sans-serif',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ExcelToolbar = styled(Box)({
  backgroundColor: '#f0f0f0',
  borderBottom: '1px solid #d0d0d0',
  padding: '4px 8px',
  display: 'flex',
  gap: '8px',
});

const ExcelButton = styled(Button)({
  fontSize: '12px',
  padding: '2px 8px',
  minHeight: '24px',
  textTransform: 'none',
  fontFamily: '"メイリオ", "Meiryo", sans-serif',
});

const InfoSection = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 0,
  '& > div': {
    border: '1px solid #d0d0d0',
    padding: '8px',
  },
});

const InfoCell = styled(Box)<{ isHeader?: boolean }>(({ isHeader }) => ({
  backgroundColor: isHeader ? '#e7f3e7' : '#ffffff',
  fontWeight: isHeader ? 'bold' : 'normal',
  fontSize: '12px',
  fontFamily: '"メイリオ", "Meiryo", sans-serif',
}));

const TaskTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '12px',
  fontFamily: '"メイリオ", "Meiryo", sans-serif',
  '& th': {
    backgroundColor: '#217346',
    color: 'white',
    padding: '4px 8px',
    borderRight: '1px solid #1e5f3f',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  '& td': {
    padding: '4px 8px',
    border: '1px solid #d0d0d0',
  },
  '& tr:hover td': {
    backgroundColor: '#f5f5f5',
  },
});

const PhaseRow = styled('tr')({
  '& td': {
    backgroundColor: '#e7f3e7',
    fontWeight: 'bold',
    fontSize: '11px',
  },
});

const ChecklistBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  fontSize: '11px',
  '& label': {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

// ダミーデータ
const projectData = {
  name: '田中邸',
  customer: '田中太郎',
  phase: '施工',
  grade: 'A',
  sales: '山田太郎',
  design: '佐藤花子',
  ic: '鈴木一郎',
  construction: '高橋次郎',
  foundationTarget: '2024/03/15',
  roofingTarget: '2024/04/20',
  startDate: '2024/01/15',
  endDate: '2024/08/30',
};

const tasks = [
  { phase: '追客・設計', tasks: [
    { id: '1', name: '設計申込', assignee: '営業', planned: '01/15', actual: '01/15', status: '完了', checklist: ['申込書受領', '顧客情報登録', '設計担当アサイン'] },
    { id: '2', name: 'プランヒアリング', assignee: '設計', planned: '01/20', actual: '01/20', status: '完了', checklist: ['要望確認', '敷地調査', '法規確認'] },
    { id: '3', name: '1stプラン提案', assignee: '設計', planned: '01/25', actual: '01/25', status: '完了', checklist: ['プラン作成', '見積作成', 'プレゼン資料'] },
  ]},
  { phase: '契約', tasks: [
    { id: '4', name: '契約前打合せ', assignee: '営業', planned: '02/10', actual: '02/10', status: '完了', checklist: ['条件確認', '支払条件', 'スケジュール'] },
    { id: '5', name: '請負契約', assignee: '営業', planned: '02/15', actual: '02/15', status: '完了', checklist: ['契約書作成', '印紙準備', '契約締結'] },
  ]},
  { phase: '施工', tasks: [
    { id: '6', name: '基礎着工', assignee: '工務', planned: '03/15', actual: '03/15', status: '進行中', checklist: ['地縄張り', '掘削開始', '配筋準備'] },
    { id: '7', name: '上棟', assignee: '工務', planned: '04/20', actual: '', status: '未着手', checklist: ['部材搬入', '足場設置', '上棟準備'] },
  ]},
];

export const ProjectDetailExcel: React.FC<ProjectDetailExcelProps> = ({ projectId }) => {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<any>(null);

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  return (
    <>
      <ExcelSheet elevation={0}>
        <ExcelHeader>
          <Typography>原本 - {projectData.name}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ExcelButton variant="contained" size="small" startIcon={<Save />}>
              保存
            </ExcelButton>
            <ExcelButton variant="outlined" size="small" startIcon={<Print />}>
              印刷
            </ExcelButton>
            <ExcelButton variant="outlined" size="small" startIcon={<FileDownload />}>
              エクスポート
            </ExcelButton>
          </Box>
        </ExcelHeader>

        <ExcelToolbar>
          <Typography variant="caption" sx={{ lineHeight: '24px' }}>
            最終更新: 2024/03/20 14:30 | 更新者: 山田太郎
          </Typography>
        </ExcelToolbar>

        {/* プロジェクト情報セクション */}
        <InfoSection>
          <InfoCell isHeader>邸名</InfoCell>
          <InfoCell>{projectData.name}</InfoCell>
          <InfoCell isHeader>顧客名</InfoCell>
          <InfoCell>{projectData.customer}</InfoCell>
          
          <InfoCell isHeader>フェーズ</InfoCell>
          <InfoCell>{projectData.phase}</InfoCell>
          <InfoCell isHeader>グレード</InfoCell>
          <InfoCell>{projectData.grade}</InfoCell>
          
          <InfoCell isHeader>営業担当</InfoCell>
          <InfoCell>{projectData.sales}</InfoCell>
          <InfoCell isHeader>設計担当</InfoCell>
          <InfoCell>{projectData.design}</InfoCell>
          
          <InfoCell isHeader>IC担当</InfoCell>
          <InfoCell>{projectData.ic}</InfoCell>
          <InfoCell isHeader>工務担当</InfoCell>
          <InfoCell>{projectData.construction}</InfoCell>
          
          <InfoCell isHeader>基礎着工目標</InfoCell>
          <InfoCell>{projectData.foundationTarget}</InfoCell>
          <InfoCell isHeader>上棟目標</InfoCell>
          <InfoCell>{projectData.roofingTarget}</InfoCell>
          
          <InfoCell isHeader>着工予定</InfoCell>
          <InfoCell>{projectData.startDate}</InfoCell>
          <InfoCell isHeader>竣工予定</InfoCell>
          <InfoCell>{projectData.endDate}</InfoCell>
        </InfoSection>

        {/* タスクテーブル */}
        <Box sx={{ p: 2 }}>
          <TaskTable>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>No.</th>
                <th style={{ width: '200px' }}>タスク名</th>
                <th style={{ width: '80px' }}>担当</th>
                <th style={{ width: '80px' }}>予定日</th>
                <th style={{ width: '80px' }}>実施日</th>
                <th style={{ width: '80px' }}>状態</th>
                <th>チェックリスト</th>
                <th style={{ width: '60px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((phaseGroup) => (
                <React.Fragment key={phaseGroup.phase}>
                  <PhaseRow>
                    <td colSpan={8}>{phaseGroup.phase}</td>
                  </PhaseRow>
                  {phaseGroup.tasks.map((task, index) => (
                    <tr key={task.id}>
                      <td>{task.id}</td>
                      <td>{task.name}</td>
                      <td>{task.assignee}</td>
                      <td>{task.planned}</td>
                      <td style={{ 
                        backgroundColor: task.actual ? '#d4edda' : '#ffffff',
                        color: task.actual ? '#155724' : '#000000',
                      }}>
                        {task.actual || '-'}
                      </td>
                      <td style={{
                        backgroundColor: 
                          task.status === '完了' ? '#d4edda' :
                          task.status === '進行中' ? '#cce5ff' :
                          '#ffffff',
                        color:
                          task.status === '完了' ? '#155724' :
                          task.status === '進行中' ? '#004085' :
                          '#000000',
                      }}>
                        {task.status}
                      </td>
                      <td>
                        <ChecklistBox>
                          {task.checklist.map((item, i) => (
                            <label key={i}>
                              <Checkbox size="small" sx={{ padding: 0 }} />
                              {item}
                            </label>
                          ))}
                        </ChecklistBox>
                      </td>
                      <td>
                        <ExcelButton
                          size="small"
                          onClick={() => handleTaskClick(task)}
                        >
                          編集
                        </ExcelButton>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </TaskTable>
        </Box>
      </ExcelSheet>

      {/* 編集ダイアログ */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '14px', fontFamily: '"メイリオ", "Meiryo", sans-serif' }}>
          タスク編集 - {selectedTask?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="実施日"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={selectedTask?.actual || ''}
            />
            <TextField
              label="状態"
              select
              size="small"
              fullWidth
              value={selectedTask?.status || '未着手'}
              SelectProps={{ native: true }}
            >
              <option value="未着手">未着手</option>
              <option value="進行中">進行中</option>
              <option value="完了">完了</option>
            </TextField>
            <TextField
              label="メモ"
              multiline
              rows={3}
              size="small"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} size="small">キャンセル</Button>
          <Button onClick={() => setEditDialogOpen(false)} variant="contained" size="small">保存</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};