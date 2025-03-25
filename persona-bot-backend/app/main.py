from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.chat import router as chat_router

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change for security)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Chat Router
app.include_router(chat_router, prefix="/api")

# Root Route (Fixing "Not Found" error)
@app.get("/")
def root():
    return {"message": "Welcome to PersonaBot API"}

# Health Check
@app.get("/health")
def health_check():
    return {"status": "healthy"}
