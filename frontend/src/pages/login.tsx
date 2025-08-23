import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log('Login attempt:', { email: data.email, apiBaseURL: api.defaults.baseURL });
      
      // 認証リクエスト
      const response = await api.post('/auth/login', {
        username: data.email,
        password: data.password,
      });

      console.log('Login response:', response.data);

      // トークンを保存
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);

      // ホームページ（現場ボード）へリダイレクト
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dodo-logo.png"
              alt="Construction Todo System"
              style={{ height: 60, marginBottom: 16 }}
            />
            <Typography component="h1" variant="h5">
              ログイン
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              autoComplete="email"
              autoFocus
              {...register('email', {
                required: 'メールアドレスを入力してください',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '有効なメールアドレスを入力してください',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="パスワード"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register('password', {
                required: 'パスワードを入力してください',
                minLength: {
                  value: 6,
                  message: 'パスワードは6文字以上である必要があります',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'ログイン'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              デモアカウント
            </Typography>
            <Typography variant="caption" color="text.secondary">
              管理者: admin@demo.com / admin123<br />
              営業: sales@demo.com / sales123<br />
              設計: design@demo.com / design123<br />
              IC: ic@demo.com / ic123<br />
              工務: construction@demo.com / const123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}