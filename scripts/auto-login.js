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
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for visible, interactive form fields — avoids acting on hidden tab elements
    await page.waitForSelector('#usernameField', { state: 'visible', timeout: 10000 });

    // Simulate human-like typing to reduce bot-detection risk
    await page.click('#usernameField');
    await page.waitForTimeout(300);
    await page.type('#usernameField', email, { delay: 80 });

    await page.waitForTimeout(500);
    await page.click('#passwordField');
    await page.waitForTimeout(300);
    await page.type('#passwordField', password, { delay: 80 });
    await page.waitForTimeout(800);

    logger.info('Submitting login form...');

    // Press Enter on the active field — more reliable than clicking the button
    // when bot-detection mechanisms intercept programmatic button clicks.
    await page.keyboard.press('Enter');

    // Wait up to 20 s for URL to change away from the login page.
    // Using .then/.catch avoids a hard throw on timeout so we can log diagnostics.
    const navigated = await page.waitForFunction(
      () => !window.location.href.includes('nlogin'),
      null,
      { timeout: 20000 }
    ).then(() => true).catch(() => false);

    if (!navigated) {
      // Capture the form error text to surface why the login failed
      const formError = await page.evaluate(() => {
        const el = document.querySelector('.errlabel, .err-txt, [class*="loginError"], [class*="error"]');
        return el ? el.textContent.trim() : null;
      }).catch(() => null);

      const diagnosis = formError
        ? `Login form error: "${formError}"`
        : 'Login did not redirect away from login page — possible CAPTCHA or bot-block';
      throw new Error(diagnosis);
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
