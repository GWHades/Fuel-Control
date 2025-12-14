from datetime import datetime
from pydantic import BaseModel, Field

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    username: str
    password: str

class AbastecimentoBase(BaseModel):
    data_hora: datetime | None = None
    posto: str = Field(..., pattern="^(IPIRANGA|OUTRO)$")
    valor: float = Field(..., gt=0)
    litros: float = Field(..., gt=0)
    km_odometro: int = Field(..., ge=0)
    observacao: str | None = None

class AbastecimentoCreate(AbastecimentoBase):
    pass

class AbastecimentoUpdate(BaseModel):
    data_hora: datetime | None = None
    posto: str | None = Field(default=None, pattern="^(IPIRANGA|OUTRO)$")
    valor: float | None = Field(default=None, gt=0)
    litros: float | None = Field(default=None, gt=0)
    km_odometro: int | None = Field(default=None, ge=0)
    observacao: str | None = None

class AbastecimentoOut(BaseModel):
    id: int
    data_hora: datetime
    posto: str
    valor: float
    litros: float
    km_odometro: int
    observacao: str | None

    preco_por_litro: float | None = None
    km_rodado: int | None = None
    km_por_litro_aprox: float | None = None
    custo_por_km: float | None = None

    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    quinzena_label: str
    inicio: datetime
    fim: datetime
    ipiranga_limite: float
    gasto_ipiranga_quinzena: float
    saldo_ipiranga_quinzena: float
    percentual_usado: float

    total_gasto_quinzena: float
    total_litros_quinzena: float
    media_preco_litro_quinzena: float | None

    labels: list[str]
    gastos_por_dia: list[float]
    preco_litro_por_lancamento: list[float]
    km_por_litro_por_lancamento: list[float]
