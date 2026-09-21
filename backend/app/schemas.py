from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    matric_number: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    faculty: str
    academic_level: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    matric_number: str
    email: EmailStr
    faculty: str
    academic_level: str
    is_admin: bool

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoanApplicationIn(BaseModel):
    gender: str
    age: int = Field(ge=15, le=60)
    marital_status: str
    faculty: str
    academic_level: str
    residence_type: str
    cgpa: float = Field(ge=0, le=5)
    guardian_employment_status: str
    guardian_monthly_income: float = Field(ge=0)
    other_income: float = Field(ge=0)
    loan_amount_requested: float = Field(gt=0)
    loan_term_months: int = Field(ge=6, le=120)
    guarantor_availability: str


class PredictionOut(BaseModel):
    application_id: int
    predicted_status: str
    approval_probability: float
    predicted_at: datetime
    disclaimer: str


class ApplicationHistoryItem(BaseModel):
    application_id: int
    submitted_at: datetime
    faculty: str
    academic_level: str
    cgpa: float
    loan_amount_requested: float
    predicted_status: str | None
    approval_probability: float | None


class ModelMetricsOut(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: list[list[int]]
    feature_importance: list[dict]
    train_size: int
    test_size: int
    n_estimators: int
    disclaimer: str


class FacultiesOut(BaseModel):
    faculties: list[str]
    academic_levels: list[str]
    residence_types: list[str]
    employment_statuses: list[str]
    genders: list[str]
    marital_statuses: list[str]
    guarantor_options: list[str]