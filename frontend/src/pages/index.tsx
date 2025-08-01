import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ConstructionBoardExcel } from '@/components/Board/ConstructionBoardExcel';
import { Typography, Box } from '@mui/material';

export default function HomePage() {
  return (
    <MainLayout>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: '"メイリオ", "Meiryo", sans-serif' }}>
          現場ボード
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
          全プロジェクトの進捗状況を一覧で確認できます
        </Typography>
      </Box>
      <ConstructionBoardExcel />
    </MainLayout>
  );
}