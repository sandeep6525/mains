import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  
  const results = {
    startup: {},
    navigation: {},
    theme: {},
    language: {},
    responsive: {},
    modals: {},
    simulator: {},
    consoleErrors: []
  };

  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. STARTUP
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    results.startup.load = 'PASS';
    
    // 2. HEADER NAVIGATION & REFRESH
    const navItems = ['Answer Studio', '10Y PYQs & Mocks', 'Syllabus Matrix', '3-Hour Simulator', 'Current Affairs', 'Optionals (15)', 'Mastery Analytics'];
    
    for (const item of navItems) {
      const btn = page.locator('nav button').filter({ hasText: item });
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(300);
        results.navigation[item] = 'PASS';
      } else {
        results.navigation[item] = 'FAIL (Not found)';
      }
    }
    
    // 3. THEME
    const themeBtn = page.locator('button[title="Toggle Theme"]');
    if (await themeBtn.count() > 0) {
      await themeBtn.click();
      results.theme.toggle1 = 'PASS';
      await themeBtn.click();
      results.theme.toggle2 = 'PASS';
    }

    // 4. LANGUAGE
    const langBtn = page.locator('button[title="Toggle Language (English / Hindi)"]');
    if (await langBtn.count() > 0) {
      await langBtn.click();
      results.language.hindi = 'PASS';
      await langBtn.click();
      results.language.english = 'PASS';
    }
    
    // 5. SIMULATOR
    await page.locator('nav button').filter({ hasText: '3-Hour Simulator' }).click();
    await page.waitForTimeout(500);
    
    // Try to click Start Paper Clock
    const startClockBtn = page.locator('button').filter({ hasText: 'Start Paper Clock' });
    if (await startClockBtn.count() > 0) {
      await startClockBtn.click();
      results.simulator.clockStarted = 'PASS';
      await page.waitForTimeout(2000); // Wait 2s to check timer decrease
      
      const resetBtn = page.locator('button').filter({ hasText: 'Reset' });
      if (await resetBtn.count() > 0) {
        await resetBtn.click();
        results.simulator.clockReset = 'PASS';
      }
    } else {
      results.simulator.clockStarted = 'FAIL (Not found)';
    }

    // Try typing an answer
    const textarea = page.locator('textarea:visible').first();
    if (await textarea.count() > 0) {
      await textarea.fill('This is a test answer for QA purposes.');
      results.simulator.typeAnswer = 'PASS';
    } else {
      results.simulator.typeAnswer = 'FAIL (No textarea)';
    }
    const flagBtn = page.locator('button').filter({ hasText: 'Flag for Review' });
    if (await flagBtn.count() > 0) {
      await flagBtn.click();
      results.simulator.flag = 'PASS';
    }

    // Question Palette clicking
    const qBtn = page.locator('button', { hasText: /^Q2$/ }).first();
    if (await qBtn.count() > 0) {
      await qBtn.click();
      results.simulator.q2_navigation = 'PASS';
    }

    // 6. MODAL (OCR Modal Test)
    const ocrBtn = page.locator('button').filter({ hasText: 'OCR Ingest' });
    if (await ocrBtn.count() === 0) {
      // maybe check Answer studio
      await page.locator('nav button').filter({ hasText: 'Answer Studio' }).click();
      await page.waitForTimeout(500);
    }
    const ocrBtn2 = page.locator('button', { hasText: /OCR|Scan/i }).first();
    if (await ocrBtn2.count() > 0) {
      await ocrBtn2.click();
      await page.waitForTimeout(500);
      const closeBtn = page.locator('button').filter({ hasText: 'Close' });
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        results.modals.ocrClose = 'PASS';
      } else {
        // try X button or esc
        await page.keyboard.press('Escape');
        results.modals.ocrClose = 'ESCAPED';
      }
    }
    
    // 7. RESPONSIVE
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 1024, height: 768 }
    ];
    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(500);
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
              overflowing.push({ tag: tagInfo, width: rect.width, right: rect.right, scrollW: el.scrollWidth });
            }
          });
        }
        return { isOverflow: scrollW > docWidth, scrollW, docWidth, overflowing };
      });
      
      results.responsive[`${vp.width}x${vp.height}`] = overflowInfo.isOverflow 
        ? `FAIL (Overflow: ${overflowInfo.scrollW} > ${overflowInfo.docWidth}). Elements: ${JSON.stringify(overflowInfo.overflowing.slice(-3))}` 
        : 'PASS';
    }

  } catch (e) {
    results.fatal = e.message;
  }
  
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
