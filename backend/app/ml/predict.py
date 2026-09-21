"""Runtime prediction — mirrors training preprocessing (report Section 4.7)."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from .train import (
    ARTIFACTS_DIR,
    CATEGORIES_PATH,
    COLUMNS_PATH,
    METRICS_PATH,
    MODEL_PATH,
)

CATEGORICAL_COLS = [
    "Gender",
    "Marital_Status",
    "Faculty",
    "Academic_Level",
    "Residence_Type",
    "Guardian_Employment_Status",
    "Guarantor_Availability",
]


@lru_cache(maxsize=1)
def _load_artifacts():
    if not MODEL_PATH.exists() or not COLUMNS_PATH.exists():
        raise FileNotFoundError(
            "Model artifacts missing. Run: python -m app.ml.train from the backend folder."
        )
    model = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(COLUMNS_PATH)
    categories = {}
    if CATEGORIES_PATH.exists():
        categories = json.loads(CATEGORIES_PATH.read_text(encoding="utf-8"))
    return model, feature_columns, categories


def load_metrics() -> dict:
    if not METRICS_PATH.exists():
        raise FileNotFoundError("model_metrics.json not found. Train the model first.")
    return json.loads(METRICS_PATH.read_text(encoding="utf-8"))


def form_to_raw_row(form: dict[str, Any]) -> dict[str, Any]:
    return {
        "Gender": form["gender"],
        "Age": form["age"],
        "Marital_Status": form["marital_status"],
        "Faculty": form["faculty"],
        "Academic_Level": str(form["academic_level"]),
        "Residence_Type": form["residence_type"],
        "CGPA": form["cgpa"],
        "Guardian_Employment_Status": form["guardian_employment_status"],
        "Guardian_Monthly_Income": form["guardian_monthly_income"],
        "Other_Income": form["other_income"],
        "Loan_Amount_Requested": form["loan_amount_requested"],
        "Loan_Term_Months": form["loan_term_months"],
        "Guarantor_Availability": form["guarantor_availability"],
    }


def build_feature_vector(form: dict[str, Any]) -> pd.DataFrame:
    _, feature_columns, _ = _load_artifacts()
    row = form_to_raw_row(form)
    total_income = float(row["Guardian_Monthly_Income"]) + float(row["Other_Income"])
    ratio = float(row["Loan_Amount_Requested"]) / total_income if total_income else 0.0

    frame = pd.DataFrame(
        [
            {
                **row,
                "Total_Income": total_income,
                "Loan_To_Income_Ratio": ratio,
            }
        ]
    )
    # Ensure Academic_Level is string for consistent dummies
    frame["Academic_Level"] = frame["Academic_Level"].astype(str)
    encoded = pd.get_dummies(frame, columns=CATEGORICAL_COLS, drop_first=True)
    return encoded.reindex(columns=feature_columns, fill_value=0)


def predict_application(form: dict[str, Any]) -> dict[str, Any]:
    model, _, _ = _load_artifacts()
    vector = build_feature_vector(form)
    predicted_class = int(model.predict(vector)[0])
    approval_probability = float(model.predict_proba(vector)[0][1])
    return {
        "predicted_status": "Approved" if predicted_class == 1 else "Rejected",
        "approval_probability": round(approval_probability, 3),
    }


def get_form_options() -> dict[str, list[str]]:
    if CATEGORIES_PATH.exists():
        cats = json.loads(CATEGORIES_PATH.read_text(encoding="utf-8"))
        return {
            "faculties": cats.get("Faculty", []),
            "academic_levels": cats.get("Academic_Level", ["100", "200", "300", "400", "500"]),
            "residence_types": cats.get("Residence_Type", ["School Hostel", "Off Campus"]),
            "employment_statuses": cats.get(
                "Guardian_Employment_Status", ["Employed", "Self-Employed", "Unemployed"]
            ),
            "genders": cats.get("Gender", ["Male", "Female"]),
            "marital_statuses": cats.get("Marital_Status", ["Single", "Married"]),
            "guarantor_options": cats.get("Guarantor_Availability", ["Yes", "No"]),
        }
    return {
        "faculties": [
            "Agriculture and Forestry",
            "Arts",
            "Basic Medical Sciences",
            "Clinical Sciences",
            "Education",
            "Law",
            "Pharmacy",
            "Science",
            "Social Sciences",
            "Technology",
        ],
        "academic_levels": ["100", "200", "300", "400", "500"],
        "residence_types": ["School Hostel", "Off Campus"],
        "employment_statuses": ["Employed", "Self-Employed", "Unemployed"],
        "genders": ["Male", "Female"],
        "marital_statuses": ["Single", "Married"],
        "guarantor_options": ["Yes", "No"],
    }


def artifacts_ready() -> bool:
    return MODEL_PATH.exists() and COLUMNS_PATH.exists() and METRICS_PATH.exists()


def clear_artifact_cache() -> None:
    _load_artifacts.cache_clear()
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)