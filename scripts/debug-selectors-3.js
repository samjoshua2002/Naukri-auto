const { chromium } = require('playwright');
const config = require('./config');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: config.AUTH_FILE });
  const page = await context.newPage();
  await page.goto(config.PROFILE_URL, { waitUntil: 'networkidle' });
  
  console.log("URL:", page.url());
  console.log("Title:", await page.title());
  
  const fileInputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="file"]')).map(el => ({
      id: el.id,
      className: el.className,
      name: el.name
    }));
  });
  console.log("File Inputs:", fileInputs);

  await browser.close();
})();
