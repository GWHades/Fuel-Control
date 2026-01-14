from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, abastecimentos, dashboard
from .db import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fuel Control API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://fuel-control.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(abastecimentos.router, prefix="/abastecimentos", tags=["abastecimentos"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

@app.get("/")
def read_root():
    return {"status": "ok"}
