import React, { Suspense } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Box, Typography, IconButton, Breadcrumbs, Link, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import NextLink from 'next/link';

// 動的インポートで遅延ロード
const ProjectDetailExcel = dynamic(
  () => import('@/components/Project/ProjectDetailExcel').then(mod => ({ default: mod.ProjectDetailExcel })),
  { 
    loading: () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    ),
    ssr: false
  }
);

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <MainLayout>
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs 
          aria-label="breadcrumb" 
          sx={{ 
            mb: 1, 
            fontSize: '12px',
            '& .MuiBreadcrumbs-separator': { fontSize: '12px' },
          }}
        >
          <Link 
            component={NextLink} 
            href="/" 
            color="inherit"
            sx={{ fontSize: '12px', fontFamily: '"メイリオ", "Meiryo", sans-serif' }}
          >
            現場ボード
          </Link>
          <Typography 
            color="text.primary" 
            sx={{ fontSize: '12px', fontFamily: '"メイリオ", "Meiryo", sans-serif' }}
          >
            プロジェクト詳細
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <ProjectDetailExcel projectId={id as string} />
    </MainLayout>
  );
}