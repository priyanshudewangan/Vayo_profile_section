import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  const page = await context.newPage();
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 30000 });

  await page.fill('input[type="password"]', 'saran1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Click "Events" sidebar button (index 1 in the nav)
  const navBtns = await page.$$('nav button');
  await navBtns[1].click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(__dirname, 'ss_admin_events_catalog.png'), fullPage: false });
  console.log('Events catalog screenshot saved');

  // Also scroll down a bit to see the event card
  await page.evaluate(() => window.scrollBy(0, 200));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'ss_admin_events_catalog2.png'), fullPage: false });
  console.log('Events catalog scrolled screenshot saved');

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
