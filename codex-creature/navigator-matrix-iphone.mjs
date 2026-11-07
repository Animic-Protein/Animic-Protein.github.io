const STORAGE_KEY='codex-navigator-matrix-iphone-v1';
const FORMAT='navigator-matrix-iphone-trace';
const PROTOCOL='NAVIGATOR-MATRIX-0.4';
const PROGRAM='CODEX_CREATURE';
const OPERATION='codex.patch.reversible';

export const MATRIX_BROWSER_GUARDRAILS=Object.freeze([
  Object.freeze({id:'human-agency',order:1,label:'La decisió humana conserva l’última instància.'}),
  Object.freeze({id:'safety-rights',order:2,label:'No vulnerar persones, drets, consentiment ni dades.'}),
  Object.freeze({id:'reversibility',order:3,label:'Cap pas autònom sense retorn verificable.'}),
  Object.freeze({id:'traceability',order:4,label:'Cada pas deixa procedència.'}),
  Object.freeze({id:'mission-fidelity',order:5,label:'No ampliar el mandat per inferència.'}),
  Object.freeze({id:'perceptible-difference',order:6,label:'Conservar només una diferència perceptible.'}),
  Object.freeze({id:'occam',order:7,label:'Preferir el pas més simple.'}),
  Object.freeze({id:'uncertainty',order:8,label:'Davant incertesa: QUIES / REOBSERVE.'})
]);

export const MATRIX_BROWSER_VARIANTS=Object.freeze({
  cobalt:Object.freeze({id:'cobalt',label:'Pols cobalt',title:'Fragment sintètic reobservat',content:'Pols cobalt B'}),
  quies:Object.freeze({id:'quies',label:'QUIES',title:'Fixture en quietud',content:'Silenci sintètic de prova'}),
  retrodansa:Object.freeze({id:'retrodansa',label:'Retrodansa',title:'Fixture en transició',content:'Tres pulsacions sintètiques i retorn'})
});

