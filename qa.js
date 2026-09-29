import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  
  const results = {
    errors: [],
    networkFailures: [],
    tabs: {}
  };
  
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.errors.push(msg.text());
    }
  });

  page.on('requestfailed', request => {
    results.networkFailures.push({ url: request.url(), error: request.failure().errorText });
  });
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    // Check navigation items
    const navButtons = await page.locator('nav button');
    const count = await navButtons.count();
    
    for (let i = 0; i < count; i++) {
      const button = navButtons.nth(i);
      const text = await button.textContent();
      await button.click();
      await page.waitForTimeout(500); // Wait for render
      results.tabs[text] = 'Rendered';
    }
    
    // Toggle language
    const langBtn = await page.locator('button[title="Toggle Language (English / Hindi)"]');
    if (await langBtn.count() > 0) {
      await langBtn.click();
      results.languageToggle = 'Clicked';
    }
    
    // Toggle theme
    const themeBtn = await page.locator('button[title="Toggle Theme"]');
    if (await themeBtn.count() > 0) {
      await themeBtn.click();
      results.themeToggle = 'Clicked';
    }

  } catch (e) {
    results.fatal = e.message;
  }
  
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
