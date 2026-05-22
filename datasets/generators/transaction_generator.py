from faker import Faker
import pandas as pd
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path

fake = Faker("en_IN")

OUTPUT_DIR = Path("../exports")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# LOAD USERS CSV
users_df = pd.read_csv("../exports/users.csv")

# IMPORTANT
# remove spaces or hidden chars
users_df.columns = users_df.columns.str.strip()

transaction_categories = {
    "Food": [
        "Swiggy",
        "Zomato",
        "Cafe Coffee Day",
        "Dominos"
    ],

    "Shopping": [
        "Amazon",
        "Flipkart",
        "Myntra"
    ],

    "Transport": [
        "Uber",
        "Ola",
        "Rapido"
    ],

    "Bills": [
        "Electricity Bill",
        "WiFi Recharge",
        "Mobile Recharge"
    ],

    "Investment": [
        "Groww",
        "Zerodha",
        "Paytm Money"
    ],

    "Entertainment": [
        "BookMyShow",
        "PVR",
        "Netflix"
    ],

    "Fuel": [
        "Indian Oil",
        "Shell",
        "HP Petrol Pump"
    ],

    "ATM": [
        "ATM Withdrawal"
    ]
}

payment_methods = [
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
    "Wallet"
]

transactions = []

for _, user in users_df.iterrows():

    user_id = str(user["user_id"]).strip()

    lifestyle = str(user["lifestyle_type"]).strip()

    days_to_generate = 180

    for day in range(days_to_generate):

        current_date = datetime.now() - timedelta(days=day)

        transactions_per_day = random.randint(1, 5)

        if current_date.weekday() >= 5:
            transactions_per_day += 2

        for _ in range(transactions_per_day):

            category = random.choice(
                list(transaction_categories.keys())
            )

            merchant = random.choice(
                transaction_categories[category]
            )

            base_amounts = {
                "Food": (150, 1200),
                "Shopping": (500, 10000),
                "Transport": (80, 1500),
                "Bills": (300, 5000),
                "Investment": (1000, 20000),
                "Entertainment": (200, 2500),
                "Fuel": (300, 4000),
                "ATM": (500, 10000),
            }

            amount_range = base_amounts[category]

            amount = round(
                random.uniform(
                    amount_range[0],
                    amount_range[1]
                ),
                2
            )

            if lifestyle == "Overspender":
                amount *= random.uniform(1.2, 1.8)

            elif lifestyle == "Saver":
                amount *= random.uniform(0.6, 0.9)

            transaction_time = current_date.replace(
                hour=random.randint(7, 23),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )

            transactions.append({
                "transaction_id": str(uuid.uuid4()),
                "user_id": user_id,
                "timestamp": transaction_time,
                "category": category,
                "merchant": merchant,
                "amount": round(amount, 2),
                "payment_method": random.choice(payment_methods),
                "location": str(user["city"]).strip(),
                "is_weekend": current_date.weekday() >= 5,
                "is_night_transaction": transaction_time.hour >= 22
            })

transactions_df = pd.DataFrame(transactions)

output_file = OUTPUT_DIR / "transactions.csv"

transactions_df.to_csv(output_file, index=False)

print(f"Generated {len(transactions_df)} transactions")
print(f"Saved to: {output_file}")