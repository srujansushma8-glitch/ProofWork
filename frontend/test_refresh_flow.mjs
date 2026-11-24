import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Srujan S\\.gemini\\antigravity\\brain\\43294305-ccc6-4c04-9ef5-802359ff527a';

async function testUserRefreshFlow() {
  console.log('Testing requested flow: Refresh -> Landing Page -> Verification Page -> Main Home Screen -> Refresh reset...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  // STEP 1: Initial load or Refresh -> Should be on Landing Page ("/")
  console.log('1. Loading http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);

  const initialUrl = page.url();
  console.log('   Current URL:', initialUrl);
  if (!initialUrl.endsWith('/')) {
    throw new Error(`Expected Landing Page ("/"), but got: ${initialUrl}`);
  }

  const heroHeadline = await page.textContent('h1');
  console.log('   Landing Page Headline:', heroHeadline?.trim());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'flow_1_landing_page.png') });
  console.log('   Captured flow_1_landing_page.png');

  // STEP 2: Click "Get Verified" -> Should navigate to Verification Page ("/auth")
  console.log('2. Clicking "Get Verified (Electricians)" on Landing Page...');
  const getVerifiedBtn = page.locator('a:has-text("Get Verified (Electricians)")');
  await getVerifiedBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);

  const authUrl = page.url();
  console.log('   Current URL after clicking Get Verified:', authUrl);
  if (!authUrl.includes('/auth')) {
    throw new Error(`Expected Verification Page ("/auth"), but got: ${authUrl}`);
  }

  const authBadge = await page.textContent('text=Step 2: Phone & Credential Verification');
  console.log('   Verification Page Badge:', authBadge?.trim());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'flow_2_verification_page.png') });
  console.log('   Captured flow_2_verification_page.png');

  // STEP 3: Complete verification on /auth -> Should navigate to Main Home Screen ("/app")
  console.log('3. Completing verification (clicking One-Tap "Manjunath (Verified)")...');
  const verifyDemoBtn = page.locator('button:has-text("Manjunath (Verified)")');
  await verifyDemoBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);

  const homeUrl = page.url();
  console.log('   Current URL after verification:', homeUrl);
  if (!homeUrl.includes('/app')) {
    throw new Error(`Expected Main Home Screen ("/app"), but got: ${homeUrl}`);
  }

  const workerGreeting = await page.textContent('text=Manjunath K.');
  console.log('   Main Home Screen Worker:', workerGreeting?.trim());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'flow_3_main_home_screen.png') });
  console.log('   Captured flow_3_main_home_screen.png');

  // STEP 4: REFRESH while on Main Home Screen ("/app") -> Should reset to Landing Page ("/")
  console.log('4. Performing browser page refresh while on Main Home Screen...');
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);

  const refreshedUrl = page.url();
  console.log('   Current URL after refresh:', refreshedUrl);
  if (!refreshedUrl.endsWith('/') && !refreshedUrl.endsWith(':5173')) {
    throw new Error(`Expected redirect to Landing Page ("/") after refresh, but got: ${refreshedUrl}`);
  }

  const refreshedHeadline = await page.textContent('h1');
  console.log('   Post-refresh Page Headline:', refreshedHeadline?.trim());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'flow_4_post_refresh_landing.png') });
  console.log('   Captured flow_4_post_refresh_landing.png');

  await browser.close();
  console.log('\nSUCCESS: Verified exact requested sequence: Refresh -> Landing Page -> Verification Page -> Main Home Screen -> Refresh reset!');
}

testUserRefreshFlow().catch(err => {
  console.error('Flow test failed:', err);
  process.exit(1);
});
