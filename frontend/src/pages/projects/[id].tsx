import React from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ProjectDetail } from '@/components/Project/ProjectDetail';
import { Box, Typography, IconButton, Breadcrumbs, Link } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import NextLink from 'next/link';

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={NextLink} href="/" color="inherit">
            現場ボード
          </Link>
          <Typography color="text.primary">プロジェクト詳細</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            田中邸 {/* 実際はAPIから取得 */}
          </Typography>
        </Box>
      </Box>
      
      <ProjectDetail projectId={id as string} />
    </MainLayout>
  );
}