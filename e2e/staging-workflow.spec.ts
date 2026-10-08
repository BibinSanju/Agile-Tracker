import { test, expect } from '@playwright/test';

test.describe('Faculty Staging Curation & Moodle XML Export Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staging');
  });

  test('Renders staging queue with sample curated questions and 10/10 sandbox status', async ({ page }) => {
    await expect(page.locator('.breadcrumb-current')).toContainText('Faculty Question Staging & Review Queue');
    await expect(page.locator('text=Shortest Path in Binary Matrix')).toBeVisible();
    await expect(page.locator('text=10/10 Passed').first()).toBeVisible();
  });

  test('Allows bulk checkbox selection and approves question to category', async ({ page }) => {
    // Select first question checkbox
    const firstCheckbox = page.locator('input[type="checkbox"]').nth(1);
    await firstCheckbox.click();

    // Verify bulk approve button is active
    const approveBtn = page.locator('button:has-text("Approve Selected")');
    await expect(approveBtn).toBeEnabled();

    // Click Approve
    await approveBtn.click();

    // Toast notification should appear
    await expect(page.locator('text=Successfully approved')).toBeVisible();
  });

  test('Opens question inspector to view description, 10 testcases and reference code', async ({ page }) => {
    // Click inspect on first question
    await page.locator('button:has-text("Inspect")').first().click();

    // Modal should be visible
    await expect(page.locator('.plane-modal')).toBeVisible();
    await expect(page.locator('text=VERIFIED I/O TEST CASES')).toBeVisible();
    await expect(page.locator('text=REFERENCE SOLUTION')).toBeVisible();

    // Close modal
    await page.click('.plane-modal-header button');
    await expect(page.locator('.plane-modal')).not.toBeVisible();
  });

  test('Allows a user to ingest a question as plain text', async ({ page }) => {
    let submitted: Record<string, unknown> | undefined;

    await page.route('**/api/staging/questions', async route => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      submitted = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'manual-001',
            title: 'Find the first repeated number',
            description: 'Find the first repeated number in an integer array and return -1 when every value is unique.',
            source: 'Student_Interview',
            difficulty: 'Medium',
            suggestedCategory: 'DSA/Graphs/Breadth First Search (BFS)',
            confirmedCategory: 'DSA/Graphs/Breadth First Search (BFS)',
            status: 'PENDING_REVIEW',
            similarityScore: 0,
            isDuplicate: false,
            timeLimitSeconds: 2,
            memoryLimitMb: 128,
            referenceSolution: {},
            testCases: [],
            testPassRate: 'Pending',
            sandboxStatus: 'PENDING',
            submittedAt: new Date().toISOString()
          },
          processing: {
            mode: 'ai',
            duplicateChecked: true,
            assetsGenerated: true,
            warnings: []
          }
        })
      });
    });

    const question = 'Find the first repeated number in an integer array and return -1 when every value is unique.';
    await page.getByLabel('QUESTION TEXT *').fill(question);
    await page.getByRole('button', { name: 'Add to review queue' }).click();

    await expect(page.getByText(/Added "Find the first repeated number".*AI formalized, duplicate checked/)).toBeVisible();
    await expect(page.getByText('Find the first repeated number', { exact: true })).toBeVisible();
    expect(submitted).toMatchObject({ text: question, difficulty: 'Medium', source: 'Student_Interview' });
  });
});
