from datetime import datetime

from sqlalchemy import String, DateTime, Integer, Numeric, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    abastecimentos = relationship("Abastecimento", back_populates="user", cascade="all, delete-orphan")

class Abastecimento(Base):
    __tablename__ = "abastecimentos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    data_hora: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    posto: Mapped[str] = mapped_column(String(16), nullable=False)  # IPIRANGA | OUTRO
    valor: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    litros: Mapped[float] = mapped_column(Numeric(12, 3), nullable=False)
    km_odometro: Mapped[int] = mapped_column(Integer, nullable=False)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="abastecimentos")
