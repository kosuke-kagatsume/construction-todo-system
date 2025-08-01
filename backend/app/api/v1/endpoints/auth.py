from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.db.session import AsyncSessionLocal

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    # TODO: Implement actual authentication logic
    return {"access_token": "fake-token", "token_type": "bearer"}


@router.post("/logout")
async def logout():
    # TODO: Implement logout logic
    return {"message": "Logged out successfully"}


@router.post("/refresh")
async def refresh_token():
    # TODO: Implement token refresh logic
    return {"access_token": "new-fake-token", "token_type": "bearer"}