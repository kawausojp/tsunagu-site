"""把 dist/ 轉成 Artifact 可用的相對路徑版本，輸出到 artifact-site/"""
import os,re,shutil,sys
SRC='dist'; DST=sys.argv[1]
BASE='/tsunagu-site'
if os.path.exists(DST): shutil.rmtree(DST)
files=[]
for root,_,fs in os.walk(SRC):
    for f in fs:
        sp=os.path.join(root,f); rel=os.path.relpath(sp,SRC)
        if rel.startswith('sitemap') or rel in ('robots.txt','404.html'): continue
        rel_out=rel.replace('_astro/','assets/',1)
        dp=os.path.join(DST,rel_out); os.makedirs(os.path.dirname(dp),exist_ok=True)
        if f.endswith('.html'):
            depth=rel.count('/'); up='../'*depth if depth else './'
            h=open(sp,encoding='utf-8').read()
            # 頁面連結：/tsunagu-site/x 或 /tsunagu-site/x/ → 相對 + index.html
            def page(m):
                path=m.group(2).strip('/')
                return m.group(1)+(up+'index.html' if not path else up+path+'/index.html')
            h=re.sub(r'(href=")'+BASE+r'(/(?:[a-z0-9\-]+(?:/[a-z0-9\-]+)*)?/?)(?=["#?])',page,h)
            # 資產：/tsunagu-site/_astro/... 及其他檔案
            h=h.replace(BASE+'/_astro/',up+'assets/')
            h=re.sub(r'(src=|href=|content=)"'+BASE+r'/([^"]+\.(?:png|webp|jpg|svg|ico|css|js|xml|txt))"',lambda m:m.group(1)+'"'+up+m.group(2)+'"',h)
            # srcset 內的多個路徑
            h=re.sub(r'(srcset=")([^"]+)"',lambda m:m.group(1)+m.group(2).replace(BASE+'/_astro/',up+'assets/')+'"',h)
            # 語言切換 hreflang 的絕對網址保留（無害）
            open(dp,'w',encoding='utf-8').write(h)
        else:
            shutil.copy2(sp,dp)
        files.append(rel_out)
print(len(files),'個檔案')
left=sum(1 for r in files if r.endswith('.html') and BASE+'/' in open(os.path.join(DST,r),encoding='utf-8').read().replace('https://kawausojp.github.io'+BASE,''))
print('殘留根路徑的 HTML:',left)
