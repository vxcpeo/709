import { launchChrome, openPage } from 'file:///C:/Users/Administrator/.dsh/skills/rebrand/scripts/lib/chrome.mjs';

const base = process.argv[2] || 'http://127.0.0.1:5313';
const route = process.argv[3] || '/create';
const width = Number(process.argv[4] || 1440);

const browser = await launchChrome({ headless: true, width, height: 900 });
try {
  const page = await openPage(browser.cdp, { width, height: 900 });
  await page.navigate(base + route, { timeoutMs: 30000, delayMs: 1500, width, height: 900, mobile: width < 600 });
  const info = await page.evaluate("(() => { const out = { buttons: [], width: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }; for (const el of document.querySelectorAll('button,[role=\"button\"]')) { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); out.buttons.push({ html: el.outerHTML.slice(0, 110), rect: [Math.round(r.width), Math.round(r.height)], text: (el.innerText || '').trim().slice(0, 40), vis: cs.visibility, disp: cs.display, open: el.closest('details') ? el.closest('details').open : null }); } return out; })()");
  console.log(JSON.stringify(info, null, 2));
  await page.close();
} finally {
  await browser.close();
}
