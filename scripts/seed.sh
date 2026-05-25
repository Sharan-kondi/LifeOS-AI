#!/bin/bash
# Seed the LifeOS Postgres database in the correct dependency order
echo "🚀 Running database migrations..."
npx prisma db push

echo "👤 Seeding users..."
npx ts-node src/seed/seedUsers.ts

echo "💸 Seeding transactions (this may take a minute)..."
npx ts-node src/seed/seedTransactions.ts

echo "💳 Seeding subscriptions..."
npx ts-node src/seed/seedSubscriptions.ts

echo "📈 Seeding productivity logs..."
npx ts-node src/seed/seedProductivity.ts

echo "⚠️ Seeding anomalies..."
npx ts-node src/seed/seedAnomalies.ts

echo "✅ Database migrations and seeding completed successfully!"
