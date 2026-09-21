from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .auth import (
    create_access_token,
    get_current_user,
    hash_password,
    require_admin,
    verify_password,
)
from .database import Base, engine, get_db
from .ml.predict import (
    artifacts_ready,
    clear_artifact_cache,
    get_form_options,
    load_metrics,
    predict_application,
)
from .ml.train import train_and_save
from .models import Application, Prediction, User
from .schemas import (
    ApplicationHistoryItem,
    FacultiesOut,
    LoanApplicationIn,
    ModelMetricsOut,
    PredictionOut,
    TokenOut,
    UserLogin,
    UserOut,
    UserRegister,
)

DISCLAIMER = (
    "This prediction is not an official NELFUND or University of Ibadan loan decision."
)


def ensure_admin(db: Session) -> None:
    admin = db.query(User).filter(User.email == "admin@ui.edu.ng").first()
    if admin:
        return
    admin = User(
        full_name="System Administrator",
        matric_number="ADMIN/0000",
        email="admin@ui.edu.ng",
        password_hash=hash_password("admin123"),
        faculty="Administration",
        academic_level="N/A",
        is_admin=1,
    )
    db.add(admin)
    db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    if not artifacts_ready():
        train_and_save()
        clear_artifact_cache()
    db = next(get_db())
    try:
        ensure_admin(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="UI Student Loan Approval Prediction",
    description="API for University of Ibadan student loan approval prediction (Group 6).",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def user_to_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        full_name=user.full_name,
        matric_number=user.matric_number,
        email=user.email,
        faculty=user.faculty,
        academic_level=user.academic_level,
        is_admin=bool(user.is_admin),
    )


@app.get("/api/health")
def health():
    return {"status": "ok", "model_ready": artifacts_ready()}


@app.get("/api/meta/options", response_model=FacultiesOut)
def form_options():
    opts = get_form_options()
    return FacultiesOut(**opts)


@app.post("/api/auth/register", response_model=TokenOut)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.matric_number == payload.matric_number).first():
        raise HTTPException(status_code=400, detail="Matric number already registered")

    user = User(
        full_name=payload.full_name,
        matric_number=payload.matric_number,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        faculty=payload.faculty,
        academic_level=payload.academic_level,
        is_admin=0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=user_to_out(user))


@app.post("/api/auth/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=user_to_out(user))


@app.get("/api/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user_to_out(user)


@app.post("/api/applications/predict", response_model=PredictionOut)
def submit_and_predict(
    payload: LoanApplicationIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    form = payload.model_dump()
    try:
        result = predict_application(form)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    application = Application(user_id=user.id, **form)
    db.add(application)
    db.flush()

    prediction = Prediction(
        application_id=application.id,
        predicted_status=result["predicted_status"],
        approval_probability=result["approval_probability"],
        notes=DISCLAIMER,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return PredictionOut(
        application_id=application.id,
        predicted_status=prediction.predicted_status,
        approval_probability=prediction.approval_probability,
        predicted_at=prediction.predicted_at,
        disclaimer=DISCLAIMER,
    )


@app.get("/api/applications/history", response_model=list[ApplicationHistoryItem])
def application_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Application)
        .filter(Application.user_id == user.id)
        .order_by(Application.submitted_at.desc())
        .all()
    )
    items: list[ApplicationHistoryItem] = []
    for app_row in rows:
        pred = app_row.prediction
        items.append(
            ApplicationHistoryItem(
                application_id=app_row.id,
                submitted_at=app_row.submitted_at,
                faculty=app_row.faculty,
                academic_level=app_row.academic_level,
                cgpa=app_row.cgpa,
                loan_amount_requested=app_row.loan_amount_requested,
                predicted_status=pred.predicted_status if pred else None,
                approval_probability=pred.approval_probability if pred else None,
            )
        )
    return items


@app.get("/api/admin/metrics", response_model=ModelMetricsOut)
def admin_metrics(_: User = Depends(require_admin)):
    try:
        metrics = load_metrics()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return ModelMetricsOut(**metrics)


@app.post("/api/admin/retrain", response_model=ModelMetricsOut)
def admin_retrain(_: User = Depends(require_admin)):
    metrics = train_and_save()
    clear_artifact_cache()
    return ModelMetricsOut(**metrics)


@app.get("/api/admin/summary")
def admin_summary(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).filter(User.is_admin == 0).count()
    total_apps = db.query(Application).count()
    approved = (
        db.query(Prediction).filter(Prediction.predicted_status == "Approved").count()
    )
    rejected = (
        db.query(Prediction).filter(Prediction.predicted_status == "Rejected").count()
    )
    return {
        "students": total_users,
        "applications": total_apps,
        "predicted_approved": approved,
        "predicted_rejected": rejected,
    }