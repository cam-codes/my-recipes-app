import { execSync } from 'child_process';
import path from 'path';

const isCI = !!process.env.CI;
const __dirname = import.meta.dirname;
const STARTUP_SCRIPT = isCI
  ? path.join(__dirname, '..', '..', 'ci-up.sh')
  : path.join(__dirname, '..', '..', 'dev-up.sh'); // path to script

export default async function globalSetup() {
  console.log(`Starting app with ${STARTUP_SCRIPT}...`);

  try {
    // Build + up containers
    execSync(`bash ${STARTUP_SCRIPT}`, { stdio: 'inherit' });

    // This polls until /health returns 200
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        execSync('curl -f http://localhost:5173/api/health', { stdio: 'ignore' });
        console.log('Frontend healthy!');
        return;
      } catch {
        console.log(`Waiting for frontend... (${i + 1}/${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    throw new Error('Frontend failed to become healthy');
  } catch (error) {
    console.error('Failed to start app:', error);
    process.exit(1);
  }
}
