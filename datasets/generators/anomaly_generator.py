import pandas as pd
import random
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path("../exports")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

transactions_df = pd.read_csv(
    "../exports/transactions.csv"
)

anomaly_indices = random.sample(
    list(transactions_df.index),
    int(len(transactions_df) * 0.02)
)

transactions_df["is_anomaly"] = False
transactions_df["anomaly_type"] = "Normal"

fraud_types = [
    "High Value Spike",
    "Rapid Transactions",
    "Late Night Fraud",
    "Duplicate Charge",
    "ATM Abuse",
]

for idx in anomaly_indices:

    fraud_type = random.choice(fraud_types)

    transactions_df.at[idx, "is_anomaly"] = True

    transactions_df.at[idx, "anomaly_type"] = fraud_type

    if fraud_type == "High Value Spike":

        transactions_df.at[idx, "amount"] *= random.uniform(5, 15)

    elif fraud_type == "Rapid Transactions":

        transactions_df.at[idx, "amount"] *= random.uniform(2, 4)

    elif fraud_type == "Late Night Fraud":

        timestamp = pd.to_datetime(
            transactions_df.at[idx, "timestamp"]
        )

        timestamp = timestamp.replace(
            hour=random.randint(1, 4)
        )

        transactions_df.at[idx, "timestamp"] = timestamp

    elif fraud_type == "Duplicate Charge":

        duplicate_row = (
            transactions_df.loc[idx].copy()
        )

        transactions_df = pd.concat(
            [
                transactions_df,
                pd.DataFrame([duplicate_row])
            ],
            ignore_index=True
        )

    elif fraud_type == "ATM Abuse":

        transactions_df.at[idx, "category"] = "ATM"

        transactions_df.at[idx, "amount"] *= random.uniform(3, 8)

anomalies_df = (
    transactions_df[
        transactions_df["is_anomaly"] == True
    ]
)

transactions_output = (
    OUTPUT_DIR / "transactions_with_anomalies.csv"
)

anomalies_output = (
    OUTPUT_DIR / "anomalies.csv"
)

transactions_df.to_csv(
    transactions_output,
    index=False
)

anomalies_df.to_csv(
    anomalies_output,
    index=False
)

print(
    f"Injected {len(anomalies_df)} anomalies"
)

print(
    f"Saved full dataset to: {transactions_output}"
)

print(
    f"Saved anomalies dataset to: {anomalies_output}"
)