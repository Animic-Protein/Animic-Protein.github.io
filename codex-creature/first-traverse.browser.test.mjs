import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const root=process.cwd();
const prefix='/codex/';
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf'};
const server=createServer(async(request,response)=>{
  try {
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    if(!pathname.startsWith(prefix))throw new Error('Outside Site');
    const relative=pathname.slice(prefix.length);
    const file=path.resolve(root,relative,pathname.endsWith('/')?'index.html':'');
    if(!file.startsWith(root+path.sep))throw new Error('Outside Site');
    response.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});
    response.end(await readFile(file));
  } catch {response.writeHead(404);response.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
let tempDir;
try {
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  const base=`http://127.0.0.1:${server.address().port}${prefix}`;

  // Enter through the canonical home page so its service worker controls Creature.
  await page.goto(base);
  await page.evaluate(async()=>{
    const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('Service worker did not become ready within 60 seconds')),60000));
    await Promise.race([navigator.serviceWorker.ready,timeout]);
    if(!navigator.serviceWorker.controller)await Promise.race([new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true})),timeout]);
  });
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'sw.js');
  pageErrors.length=0;
  await page.locator('a[href="./codex-creature/"]').click();
  await page.waitForURL('**/codex-creature/');
  assert.equal(await page.title(),'Còdex Creature · Matriu escènica');
  assert.equal(await page.locator('.dept-card').count(),6,'All six departments render');
  assert.equal(await page.locator('.workspace').count(),7,'Six department workspaces plus transversal arrangements render');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Mobile page has no horizontal overflow');
  assert.equal(await page.locator('.dept-grid').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length),1,'Department cards use a single mobile column');

  const departments=[
    {id:'harmonia',title:'Fragment fictici · Harmonia',content:'Pedal blau'},
    {id:'melodia',title:'Fragment fictici · Melodia',content:'Tres notes ascendents'},
    {id:'ritme',title:'Fragment fictici · Ritme',content:'Pols 6/8'},
    {id:'lyrics',title:'Fragment fictici · Lyrics',content:'Quan el mar calla'},
    {id:'audiovideo',title:'Fragment fictici · Audio/Video',content:'Llum lenta'},
    {id:'misce',title:'Fragment fictici · Misce',content:'Objecte sense cambra'}
  ];
  for(const d of departments){
    await page.locator(`#${d.id}-title`).fill(d.title);
    await page.locator(`#${d.id}-content`).fill(d.content);
    await page.locator(`#${d.id}-author`).fill('Dada fictícia de prova');
    await page.locator(`form[data-form="${d.id}"] button[type="submit"]`).click();
    assert.equal(await page.locator(`#list-${d.id} .fragment`).count(),1,`${d.id} saves its fragment`);
  }

  const originalId=await page.locator('[data-dest]').first().getAttribute('data-dest');
  await page.locator(`[data-dest="${originalId}"]`).selectOption('melodia');
  await page.locator(`[data-action="approve"][data-id="${originalId}"]`).first().click();
  let fragments=await page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-fragments-v1')||'[]'));
  const original=fragments.find(fragment=>fragment.id===originalId);
  const received=fragments.find(fragment=>fragment.parentId===originalId);
  assert.equal(original.content,'Pedal blau','The original content remains intact after an approved handoff');
  assert.equal(original.decision,'transfer-approved','Handoff approval is recorded on the source');
  assert.equal(received.origin,'melodia');
  assert.equal(received.content,'Pedal blau');
  assert.equal(received.decision,'received-copy');
  assert.equal(received.events[0].decision,'human-approved');

  await page.locator('#arrangementScope').selectOption('song');
  await page.locator('input#arrangementTitle').fill('Assaig fictici de la cançó');
  await page.locator('#arrangementAuthor').fill('Autoria de prova');
  await page.locator('#arrangementSourceFragment').selectOption(originalId);
  await page.locator('input[name="departments"][value="harmonia"]').check();
  await page.locator('input[name="departments"][value="melodia"]').check();
  await page.locator('#arrangementIntention').fill('Prova tècnica; cap decisió artística prescrita.');
  await page.locator('#arrangementForm button[type="submit"]').click();
  let arrangement=await page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-arrangements-v1')||'[]')[0]);
  assert.equal(arrangement.sourceFragment.id,originalId);
  assert.deepEqual(Object.keys(arrangement.sourceFragment).sort(),['id','origin','title','version'].sort(),'Arrangement links to source metadata without copying fragment content');
  assert.deepEqual(arrangement.departments,['harmonia','melodia']);
  assert.equal(arrangement.decision,'open','Creating an arrangement does not decide its artistic outcome');
  assert.equal(await page.evaluate(()=>localStorage.getItem('codex-creature-fragments-v1')!==null&&localStorage.getItem('codex-creature-arrangements-v1')!==null),true,'Separate stores exist');

  const variantForm=page.locator('form[data-arr-variant-form]').first();
  await variantForm.locator('input[name="title"]').fill('Variant de densitat');
  await variantForm.locator('select[name="axis"]').selectOption('density');
  await variantForm.locator('select[name="department"]').selectOption('ritme');
  await variantForm.locator('textarea[name="note"]').fill('Retirar una capa durant un compàs; només una proposta.');
  await variantForm.locator('button[type="submit"]').click();
  arrangement=await page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-arrangements-v1')||'[]')[0]);
  assert.equal(arrangement.variants[0].decision,'per-provar','A variant awaits a human decision');
  assert.equal(arrangement.variants[0].axis,'density');
  assert.equal(arrangement.variants[0].department,'ritme');
  await page.locator('[data-arr-decision="oberta"]').first().click();
  arrangement=await page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-arrangements-v1')||'[]')[0]);
  assert.equal(arrangement.variants[0].decision,'oberta');
  assert.equal(arrangement.variants[0].events.at(-1).actor,'human');
  fragments=await page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-fragments-v1')||'[]'));
  assert.equal(fragments.find(fragment=>fragment.id===originalId).content,'Pedal blau','Arrangement variants do not alter the original fragment');

  tempDir=await mkdtemp(path.join('/tmp','codex-creature-traverse-'));
  const arrangementDownloadEvent=page.waitForEvent('download');
  await page.locator('#exportArrangements').click();
  const arrangementDownload=await arrangementDownloadEvent;
  const arrangementPath=path.join(tempDir,'arrangements.json');
  await arrangementDownload.saveAs(arrangementPath);
  const fragmentDownloadEvent=page.waitForEvent('download');
  await page.locator('#exportAll').click();
  const fragmentDownload=await fragmentDownloadEvent;
  const fragmentPath=path.join(tempDir,'fragments.json');
  await fragmentDownload.saveAs(fragmentPath);
  const arrangementExport=JSON.parse(await readFile(arrangementPath,'utf8'));
  const fragmentExport=JSON.parse(await readFile(fragmentPath,'utf8'));
  assert.equal(arrangementExport.format,'codex-creature-arrangements');
  assert.equal(fragmentExport.format,'codex-creature-fragments');
  assert.equal(arrangementExport.arrangements[0].variants[0].decision,'oberta');
  assert.equal(fragmentExport.fragments.length,7,'Fragment export includes six originals and the received copy');

  // Clearing either key must leave the other data set intact; both exports restore independently.
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#clearArrangements').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('codex-creature-arrangements-v1')||'[]').length===0);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-fragments-v1')||'[]').length),7);
  await page.locator('#importArrangements').setInputFiles(arrangementPath);
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('codex-creature-arrangements-v1')||'[]').length===1);
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#clearAll').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('codex-creature-fragments-v1')||'[]').length===0);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-arrangements-v1')||'[]').length),1);
  await page.locator('#importAll').setInputFiles(fragmentPath);
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('codex-creature-fragments-v1')||'[]').length===7);
  arrangement=await page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-arrangements-v1')||'[]')[0]);
  assert.equal(arrangement.variants[0].decision,'oberta','Arrangement JSON restores the human decision');

  // Mobile section links remain usable; then test cached navigation after network loss.
  for(const id of ['harmonia','melodia','ritme','lyrics','audiovideo','misce','arranjaments']){
    const link=id==='arranjaments'?page.locator('.cross-link a[href="#arranjaments"]'):page.locator(`.dept-nav a[href="#${id}"]`);
    await link.click();
    assert.equal(new URL(page.url()).hash,`#${id}`,`Mobile navigation reaches #${id}`);
  }
  await context.setOffline(true);
  await page.goto(base);
  assert.equal(await page.title(),'Anímic Protein · Còdex Viu','Canonical home remains available offline');
  await page.locator('a[href="./codex-creature/"]').click();
  await page.waitForURL('**/codex-creature/');
  assert.equal(await page.title(),'Còdex Creature · Matriu escènica','Creature route remains available offline');
  assert.equal(await page.locator('.dept-card').count(),6);
  assert.equal(await page.locator('.workspace').count(),7);
  arrangement=await page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-arrangements-v1')||'[]')[0]);
  assert.equal(arrangement.variants[0].decision,'oberta','Offline reload retains local arrangement data');
  assert.deepEqual(pageErrors,[],'Creature scripts execute without browser errors');
  console.log('Còdex Creature: six departments, human-approved handoff, independent arrangement/fragment JSON, mobile navigation and offline reload: OK');
} finally {
  await browser?.close();
  if(tempDir)await rm(tempDir,{recursive:true,force:true});
  await new Promise(resolve=>server.close(resolve));
}
