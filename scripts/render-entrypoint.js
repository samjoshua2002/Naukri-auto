/**
 * Render entrypoint — writes auth.json from env var before running upload.
 * Mirrors what the GitHub Actions step does.
 */
const fs = require('fs');
const path = require('path');

const authJson = process.env.NAUKRI_AUTH_JSON;
if (!authJson) {
  console.error('ERROR: NAUKRI_AUTH_JSON environment variable is not set.');
  console.error('Go to Render dashboard → your service → Environment, and add it.');
  process.exit(1);
}

const authPath = path.join(__dirname, '..', 'auth.json');
fs.writeFileSync(authPath, authJson, 'utf8');
console.log(`auth.json written (${authJson.length} bytes)`);

// Hand off to the real upload script
require('./upload.js');
