import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Srujan S\\.gemini\\antigravity\\brain\\43294305-ccc6-4c04-9ef5-802359ff527a';

const demoUser = {
  id: 'worker-01',
  phone: '+919845012341',
  role: 'worker',
  created_at: '2026-11-20T09:00:00Z',
  worker_profile: {
    user_id: 'worker-01',
    name: 'Manjunath K.',
    language: 'en',
    trade: 'Electrician',
    locality: 'Peenya',
    latitude: 13.0285,
    longitude: 77.5197,
    experience_years: 8,
    bio: 'Expert in industrial panel boards, star-delta starters, and factory conduit routing.',
    daily_rate: 1000,
    available: 1
  }
};

async function testPassportRoute() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  await page.addInitScript((user) => {
    localStorage.setItem('proofwork_user', JSON.stringify(user));
  }, demoUser);

  await page.goto('http://127.0.0.1:5173/passport');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);

  const title = await page.textContent('h1');
  console.log('Passport heading:', title);

  const downloadBtn = page.locator('button:has-text("Download as Image")');
  const count = await downloadBtn.count();
  console.log('Download as Image button count:', count);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'passport_worker_nav_390px.png') });
  console.log('Screenshot saved to passport_worker_nav_390px.png');

  await browser.close();
}

testPassportRoute().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
