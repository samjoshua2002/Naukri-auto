/**
 * Auto-login using NAUKRI_EMAIL + NAUKRI_PASSWORD env vars.
 * Called automatically by upload.js when session is detected as expired.
 */
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs-extra');
const config = require('./config');
const logger = require('./logger');

const autoLogin = async () => {
  const email = process.env.NAUKRI_EMAIL;
  const password = process.env.NAUKRI_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'AUTO_LOGIN_FAILED: NAUKRI_EMAIL and NAUKRI_PASSWORD env vars must be set. ' +
      'Add them in CircleCI → Project Settings → Environment Variables.'
    );
  }

  logger.info('Session expired. Attempting auto-login...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Fill login form
    await page.waitForSelector('#usernameField', { timeout: 10000 });
    await page.fill('#usernameField', email);
    await page.fill('#passwordField', password);

    // Click login button
    await page.click('button[type="submit"]');

    // Poll for URL change instead of waiting for a navigation event.
    // waitForNavigation only fires on full-page loads, not SPA History API routing.
    // waitForURL in playwright-extra ignores waitUntil/timeout options.
    // Polling via waitForFunction handles both navigation types reliably.
    await page.waitForFunction(
      () => !window.location.href.includes('/nlogin/'),
      { timeout: 90000, polling: 500 }
    );

    if (page.url().includes('nlogin')) {
      throw new Error('Login did not redirect away from login page');
    }

    logger.info('Auto-login successful. Saving session...');

    await fs.ensureDir(require('path').dirname(config.AUTH_FILE));
    await context.storageState({ path: config.AUTH_FILE });

    logger.info('New session saved to auth.json');
    return true;

  } catch (error) {
    // Take a screenshot to debug login failure
    await page.screenshot({ path: require('path').join(config.SCREENSHOT_FOLDER, 'login-failure.png') }).catch(() => {});
    throw new Error(`Auto-login failed: ${error.message}. Check credentials and screenshot.`);
  } finally {
    await browser.close();
  }
};

module.exports = { autoLogin };
