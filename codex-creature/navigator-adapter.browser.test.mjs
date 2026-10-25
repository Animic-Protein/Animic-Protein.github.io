import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createNavigatorInvocation,recordNavigatorSuggestion} from '../governanca/navigator-contract.mjs';
import {traverseCreaturePage} from './navigator-adapter.mjs';

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
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  const source={id:'fixture:navigator-creature-source',version:1,title:'Fragment NAVIGATOR fictici',content:'Contingut sintètic; no és material d’obra.',author:'Fixture de prova',origin:'harmonia',destination:'melodia',decision:'draft',createdAt:'2026-10-25T00:00:00.000Z',updatedAt:'2026-10-25T00:00:00.000Z',file:null,events:[{type:'created',decision:'fixture-only'}]};
  const arrangement={id:'fixture:navigator-creature-arrangement',version:1,title:'Arranjament de prova',scope:'song',author:'Fixture de prova',reference:'',sourceFragment:{id:source.id,title:source.title,origin:source.origin,version:source.version},departments:['harmonia','melodia'],intention:'Només prova de referència; sense decisió artística.',createdAt:'2026-10-25T00:00:00.000Z',updatedAt:'2026-10-25T00:00:00.000Z',decision:'open',localOnly:true,canonical:false,reversible:true,variants:[],events:[{type:'arrangement-created',decision:'fixture-only'}]};
  await context.addInitScript(({fragment,arrangementRecord})=>{
    localStorage.setItem('codex-creature-fragments-v1',JSON.stringify([fragment]));
    localStorage.setItem('codex-creature-arrangements-v1',JSON.stringify([arrangementRecord]));
  },{fragment:source,arrangementRecord:arrangement});
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}codex-creature/`);

  const departments=['HARMONIA','MELODIA','RITME','LYRICS','AUDIO-VIDEO','MISCE'];
  const fixture={id:'fixture:navigator-creature-pass',kind:'fictional-fixture',isolation:'navigator-sandbox-0.1',synthetic:true,containsUserData:false,localOnly:true,canonical:false,reversible:true,sourceFragmentId:source.id,arrangementId:arrangement.id};
  const operations=['observe','suggest','traverse.fixture',...departments.map(name=>`creature.${name.toLowerCase()}.fixture`),'arrangement.fixture'];
  const opened=createNavigatorInvocation({invokerKind:'artificial',purpose:'Provar l’adaptador de lectura de Còdex Creature',fixture,instruments:[...departments,'ARRANJAMENTS'],operations});
  assert.equal(opened.accepted,true);
  const suggested=recordNavigatorSuggestion(opened.invocation,{action:'Recórrer els departaments i comprovar el límit de decisió humana.'});
  assert.equal(suggested.accepted,true);

  const closed=await traverseCreaturePage({page,invocation:suggested.invocation,fixture});
  assert.equal(closed.status,'closed');
  assert.equal(closed.outcome,'completed');
  assert.equal(closed.invokerKind,'artificial');
  assert.equal(closed.actorKind,'artificial');
  assert.equal(closed.humanDecision,null);
  assert.equal(closed.events.filter(event=>event.type==='sandbox-operation').length,7,'Six departments and Arrangements are observed');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Mobile viewport remains free of horizontal overflow');
  const sourceAfter=await page.evaluate(id=>JSON.parse(localStorage.getItem('codex-creature-fragments-v1')||'[]').find(item=>item.id===id),source.id);
  assert.equal(sourceAfter.decision,'draft','Human-gated transfer remains pending');
  assert.deepEqual(pageErrors,[]);
  await context.close();
  console.log('NAVIGATOR Creature adapter: six departments, linked arrangement, human transfer gate and read-only fixture: OK');
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
