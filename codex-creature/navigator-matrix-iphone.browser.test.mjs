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
  context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',acceptDownloads:true});
  const blockedOrigins=[];
  const origin=`http://127.0.0.1:${server.address().port}`;
  await context.route('**/*',route=>{
    const requestUrl=new URL(route.request().url());
    if(requestUrl.origin===origin||requestUrl.protocol==='blob:')return route.continue();
    blockedOrigins.push(requestUrl.origin);
    return route.abort();
  });
  const realFragments=JSON.stringify([{id:'REAL-01',title:'Material humà',author:'Autoria humana',origin:'lyrics',decision:'draft',events:[]}]);
  const realArrangements=JSON.stringify([{id:'ARR-01',title:'Arranjament real',author:'Autoria humana',decision:'open',events:[]}]);
  await context.addInitScript(({fragmentKey,arrangementKey,realFragments,realArrangements})=>{
    localStorage.setItem(fragmentKey,realFragments);
    localStorage.setItem(arrangementKey,realArrangements);
  },{fragmentKey,arrangementKey,realFragments,realArrangements});

  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.goto(`${origin}${prefix}codex-creature/?navigator-matrix=1#matrix`);
  await page.locator('#matrix').waitFor();
  assert.equal(await page.locator('#matrixHeading').innerText(),'Mandat humà. Travessa sintètica. Retorn exacte.');
  assert.equal(await page.locator('#matrixInvoke').isDisabled(),true);
  assert.equal(await page.evaluate(({fragmentKey,realFragments})=>localStorage.getItem(fragmentKey)===realFragments,{fragmentKey,realFragments}),true);

  await page.locator('[name="priorities"]').fill('Claredat abans de velocitat\nConservar el rastre mínim');
  await page.locator('#matrixMandateForm button[type="submit"]').click();
  assert.match(await page.locator('#matrixStatus').innerText(),/Mandat humà emès/);
  assert.equal(await page.locator('#matrixActor').innerText(),'human');
  assert.equal(await page.locator('#matrixInvoke').isEnabled(),true);
  let state=await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)),stateKey);
  assert.equal(state.mandate.actorKind,'human');
  assert.equal(state.mandate.priorities.at(-1).label,'Conservar el rastre mínim');
  assert.equal(state.humanDecision,null);

  await page.locator('[name="variant"]').selectOption('quies');
  await page.locator('#matrixInvoke').click();
  assert.match(await page.locator('#matrixStatus').innerText(),/NAVIGATOR ha aplicat/);
  assert.equal(await page.locator('#matrixActor').innerText(),'artificial');
  assert.equal(await page.locator('#matrixState').innerText(),'applied');
  assert.equal(await page.locator('#matrixDecision').innerText(),'null');
  assert.equal(await page.locator('#matrixFixtureContent').innerText(),'Silenci sintètic de prova');
  state=await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)),stateKey);
  assert.equal(state.session.events.at(-1).outcome,'applied');
  assert.equal(state.session.humanDecision,null);
  assert.equal(await page.evaluate(({fragmentKey,realFragments,arrangementKey,realArrangements})=>
    localStorage.getItem(fragmentKey)===realFragments&&localStorage.getItem(arrangementKey)===realArrangements,
  {fragmentKey,realFragments,arrangementKey,realArrangements}),true,'Normal Creature stores remain untouched after invocation');

  const downloadPromise=page.waitForEvent('download');
  await page.locator('#matrixExport').click();
  const download=await downloadPromise;
  const downloadPath=await download.path();
  const exported=JSON.parse(await readFile(downloadPath,'utf8'));
  assert.equal(exported.format,'navigator-matrix-iphone-trace');
  assert.equal(exported.session.actorKind,'artificial');
  assert.equal(exported.humanDecision,null);

  await page.locator('#matrixRollback').click();
  assert.match(await page.locator('#matrixStatus').innerText(),/Retrodansa verificada/);
  assert.equal(await page.locator('#matrixState').innerText(),'rolled-back');
  assert.equal(await page.locator('#matrixFixtureContent').innerText(),'Pols cobalt A');
  state=await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)),stateKey);
  assert.equal(state.trace.at(-1).outcome,'rolled-back');
  assert.equal(state.trace.at(-1).rollbackDigest,state.lastRollback.restoredDigest);

  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#matrixDissolve').click();
  assert.match(await page.locator('#matrixStatus').innerText(),/Rastre dissolt/);
  assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),stateKey),null);
  assert.equal(await page.evaluate(({fragmentKey,realFragments,arrangementKey,realArrangements})=>
    localStorage.getItem(fragmentKey)===realFragments&&localStorage.getItem(arrangementKey)===realArrangements,
  {fragmentKey,realFragments,arrangementKey,realArrangements}),true,'Dissolution leaves normal Creature stores untouched');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'The iPhone viewport has no horizontal overflow');
  assert.equal(blockedOrigins.length,0,'The MATRIX threshold made no external requests');
  assert.deepEqual(pageErrors,[]);

  await context.close();
  context=null;
  console.log('NAVIGATOR MATRIX iPhone threshold: mandate, invocation, export, exact Retrodansa, dissolution and store separation: OK');
}finally{
  await context?.close();
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
