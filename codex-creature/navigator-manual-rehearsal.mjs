import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {
  closeNavigatorInvocation,
  createNavigatorInvocation,
  recordNavigatorSuggestion
} from '../governanca/navigator-contract.mjs';
import {
  observeCompletedCreatureFixtureHandoff,
  prepareCreatureFixtureHandoff
} from './navigator-handoff-adapter.mjs';

const host='127.0.0.1';
const prefix='/codex-creature/';
const root=process.cwd();
const htmlPath=path.join(root,'codex-creature','index.html');
const fragmentKey='codex-creature-fragments-v1';
const arrangementKey='codex-creature-arrangements-v1';
const sourceId='fixture:navigator-manual-source';
const fixture={
  id:'fixture:navigator-manual-handoff',
  kind:'fictional-fixture',
  isolation:'navigator-sandbox-0.1',
  synthetic:true,
  containsUserData:false,
  localOnly:true,
  canonical:false,
  reversible:true,
  sourceFragmentId:sourceId,
  fromDepartment:'HARMONIA',
  toDepartment:'MELODIA'
};
const departments=['HARMONIA','MELODIA'];
const operations=['suggest','creature.transfer.fixture'];
const source={
  id:sourceId,
  version:1,
  title:'Fixture NAVIGATOR · traspàs fictici',
  content:'Tres notes ascendents; material sintètic de prova, sense obra real.',
  author:'Fixture local NAVIGATOR',
  origin:'harmonia',
  destination:'melodia',
  decision:'draft',
  createdAt:'2026-10-25T00:00:00.000Z',
  updatedAt:'2026-10-25T00:00:00.000Z',
  file:null,
  events:[{type:'created',decision:'fixture-only'}]
};

const server=createServer(async(request,response)=>{
  const pathname=new URL(request.url,'http://127.0.0.1').pathname;
  if(request.method!=='GET'||![prefix,`${prefix}index.html`].includes(pathname)){
    response.writeHead(404,{'content-type':'text/plain; charset=utf-8'});
    response.end('Not found');
    return;
  }
  try{
    response.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
    response.end(await readFile(htmlPath));
  }catch(error){
    response.writeHead(500,{'content-type':'text/plain; charset=utf-8'});
    response.end(`Unable to serve the local Creature page: ${error.message}`);
  }
});

const abortController=new AbortController();
let browser;
let context;
let serverListening=false;
let currentInvocation;
let manualResult={status:'cancelled',choice:'no-action-observed'};
let passClosure;
let sigintHandler;

