import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Srujan S\\.gemini\\antigravity\\brain\\43294305-ccc6-4c04-9ef5-802359ff527a';

const BREAKPOINTS = [
  { width: 320, height: 600, label: '320px_phone_small' },
  { width: 375, height: 667, label: '375px_phone_std' },
  { width: 390, height: 844, label: '390px_iphone14' },
  { width: 768, height: 1024, label: '768px_tablet' },
  { width: 1024, height: 800, label: '1024px_laptop' },
  { width: 1440, height: 900, label: '1440px_desktop' },
  { width: 1920, height: 1080, label: '1920px_large_desktop' }
];

async function runBreakpointTests() {
  console.log('Starting Multi-Breakpoint Responsive Visual & Layout Audits with Playwright...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const auditResults = [];

  // Helper to test a page at a specific breakpoint
  async function testPage(url, bp, filename, options = {}) {
    const context = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    
    // Inject mock user if testing /app
    if (options.asWorker) {
      await page.addInitScript(() => {
        localStorage.setItem('proofwork_worker', JSON.stringify({
          id: 'worker-01',
          name: 'Manjunath Swamy',
          phone: '+91 98450 12345',
          locality: 'BTM Layout',
          experience_years: 6,
          language: 'en',
          created_at: new Date().toISOString()
        }));
      });
    }

    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    if (options.setLang) {
      // Find language switcher button or dropdown
      const langBtn = page.locator(`button:has-text("${options.setLang}")`);
      if (await langBtn.count() > 0) {
        await langBtn.first().click();
        await page.waitForTimeout(300);
      }
    }

    if (options.action) {
      await options.action(page);
    }

    // Verify horizontal scrolling: scrollWidth must be <= clientWidth
    const layoutMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      return {
        clientWidth: doc.clientWidth,
        scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
        hasHorizontalScroll: Math.max(doc.scrollWidth, body.scrollWidth) > (doc.clientWidth + 1)
      };
    });

    const screenshotPath = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: screenshotPath, fullPage: options.fullPage || false });

    auditResults.push({
      url,
      breakpoint: `${bp.width}x${bp.height} (${bp.label})`,
      filename,
      layoutMetrics,
      passed: !layoutMetrics.hasHorizontalScroll
    });

    console.log(`[${bp.width}px] ${url} -> ${filename} | Horizontal scroll: ${layoutMetrics.hasHorizontalScroll ? 'FAIL' : 'PASS'}`);

    await context.close();
  }

  // 1. Landing Page Across ALL 7 Breakpoints
  console.log('\n--- 1. Testing Landing Page (/) across 7 breakpoints ---');
  for (const bp of BREAKPOINTS) {
    await testPage(
      'http://127.0.0.1:5173/',
      bp,
      `landing_${bp.width}px.png`,
      { fullPage: false }
    );
  }

  // 2. Full-Page Landing Page at 390px (Mobile) and 1440px (Desktop) to verify all 9 sections
  console.log('\n--- 2. Full Page Audits for Landing Page ---');
  await testPage(
    'http://127.0.0.1:5173/',
    { width: 390, height: 844, label: '390px_full' },
    'landing_390px_fullpage.png',
    { fullPage: true }
  );
  await testPage(
    'http://127.0.0.1:5173/',
    { width: 1440, height: 900, label: '1440px_full' },
    'landing_1440px_fullpage.png',
    { fullPage: true }
  );

  // 3. Multilingual Landing Page at 390px & 1440px (Kannada & Hindi text wrapping check)
  console.log('\n--- 3. Testing Multilingual Landing Page (kn, hi) ---');
  await testPage(
    'http://127.0.0.1:5173/',
    { width: 390, height: 844, label: '390px_kannada' },
    'landing_390px_kannada.png',
    { setLang: 'ಕನ್ನಡ' }
  );
  await testPage(
    'http://127.0.0.1:5173/',
    { width: 390, height: 844, label: '390px_hindi' },
    'landing_390px_hindi.png',
    { setLang: 'हिन्दी' }
  );

  // 4. Worker Home Screen (/app) at Mobile (390px), Tablet (768px), and Desktop (1440px)
  console.log('\n--- 4. Testing Worker Screen (/app) ---');
  await testPage(
    'http://127.0.0.1:5173/app',
    { width: 390, height: 844, label: '390px_worker' },
    'worker_home_390px.png',
    { asWorker: true }
  );
  await testPage(
    'http://127.0.0.1:5173/app',
    { width: 768, height: 1024, label: '768px_worker' },
    'worker_home_768px.png',
    { asWorker: true }
  );
  await testPage(
    'http://127.0.0.1:5173/app',
    { width: 1440, height: 900, label: '1440px_worker' },
    'worker_home_1440px.png',
    { asWorker: true }
  );

  // 5. Contractor Dashboard (/contractor) at Mobile (390px), Tablet (768px), and Desktop (1440px)
  console.log('\n--- 5. Testing Contractor Dashboard (/contractor) ---');
  await testPage(
    'http://127.0.0.1:5173/contractor',
    { width: 390, height: 844, label: '390px_contractor' },
    'contractor_390px.png'
  );
  await testPage(
    'http://127.0.0.1:5173/contractor',
    { width: 768, height: 1024, label: '768px_contractor' },
    'contractor_768px.png'
  );
  await testPage(
    'http://127.0.0.1:5173/contractor',
    { width: 1440, height: 900, label: '1440px_contractor' },
    'contractor_1440px.png'
  );

  // 6. Public Passport Screen (/p/PW-BLR-1000) at 390px and 1440px
  console.log('\n--- 6. Testing Public Passport Screen (/p/PW-BLR-1000) ---');
  await testPage(
    'http://127.0.0.1:5173/p/PW-BLR-1000',
    { width: 390, height: 844, label: '390px_passport' },
    'passport_390px.png'
  );
  await testPage(
    'http://127.0.0.1:5173/p/PW-BLR-1000',
    { width: 1440, height: 900, label: '1440px_passport' },
    'passport_1440px.png'
  );

  await browser.close();

  console.log('\n================ AUDIT SUMMARY ================');
  let allPassed = true;
  for (const res of auditResults) {
    if (!res.passed) {
      allPassed = false;
      console.error(`FAILED: ${res.breakpoint} - ${res.url} (scrollWidth: ${res.layoutMetrics.scrollWidth}, clientWidth: ${res.layoutMetrics.clientWidth})`);
    } else {
      console.log(`PASSED: [${res.breakpoint}] ${res.url} (width: ${res.layoutMetrics.clientWidth}px)`);
    }
  }

  if (allPassed) {
    console.log('\nSUCCESS: All responsive breakpoints passed with ZERO horizontal overflow!');
  } else {
    console.error('\nFAILURE: Some responsive breakpoints detected horizontal overflow.');
    process.exit(1);
  }
}

runBreakpointTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
