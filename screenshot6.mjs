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
  await page.waitForTimeout(5000);

  // Go to Events section
  const navBtns = await page.$$('nav button');
  await navBtns[1].click();
  await page.waitForTimeout(7000);

  // Check for the teal panel
  const result = await page.evaluate(() => {
    return {
      hasPanel: document.body.innerHTML.includes('GPS Check-ins'),
      hasEmail: document.body.innerHTML.includes('tosaran09'),
      hasTeal: document.querySelectorAll('[class*="teal"]').length,
      eventCards: document.querySelectorAll('[class*="rounded"]').length,
    };
  });
  console.log('DOM check:', JSON.stringify(result));

  await page.screenshot({ path: path.join(__dirname, 'ss_catalog_full.png'), fullPage: true });
  console.log('Done');
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
