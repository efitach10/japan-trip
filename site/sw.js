// Cache scope is unique to this Pages repository, including on a shared github.io origin.
const PREFIX='our-japan-pwa:'+new URL(self.registration.scope).pathname+':';
const CACHE=PREFIX+'6ded0baee1ee';
const FILES=['./index.html','./manifest.webmanifest','./icon-couple-180.png','./icon-couple-192.png','./icon-couple-512.png','./icon-couple-maskable-512.png'];
const absolute=f=>new URL(f,self.registration.scope).href;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(absolute))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(e.request.mode==='navigate'){
  // Query strings from the home-screen launch also work offline.
  e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match(absolute('./index.html'))).then(hit=>hit||Response.error())));return;
 }
 e.respondWith(caches.open(CACHE).then(c=>c.match(e.request)).then(hit=>hit||fetch(e.request)));
});
self.addEventListener('message',e=>{
 if(e.data==='check-offline')e.waitUntil(caches.open(CACHE).then(async c=>{
  const hits=await Promise.all(FILES.map(f=>c.match(absolute(f))));
  e.ports[0]?.postMessage(hits.every(Boolean)?'offline-ready':'not-ready');
 }));
});
