import { Page, Locator } from '@playwright/test';

export class CorporationsPage {
  readonly page: Page;
  readonly url = '/corporations';

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────

  /** "Admin" link – third <a> inside the sidebar <nav> */
  adminNavLink(): Locator {
    return this.page.locator('nav a').nth(2);
  }

  // ── Admin dashboard ────────────────────────────────────────────────────────

  /** "Corporation Management" card on the Admin dashboard */
  corporationManagementCard(): Locator {
    return this.page.getByRole('link', { name: /corporation management/i });
  }

  // ── Corporations list ──────────────────────────────────────────────────────

  /** "New Corporation" toolbar button */
  newCorporationButton(): Locator {
    return this.page.getByRole('button', { name: /new corporation/i });
  }

  // ── Create Corporation modal ───────────────────────────────────────────────

  /** Full-screen backdrop modal overlay */
  modal(): Locator {
    return this.page.locator(
      'div.fixed.inset-0.bg-black.bg-opacity-50.flex.items-center.justify-center.z-50',
    );
  }

  /** "Corporation Name" text input – first input inside the modal */
  corporationNameInput(): Locator {
    return this.modal().locator('input').first();
  }

  /** Blue "Create" submit button inside the modal */
  createButton(): Locator {
    return this.modal().getByRole('button', { name: /^create$/i });
  }

  // ── Delete Corporation (detail page) ──────────────────────────────────────

  /** Table row in the corporations list that contains the given name */
  corporationTableRow(name: string): Locator {
    return this.page.locator('table tbody tr').filter({ hasText: name });
  }

  /** "Delete corporation" button on the corporation detail page */
  deleteCorporationButton(): Locator {
    return this.page.getByRole('button', { name: /delete corporation/i });
  }

  /** Delete confirmation modal overlay */
  deleteConfirmationModal(): Locator {
    return this.page.locator('div.fixed.inset-0.bg-black.bg-opacity-50');
  }

  /** Red "Delete Corporation" confirm button inside the delete modal */
  confirmDeleteButton(): Locator {
    return this.deleteConfirmationModal().getByRole('button', { name: /delete corporation/i });
  }

  /** Success toast shown after deletion: "Corporation '<name>' deleted successfully" */
  deletionSuccessMessage(name: string): Locator {
    return this.page.getByText(new RegExp(`Corporation '${name}' deleted successfully`, 'i'));
  }

  // ── Assertions helpers ─────────────────────────────────────────────────────

  /**
   * Any alert element whose text signals a failure.
   * Use toHaveCount(0) to assert no errors are visible.
   */
  errorBanner(): Locator {
    return this.page.getByRole('alert').filter({ hasText: /error|failed|invalid/i });
  }

  /** Row in the corporations list that contains the given name */
  corporationRow(name: string): Locator {
    return this.page.getByText(name, { exact: false });
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async clickAdminNavLink(): Promise<void> {
    await this.adminNavLink().waitFor({ state: 'visible', timeout: 10_000 });
    await this.adminNavLink().click();
  }

  async clickCorporationManagementCard(): Promise<void> {
    await this.corporationManagementCard().waitFor({ state: 'visible', timeout: 10_000 });
    await this.corporationManagementCard().click();
  }

  async openNewCorporationModal(): Promise<void> {
    await this.newCorporationButton().waitFor({ state: 'visible', timeout: 10_000 });
    await this.newCorporationButton().click();
  }

  async fillCorporationName(name: string): Promise<void> {
    await this.corporationNameInput().waitFor({ state: 'visible', timeout: 5_000 });
    await this.corporationNameInput().fill(name);
  }

  async submitCreateCorporation(): Promise<void> {
    await this.createButton().click();
  }

  /** Clicks the table row matching the given corporation name */
  async clickCorporationRow(name: string): Promise<void> {
    const row = this.corporationTableRow(name);
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.click();
  }

  /** Clicks the "Delete corporation" button on the detail page */
  async clickDeleteCorporationButton(): Promise<void> {
    await this.deleteCorporationButton().waitFor({ state: 'visible', timeout: 10_000 });
    await this.deleteCorporationButton().click();
  }

  /** Waits for the delete confirmation modal to appear */
  async waitForDeleteModal(): Promise<void> {
    await this.deleteConfirmationModal().waitFor({ state: 'visible', timeout: 5_000 });
  }

  /** Clicks the red confirm delete button inside the modal */
  async confirmDeletion(): Promise<void> {
    await this.confirmDeleteButton().waitFor({ state: 'visible', timeout: 5_000 });
    await this.confirmDeleteButton().click();
  }
}
