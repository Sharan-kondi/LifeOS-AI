from faker import Faker
import pandas as pd
import random
from datetime import datetime, timedelta
from pathlib import Path
import uuid

fake = Faker("en_IN")

OUTPUT_DIR = Path("../exports")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

users_df = pd.read_csv("../exports/users.csv")

productivity_records = []

for _, user in users_df.iterrows():

    lifestyle = user["lifestyle_type"]

    days_to_generate = 90

    for day in range(days_to_generate):

        current_date = (
            datetime.now() - timedelta(days=day)
        )

        if lifestyle == "Investor":
            sleep_hours = random.uniform(6, 7.5)
            work_hours = random.uniform(8, 11)

        elif lifestyle == "Overspender":
            sleep_hours = random.uniform(4.5, 6.5)
            work_hours = random.uniform(6, 9)

        elif lifestyle == "Saver":
            sleep_hours = random.uniform(7, 8.5)
            work_hours = random.uniform(7, 9)

        else:
            sleep_hours = random.uniform(6, 8)
            work_hours = random.uniform(7, 10)

        focus_sessions = random.randint(2, 8)

        meetings_count = random.randint(0, 6)

        screen_time_hours = round(
            random.uniform(4, 12),
            2
        )

        stress_level = random.randint(1, 10)

        productivity_score = round(
            (
                sleep_hours * 10
                + focus_sessions * 8
                - stress_level * 5
            ),
            2
        )

        burnout_risk = (
            stress_level >= 8
            and sleep_hours < 6
        )

        productivity_records.append({

            "record_id": str(uuid.uuid4()),

            "user_id": user["user_id"],

            "date": current_date.date(),

            "sleep_hours": round(sleep_hours, 2),

            "work_hours": round(work_hours, 2),

            "focus_sessions": focus_sessions,

            "meetings_count": meetings_count,

            "screen_time_hours": screen_time_hours,

            "stress_level": stress_level,

            "productivity_score": productivity_score,

            "burnout_risk": burnout_risk,

            "is_weekend":
                current_date.weekday() >= 5
        })

productivity_df = pd.DataFrame(productivity_records)

output_file = OUTPUT_DIR / "productivity.csv"

productivity_df.to_csv(output_file, index=False)

print(f"Generated {len(productivity_df)} productivity records")
print(f"Saved to: {output_file}")