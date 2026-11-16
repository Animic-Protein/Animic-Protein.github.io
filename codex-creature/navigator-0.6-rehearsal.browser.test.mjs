import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const file=path.join(process.cwd(),'codex-creature','navigator-0.6-rehearsal.html');
const server=createServer(async(_request,response)=>{response.writeHead(200,{'content-type':'text/html; charset=utf-8'});response.end(await readFile(file))});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage(),base='http://127.0.0.1:'+server.address().port+'/';
 await page.goto(base);
 await page.getByRole('button',{name:'Obrir travessa sintètica'}).click();
 await page.getByRole('button',{name:'Acceptar per a l’assaig'}).click();
 assert.equal(await page.locator('#json').textContent().then(text=>JSON.parse(text).mode),'session-only-synthetic');
 assert.deepEqual(await page.locator('.phase h3').allTextContents(),['1 · ATTENTIO','2 · RETENTIO','3 · DISCRIMEN','4 · QUIES / REOBSERVE','5 · METACOGNITIO']);
 for(let i=0;i<5;i++){
  if(i===2){
   await page.getByRole('button',{name:'Reobservar aquesta disposició'}).click();
   const trace=JSON.parse(await page.locator('#json').textContent());
   assert.equal(trace.events.at(-1).type,'reobserve');
  }
  await page.locator('#thresholdChoice').selectOption('met');
  await page.getByRole('button',{name:'Registrar llindar i continuar'}).click();
 }
 let trace=JSON.parse(await page.locator('#json').textContent());
 assert.equal(trace.status,'completed');
 assert.equal(trace.events.filter(event=>event.type==='human-threshold-recorded').length,5);
 assert.equal(trace.events.some(event=>/external-executed|executor-invoked/.test(event.type)),false);
 await page.getByRole('button',{name:'Dissoldre el rastre'}).click();
 assert.equal(await page.locator('#json').textContent(),'{}');
 await page.close();

 const uncertain=await context.newPage();await uncertain.goto(base);
 await uncertain.getByRole('button',{name:'Obrir travessa sintètica'}).click();
 await uncertain.getByRole('button',{name:'Acceptar per a l’assaig'}).click();
 await uncertain.locator('#thresholdChoice').selectOption('unknown');
 assert.equal(await uncertain.getByRole('button',{name:'Registrar llindar i continuar'}).isDisabled(),true,'Unobserved threshold cannot advance the pass');
 await uncertain.getByRole('button',{name:'Entrar en quietud'}).click();
 const paused=JSON.parse(await uncertain.locator('#json').textContent());
 assert.equal(paused.status,'paused');assert.ok(paused.events.some(event=>event.type==='quiet'));
 await uncertain.close();

 const alternatives=await context.newPage();await alternatives.goto(base);
 await alternatives.getByRole('button',{name:'Obrir travessa sintètica'}).click();
 const firstProposal=JSON.parse(await alternatives.locator('#json').textContent()).proposal.id;
 await alternatives.locator('#proposalEdit').fill('Proposta corregida, només dins del fixture.');
 await alternatives.getByRole('button',{name:'Corregir / substituir'}).click();
 let revised=JSON.parse(await alternatives.locator('#json').textContent());
 assert.equal(revised.alternatives[0].id,firstProposal);assert.equal(revised.proposal.reviewed,false);
 await alternatives.getByRole('button',{name:'Recuperar alternativa anterior'}).click();
 revised=JSON.parse(await alternatives.locator('#json').textContent());
 assert.equal(revised.proposal.id,firstProposal);assert.equal(revised.proposal.reviewed,false);
 assert.ok(revised.events.some(event=>event.type==='alternative-restored'));
 await alternatives.close();

 const rejected=await context.newPage();await rejected.goto(base);
 await rejected.getByRole('button',{name:'Obrir travessa sintètica'}).click();
 await rejected.getByRole('button',{name:'Rebutjar proposta'}).click();
 const rejectedTrace=JSON.parse(await rejected.locator('#json').textContent());
 assert.equal(rejectedTrace.proposal.status,'rejected');
 assert.ok(rejectedTrace.events.some(event=>event.type==='human-evaluation'&&event.choice==='reject'));
 assert.equal(rejectedTrace.status,'rejected');
 await rejected.close();

 const revoked=await context.newPage();await revoked.goto(base);
 await revoked.getByRole('button',{name:'Obrir travessa sintètica'}).click();
 await revoked.getByRole('button',{name:'Acceptar per a l’assaig'}).click();
 await revoked.getByRole('button',{name:'Obrir delegació de fixture'}).click();
 await revoked.getByRole('button',{name:'Retirar delegació'}).click();
 const revokedTrace=JSON.parse(await revoked.locator('#json').textContent());
 assert.equal(revokedTrace.delegation.status,'revoked');
 assert.ok(revokedTrace.events.some(event=>event.type==='delegation-revoked'));
 assert.ok(revokedTrace.events.some(event=>event.type==='delegation-opened'));
 await context.close();
 console.log('NAVIGATOR 0.6 synthetic passes: five human-set thresholds, uncertainty gate, reobservation, rejection, quiet, delegation revocation and reversible dissolution: OK');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
