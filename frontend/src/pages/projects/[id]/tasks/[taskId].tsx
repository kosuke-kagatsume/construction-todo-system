import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/Layout/MainLayout';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Breadcrumbs,
  Link,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  Person,
  AttachFile,
  Comment,
  CheckCircle,
  Schedule,
  MoreVert,
  Edit,
  Delete,
  Assignment,
  Warning,
  Send,
} from '@mui/icons-material';
import { mockProjects, allStages } from '@/data/mockData';
import { hasChecksheet, getChecksheetProgress } from '@/data/checksheets';
import { StageChecksheet } from '@/components/Checksheet/StageChecksheet';
import { ChecksheetIndicator } from '@/components/Checksheet/ChecksheetIndicator';
import { format } from 'date-fns';

// サンプルのコメントデータ
const sampleComments = [
  {
    id: '1',
    author: '佐藤',
    avatar: 'S',
    content: '基礎配筋の写真を撮影しました。確認お願いします。',
    timestamp: '2024-03-20 09:30',
    attachments: ['基礎配筋_01.jpg', '基礎配筋_02.jpg'],
  },
  {
    id: '2',
    author: '鈴木',
    avatar: 'SZ',
    content: '配筋間隔に問題ありません。次工程に進めます。',
    timestamp: '2024-03-20 14:15',
  },
  {
    id: '3',
    author: '田中',
    avatar: 'T',
    content: 'コンクリート打設は明日の予定です。天候も問題なさそうです。',
    timestamp: '2024-03-20 16:45',
  },
];

export default function TaskDetailPage() {
  const router = useRouter();
  const { id, taskId } = router.query;
  const [newComment, setNewComment] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [checksheetOpen, setChecksheetOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // プロジェクトとタスクの情報を取得（実際はAPIから取得）
  const project = mockProjects.find(p => p.id === id);
  const stageName = taskId as string;
  
  if (!project || !stageName) {
    return null;
  }

  const taskDate = project.stages[stageName];
  const hasChecklist = hasChecksheet(stageName);
  const checksheetProgress = hasChecklist ? getChecksheetProgress(stageName, checkedItems) : null;

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // コメント送信処理（実際はAPI呼び出し）
      console.log('送信:', newComment);
      setNewComment('');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChecksheetComplete = (items: string[]) => {
    setCheckedItems(items);
    // チェックシートの保存処理（実際はAPI呼び出し）
    console.log('チェックシート保存:', items);
  };

  return (
    <MainLayout>
      <Box className="fade-in">
        {/* パンくず */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => router.push('/projects')}
            underline="hover"
            color="inherit"
          >
            プロジェクト
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => router.push(`/projects/${id}`)}
            underline="hover"
            color="inherit"
          >
            {project.name}
          </Link>
          <Typography color="text.primary" variant="body2">
            {stageName}
          </Typography>
        </Breadcrumbs>

        {/* ヘッダー */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="h4" component="h1">
                  {stageName}
                </Typography>
                <Chip
                  label={taskDate ? '完了' : '未着手'}
                  color={taskDate ? 'success' : 'default'}
                  size="medium"
                />
                {hasChecklist && checksheetProgress && (
                  <ChecksheetIndicator
                    stageName={stageName}
                    checkedItems={checkedItems}
                    onClick={() => setChecksheetOpen(true)}
                  />
                )}
              </Box>
              <Typography variant="body1" color="text.secondary">
                {project.name} - {project.customer}様
              </Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => {
                  // チェックシートを閉じる
                  setChecksheetOpen(false);
                  // 少し遅延を入れてから遷移
                  setTimeout(() => {
                    router.push(`/projects/${id}`);
                  }, 100);
                }}
              >
                プロジェクトに戻る
              </Button>
              <IconButton onClick={handleMenuOpen}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>
                  <Edit sx={{ mr: 1 }} fontSize="small" />
                  編集
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <Delete sx={{ mr: 1 }} fontSize="small" />
                  削除
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* 左側：タスク情報 */}
          <Grid item xs={12} md={8}>
            {/* 基本情報 */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  基本情報
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <CalendarToday color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        予定日
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {taskDate || '未設定'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Person color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        担当者
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {project.construction}
                    </Typography>
                  </Grid>
                </Grid>
                
                {/* 進捗バー */}
                <Box mt={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      進捗状況
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {taskDate ? '100%' : '0%'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={taskDate ? 100 : 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* チェックシート */}
            {hasChecklist && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      チェックシート
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Assignment />}
                      onClick={() => setChecksheetOpen(true)}
                    >
                      チェックシートを開く
                    </Button>
                  </Box>
                  
                  {checksheetProgress && (
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          必須項目の完了状況
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {checksheetProgress.requiredChecked}/{checksheetProgress.required} 項目
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={checksheetProgress.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'grey.300',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: checksheetProgress.percentage === 100 ? 'success.main' : 'warning.main',
                          },
                        }}
                      />
                      {checksheetProgress.percentage < 100 && (
                        <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                          <Warning color="warning" fontSize="small" />
                          <Typography variant="caption" color="warning.main">
                            必須項目が未完了のため、タスクを完了できません
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* コメント */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  コメント・履歴
                </Typography>
                
                <List>
                  {sampleComments.map((comment, index) => (
                    <React.Fragment key={comment.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>{comment.avatar}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="subtitle2">
                                {comment.author}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {comment.timestamp}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {comment.content}
                              </Typography>
                              {comment.attachments && (
                                <Box display="flex" gap={1} mt={1}>
                                  {comment.attachments.map((file, idx) => (
                                    <Chip
                                      key={idx}
                                      label={file}
                                      size="small"
                                      icon={<AttachFile />}
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < sampleComments.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
                
                {/* コメント入力 */}
                <Box display="flex" gap={1} mt={3}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="コメントを入力..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Box display="flex" flexDirection="column" gap={1}>
                    <IconButton color="primary" onClick={handleCommentSubmit}>
                      <Send />
                    </IconButton>
                    <IconButton>
                      <AttachFile />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 右側：関連情報 */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  関連タスク
                </Typography>
                <List dense>
                  {allStages
                    .filter(stage => stage !== stageName)
                    .slice(0, 5)
                    .map(stage => (
                      <ListItem
                        key={stage}
                        button
                        onClick={() => router.push(`/projects/${id}/tasks/${stage}`)}
                      >
                        <ListItemText
                          primary={stage}
                          secondary={project.stages[stage] || '未着手'}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* チェックシートダイアログ */}
        {hasChecklist && (
          <StageChecksheet
            projectId={project.id}
            stageName={stageName}
            open={checksheetOpen}
            onClose={() => setChecksheetOpen(false)}
            onComplete={handleChecksheetComplete}
            initialCheckedItems={checkedItems}
          />
        )}
      </Box>
    </MainLayout>
  );
}