import React from 'react';
import { Box, Chip, Tooltip, CircularProgress, Typography } from '@mui/material';
import { Assignment, CheckCircle, Warning } from '@mui/icons-material';
import { hasChecksheet, getChecksheetProgress } from '@/data/checksheets';

interface ChecksheetIndicatorProps {
  stageName: string;
  checkedItems: string[];
  size?: 'small' | 'medium';
  showLabel?: boolean;
  onClick?: () => void;
}

export const ChecksheetIndicator: React.FC<ChecksheetIndicatorProps> = ({
  stageName,
  checkedItems = [],
  size = 'small',
  showLabel = true,
  onClick,
}) => {
  if (!hasChecksheet(stageName)) {
    return null;
  }

  const progress = getChecksheetProgress(stageName, checkedItems);
  const isComplete = progress.percentage === 100;

  const getColor = () => {
    if (isComplete) return 'success';
    if (progress.percentage > 0) return 'warning';
    return 'default';
  };

  const getIcon = () => {
    if (isComplete) return <CheckCircle sx={{ fontSize: size === 'small' ? 14 : 18 }} />;
    if (progress.percentage > 0) return <Assignment sx={{ fontSize: size === 'small' ? 14 : 18 }} />;
    return <Assignment sx={{ fontSize: size === 'small' ? 14 : 18 }} />;
  };

  const chipContent = (
    <Chip
      icon={getIcon()}
      label={showLabel ? `${progress.percentage}%` : undefined}
      size="small"
      color={getColor()}
      onClick={onClick}
      sx={{
        height: size === 'small' ? 20 : 24,
        fontSize: size === 'small' ? '10px' : '12px',
        cursor: onClick ? 'pointer' : 'default',
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? 14 : 18,
          marginLeft: showLabel ? '4px' : 0,
        },
      }}
    />
  );

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="caption" fontWeight="bold">
            チェックシート進捗
          </Typography>
          <Typography variant="caption" display="block">
            必須: {progress.requiredChecked}/{progress.required}項目
          </Typography>
          <Typography variant="caption" display="block">
            全体: {progress.checked}/{progress.total}項目
          </Typography>
        </Box>
      }
    >
      {chipContent}
    </Tooltip>
  );
};

// 複数ステージのチェックシート状態をまとめて表示
interface MultiStageChecksheetStatusProps {
  stages: { [stageName: string]: string | null };
  checksheetProgress: { [stageName: string]: string[] };
  size?: 'small' | 'medium';
}

export const MultiStageChecksheetStatus: React.FC<MultiStageChecksheetStatusProps> = ({
  stages,
  checksheetProgress,
  size = 'small',
}) => {
  const stagesWithChecksheet = Object.keys(stages).filter(stageName => 
    hasChecksheet(stageName) && stages[stageName]
  );

  if (stagesWithChecksheet.length === 0) {
    return null;
  }

  const totalStages = stagesWithChecksheet.length;
  const completedStages = stagesWithChecksheet.filter(stageName => {
    const progress = getChecksheetProgress(stageName, checksheetProgress[stageName] || []);
    return progress.percentage === 100;
  }).length;

  const percentage = Math.round((completedStages / totalStages) * 100);

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Assignment sx={{ fontSize: size === 'small' ? 14 : 18, color: 'text.secondary' }} />
      <Typography variant="caption" color="text.secondary">
        {completedStages}/{totalStages}
      </Typography>
      <CircularProgress
        variant="determinate"
        value={percentage}
        size={size === 'small' ? 16 : 20}
        thickness={4}
        sx={{
          color: percentage === 100 ? 'success.main' : 'warning.main',
        }}
      />
    </Box>
  );
};