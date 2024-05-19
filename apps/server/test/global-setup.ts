import { execSync } from 'child_process';
import { resolve } from 'path';

export default async () => {
  // Manually set the environment variable for the test database
  process.env.DATABASE_URL = 'file:./test.db';

  const schemaPath = resolve(__dirname, '../../../packages/database/prisma/schema.prisma');
  console.log('Resolved schema path:', schemaPath);
  console.log('Running migrations...');

  try {
    execSync(`npx prisma migrate dev --name init --schema=${schemaPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};