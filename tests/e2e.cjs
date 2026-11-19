// End-to-end test of the running site (website + API + database), in a real browser.
// Usage: SITE_URL=http://localhost:4200 E2E_ADMIN_PASSWORD=... [E2E_ADMIN_USERNAME=admin] node tests/e2e.cjs
// It submits a test enquiry and application, edits and restores content, and creates/deletes a test job.
const pw = require('playwright');
const path = require('path');
const fs = require('fs');
const BASE = process.env.SITE_URL || 'http://localhost:4200';
const ADMIN = { username: process.env.E2E_ADMIN_USERNAME || 'admin', password: process.env.E2E_ADMIN_PASSWORD || '' };
if (!ADMIN.password) { console.error('Set E2E_ADMIN_PASSWORD (and E2E_ADMIN_USERNAME) for the administrator account on the site under test.'); process.exit(1); }
const results = [];
const check = (name, ok, extra = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); };
const shots = path.join(__dirname, 'output', 'e2e');
fs.mkdirSync(shots, { recursive: true });

(async () => {
  const browser = await pw.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|net::ERR|Failed to load resource/.test(m.text())) errors.push(m.text()); });

  // ---- Hydration: data fetched on the server is reused (no duplicate API calls on first load) ----
  const apiCalls = [];
  // The anonymous page-view beacon (POST /api/track, dashboard statistics) is not a data request.
  page.on('request', (r) => { if (r.url().includes('/api/') && !r.url().includes('/api/track')) apiCalls.push(r.url()); });
  await page.goto(BASE + '/services/consulting/', { waitUntil: 'networkidle' });
  check('hydration reuses server data (no API calls on first load)', apiCalls.length === 0, `${apiCalls.length} calls`);

  // ---- Client-side navigation keeps trailing-slash URLs ----
  await page.click('app-header nav[aria-label=Primary] a[href="/clientele/"]');
  await page.waitForURL('**/clientele/');
  check('client navigation keeps trailing slash', page.url() === BASE + '/clientele/', page.url());
  check('title updates on navigation', (await page.title()) === 'Clientele | Spine Advisory', await page.title());

  // ---- Enquiry form ----
  await page.goto(BASE + '/contact/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('form button[type=submit]');
  await page.waitForTimeout(300);
  check('enquiry: empty submit shows errors', (await page.locator('.field-error').count()) >= 4);
  await page.fill('#f-name', 'E2E Tester, Project Director');
  await page.fill('#f-org', 'E2E State PWD');
  await page.fill('#f-email', 'e2e@example.gov.in');
  await page.fill('#f-phone', '+91 98765 43210');
  await page.selectOption('#f-sector', { index: 1 });
  await page.fill('#f-scope', 'HAM project, 120 km, feasibility stage.');
  await page.waitForTimeout(3200); // minimum fill time (anti-spam)
  await page.click('form button[type=submit]');
  await page.waitForSelector('.form-status.ok', { timeout: 10000 }).catch(() => null);
  check('enquiry: submitted successfully', (await page.locator('.form-status.ok').count()) === 1, await page.locator('.form-status').textContent().catch(() => ''));

  // ---- Career application with CV ----
  await page.goto(BASE + '/careers/', { waitUntil: 'networkidle' });
  await page.setInputFiles('#c-cv', { name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('MZ fake') });
  check('application: disguised file rejected in browser', /genuine PDF/.test((await page.locator('#c-cv-error').textContent().catch(() => '')) ?? ''));
  await page.setInputFiles('#c-cv', { name: 'e2e-cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF') });
  await page.fill('#c-name', 'E2E Applicant');
  await page.fill('#c-email', 'applicant@example.com');
  await page.fill('#c-phone', '+91 99999 11111');
  await page.fill('#c-location', 'New Delhi');
  await page.fill('#c-qual', 'CA');
  await page.fill('#c-exp', '3');
  await page.check('input[formcontrolname=consent]');
  await page.waitForTimeout(4200);
  await page.click('app-career-form button[type=submit]');
  await page.waitForSelector('app-career-form .form-status.ok', { timeout: 10000 }).catch(() => null);
  check('application: submitted with CV', (await page.locator('app-career-form .form-status.ok').count()) === 1, await page.locator('app-career-form .form-status').textContent().catch(() => ''));

  // ---- Admin: protected, sign in ----
  await page.goto(BASE + '/admin/', { waitUntil: 'networkidle' });
  check('admin: redirects to sign-in when signed out', page.url().includes('/admin/login'), page.url());
  await page.fill('#username', ADMIN.username);
  await page.fill('#password', 'wrong-password');
  await page.click('button[type=submit]');
  await page.waitForSelector('.alert-danger');
  check('admin: wrong password rejected', /Incorrect username or password/.test(await page.locator('.alert-danger').textContent()));
  await page.fill('#password', ADMIN.password);
  await page.click('button[type=submit]');
  await page.waitForSelector('h1:has-text("Welcome")', { timeout: 10000 }).catch(() => null);
  check('admin: signed in to dashboard', (await page.locator('h1:has-text("Welcome")').count()) === 1);
  await page.screenshot({ path: path.join(shots, 'admin-dashboard.png') });

  // ---- Admin: submissions visible, CV downloadable ----
  await page.goto(BASE + '/admin/enquiries/', { waitUntil: 'networkidle' });
  check('admin: enquiry stored and listed', (await page.locator('td:has-text("E2E State PWD")').count()) >= 1);
  await page.goto(BASE + '/admin/careers/applications/', { waitUntil: 'networkidle' });
  await page.locator('tr:has-text("E2E Applicant")').first().click();
  await page.waitForSelector('button:has-text("download résumé")');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('button:has-text("download résumé")')]);
  check('admin: CV download works', download.suggestedFilename() === 'e2e-cv.pdf', download.suggestedFilename());
  await page.selectOption('#status', 'shortlisted');
  await page.click('button:has-text("Save")');
  await page.waitForSelector('.toast-item:has-text("Saved.")');
  check('admin: application status updated', true);

  // ---- Admin: edit content → public website updates immediately ----
  await page.goto(BASE + '/admin/content/r/practices/', { waitUntil: 'networkidle' });
  await page.click('a.fw-semibold:has-text("Information Technology")');
  await page.waitForSelector('#f-title');
  const original = await page.inputValue('#f-title');
  await page.fill('#f-title', 'Information Technology (E2E)');
  await page.click('button:has-text("Save changes")');
  await page.waitForSelector('.toast-item:has-text("saved")', { timeout: 10000 });
  await page.screenshot({ path: path.join(shots, 'admin-edit.png'), fullPage: false });
  const pub = await ctx.newPage();
  await pub.goto(BASE + '/services/technology/', { waitUntil: 'networkidle' });
  check('content edit appears on the public site', (await pub.locator('h1').textContent()).includes('(E2E)'));
  await page.fill('#f-title', original);
  await page.click('button:has-text("Save changes")');
  await page.waitForTimeout(1500);
  await pub.reload({ waitUntil: 'networkidle' });
  check('content edit reverted', (await pub.locator('h1').textContent()).trim() === original);

  // ---- Admin: publish a job opening → appears on Career page ----
  await page.goto(BASE + '/admin/careers/openings/new/', { waitUntil: 'networkidle' });
  await page.fill('#f-title', 'E2E Analyst');
  await page.selectOption('#f-department', 'Consulting');
  await page.fill('#f-location', 'Mumbai');
  await page.fill('#f-experience', '1–2 years');
  await page.selectOption('#f-status', 'open');
  await page.click('button:has-text("+ Add qualification")');
  await page.fill('input[aria-label="qualification 1"]', 'CA or MBA');
  await page.click('button:has-text("+ Add responsibility")');
  await page.fill('input[aria-label="responsibility 1"]', 'Build financial models');
  await page.click('button:has-text("Create")');
  await page.waitForSelector('.toast-item:has-text("created")', { timeout: 10000 }).catch(() => null);
  check('admin: job opening created', (await page.locator('.toast-item:has-text("created")').count()) === 1, await page.locator('.alert').first().textContent().catch(() => ''));
  await pub.goto(BASE + '/careers/', { waitUntil: 'networkidle' });
  check('published opening appears on Career page', (await pub.locator('h3:has-text("E2E Analyst")').count()) === 1);
  check('JobPosting structured data emitted', (await pub.content()).includes('"JobPosting"'));
  // clean up
  const jobUrl = page.url();
  await page.goto(BASE + '/admin/careers/openings/', { waitUntil: 'networkidle' });
  await page.locator('tr:has-text("E2E Analyst") button[title="Delete"]').click();
  await page.locator('.modal-footer button:has-text("Delete")').click();
  await page.waitForTimeout(800);
  check('admin: job opening deleted', (await page.locator('tr:has-text("E2E Analyst")').count()) === 0, jobUrl);

  // ---- Admin: content block editor ----
  await page.goto(BASE + '/admin/content/blocks/vision/', { waitUntil: 'networkidle' });
  await page.waitForSelector('input#f-value-statement');
  check('admin: About Us content editor loads', (await page.inputValue('#f-value-statement')).length > 5);
  await page.screenshot({ path: path.join(shots, 'admin-content.png') });

  // ---- Sign out ----
  await page.click('.admin-topbar button:has-text("Logout")');
  await page.locator('.modal-footer button:has-text("Logout")').click();
  await page.waitForURL('**/admin/login**');
  const me = await page.evaluate(() => fetch('/api/auth/me').then((r) => r.status));
  check('admin: sign out ends the session', me === 401, String(me));

  check('no JavaScript errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
  console.log(results.join('\n'));
})();
