import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {NAVIGATOR_INSTRUMENTS,NAVIGATOR_SANDBOX_OPERATIONS} from '../governanca/navigator-contract.mjs';

const root=process.cwd();
const file=path.join(root,'codex-creature','navigator-0.5-rehearsal.html');
const server=createServer(async(_request,response)=>{
  response.writeHead(200,{'content-type':'text/html; charset=utf-8'});
  response.end(await readFile(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const base=`http://127.0.0.1:${server.address().port}/`;
  async function newMission(){
    const page=await context.newPage();
    await page.goto(base);
    await page.getByRole('button',{name:'Emetre mandat humà i invocar NAVIGATOR'}).click();
    await page.getByRole('button',{name:'Sol·licitar efecte external'}).click();
    return page;
  }
  async function exportTrace(page){
    const downloadPromise=page.waitForEvent('download');
    await page.getByRole('button',{name:'Exportar JSON'}).click();
    const download=await downloadPromise;
    const target=path.join(await import('node:os').then(os=>os.tmpdir()),`navigator-0.5-${Date.now()}.json`);
    await download.saveAs(target);
    const trace=JSON.parse(await readFile(target,'utf8'));
    await (await import('node:fs/promises')).unlink(target);
    return trace;
  }

  const scopeCatalog=await context.newPage();
  await scopeCatalog.goto(base);
  const availableInstruments=await scopeCatalog.locator('#programScope input').evaluateAll(inputs=>inputs.map(input=>input.value));
  const availableOperations=await scopeCatalog.locator('#operationScope input').evaluateAll(inputs=>inputs.map(input=>input.value));
  assert.deepEqual(availableInstruments,[...NAVIGATOR_INSTRUMENTS,'CODEX_CREATURE'],'All contract instruments plus the existing Creature fixture are selectable');
  assert.deepEqual(availableOperations,[...NAVIGATOR_SANDBOX_OPERATIONS,'virtual-reversible'],'All contract operations plus the existing reversible fixture operation are selectable');
  await scopeCatalog.close();

  const outOfScope=await context.newPage();
  await outOfScope.goto(base);
  await outOfScope.getByRole('button',{name:'Emetre mandat humà i invocar NAVIGATOR'}).click();
  await outOfScope.locator('#instrument').selectOption('DISSENSUS');
  await outOfScope.locator('#operation').selectOption('dissensus.fixture');
  await outOfScope.getByRole('button',{name:'Delegar permís seleccionat'}).click();
  const outOfScopeState=JSON.parse(await outOfScope.evaluate(key=>sessionStorage.getItem(key),'navigator-0.5-rehearsal-v1'));
  assert.equal(outOfScopeState.events.at(-1).type,'delegation-denied');
  assert.equal(outOfScopeState.child,undefined,'An available option remains denied when it is absent from the human mandate');
  await outOfScope.close();

  const scopedDissensus=await context.newPage();
  await scopedDissensus.goto(base);
  await scopedDissensus.locator('#programScope input:checked').evaluateAll(inputs=>inputs.forEach(input=>{input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}))}));
  await scopedDissensus.locator('#operationScope input:checked').evaluateAll(inputs=>inputs.forEach(input=>{input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}))}));
  await scopedDissensus.locator('#programScope input[value="DISSENSUS"]').check();
  await scopedDissensus.locator('#operationScope input[value="dissensus.fixture"]').check();
  await scopedDissensus.getByRole('button',{name:'Emetre mandat humà i invocar NAVIGATOR'}).click();
  assert.equal(await scopedDissensus.locator('#programScope input[value="DISSENSUS"]').isDisabled(),true,'The human mandate scope is frozen after issue');
  await scopedDissensus.locator('#instrument').selectOption('DISSENSUS');
  await scopedDissensus.locator('#operation').selectOption('dissensus.fixture');
  await scopedDissensus.getByRole('button',{name:'Delegar permís seleccionat'}).click();
  const dissensusState=JSON.parse(await scopedDissensus.evaluate(key=>sessionStorage.getItem(key),'navigator-0.5-rehearsal-v1'));
  assert.deepEqual(dissensusState.mandate.programs,['DISSENSUS']);
  assert.deepEqual(dissensusState.mandate.operations,['dissensus.fixture']);
  assert.deepEqual(dissensusState.child.programs,['DISSENSUS']);
  assert.deepEqual(dissensusState.child.operations,['dissensus.fixture']);
  assert.deepEqual(dissensusState.child.capabilities,['dissensus.fixture']);
  await scopedDissensus.close();

  const incompleteTransfer=await context.newPage();
  await incompleteTransfer.goto(base);
  await incompleteTransfer.locator('#programScope input:checked').evaluateAll(inputs=>inputs.forEach(input=>{input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}))}));
  await incompleteTransfer.locator('#operationScope input:checked').evaluateAll(inputs=>inputs.forEach(input=>{input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}))}));
  await incompleteTransfer.locator('#programScope input[value="HARMONIA"]').check();
  await incompleteTransfer.locator('#operationScope input[value="creature.transfer.fixture"]').check();
  await incompleteTransfer.getByRole('button',{name:'Emetre mandat humà i invocar NAVIGATOR'}).click();
  await incompleteTransfer.locator('#instrument').selectOption('HARMONIA');
  await incompleteTransfer.locator('#operation').selectOption('creature.transfer.fixture');
  await incompleteTransfer.getByRole('button',{name:'Delegar permís seleccionat'}).click();
  const incompleteState=JSON.parse(await incompleteTransfer.evaluate(key=>sessionStorage.getItem(key),'navigator-0.5-rehearsal-v1'));
  assert.equal(incompleteState.events.at(-1).type,'delegation-denied','A transfer is denied unless both required instruments are in the mandate');
  assert.equal(incompleteState.child,undefined);
  await incompleteTransfer.close();

  const pairedTransfer=await context.newPage();
  await pairedTransfer.goto(base);
  await pairedTransfer.locator('#programScope input:checked').evaluateAll(inputs=>inputs.forEach(input=>{input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}))}));
  await pairedTransfer.locator('#operationScope input:checked').evaluateAll(inputs=>inputs.forEach(input=>{input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}))}));
  await pairedTransfer.locator('#programScope input[value="HARMONIA"]').check();
  await pairedTransfer.locator('#programScope input[value="MELODIA"]').check();
  await pairedTransfer.locator('#operationScope input[value="creature.transfer.fixture"]').check();
  await pairedTransfer.getByRole('button',{name:'Emetre mandat humà i invocar NAVIGATOR'}).click();
  await pairedTransfer.locator('#instrument').selectOption('HARMONIA');
  await pairedTransfer.locator('#operation').selectOption('creature.transfer.fixture');
  await pairedTransfer.getByRole('button',{name:'Delegar permís seleccionat'}).click();
  const pairedState=JSON.parse(await pairedTransfer.evaluate(key=>sessionStorage.getItem(key),'navigator-0.5-rehearsal-v1'));
  assert.deepEqual(pairedState.child.programs,['HARMONIA','MELODIA'],'A valid transfer delegation carries exactly the mandated pair');
  assert.deepEqual(pairedState.child.operations,['creature.transfer.fixture']);
  assert.deepEqual(pairedState.child.capabilities,['creature.transfer.fixture']);
  await pairedTransfer.close();

  const approved=await newMission();
  await approved.locator('#humanChoice').selectOption('approve');
  await approved.getByRole('button',{name:'Registrar resposta humana'}).click();
  const approvedTrace=await exportTrace(approved);
  const request=approvedTrace.events.find(event=>event.type==='permission-expansion-requested');
  const approval=approvedTrace.events.find(event=>event.type==='human-boundary-approved');
  assert.ok(request,'The synthetic permission request is preserved');
  assert.ok(approval,'The synthetic human approval is preserved');
  assert.equal(request.boundaryId,approval.boundaryId);
  assert.equal(request.actionDigest,approval.actionDigest);
  assert.equal(request.permissionRequest.boundaryId,approval.humanDecision.boundaryId);
  assert.equal(request.permissionRequest.actionDigest,approval.humanDecision.actionDigest);
  assert.deepEqual(approval.humanDecision,{actor:'human',decision:'approve',boundaryId:request.boundaryId,actionDigest:request.actionDigest,at:approval.humanDecision.at});
  assert.equal(approvedTrace.boundary,null,'The pending slot is cleared after the decision');
  assert.equal(approvedTrace.events.some(event=>/external-executed|executor-invoked/.test(event.type)),false,'Approval does not activate an executor');
  await approved.close();

  for(const choice of ['deny','quiet']){
    const page=await newMission();
    await page.locator('#humanChoice').selectOption(choice);
    await page.getByRole('button',{name:'Registrar resposta humana'}).click();
    const trace=await exportTrace(page);
    const requestEvent=trace.events.find(event=>event.type==='permission-expansion-requested');
    const resolution=trace.events.find(event=>event.type==='human-boundary-resolved');
    assert.equal(resolution.boundaryId,requestEvent.boundaryId);
    assert.equal(resolution.actionDigest,requestEvent.actionDigest);
    assert.equal(resolution.humanDecision.decision,choice);
    assert.equal(resolution.permissionRequest.boundaryId,requestEvent.boundaryId);
    assert.equal(trace.events.some(event=>event.type==='human-boundary-approved'),false);
    await page.close();
  }

  const expired=await newMission();
  await expired.evaluate(()=>{
    const key='navigator-0.5-rehearsal-v1';
    const state=JSON.parse(sessionStorage.getItem(key));
    state.mandate.expiresAt=new Date(Date.now()-1000).toISOString();
    sessionStorage.setItem(key,JSON.stringify(state));
  });
  await expired.reload();
  const expiredTrace=await exportTrace(expired);
  const expiration=expiredTrace.events.find(event=>event.type==='permission-request-expired');
  const expiredRequest=expiredTrace.events.find(event=>event.type==='permission-expansion-requested');
  assert.equal(expiration.boundaryId,expiredRequest.boundaryId);
  assert.equal(expiration.actionDigest,expiredRequest.actionDigest);
  assert.equal(expiration.humanDecision,null);
  assert.equal(expiredTrace.status,'expired');
  await expired.close();

  const dissolved=await newMission();
  await dissolved.getByRole('button',{name:'Dissoldre el rastre'}).click();
  assert.equal(await dissolved.evaluate(()=>sessionStorage.getItem('navigator-0.5-rehearsal-v1')),null);
  assert.equal(await dissolved.locator('#jsonView').textContent(),'{}');
  assert.equal(await dissolved.getByRole('button',{name:'Exportar JSON'}).isDisabled(),true);
  await dissolved.close();
  await context.close();
  console.log('NAVIGATOR 0.5 synthetic rehearsal: permission catalog, scoped delegation, paired transfer, boundary approval, denial, quiet, expiry and dissolution: OK');
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
