from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    matric_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    faculty: Mapped[str] = mapped_column(String(100), nullable=False)
    academic_level: Mapped[str] = mapped_column(String(10), nullable=False)
    is_admin: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    applications: Mapped[list["Application"]] = relationship(back_populates="user")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    gender: Mapped[str] = mapped_column(String(20))
    age: Mapped[int] = mapped_column(Integer)
    marital_status: Mapped[str] = mapped_column(String(20))
    faculty: Mapped[str] = mapped_column(String(100))
    academic_level: Mapped[str] = mapped_column(String(10))
    residence_type: Mapped[str] = mapped_column(String(50))
    cgpa: Mapped[float] = mapped_column(Float)
    guardian_employment_status: Mapped[str] = mapped_column(String(50))
    guardian_monthly_income: Mapped[float] = mapped_column(Float)
    other_income: Mapped[float] = mapped_column(Float)
    loan_amount_requested: Mapped[float] = mapped_column(Float)
    loan_term_months: Mapped[int] = mapped_column(Integer)
    guarantor_availability: Mapped[str] = mapped_column(String(10))
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="applications")
    prediction: Mapped["Prediction | None"] = relationship(
        back_populates="application", uselist=False
    )


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id"), unique=True, nullable=False
    )
    predicted_status: Mapped[str] = mapped_column(String(20))
    approval_probability: Mapped[float] = mapped_column(Float)
    predicted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    application: Mapped["Application"] = relationship(back_populates="prediction")