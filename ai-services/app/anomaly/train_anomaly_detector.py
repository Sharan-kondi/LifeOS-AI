"""
Anomaly Detection — Training Pipeline
Dual-model approach:
  1. Isolation Forest (unsupervised statistical)
  2. Autoencoder (deep learning reconstruction error)
"""
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, f1_score, roc_auc_score
import joblib
import json
import warnings
warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
TX_PATH = BASE_DIR / "datasets" / "exports" / "transactions.csv"
ANOMALY_PATH = BASE_DIR / "datasets" / "exports" / "anomalies.csv"
MODEL_DIR = BASE_DIR / "ml-models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create ML features from raw transaction data."""
    features = pd.DataFrame()

    # Amount features
    features["amount"] = df["amount"]
    features["log_amount"] = np.log1p(df["amount"])

    # Time features
    features["hour"] = pd.to_datetime(df["timestamp"]).dt.hour
    features["day_of_week"] = pd.to_datetime(df["timestamp"]).dt.dayofweek
    features["is_weekend"] = df["is_weekend"].astype(int)
    features["is_night"] = df["is_night_transaction"].astype(int)

    # Category encoding
    cat_encoder = LabelEncoder()
    features["category_encoded"] = cat_encoder.fit_transform(df["category"].fillna("Unknown"))

    # Payment method encoding
    pay_encoder = LabelEncoder()
    features["payment_encoded"] = pay_encoder.fit_transform(df["payment_method"].fillna("Unknown"))

    # Amount statistics per user
    user_stats = df.groupby("user_id")["amount"].agg(["mean", "std", "median"])
    user_stats.columns = ["user_mean", "user_std", "user_median"]
    user_stats["user_std"] = user_stats["user_std"].fillna(0)

    merged = df[["user_id"]].merge(user_stats, left_on="user_id", right_index=True, how="left")
    features["amount_zscore"] = np.where(
        merged["user_std"] > 0,
        (df["amount"] - merged["user_mean"]) / merged["user_std"],
        0
    )
    features["amount_vs_median"] = df["amount"] / (merged["user_median"] + 1)

    # Category frequency per user
    cat_freq = df.groupby(["user_id", "category"]).size().reset_index(name="cat_count")
    user_total = df.groupby("user_id").size().reset_index(name="total_count")
    cat_freq = cat_freq.merge(user_total, on="user_id")
    cat_freq["cat_frequency"] = cat_freq["cat_count"] / cat_freq["total_count"]

    df_temp = df[["user_id", "category"]].copy()
    df_temp = df_temp.merge(cat_freq[["user_id", "category", "cat_frequency"]], 
                             on=["user_id", "category"], how="left")
    features["category_frequency"] = df_temp["cat_frequency"].fillna(0).values

    return features


