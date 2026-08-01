require('dotenv').config();
const path = require('path');

module.exports = {
  HEADLESS: process.env.HEADLESS !== 'false',
  PROFILE_URL: process.env.PROFILE_URL || 'https://www.naukri.com/mnjuser/profile',
  RESUME_PATH: path.join(__dirname, '..', 'resume', 'resume.pdf'),
  MAX_RETRIES: 3,
  SCREENSHOT_FOLDER: path.join(__dirname, '..', 'screenshots'),
  LOG_FOLDER: path.join(__dirname, '..', 'logs'),
  AUTH_FILE: path.join(__dirname, '..', 'auth.json'),
};
