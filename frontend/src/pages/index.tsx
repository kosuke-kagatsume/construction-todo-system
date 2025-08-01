import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ConstructionBoardExcel } from '@/components/Board/ConstructionBoardExcel';
import { Typography, Box } from '@mui/material';

export default function HomePage() {
  return (
    <MainLayout>
      <Box className="fade-in">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            現場ボード
          </Typography>
          <Typography variant="body1" color="text.secondary">
            全プロジェクトの進捗状況を一覧で確認できます
          </Typography>
        </Box>
        <ConstructionBoardExcel />
      </Box>
    </MainLayout>
  );
}