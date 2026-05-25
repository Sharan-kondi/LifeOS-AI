const { execSync } = require('child_process');

const commands = [
  { name: 'Prisma Schema Push', cmd: 'npx prisma db push' },
  { name: 'Seed Users', cmd: 'npx ts-node src/seed/seedUsers.ts' },
  { name: 'Seed Transactions', cmd: 'npx ts-node src/seed/seedTransactions.ts' },
  { name: 'Seed Subscriptions', cmd: 'npx ts-node src/seed/seedSubscriptions.ts' },
  { name: 'Seed Productivity Logs', cmd: 'npx ts-node src/seed/seedProductivity.ts' },
  { name: 'Seed Anomalies', cmd: 'npx ts-node src/seed/seedAnomalies.ts' }
];

function runSeeding() {
  console.log("🚀 Starting database migrations and seeding process...\n");
  
  for (const step of commands) {
    console.log(`--------------------------------------------------`);
    console.log(`👉 Running: ${step.name}`);
    console.log(`Command: ${step.cmd}`);
    console.log(`--------------------------------------------------`);
    try {
      execSync(step.cmd, { stdio: 'inherit' });
      console.log(`\n✅ ${step.name} completed successfully!\n`);
    } catch (error) {
      console.error(`\n❌ Error executing ${step.name}:`, error.message);
      process.exit(1);
    }
  }
  
  console.log("==================================================");
  console.log("🎉 Database migration and seeding fully complete!");
  console.log("==================================================");
}

runSeeding();
