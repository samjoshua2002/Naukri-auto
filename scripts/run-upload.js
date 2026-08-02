#!/usr/bin/env node
/**
 * run-upload.js
 * Wrapper for launchd: resolves absolute paths, loads .env, and runs the upload.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectDir = path.join(__dirname, '..');
const logFile = path.join(projectDir, 'logs', 'launchd.log');
const nodePath = '/opt/homebrew/bin';

// Ensure launchd can find node, npm, and playwright binaries
const env = {
  ...process.env,
  PATH: `${nodePath}:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}`,
};

const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(line);
  fs.appendFileSync(logFile, line);
};

try {
  fs.mkdirSync(path.join(projectDir, 'logs'), { recursive: true });
  log('launchd triggered upload run...');
  execSync('node scripts/upload.js', { 
    cwd: projectDir, 
    stdio: 'inherit',
    env,
  });
  log('Upload completed successfully.');
} catch (err) {
  log(`Upload failed: ${err.message}`);
  process.exit(1);
}
