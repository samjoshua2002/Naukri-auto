const path = require('path');
const fs = require('fs-extra');
const config = require('./config');
const logger = require('./logger');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitForPageReady = async (page) => {
  await page.waitForLoadState('domcontentloaded');
  // Optional: wait for network idle but ignore timeout if it doesn't happen
  await page.waitForLoadState('networkidle').catch(() => {});
};

const takeScreenshot = async (page, prefix) => {
  try {
    await fs.ensureDir(config.SCREENSHOT_FOLDER);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${prefix}-${timestamp}.png`;
    const filepath = path.join(config.SCREENSHOT_FOLDER, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    logger.info(`Screenshot saved: ${filepath}`);
    return filepath;
  } catch (error) {
    logger.error(`Failed to take screenshot: ${error.message}`);
  }
};

const retry = async (fn, retries = config.MAX_RETRIES) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      logger.warn(`Attempt ${attempt} failed: ${error.message}`);
      
      // Do NOT retry for certain fatal errors
      if (
        error.message.includes('LOGIN EXPIRED') || 
        error.message.includes('MISSING_AUTH') || 
        error.message.includes('MISSING_RESUME')
      ) {
        throw error;
      }
      
      if (attempt >= retries) {
        throw error;
      }
      
      await sleep(2000 * attempt);
    }
  }
};

const isLoggedIn = async (page) => {
  return !page.url().includes('login');
};

module.exports = {
  sleep,
  waitForPageReady,
  takeScreenshot,
  retry,
  isLoggedIn
};
