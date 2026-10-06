import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

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
  console.log('DISSENSUS: direct mobile entry, offline reload, rejection/stop and uncached PDF download: OK');
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
