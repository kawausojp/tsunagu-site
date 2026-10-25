// IG 貼文原文抓取（2026-10-25 網誌化改版）。未登入讀公開貼文，只讀不互動。
// 用法：node scripts/ig/fetch.mjs <輸出資料夾> <igCode> [<igCode> …]
//   → <輸出資料夾>/<igCode>.txt（說明文字全文）與 .meta（發文時間）。PAT 環境變數可換比對字串（預設「透過ツナグ」）。
// 前輩分享 md 的段落要逐字取自 .txt（content.config.ts 會驗證標題／引言是原文子字串）。
// Chrome 路徑可用 CHROME 環境變數指定（預設為本機 puppeteer 的 chrome-headless-shell）。
import { chromium } from 'playwright-core';
import fs from 'fs';
const dir=process.argv[2]; const codes=process.argv.slice(3);
const browser=await chromium.launch({executablePath:process.env.CHROME||'/Users/kawauso/.cache/puppeteer/chrome-headless-shell/mac_arm-152.0.7977.42/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const ctx=await browser.newContext({viewport:{width:1280,height:900},locale:'zh-TW',userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'});
const p=await ctx.newPage();
for(const c of codes){
  try{
    await p.goto(`https://www.instagram.com/p/${c}/`,{waitUntil:'domcontentloaded',timeout:30000});
    await p.waitForTimeout(4000);
    const r=await p.evaluate((process_env_pat)=>{
      const els=[...document.querySelectorAll('span,div')].filter(e=>e.children.length<60&&e.innerText&&(e.innerText.includes(process_env_pat)));
      els.sort((a,b)=>a.innerText.length-b.innerText.length);
      const times=[...document.querySelectorAll('time')].map(x=>x.getAttribute('datetime')+'|'+x.innerText);
      return {text:els[0]?.innerText||'',times};
    }, process.env.PAT||'透過ツナグ');
    fs.writeFileSync(`${dir}/${c}.txt`, r.text);
    fs.writeFileSync(`${dir}/${c}.meta`, r.times.join('\n'));
    console.log(c, r.text.length, r.times.join(' ; '));
  }catch(e){console.log(c,'ERR',e.message.slice(0,80))}
}
await browser.close();
