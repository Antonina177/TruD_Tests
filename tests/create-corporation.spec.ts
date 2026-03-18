import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { CorporationsPage } from '../pages/corporations.page';
import { generateCorporationName } from '../helpers/randomData';
import { TEST_USERNAME, TEST_PASSWORD, URLS } from '../helpers/constants';

// ─── Test ─────────────────────────────────────────────────────────────────────

test.describe('Create Corporation E2E Test', () => {
  test('should create a new corporation successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const corporationsPage = new CorporationsPage(page);
    const corporationName = generateCorporationName();

    // ── Step 1: Open the login page ──────────────────────────────────────────
    await test.step('Open login page', async () => {
      await loginPage.goto();
      await expect(page).toHaveURL(/sign-in/);
      await expect(loginPage.usernameInput()).toBeVisible();
      await expect(loginPage.passwordInput()).toBeVisible();
    });

    // ── Step 2–4: Fill credentials and sign in ───────────────────────────────
    await test.step('Fill credentials and sign in', async () => {
      await loginPage.loginAndWaitForNavigation(TEST_USERNAME, TEST_PASSWORD);
      await expect(page).not.toHaveURL(/sign-in/);
    });

    // ── Step 5: Click "Admin" in the sidebar ─────────────────────────────────
    await test.step('Navigate to Admin section via sidebar', async () => {
      await corporationsPage.clickAdminNavLink();
    });

    // ── Step 6: Verify Admin dashboard URL ───────────────────────────────────
    await test.step('Verify Admin dashboard page', async () => {
      await expect(page).toHaveURL(URLS.admin);
    });

    // ── Step 7: Click "Corporation Management" card ──────────────────────────
    await test.step('Click Corporation Management card', async () => {
      await corporationsPage.clickCorporationManagementCard();
    });

    // ── Step 8: Verify corporations list URL ─────────────────────────────────
    await test.step('Verify redirect to Corporations page', async () => {
      await expect(page).toHaveURL(URLS.corporations);
    });

    // ── Step 9: Open "New Corporation" modal ─────────────────────────────────
    await test.step('Open New Corporation modal', async () => {
      await corporationsPage.openNewCorporationModal();
      await expect(corporationsPage.modal()).toBeVisible({ timeout: 5_000 });
    });

    // ── Step 10: Fill Corporation Name ───────────────────────────────────────
    await test.step(`Fill Corporation Name with "${corporationName}"`, async () => {
      await corporationsPage.fillCorporationName(corporationName);
      await expect(corporationsPage.corporationNameInput()).toHaveValue(corporationName);
    });

    // ── Step 11: Click "Create" button ───────────────────────────────────────
    await test.step('Submit: click Create button', async () => {
      await expect(corporationsPage.createButton()).toBeEnabled();
      await corporationsPage.submitCreateCorporation();
    });

    // ── Expected Results ─────────────────────────────────────────────────────
    await test.step('Verify corporation was created successfully', async () => {
      // Modal closes after successful creation
      await expect(corporationsPage.modal()).toBeHidden({ timeout: 10_000 });

      // User must remain on the corporations page
      await expect(page).toHaveURL(URLS.corporations);

      // No error banner should be visible
      await expect(corporationsPage.errorBanner()).toHaveCount(0);

      // The newly created corporation should appear in the list
      await expect(corporationsPage.corporationRow(corporationName)).toBeVisible({ timeout: 10_000 });
    });
  });
});
