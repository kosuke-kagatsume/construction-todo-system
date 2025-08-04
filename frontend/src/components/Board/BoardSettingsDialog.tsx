import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Divider,
  Chip,
} from '@mui/material';
import {
  ExpandMore,
  Settings,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { BoardColumnSettings, stageCategories } from '@/data/boardSettings';
import { sharedItemDefinitions } from '@/data/sharedItems';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: BoardColumnSettings;
  onSave: (settings: BoardColumnSettings) => void;
}

export const BoardSettingsDialog: React.FC<Props> = ({
  open,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<BoardColumnSettings>(settings);

  const handleStageToggle = (stage: string) => {
    setLocalSettings(prev => ({
      ...prev,
      visibleStages: prev.visibleStages.includes(stage)
        ? prev.visibleStages.filter(s => s !== stage)
        : [...prev.visibleStages, stage],
    }));
  };

  const handleCategoryToggle = (stages: string[]) => {
    const allVisible = stages.every(stage => localSettings.visibleStages.includes(stage));
    
    setLocalSettings(prev => ({
      ...prev,
      visibleStages: allVisible
        ? prev.visibleStages.filter(s => !stages.includes(s))
        : Array.from(new Set([...prev.visibleStages, ...stages])),
    }));
  };

  const handleAssigneeToggle = (key: keyof typeof localSettings.showAssignees) => {
    setLocalSettings(prev => ({
      ...prev,
      showAssignees: {
        ...prev.showAssignees,
        [key]: !prev.showAssignees[key],
      },
    }));
  };

  const handleSharedItemToggle = (itemId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      visibleSharedItems: prev.visibleSharedItems.includes(itemId)
        ? prev.visibleSharedItems.filter(id => id !== itemId)
        : [...prev.visibleSharedItems, itemId],
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings />
          現場ボード表示設定
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* 担当者列の設定 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            担当者列の表示
          </Typography>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={localSettings.showAssignees.sales}
                  onChange={() => handleAssigneeToggle('sales')}
                />
              }
              label="営業"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={localSettings.showAssignees.design}
                  onChange={() => handleAssigneeToggle('design')}
                />
              }
              label="設計"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={localSettings.showAssignees.ic}
                  onChange={() => handleAssigneeToggle('ic')}
                />
              }
              label="IC"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={localSettings.showAssignees.construction}
                  onChange={() => handleAssigneeToggle('construction')}
                />
              }
              label="工務"
            />
          </FormGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 共有事項の設定 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            共有事項の表示
          </Typography>
          <FormGroup>
            {sharedItemDefinitions.map(item => (
              <FormControlLabel
                key={item.id}
                control={
                  <Checkbox
                    checked={localSettings.visibleSharedItems.includes(item.id)}
                    onChange={() => handleSharedItemToggle(item.id)}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{item.name}</Typography>
                    <Chip label={item.category} size="small" variant="outlined" />
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ステージの設定 */}
        <Box>
          <Typography variant="h6" gutterBottom>
            ステージの表示
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            表示するステージを選択してください
          </Typography>

          {stageCategories.map((category) => {
            const visibleCount = category.stages.filter(stage => 
              localSettings.visibleStages.includes(stage)
            ).length;
            const allVisible = visibleCount === category.stages.length;

            return (
              <Accordion key={category.name} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Typography>{category.name}</Typography>
                    <Chip 
                      label={`${visibleCount}/${category.stages.length}`}
                      size="small"
                      color={allVisible ? 'primary' : 'default'}
                    />
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryToggle(category.stages);
                      }}
                      startIcon={allVisible ? <VisibilityOff /> : <Visibility />}
                    >
                      {allVisible ? '全て非表示' : '全て表示'}
                    </Button>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <FormGroup>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                      {category.stages.map(stage => (
                        <FormControlLabel
                          key={stage}
                          control={
                            <Checkbox
                              checked={localSettings.visibleStages.includes(stage)}
                              onChange={() => handleStageToggle(stage)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">{stage}</Typography>
                          }
                        />
                      ))}
                    </Box>
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset}>
          リセット
        </Button>
        <Button onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSave} variant="contained">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};