import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Admin dashboard showing LIVE event
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 30000 });
  await adminPage.fill('input[type="password"]', 'saran1234');
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForTimeout(1500);
  // Navigate to Event Catalog section
  const eventNavBtn = await adminPage.$('[data-section="events"], button:has-text("Event"), nav button:nth-child(3)');
  if (eventNavBtn) await eventNavBtn.click();
  await adminPage.waitForTimeout(2000);
  await adminPage.screenshot({ path: path.join(__dirname, 'screenshot_admin_live.png'), fullPage: false });
  console.log('✓ Admin live event screenshot saved');

  // Profile/community page where attendance marking would show
  const profilePage = await context.newPage();
  await profilePage.goto('http://localhost:3000/profile', { waitUntil: 'networkidle', timeout: 30000 });
  await profilePage.screenshot({ path: path.join(__dirname, 'screenshot_user_profile.png'), fullPage: true });
  console.log('✓ User profile screenshot saved');

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