const clone=value=>JSON.parse(JSON.stringify(value));
const asDate=value=>{
  const date=value instanceof Date?value:new Date(value);
  if(Number.isNaN(date.getTime()))throw new Error('invalid-time');
  return date;
};
const defaultId=prefix=>`${prefix}-${globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
const boundedInteger=(value,min,max,name)=>{
  const number=Number(value);
  if(!Number.isInteger(number)||number<min||number>max)throw new Error(name);
  return number;
};
const uniquePriorities=priorities=>[...new Set((priorities||[]).map(value=>String(value).trim()).filter(Boolean))].slice(0,5);

async function sha256(value){
  const bytes=new TextEncoder().encode(String(value));
  const result=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return[...new Uint8Array(result)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

export function createBrowserMatrixMandate(input={},options={}){
  const at=asDate(options.at||new Date());
  const makeId=options.idFactory||defaultId;
  const mission=String(input.mission||'').trim();
  if(!mission)throw new Error('mission-required');
  const durationMinutes=boundedInteger(input.durationMinutes,15,60,'invalid-duration');
  if(![15,30,60].includes(durationMinutes))throw new Error('invalid-duration');
  const budget={
    maxCycles:boundedInteger(input.maxCycles,1,12,'invalid-cycle-budget'),
    maxRevisions:boundedInteger(input.maxRevisions,1,6,'invalid-revision-budget'),
    maxEvents:boundedInteger(input.maxEvents,4,64,'invalid-event-budget')
  };
  const priorities=uniquePriorities(input.priorities);
  const issuedAt=at.toISOString();
  const expiresAt=new Date(at.getTime()+durationMinutes*60_000).toISOString();
  const fixture={
    id:makeId('fixture'),kind:'fictional-fixture',isolation:'navigator-matrix-0.4',
    synthetic:true,containsUserData:false,localOnly:true,canonical:false,reversible:true,
    fragment:{
      id:makeId('fragment'),version:1,title:'Fragment sintètic inicial',content:'Pols cobalt A',
      author:'Fixture MATRIX',decision:'fixture-only',createdAt:issuedAt,updatedAt:issuedAt,
      events:[{type:'created',decision:'fixture-only',at:issuedAt}]
    }
  };
  const mandate={
    id:makeId('NAVM'),protocol:PROTOCOL,actorKind:'human',mission,
    programs:[PROGRAM],reversibleOperations:[OPERATION],
    priorities:[
      ...MATRIX_BROWSER_GUARDRAILS,
      ...priorities.map((label,index)=>({id:`mission-${index+1}`,order:100+index,label,mutable:true}))
    ],
    budget,issuedAt,expiresAt,humanDecision:null
  };
  return{
    format:FORMAT,version:1,mode:'browser-synthetic-rehearsal',status:'mandate-ready',
    mandate,fixture,session:null,rollbackReceipt:null,humanDecision:null,
    trace:[{id:makeId('MXE'),type:'human-mandate-issued',actorKind:'human',mandateId:mandate.id,at:issuedAt}]
  };
}

export async function invokeBrowserMatrix(state,variantId,options={}){
  const next=clone(state);
  const at=asDate(options.at||new Date());
  const makeId=options.idFactory||defaultId;
  const variant=MATRIX_BROWSER_VARIANTS[variantId];
  if(next?.format!==FORMAT||next.status!=='mandate-ready')throw new Error('mandate-ready-required');
  if(at.getTime()>=asDate(next.mandate.expiresAt).getTime())throw new Error('mandate-expired');
  if(!variant)throw new Error('synthetic-variant-required');
  const beforeSerialized=JSON.stringify(next.fixture.fragment);
  const updated={
    ...next.fixture.fragment,
    version:next.fixture.fragment.version+1,
    title:variant.title,
    content:variant.content,
    updatedAt:at.toISOString(),
    events:[...next.fixture.fragment.events,{
      id:makeId('MXE'),type:'navigator-matrix-patch',actorKind:'artificial',
      decision:'fixture-only',variantId:variant.id,at:at.toISOString()
    }]
  };
  const afterSerialized=JSON.stringify(updated);
  if(afterSerialized===beforeSerialized)throw new Error('perceptible-difference-required');
  const beforeDigest=await sha256(beforeSerialized);
  const afterDigest=await sha256(afterSerialized);
  const sessionId=makeId('MATRIX');
  const authorizationId=makeId('MXA');
  const opened={
    id:makeId('MXE'),type:'matrix-opened',actorKind:'artificial',invokerKind:'human',
    mandateId:next.mandate.id,fixtureRef:next.fixture.id,at:at.toISOString()
  };
  const applied={
    id:makeId('MXE'),type:'mandated-adapter-operation',actorKind:'artificial',
    authorizationId,operation:OPERATION,targetRef:PROGRAM,effectClass:'codex-reversible',
    outcome:'applied',beforeDigest,afterDigest,rollbackDigest:null,
    canonical:false,reversible:true,humanDecision:null,at:at.toISOString()
  };
  next.fixture.fragment=updated;
  next.session={
    id:sessionId,protocol:PROTOCOL,status:'active',phase:'evaluate',revision:1,
    actorKind:'artificial',invokerKind:'human',mandateId:next.mandate.id,
    fixtureRef:next.fixture.id,programScope:[PROGRAM],capabilities:[OPERATION],
    budget:next.mandate.budget,usage:{cycles:1,revisions:1,events:3},
    humanDecision:null,events:[opened,applied]
  };
  next.rollbackReceipt={
    protocol:'NAVIGATOR-MATRIX-IPHONE-0.1',sessionId,sessionRevision:1,
    fixtureId:next.fixture.id,fragmentId:updated.id,beforeDigest,afterDigest,
    snapshot:beforeSerialized,authorizationId
  };
  next.trace.push(opened,applied);
  next.status='applied';
  next.humanDecision=null;
  return next;
}

export async function rollbackBrowserMatrix(state,options={}){
  const next=clone(state);
  const at=asDate(options.at||new Date());
  const makeId=options.idFactory||defaultId;
  if(next?.format!==FORMAT||next.status!=='applied'||!next.session||!next.rollbackReceipt)throw new Error('applied-state-required');
  const currentSerialized=JSON.stringify(next.fixture.fragment);
  const currentDigest=await sha256(currentSerialized);
  if(currentDigest!==next.rollbackReceipt.afterDigest)throw new Error('stale-adapter-state');
  const restored=JSON.parse(next.rollbackReceipt.snapshot);
  const restoredDigest=await sha256(JSON.stringify(restored));
  if(restoredDigest!==next.rollbackReceipt.beforeDigest)throw new Error('rollback-verification-failed');
  const event={
    id:makeId('MXE'),type:'mandated-adapter-operation',actorKind:'artificial',
    authorizationId:makeId('MXA'),operation:OPERATION,targetRef:PROGRAM,effectClass:'codex-reversible',
    outcome:'rolled-back',beforeDigest:currentDigest,afterDigest:restoredDigest,
    rollbackDigest:restoredDigest,canonical:false,reversible:true,humanDecision:null,at:at.toISOString()
  };
  next.fixture.fragment=restored;
  next.session.revision+=1;
  next.session.phase='reobserve';
  next.session.usage.events+=1;
  next.session.events.push(event);
  next.trace.push(event);
  next.lastRollback={at:at.toISOString(),restoredDigest,receiptRevision:next.rollbackReceipt.sessionRevision};
  next.rollbackReceipt=null;
  next.status='rolled-back';
  next.humanDecision=null;
  return next;
}

export function exportBrowserMatrixTrace(state,at=new Date()){
  if(state?.format!==FORMAT)throw new Error('matrix-trace-required');
  return{
    format:FORMAT,version:1,exportedAt:asDate(at).toISOString(),
    localOnly:true,canonical:false,reversible:true,
    mandate:clone(state.mandate),session:clone(state.session),fixture:clone(state.fixture),
    status:state.status,humanDecision:null,trace:clone(state.trace),lastRollback:clone(state.lastRollback||null)
  };
}

function downloadJson(data){
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const link=document.createElement('a');
  link.href=url;
  link.download='navigator-matrix-iphone-rastre.json';
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function panelMarkup(){
  const variants=Object.values(MATRIX_BROWSER_VARIANTS).map(variant=>`<option value="${variant.id}">${variant.label} · ${variant.content}</option>`).join('');
  return `<section id="matrix" class="matrix-iphone" aria-labelledby="matrixHeading">
    <p class="matrix-kicker">NAVIGATOR MATRIX 0.4 · LLINDAR MÒBIL</p>
    <h2 id="matrixHeading">Mandat humà. Travessa sintètica. Retorn exacte.</h2>
    <p>Aquest espai funciona a l’iPhone i només usa un fixture separat dins la sessió d’aquesta pestanya. No llegeix ni modifica fragments o arranjaments habituals.</p>
    <div class="matrix-warning"><strong>Límit 0.1</strong> · És un assaig browser del mandat i la Retrodansa. No publica, no canonitza i no activa l’adaptador persistent sobre material real.</div>
    <form id="matrixMandateForm" class="matrix-grid">
      <label class="matrix-wide">Missió humana
        <textarea name="mission" maxlength="500" required>Comprovar una variació sintètica reversible dins Còdex Creature.</textarea>
      </label>
      <label class="matrix-wide">Prioritats afegides · una per línia, màxim cinc
        <textarea name="priorities" maxlength="600" placeholder="Claredat abans de velocitat&#10;Conservar el rastre mínim"></textarea>
      </label>
      <label>Cicles màxims<input name="maxCycles" type="number" min="1" max="12" value="3" required></label>
      <label>Revisions màximes<input name="maxRevisions" type="number" min="1" max="6" value="2" required></label>
      <label>Esdeveniments màxims<input name="maxEvents" type="number" min="4" max="64" value="12" required></label>
      <label>Caducitat<select name="durationMinutes"><option value="15">15 minuts</option><option value="30" selected>30 minuts</option><option value="60">60 minuts</option></select></label>
      <div class="matrix-wide matrix-fixed"><strong>Abast fix:</strong> <code>CODEX_CREATURE</code> · <code>codex.patch.reversible</code></div>
      <div class="matrix-wide matrix-actions"><button type="submit">1 · Emetre mandat humà</button></div>
    </form>
    <form id="matrixInvokeForm" class="matrix-grid">
      <label class="matrix-wide">Variació estrictament sintètica<select name="variant">${variants}</select></label>
      <div class="matrix-wide matrix-actions">
        <button id="matrixInvoke" type="submit" disabled>2 · Invocar NAVIGATOR</button>
        <button id="matrixRollback" class="secondary" type="button" disabled>3 · Retrodansa exacta</button>
      </div>
    </form>
    <div id="matrixStatus" class="matrix-status" role="status" aria-live="polite">Cap mandat emès.</div>
    <div class="matrix-readout"><div><span>Actor</span><strong id="matrixActor">—</strong></div><div><span>Estat</span><strong id="matrixState">idle</strong></div><div><span>humanDecision</span><strong id="matrixDecision">null</strong></div></div>
    <article class="matrix-fixture" aria-labelledby="matrixFixtureHeading"><p class="matrix-kicker">FIXTURE SEPARAT</p><h3 id="matrixFixtureHeading">Fragment sintètic inicial</h3><pre id="matrixFixtureContent">Pols cobalt A</pre></article>
    <div class="matrix-actions">
      <button id="matrixExport" class="warm" type="button" disabled>Exportar rastre JSON</button>
      <button id="matrixDissolve" class="danger" type="button" disabled>Dissoldre el rastre</button>
      <a class="button secondary" href="./">Sortir de MATRIX</a>
    </div>
  </section>`;
}

function panelStyles(){
  const style=document.createElement('style');
  style.textContent=`.matrix-iphone{width:min(1160px,calc(100% - 24px));margin:1rem auto;padding:clamp(1rem,4vw,1.6rem);border:1px solid #5bc9ffaa;border-radius:22px;background:linear-gradient(145deg,#0c3454f2,#071421f5);box-shadow:0 18px 55px #02081499;color:#e5f5ff}.matrix-iphone h2{font:400 clamp(1.8rem,6vw,3.2rem) Georgia,serif;margin:.25rem 0 .7rem}.matrix-kicker{font-size:.75rem;letter-spacing:.15em;color:#5bc9ff;text-transform:uppercase}.matrix-warning,.matrix-status,.matrix-fixed{padding:.75rem .85rem;border-left:3px solid #dfb566;background:#121f2c;border-radius:0 12px 12px 0;margin:.8rem 0}.matrix-status{border-color:#5bc9ff}.matrix-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem;margin:1rem 0}.matrix-grid label{display:grid;gap:.35rem}.matrix-wide{grid-column:1/-1}.matrix-actions{display:flex;gap:.6rem;flex-wrap:wrap}.matrix-actions button,.matrix-actions a{flex:0 1 auto}.matrix-readout{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem}.matrix-readout div{border:1px solid #31536c;border-radius:12px;padding:.65rem;background:#071827}.matrix-readout span{display:block;color:#a8bdce;font-size:.78rem}.matrix-readout strong{overflow-wrap:anywhere}.matrix-fixture{border:1px solid #5bc9ff55;border-radius:16px;padding:1rem;margin:1rem 0;background:#061321}.matrix-fixture h3{font:400 1.35rem Georgia,serif;margin:.2rem 0}.matrix-fixture pre{margin:.6rem 0 0}@media(max-width:560px){.matrix-grid,.matrix-readout{grid-template-columns:1fr}.matrix-wide{grid-column:auto}.matrix-actions>*{width:100%}}`;
  document.head.append(style);
}

