// 產生 OG 縮圖：node scripts/og/render.mjs → public/img/og-default.png（2400×1260）
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here=path.dirname(fileURLToPath(import.meta.url));
const EXE=process.env.CHROME||'/Users/kawauso/.cache/puppeteer/chrome-headless-shell/mac_arm-152.0.7977.42/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const br=await chromium.launch({executablePath:EXE});
const p=await(await br.newContext({viewport:{width:1200,height:630},deviceScaleFactor:2})).newPage();
await p.goto('file://'+path.join(here,'og.html'),{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
await p.screenshot({path:path.join(here,'../../public/img/og-default.png'),type:'png'});
await br.close(); console.log('og-default.png written');
