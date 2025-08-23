import type { NextApiRequest, NextApiResponse } from 'next';

// デモユーザーのデータ
const demoUsers = [
  {
    email: 'admin@demo.com',
    password: 'admin123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@demo.com',
      full_name: 'システム管理者',
      role_code: 'SALES',
      is_active: true,
      is_superuser: true,
    }
  },
  {
    email: 'sales@demo.com',
    password: 'sales123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'sales@demo.com',
      full_name: '営業太郎',
      role_code: 'SALES',
      is_active: true,
      is_superuser: false,
    }
  },
  {
    email: 'design@demo.com',
    password: 'design123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'design@demo.com',
      full_name: '設計花子',
      role_code: 'DESIGN',
      is_active: true,
      is_superuser: false,
    }
  },
  {
    email: 'ic@demo.com',
    password: 'ic123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'ic@demo.com',
      full_name: 'IC次郎',
      role_code: 'IC',
      is_active: true,
      is_superuser: false,
    }
  },
  {
    email: 'construction@demo.com',
    password: 'const123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440004',
      email: 'construction@demo.com',
      full_name: '工務三郎',
      role_code: 'CONSTRUCTION',
      is_active: true,
      is_superuser: false,
    }
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Login API called:', { 
    method: req.method, 
    body: req.body,
    headers: req.headers,
    url: req.url 
  });
  
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { username, password } = req.body;
  console.log('Login attempt for:', { username, passwordLength: password?.length });

  // デモユーザーの認証
  const user = demoUsers.find(u => u.email === username && u.password === password);

  if (!user) {
    console.log('User not found or invalid credentials');
    return res.status(401).json({ detail: 'Incorrect username or password' });
  }

  console.log('User authenticated:', user.user.email);

  // モックトークンを生成（実際のJWTではない）
  const mockToken = Buffer.from(JSON.stringify(user.user)).toString('base64');

  console.log('Returning tokens');
  res.status(200).json({
    access_token: mockToken,
    refresh_token: mockToken + '_refresh',
    token_type: 'bearer',
  });
}