import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  const logs = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else {
      logs.push(`${msg.type()}: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  try {
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait a bit for any dynamic errors
    await page.waitForTimeout(5000);

    // Try to navigate to a few pages
    await page.goto('http://localhost:8080/properties', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    await page.goto('http://localhost:8080/pricing', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

  } catch (e) {
    console.error('Navigation error:', e.message);
  }

  await browser.close();

  console.log('Console Errors:');
  errors.forEach(e => console.error(e));

  if (errors.length === 0) {
    console.log('No console errors found.');
  }

  console.log(`\nTotal errors: ${errors.length}`);
})();
