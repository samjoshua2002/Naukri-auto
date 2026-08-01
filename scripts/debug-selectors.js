const { chromium } = require('playwright');
const config = require('./config');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: config.AUTH_FILE });
  const page = await context.newPage();
  await page.goto(config.PROFILE_URL, { waitUntil: 'networkidle' });
  
  const fileInputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="file"]')).map(el => ({
      id: el.id,
      className: el.className,
      name: el.name
    }));
  });
  console.log("File Inputs:", fileInputs);
  
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a, input[type="button"], div[role="button"]'))
      .filter(el => el.innerText && el.innerText.toLowerCase().includes('resume'))
      .map(el => ({
        tagName: el.tagName,
        text: el.innerText.trim(),
        id: el.id,
        className: el.className
      }));
  });
  console.log("Resume Buttons:", buttons);

  await browser.close();
})();
