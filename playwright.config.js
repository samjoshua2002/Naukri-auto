const { defineConfig } = require('playwright');

module.exports = defineConfig({
  timeout: 60000,
  use: {
    browserName: 'chromium',
    ignoreHTTPSErrors: true,
  },
});
