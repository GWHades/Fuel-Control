from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from dateutil.relativedelta import relativedelta

from ..db import get_db
from ..models import Abastecimento
from ..auth import get_current_user

router = APIRouter()

# =============================
# RESUMO (já existente)
# =============================

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    hoje = datetime.now()
    inicio_mes = hoje.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_mes = db.query(func.sum(Abastecimento.valor)).filter(
        Abastecimento.user_id == current_user.id,
        Abastecimento.data_hora >= inicio_mes
    ).scalar() or 0

    litros_mes = db.query(func.sum(Abastecimento.litros)).filter(
        Abastecimento.user_id == current_user.id,
        Abastecimento.data_hora >= inicio_mes
    ).scalar() or 0

    return {
        "total_mes": float(total_mes),
        "litros_mes": float(litros_mes)
    }

# =============================
# GRÁFICOS
# =============================

@router.get("/charts")
def get_charts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    hoje = datetime.now()

    # -----------------------------
    # 1️⃣ Gastos últimos 6 meses
    # -----------------------------
    gastos_mensais = []

    for i in range(5, -1, -1):
        inicio = (hoje - relativedelta(months=i)).replace(day=1)
        fim = inicio + relativedelta(months=1)

        total = db.query(func.sum(Abastecimento.valor)).filter(
            Abastecimento.user_id == current_user.id,
            Abastecimento.data_hora >= inicio,
            Abastecimento.data_hora < fim
        ).scalar() or 0

        gastos_mensais.append({
            "mes": inicio.strftime("%m/%Y"),
            "valor": float(total)
        })

    # -----------------------------
    # 2️⃣ Litros últimos 6 meses
    # -----------------------------
    litros_mensais = []

    for i in range(5, -1, -1):
        inicio = (hoje - relativedelta(months=i)).replace(day=1)
        fim = inicio + relativedelta(months=1)

        litros = db.query(func.sum(Abastecimento.litros)).filter(
            Abastecimento.user_id == current_user.id,
            Abastecimento.data_hora >= inicio,
            Abastecimento.data_hora < fim
        ).scalar() or 0

        litros_mensais.append({
            "mes": inicio.strftime("%m/%Y"),
            "litros": float(litros)
        })

    # -----------------------------
    # 3️⃣ Gastos por veículo
    # -----------------------------
    por_veiculo = db.query(
        Abastecimento.veiculo,
        func.sum(Abastecimento.valor)
    ).filter(
        Abastecimento.user_id == current_user.id
    ).group_by(
        Abastecimento.veiculo
    ).all()

    gastos_por_veiculo = [
        {"veiculo": v, "valor": float(total)}
        for v, total in por_veiculo
    ]

    return {
        "gastos_mensais": gastos_mensais,
        "litros_mensais": litros_mensais,
        "gastos_por_veiculo": gastos_por_veiculo
    }
