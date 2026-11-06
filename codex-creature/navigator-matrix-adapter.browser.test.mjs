import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {
  MATRIX_ISOLATION,
  createMatrixMandate,
  createMatrixSession
} from '../governanca/navigator-matrix.mjs';
import {
  applyCreatureFixturePatch,
  rollbackCreatureFixturePatch
} from './navigator-matrix-adapter.mjs';

const root=process.cwd();
const prefix='/codex/';
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
    id:'fixture:matrix-creature-source',version:1,title:'Fragment sintètic inicial',
    content:'Pols cobalt A',author:'Fixture MATRIX',origin:'misce',destination:'harmonia',
    decision:'draft',createdAt:'2026-11-06T00:00:00.000Z',updatedAt:'2026-11-06T00:00:00.000Z',
    file:null,events:[{type:'created',decision:'fixture-only'}]
  };
  const control={
    id:'fixture:matrix-creature-control',version:1,title:'Control immòbil',
    content:'No canviar',author:'Fixture MATRIX',origin:'misce',destination:'',
    decision:'draft',createdAt:'2026-11-06T00:00:00.000Z',updatedAt:'2026-11-06T00:00:00.000Z',
    file:null,events:[{type:'created',decision:'fixture-only'}]
  };
  const arrangement={
    id:'fixture:matrix-arrangement-control',version:1,title:'Arranjament control',scope:'song',
    author:'Fixture MATRIX',reference:'',sourceFragment:null,decision:'open',events:[{type:'created',decision:'fixture-only'}]
  };
  const initialFragments=JSON.stringify([source,control]);
  const initialArrangements=JSON.stringify([arrangement]);
  await context.addInitScript(({fragmentKey,arrangementKey,initialFragments,initialArrangements})=>{
    localStorage.setItem(fragmentKey,initialFragments);
    localStorage.setItem(arrangementKey,initialArrangements);
  },{fragmentKey,arrangementKey,initialFragments,initialArrangements});

  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.goto(`${origin}${prefix}codex-creature/`);

  const fixture={
    id:'fixture:matrix-creature-pass',kind:'fictional-fixture',isolation:MATRIX_ISOLATION,
    synthetic:true,containsUserData:false,localOnly:true,canonical:false,reversible:true,
    fragmentId:source.id
  };
  const mandate=createMatrixMandate({
    actorKind:'human',mission:'Provar una modificació reversible dins Còdex Creature',
    programs:['CODEX_CREATURE'],reversibleOperations:['codex.patch.reversible'],
    priorities:[{id:'fixture-integrity',label:'No alterar cap registre fora del fragment sintètic.'}],
    budget:{maxCycles:2,maxRevisions:2,maxEvents:6},at:'2026-11-06T08:00:00.000Z'
  });
  assert.equal(mandate.accepted,true);
  const opened=createMatrixSession({
    invokerKind:'artificial',mandate:mandate.mandate,fixture,
    programs:[{id:'CODEX_CREATURE',source:'navigator-matrix-adapter-0.1',virtual:true,canonical:false}],
    at:'2026-11-06T08:01:00.000Z'
  });
  assert.equal(opened.accepted,true);

  const applied=await applyCreatureFixturePatch({
    page,session:opened.session,fixture,
    patch:{title:'Fragment sintètic reobservat',content:'Pols cobalt B'},
    at:'2026-11-06T08:02:00.000Z'
  });
  assert.equal(applied.accepted,true);
  assert.equal(applied.outcome,'applied');
  assert.equal(applied.humanDecision,null);
  assert.deepEqual(applied.changedFields,['title','content']);
  assert.equal(applied.session.events.at(-1).type,'mandated-adapter-operation');
  assert.equal(applied.session.events.at(-1).authorizationId,applied.authorizationId);
  assert.equal(applied.session.events.at(-1).outcome,'applied');

  let fragments=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'[]'),fragmentKey);
  const patched=fragments.find(fragment=>fragment.id===source.id);
  assert.equal(patched.title,'Fragment sintètic reobservat');
  assert.equal(patched.content,'Pols cobalt B');
  assert.equal(patched.events.at(-1).actorKind,'artificial');
  assert.equal(patched.events.at(-1).decision,'fixture-only');
  assert.deepEqual(fragments.find(fragment=>fragment.id===control.id),control,'A sibling fixture remains byte-for-byte equivalent as data');
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),arrangementKey),initialArrangements,'Arrangements remains untouched');

  const rolledBack=await rollbackCreatureFixturePatch({
    page,session:applied.session,fixture,receipt:applied.rollbackReceipt,
    at:'2026-11-06T08:03:00.000Z'
  });
  assert.equal(rolledBack.accepted,true);
  assert.equal(rolledBack.outcome,'rolled-back');
  assert.equal(rolledBack.humanDecision,null);
  assert.equal(rolledBack.session.events.at(-1).outcome,'rolled-back');
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),fragmentKey),initialFragments,'Retrodansa restores the exact initial serialized value');
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),arrangementKey),initialArrangements,'Retrodansa does not touch Arrangements');

  const reused=await rollbackCreatureFixturePatch({
    page,session:rolledBack.session,fixture,receipt:applied.rollbackReceipt,
    at:'2026-11-06T08:04:00.000Z'
  });
  assert.equal(reused.reason,'exact-rollback-receipt-required','A rollback receipt is bound to one MATRIX revision');

  fragments=JSON.parse(initialFragments);
  fragments.push({...control,id:'real:creative-material',author:'Human author',events:[{type:'created',decision:'draft'}]});
  await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:fragmentKey,value:JSON.stringify(fragments)});
  const denied=await applyCreatureFixturePatch({
    page,session:rolledBack.session,fixture,patch:{content:'No s’ha d’aplicar'},
    at:'2026-11-06T08:05:00.000Z'
  });
  assert.equal(denied.reason,'fixture-only-store-required','Mixed or real creative material is outside the adapter');
  assert.equal(denied.humanDecision,null);
  assert.equal(blockedOrigins.length,0,'The browser context made no external network requests');
  assert.deepEqual(pageErrors,[]);

  await context.close();
  context=null;
  console.log('NAVIGATOR MATRIX Creature adapter: exact fixture patch, trace, Retrodansa, mixed-material veto and offline isolation: OK');
}finally{
  await context?.close();
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
