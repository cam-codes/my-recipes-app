import { execSync } from 'child_process';
import path from 'path';

export default async function globalTeardown() {
  console.log('Stopping app...');
  const __dirname = import.meta.dirname;
  const composePath = path.join(__dirname, '..', '..');

  try {
    // Down containers cleanly
    execSync(
      `docker-compose -f ${composePath}/docker-compose.yml -f ${composePath}/docker-compose.local.yml down`,
      { stdio: 'inherit' },
    );
    console.log('App stopped');
  } catch (error) {
    console.error('Failed to stop app:', error);
  }
}
