import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('1. Navigating to sign-up...');
  await page.goto('http://localhost:4173/sign-up');
  await page.fill('[data-testid="signup-name"]', 'Evaluator User');
  await page.fill('[data-testid="signup-email"]', 'evaluator@promptrun.org');
  await page.fill('[data-testid="signup-password"]', 'Pass1234');
  await page.fill('[data-testid="signup-confirm-password"]', 'Pass1234');
  await page.click('[data-testid="signup-submit"]');
  
  await page.waitForURL('**/app/setup');
  console.log('2. Landed on setup:', page.url());
  
  await page.click('[data-testid="setup-submit"]');
  await page.waitForURL('**/app');
  console.log('3. Landed on dashboard:', page.url());
  
  const allowance = await page.textContent('[data-testid="metric-allowance"]');
  console.log('4. Allowance visible:', allowance?.trim());
  
  const wallet = await page.textContent('[data-testid="metric-wallet"]');
  console.log('5. Wallet balance visible:', wallet?.trim());
  
  const whatChanged = await page.isVisible('[data-testid="what-changed-panel"]');
  console.log('6. What changed panel visible:', whatChanged);
  
  await page.click('[data-testid="nav-lab"]');
  await page.waitForURL('**/app/lab');
  console.log('7. Landed on lab:', page.url());
  
  // Test navigation to other tabs
  await page.click('[data-testid="nav-plan"]');
  await page.waitForURL('**/app/plan');
  console.log('8. Landed on plan:', page.url());

  await page.click('[data-testid="nav-activity"]');
  await page.waitForURL('**/app/activity');
  console.log('9. Landed on activity:', page.url());

  await page.click('[data-testid="nav-insights"]');
  await page.waitForURL('**/app/insights');
  console.log('10. Landed on insights:', page.url());

  await browser.close();
  console.log('All 10 steps of evaluator journey PASSED cleanly!');
}

main().catch(err => {
  console.error('Journey failed:', err);
  process.exit(1);
});
