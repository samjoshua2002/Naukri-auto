const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const fs = require('fs-extra');
const config = require('./config');
const logger = require('./logger');
const selectors = require('./selectors');
const { retry, takeScreenshot, waitForPageReady } = require('./utils');

const runUpload = async () => {
  logger.info('Starting resume upload process...');

  if (!await fs.pathExists(config.AUTH_FILE)) {
    throw new Error('MISSING_AUTH: auth.json not found. Please run npm run login first.');
  }

  if (!await fs.pathExists(config.RESUME_PATH)) {
    throw new Error(`MISSING_RESUME: Resume file not found at ${config.RESUME_PATH}`);
  }

  const browser = await chromium.launch({ headless: config.HEADLESS });
  const context = await browser.newContext({ storageState: config.AUTH_FILE });
  const page = await context.newPage();

  try {
    await page.goto(config.PROFILE_URL, { waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);

    // Detect if login expired
    if (page.url().includes('login')) {
      throw new Error('LOGIN EXPIRED: Please run npm run login to authenticate again.');
    }

    logger.info('Successfully accessed profile page.');

    // Wait for the file input to be available in the DOM
    await page.waitForSelector(selectors.FILE_INPUT, { state: 'attached', timeout: 15000 });
    
    logger.info('Uploading resume...');
    await page.setInputFiles(selectors.FILE_INPUT, config.RESUME_PATH);

    logger.info('Waiting for upload to complete...');
    
    try {
      await page.waitForSelector(selectors.SUCCESS_TOAST, { state: 'visible', timeout: 15000 });
      logger.info('Success toast detected.');
    } catch (e) {
      logger.warn('Success toast not detected within timeout. The upload might still have succeeded.');
    }

    await takeScreenshot(page, 'success');
    logger.info('Resume uploaded successfully.');

  } catch (error) {
    logger.error(`Upload failed: ${error.message}`);
    await takeScreenshot(page, 'error').catch(() => {});
    throw error;
  } finally {
    await browser.close();
  }
};

(async () => {
  try {
    await fs.ensureDir(config.LOG_FOLDER);
    await retry(runUpload, config.MAX_RETRIES);
    logger.info('Automation completed successfully.');
  } catch (error) {
    logger.error(`Automation aborted.`);
    process.exit(1);
  }
})();
