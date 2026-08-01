const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const readline = require('readline');
const fs = require('fs-extra');
const config = require('./config');
const logger = require('./logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

(async () => {
  logger.info('Starting manual login process...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://www.naukri.com/');
    logger.info('Please log in manually in the opened browser window.');
    
    await askQuestion('Press ENTER here in the terminal after you have successfully logged in...');
    
    // Save state
    await fs.ensureDir(require('path').dirname(config.AUTH_FILE));
    await context.storageState({ path: config.AUTH_FILE });
    logger.info(`Session saved successfully to ${config.AUTH_FILE}`);
  } catch (error) {
    logger.error(`Login process failed: ${error.message}`, error);
  } finally {
    await browser.close();
    rl.close();
  }
})();
