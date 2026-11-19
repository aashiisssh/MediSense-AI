
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routes import auth, health

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI application
app = FastAPI(
    title="MediSense AI API",
    version="1.0.0",
    description=(
        "Educational healthcare risk-assessment prototype. "
        "Not for clinical use."
    )
)

# CORS configuration
origins = [
    origin.strip()
    for origin in settings.cors_origins.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Register API routers
app.include_router(auth.router)
app.include_router(health.router)


# Root endpoint
@app.get("/")
def root():
    return {
        "name": "MediSense AI",
        "status": "running",
        "notice": "Educational prototype only; not for clinical use."
    }


# Health check endpoint
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
