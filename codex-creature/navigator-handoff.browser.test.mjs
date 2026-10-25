import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createNavigatorInvocation} from '../governanca/navigator-contract.mjs';
import {
  observeCompletedCreatureFixtureHandoff,
  prepareCreatureFixtureHandoff
} from './navigator-handoff-adapter.mjs';

const root=process.cwd();
const prefix='/codex/';
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
  context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const blockedOrigins=[];
  const origin=`http://127.0.0.1:${server.address().port}`;
  await context.route('**/*',route=>{
    const requestUrl=new URL(route.request().url());
    if(requestUrl.origin===origin)return route.continue();
    blockedOrigins.push(requestUrl.origin);
    return route.abort();
  });
  const source={
    id:'fixture:navigator-handoff-source',version:1,title:'Fragment fictici Harmonia',
    content:'Pedal blau de prova',author:'Fixture de prova',origin:'harmonia',
    destination:'melodia',decision:'draft',createdAt:'2026-10-25T00:00:00.000Z',
    updatedAt:'2026-10-25T00:00:00.000Z',file:null,
    events:[{type:'created',decision:'fixture-only'}]
  };
  await context.addInitScript(fragment=>{
    localStorage.setItem('codex-creature-fragments-v1',JSON.stringify([fragment]));
  },source);
  const page=await context.newPage();
  await page.goto(`${origin}${prefix}codex-creature/`);

  const fixture={
    id:'fixture:navigator-handoff-pass',kind:'fictional-fixture',
    isolation:'navigator-sandbox-0.1',synthetic:true,containsUserData:false,
    localOnly:true,canonical:false,reversible:true,
    sourceFragmentId:source.id,fromDepartment:'HARMONIA',toDepartment:'MELODIA'
  };
  const opened=createNavigatorInvocation({
    invokerKind:'artificial',
    purpose:'NAVIGATOR 0.3 · prova de traspàs fictici',
    fixture,
    instruments:['HARMONIA','MELODIA'],
    operations:['creature.transfer.fixture']
  });
  assert.equal(opened.accepted,true);

  const prepared=await prepareCreatureFixtureHandoff({page,invocation:opened.invocation,fixture});
  assert.equal(prepared.accepted,true);
  assert.equal(prepared.status,'awaiting-human-decision');
  assert.equal(prepared.humanDecision,null);
  let fragments=await page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-fragments-v1')||'[]'));
  assert.equal(fragments.length,1,'Preparation does not create a received copy');
  assert.equal(fragments[0].decision,'draft','Preparation leaves the human decision pending');

  const stillPending=await observeCompletedCreatureFixtureHandoff({page,invocation:prepared.invocation,fixture});
  assert.equal(stillPending.accepted,false);
  assert.equal(stillPending.reason,'human-approval-pending');
  assert.equal(stillPending.humanDecision,null);

  // Synthetic UI action for this fixture test only; it is not evidence of a real person's approval.
  await page.locator(`#list-harmonia [data-action="approve"][data-id="${source.id}"]`).click();
  const completed=await observeCompletedCreatureFixtureHandoff({page,invocation:prepared.invocation,fixture});
  assert.equal(completed.accepted,true);
  assert.equal(completed.status,'completed');
  assert.equal(completed.humanDecision,null);
  assert.equal(completed.invocation.status,'closed');
  assert.equal(completed.invocation.humanDecision,null);
  assert.equal(completed.invocation.events.filter(event=>event.type==='sandbox-operation').length,2);

  fragments=await page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-fragments-v1')||'[]'));
  const original=fragments.find(fragment=>fragment.id===source.id);
  const received=fragments.find(fragment=>fragment.parentId===source.id);
  assert.equal(fragments.length,2);
  assert.equal(original.content,source.content,'The original stays intact');
  assert.equal(original.decision,'transfer-approved');
  assert.equal(received.origin,'melodia');
  assert.equal(received.content,source.content);
  assert.equal(received.decision,'received-copy');
  assert.equal(received.events[0].decision,'human-approved');
  assert.equal(blockedOrigins.length,0,'The browser context made no external network requests');

  await context.close();
  context=null;
  console.log('NAVIGATOR 0.3 fixture handoff: pending gate, human approval path, verified copy and isolated context disposal: OK');
}finally{
  await context?.close();
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
