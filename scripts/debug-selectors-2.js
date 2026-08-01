const { chromium } = require('playwright');
const config = require('./config');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: config.AUTH_FILE });
  const page = await context.newPage();
  await page.goto(config.PROFILE_URL, { waitUntil: 'networkidle' });
  
  console.log("URL:", page.url());
  console.log("Title:", await page.title());
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log("Body text prefix:", text);
  
  await browser.close();
})();
