"""
Expense Categorization — Training Pipeline
Trains an XGBoost classifier to predict spending category from merchant name.
Uses TF-IDF vectorization + GridSearchCV for hyperparameter tuning.
"""
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import json

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATASET_PATH = BASE_DIR / "datasets" / "exports" / "transactions.csv"
MODEL_DIR = BASE_DIR / "ml-models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def train():
    print("=" * 60)
    print("🏷️  EXPENSE CATEGORIZATION — Training Pipeline")
    print("=" * 60)

    # Load data
    print("\n📂 Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    df = df.dropna(subset=["merchant", "category"])
    print(f"   Dataset size: {len(df):,} transactions")
    print(f"   Categories: {df['category'].nunique()} unique")
    print(f"   Categories: {sorted(df['category'].unique())}")

    X = df["merchant"].astype(str)
    y = df["category"].astype(str)

    # Encode labels for XGBoost
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # Train/test split (time-based: first 80% for train)
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y_encoded[:split_idx], y_encoded[split_idx:]

    print(f"\n📊 Split: {len(X_train):,} train / {len(X_test):,} test")

    # Build pipeline
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            max_features=5000,
            ngram_range=(1, 2),
            sublinear_tf=True,
        )),
        ("classifier", XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1,
            eval_metric="mlogloss",
            verbosity=0,
        )),
    ])

    print("\n🔧 Training XGBoost classifier...")
    pipeline.fit(X_train, y_train)

    # Evaluate
    predictions = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    # Decode labels back for report
    y_test_labels = label_encoder.inverse_transform(y_test)
    pred_labels = label_encoder.inverse_transform(predictions)

    print(f"\n✅ Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")
    print("\n📋 Classification Report:")
    report = classification_report(y_test_labels, pred_labels, output_dict=True)
    print(classification_report(y_test_labels, pred_labels))

    # Confidence scores on test set
    probabilities = pipeline.predict_proba(X_test)
    avg_confidence = float(np.mean(np.max(probabilities, axis=1)))
    print(f"📈 Average confidence: {avg_confidence:.4f}")

    # Save model
    model_path = MODEL_DIR / "expense_classifier.pkl"
    joblib.dump(pipeline, model_path)
    print(f"\n💾 Model saved: {model_path}")

    # Save label encoder
    encoder_path = MODEL_DIR / "category_label_encoder.pkl"
    joblib.dump(label_encoder, encoder_path)
    print(f"💾 Label encoder saved: {encoder_path}")

    # Save metrics
    metrics = {
        "model_type": "XGBoost + TF-IDF",
        "accuracy": round(accuracy, 4),
        "avg_confidence": round(avg_confidence, 4),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "n_categories": int(df["category"].nunique()),
        "categories": sorted(df["category"].unique().tolist()),
        "per_class": {
            k: {
                "precision": round(v["precision"], 4),
                "recall": round(v["recall"], 4),
                "f1": round(v["f1-score"], 4),
                "support": int(v["support"]),
            }
            for k, v in report.items()
            if k not in ("accuracy", "macro avg", "weighted avg")
        },
        "macro_f1": round(report["macro avg"]["f1-score"], 4),
        "weighted_f1": round(report["weighted avg"]["f1-score"], 4),
    }

    metrics_path = MODEL_DIR / "categorizer_metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"💾 Metrics saved: {metrics_path}")

    print("\n" + "=" * 60)
    print("✅ Categorization training complete!")
    print("=" * 60)

    return metrics


if __name__ == "__main__":
    train()