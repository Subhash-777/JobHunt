const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://example.com');
    console.log("PLAYWRIGHT_SUCCESS: " + await page.title());
    await browser.close();
  } catch (e) {
    console.error("PLAYWRIGHT_ERROR:", e.message);
    process.exit(1);
  }
})();
