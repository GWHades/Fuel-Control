from sqlalchemy.orm import Session
from .db import SessionLocal
from .models import User
from .auth import get_password_hash

ADMIN_EMAIL = "admin@fuelcontrol.com"
ADMIN_PASSWORD = "admin123"
ADMIN_NOME = "Administrador"

def create_admin():
    db: Session = SessionLocal()

    admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if admin:
        print("Admin já existe")
        return

    admin = User(
        nome=ADMIN_NOME,
        email=ADMIN_EMAIL,
        password=get_password_hash(ADMIN_PASSWORD),
        is_admin=True
    )

    db.add(admin)
    db.commit()
    db.close()
    print("Admin criado com sucesso")
