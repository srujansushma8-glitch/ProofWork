import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Srujan S\\.gemini\\antigravity\\brain\\43294305-ccc6-4c04-9ef5-802359ff527a';

const demoUser = {
  id: "worker-01",
  phone: "+919845012341",
  role: "worker",
  created_at: "2026-11-20T09:00:00Z",
  worker_profile: {
    user_id: "worker-01",
    name: "Manjunath K.",
    language: "en",
    trade: "Electrician",
    locality: "Peenya",
    latitude: 13.0285,
    longitude: 77.5197,
    experience_years: 8,
    bio: "Expert in industrial panel boards, star-delta starters, and factory conduit routing.",
    daily_rate: 1000,
    available: 1
  }
};

async function testWorkerAndVerifierScreens() {
  console.log('Capturing authenticated worker & verifier screens across breakpoints...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const screenConfigs = [
    { url: 'http://127.0.0.1:5173/app', width: 390, height: 844, file: 'worker_home_390px.png' },
    { url: 'http://127.0.0.1:5173/app', width: 768, height: 1024, file: 'worker_home_768px.png' },
    { url: 'http://127.0.0.1:5173/app', width: 1440, height: 900, file: 'worker_home_1440px.png' },
    { url: 'http://127.0.0.1:5173/tasks', width: 1440, height: 900, file: 'task_picker_1440px.png' },
    { url: 'http://127.0.0.1:5173/result/asmt-worker-01', width: 1440, height: 900, file: 'assessment_result_1440px.png' },
    { url: 'http://127.0.0.1:5173/verify/tok-worker-01', width: 1440, height: 900, file: 'verifier_review_1440px.png' }
  ];

  for (const cfg of screenConfigs) {
    const context = await browser.newContext({
      viewport: { width: cfg.width, height: cfg.height },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    await page.addInitScript((user) => {
      localStorage.setItem('proofwork_user', JSON.stringify(user));
    }, demoUser);

    await page.goto(cfg.url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const layoutMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      return {
        clientWidth: doc.clientWidth,
        scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
        hasHorizontalScroll: Math.max(doc.scrollWidth, body.scrollWidth) > (doc.clientWidth + 1)
      };
    });

    const screenshotPath = path.join(ARTIFACT_DIR, cfg.file);
    await page.screenshot({ path: screenshotPath });

    console.log(`[${cfg.width}px] ${cfg.url} -> ${cfg.file} | Horizontal scroll: ${layoutMetrics.hasHorizontalScroll ? 'FAIL' : 'PASS'}`);

    await context.close();
  }

  await browser.close();
  console.log('Worker & verifier screens captured successfully!');
}

testWorkerAndVerifierScreens().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
