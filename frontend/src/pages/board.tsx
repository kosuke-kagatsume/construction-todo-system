import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ConstructionBoardEnhancedOptimized } from '@/components/Board/ConstructionBoardEnhancedOptimized';

export default function BoardPage() {
  return (
    <MainLayout>
      <ConstructionBoardEnhancedOptimized />
    </MainLayout>
  );
}