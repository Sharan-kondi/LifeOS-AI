from faker import Faker
import pandas as pd
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path

fake = Faker("en_IN")

OUTPUT_DIR = Path("../exports")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

users_df = pd.read_csv("../exports/users.csv")

subscription_services = {

    "Entertainment": [
        ("Netflix", 649),
        ("Amazon Prime", 299),
        ("Spotify", 119),
        ("YouTube Premium", 129),
        ("Hotstar", 899),
    ],

    "Productivity": [
        ("Notion", 299),
        ("Canva Pro", 499),
        ("ChatGPT Plus", 2000),
        ("Google One", 130),
    ],

    "Fitness": [
        ("Cult Fit", 1500),
        ("HealthifyMe", 999),
    ],

    "Cloud Storage": [
        ("Dropbox", 999),
        ("iCloud+", 149),
    ]
}

subscriptions = []

for _, user in users_df.iterrows():

    lifestyle = user["lifestyle_type"]

    if lifestyle == "Saver":
        num_subs = random.randint(1, 3)

    elif lifestyle == "Balanced":
        num_subs = random.randint(2, 5)

    elif lifestyle == "Overspender":
        num_subs = random.randint(4, 8)

    else:
        num_subs = random.randint(2, 6)

    chosen_categories = random.sample(
        list(subscription_services.keys()),
        min(num_subs, len(subscription_services))
    )

    for category in chosen_categories:

        service = random.choice(
            subscription_services[category]
        )

        renewal_date = (
            datetime.now()
            + timedelta(days=random.randint(1, 30))
        )

        subscriptions.append({

            "subscription_id": str(uuid.uuid4()),

            "user_id": user["user_id"],

            "service_name": service[0],

            "category": category,

            "monthly_cost": service[1],

            "renewal_date": renewal_date,

            "active": random.choice([True, True, True, False]),

            "auto_pay_enabled": random.choice([True, False]),

            "subscription_start_date": (
                datetime.now()
                - timedelta(days=random.randint(30, 700))
            ),

            "usage_frequency": random.choice([
                "Daily",
                "Weekly",
                "Rarely",
                "Unused"
            ])
        })

subscriptions_df = pd.DataFrame(subscriptions)

output_file = OUTPUT_DIR / "subscriptions.csv"

subscriptions_df.to_csv(output_file, index=False)

print(f"Generated {len(subscriptions_df)} subscriptions")
print(f"Saved to: {output_file}")