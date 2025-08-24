import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ja from 'date-fns/locale/ja';
import { theme } from '@/styles/theme';
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { startNotificationPolling, initializeNotificationSound } from '@/utils/notificationHelpers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 認証が不要なページ
const publicPages = ['/login'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublicPage = publicPages.includes(router.pathname);

  // 通知システムの初期化
  useEffect(() => {
    if (!isPublicPage) {
      initializeNotificationSound();
      const cleanup = startNotificationPolling(60000); // 1分間隔
      return cleanup;
    }
  }, [isPublicPage]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {/* <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}> */}
          <CssBaseline />
          {isPublicPage ? (
            <Component {...pageProps} />
          ) : (
            <ProtectedRoute>
              <Component {...pageProps} />
            </ProtectedRoute>
          )}
        {/* </LocalizationProvider> */}
      </ThemeProvider>
    </QueryClientProvider>
  );
}