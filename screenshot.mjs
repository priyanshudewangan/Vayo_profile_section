import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ADMIN_PASSWORD = 'saran1234';

async function screenshot() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // 1. User side - homepage
  const userPage = await context.newPage();
  await userPage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await userPage.screenshot({ path: path.join(__dirname, 'screenshot_user_home.png'), fullPage: true });
  console.log('✓ User homepage screenshot saved');

  // 2. User side - sign-in page
  const signInPage = await context.newPage();
  await signInPage.goto('http://localhost:3000/sign-in', { waitUntil: 'networkidle', timeout: 30000 });
  await signInPage.screenshot({ path: path.join(__dirname, 'screenshot_user_signin.png'), fullPage: true });
  console.log('✓ User sign-in screenshot saved');

  // 3. Admin side - login
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 30000 });
  await adminPage.screenshot({ path: path.join(__dirname, 'screenshot_admin_login.png'), fullPage: true });
  console.log('✓ Admin login page screenshot saved');

  // 4. Admin side - logged in
  try {
    // Fill password and submit
    await adminPage.fill('input[type="password"]', ADMIN_PASSWORD);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForTimeout(3000);
    await adminPage.screenshot({ path: path.join(__dirname, 'screenshot_admin_dashboard.png'), fullPage: false });
    console.log('✓ Admin dashboard screenshot saved');
  } catch (e) {
    console.log('Admin login interaction failed:', e.message);
    await adminPage.screenshot({ path: path.join(__dirname, 'screenshot_admin_dashboard.png'), fullPage: false });
  }

  // 5. Community / join page
  const joinPage = await context.newPage();
  await joinPage.goto('http://localhost:3000/join', { waitUntil: 'networkidle', timeout: 30000 });
  await joinPage.screenshot({ path: path.join(__dirname, 'screenshot_user_join.png'), fullPage: true });
  console.log('✓ Join page screenshot saved');

  await browser.close();
  console.log('All screenshots done.');
}

screenshot().catch(e => { console.error(e); process.exit(1); });
