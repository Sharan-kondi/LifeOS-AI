import pandas as pd
from pathlib import Path

from sklearn.model_selection import (
    train_test_split
)

from sklearn.pipeline import Pipeline

from sklearn.feature_extraction.text import (
    TfidfVectorizer
)

from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    classification_report,
    accuracy_score
)

from sklearn.model_selection import (
    GridSearchCV
)

import joblib

BASE_DIR = Path(__file__).resolve().parent

DATASET_PATH = (
    BASE_DIR.parent.parent.parent
    / "datasets"
    / "exports"
    / "transactions_with_anomalies.csv"
)

MODEL_DIR = (
    BASE_DIR.parent.parent.parent
    / "ml-models"
)

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

df = df.dropna()

X = df["merchant"]

y = df["category"]

print(f"Dataset size: {len(df)}")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

pipeline = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            stop_words="english"
        )
    ),

    (
        "classifier",
        RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )
    )
])

print("Training model...")

pipeline.fit(X_train, y_train)

predictions = pipeline.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print(f"Accuracy: {accuracy:.4f}")

print(
    classification_report(
        y_test,
        predictions
    )
)

model_path = (
    MODEL_DIR
    / "expense_classifier.pkl"
)

joblib.dump(
    pipeline,
    model_path
)

print(f"Model saved to: {model_path}")