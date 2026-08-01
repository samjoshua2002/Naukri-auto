const { chromium } = require('playwright');
const config = require('./config');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--disable-blink-features=AutomationControlled'] });
  const context = await browser.newContext({
    storageState: config.AUTH_FILE,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  await page.goto(config.PROFILE_URL, { waitUntil: 'networkidle' });
  
  console.log("URL:", page.url());
  console.log("Title:", await page.title());
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log("Body text prefix:", text);
  
  await browser.close();
})();
