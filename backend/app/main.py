from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, abastecimentos, dashboard  # Certifique-se de importar o dashboard
from .db import engine
from . import models

# Cria as tabelas no banco de dados se não existirem
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fuel Control API")

# Configuração de CORS para permitir que o frontend acesse o backend no Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, você pode substituir pelo link do seu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro das rotas
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(abastecimentos.router, prefix="/abastecimentos", tags=["abastecimentos"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"]) # ESTA LINHA É A CURA DO 404

@app.get("/")
def health_check():
    return {"status": "online", "message": "Fuel Control API is running"}
