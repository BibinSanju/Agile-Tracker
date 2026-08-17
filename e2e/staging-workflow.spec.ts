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
    await expect(page.locator('text=10 VERIFIED I/O TESTCASES')).toBeVisible();
    await expect(page.locator('text=OPTIMAL CODE')).toBeVisible();

    // Close modal
    await page.click('.plane-modal-header button');
    await expect(page.locator('.plane-modal')).not.toBeVisible();
  });
});
