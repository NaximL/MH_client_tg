const { chromium } = require('playwright');

const getBrowser = async () => {
  let browser;
  try {
    console.log("Launching browser...");
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--remote-debugging-port=9222',
      ],
    });
    console.log("Browser launched successfully.");
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
    console.log(`Navigating to ${url + "Analitika"}...`);
    await page.goto(url + "Analitika", { waitUntil: 'load' });

    console.log("Filling login form...");
    await page.fill('#UserName', use);
    await page.fill('#Password', pass);

    console.log("Submitting login...");
    await page.click('form button[type="submit"].login-btn-yellow');
    const bal = 'div.c100.center.p100 > span';
    const mische = 'td[class="big"]';
    const povidom = 'span[class="badge badge-pill pink"]';
    console.log("Waiting for navigation...");
    await page.waitForSelector(bal);

    const errorSelector = 'div.alert.alert-danger';
    const errorElement = await page.$(errorSelector);

    if (errorElement) {
      console.log('Login error: alert-danger found');
      await browser.close();
      return false;
    }

    

    try {
      console.log("Waiting for balance element...");
      await page.waitForSelector(bal, { timeout: 10000 });
      await page.waitForSelector(mische, { timeout: 10000 });
      await page.waitForSelector(povidom, { timeout: 10000 });

      console.log("Extracting data...");
      const bals = await page.innerText(bal);
      const misched = await page.innerText(mische);
      const povidomd = await page.innerText(povidom);

      await browser.close();
      return { bal: bals, mische: misched, povidom: povidomd };
    } catch (error) {
      console.error('Error getting data from the page:', error);
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
    console.log(`Navigating to ${url + "TvarkarascioIrasas/MokinioTvarkarastis"}...`);
    await page.goto(url + "TvarkarascioIrasas/MokinioTvarkarastis", { waitUntil: 'load' });

    console.log("Filling login form...");
    await page.fill('#UserName', use);
    await page.fill('#Password', pass);
    await page.click('form button[type="submit"].login-btn-yellow');

    console.log("Waiting for navigation...");
    await page.waitForNavigation({ waitUntil: 'load' });

    const errorSelector = 'div.alert.alert-danger';
    const errorElement = await page.$(errorSelector);

    if (errorElement) {
      console.log('Login error: alert-danger found');
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