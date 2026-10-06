import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {messages} from './dissensus-i18n.mjs';

const root=process.cwd();
const prefix='/codex/';
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.pdf':'application/pdf'};
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
try {
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const base=`http://127.0.0.1:${server.address().port}${prefix}`;
  // Fresh context: visit DISSENSUS directly, never the homepage or the PDF.
  await page.goto(base+'experiments/dissensus/');
  assert.equal(await page.locator('html').getAttribute('lang'),'ca');
  const fish=await page.locator('.fugu').boundingBox();
  assert.ok(fish&&fish.width>200&&fish.height>150&&fish.y<500,'Fugu must be visible at mobile entry');
  const sampleFish=async time=>page.evaluate(time=>{
    for(const animation of document.querySelector('.aquarium-scene').getAnimations({subtree:true})){
      if(['fugu-dive','fugu-inflate','fugu-spines'].includes(animation.animationName)){
        animation.pause();animation.currentTime=time;
      }
    }
    const shape=document.querySelector('.fugu-shape').getBoundingClientRect();
    const aquarium=document.querySelector('.aquarium-scene').getBoundingClientRect();
    const spines=getComputedStyle(document.querySelector('.fugu-spines'));
    return {width:shape.width,y:shape.y,bottom:shape.bottom,floor:aquarium.bottom,spines:Number.parseFloat(spines.strokeDashoffset),opacity:Number(spines.opacity)};
  },time);
  const upper=await sampleFish(0),deflated=await sampleFish(12600),inflated=await sampleFish(21000);
  assert.ok(deflated.width<upper.width*.9,'Fish deflates');
  assert.ok(deflated.y>upper.y+30,'Fish descends');
  assert.ok(inflated.width>deflated.width*1.2,'Fish reinflates at the bottom');
  assert.ok(deflated.spines>20&&inflated.spines<1&&inflated.opacity>.95,'Spines retract then deploy clearly');
  assert.ok(inflated.bottom<inflated.floor,`Inflated fish and spines fit in the mobile aquarium: ${JSON.stringify(inflated)}`);
  for(const lang of ['ur','tl','hi','ca']){
    await page.locator(`[data-language="${lang}"]`).click();
    assert.equal(await page.locator('html').getAttribute('lang'),lang);
    assert.equal(await page.locator('html').getAttribute('dir'),lang==='ur'?'rtl':'ltr');
    assert.equal(await page.locator('#invitation-title').textContent(),messages[lang].invitationTitle);
    assert.equal(await page.locator('#beginSession').textContent(),messages[lang].beginSession);
    assert.equal(await page.locator('#workbench').isVisible(),false,'Changing language cannot start a session');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No mobile overflow');
  }
  await page.locator('#beginSession').click();
  await page.locator('#support').fill('');
  await page.locator('#sourceText').fill('Fragment literal escrit per la persona');
  await page.locator('#uncertainty').fill('La meva incertesa');
  await page.locator('[data-decision="reject"]').click();
  await page.locator('#otherRoute').fill('Una ruta pròpia');
  await page.locator('#chooseOtherRoute').click();
  for(const lang of ['ur','tl','hi','ca']){
    await page.locator(`[data-language="${lang}"]`).click();
    assert.equal(await page.locator('#support').inputValue(),'');
    assert.equal(await page.locator('#sourceText').inputValue(),'Fragment literal escrit per la persona');
    assert.equal(await page.locator('#uncertainty').inputValue(),'La meva incertesa');
    assert.equal(await page.locator('#otherRoute').inputValue(),'Una ruta pròpia');
    assert.equal(await page.locator('#decisionStatus').textContent(),`${messages[lang].chose} ${messages[lang].decisionOtherTrace}. ${messages[lang].noTransform}`);
    assert.equal(await page.locator('#mutationSection').isVisible(),false);
    assert.match(await page.locator('#traceSummary').textContent(),new RegExp(messages[lang].rejectionRecorded));
  }
  await page.locator('[data-decision="transform"]').click();
  await page.locator('#mutationText').fill('Canvi exacte autoritzat a la prova automàtica');
  await page.locator('[data-language="ur"]').click();
  assert.equal(await page.locator('#mutationText').inputValue(),'Canvi exacte autoritzat a la prova automàtica');
  assert.equal(await page.locator('#authorizeMutation').isEnabled(),true);
  await page.locator('#authorizeMutation').click();
  await page.locator('[data-language="hi"]').click();
  const downloadEvent=page.waitForEvent('download');
  await page.locator('#exportTrace').click();
  const download=await downloadEvent;
  const trace=JSON.parse(await readFile(await download.path(),'utf8'));
  assert.equal(trace.case.validationStatus,'not-validated-empirically-with-a-participant');
  assert.equal(trace.interfaceLanguage,'hi');
  assert.equal(trace.humanDecision.choice,'transform');
  assert.equal(trace.mutatio.exactChange,'Canvi exacte autoritzat a la prova automàtica');
  assert.equal(trace.source.text,'Fragment literal escrit per la persona');
  assert.ok(trace.humanRejection,'Rejection must survive language changes');
  await page.locator('#dissolve').click();
  assert.equal(await page.locator('#support').inputValue(),messages.hi.supportDefault);
  await page.locator('[data-language="ca"]').click();
  assert.equal(await page.locator('#support').inputValue(),messages.ca.supportDefault);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.fugu').evaluate(node=>getComputedStyle(node).animationName),'none');
  assert.equal(await page.locator('.fugu-shape').evaluate(node=>getComputedStyle(node).animationName),'none');
  assert.equal(await page.locator('.fugu-spines').evaluate(node=>getComputedStyle(node).animationName),'none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(async()=>{
    await navigator.serviceWorker.ready;
    if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
  });
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL),base+'sw.js');
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button',{name:'Sí, començar una passada',exact:true}).click();
  await page.getByRole('button',{name:'Rebutjar-la i triar una altra ruta',exact:true}).click();
  assert.match(await page.locator('#decisionStatus').textContent(),/Rebutjar REOBSERVAR/);
  await page.getByRole('button',{name:'Aturar la prova',exact:true}).click();
  assert.equal(await page.locator('#mutationSection').isVisible(),false);
  assert.equal(await page.locator('#stopNotice').isVisible(),true);
  const pdf='experiments/dissensus/DISSENSUS-guia-CAT-RU-KO-YUE-reparat.pdf';
  const bytes=await page.evaluate(async url=>{
    const response=await fetch(url);
    if(!response.ok||!response.headers.get('content-type')?.includes('application/pdf'))throw new Error('Offline PDF unavailable');
    return [...new Uint8Array(await response.arrayBuffer())];
  },base+pdf);
  assert.deepEqual(Buffer.from(bytes),await readFile(path.join(root,pdf)));
  assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
  console.log('DISSENSUS: four languages, preserved edits/decisions, RTL, visible Fugu, reduced motion and direct offline access: OK');
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
