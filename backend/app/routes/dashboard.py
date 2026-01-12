from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from ..db import get_db
from ..models import Abastecimento
from ..auth import get_current_user

router = APIRouter()

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    hoje = datetime.now()
    inicio_mes = hoje.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Soma total do mês via SQL (Muito rápido)
    total_mes = db.query(func.sum(Abastecimento.valor)).filter(
        Abastecimento.usuario_id == current_user.id,
        Abastecimento.data_hora >= inicio_mes
    ).scalar() or 0.0

    # Soma de litros do mês via SQL
    litros_mes = db.query(func.sum(Abastecimento.litros)).filter(
        Abastecimento.usuario_id == current_user.id,
        Abastecimento.data_hora >= inicio_mes
    ).scalar() or 0.0

    # Cálculo da quinzena atual
    dia_corte = 16 if hoje.day >= 16 else 1
    inicio_quinzena = hoje.replace(day=dia_corte, hour=0, minute=0, second=0)
    
    total_quinzena = db.query(func.sum(Abastecimento.valor)).filter(
        Abastecimento.usuario_id == current_user.id,
        Abastecimento.data_hora >= inicio_quinzena
    ).scalar() or 0.0

    # Retorna apenas os últimos 10 registros para o Dashboard (Evita lentidão no carregamento)
    ultimos_registros = db.query(Abastecimento).filter(
        Abastecimento.usuario_id == current_user.id
    ).order_by(Abastecimento.data_hora.desc()).limit(10).all()

    return {
        "total_mes": float(total_mes),
        "total_quinzena": float(total_quinzena),
        "litros_mes": float(litros_mes),
        "recent_entries": [
            {
                "id": a.id,
                "data_hora": a.data_hora.isoformat(),
                "valor": float(a.valor),
                "veiculo": a.veiculo
            } for a in ultimos_registros
        ]
    }
