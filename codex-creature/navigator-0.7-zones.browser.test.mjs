import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const root=process.cwd();
const server=createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const file=path.resolve(root,`.${pathname}`);
    if(!file.startsWith(root+path.sep))throw new Error('Path fora del Site');
    const types={'.html':'text/html','.mjs':'text/javascript'};
    response.writeHead(200,{'content-type':`${types[path.extname(file)]||'application/octet-stream'}; charset=utf-8`});
    response.end(await readFile(file));
  }catch{response.writeHead(404);response.end('No trobat')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage(),origin=`http://127.0.0.1:${server.address().port}`;
  const externalRequests=[];page.on('request',request=>{if(!request.url().startsWith(origin))externalRequests.push(request.url())});
  await page.goto(`${origin}/codex-creature/navigator-0.7-zones.html`,{waitUntil:'networkidle'});
  assert.match(await page.locator('header .notice').textContent(),/no llegeix ni modifica GitHub/i);
  await page.locator('input[value="pull-request.draft.create"]').check();
  await page.locator('#issueMandate').tap();
  assert.match(await page.locator('#zoneStatus').textContent(),/Mandat actiu/);
  const mandate=JSON.parse(await page.locator('#json').textContent()).mandate;
  assert.equal(mandate.repository,'Animic-Protein/Animic-Protein.github.io');
  assert.equal(mandate.usage.maxRequests,12);

  await page.locator('#operation').selectOption('repository.read');
  await page.locator('#resource').fill('governanca/NAVIGATOR_0.7_ZONES.md');
  await page.locator('#requestOperation').tap();
  let trace=JSON.parse(await page.locator('#json').textContent());
  assert.equal(trace.requests[0].status,'authorized-awaiting-adapter');
  assert.equal(trace.requests[0].execution,'not-executed');

  await page.locator('#operation').selectOption('pull-request.draft.create');
  await page.locator('#draftTitle').fill('Proposta sintètica');
  await page.locator('#requestOperation').tap();
  trace=JSON.parse(await page.locator('#json').textContent());
  assert.equal(trace.requests[1].status,'human-approval-required');
  assert.equal(trace.requests[1].execution,'not-executed');
  await page.getByRole('button',{name:'Aprovar aquesta petició'}).tap();
  trace=JSON.parse(await page.locator('#json').textContent());
  assert.equal(trace.requests[1].status,'authorized-awaiting-adapter');
  assert.equal(trace.requests[1].humanDecision.decision,'approve');
  assert.equal(trace.requests[1].humanDecision.actionDigest,trace.requests[1].actionDigest);
  assert.equal(trace.execution,'not-executed');

  await page.locator('#operation').selectOption('pull-request.merge');
  await page.locator('#requestOperation').tap();
  trace=JSON.parse(await page.locator('#json').textContent());
  assert.equal(trace.events.at(-1).reason,'operation-outside-zone-mandate');
  assert.equal(trace.requests.length,2,'merge no crea una petició autoritzada');
  await page.locator('#revokeMandate').tap();
  trace=JSON.parse(await page.locator('#json').textContent());
  assert.equal(trace.mandate.status,'revoked');
  assert.equal(trace.requests[1].status,'revoked','revocation also closes an approved but unexecuted handoff');
  assert.equal(await page.locator('#requestOperation').isDisabled(),true);
  await page.locator('#dissolve').tap();
  assert.equal(await page.locator('#json').textContent(),'{}');
  assert.deepEqual(externalRequests,[],'la passada no contacta amb cap servei extern');
  await context.close();
  console.log('NAVIGATOR 0.7 zones · GitHub scope, one-use approval, veto, revocation, dissolution and no external execution: OK');
}finally{
  await browser?.close();
  await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
}
