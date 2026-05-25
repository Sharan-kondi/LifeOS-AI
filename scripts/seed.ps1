# Seed the LifeOS Postgres database in the correct dependency order for Windows
Write-Host "🚀 Running database migrations..." -ForegroundColor Cyan
npx prisma db push

Write-Host "👤 Seeding users..." -ForegroundColor Cyan
npx ts-node src/seed/seedUsers.ts

Write-Host "💸 Seeding transactions (this may take a minute)..." -ForegroundColor Cyan
npx ts-node src/seed/seedTransactions.ts

Write-Host "💳 Seeding subscriptions..." -ForegroundColor Cyan
npx ts-node src/seed/seedSubscriptions.ts

Write-Host "📈 Seeding productivity logs..." -ForegroundColor Cyan
npx ts-node src/seed/seedProductivity.ts

Write-Host "⚠️ Seeding anomalies..." -ForegroundColor Cyan
npx ts-node src/seed/seedAnomalies.ts

Write-Host "✅ Database migrations and seeding completed successfully!" -ForegroundColor Green
