import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const root=process.cwd();
const prefix='/codex/';
const stateKey='codex-navigator-matrix-iphone-v1';
const fragmentKey='codex-creature-fragments-v1';
const arrangementKey='codex-creature-arrangements-v1';
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json'};
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    if(!pathname.startsWith(prefix))throw new Error('Outside Site');
    const relative=pathname.slice(prefix.length);
    const file=path.resolve(root,relative,pathname.endsWith('/')?'index.html':'');
    if(!file.startsWith(root+path.sep))throw new Error('Outside Site');
    response.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});
    response.end(await readFile(file));
  }catch{response.writeHead(404);response.end('Not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));

let browser;
let context;
try{
  browser=await chromium.launch({headless:true});
  context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
  const origin=`http://127.0.0.1:${server.address().port}`;
  const base=`${origin}${prefix}`;
  const page=await context.newPage();
  const requests=[];
  page.on('request',request=>requests.push(request.url()));
  const realFragments=JSON.stringify([{id:'REAL-01',title:'Material humà',decision:'draft'}]);
  const realArrangements=JSON.stringify([{id:'ARR-01',title:'Arranjament real',decision:'open'}]);
  await page.goto(base);
  await page.evaluate(async()=>{
    await navigator.serviceWorker.ready;
    if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
  });
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller?.scriptURL),base+'sw.js');
  const precache=await page.evaluate(async()=>{
    const keys=await caches.keys();
    const cache=await caches.open(keys.find(key=>key.startsWith('codex-viu-canonical-'))||'');
    const urls=(await cache.keys()).map(request=>new URL(request.url).pathname);
    return {
      cacheName:keys.find(key=>key.startsWith('codex-viu-canonical-')),
      html:urls.includes('/codex/codex-creature/index.html'),
      module:urls.includes('/codex/codex-creature/navigator-matrix-iphone.mjs')
    };
  });
  assert.ok(precache.cacheName,'The canonical service-worker cache is installed');
  assert.equal(precache.html,true,'Còdex Creature HTML is preloaded');
  assert.equal(precache.module,true,'The MATRIX module is preloaded');
  await page.evaluate(({fragmentKey,arrangementKey,realFragments,realArrangements})=>{
    localStorage.setItem(fragmentKey,realFragments);
    localStorage.setItem(arrangementKey,realArrangements);
  },{fragmentKey,arrangementKey,realFragments,realArrangements});

  await context.setOffline(true);
  await page.goto(`${base}codex-creature/?navigator-matrix=1#matrix`);
  await page.locator('#matrix').waitFor();
  assert.equal(await page.locator('#matrixHeading').innerText(),'Mandat humà. Travessa sintètica. Retorn exacte.');
  await page.locator('#matrixMandateForm button[type="submit"]').click();
  assert.match(await page.locator('#matrixStatus').innerText(),/Mandat humà emès/);
  assert.equal(await page.locator('#matrixActor').innerText(),'human');
  await page.locator('#matrixInvoke').click();
  assert.match(await page.locator('#matrixStatus').innerText(),/NAVIGATOR ha aplicat/);
  assert.equal(await page.locator('#matrixActor').innerText(),'artificial');
  assert.equal(await page.locator('#matrixFixtureContent').innerText(),'Pols cobalt B');
  const downloadEvent=page.waitForEvent('download');
  await page.locator('#matrixExport').click();
  const download=await downloadEvent;
  const trace=JSON.parse(await readFile(await download.path(),'utf8'));
  assert.equal(trace.format,'navigator-matrix-iphone-trace');
  assert.equal(trace.session.actorKind,'artificial');
  await page.locator('#matrixRollback').click();
  assert.match(await page.locator('#matrixStatus').innerText(),/Retrodansa verificada/);
  assert.equal(await page.locator('#matrixFixtureContent').innerText(),'Pols cobalt A');
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#matrixDissolve').click();
  assert.match(await page.locator('#matrixStatus').innerText(),/Rastre dissolt/);
  assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),stateKey),null);
  assert.equal(await page.evaluate(({fragmentKey,arrangementKey})=>
    localStorage.getItem(fragmentKey)===`${realFragments}`&&localStorage.getItem(arrangementKey)===`${realArrangements}`,
  {fragmentKey,arrangementKey}),true,'Offline rehearsal leaves the real stores untouched');
  assert.ok(requests.every(url=>url.startsWith(origin)||url.startsWith('blob:')),'No external request is made');
  console.log('NAVIGATOR MATRIX iPhone offline: precached HTML/module, mandate, invocation, export, Retrodansa and dissolution: OK');
}finally{
  await context?.close();
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
