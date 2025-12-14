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


def _get_prev_next_km(db: Session, user_id: int, data_hora, current_id: int | None = None):
    """
    Retorna o km do lançamento anterior e do próximo (na ordem por data_hora).
    Usado para validar atualizações sem "quebrar" a sequência.
    """
    q_prev = db.query(models.Abastecimento).filter(
        models.Abastecimento.user_id == user_id,
        models.Abastecimento.data_hora < data_hora,
    )
    if current_id is not None:
        q_prev = q_prev.filter(models.Abastecimento.id != current_id)
    prev_row = q_prev.order_by(desc(models.Abastecimento.data_hora)).first()

    q_next = db.query(models.Abastecimento).filter(
        models.Abastecimento.user_id == user_id,
        models.Abastecimento.data_hora > data_hora,
    )
    if current_id is not None:
        q_next = q_next.filter(models.Abastecimento.id != current_id)
    next_row = q_next.order_by(asc(models.Abastecimento.data_hora)).first()

    prev_km = prev_row.km_odometro if prev_row else None
    next_km = next_row.km_odometro if next_row else None
    return prev_km, next_km


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
    return sorted(decorated, key=lambda x: x.data_hora, reverse=(order == "desc"))


@router.post("", response_model=AbastecimentoOut, status_code=201)
def create_abastecimento(
    payload: AbastecimentoCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    # ✅ Validação: km não pode ser menor que o último km do usuário
    last = (
        db.query(models.Abastecimento)
        .filter(models.Abastecimento.user_id == user.id)
        .order_by(desc(models.Abastecimento.data_hora))
        .first()
    )
    if last and int(payload.km_odometro) < int(last.km_odometro):
        raise HTTPException(
            status_code=400,
            detail=f"KM inválido: o último registrado foi {last.km_odometro}.",
        )

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
    row = (
        db.query(models.Abastecimento)
        .filter(models.Abastecimento.user_id == user.id, models.Abastecimento.id == abastecimento_id)
        .first()
    )
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
    row = (
        db.query(models.Abastecimento)
        .filter(models.Abastecimento.user_id == user.id, models.Abastecimento.id == abastecimento_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    data = payload.model_dump(exclude_unset=True)

    # ✅ Validação de consistência do KM (evita “km regressivo” com vizinhos)
    # Regras:
    # - Se atualizar km_odometro, ele não pode ficar menor que o km do registro anterior (por data)
    # - E não pode ficar maior que o km do registro seguinte (por data), se existir
    if "km_odometro" in data:
        new_km = int(data["km_odometro"])

        # se o usuário também mudou data_hora, validar contra a nova posição na timeline
        new_data_hora = data.get("data_hora", row.data_hora)
        prev_km, next_km = _get_prev_next_km(db, user.id, new_data_hora, current_id=row.id)

        if prev_km is not None and new_km < int(prev_km):
            raise HTTPException(
                status_code=400,
                detail=f"KM inválido: menor que o anterior ({prev_km}).",
            )
        if next_km is not None and new_km > int(next_km):
            raise HTTPException(
                status_code=400,
                detail=f"KM inválido: maior que o próximo ({next_km}).",
            )

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
    row = (
        db.query(models.Abastecimento)
        .filter(models.Abastecimento.user_id == user.id, models.Abastecimento.id == abastecimento_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(row)
    db.commit()
    return None
