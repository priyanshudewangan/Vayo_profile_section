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
  await page.waitForTimeout(6000); // wait for RSVPs + events to fully load

  // Go to Events section
  const navBtns = await page.$$('nav button');
  await navBtns[1].click();
  await page.waitForTimeout(5000);

  await page.screenshot({ path: path.join(__dirname, 'ss_catalog_with_attendance.png'), fullPage: false });
  console.log('Done');
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
