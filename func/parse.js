const puppeteer = require('puppeteer-core'); 

const getBrowser = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      headless: true, 
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-gpu', 
        '--remote-debugging-port=9222',
      ],
    });
  } catch (err) {
    console.error('Error launching browser:', err);
  }
  return browser;
};

const parses_bal = async (url, use, pass) => {
  const browser = await getBrowser();
  if (!browser) return false;

  const page = await browser.newPage();

  try {
    await page.goto(url + "Analitika", { waitUntil: 'networkidle0' });

    await page.type('#UserName', use);
    await page.type('#Password', pass);

    await page.click('form button[type="submit"].login-btn-yellow');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    const errorSelector = 'div.alert.alert-danger';
    const errorElement = await page.$(errorSelector);

    if (errorElement) {
      await browser.close();
      return false;
    }

    const bal = 'div.c100.center.p100 > span';
    const mische = 'td[class="big"]';
    const povidom = 'span[class="badge badge-pill pink"]';

    try {
      await page.waitForSelector(bal, { timeout: 5000 });
      await page.waitForSelector(mische, { timeout: 5000 });
      await page.waitForSelector(povidom, { timeout: 5000 });

      const bals = await page.$eval(bal, el => el.textContent.trim());
      const misched = await page.$eval(mische, el => el.textContent.trim());
      const povidomd = await page.$eval(povidom, el => el.textContent.trim());

      await browser.close();
      return { bal: bals, mische: misched, povidom: povidomd };
    } catch (error) {
      await browser.close();
      return false;
    }
  } catch (error) {
    console.error('Error during page navigation or interaction:', error);
    await browser.close();
    return false;
  }
};

const parses_lesion = async (url, use, pass) => {
  const browser = await getBrowser();
  if (!browser) return false;

  const page = await browser.newPage();

  try {
    await page.goto(url + "TvarkarascioIrasas/MokinioTvarkarastis", { waitUntil: 'networkidle0' });

    await page.type('#UserName', use);
    await page.type('#Password', pass);
    await page.click('form button[type="submit"].login-btn-yellow');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    const errorSelector = 'div.alert.alert-danger';
    const errorElement = await page.$(errorSelector);

    if (errorElement) {
      await browser.close();
      return false;
    }

    const data = await page.evaluate(() => {
      const tbodies = document.querySelectorAll('tbody.bg-white');
      const results = [];

      tbodies.forEach(tbody => {
        const rows = tbody.querySelectorAll('tr');
        const ef = [];

        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 5) {
            const urok = cells[4].textContent.trim();
            const time = cells[2].textContent.trim();
            ef.push({ urok, time });
          }
        });

        results.push(ef);
      });

      return JSON.stringify(results);
    });

    await browser.close();
    return data;
  } catch (error) {
    console.error('Error during page navigation or interaction:', error);
    await browser.close();
    return false;
  }
};

module.exports = { parses_bal, parses_lesion };