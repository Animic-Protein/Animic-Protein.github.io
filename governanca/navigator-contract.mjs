export const NAVIGATOR_ACTOR='artificial';
export const NAVIGATOR_SANDBOX='navigator-sandbox-0.1';
export const NAVIGATOR_INSTRUMENTS=Object.freeze([
  'MUTATIO','SEMENT','HOMEOSTASIS','COMPOST','ZAJJ-VIU','RETRODANSA',
  'ARCHIVUM','KREATOR-RPG','LIMEN','DISSENSUS',
  'HARMONIA','MELODIA','RITME','LYRICS','AUDIO-VIDEO','MISCE','ARRANJAMENTS'
]);
export const NAVIGATOR_SANDBOX_OPERATIONS=Object.freeze([
  'observe',
  'suggest',
  'traverse.fixture',
  'creature.harmonia.fixture',
  'creature.melodia.fixture',
  'creature.ritme.fixture',
  'creature.lyrics.fixture',
  'creature.audio-video.fixture',
  'creature.misce.fixture',
  'arrangement.fixture',
  'mutatio.fixture',
  'seed.fixture',
  'homeostasis.check',
  'compost.fixture',
  'zajj-viv.fixture',
  'retrodansa.fixture',
  'archivum.draft',
  'kreator-rpg.fixture',
  'limen.fixture',
  'dissensus.fixture'
]);

const OPERATION_INSTRUMENT=Object.freeze({
  'observe':null,
  'suggest':null,
  'traverse.fixture':null,
  'creature.harmonia.fixture':'HARMONIA',
  'creature.melodia.fixture':'MELODIA',
  'creature.ritme.fixture':'RITME',
  'creature.lyrics.fixture':'LYRICS',
  'creature.audio-video.fixture':'AUDIO-VIDEO',
  'creature.misce.fixture':'MISCE',
  'arrangement.fixture':'ARRANJAMENTS',
  'mutatio.fixture':'MUTATIO',
  'seed.fixture':'SEMENT',
  'homeostasis.check':'HOMEOSTASIS',
  'compost.fixture':'COMPOST',
  'zajj-viv.fixture':'ZAJJ-VIU',
  'retrodansa.fixture':'RETRODANSA',
  'archivum.draft':'ARCHIVUM',
  'kreator-rpg.fixture':'KREATOR-RPG',
  'limen.fixture':'LIMEN',
  'dissensus.fixture':'DISSENSUS'
});

let sequence=0;
const now=()=>new Date().toISOString();
const id=prefix=>`${prefix}-${Date.now().toString(36)}-${(++sequence).toString(36)}`;
const denied=reason=>({accepted:false,reason,humanDecision:null});

function isFictionalFixture(fixture){
  return Boolean(fixture&&fixture.kind==='fictional-fixture'&&fixture.isolation===NAVIGATOR_SANDBOX&&fixture.synthetic===true&&fixture.containsUserData===false&&fixture.localOnly===true&&fixture.canonical===false&&fixture.reversible===true&&typeof fixture.id==='string'&&fixture.id.trim());
}

export function createNavigatorInvocation({invokerKind,purpose,fixture,instruments=[],operations=[],at=now()}={}){
  if(!['human','artificial'].includes(invokerKind))return denied('invalid-invoker-kind');
  if(typeof purpose!=='string'||!purpose.trim())return denied('purpose-required');
  if(!isFictionalFixture(fixture))return denied('fictional-sandbox-fixture-required');
  if(!Array.isArray(instruments)||!instruments.length||instruments.some(name=>!NAVIGATOR_INSTRUMENTS.includes(name)))return denied('explicit-instrument-scope-required');
  if(!Array.isArray(operations)||!operations.length||operations.some(operation=>!NAVIGATOR_SANDBOX_OPERATIONS.includes(operation)))return denied('explicit-operation-scope-required');
  const missing=operations.find(operation=>OPERATION_INSTRUMENT[operation]&&!instruments.includes(OPERATION_INSTRUMENT[operation]));
  if(missing)return denied('operation-outside-declared-instruments');
  const invocation={
    id:id('NAV'),protocol:'NAVIGATOR-INVOCATIO-0.2',mode:'sandbox-autonomous',status:'active',
    invokerKind,actorKind:NAVIGATOR_ACTOR,purpose:purpose.trim(),
    fixtureRef:fixture.id,instruments:[...new Set(instruments)],capabilities:[...new Set(operations)],
    suggestedImpulse:null,humanDecision:null,
    provenance:{localOnly:true,canonical:false,reversible:true},
    events:[{id:id('NAVE'),type:'invocation-opened',at,invokerKind,actorKind:NAVIGATOR_ACTOR,fixtureRef:fixture.id,mode:'sandbox-autonomous',instruments:[...new Set(instruments)],capabilities:[...new Set(operations)]}]
  };
  return{accepted:true,reason:null,invocation};
}

