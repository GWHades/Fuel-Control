from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .db import engine, SessionLocal
from .models import Base, User
from .settings import settings
from .auth import hash_password

from .routes.auth import router as auth_router
from .routes.abastecimentos import router as abastecimentos_router
from .routes.dashboard import router as dashboard_router

app = FastAPI(title="Fuel Control API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.username == settings.ADMIN_USER).first()
        if not user:
            user = User(username=settings.ADMIN_USER, password_hash=hash_password(settings.ADMIN_PASS))
            db.add(user)
            db.commit()
    finally:
        db.close()

app.include_router(auth_router)
app.include_router(abastecimentos_router)
app.include_router(dashboard_router)

@app.get("/health")
def health():
    return {"status": "ok"}
