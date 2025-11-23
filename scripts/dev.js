import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Function to run a command
const runProcess = (name, command, args) => {
  const child = spawn(command, args, {
    stdio: 'pipe',
    shell: true, // Use shell to ensure npm is found
    cwd: rootDir,
    env: { ...process.env, FORCE_COLOR: 'true' }
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log(`[${name}] ${line.trim()}`);
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.error(`[${name}] ${line.trim()}`);
    });
  });

  child.on('close', (code) => {
    console.log(`[${name}] process exited with code ${code}`);
  });

  return child;
};

console.log('Starting Protezione Civile App (Client + Server)...');

// Start Server
const server = runProcess('SERVER', 'npm', ['run', 'dev:server']);

// Start Client
const client = runProcess('CLIENT', 'npm', ['run', 'dev:client']);

// Handle exit
const cleanup = () => {
  console.log('\nStopping processes...');
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