try{
  await new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(0,host,resolve);
  });
  serverListening=true;
  const address=server.address();
  const origin=`http://${host}:${address.port}`;

  try{
    browser=await chromium.launch({headless:false});
  }catch(error){
    throw new Error(`NAVIGATOR manual rehearsal needs a desktop session with Playwright Chromium available. ${error.message}`);
  }

  context=await browser.newContext({viewport:{width:430,height:900}});
  await context.route('**/*',route=>{
    let requestedOrigin;
    try{requestedOrigin=new URL(route.request().url()).origin}catch{requestedOrigin=''}
    if(requestedOrigin!==origin)return route.abort();
    return route.continue();
  });
  await context.addInitScript(({fixtureFragment,fragmentStorageKey,arrangementStorageKey})=>{
    localStorage.setItem(fragmentStorageKey,JSON.stringify([fixtureFragment]));
    localStorage.setItem(arrangementStorageKey,JSON.stringify([]));
  },{fixtureFragment:source,fragmentStorageKey:fragmentKey,arrangementStorageKey:arrangementKey});

  const opened=createNavigatorInvocation({
    invokerKind:'human',
    purpose:'Assaig manual del gate HARMONIA → MELODIA amb fixture fictici',
    fixture,
    instruments:departments,
    operations
  });
  assert.equal(opened.accepted,true,'The explicit human invocation is valid');
  currentInvocation=opened.invocation;
  const suggested=recordNavigatorSuggestion(currentInvocation,{
    action:'Comprovar que la persona pot decidir el traspàs d’un fixture fictici.',
    rationale:'La passada s’atura al gate; NAVIGATOR no aprova ni modifica la decisió.'
  });
  assert.equal(suggested.accepted,true,'One suggestedImpulse is recorded');
  currentInvocation=suggested.invocation;

  const page=await context.newPage();
  page.on('dialog',dialog=>dialog.dismiss());
  await page.goto(`${origin}${prefix}#harmonia`);
  await page.locator(`#list-harmonia [data-id="${sourceId}"]`).waitFor({state:'visible'});
  const prepared=await prepareCreatureFixtureHandoff({page,invocation:currentInvocation,fixture});
  assert.equal(prepared.accepted,true,'NAVIGATOR prepares the isolated handoff fixture');
  assert.equal(prepared.status,'awaiting-human-decision');
  assert.equal(prepared.humanDecision,null);
  currentInvocation=prepared.invocation;
  assert.equal(await page.locator(`#list-harmonia [data-action="approve"][data-id="${sourceId}"]`).count(),1,'The human approval control is available');
  assert.equal(await page.locator(`#list-harmonia [data-action="return"][data-id="${sourceId}"]`).count(),1,'The human return control is available');
  assert.equal(await page.locator(`#list-harmonia [data-action="discard"][data-id="${sourceId}"]`).count(),1,'The human discard control is available');
  assert.equal(await page.evaluate(()=>Object.keys(localStorage).sort()),[arrangementKey,fragmentKey].sort(),'The isolated context contains only the two Creature fixture stores');

  sigintHandler=()=>abortController.abort();
  process.once('SIGINT',sigintHandler);
  console.log('\nNAVIGATOR · assaig manual local');
  console.log('La passada és human-invoked; l’actor NAVIGATOR continua sent artificial.');
  console.log('Al navegador, revisa el fixture HARMONIA i tria tu: Aprovar, Retornar o Descartar.');
  console.log('NAVIGATOR no prem cap control. Tanca la pestanya o prem Ctrl+C per cancel·lar.');
  console.log('El navegador és efímer: qualsevol canvi afecta només aquest fixture i desapareix en tancar.\n');

  const manualAction=page.waitForFunction(({id,storageKey})=>{
    const fragments=JSON.parse(localStorage.getItem(storageKey)||'[]');
    const sourceFragment=fragments.find(item=>item.id===id);
    if(!sourceFragment)return null;
    const event=sourceFragment.events?.at(-1);
    if(sourceFragment.decision==='transfer-approved'&&event?.type==='transfer-approved'&&event.decision==='human-approved'){
      const copies=fragments.filter(item=>item.parentId===id&&item.decision==='received-copy');
      return copies.length===1?{choice:'approved',sourceDecision:sourceFragment.decision,copyCount:copies.length,eventDecision:event.decision}:null;
    }
    if(sourceFragment.decision==='returned'&&event?.type==='return'&&event.decision==='human')return{choice:'returned',sourceDecision:sourceFragment.decision,copyCount:0,eventDecision:event.decision};
    if(sourceFragment.decision==='discarded'&&event?.type==='discard'&&event.decision==='human')return{choice:'discarded',sourceDecision:sourceFragment.decision,copyCount:0,eventDecision:event.decision};
    return null;
  },{id:sourceId,storageKey:fragmentKey},{timeout:0});
  const cancelled=new Promise(resolve=>abortController.signal.addEventListener('abort',()=>resolve({status:'cancelled',choice:'no-action-observed'}),{once:true}));
  try{
    manualResult=await Promise.race([manualAction,cancelled]);
  }catch(error){
    if(page.isClosed()||context.pages().length===0)manualResult={status:'cancelled',choice:'no-action-observed'};
    else throw error;
  }

  if(manualResult.choice!=='no-action-observed')manualResult.status='observed';
  if(manualResult.status==='observed'&&manualResult.choice==='approved'){
    const observed=await observeCompletedCreatureFixtureHandoff({page,invocation:currentInvocation,fixture});
    if(observed.accepted){
      currentInvocation=observed.invocation;
      manualResult.adapterVerification='passed';
    }else{
      manualResult.adapterVerification=observed.reason;
    }
  }
  if(currentInvocation.status==='active'){
    const approvedAndVerified=manualResult.status==='observed'&&manualResult.choice==='approved'&&manualResult.adapterVerification==='passed';
    const closed=closeNavigatorInvocation(currentInvocation,{
      outcome:manualResult.status==='cancelled'?'cancelled':approvedAndVerified?'completed':'halted',
      summary:manualResult.status==='cancelled'
        ?'Assaig cancel·lat abans d’observar una decisió sobre el fixture.'
        :approvedAndVerified
          ?'Traspassament fictici verificat després de l’acció de la persona; humanDecision continua null.'
          :'La persona ha triat una sortida sense aprovació o el resultat no s’ha pogut verificar; no s’ha forçat cap tancament positiu.'
    });
    assert.equal(closed.accepted,true,'NAVIGATOR pass closes exactly once');
    currentInvocation=closed.invocation;
  }
  manualResult.status=manualResult.status==='cancelled'?'cancelled':'observed';
  manualResult.navigatorOutcome=currentInvocation.outcome;
  passClosure={status:currentInvocation.status,outcome:currentInvocation.outcome,humanDecision:currentInvocation.humanDecision,events:currentInvocation.events};
}finally{
  if(sigintHandler)process.removeListener('SIGINT',sigintHandler);
  await context?.close().catch(()=>{});
  await browser?.close().catch(()=>{});
  if(serverListening)await new Promise(resolve=>server.close(resolve));
}

console.log(JSON.stringify({
  runner:'NAVIGATOR-MANUAL-REHEARSAL-0.1',
  localOnly:true,
  fixture:fixture.id,
  sourceFragment:sourceId,
  navigatorPass:passClosure||{status:'closed',outcome:'cancelled',humanDecision:null,events:currentInvocation?.events||[]},
  humanActionObserved:manualResult,
  cleanup:'Ephemeral browser context closed; fixture stores destroyed.',
  persistentWrites:false,
  canonical:false
},null,2));
