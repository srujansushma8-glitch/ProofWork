import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Srujan S\\.gemini\\antigravity\\brain\\43294305-ccc6-4c04-9ef5-802359ff527a';

async function runBrowserTests() {
  console.log('Starting Playwright automated browser test run on Edge...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  // -------------------------------------------------------------
  // TEST SUITE 1: Mobile Worker Flow (Viewport 390 x 844)
  // -------------------------------------------------------------
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2
  });

  const page = await mobileContext.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // 1. Auth Screen
  console.log('1. Navigating to /auth ...');
  await page.goto('http://127.0.0.1:5173/auth');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_auth_screen.png') });
  console.log('   Captured 01_auth_screen.png');

  // 2. Profile Setup Screen
  console.log('2. Navigating to Profile Setup ...');
  await page.click('button:has-text("Manjunath (Verified)")');
  await page.waitForTimeout(400);
  await page.goto('http://127.0.0.1:5173/profile-setup');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_profile_setup.png') });
  console.log('   Captured 02_profile_setup.png');

  // 3. Worker Home Screen
  console.log('3. Navigating to Home ...');
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_worker_home.png') });
  console.log('   Captured 03_worker_home.png');

  // 4. Task Picker
  console.log('4. Navigating to Task Picker...');
  await page.goto('http://127.0.0.1:5173/tasks');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_task_picker.png') });
  console.log('   Captured 04_task_picker.png');

  // 5. Record Screen
  console.log('5. Navigating to Recording screen...');
  await page.click('button:has-text("Proceed to Recording Camera")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_record_screen.png') });
  console.log('   Captured 05_record_screen.png');

  // 6. AI Assessment Result Screen (using seeded assessment for worker-01)
  console.log('6. Navigating to AI Assessment Result ...');
  await page.goto('http://127.0.0.1:5173/result/asmt-worker-01');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_ai_assessment.png') });
  console.log('   Captured 06_ai_assessment.png');

  // 7. Verifier Portal (Public, no login)
  console.log('7. Navigating to Verifier portal /verify/tok-worker-01 ...');
  await page.goto('http://127.0.0.1:5173/verify/tok-worker-01');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_verifier_review.png') });
  console.log('   Captured 07_verifier_review.png');

  // 8. Public Official Skill Passport (/p/PW-BLR-1000)
  console.log('8. Navigating to Public Skill Passport /p/PW-BLR-1000 ...');
  await page.goto('http://127.0.0.1:5173/p/PW-BLR-1000');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_verified_passport.png') });
  console.log('   Captured 08_verified_passport.png');

  // 9. Multilingual Kannada UI
  console.log('9. Testing Kannada UI ...');
  await page.goto('http://127.0.0.1:5173/auth');
  await page.click('button:has-text("ಕನ್ನಡ")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '10_kannada_ui.png') });
  console.log('   Captured 10_kannada_ui.png');

  // 10. Multilingual Hindi UI
  console.log('10. Testing Hindi UI ...');
  await page.click('button:has-text("हिन्दी")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '11_hindi_ui.png') });
  console.log('   Captured 11_hindi_ui.png');

  await mobileContext.close();

  // -------------------------------------------------------------
  // TEST SUITE 2: Desktop Contractor Dashboard (Viewport 1280 x 800)
  // -------------------------------------------------------------
  console.log('11. Testing Desktop Contractor Dashboard (1280x800)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1.5
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://127.0.0.1:5173/contractor');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(600);
  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, '09_contractor_dashboard.png') });
  console.log('   Captured 09_contractor_dashboard.png');

  console.log('12. Testing Inline Passport Audit Modal in Contractor Dashboard...');
  await desktopPage.click('button:has-text("Inspect Credential")');
  await desktopPage.waitForTimeout(600);
  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, '12_contractor_modal_audit.png') });
  console.log('   Captured 12_contractor_modal_audit.png');

  await desktopContext.close();
  await browser.close();

  console.log('\n--- AUTOMATED BROWSER TEST RUN FINISHED SUCCESSFULLY ---');
  console.log('Console errors encountered:', consoleErrors.length);
}

runBrowserTests().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
