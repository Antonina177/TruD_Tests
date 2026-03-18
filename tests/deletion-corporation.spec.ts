import { test, expect } from '@playwright/test';
import { TEST_USERNAME, TEST_PASSWORD, URLS } from '../helpers/constants';
import { generateCorporationName } from '../helpers/randomData';
import { loginAPI } from '../helpers/api-helpers/auth.helper';
import { createCorporationAPI } from '../helpers/api-helpers/corporation.helper';
import { LoginPage } from '../pages/login.page';
import { CorporationsPage } from '../pages/corporations.page';

test.describe('Delete Corporation – API precondition → UI', () => {
  test('should delete a corporation created via API using the UI', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const corporationsPage = new CorporationsPage(page);

    // ── API Precondition: create a corporation to be deleted ──────────────────
    const corporation = await test.step('API precondition: create corporation', async () => {
      const token = await loginAPI(TEST_USERNAME, TEST_PASSWORD);
      const name = generateCorporationName();
      return await createCorporationAPI(token, name);
    });

    // ── Step 1: Open login page ───────────────────────────────────────────────
    await test.step('Open login page', async () => {
      await loginPage.goto();
      await expect(page).toHaveURL(/sign-in/);
    });

    // ── Steps 2–4: Fill credentials and sign in ───────────────────────────────
    await test.step('Fill credentials and sign in', async () => {
      await loginPage.loginAndWaitForNavigation(TEST_USERNAME, TEST_PASSWORD);
      await expect(page).not.toHaveURL(/sign-in/);
    });

    // ── Step 5: Click "Admin" in the sidebar ──────────────────────────────────
    await test.step('Navigate to Admin section via sidebar', async () => {
      await corporationsPage.clickAdminNavLink();
    });

    // ── Step 6: Verify Admin dashboard ───────────────────────────────────────
    await test.step('Verify Admin dashboard page', async () => {
      await expect(page).toHaveURL(URLS.admin);
    });

    // ── Step 7: Click "Corporation Management" card ───────────────────────────
    await test.step('Click Corporation Management card', async () => {
      await corporationsPage.clickCorporationManagementCard();
    });

    // ── Step 8: Verify corporations list page ─────────────────────────────────
    await test.step('Verify redirect to Corporations page', async () => {
      await expect(page).toHaveURL(URLS.corporations);
    });

    // ── Steps 9–10: Find and click the corporation row ────────────────────────
    await test.step(`Find and click corporation row: "${corporation.name}"`, async () => {
      await corporationsPage.clickCorporationRow(corporation.name);
    });

    // ── Steps 11–12: Click "Delete corporation" button ────────────────────────
    await test.step('Click Delete corporation button', async () => {
      await corporationsPage.clickDeleteCorporationButton();
    });

    // ── Step 13: Verify the Delete confirmation modal appears ─────────────────
    await test.step('Verify Delete Corporation modal is visible', async () => {
      await corporationsPage.waitForDeleteModal();
      await expect(corporationsPage.deleteConfirmationModal()).toBeVisible();
    });

    // ── Step 14: Confirm deletion ─────────────────────────────────────────────
    await test.step('Confirm deletion', async () => {
      await corporationsPage.confirmDeletion();
    });

    // ── Step 15: Verify corporation is gone from the list ────────────────────
    await test.step('Verify corporation is removed from the corporations list', async () => {
      await expect(page).toHaveURL(URLS.corporations, { timeout: 10_000 });
      await expect(corporationsPage.corporationTableRow(corporation.name)).toHaveCount(0);
    });
  });
});
