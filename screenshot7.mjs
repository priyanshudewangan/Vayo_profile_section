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

  const navBtns = await page.$$('nav button');
  await navBtns[1].click();
  await page.waitForTimeout(7000);

  // Find the teal strip element and screenshot its bounding region
  const strip = await page.$('button:has-text("GPS Check-ins")');
  if (strip) {
    const box = await strip.boundingBox();
    console.log('Strip found at:', JSON.stringify(box));
    // Screenshot a wider region around the event card
    await page.screenshot({
      path: path.join(__dirname, 'ss_attendance_strip.png'),
      clip: { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 160), width: box.width + 60, height: box.height + 180 }
    });
  } else {
    console.log('Strip not found');
    await page.screenshot({ path: path.join(__dirname, 'ss_attendance_strip.png'), fullPage: false });
  }
  console.log('Done');
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