export function recordNavigatorSuggestion(invocation,{action,rationale='',at=now()}={}){
  if(!invocation||invocation.protocol!=='NAVIGATOR-INVOCATIO-0.2'||invocation.actorKind!==NAVIGATOR_ACTOR||invocation.status!=='active')return denied('invalid-or-closed-invocation');
  if(invocation.humanDecision!==null)return denied('navigator-cannot-create-human-decision');
  if(!invocation.capabilities?.includes('suggest'))return denied('suggestion-outside-declared-capabilities');
  if(invocation.suggestedImpulse!==null)return denied('suggestion-already-recorded');
  if(typeof action!=='string'||!action.trim())return denied('suggestion-action-required');
  const suggestedImpulse={id:id('NAVI'),actorKind:NAVIGATOR_ACTOR,action:action.trim(),rationale:String(rationale).trim(),at};
  const next={...invocation,suggestedImpulse,events:[...invocation.events,{id:id('NAVE'),type:'suggested-impulse',impulseId:suggestedImpulse.id,actorKind:NAVIGATOR_ACTOR,action:suggestedImpulse.action,rationale:suggestedImpulse.rationale,at}]};
  next.humanDecision=null;
  return{accepted:true,reason:null,invocation:next};
}

export function authorizeNavigatorOperation(invocation,{operation,target}={}){
  if(!invocation||invocation.protocol!=='NAVIGATOR-INVOCATIO-0.2'||invocation.actorKind!==NAVIGATOR_ACTOR||invocation.mode!=='sandbox-autonomous'||invocation.status!=='active')return denied('invalid-or-closed-invocation');
  if(!NAVIGATOR_SANDBOX_OPERATIONS.includes(operation)||!invocation.capabilities?.includes(operation))return denied('operation-outside-declared-capabilities');
  const requiredInstrument=OPERATION_INSTRUMENT[operation];
  if(requiredInstrument&&!invocation.instruments?.includes(requiredInstrument))return denied('operation-outside-declared-instruments');
  if(!isFictionalFixture(target)||target.id!==invocation.fixtureRef)return denied('target-outside-invocation-fixture');
  if(invocation.humanDecision!==null)return denied('navigator-cannot-create-human-decision');
  return{accepted:true,reason:null,actorKind:NAVIGATOR_ACTOR,invokerKind:invocation.invokerKind,operation,targetRef:target.id,scope:NAVIGATOR_SANDBOX,humanDecision:null,canonical:false,reversible:true};
}

export function recordNavigatorOperation(invocation,{operation,target,summary='',at=now()}={}){
  const authorization=authorizeNavigatorOperation(invocation,{operation,target});
  if(!authorization.accepted)return authorization;
  const event={id:id('NAVE'),type:'sandbox-operation',at,actorKind:NAVIGATOR_ACTOR,invokerKind:invocation.invokerKind,operation,targetRef:target.id,summary:String(summary).trim(),effect:'simulated-record-only',authorizationScope:NAVIGATOR_SANDBOX,canonical:false,reversible:true};
  const next={...invocation,events:[...invocation.events,event],humanDecision:null};
  return{accepted:true,reason:null,authorization,event,invocation:next};
}

export function closeNavigatorInvocation(invocation,{outcome='completed',summary='',at=now()}={}){
  if(!invocation||invocation.protocol!=='NAVIGATOR-INVOCATIO-0.2'||invocation.actorKind!==NAVIGATOR_ACTOR||invocation.status!=='active')return denied('invalid-or-closed-invocation');
  if(!['completed','halted','cancelled'].includes(outcome))return denied('invalid-closure-outcome');
  const event={id:id('NAVE'),type:'invocation-closed',at,actorKind:NAVIGATOR_ACTOR,outcome,summary:String(summary).trim(),humanDecision:null,canonical:false};
  return{accepted:true,reason:null,invocation:{...invocation,status:'closed',outcome,events:[...invocation.events,event],humanDecision:null}};
}
