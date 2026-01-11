from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from ..db import get_db
from ..models import Abastecimento
from ..auth import get_current_user

router = APIRouter()

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Definir períodos para otimizar a busca (últimos 90 dias para o gráfico, por exemplo)
    hoje = datetime.now()
    inicio_mes = hoje.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Agregação direta no Banco de Dados (Muito mais rápido que loop em Python)
    total_mes = db.query(func.sum(Abastecimento.valor)).filter(
        Abastecimento.usuario_id == current_user.id,
        Abastecimento.data_hora >= inicio_mes
    ).scalar() or 0.0

    litros_mes = db.query(func.sum(Abastecimento.litros)).filter(
        Abastecimento.usuario_id == current_user.id,
        Abastecimento.data_hora >= inicio_mes
    ).scalar() or 0.0

    # Cálculo da quinzena (1-15 ou 16-fim)
    dia_corte = 16 if hoje.day >= 16 else 1
    inicio_quinzena = hoje.replace(day=dia_corte, hour=0, minute=0, second=0)
    
    total_quinzena = db.query(func.sum(Abastecimento.valor)).filter(
        Abastecimento.usuario_id == current_user.id,
        Abastecimento.data_hora >= inicio_quinzena
    ).scalar() or 0.0

    # Busca apenas os últimos 20 registros para a tabela (paginação implícita)
    ultimos_registros = db.query(Abastecimento).filter(
        Abastecimento.usuario_id == current_user.id
    ).order_by(Abastecimento.data_hora.desc()).limit(20).all()

    return {
        "total_mes": float(total_mes),
        "total_quinzena": float(total_quinzena),
        "litros_mes": float(litros_mes),
        "recent_entries": [
            {
                "id": a.id,
                "data_hora": a.data_hora,
                "valor": float(a.valor),
                "litros": float(a.litros),
                "veiculo": a.veiculo
            } for a in ultimos_registros
        ]
    }
