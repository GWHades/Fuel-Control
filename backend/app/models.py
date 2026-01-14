from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Numeric,
    Text,
    ForeignKey,
    func
)
from sqlalchemy.orm import relationship

from .db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)

    is_admin = Column(Boolean, nullable=False, server_default="false")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    abastecimentos = relationship(
        "Abastecimento",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Abastecimento(Base):
    __tablename__ = "abastecimentos"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )

    data_hora = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    posto = Column(String(50), nullable=False)

    valor = Column(Numeric(12, 2), nullable=False)
    litros = Column(Numeric(12, 3), nullable=False)

    km_odometro = Column(Integer, nullable=False)

    observacao = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    user = relationship("User", back_populates="abastecimentos")
