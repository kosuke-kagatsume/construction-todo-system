import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Grid,
  Chip,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  ExpandMore,
  ExpandLess,
  History,
  Check,
  Close,
  CalendarToday,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  sharedItemDefinitions,
  groupItemsByCategory,
  SharedItemDefinition,
  SharedItemValue,
  ProjectSharedItems as ProjectSharedItemsType,
  sampleSharedItems,
} from '@/data/sharedItems';

interface Props {
  projectId: string;
}

export const ProjectSharedItems: React.FC<Props> = ({ projectId }) => {
  const [items, setItems] = useState<ProjectSharedItemsType>(sampleSharedItems);
  const [editingItems, setEditingItems] = useState<{ [itemId: string]: any }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{ [category: string]: boolean }>({});
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const groupedItems = groupItemsByCategory(sharedItemDefinitions);
  const categories = Object.keys(groupedItems);

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
    });
  };

  const handleEdit = () => {
    const currentValues: { [itemId: string]: any } = {};
    sharedItemDefinitions.forEach(def => {
      const item = items.items[def.id];
      currentValues[def.id] = item ? item.value : null;
    });
    setEditingItems(currentValues);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditingItems({});
    setIsEditing(false);
  };

  const handleSave = () => {
    const updatedItems = { ...items.items };
    Object.entries(editingItems).forEach(([itemId, value]) => {
      if (value !== null && value !== '') {
        updatedItems[itemId] = {
          itemId,
          value,
          updatedAt: new Date().toISOString(),
          updatedBy: '現在のユーザー', // 実際はログインユーザー情報を使用
        };
      }
    });
    setItems({ ...items, items: updatedItems });
    setIsEditing(false);
    setEditingItems({});
  };

  const handleValueChange = (itemId: string, value: any) => {
    setEditingItems({
      ...editingItems,
      [itemId]: value,
    });
  };

  const renderItemValue = (def: SharedItemDefinition) => {
    const item = items.items[def.id];
    const value = item ? item.value : null;

    if (isEditing) {
      const editValue = editingItems[def.id];
      
      switch (def.type) {
        case 'text':
          return (
            <TextField
              fullWidth
              size="small"
              value={editValue || ''}
              onChange={(e) => handleValueChange(def.id, e.target.value)}
              placeholder={def.description}
            />
          );
        
        case 'select':
          return (
            <FormControl fullWidth size="small">
              <Select
                value={editValue || ''}
                onChange={(e) => handleValueChange(def.id, e.target.value)}
                displayEmpty
              >
                <MenuItem value="">
                  <em>選択してください</em>
                </MenuItem>
                {def.options?.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        
        case 'date':
          return (
            <TextField
              fullWidth
              size="small"
              type="date"
              value={editValue || ''}
              onChange={(e) => handleValueChange(def.id, e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          );
        
        case 'number':
          return (
            <TextField
              fullWidth
              size="small"
              type="number"
              value={editValue || ''}
              onChange={(e) => handleValueChange(def.id, e.target.value)}
              InputProps={{
                endAdornment: def.unit ? (
                  <InputAdornment position="end">{def.unit}</InputAdornment>
                ) : undefined,
              }}
            />
          );
        
        case 'boolean':
          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={editValue === true}
                  onChange={(e) => handleValueChange(def.id, e.target.checked)}
                />
              }
              label={editValue ? '有' : '無'}
            />
          );
      }
    }

    // 表示モード
    if (value === null || value === '') {
      return <Typography variant="body2" color="text.secondary">-</Typography>;
    }

    switch (def.type) {
      case 'boolean':
        return value ? (
          <Chip label="有" size="small" color="success" icon={<Check />} />
        ) : (
          <Chip label="無" size="small" variant="outlined" icon={<Close />} />
        );
      
      case 'date':
        return (
          <Typography variant="body2">
            {format(new Date(value as string), 'yyyy年MM月dd日')}
          </Typography>
        );
      
      case 'select':
        return (
          <Chip 
            label={value as string} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        );
      
      default:
        return <Typography variant="body2">{value as string}</Typography>;
    }
  };

  const renderCategoryView = () => (
    <Box>
      {categories.map(category => {
        const categoryItems = groupedItems[category];
        const isExpanded = expandedCategories[category] !== false;
        
        return (
          <Paper key={category} sx={{ mb: 2 }}>
            <Box
              sx={{
                p: 2,
                backgroundColor: 'grey.50',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onClick={() => handleCategoryToggle(category)}
            >
              <Typography variant="h6">{category}</Typography>
              <IconButton size="small">
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            
            <Collapse in={isExpanded}>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {categoryItems.map(def => (
                    <Grid item xs={12} sm={6} md={4} key={def.id}>
                      <Box>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ mb: 0.5, display: 'block' }}
                        >
                          {def.name}
                          {def.required && <span style={{ color: 'red' }}> *</span>}
                        </Typography>
                        {renderItemValue(def)}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Collapse>
          </Paper>
        );
      })}
    </Box>
  );

  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>項目名</TableCell>
            <TableCell>カテゴリ</TableCell>
            <TableCell>値</TableCell>
            <TableCell>更新日</TableCell>
            <TableCell>更新者</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sharedItemDefinitions.map(def => {
            const item = items.items[def.id];
            return (
              <TableRow key={def.id}>
                <TableCell>
                  {def.name}
                  {def.required && <span style={{ color: 'red' }}> *</span>}
                </TableCell>
                <TableCell>
                  <Chip label={def.category} size="small" />
                </TableCell>
                <TableCell>{renderItemValue(def)}</TableCell>
                <TableCell>
                  {item ? format(new Date(item.updatedAt), 'yyyy/MM/dd') : '-'}
                </TableCell>
                <TableCell>{item ? item.updatedBy : '-'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">共有事項</Typography>
        <Box>
          {isEditing ? (
            <>
              <Button
                startIcon={<Save />}
                variant="contained"
                onClick={handleSave}
                sx={{ mr: 1 }}
              >
                保存
              </Button>
              <Button
                startIcon={<Cancel />}
                variant="outlined"
                onClick={handleCancel}
              >
                キャンセル
              </Button>
            </>
          ) : (
            <>
              <Button
                startIcon={<Edit />}
                variant="contained"
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                編集
              </Button>
              <Button
                startIcon={<History />}
                variant="outlined"
                onClick={() => setHistoryDialogOpen(true)}
              >
                履歴
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="カテゴリ別表示" />
        <Tab label="一覧表示" />
      </Tabs>

      {tabValue === 0 ? renderCategoryView() : renderTableView()}

      {/* 履歴ダイアログ（簡易版） */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>更新履歴</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            更新履歴機能は実装予定です
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};