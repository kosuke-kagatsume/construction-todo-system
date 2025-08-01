import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ConstructionBoard } from '@/components/Board/ConstructionBoard';
import { Typography, Box } from '@mui/material';

export default function HomePage() {
  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          現場ボード
        </Typography>
        <Typography variant="body1" color="text.secondary">
          全プロジェクトの進捗状況を一覧で確認できます
        </Typography>
      </Box>
      <ConstructionBoard />
    </MainLayout>
  );
}