import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));
  const failedRequests = [];
  page.on('requestfailed', req => failedRequests.push({ url: req.url(), failure: req.failure() }));

  const routes = ['/', '/sign-in', '/sign-up', '/app', '/app/lab', '/nope'];
  const routeResults = {};

  for (const r of routes) {
    const res = await page.goto('http://localhost:4173' + r, { waitUntil: 'networkidle' });
    const url = page.url();
    const title = await page.title();
    const h1 = await page.$eval('h1', el => el.textContent).catch(() => null);
    routeResults[r] = { status: res?.status(), url, title, h1 };
  }

  // Test sign-up with 8-char password
  await page.goto('http://localhost:4173/sign-up', { waitUntil: 'networkidle' });
  await page.fill('#signup-name', 'Alex');
  await page.fill('#signup-email', 'alex@example.com');
  await page.fill('#signup-pass', 'Test@1234');
  await page.fill('#signup-confirm', 'Test@1234');
  
  // Submit
  const t0 = Date.now();
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  const t1 = Date.now();
  const currentUrlAfterSignup = page.url();
  const errorMsg = await page.$eval('#signup-pass-strength', el => el.textContent).catch(() => null);
  const formErr = await page.$eval('.text-\\[\\#B42318\\]', el => el.textContent).catch(() => null);

  console.log(JSON.stringify({
    routeResults,
    consoleLogs,
    failedRequests,
    signupTest: {
      timeMs: t1 - t0,
      currentUrl: currentUrlAfterSignup,
      errorMsg,
      formErr
    }
  }, null, 2));

  await browser.close();
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
