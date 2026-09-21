"""Train Random Forest model from UI student loan CSV (report Chapter 3 / Appendix A)."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_DIR / "data" / "ui_student_loan_data.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "random_forest_loan_model.joblib"
COLUMNS_PATH = ARTIFACTS_DIR / "model_feature_columns.joblib"
METRICS_PATH = ARTIFACTS_DIR / "model_metrics.json"
CATEGORIES_PATH = ARTIFACTS_DIR / "category_levels.json"

CATEGORICAL_COLS = [
    "Gender",
    "Marital_Status",
    "Faculty",
    "Academic_Level",
    "Residence_Type",
    "Guardian_Employment_Status",
    "Guarantor_Availability",
]
NUMERICAL_IMPUTE = ["CGPA", "Loan_Amount_Requested", "Loan_Term_Months"]
CATEGORICAL_IMPUTE = [
    "Gender",
    "Marital_Status",
    "Guardian_Employment_Status",
    "Guarantor_Availability",
]


def _prepare_dataframe(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    df = df.copy()
    if "Student_ID" in df.columns:
        df.drop(columns=["Student_ID"], inplace=True)

    for col in NUMERICAL_IMPUTE:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())

    for col in CATEGORICAL_IMPUTE:
        if col in df.columns and df[col].isna().any():
            df[col] = df[col].fillna(df[col].mode()[0])

    df["Total_Income"] = df["Guardian_Monthly_Income"] + df["Other_Income"]
    # Avoid division by zero
    df["Loan_To_Income_Ratio"] = df["Loan_Amount_Requested"] / df["Total_Income"].replace(
        0, pd.NA
    )
    df["Loan_To_Income_Ratio"] = df["Loan_To_Income_Ratio"].fillna(0)

    category_levels = {col: sorted(df[col].dropna().astype(str).unique().tolist()) for col in CATEGORICAL_COLS}

    # Encode target: Approved = 1, Rejected = 0
    y = (df["Loan_Status"] == "Approved").astype(int)
    X = df.drop(columns=["Loan_Status"])
    X = pd.get_dummies(X, columns=CATEGORICAL_COLS, drop_first=True)

    return X.assign(_target=y), category_levels


def train_and_save(data_path: Path | None = None) -> dict:
    data_path = data_path or DATA_PATH
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    raw = pd.read_csv(data_path)
    prepared, category_levels = _prepare_dataframe(raw)
    y = prepared["_target"]
    X = prepared.drop(columns=["_target"])
    feature_columns = list(X.columns)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    model = RandomForestClassifier(n_estimators=300, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    cm = confusion_matrix(y_test, preds).tolist()
    importances = (
        pd.Series(model.feature_importances_, index=feature_columns)
        .sort_values(ascending=False)
        .head(12)
    )
    feature_importance = [
        {"feature": str(name), "importance": float(val)} for name, val in importances.items()
    ]

    metrics = {
        "accuracy": float(accuracy_score(y_test, preds)),
        "precision": float(precision_score(y_test, preds, zero_division=0)),
        "recall": float(recall_score(y_test, preds, zero_division=0)),
        "f1_score": float(f1_score(y_test, preds, zero_division=0)),
        "confusion_matrix": cm,
        "feature_importance": feature_importance,
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "n_estimators": 300,
        "disclaimer": (
            "This prediction is not an official NELFUND or University of Ibadan loan decision."
        ),
    }

    joblib.dump(model, MODEL_PATH)
    joblib.dump(feature_columns, COLUMNS_PATH)
    CATEGORIES_PATH.write_text(json.dumps(category_levels, indent=2), encoding="utf-8")
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    result = train_and_save()
    print(json.dumps(result, indent=2))