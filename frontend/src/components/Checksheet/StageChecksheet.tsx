import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  CheckCircleOutline,
  RadioButtonUnchecked,
  ExpandMore,
  ExpandLess,
  Assignment,
  Warning,
  Info,
} from '@mui/icons-material';
import {
  stageChecksheets,
  canCompleteStage,
  getChecksheetProgress,
  ChecksheetItem,
} from '@/data/checksheets';

interface StageChecksheetProps {
  projectId: string;
  stageName: string;
  open: boolean;
  onClose: () => void;
  onComplete: (checkedItems: string[]) => void;
  initialCheckedItems?: string[];
  readOnly?: boolean;
}

export const StageChecksheet: React.FC<StageChecksheetProps> = ({
  projectId,
  stageName,
  open,
  onClose,
  onComplete,
  initialCheckedItems = [],
  readOnly = false,
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(initialCheckedItems)
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const checksheet = stageChecksheets[stageName] || [];
  const progress = getChecksheetProgress(stageName, Array.from(checkedItems));
  const { canComplete, missingItems } = canCompleteStage(
    stageName,
    Array.from(checkedItems)
  );

  // カテゴリごとにアイテムをグループ化
  const categorizedItems = checksheet.reduce((acc, item) => {
    const category = item.category || '全般';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as { [category: string]: ChecksheetItem[] });

  useEffect(() => {
    // 初期状態で全カテゴリを展開
    setExpandedCategories(new Set(Object.keys(categorizedItems)));
  }, [stageName]);

  const handleToggle = (itemId: string) => {
    if (readOnly) return;
    
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const handleCategoryToggle = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleComplete = () => {
    onComplete(Array.from(checkedItems));
    onClose();
  };

  const handleClose = () => {
    // 状態をクリア
    setCheckedItems(new Set(initialCheckedItems));
    setExpandedCategories(new Set());
    onClose();
  };

  const getCategoryProgress = (category: string) => {
    const items = categorizedItems[category];
    const requiredItems = items.filter(item => item.required);
    const checkedCount = items.filter(item => checkedItems.has(item.id)).length;
    const requiredCheckedCount = requiredItems.filter(item => 
      checkedItems.has(item.id)
    ).length;
    
    return {
      total: items.length,
      checked: checkedCount,
      required: requiredItems.length,
      requiredChecked: requiredCheckedCount,
      allRequiredChecked: requiredCheckedCount === requiredItems.length,
    };
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Assignment />
          <Typography variant="h6">{stageName} チェックシート</Typography>
          {readOnly && <Chip label="閲覧のみ" size="small" />}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              進捗: {progress.requiredChecked}/{progress.required} 必須項目
              （全{progress.checked}/{progress.total}項目）
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {progress.percentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress.percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.300',
              '& .MuiLinearProgress-bar': {
                backgroundColor: progress.percentage === 100 ? 'success.main' : 'primary.main',
              },
            }}
          />
        </Box>

        {!canComplete && missingItems.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              以下の必須項目が未チェックです：
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {missingItems.map((item, index) => (
                <li key={index}>
                  <Typography variant="body2">{item}</Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}

        {checksheet.length === 0 ? (
          <Alert severity="info">
            このステージにはチェックシートが設定されていません。
          </Alert>
        ) : (
          <List sx={{ width: '100%' }}>
            {Object.entries(categorizedItems).map(([category, items]) => {
              const categoryProgress = getCategoryProgress(category);
              const isExpanded = expandedCategories.has(category);
              
              return (
                <Box key={category} sx={{ mb: 2 }}>
                  <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                    <ListItem
                      button
                      onClick={() => handleCategoryToggle(category)}
                      sx={{
                        backgroundColor: 'grey.50',
                        borderBottom: isExpanded ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <ListItemIcon>
                        {categoryProgress.allRequiredChecked ? (
                          <CheckCircleOutline color="success" />
                        ) : (
                          <RadioButtonUnchecked />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={category}
                        secondary={`${categoryProgress.checked}/${categoryProgress.total} 完了`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small">
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <Collapse in={isExpanded}>
                      <List disablePadding>
                        {items.map((item, index) => (
                          <ListItem
                            key={item.id}
                            button={!readOnly as any}
                            onClick={() => handleToggle(item.id)}
                            sx={{
                              pl: 3,
                              py: 1.5,
                              borderBottom:
                                index < items.length - 1
                                  ? '1px solid'
                                  : 'none',
                              borderColor: 'divider',
                              alignItems: 'flex-start',
                              '&:hover': {
                                backgroundColor: readOnly
                                  ? 'transparent'
                                  : 'action.hover',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ mt: 0.5, minWidth: 42 }}>
                              <Checkbox
                                edge="start"
                                checked={checkedItems.has(item.id)}
                                disabled={readOnly}
                                tabIndex={-1}
                                disableRipple
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box>
                                  <Box display="flex" alignItems="flex-start" gap={1} mb={item.description ? 0.5 : 0}>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        wordBreak: 'break-word',
                                        lineHeight: 1.5,
                                        flex: 1,
                                      }}
                                    >
                                      {item.label}
                                    </Typography>
                                    {item.required && (
                                      <Chip
                                        label="必須"
                                        size="small"
                                        color="error"
                                        sx={{ 
                                          height: 18, 
                                          fontSize: '11px',
                                          flexShrink: 0,
                                        }}
                                      />
                                    )}
                                  </Box>
                                  {item.description && (
                                    <Typography 
                                      variant="caption" 
                                      color="text.secondary"
                                      sx={{ 
                                        display: 'block',
                                        wordBreak: 'break-word',
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {item.description}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Paper>
                </Box>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose} color="inherit">
          {readOnly ? '閉じる' : 'キャンセル'}
        </Button>
        {!readOnly && (
          <Button
            onClick={handleComplete}
            variant="contained"
            disabled={!canComplete}
            startIcon={canComplete ? <CheckCircleOutline /> : <Warning />}
          >
            {canComplete ? 'ステージを完了' : '必須項目が未完了'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};