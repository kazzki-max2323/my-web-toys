// オフライン対応と「更新がかならず届く」しくみ（ひな形）
// 使い方は同じフォルダの README.md を見てください。アプリを更新したら CACHE の数字を1つ上げる。
//  - インストール時は画面の部品（CORE）だけを保存する。大きい音声・動画をまとめて取りにいくと、1つ失敗しただけで更新が止まるため
//  - 音声・動画は使ったときに MEDIA に保存し、版が変わっても消さない
//  - いつもネットの最新版を先に取りにいき（変わっていなければ304で軽い）、つながらない・遅いときだけ保存した物を使う
const CACHE='postal-guide-v3',MEDIA='postal-guide-media';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
const IS_MEDIA=/\.(mp3|m4a|ogg|wav|mp4|webm)$/i;

self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>fetch(u,{cache:'reload'}).then(r=>{if(r.ok)return c.put(u,r)}).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==MEDIA).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||r.headers.has('range'))return;const u=new URL(r.url);
  // Tailwind（cdn.tailwindcss.com）も保存しておかないと、オフラインで画面がくずれる
  if(/fonts\.(googleapis|gstatic)\.com|cdn\.tailwindcss\.com/.test(u.host)){e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})));return}
  if(u.origin!==self.location.origin)return;
  const store=IS_MEDIA.test(u.pathname)?MEDIA:CACHE,key=r.mode==='navigate'?'./':r;
  const net=fetch(r.url,{cache:'no-cache'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(store).then(c=>c.put(key,cp))}return res});
  const old=caches.match(key);
  e.respondWith(new Promise(done=>{let over=false;const fin=v=>{if(!over&&v){over=true;done(v)}};
    net.then(fin,()=>old.then(h=>fin(h||Response.error())));
    setTimeout(()=>old.then(fin),store===MEDIA?8000:4000)}))});
