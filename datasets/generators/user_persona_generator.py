from faker import Faker
import pandas as pd
import random
import uuid
from pathlib import Path

fake = Faker("en_IN")

OUTPUT_DIR = Path("../exports")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

professions = {
    "Software Engineer": (60000, 250000),
    "AI Engineer": (80000, 350000),
    "Doctor": (90000, 500000),
    "Architect": (50000, 180000),
    "Lawyer": (50000, 220000),
    "Teacher": (25000, 80000),
    "Marketing Manager": (45000, 160000),
    "Data Scientist": (70000, 300000),
    "Business Analyst": (40000, 150000),
    "Student": (5000, 25000),
}

cities = [
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Hyderabad",
    "Pune",
    "Chennai",
    "Kolkata",
]

lifestyle_profiles = [
    "Saver",
    "Balanced",
    "Overspender",
    "Investor",
]

users = []

for _ in range(1000):

    profession = random.choice(list(professions.keys()))

    salary_range = professions[profession]

    monthly_income = random.randint(
        salary_range[0],
        salary_range[1]
    )

    savings_ratio = {
        "Saver": random.uniform(0.35, 0.60),
        "Balanced": random.uniform(0.20, 0.35),
        "Overspender": random.uniform(0.01, 0.10),
        "Investor": random.uniform(0.30, 0.50),
    }

    lifestyle = random.choice(lifestyle_profiles)

    users.append({
        "user_id": str(uuid.uuid4()),
        "full_name": fake.name(),
        "email": fake.email(),
        "age": random.randint(21, 60),
        "city": random.choice(cities),
        "profession": profession,
        "monthly_income": monthly_income,
        "lifestyle_type": lifestyle,
        "monthly_savings_estimate":
            round(monthly_income * savings_ratio[lifestyle], 2),
    })

df = pd.DataFrame(users)

output_file = OUTPUT_DIR / "users.csv"

df.to_csv(output_file, index=False)

print(f"Generated {len(df)} users")
print(f"Saved to: {output_file}")