from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="OmniVote API",
    description="One System. Every Vote. Powered by VeroSeven",
    version="1.0.0",
)

# CORS configurations matching Design System constraints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to *.omnivote.com in staging/production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", status_code=200)
async def health_check():
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "message": "OmniVote API is running."
        }
    }
