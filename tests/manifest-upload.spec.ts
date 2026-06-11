import { test, expect }   from '@playwright/test';
import { ManifestPage }   from '../pages/manifest.page';
import { PORTAL_BASE_URL, PORTAL_USERNAME, PORTAL_PASSWORD, BASE_URL, TEST_USERNAME, TEST_PASSWORD, CUSTOMER_SEARCH } from '../helpers/constants';
import {
  generateBarcode,
  generatePatientId,
  todayFormatted,
  randomFirstName,
  randomLastName,
} from '../helpers/randomData';
import { LoginPage }      from '../pages/login.page';

const DOB              = '11111999';  // ddmmyyyy digits — browser auto-advances segments
const SUCCESS_MESSAGE  =
  'Your sample has been successfully sent. Please see your Manifest Orders Requests page for a status update. We will reach out if we need more information or when it has been approved.';

test.describe('Manifest Upload – Create Order', () => {
  test('should submit a manifest order with one sample successfully', async ({ page }) => {
    const manifest   = new ManifestPage(page);
    const barcode    = generateBarcode();
    const patientId  = generatePatientId();
    const firstName  = randomFirstName();
    const lastName   = randomLastName();
    const today      = todayFormatted();

    // ── Step 1-4: Navigate to portal and log in ────────────────────────────
    await test.step('Navigate to portal sign-in page', async () => {
      await page.goto(`${PORTAL_BASE_URL}/sign-in`);
      await expect(page).toHaveURL(/sign-in/);
    });

    await test.step('Log in with portal credentials', async () => {
      await manifest.emailInput().waitFor({ state: 'visible', timeout: 10000 });
      await manifest.login(PORTAL_USERNAME, PORTAL_PASSWORD);
    });

    // ── Step 5: Wait for dashboard redirect ───────────────────────────────
    await test.step('Wait for redirect to dashboard', async () => {
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
      await expect(page).toHaveURL(/dashboard/);
    });

    // ── Step 6: Click "Create Order" in the nav ───────────────────────────
    await test.step('Click Create Order nav link', async () => {
      await manifest.createOrderLink().waitFor({ state: 'visible', timeout: 10000 });
      await manifest.createOrderLink().click();
    });

    // ── Step 7: Click "Submit & register samples" tab and wait for upload page ──
    await test.step('Click Submit & register samples tab and wait for manifest/upload page', async () => {
      await manifest.submitRegisterTab().waitFor({ state: 'visible', timeout: 10000 });
      await manifest.submitRegisterTab().click();
      await page.waitForURL(/\/manifest\/upload/, { timeout: 15000 });
      await expect(page).toHaveURL(/manifest\/upload/);
      await page.waitForLoadState('domcontentloaded');
    });

    // ── Step 8: Enter Kit ID (16-char uppercase barcode) ──────────────────
    await test.step(`Enter Kit ID: ${barcode}`, async () => {
      await manifest.kitIdInput().waitFor({ state: 'visible', timeout: 20000 });
      await manifest.kitIdInput().click();
      await manifest.kitIdInput().fill(barcode);
    });

    // ── Steps 9-10: Select product type → TruHealth ───────────────────────
    await test.step('Select product type: TruHealth', async () => {
      await manifest.productSelect().waitFor({ state: 'visible', timeout: 10000 });
      await manifest.selectProduct();
    });

    // ── Steps 11-12: Enter collection date (today) ────────────────────────
    await test.step(`Enter collection date: ${today}`, async () => {
      await manifest.collectionDateInput().waitFor({ state: 'visible', timeout: 5000 });
      await manifest.fillDate(() => manifest.collectionDateInput(), today);
    });

    // ── Steps 13-14: Enter date of birth ──────────────────────────────────
    await test.step(`Enter date of birth: ${DOB}`, async () => {
      await manifest.dobInput().waitFor({ state: 'visible', timeout: 5000 });
      await manifest.fillDate(() => manifest.dobInput(), DOB);
    });

    // ── Steps 15-16: Select sex → Female ─────────────────────────────────
    await test.step('Select sex: F (Female)', async () => {
      await manifest.sexSelect().scrollIntoViewIfNeeded();
      await manifest.selectFemale();
    });

    // ── Steps 17-18: Enter Patient ID ─────────────────────────────────────
    await test.step(`Enter Patient ID: ${patientId}`, async () => {
      await manifest.patientIdInput().waitFor({ state: 'visible', timeout: 5000 });
      await manifest.patientIdInput().fill(patientId);
    });

    // ── Steps 19-20: Enter first name ─────────────────────────────────────
    await test.step(`Enter first name: ${firstName}`, async () => {
      await manifest.firstNameInput().waitFor({ state: 'visible', timeout: 5000 });
      await manifest.firstNameInput().fill(firstName);
    });

    // ── Steps 21-22: Enter last name ──────────────────────────────────────
    await test.step(`Enter last name: ${lastName}`, async () => {
      await manifest.lastNameInput().waitFor({ state: 'visible', timeout: 5000 });
      await manifest.lastNameInput().fill(lastName);
    });

    // ── Step 23: Remove row 3 ─────────────────────────────────────────────
    await test.step('Remove row 3 (click × button)', async () => {
      await manifest.removeRow3Button().waitFor({ state: 'visible', timeout: 5000 });
      await manifest.removeRow3Button().click();
    });

    // ── Step 24: Remove row 4 ─────────────────────────────────────────────
    await test.step('Remove row 4 (click × button)', async () => {
      await manifest.removeRow4Button().waitFor({ state: 'visible', timeout: 5000 });
      await manifest.removeRow4Button().click();
    });

    // ── Step 25: Scroll down and click Submit & Register Samples ──────────
    await test.step('Submit the manifest order', async () => {
      await manifest.submitButton().scrollIntoViewIfNeeded();
      await manifest.submitButton().waitFor({ state: 'visible', timeout: 5000 });
      await manifest.submitButton().click();
    });

    // ── Step 26: Assert success banner ────────────────────────────────────
    await test.step('Verify success message is displayed', async () => {
      await manifest.successHeading().waitFor({ state: 'visible', timeout: 15000 });
      await expect(manifest.successHeading()).toHaveText('Success!');
      await expect(page.getByText(SUCCESS_MESSAGE)).toBeVisible({ timeout: 10000 });
    });

    // ── Admin portal: log in ───────────────────────────────────────────────
    await test.step('Navigate to admin portal sign-in page', async () => {
      const loginPage = new LoginPage(page);
      await page.goto(`${BASE_URL}/sign-in`);
      await expect(page).toHaveURL(/sign-in/);
      await loginPage.usernameInput().waitFor({ state: 'visible', timeout: 10000 });
      await loginPage.loginAndWaitForNavigation(TEST_USERNAME, TEST_PASSWORD);
    });

    // ── Step 1: Expect customers page ─────────────────────────────────────
    await test.step('Verify redirect to customers page', async () => {
      await page.waitForURL(/\/customers/, { timeout: 15000 });
      await expect(page).toHaveURL(/customers/);
    });

    // ── Step 2: Click the Orders button ───────────────────────────────────
    await test.step('Click Orders button in sidebar', async () => {
      const ordersButton = page.getByRole('button', { name: /orders/i });
      await ordersButton.waitFor({ state: 'visible', timeout: 10000 });
      await ordersButton.click();
    });

    // ── Step 3: Click the Requests nav link ───────────────────────────────
    await test.step('Click Requests nav link', async () => {
      const requestsLink = page.locator('nav a', { hasText: 'Requests' });
      await requestsLink.waitFor({ state: 'visible', timeout: 5000 });
      await requestsLink.click();
    });

    // ── Step 4: Verify requests page URL ──────────────────────────────────
    await test.step('Verify redirect to orders/requests page', async () => {
      await page.waitForURL(/\/orders\/requests/, { timeout: 10000 });
      await expect(page).toHaveURL(/orders\/requests/);
    });

    // ── Step 5–6: Find and click the first row matching CUSTOMER_SEARCH ───
    await test.step(`Find and click first row with text "${CUSTOMER_SEARCH}"`, async () => {
      const row = page.getByText(CUSTOMER_SEARCH).first();
      await row.waitFor({ state: 'visible', timeout: 15000 });
      await row.click();
    });

    // ── Step 7: Click Approve Request button ──────────────────────────────
    await test.step('Click Approve Request button', async () => {
      const approveBtn = page.locator('main button', { hasText: 'Approve Request' });
      await approveBtn.waitFor({ state: 'visible', timeout: 10000 });
      await approveBtn.click();
    });

    // ── Step 8: Confirm approval in dialog ────────────────────────────────
    await test.step('Confirm approval in dialog', async () => {
      const confirmBtn = page.locator('div.fixed.inset-0.z-50').getByRole('button', { name: 'Approve' });
      await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
      await confirmBtn.click();
    });

    // ── Step 9: Expect "In Progress" status ───────────────────────────────
    await test.step('Verify status shows "In Progress"', async () => {
      const inProgress = page.locator('main').getByText('In Progress', { exact: true });
      await inProgress.waitFor({ state: 'visible', timeout: 15000 });
      await expect(inProgress).toBeVisible();
    });
  });
});
