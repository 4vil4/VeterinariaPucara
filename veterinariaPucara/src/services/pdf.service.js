import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePdfFromView = async (app, viewName, data = {}) => {
  const html = await new Promise((resolve, reject) => {
    app.render(viewName, data, (err, rendered) => {
      if (err) return reject(err);
      resolve(rendered);
    });
  });

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: ['domcontentloaded', 'networkidle0'] });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '16mm', right: '12mm', bottom: '18mm', left: '12mm' }
  });

  await browser.close();
  return pdfBuffer;
}; 
