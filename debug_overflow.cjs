const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({
    viewport: { width: 375, height: 812 }
  });

  await page.goto('http://localhost:5173');
  await page.locator('nav button').filter({ hasText: '3-Hour Simulator' }).click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'simulator_overflow.png', fullPage: true });

  const overflowInfo = await page.evaluate(() => {
    const docWidth = window.innerWidth;
    const scrollW = document.documentElement.scrollWidth;
    const overflowing = [];
    if (scrollW > docWidth) {
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > docWidth || rect.right > docWidth) {
          let tagInfo = `<${el.tagName.toLowerCase()}`;
          if (el.className && typeof el.className === 'string') tagInfo += ` class="${el.className}"`;
          if (el.id) tagInfo += ` id="${el.id}"`;
          tagInfo += '>';
          overflowing.push({ tag: tagInfo, width: rect.width, right: rect.right, scrollW: el.scrollWidth, outerHTML: el.outerHTML.substring(0, 100) });
        }
      });
    }
    return { isOverflow: scrollW > docWidth, scrollW, docWidth, overflowing };
  });

  console.log(JSON.stringify(overflowInfo, null, 2));

  await browser.close();
})();
