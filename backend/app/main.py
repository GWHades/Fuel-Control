from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, abastecimentos, dashboard
from .db import engine, Base

# Cria as tabelas no banco de dados se não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fuel Control API")

# CORREÇÃO DE ACESSO: Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, substitua pelo URL do seu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão das rotas
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(abastecimentos.router, prefix="/abastecimentos", tags=["abastecimentos"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

@app.get("/")
def read_root():
    return {"status": "ok"}