function mountBrowserMatrix(){
  if(new URLSearchParams(location.search).get('navigator-matrix')!=='1')return;
  panelStyles();
  document.body.insertAdjacentHTML('afterbegin',panelMarkup());
  const $=selector=>document.querySelector(selector);
  const mandateForm=$('#matrixMandateForm');
  const invokeForm=$('#matrixInvokeForm');
  const status=$('#matrixStatus');
  let state=null;
  try{state=JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'null')}catch{sessionStorage.removeItem(STORAGE_KEY)}

  const persist=()=>state?sessionStorage.setItem(STORAGE_KEY,JSON.stringify(state)):sessionStorage.removeItem(STORAGE_KEY);
  const render=message=>{
    const ready=state?.status==='mandate-ready';
    const applied=state?.status==='applied';
    $('#matrixInvoke').disabled=!ready;
    $('#matrixRollback').disabled=!applied;
    $('#matrixExport').disabled=!state;
    $('#matrixDissolve').disabled=!state;
    $('#matrixActor').textContent=state?.session?.actorKind||state?.mandate?.actorKind||'—';
    $('#matrixState').textContent=state?.status||'idle';
    $('#matrixDecision').textContent='null';
    $('#matrixFixtureHeading').textContent=state?.fixture?.fragment?.title||'Fragment sintètic inicial';
    $('#matrixFixtureContent').textContent=state?.fixture?.fragment?.content||'Pols cobalt A';
    if(message)status.textContent=message;
  };

  mandateForm.addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const data=new FormData(mandateForm);
      state=createBrowserMatrixMandate({
        mission:data.get('mission'),priorities:String(data.get('priorities')||'').split(/\r?\n/),
        maxCycles:data.get('maxCycles'),maxRevisions:data.get('maxRevisions'),
        maxEvents:data.get('maxEvents'),durationMinutes:data.get('durationMinutes')
      });
      persist();
      render('Mandat humà emès. NAVIGATOR encara no ha actuat; pots invocar una variació sintètica.');
    }catch(error){render(`Mandat no creat: ${error.message}.`)}
  });

  invokeForm.addEventListener('submit',async event=>{
    event.preventDefault();
    try{
      const variant=new FormData(invokeForm).get('variant');
      state=await invokeBrowserMatrix(state,variant);
      persist();
      render('NAVIGATOR ha aplicat la variació dins el fixture. humanDecision continua null perquè l’efecte és reversible i dins del mandat.');
    }catch(error){render(`Invocació aturada: ${error.message}.`)}
  });

  $('#matrixRollback').addEventListener('click',async()=>{
    try{
      state=await rollbackBrowserMatrix(state);
      persist();
      render('Retrodansa verificada: el fixture ha recuperat exactament l’estat anterior.');
    }catch(error){render(`Retrodansa aturada: ${error.message}.`)}
  });
  $('#matrixExport').addEventListener('click',()=>downloadJson(exportBrowserMatrixTrace(state)));
  $('#matrixDissolve').addEventListener('click',()=>{
    if(!confirm('Dissoldre el mandat, el fixture i tot el rastre MATRIX d’aquesta pestanya?'))return;
    state=null;
    persist();
    mandateForm.reset();
    invokeForm.reset();
    render('Rastre dissolt. Els fragments i arranjaments habituals no s’han tocat.');
  });
  render(state?'Rastre MATRIX recuperat dins aquesta pestanya.':'Cap mandat emès.');
  document.querySelector('#matrix')?.scrollIntoView({block:'start'});
}

if(typeof window!=='undefined'&&typeof document!=='undefined')mountBrowserMatrix();
