const puppeteer = require('puppeteer');

/**
 * Scrape job description text from a given URL using Puppeteer
 * @param {string} url - Job posting URL
 * @returns {Promise<string>} Extracted job description text
 */
const scrapeJobDescription = async (url) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Set realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate with timeout
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for body to be visible
    await page.waitForSelector('body', { timeout: 10000 });

    // Extract all visible text content
    const text = await page.evaluate(() => {
      // Remove script and style tags before extracting text
      const scripts = document.querySelectorAll('script, style, nav, header, footer');
      scripts.forEach((el) => el.remove());

      return document.body.innerText;
    });

    // Clean up the text
    const cleanedText = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n')
      .substring(0, 8000); // Limit to 8000 chars to avoid token overflow

    if (cleanedText.length < 100) {
      throw new Error('Could not extract meaningful content from the URL');
    }

    return cleanedText;
  } catch (error) {
    throw new Error(`Failed to scrape URL: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { scrapeJobDescription };
