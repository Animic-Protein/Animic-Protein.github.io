export const NAVIGATOR_ACTOR='artificial';
export const NAVIGATOR_SANDBOX='navigator-sandbox-0.1';
export const NAVIGATOR_SANDBOX_OPERATIONS=Object.freeze([
  'observe',
  'suggest',
  'traverse.fixture',
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

let sequence=0;
const now=()=>new Date().toISOString();
const id=prefix=>`${prefix}-${Date.now().toString(36)}-${(++sequence).toString(36)}`;
const denied=reason=>({accepted:false,reason,humanDecision:null});

function isFictionalFixture(fixture){
  return Boolean(fixture&&fixture.kind==='fictional-fixture'&&fixture.isolation===NAVIGATOR_SANDBOX&&fixture.synthetic===true&&fixture.containsUserData===false&&fixture.localOnly===true&&fixture.canonical===false&&fixture.reversible===true&&typeof fixture.id==='string'&&fixture.id.trim());
}

export function createNavigatorInvocation({invokerKind,purpose,fixture,at=now()}={}){
  if(!['human','artificial'].includes(invokerKind))return denied('invalid-invoker-kind');
  if(typeof purpose!=='string'||!purpose.trim())return denied('purpose-required');
  if(!isFictionalFixture(fixture))return denied('fictional-sandbox-fixture-required');
  const invocation={
    id:id('NAV'),protocol:'NAVIGATOR-INVOCATIO-0.1',mode:'sandbox-autonomous',
    invokerKind,actorKind:NAVIGATOR_ACTOR,purpose:purpose.trim(),
    fixtureRef:fixture.id,capabilities:[...NAVIGATOR_SANDBOX_OPERATIONS],
    suggestedImpulse:null,humanDecision:null,
    provenance:{localOnly:true,canonical:false,reversible:true},
    events:[{id:id('NAVE'),type:'invocation-opened',at,invokerKind,actorKind:NAVIGATOR_ACTOR,fixtureRef:fixture.id,mode:'sandbox-autonomous'}]
  };
  return{accepted:true,reason:null,invocation};
}

export function recordNavigatorSuggestion(invocation,{action,rationale='',at=now()}={}){
  if(!invocation||invocation.protocol!=='NAVIGATOR-INVOCATIO-0.1'||invocation.actorKind!==NAVIGATOR_ACTOR)return denied('invalid-invocation');
  if(invocation.humanDecision!==null)return denied('navigator-cannot-create-human-decision');
  if(typeof action!=='string'||!action.trim())return denied('suggestion-action-required');
  const suggestedImpulse={id:id('NAVI'),actorKind:NAVIGATOR_ACTOR,action:action.trim(),rationale:String(rationale).trim(),at};
  const next={...invocation,suggestedImpulse,events:[...invocation.events,{id:id('NAVE'),type:'suggested-impulse',impulseId:suggestedImpulse.id,actorKind:NAVIGATOR_ACTOR,action:suggestedImpulse.action,rationale:suggestedImpulse.rationale,at}]};
  next.humanDecision=null;
  return{accepted:true,reason:null,invocation:next};
}

export function authorizeNavigatorOperation(invocation,{operation,target}={}){
  if(!invocation||invocation.protocol!=='NAVIGATOR-INVOCATIO-0.1'||invocation.actorKind!==NAVIGATOR_ACTOR||invocation.mode!=='sandbox-autonomous')return denied('invalid-invocation');
  if(!NAVIGATOR_SANDBOX_OPERATIONS.includes(operation))return denied('operation-outside-sandbox-capabilities');
  if(!isFictionalFixture(target)||target.id!==invocation.fixtureRef)return denied('target-outside-invocation-fixture');
  if(invocation.humanDecision!==null)return denied('navigator-cannot-create-human-decision');
  return{accepted:true,reason:null,actorKind:NAVIGATOR_ACTOR,invokerKind:invocation.invokerKind,operation,targetRef:target.id,scope:NAVIGATOR_SANDBOX,humanDecision:null,canonical:false,reversible:true};
}

export function recordNavigatorOperation(invocation,{operation,target,summary='',at=now()}={}){
  const authorization=authorizeNavigatorOperation(invocation,{operation,target});
  if(!authorization.accepted)return authorization;
  const event={id:id('NAVE'),type:'sandbox-operation',at,actorKind:NAVIGATOR_ACTOR,invokerKind:invocation.invokerKind,operation,targetRef:target.id,summary:String(summary).trim(),authorizationScope:NAVIGATOR_SANDBOX,canonical:false,reversible:true};
  const next={...invocation,events:[...invocation.events,event],humanDecision:null};
  return{accepted:true,reason:null,authorization,event,invocation:next};
}
