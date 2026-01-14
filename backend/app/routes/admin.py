from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import User
from ..auth import get_current_user, get_password_hash

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/create")
def create_admin(
    nome: str,
    email: str,
    password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Acesso negado")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    admin = User(
        nome=nome,
        email=email,
        password=get_password_hash(password),
        is_admin=True
    )

    db.add(admin)
    db.commit()
    return {"message": "Admin criado com sucesso"}
