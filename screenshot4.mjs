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

  // Go to Events section
  const navBtns = await page.$$('nav button');
  await navBtns[1].click();
  await page.waitForTimeout(2500);

  // Click the "Check" button on the Meditation event
  const checkBtn = await page.$('button:has-text("Check")');
  if (checkBtn) {
    await checkBtn.click();
    await page.waitForTimeout(3500);
  }

  await page.screenshot({ path: path.join(__dirname, 'ss_attendee_modal.png'), fullPage: false });
  console.log('Attendee modal screenshot saved');
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
