import { Page } from '@playwright/test';

/**
 * Page object for the Patient Portal manifest upload / create order flow.
 * Portal URL: portal.{env}.trudiagnostic.com
 */
export class ManifestPage {
  constructor(private readonly page: Page) {}

  // ── Login ─────────────────────────────────────────────────────────────────

  readonly emailInput        = () => this.page.locator('#username');
  readonly passwordInput     = () => this.page.locator('#password');
  readonly signInButton      = () => this.page.locator("//button[@type='submit']").first();

  // ── Navigation ────────────────────────────────────────────────────────────

  /** "Create Order" link in the top nav (second nav item) */
  readonly createOrderLink   = () => this.page.locator('//nav/a[2]');

  // ── Create Order page — tab ───────────────────────────────────────────────

  /** "Submit & register samples" tab (second button in main, first paragraph label) */
  readonly submitRegisterTab = () => this.page.locator('//main//button[2]//p[1]').first();

  // ── Sample table — row 1 fields ───────────────────────────────────────────

  /** Kit ID input — identified by placeholder text */
  readonly kitIdInput        = () => this.page.locator("//input[@placeholder='Kit ID…']").first();

  /** Product type select — first combobox on the page */
  readonly productSelect     = () => this.page.getByRole('combobox').first();

  /** Collection date input — first date field in the first tbody row */
  readonly collectionDateInput = () => this.page.locator('table tbody tr').first().locator("input[type='date']").first();

  /** Date of birth input — second date field in the first tbody row */
  readonly dobInput          = () => this.page.locator('table tbody tr').first().locator("input[type='date']").nth(1);

  /** Sex / gender select — the select that contains an option with value "F" */
  readonly sexSelect         = () => this.page.locator('//table//tbody//tr//select[option[@value="F"]]').first();

  /** Patient ID input (td[7] of tr[1]) */
  readonly patientIdInput    = () => this.page.locator('//table//tbody//tr[1]//td[7]//input').first();

  // ── Sample table — row 2 fields ───────────────────────────────────────────

  /** First name input (first input in tr[2]) */
  readonly firstNameInput    = () => this.page.locator('//table//tbody//tr[2]//input').first();

  /** Last name input (second nested input in tr[2]) */
  readonly lastNameInput     = () => this.page.locator('//table//tbody//tr[2]//div//div[2]//input').first();

  // ── Sample table — delete buttons ─────────────────────────────────────────

  /** Remove button in row 3, column 8 */
  readonly removeRow3Button  = () => this.page.locator('//table//tbody//tr[3]//td[8]//button').first();

  /** Remove button — after row 3 is deleted, old row 4 shifts up to row 3 */
  readonly removeRow4Button  = () => this.page.locator('//table//tbody//tr[3]//button').first();

  // ── Submit ────────────────────────────────────────────────────────────────

  /** "Submit & Register Samples" action button (first button inside a div with class mt-4) */
  readonly submitButton      = () => this.page.locator("//div[contains(@class,'mt-4') and .//button]//button").first();

  // ── Success state ─────────────────────────────────────────────────────────

  /** Success banner h3 heading */
  readonly successHeading    = () => this.page.locator("//div[contains(@class,'bg-green-50')]//div//h3").first();

  // ── Actions ───────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.signInButton().click();
  }

  async selectProduct(): Promise<void> {
    await this.productSelect().selectOption('TruHealth');
  }

  async selectFemale(): Promise<void> {
    const select = this.sexSelect();
    await select.waitFor({ state: 'attached', timeout: 10000 });
    await select.scrollIntoViewIfNeeded();
    // Use JS to set the value and fire change/input events directly
    await select.evaluate((el: HTMLSelectElement) => {
      el.value = 'F';
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  /** Fills a date input starting from the DD segment by clicking far left, then typing digits */
  async fillDate(locatorFn: () => ReturnType<Page['locator']>, value: string): Promise<void> {
    const input = locatorFn();
    // Click at x:2 to land on the DD segment (leftmost position)
    await input.click({ position: { x: 2, y: 8 } });
    // Type digits only — browser auto-advances between DD / MM / YYYY segments
    await input.pressSequentially(value, { delay: 80 });
  }
}
