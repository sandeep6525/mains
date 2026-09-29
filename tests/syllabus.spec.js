import { test, expect } from '@playwright/test';

test.describe('Syllabus Vertical Slice QA', () => {

  test('API Success and Basic Rendering', async ({ page }) => {
    // Mock the API response to guarantee success/failure testing cleanly.
    await page.route('**/api/v1/public/exams/upsc-cse-mains/subjects', async route => {
      const json = {
        data: [
          { id: 'sub-1', name: 'General Studies I', slug: 'paper-2-gs1', isActive: true },
          { id: 'sub-2', name: 'General Studies II', slug: 'paper-3-gs2', isActive: true }
        ]
      };
      await route.fulfill({ json });
    });

    await page.route('**/api/v1/public/exams/upsc-cse-mains/subjects/paper-2-gs1/topics', async route => {
      const json = {
        data: [
          { id: 'top-1', name: 'Indian Art Forms', slug: 'gs1-art', isActive: true }
        ]
      };
      await route.fulfill({ json });
    });

    await page.route('**/api/v1/public/exams/upsc-cse-mains/subjects/paper-3-gs2/topics', async route => {
      const json = { data: [] };
      await route.fulfill({ json });
    });

    await page.goto('http://localhost:5173');
    
    // We need to click the Syllabus tab if it exists
    const syllabusTab = page.locator('text=Syllabus').first();
    if (await syllabusTab.isVisible()) {
      await syllabusTab.click();
    }
    
    // Check loading state (might be too fast to catch with mocked API, but we can verify Development Fallback is ABSENT)
    await expect(page.locator('text=Development Fallback Mode')).not.toBeVisible();

    // Check if real data rendered
    await expect(page.locator('text=General Studies I').first()).toBeVisible();
    await expect(page.locator('text=Indian Art Forms').first()).toBeVisible();
  });

  test('API Failure and Fallback Mode', async ({ page }) => {
    // Simulate API failure
    await page.route('**/api/v1/public/exams/upsc-cse-mains/subjects', async route => {
      await route.abort('failed');
    });

    await page.goto('http://localhost:5173');
    const syllabusTab = page.locator('text=Syllabus').first();
    if (await syllabusTab.isVisible()) {
      await syllabusTab.click();
    }

    // Should show fallback banner
    await expect(page.locator('text=Development Fallback Mode')).toBeVisible();
    
    // Should render static data (e.g., Essay, GS-I, GS-II, which has specific titles)
    await expect(page.locator('text=PAPER-I').first()).toBeVisible(); 
  });
});
