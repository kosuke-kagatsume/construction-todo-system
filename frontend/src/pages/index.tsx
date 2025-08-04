import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Box, CircularProgress } from '@mui/material';

// 動的インポートで遅延ロード
const ConstructionBoardEnhancedOptimized = dynamic(
  () => import('@/components/Board/ConstructionBoardEnhancedOptimized').then(mod => ({ default: mod.ConstructionBoardEnhancedOptimized })),
  { 
    loading: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    ),
    ssr: true
  }
);

export default function HomePage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      }>
        <ConstructionBoardEnhancedOptimized />
      </Suspense>
    </MainLayout>
  );
}