from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Construction Todo System",
    version="0.9.0"
)

# CORS設定（一時的に全て許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 一時的に最低限の設定で起動
# from app.core.config import settings
# from app.api.v1.api import api_router
# app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {
        "app": "Construction Todo System",
        "version": "0.9.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/health")
def api_health_check():
    return {"status": "healthy", "api": "v1"}

# Pydanticモデル定義
class LoginRequest(BaseModel):
    username: str
    password: str

# 一時的なログインエンドポイント（モックデータ）
@app.post("/api/v1/auth/login")
def login(credentials: LoginRequest):
    # デモ用の簡単な認証チェック
    email = credentials.username
    password = credentials.password
    
    # デモユーザーデータ
    demo_users = {
        "admin@demo.com": {"password": "admin123", "role": "admin", "name": "システム管理者"},
        "sales@demo.com": {"password": "sales123", "role": "sales", "name": "営業担当者"},
        "design@demo.com": {"password": "design123", "role": "design", "name": "設計担当者"},
        "ic@demo.com": {"password": "ic123", "role": "ic", "name": "IC担当者"},
        "construction@demo.com": {"password": "const123", "role": "construction", "name": "工務担当者"}
    }
    
    if email in demo_users and demo_users[email]["password"] == password:
        user = demo_users[email]
        return {
            "access_token": "demo-token-" + user["role"],
            "token_type": "bearer",
            "user": {
                "id": f"user-{user['role']}",
                "email": email,
                "full_name": user["name"],
                "role_code": user["role"].upper(),
                "is_active": True,
                "is_superuser": user["role"] == "admin"
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# 現在のユーザー情報取得エンドポイント
@app.get("/api/v1/auth/me")
def get_current_user():
    # 一時的に固定ユーザーを返す（本来はJWTトークンから取得）
    return {
        "id": "user-admin",
        "email": "admin@demo.com",
        "full_name": "システム管理者",
        "role_code": "ADMIN",
        "is_active": True,
        "is_superuser": True
    }