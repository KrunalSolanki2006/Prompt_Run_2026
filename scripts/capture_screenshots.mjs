import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  fs.mkdirSync('docs/screenshots', { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 }
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    // 1. Landing
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `docs/screenshots/01_landing_${vp.name}.png` });

    // 2. Sign up
    await page.goto('http://localhost:4173/sign-up', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `docs/screenshots/02_signup_${vp.name}.png` });

    // Fill sign up
    await page.fill('#signup-name', 'Alex Sharma');
    await page.fill('#signup-email', `alex_${vp.name}@example.com`);
    await page.fill('#signup-pass', 'Password1234!');
    await page.fill('#signup-confirm', 'Password1234!');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('**/app/setup', { timeout: 5000 }).catch(() => {});
    await page.screenshot({ path: `docs/screenshots/03_setup_${vp.name}.png` });

    // 3. Complete setup
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForURL('**/app', { timeout: 5000 }).catch(() => {});
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: `docs/screenshots/04_dashboard_${vp.name}.png` });

    await context.close();
  }

  await browser.close();
  console.log('Screenshots captured successfully in docs/screenshots/');
}

run().catch(err => {
  console.error('Walkthrough error:', err);
  process.exit(1);
});
