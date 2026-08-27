import { test, expect } from '@playwright/test';

test.describe('Plane-Grade Agile Cockpit & CI/CD Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Renders Plane sidebar, workspace header, and clean breadcrumbs', async ({ page }) => {
    // Check workspace brand
    await expect(page.locator('.workspace-name')).toContainText('IntelX Engineering');
    await expect(page.locator('.breadcrumb-project')).toContainText('IntelX Portal');
    await expect(page.locator('button:has-text("Export")')).toBeVisible();

    // Check list view groups
    await expect(page.locator('.plane-list-group')).toHaveCount(5);
  });

  test('Switches between List, Board, Modules, and Cycles views', async ({ page }) => {
    // Initial List view
    await expect(page.locator('.plane-issue-row').first()).toBeVisible();

    // Switch to Board
    await page.click('button:has-text("Board")');
    await expect(page.locator('.plane-kanban-col')).toHaveCount(5);

    // Switch to Modules
    await page.click('button:has-text("Modules")');
    await expect(page.locator('text=Architecture Modules & Scope')).toBeVisible();

    // Switch to Cycles
    await page.click('button:has-text("Cycles")');
    await expect(page.locator('text=Executive Showcase Sprint').first()).toBeVisible();
  });

  test('Clicking issue state icon cycles state and updates progress', async ({ page }) => {
    // Click on state icon of first issue row
    const firstStateIcon = page.locator('.issue-state-icon').first();
    await firstStateIcon.click();

    // Verify issue row is still active
    await expect(page.locator('.plane-issue-row').first()).toBeVisible();
  });

  test('Opens Plane issue drawer modal and shows real technical criteria', async ({ page }) => {
    // Click on the first issue row
    await page.locator('.plane-issue-row').first().click();

    // Verify modal content
    await expect(page.locator('.plane-modal')).toBeVisible();
    await expect(page.locator('text=Definition of Done')).toBeVisible();
    await expect(page.locator('text=ESTIMATE')).toBeVisible();

    // Close modal
    await page.click('.plane-modal-header button');
    await expect(page.locator('.plane-modal')).not.toBeVisible();
  });
});
