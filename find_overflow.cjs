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
  await page.waitForTimeout(2000); // Wait for render

  // Function to find overflowing elements
  const overflows = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const allElements = document.querySelectorAll('*');
    const overflowing = [];

    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > docWidth || rect.right > docWidth) {
        let tagInfo = `<${el.tagName.toLowerCase()}`;
        if (el.className && typeof el.className === 'string') tagInfo += ` class="${el.className}"`;
        if (el.id) tagInfo += ` id="${el.id}"`;
        tagInfo += '>';
        overflowing.push({ tag: tagInfo, width: rect.width, right: rect.right, scrollWidth: el.scrollWidth });
      }
    });

    return {
      docWidth,
      scrollWidth: document.documentElement.scrollWidth,
      elements: overflowing
    };
  });

  console.log(JSON.stringify(overflows, null, 2));

  await browser.close();
})();
