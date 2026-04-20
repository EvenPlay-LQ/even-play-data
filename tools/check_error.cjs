const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[Console Error] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`[Page Error] ${error.message}`);
  });

  try {
    const response = await page.goto('https://evenplayground.com', { waitUntil: 'networkidle' });
    console.log('Status code:', response ? response.status() : 'No response');
    console.log('URL:', page.url());
  } catch (err) {
    console.log('[Nav Error]', err.message);
  }
  
  console.log('--- ERRORS ---');
  console.log(errors.join('\n'));

  await browser.close();
})();
