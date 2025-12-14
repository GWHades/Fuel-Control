from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from ..db import get_db
from ..auth import get_current_user
from .. import models
from ..schemas import AbastecimentoCreate, AbastecimentoOut, AbastecimentoUpdate

router = APIRouter(prefix="/abastecimentos", tags=["abastecimentos"])

def _decorate(rows: list[models.Abastecimento]) -> list[AbastecimentoOut]:
    out: list[AbastecimentoOut] = []
    prev_km = None
    for r in rows:
        item = AbastecimentoOut.model_validate(r)
        item.preco_por_litro = float(r.valor) / float(r.litros) if float(r.litros) else None
        if prev_km is not None:
            km_rodado = int(r.km_odometro) - int(prev_km)
            item.km_rodado = km_rodado if km_rodado >= 0 else None
            if item.km_rodado and item.km_rodado > 0:
                item.km_por_litro_aprox = float(item.km_rodado) / float(r.litros)
                item.custo_por_km = float(r.valor) / float(item.km_rodado)
        prev_km = r.km_odometro
        out.append(item)
    return out

@router.get("", response_model=List[AbastecimentoOut])
def list_abastecimentos(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    order: str = Query("desc", pattern="^(asc|desc)$"),
):
    q = db.query(models.Abastecimento).filter(models.Abastecimento.user_id == user.id)
    q = q.order_by(desc(models.Abastecimento.data_hora) if order == "desc" else asc(models.Abastecimento.data_hora))
    rows = q.offset(offset).limit(limit).all()
    rows_asc = sorted(rows, key=lambda x: x.data_hora)
    decorated = _decorate(rows_asc)
    return sorted(decorated, key=lambda x: x.data_hora, reverse=(order=="desc"))

@router.post("", response_model=AbastecimentoOut, status_code=201)
def create_abastecimento(
    payload: AbastecimentoCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    row = models.Abastecimento(
        user_id=user.id,
        data_hora=payload.data_hora,
        posto=payload.posto,
        valor=payload.valor,
        litros=payload.litros,
        km_odometro=payload.km_odometro,
        observacao=payload.observacao,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return AbastecimentoOut.model_validate(row)

@router.get("/{abastecimento_id}", response_model=AbastecimentoOut)
def get_abastecimento(
    abastecimento_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    row = db.query(models.Abastecimento).filter(models.Abastecimento.user_id == user.id, models.Abastecimento.id == abastecimento_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return AbastecimentoOut.model_validate(row)

@router.put("/{abastecimento_id}", response_model=AbastecimentoOut)
def update_abastecimento(
    abastecimento_id: int,
    payload: AbastecimentoUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    row = db.query(models.Abastecimento).filter(models.Abastecimento.user_id == user.id, models.Abastecimento.id == abastecimento_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return AbastecimentoOut.model_validate(row)

@router.delete("/{abastecimento_id}", status_code=204)
def delete_abastecimento(
    abastecimento_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    row = db.query(models.Abastecimento).filter(models.Abastecimento.user_id == user.id, models.Abastecimento.id == abastecimento_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(row)
    db.commit()
    return None
