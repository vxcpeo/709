import { launchChrome, openPage } from 'file:///C:/Users/Administrator/.dsh/skills/rebrand/scripts/lib/chrome.mjs';

const base = process.argv[2] || 'http://127.0.0.1:5313';
const route = process.argv[3] || '/create';
const viewport = Number(process.argv[4] || 1440);

const browser = await launchChrome({ headless: true, width: viewport, height: 900 });
try {
  const page = await openPage(browser.cdp, { width: viewport, height: 900 });
  await page.navigate(base + route, { timeoutMs: 30000, delayMs: 1200, width: viewport, height: 900, mobile: viewport < 600 });
  const info = await page.evaluate((() => {
  const out=[];
  for (const el of document.querySelectorAll('button')) {
    const txt=(el.innerText||'').trim();
    if (!txt) {
      const r=el.getBoundingClientRect();
      out.push({ html: el.outerHTML.slice(0,120), rect:[Math.round(r.width),Math.round(r.height)], vis:getComputedStyle(el).visibility, disp:getComputedStyle(el).display, det: el.closest('details')?.open ?? null, txtlen: el.textContent.length });
    }
  }
  return out;
})()));
  await page.close();
} finally {
  await browser.close();
}
