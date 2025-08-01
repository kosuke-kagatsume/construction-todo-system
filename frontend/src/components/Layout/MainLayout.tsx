import React from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { Dashboard, Assignment, People, Settings, Menu as MenuIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';

const drawerWidth = 200;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: '現場ボード', icon: <Dashboard />, path: '/' },
    { text: 'マイタスク', icon: <Assignment />, path: '/my-tasks' },
    { text: 'プロジェクト', icon: <People />, path: '/projects' },
    { text: '設定', icon: <Settings />, path: '/settings' },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ backgroundColor: '#217346', color: 'white' }}>
        <Typography 
          variant="body1" 
          noWrap 
          component="div"
          sx={{ fontFamily: '"メイリオ", "Meiryo", sans-serif', fontWeight: 'bold' }}
        >
          建築TODO管理
        </Typography>
      </Toolbar>
      <List sx={{ backgroundColor: '#f5f5f5', height: '100%' }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={router.pathname === item.path}
              onClick={() => router.push(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#e3f2e3',
                  borderLeft: '3px solid #217346',
                },
                '&:hover': {
                  backgroundColor: '#e8e8e8',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#217346' }}>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontFamily: '"メイリオ", "Meiryo", sans-serif',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#ffffff',
          color: '#000000',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <Toolbar sx={{ minHeight: '48px !important' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="body1" 
            noWrap 
            component="div"
            sx={{ fontFamily: '"メイリオ", "Meiryo", sans-serif' }}
          >
            Construction Todo System - 建築工事管理システム
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 6,
          backgroundColor: '#fafafa',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};