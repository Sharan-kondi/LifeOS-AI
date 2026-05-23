"""Anomaly detection service — inference logic."""
import numpy as np
from typing import List, Dict
from app.models.model_registry import registry
from app.schemas.anomaly_schema import AnomalyRequest, AnomalyResult


def detect_anomaly(tx: AnomalyRequest) -> AnomalyResult:
    """Detect if a single transaction is anomalous using ensemble."""

    iso_forest = registry.get("isolation_forest")
    scaler = registry.get("anomaly_scaler")
    autoencoder = registry.get("autoencoder")

    if iso_forest is None or scaler is None:
        return AnomalyResult(
            is_anomaly=False,
            anomaly_score=0.0,
            isolation_forest_score=0.0,
            autoencoder_score=0.0,
            explanation="Anomaly detection models not loaded.",
        )

    # Build feature vector
    from sklearn.preprocessing import LabelEncoder
    features = _build_features(tx)
    features_scaled = scaler.transform([features])

    # Isolation Forest
    iso_score = float(-iso_forest.decision_function(features_scaled)[0])
    iso_pred = iso_forest.predict(features_scaled)[0]
    iso_is_anomaly = iso_pred == -1

    # Autoencoder
    ae_score = 0.0
    ae_is_anomaly = False
    if autoencoder is not None:
        import joblib
        from pathlib import Path
        MODEL_DIR = Path(__file__).resolve().parent.parent.parent.parent / "ml-models"

        reconstructed = autoencoder.predict(features_scaled, verbose=0)
        ae_score = float(np.mean(np.square(features_scaled - reconstructed)))

        threshold_path = MODEL_DIR / "autoencoder_threshold.pkl"
        if threshold_path.exists():
            threshold = joblib.load(threshold_path)
            ae_is_anomaly = ae_score > threshold

    # Ensemble
    iso_normalized = iso_score / (abs(iso_score) + 1) if iso_score != 0 else 0
    ae_normalized = min(ae_score * 10, 1.0)  # Rough normalization
    ensemble_score = 0.5 * iso_normalized + 0.5 * ae_normalized
    is_anomaly = iso_is_anomaly or ae_is_anomaly

    # Generate explanation
    explanation = _generate_explanation(tx, is_anomaly, iso_is_anomaly, ae_is_anomaly)

    return AnomalyResult(
        is_anomaly=is_anomaly,
        anomaly_score=round(ensemble_score, 4),
        isolation_forest_score=round(iso_score, 4),
        autoencoder_score=round(ae_score, 6),
        explanation=explanation,
    )


def detect_batch(transactions: List[AnomalyRequest]) -> List[AnomalyResult]:
    """Detect anomalies in a batch of transactions."""
    return [detect_anomaly(tx) for tx in transactions]


def _build_features(tx: AnomalyRequest) -> List[float]:
    """Build feature vector matching training features."""
    amount_zscore = (
        (tx.amount - tx.user_mean_amount) / (tx.user_std_amount + 1e-8)
        if tx.user_std_amount > 0 else 0
    )
    amount_vs_median = tx.amount / (tx.user_median_amount + 1)

    return [
        tx.amount,                       # amount
        float(np.log1p(tx.amount)),     # log_amount
        float(tx.hour),                  # hour
        float(tx.day_of_week),          # day_of_week
        float(tx.is_weekend),           # is_weekend
        float(tx.is_night),             # is_night
        0.0,                             # category_encoded (placeholder)
        0.0,                             # payment_encoded (placeholder)
        amount_zscore,                   # amount_zscore
        amount_vs_median,                # amount_vs_median
        0.5,                             # category_frequency (default)
    ]


def _generate_explanation(
    tx: AnomalyRequest,
    is_anomaly: bool,
    iso_flagged: bool,
    ae_flagged: bool,
) -> str:
    """Generate human-readable explanation."""
    if not is_anomaly:
        return "Transaction appears normal."

    reasons = []
    if tx.amount > tx.user_mean_amount * 3:
        reasons.append(f"Amount (₹{tx.amount:,.0f}) is {tx.amount/max(tx.user_mean_amount,1):.1f}x above your average")
    if tx.is_night:
        reasons.append("Late night transaction")
    if iso_flagged and ae_flagged:
        reasons.append("Flagged by both statistical and deep learning models")
    elif iso_flagged:
        reasons.append("Statistical outlier detected")
    elif ae_flagged:
        reasons.append("Unusual spending pattern detected")

    if not reasons:
        reasons.append("Transaction pattern deviates from your normal behavior")

    return ". ".join(reasons) + "."
