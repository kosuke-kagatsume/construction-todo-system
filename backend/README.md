# Construction Todo System - Backend

FastAPI backend for the Construction Todo & Forecast System.

## Setup

1. Copy `.env.example` to `.env` and update values
2. Install dependencies: `pip install -r requirements.txt`
3. Run database migrations: `alembic upgrade head`
4. Start the server: `uvicorn app.main:app --reload`

## Docker

```bash
docker-compose up -d
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
pytest
```