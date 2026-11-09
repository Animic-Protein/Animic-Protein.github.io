import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

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
  console.log('NAVIGATOR 0.5 synthetic rehearsal: approval, denial, quiet, expiry and dissolution: OK');
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
