// 產生 OG 縮圖：node scripts/og/render.mjs → public/img/og-default.png（zh）、og-ja.png、og-en.png（各 2400×1260）
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here=path.dirname(fileURLToPath(import.meta.url));
const EXE=process.env.CHROME||'/Users/kawauso/.cache/puppeteer/chrome-headless-shell/mac_arm-152.0.7977.42/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const br=await chromium.launch({executablePath:EXE});
const ctx=await br.newContext({viewport:{width:1200,height:630},deviceScaleFactor:2});
for (const [lang,file] of [['zh','og-default.png'],['ja','og-ja.png'],['en','og-en.png']]) {
  const p=await ctx.newPage();
  await p.goto('file://'+path.join(here,'og.html')+(lang==='zh'?'':`?lang=${lang}`),{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
  await p.screenshot({path:path.join(here,'../../public/img/',file),type:'png'});
  await p.close(); console.log(file,'written');
}
await br.close();
