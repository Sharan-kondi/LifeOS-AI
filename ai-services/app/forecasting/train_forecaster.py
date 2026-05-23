"""
Cashflow Forecasting — Training Pipeline
Dual-model approach:
  1. Prophet (trend + seasonality detection)
  2. LSTM (deep learning sequence prediction)
"""
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import json
import warnings
warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
TX_PATH = BASE_DIR / "datasets" / "exports" / "transactions.csv"
MODEL_DIR = BASE_DIR / "ml-models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

SEQUENCE_LENGTH = 30  # 30 days lookback
FORECAST_DAYS = 7     # Predict next 7 days


def prepare_daily_spending(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate transactions into daily spending totals."""
    df["date"] = pd.to_datetime(df["timestamp"]).dt.date
    daily = df.groupby("date")["amount"].sum().reset_index()
    daily.columns = ["ds", "y"]
    daily["ds"] = pd.to_datetime(daily["ds"])
    daily = daily.sort_values("ds").reset_index(drop=True)
    return daily


def train_prophet(daily: pd.DataFrame) -> dict:
    """Train Facebook Prophet model."""
    print("\n📈 Training Prophet model...")
    from prophet import Prophet

    # Train/test split (last 30 days for testing)
    train_size = len(daily) - 30
    train_df = daily.iloc[:train_size].copy()
    test_df = daily.iloc[train_size:].copy()

    print(f"   Train: {len(train_df)} days, Test: {len(test_df)} days")

    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.1,
        seasonality_prior_scale=10.0,
    )
    model.add_seasonality(name="monthly", period=30.5, fourier_order=5)
    model.fit(train_df)

    # Predict on test period
    future = model.make_future_dataframe(periods=len(test_df))
    forecast = model.predict(future)

    # Evaluate on test set
    test_forecast = forecast.iloc[-len(test_df):]
    mae = mean_absolute_error(test_df["y"].values, test_forecast["yhat"].values)
    rmse = np.sqrt(mean_squared_error(test_df["y"].values, test_forecast["yhat"].values))
    mape = np.mean(np.abs(
        (test_df["y"].values - test_forecast["yhat"].values) / (test_df["y"].values + 1)
    )) * 100

    print(f"   Prophet MAE: ₹{mae:,.2f}")
    print(f"   Prophet RMSE: ₹{rmse:,.2f}")
    print(f"   Prophet MAPE: {mape:.2f}%")

    # Save model
    joblib.dump(model, MODEL_DIR / "prophet_model.pkl")
    print(f"   💾 Saved Prophet model")

    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2),
        "train_days": len(train_df),
        "test_days": len(test_df),
    }


def create_sequences(data: np.ndarray, seq_length: int, forecast_length: int):
    """Create input/output sequences for LSTM."""
    X, y = [], []
    for i in range(len(data) - seq_length - forecast_length + 1):
        X.append(data[i : i + seq_length])
        y.append(data[i + seq_length : i + seq_length + forecast_length])
    return np.array(X), np.array(y)


def train_lstm(daily: pd.DataFrame) -> dict:
    """Train LSTM sequence model."""
    print("\n🧠 Training LSTM model...")
    import tensorflow as tf
    tf.get_logger().setLevel("ERROR")

    values = daily["y"].values.reshape(-1, 1)

    # Scale
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(values)

    # Create sequences
    X, y = create_sequences(scaled.flatten(), SEQUENCE_LENGTH, FORECAST_DAYS)
    X = X.reshape(-1, SEQUENCE_LENGTH, 1)
    y = y.reshape(-1, FORECAST_DAYS)

    # Split
    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    print(f"   Sequences: {len(X)} total, {len(X_train)} train, {len(X_test)} test")

    # Build LSTM
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(SEQUENCE_LENGTH, 1)),
        tf.keras.layers.LSTM(64, return_sequences=True),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.LSTM(32),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(32, activation="relu"),
        tf.keras.layers.Dense(FORECAST_DAYS),
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="mse",
    )

    model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=32,
        validation_split=0.1,
        verbose=0,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(
                patience=10,
                restore_best_weights=True,
                monitor="val_loss",
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                patience=5,
                factor=0.5,
                monitor="val_loss",
            ),
        ],
    )

    # Evaluate
    predictions_scaled = model.predict(X_test, verbose=0)
    # Inverse scale predictions
    pred_flat = predictions_scaled.flatten().reshape(-1, 1)
    actual_flat = y_test.flatten().reshape(-1, 1)

    pred_inv = scaler.inverse_transform(pred_flat).flatten()
    actual_inv = scaler.inverse_transform(actual_flat).flatten()

    mae = mean_absolute_error(actual_inv, pred_inv)
    rmse = np.sqrt(mean_squared_error(actual_inv, pred_inv))

    print(f"   LSTM MAE: ₹{mae:,.2f}")
    print(f"   LSTM RMSE: ₹{rmse:,.2f}")

    # Save
    model.save(str(MODEL_DIR / "lstm_forecaster.keras"))
    joblib.dump(scaler, MODEL_DIR / "lstm_scaler.pkl")
    print(f"   💾 Saved LSTM model + scaler")

    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "sequence_length": SEQUENCE_LENGTH,
        "forecast_days": FORECAST_DAYS,
        "train_sequences": len(X_train),
        "test_sequences": len(X_test),
    }


def train():
    print("=" * 60)
    print("📈 CASHFLOW FORECASTING — Training Pipeline")
    print("=" * 60)

    # Load data
    print("\n📂 Loading transactions...")
    df = pd.read_csv(TX_PATH)
    print(f"   Transactions: {len(df):,}")

    # Prepare daily spending
    daily = prepare_daily_spending(df)
    print(f"   Daily time series: {len(daily)} days")
    print(f"   Date range: {daily['ds'].min()} to {daily['ds'].max()}")
    print(f"   Avg daily spending: ₹{daily['y'].mean():,.2f}")

    # Train Prophet
    prophet_metrics = train_prophet(daily)

    # Train LSTM
    lstm_metrics = train_lstm(daily)

    # Save combined metrics
    metrics = {
        "prophet": prophet_metrics,
        "lstm": lstm_metrics,
        "dataset": {
            "total_transactions": len(df),
            "total_days": len(daily),
            "avg_daily_spending": round(daily["y"].mean(), 2),
            "date_range": f"{daily['ds'].min().date()} to {daily['ds'].max().date()}",
        },
    }

    with open(MODEL_DIR / "forecast_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("\n" + "=" * 60)
    print("✅ Forecasting training complete!")
    print("=" * 60)

    return metrics


if __name__ == "__main__":
    train()