def train():
    print("=" * 60)
    print("🔍 ANOMALY DETECTION — Training Pipeline")
    print("=" * 60)

    # Load transactions
    print("\n📂 Loading transactions...")
    tx_df = pd.read_csv(TX_PATH)
    print(f"   Transactions: {len(tx_df):,}")

    # Load known anomalies for evaluation
    print("📂 Loading labeled anomalies...")
    anomaly_df = pd.read_csv(ANOMALY_PATH)
    known_anomaly_ids = set(anomaly_df[anomaly_df["is_anomaly"] == True]["transaction_id"].values)
    print(f"   Known anomalies: {len(known_anomaly_ids):,}")

    # Feature engineering
    print("\n🔧 Engineering features...")
    features = engineer_features(tx_df)
    feature_columns = features.columns.tolist()
    print(f"   Features: {feature_columns}")

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features.fillna(0))

    # Create labels (1 = normal, -1 = anomaly for Isolation Forest)
    tx_df["is_anomaly_label"] = tx_df["transaction_id"].isin(known_anomaly_ids).astype(int)
    y_true = tx_df["is_anomaly_label"].values

    # ============================================
    # Model 1: Isolation Forest
    # ============================================
    print("\n🌲 Training Isolation Forest...")
    contamination = min(y_true.mean() * 1.5, 0.1)  # Slightly over-estimate
    print(f"   Contamination rate: {contamination:.4f}")

    iso_forest = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        max_samples="auto",
        random_state=42,
        n_jobs=-1,
    )
    iso_forest.fit(X_scaled)

    # Predict (-1 = anomaly, 1 = normal)
    iso_predictions = iso_forest.predict(X_scaled)
    iso_labels = (iso_predictions == -1).astype(int)  # Convert to 0/1
    iso_scores = -iso_forest.decision_function(X_scaled)  # Higher = more anomalous

    iso_f1 = f1_score(y_true, iso_labels, zero_division=0)
    print(f"   Isolation Forest F1: {iso_f1:.4f}")

    try:
        iso_auc = roc_auc_score(y_true, iso_scores)
        print(f"   Isolation Forest AUC-ROC: {iso_auc:.4f}")
    except ValueError:
        iso_auc = 0.0

    # ============================================
    # Model 2: Autoencoder
    # ============================================
    print("\n🧠 Training Autoencoder...")
    import tensorflow as tf
    tf.get_logger().setLevel("ERROR")

    # Train only on normal transactions
    normal_mask = y_true == 0
    X_normal = X_scaled[normal_mask]
    print(f"   Training on {len(X_normal):,} normal transactions")

    input_dim = X_scaled.shape[1]

    autoencoder = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(input_dim,)),
        tf.keras.layers.Dense(32, activation="relu"),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dense(16, activation="relu"),
        tf.keras.layers.Dense(8, activation="relu"),    # Bottleneck
        tf.keras.layers.Dense(16, activation="relu"),
        tf.keras.layers.Dense(32, activation="relu"),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dense(input_dim, activation="linear"),
    ])

    autoencoder.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="mse",
    )

    autoencoder.fit(
        X_normal, X_normal,
        epochs=30,
        batch_size=512,
        validation_split=0.1,
        verbose=0,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(
                patience=5,
                restore_best_weights=True,
                monitor="val_loss",
            )
        ],
    )

    # Calculate reconstruction error
    reconstructed = autoencoder.predict(X_scaled, verbose=0)
    mse_errors = np.mean(np.square(X_scaled - reconstructed), axis=1)

    # Set threshold at 95th percentile of normal transaction errors
    normal_errors = mse_errors[normal_mask]
    threshold = np.percentile(normal_errors, 95)
    ae_labels = (mse_errors > threshold).astype(int)

    ae_f1 = f1_score(y_true, ae_labels, zero_division=0)
    print(f"   Autoencoder F1: {ae_f1:.4f}")
    print(f"   Threshold: {threshold:.6f}")

    try:
        ae_auc = roc_auc_score(y_true, mse_errors)
        print(f"   Autoencoder AUC-ROC: {ae_auc:.4f}")
    except ValueError:
        ae_auc = 0.0

    # ============================================
    # Ensemble evaluation
    # ============================================
    ensemble_scores = 0.5 * (iso_scores / (np.max(iso_scores) + 1e-8)) + \
                      0.5 * (mse_errors / (np.max(mse_errors) + 1e-8))
    ensemble_threshold = np.percentile(ensemble_scores[normal_mask], 95)
    ensemble_labels = (ensemble_scores > ensemble_threshold).astype(int)
    ensemble_f1 = f1_score(y_true, ensemble_labels, zero_division=0)

    print(f"\n📊 Ensemble F1: {ensemble_f1:.4f}")
    print("\n📋 Ensemble Classification Report:")
    print(classification_report(y_true, ensemble_labels, target_names=["Normal", "Anomaly"]))

    # ============================================
    # Save models
    # ============================================
    print("💾 Saving models...")
    joblib.dump(iso_forest, MODEL_DIR / "isolation_forest.pkl")
    joblib.dump(scaler, MODEL_DIR / "anomaly_scaler.pkl")
    joblib.dump(feature_columns, MODEL_DIR / "anomaly_features.pkl")
    joblib.dump(threshold, MODEL_DIR / "autoencoder_threshold.pkl")
    autoencoder.save(str(MODEL_DIR / "autoencoder.keras"))

    # Save metrics
    metrics = {
        "isolation_forest": {
            "f1_score": round(iso_f1, 4),
            "auc_roc": round(iso_auc, 4),
            "contamination": round(contamination, 4),
        },
        "autoencoder": {
            "f1_score": round(ae_f1, 4),
            "auc_roc": round(ae_auc, 4),
            "threshold": round(float(threshold), 6),
        },
        "ensemble": {
            "f1_score": round(ensemble_f1, 4),
            "threshold": round(float(ensemble_threshold), 6),
        },
        "dataset": {
            "total_transactions": len(tx_df),
            "known_anomalies": len(known_anomaly_ids),
            "anomaly_rate": round(y_true.mean(), 4),
        },
        "features": feature_columns,
    }

    with open(MODEL_DIR / "anomaly_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("\n" + "=" * 60)
    print("✅ Anomaly detection training complete!")
    print("=" * 60)

    return metrics


if __name__ == "__main__":
    train()
