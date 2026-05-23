// Playwright script: capture each tutorial step as PNG
// Usage: node capture-tutorial.js
const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:19006';
const OUT = path.join(__dirname, 'assets', 'tutorial');

async function waitForOverlay(page, timeout = 12000) {
  await page.waitForSelector('text=다음', { timeout });
  await page.waitForTimeout(600); // let spotlight animation settle
}

async function clickNext(page) {
  const btn = page.locator('text=다음').last();
  await btn.waitFor({ state: 'visible' });
  await btn.click();
  await page.waitForTimeout(900);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log('✓', name + '.png');
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  // Patch expo-secure-store to use localStorage on web (injected before any page JS)
  await page.addInitScript(() => {
    const fakeModule = {
      getValueWithKeyAsync: (key) => Promise.resolve(localStorage.getItem(key)),
      setValueWithKeyAsync: (key, value) => {
        localStorage.setItem(key, value);
        return Promise.resolve(null);
      },
      deleteValueWithKeyAsync: (key) => {
        localStorage.removeItem(key);
        return Promise.resolve(null);
      },
    };
    window.ExpoSecureStore = fakeModule;
    window.__ExpoSecureStore = fakeModule;
  });

  // Mock /auth/me so the app thinks we're logged in
  await page.route('**/auth/me', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'demo',
        email: 'demo@airo.app',
        nickname: '데모',
        region: null,
        birthDate: null,
        gender: null,
        provider: 'google',
        profileCompleted: true,
        role: 'user',
      }),
    })
  );

  // Load the app, set fake tokens + fresh tutorial state, then reload
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('ilaw.accessToken', 'demo-access-token');
    localStorage.setItem('ilaw.refreshToken', 'demo-refresh-token');
    localStorage.removeItem('airo_tutorial_done');
    localStorage.removeItem('airo_tutorial_phase');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

  // restoreSession has a minSplash(2000) delay — wait it out
  await page.waitForTimeout(3500);

  // Debug: see current state
  const body = await page.evaluate(() => document.body.innerText.substring(0, 300));
  console.log('Current page:', page.url());
  console.log('Visible text:', body.replace(/\n+/g, ' ').substring(0, 200));
  await page.screenshot({ path: path.join(OUT, '_debug_initial.png') });

  console.log('\n📸 Starting capture...\n');

  // ── Step 1: Home — search bar ──────────────────────────────────────────
  await waitForOverlay(page);
  await shot(page, '1_home_search');

  // ── Step 2: Home — AI FAB ─────────────────────────────────────────────
  await clickNext(page);
  await waitForOverlay(page);
  await shot(page, '2_home_fab');

  // ── Step 3: Home — recommend list ─────────────────────────────────────
  await clickNext(page);
  await waitForOverlay(page);
  await shot(page, '3_home_recommend');

  // "다음" on step 3 → sets phase='consult', navigates to consult tab
  await clickNext(page);
  await page.waitForTimeout(2000);

  // ── Step 4: Consult — dual spotlight on items 2 & 3 ───────────────────
  await waitForOverlay(page);
  await shot(page, '4_consult');

  // "다음" → sets phase='manual_list', pushes /manual-list?categoryId=child-abuse
  await clickNext(page);
  await page.waitForTimeout(2000);

  // ── Step 5: Manual list — floating help button ────────────────────────
  await waitForOverlay(page);
  await shot(page, '5_manual_list');

  // "다음" → sets phase='qna', navigates to qna tab
  await clickNext(page);
  await page.waitForTimeout(2000);

  // ── Step 6: QnA — first card + FAB ────────────────────────────────────
  await waitForOverlay(page);
  await shot(page, '6_qna');

  // "다음" → sets phase='community', navigates to community tab
  await clickNext(page);
  await page.waitForTimeout(2000);

  // ── Step 7: Community — second post card ──────────────────────────────
  await page.waitForSelector('text=완료', { timeout: 12000 });
  await page.waitForTimeout(600);
  await shot(page, '7_community');

  await browser.close();
  console.log('\n✅ All 7 tutorial images saved to assets/tutorial/');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
