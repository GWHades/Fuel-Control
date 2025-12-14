from datetime import datetime, timezone
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import get_current_user
from .. import models
from ..schemas import DashboardSummary
from ..settings import settings
from ..utils import quinzena_range

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    inicio, fim, label = quinzena_range(now)

    rows = (
        db.query(models.Abastecimento)
        .filter(
            models.Abastecimento.user_id == user.id,
            models.Abastecimento.data_hora >= inicio,
            models.Abastecimento.data_hora <= fim,
        )
        .order_by(models.Abastecimento.data_hora.asc())
        .all()
    )

    gasto_ipiranga = sum(float(r.valor) for r in rows if r.posto == "IPIRANGA")
    total_gasto = sum(float(r.valor) for r in rows)
    total_litros = sum(float(r.litros) for r in rows)
    media_preco = (total_gasto / total_litros) if total_litros > 0 else None

    limite = float(settings.IPIRANGA_LIMIT_PER_QUINZENA)
    saldo = limite - gasto_ipiranga
    perc = (gasto_ipiranga / limite * 100.0) if limite > 0 else 0.0

    gasto_por_dia = defaultdict(float)
    labels = []
    gastos = []
    preco_litro = []
    km_l = []

    prev_km = None
    for r in rows:
        dkey = r.data_hora.astimezone(timezone.utc).strftime("%Y-%m-%d")
        gasto_por_dia[dkey] += float(r.valor)

        pl = float(r.valor) / float(r.litros) if float(r.litros) else 0.0
        preco_litro.append(pl)

        if prev_km is None:
            km_l.append(0.0)
        else:
            km_rodado = int(r.km_odometro) - int(prev_km)
            km_l.append((km_rodado / float(r.litros)) if km_rodado > 0 and float(r.litros) else 0.0)
        prev_km = r.km_odometro

    for day in sorted(gasto_por_dia.keys()):
        labels.append(day)
        gastos.append(round(gasto_por_dia[day], 2))

    return DashboardSummary(
        quinzena_label=label,
        inicio=inicio,
        fim=fim,
        ipiranga_limite=limite,
        gasto_ipiranga_quinzena=round(gasto_ipiranga, 2),
        saldo_ipiranga_quinzena=round(saldo, 2),
        percentual_usado=round(perc, 2),
        total_gasto_quinzena=round(total_gasto, 2),
        total_litros_quinzena=round(total_litros, 3),
        media_preco_litro_quinzena=(round(media_preco, 3) if media_preco is not None else None),
        labels=labels,
        gastos_por_dia=gastos,
        preco_litro_por_lancamento=[round(x, 3) for x in preco_litro],
        km_por_litro_por_lancamento=[round(x, 3) for x in km_l],
    )
