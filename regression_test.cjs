const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  
  const results = [];
  const log = (flow, status, issue) => {
    results.push({ flow, status, issue });
  };

  try {
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });

    // Step 1: Open Answer Studio
    await page.locator('nav button').filter({ hasText: 'Answer Studio' }).click();
    await page.waitForTimeout(500);

    // Step 2: Enter unique test answer
    await page.locator('textarea:visible').first().fill('THIS IS MY UNIQUE REGRESSION ANSWER.');

    // Step 3: Start Timer
    const startBtn = page.locator('button').filter({ hasText: 'Start Clock' });
    if (await startBtn.count() > 0) {
      await startBtn.click();
    }
    await page.waitForTimeout(1500); // let it tick

    const qTextBefore = await page.locator('h2').first().textContent();
    
    // Test: Navigate to PYQ Vault & return
    await page.locator('nav button').filter({ hasText: '10Y PYQs & Mocks' }).click();
    await page.waitForTimeout(500);
    await page.locator('nav button').filter({ hasText: 'Answer Studio' }).click();
    await page.waitForTimeout(500);

    let textAfter = await page.locator('textarea:visible').first().inputValue();
    let qTextAfter = await page.locator('h2').first().textContent();

    if (textAfter === 'THIS IS MY UNIQUE REGRESSION ANSWER.' && qTextAfter === qTextBefore) {
      log('Answer Studio -> PYQ Vault -> Answer Studio', 'PASS', 'State preserved perfectly.');
    } else {
      log('Answer Studio -> PYQ Vault -> Answer Studio', 'FAIL', 'State lost!');
    }

    // Test: Navigate to Syllabus & return
    await page.locator('nav button').filter({ hasText: 'Syllabus Matrix' }).click();
    await page.waitForTimeout(500);
    await page.locator('nav button').filter({ hasText: 'Answer Studio' }).click();
    await page.waitForTimeout(500);
    textAfter = await page.locator('textarea:visible').first().inputValue();
    if (textAfter === 'THIS IS MY UNIQUE REGRESSION ANSWER.') {
      log('Answer Studio -> Syllabus -> Answer Studio', 'PASS', 'State preserved perfectly.');
    } else {
      log('Answer Studio -> Syllabus -> Answer Studio', 'FAIL', 'State lost!');
    }

    // Test: Navigate to Analytics & return
    await page.locator('nav button').filter({ hasText: 'Mastery Analytics' }).click();
    await page.waitForTimeout(500);
    await page.locator('nav button').filter({ hasText: 'Answer Studio' }).click();
    await page.waitForTimeout(500);
    textAfter = await page.locator('textarea:visible').first().inputValue();
    if (textAfter === 'THIS IS MY UNIQUE REGRESSION ANSWER.') {
      log('Answer Studio -> Analytics -> Answer Studio', 'PASS', 'State preserved perfectly.');
    } else {
      log('Answer Studio -> Analytics -> Answer Studio', 'FAIL', 'State lost!');
    }

  } catch (e) {
    console.error(e);
  } finally {
    console.log(JSON.stringify(results, null, 2));
    await browser.close();
  }
})();
