from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, abastecimentos, dashboard  # Certifique-se de importar o dashboard aqui
from .db import engine
from . import models

# Cria as tabelas se não existirem
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fuel Control API")

# CORREÇÃO DE CORS: Permite que o frontend na Vercel acesse o Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fuel-control.vercel.app",
        "http://localhost:5173"  # Para desenvolvimento local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro das rotas (O dashboard deve estar aqui para evitar o 404)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(abastecimentos.router, prefix="/abastecimentos", tags=["abastecimentos"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

@app.get("/")
def health_check():
    return {"status": "online", "message": "Fuel Control API is running"}
