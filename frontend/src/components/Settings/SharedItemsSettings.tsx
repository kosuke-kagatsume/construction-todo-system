import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Menu,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  DragIndicator,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  ContentCopy,
} from '@mui/icons-material';
import { SharedItemDefinition } from '@/data/sharedItems';

interface EditingItem {
  id?: string;
  name: string;
  category: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export const SharedItemsSettings: React.FC = () => {
  // サンプルデータ
  const [items, setItems] = useState<SharedItemDefinition[]>([
    { id: '1', name: '建築地', category: '物件情報', type: 'text', required: true },
    { id: '2', name: '地名地番', category: '物件情報', type: 'text', required: false },
    { id: '3', name: '敷地面積', category: '物件情報', type: 'number', required: true },
    { id: '4', name: '延床面積', category: '物件情報', type: 'number', required: true },
    { id: '5', name: '間取り', category: '物件情報', type: 'text', required: false },
    { id: '6', name: '構造', category: '物件情報', type: 'select', required: false, options: ['木造', '鉄骨造', 'RC造'] },
    { id: '7', name: '階数', category: '物件情報', type: 'select', required: false, options: ['平屋', '2階建', '3階建'] },
    { id: '8', name: '契約金額', category: '契約情報', type: 'number', required: true },
    { id: '9', name: '土地状況', category: '契約情報', type: 'select', required: true, options: ['所有', '契約済', '検討中', '未定'] },
    { id: '10', name: 'ローン状況', category: '契約情報', type: 'select', required: true, options: ['承認済', '審査中', '申請前', '不要'] },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<SharedItemDefinition | null>(null);

  const categories = ['物件情報', '契約情報', '設計情報', 'スケジュール', 'その他'];
  const types = [
    { value: 'text', label: 'テキスト' },
    { value: 'number', label: '数値' },
    { value: 'date', label: '日付' },
    { value: 'select', label: '選択式' },
    { value: 'boolean', label: 'はい/いいえ' },
  ];

  const handleAddItem = () => {
    setEditingItem({
      name: '',
      category: '物件情報',
      type: 'text',
      required: false,
      options: [],
    });
    setDialogOpen(true);
  };

  const handleEditItem = (item: SharedItemDefinition) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      category: item.category,
      type: item.type,
      required: item.required,
      options: item.options || [],
      validation: item.validation,
    });
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('この項目を削除してもよろしいですか？')) {
      setItems(items.filter(item => item.id !== itemId));
    }
    setAnchorEl(null);
  };

  const handleSaveItem = () => {
    if (!editingItem || !editingItem.name.trim()) return;

    if (editingItem.id) {
      // 編集
      setItems(items.map(item => 
        item.id === editingItem.id
          ? { ...item, ...editingItem } as SharedItemDefinition
          : item
      ));
    } else {
      // 新規追加
      const newItem: SharedItemDefinition = {
        id: Date.now().toString(),
        name: editingItem.name,
        category: editingItem.category,
        type: editingItem.type,
        required: editingItem.required,
        options: editingItem.type === 'select' ? editingItem.options : undefined,
        validation: editingItem.validation,
      };
      setItems([...items, newItem]);
    }

    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleAddOption = () => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      options: [...(editingItem.options || []), ''],
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!editingItem) return;
    const newOptions = [...(editingItem.options || [])];
    newOptions[index] = value;
    setEditingItem({
      ...editingItem,
      options: newOptions,
    });
  };

  const handleRemoveOption = (index: number) => {
    if (!editingItem) return;
    const newOptions = (editingItem.options || []).filter((_, i) => i !== index);
    setEditingItem({
      ...editingItem,
      options: newOptions,
    });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: SharedItemDefinition) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDuplicateItem = (item: SharedItemDefinition) => {
    const newItem: SharedItemDefinition = {
      ...item,
      id: Date.now().toString(),
      name: `${item.name} (コピー)`,
    };
    setItems([...items, newItem]);
    handleMenuClose();
  };

  const moveItem = (item: SharedItemDefinition, direction: 'up' | 'down') => {
    const index = items.findIndex(i => i.id === item.id);
    if (index === -1) return;

    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= items.length) return;

    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
    handleMenuClose();
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as { [category: string]: SharedItemDefinition[] });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          共有事項管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddItem}
        >
          新規項目追加
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        プロジェクトで共有する情報項目を管理できます。項目の追加・編集・削除や、入力タイプ、バリデーションルールの設定が可能です。
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={40}></TableCell>
              <TableCell>項目名</TableCell>
              <TableCell width={120}>カテゴリ</TableCell>
              <TableCell width={100}>タイプ</TableCell>
              <TableCell width={80} align="center">必須</TableCell>
              <TableCell width={200}>オプション/バリデーション</TableCell>
              <TableCell width={100} align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <React.Fragment key={category}>
                <TableRow>
                  <TableCell colSpan={7} sx={{ backgroundColor: 'grey.100', fontWeight: 'bold' }}>
                    {category}
                  </TableCell>
                </TableRow>
                {categoryItems.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <DragIndicator sx={{ color: 'action.disabled', cursor: 'grab' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {types.find(t => t.value === item.type)?.label}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {item.required && (
                        <Chip label="必須" size="small" color="error" />
                      )}
                    </TableCell>
                    <TableCell>
                      {item.type === 'select' && item.options && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {item.options.slice(0, 3).map((opt, i) => (
                            <Chip key={i} label={opt} size="small" variant="outlined" />
                          ))}
                          {item.options.length > 3 && (
                            <Chip label={`+${item.options.length - 3}`} size="small" />
                          )}
                        </Box>
                      )}
                      {item.type === 'number' && item.validation && (
                        <Typography variant="caption" color="text.secondary">
                          {item.validation.min && `最小: ${item.validation.min}`}
                          {item.validation.min && item.validation.max && ' / '}
                          {item.validation.max && `最大: ${item.validation.max}`}
                        </Typography>
                      )}
                      {item.type === 'text' && item.validation && (
                        <Typography variant="caption" color="text.secondary">
                          {item.validation.minLength && `最小: ${item.validation.minLength}文字`}
                          {item.validation.minLength && item.validation.maxLength && ' / '}
                          {item.validation.maxLength && `最大: ${item.validation.maxLength}文字`}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, item)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* アクションメニュー */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedItem && handleEditItem(selectedItem)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>編集</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedItem && handleDuplicateItem(selectedItem)}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>複製</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => selectedItem && moveItem(selectedItem, 'up')}>
          <ListItemIcon>
            <ArrowUpward fontSize="small" />
          </ListItemIcon>
          <ListItemText>上へ移動</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedItem && moveItem(selectedItem, 'down')}>
          <ListItemIcon>
            <ArrowDownward fontSize="small" />
          </ListItemIcon>
          <ListItemText>下へ移動</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => selectedItem && handleDeleteItem(selectedItem.id)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>削除</ListItemText>
        </MenuItem>
      </Menu>

      {/* 編集ダイアログ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem?.id ? '共有事項を編集' : '新規共有事項を追加'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="項目名"
                value={editingItem?.name || ''}
                onChange={(e) => setEditingItem(editingItem ? { ...editingItem, name: e.target.value } : null)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>カテゴリ</InputLabel>
                <Select
                  value={editingItem?.category || '物件情報'}
                  onChange={(e) => setEditingItem(editingItem ? { ...editingItem, category: e.target.value } : null)}
                  label="カテゴリ"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>タイプ</InputLabel>
                <Select
                  value={editingItem?.type || 'text'}
                  onChange={(e) => setEditingItem(editingItem ? { ...editingItem, type: e.target.value as any } : null)}
                  label="タイプ"
                >
                  {types.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editingItem?.required || false}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, required: e.target.checked } : null)}
                  />
                }
                label="必須項目"
              />
            </Grid>

            {/* 選択式の場合のオプション設定 */}
            {editingItem?.type === 'select' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  選択肢
                </Typography>
                <List dense>
                  {(editingItem.options || []).map((option, index) => (
                    <ListItem key={index}>
                      <TextField
                        fullWidth
                        size="small"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`選択肢 ${index + 1}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Button
                  startIcon={<Add />}
                  onClick={handleAddOption}
                  size="small"
                >
                  選択肢を追加
                </Button>
              </Grid>
            )}

            {/* 数値型の場合のバリデーション設定 */}
            {editingItem?.type === 'number' && (
              <>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="最小値"
                    type="number"
                    value={editingItem.validation?.min || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      validation: {
                        ...editingItem.validation,
                        min: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="最大値"
                    type="number"
                    value={editingItem.validation?.max || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      validation: {
                        ...editingItem.validation,
                        max: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })}
                  />
                </Grid>
              </>
            )}

            {/* テキスト型の場合のバリデーション設定 */}
            {editingItem?.type === 'text' && (
              <>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="最小文字数"
                    type="number"
                    value={editingItem.validation?.minLength || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      validation: {
                        ...editingItem.validation,
                        minLength: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="最大文字数"
                    type="number"
                    value={editingItem.validation?.maxLength || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      validation: {
                        ...editingItem.validation,
                        maxLength: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSaveItem} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};