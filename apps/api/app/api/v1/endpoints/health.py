from fastapi import APIRouter

router = APIRouter()

@router.get("/health", response_model=dict, status_code=200)
async def health_check() -> dict:
    return {
        "status": "healthy",
        "service": "omnivote-api"
    }
