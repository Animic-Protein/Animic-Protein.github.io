import {createHash} from 'node:crypto';

export const MATRIX_PROTOCOL='NAVIGATOR-MATRIX-0.4';
export const MATRIX_ISOLATION='navigator-matrix-0.4';
export const NAVIGATOR_ACTOR='artificial';

export const MATRIX_EFFECT=Object.freeze({
  VIRTUAL_REVERSIBLE:'virtual-reversible',
  CODEX_REVERSIBLE:'codex-reversible',
  EXTERNAL:'external',
  CANONICAL:'canonical',
  IRREVERSIBLE:'irreversible'
});

export const MATRIX_OPERATIONS=Object.freeze([
  'matrix.observe',
  'matrix.plan',
  'matrix.reprogram',
  'matrix.test',
  'matrix.compare',
  'matrix.rollback',
  'matrix.fork',
  'codex.patch.reversible'
]);

export const MATRIX_GUARDRAILS=Object.freeze([
  Object.freeze({id:'human-agency',order:1,label:'La decisió humana conserva l’última instància.'}),
  Object.freeze({id:'safety-rights',order:2,label:'No vulnerar persones, drets, consentiment ni dades.'}),
  Object.freeze({id:'reversibility',order:3,label:'Cap pas autònom sense retorn verificable.'}),
  Object.freeze({id:'traceability',order:4,label:'Cada condició, revisió, prova i retorn deixa procedència.'}),
  Object.freeze({id:'mission-fidelity',order:5,label:'Servir el mandat sense ampliar-lo per inferència.'}),
  Object.freeze({id:'perceptible-difference',order:6,label:'Només conservar canvis amb diferència perceptible.'}),
  Object.freeze({id:'occam',order:7,label:'Preferir el pas més simple que compleix la funció.'}),
  Object.freeze({id:'uncertainty',order:8,label:'Davant evidència insuficient: QUIES / REOBSERVE.'})
]);

let sequence=0;
const latestRevision=new Map();
const now=()=>new Date().toISOString();
const id=prefix=>`${prefix}-${Date.now().toString(36)}-${(++sequence).toString(36)}`;
const digest=value=>createHash('sha256').update(String(value)).digest('hex');
const denied=reason=>({accepted:false,reason,humanDecision:null});
const current=session=>Boolean(session&&latestRevision.get(session.id)===session.revision);

const validFixture=fixture=>Boolean(
  fixture&&fixture.kind==='fictional-fixture'&&fixture.isolation===MATRIX_ISOLATION&&
  fixture.synthetic===true&&fixture.containsUserData===false&&fixture.localOnly===true&&
  fixture.canonical===false&&fixture.reversible===true&&typeof fixture.id==='string'&&fixture.id.trim()
);

const normalizedBudget=budget=>Object.freeze({
  maxCycles:Number.isInteger(budget?.maxCycles)&&budget.maxCycles>0?budget.maxCycles:12,
  maxRevisions:Number.isInteger(budget?.maxRevisions)&&budget.maxRevisions>0?budget.maxRevisions:6,
  maxEvents:Number.isInteger(budget?.maxEvents)&&budget.maxEvents>0?budget.maxEvents:64
});

const validPrograms=programs=>Array.isArray(programs)&&programs.length>0&&programs.every(program=>
  program&&typeof program.id==='string'&&program.id.trim()&&typeof program.source==='string'&&
  program.virtual===true&&program.canonical===false
);

const addEvent=(session,event,extra={})=>{
  const next={...session,...extra,revision:session.revision+1,events:[...session.events,event]};
  latestRevision.set(next.id,next.revision);
  return next;
};

export function createMatrixMandate({actorKind,mission,programs=[],reversibleOperations=[],priorities=[],budget,expiresAt=null,at=now()}={}){
  if(actorKind!=='human')return denied('human-mandate-required');
  if(typeof mission!=='string'||!mission.trim())return denied('mission-required');
  if(!Array.isArray(programs)||!programs.length||programs.some(name=>typeof name!=='string'||!name.trim()))return denied('explicit-program-scope-required');
  if(!Array.isArray(reversibleOperations)||!reversibleOperations.length||reversibleOperations.some(operation=>!MATRIX_OPERATIONS.includes(operation)))return denied('explicit-reversible-operations-required');
  if(!Array.isArray(priorities)||priorities.some(priority=>!priority||typeof priority.id!=='string'||typeof priority.label!=='string'||MATRIX_GUARDRAILS.some(item=>item.id===priority.id)))return denied('invalid-mission-priority');
  if(expiresAt&&Number.isNaN(Date.parse(expiresAt)))return denied('invalid-expiry');
  const mandate={
    id:id('NAVM'),protocol:MATRIX_PROTOCOL,actorKind:'human',mission:mission.trim(),
    programs:[...new Set(programs)],reversibleOperations:[...new Set(reversibleOperations)],
    priorities:[...MATRIX_GUARDRAILS,...priorities.map((priority,index)=>Object.freeze({id:priority.id,label:priority.label,order:100+index,mutable:true}))],
    budget:normalizedBudget(budget),issuedAt:at,expiresAt,humanDecision:null
  };
  return{accepted:true,reason:null,mandate};
}

export function createMatrixSession({invokerKind,mandate,fixture,programs,at=now()}={}){
  if(!['human','artificial'].includes(invokerKind))return denied('invalid-invoker-kind');
  if(!mandate||mandate.protocol!==MATRIX_PROTOCOL||mandate.actorKind!=='human')return denied('valid-human-mandate-required');
  if(mandate.expiresAt&&Date.parse(mandate.expiresAt)<=Date.parse(at))return denied('mandate-expired');
  if(!validFixture(fixture))return denied('matrix-fixture-required');
  if(!validPrograms(programs))return denied('virtual-programs-required');
  if(programs.some(program=>!mandate.programs.includes(program.id)))return denied('program-outside-mandate');
  const virtualPrograms=programs.map(program=>({
    id:program.id,source:program.source,digest:digest(program.source),revision:0,
    virtual:true,canonical:false,lastPassingDigest:digest(program.source)
  }));
  const session={
    id:id('MATRIX'),protocol:MATRIX_PROTOCOL,status:'active',phase:'observe',revision:0,
    invokerKind,actorKind:NAVIGATOR_ACTOR,mandateId:mandate.id,mission:mandate.mission,
    fixtureRef:fixture.id,programScope:[...mandate.programs],capabilities:[...mandate.reversibleOperations],
    priorities:[...mandate.priorities],budget:mandate.budget,usage:{cycles:0,revisions:0,events:1},
    programs:virtualPrograms,directives:[],pendingBoundary:null,humanDecision:null,
    provenance:{localOnly:true,canonical:false,reversible:true,parentMandate:mandate.id},
    events:[{id:id('MXE'),type:'matrix-opened',at,actorKind:NAVIGATOR_ACTOR,invokerKind,mandateId:mandate.id,fixtureRef:fixture.id}]
  };
  latestRevision.set(session.id,session.revision);
  return{accepted:true,reason:null,session};
}

export function recordHumanDirective(session,{actorKind,directive,priority=null,at=now()}={}){
  if(!session||session.protocol!==MATRIX_PROTOCOL||session.status!=='active')return denied('invalid-or-inactive-matrix');
  if(!current(session))return denied('stale-matrix-state');
  if(actorKind!=='human')return denied('human-directive-required');
  if(typeof directive!=='string'||!directive.trim())return denied('directive-required');
  if(priority&&!session.priorities.some(item=>item.id===priority))return denied('unknown-priority');
  const entry={id:id('MXD'),actorKind:'human',directive:directive.trim(),priority,at};
  const event={id:id('MXE'),type:'human-directive',directiveId:entry.id,priority,at};
  const next=addEvent(session,event,{directives:[...session.directives,entry],usage:{...session.usage,events:session.usage.events+1}});
  return{accepted:true,reason:null,session:next,directive:entry};
}

export function runMatrixCycle(session,{observation,condition,operation='matrix.reprogram',programId,nextSource,testResult,rollbackSource,at=now()}={}){
  if(!session||session.protocol!==MATRIX_PROTOCOL||session.status!=='active')return denied('invalid-or-inactive-matrix');
  if(!current(session))return denied('stale-matrix-state');
  if(session.pendingBoundary)return denied('human-decision-pending');
  if(!session.capabilities.includes(operation)||!MATRIX_OPERATIONS.includes(operation))return denied('operation-outside-mandate');
  if(session.usage.cycles>=session.budget.maxCycles)return denied('cycle-budget-exhausted');
  if(session.usage.events>=session.budget.maxEvents)return denied('event-budget-exhausted');
  const index=session.programs.findIndex(program=>program.id===programId);
  if(index<0)return denied('program-outside-mandate');
  if(typeof observation!=='string'||!observation.trim()||typeof condition!=='string'||!condition.trim())return denied('observation-and-condition-required');
  if(operation!=='matrix.reprogram')return denied('cycle-operation-not-implemented');
  if(session.usage.revisions>=session.budget.maxRevisions)return denied('revision-budget-exhausted');
  if(typeof nextSource!=='string'||typeof rollbackSource!=='string')return denied('revision-and-rollback-required');
  const program=session.programs[index];
  if(rollbackSource!==program.source)return denied('rollback-does-not-match-current-revision');
  if(!testResult||typeof testResult.passed!=='boolean')return denied('test-result-required');
  const candidateDigest=digest(nextSource);
  const passed=testResult.passed===true;
  const updatedProgram=passed?{
    ...program,source:nextSource,digest:candidateDigest,revision:program.revision+1,
    lastPassingDigest:candidateDigest,parentDigest:program.digest
  }:{...program};
  const programs=[...session.programs];
  programs[index]=updatedProgram;
  const outcome=passed?'applied':'rolled-back';
  const event={
    id:id('MXE'),type:'matrix-cycle',at,actorKind:NAVIGATOR_ACTOR,operation,programId,
    observation:observation.trim(),condition:condition.trim(),candidateDigest,
    previousDigest:program.digest,testPassed:passed,testSummary:String(testResult.summary||'').trim(),
    outcome,rollbackDigest:passed?null:program.digest,canonical:false,reversible:true
  };
  const usage={cycles:session.usage.cycles+1,revisions:session.usage.revisions+(passed?1:0),events:session.usage.events+1};
  const next=addEvent(session,event,{phase:passed?'evaluate':'reobserve',programs,usage});
  return{accepted:true,reason:null,outcome,event,session:next};
}

export function authorizeMandatedOperation(session,{operation,targetRef,effectClass,rollback}={}){
  if(!session||session.protocol!==MATRIX_PROTOCOL||session.status!=='active')return denied('invalid-or-inactive-matrix');
  if(!current(session))return denied('stale-matrix-state');
  if(session.pendingBoundary)return denied('human-decision-pending');
  if(!session.capabilities.includes(operation)||!MATRIX_OPERATIONS.includes(operation))return denied('operation-outside-mandate');
  if(!session.programScope.includes(targetRef))return denied('program-outside-mandate');
  if(![MATRIX_EFFECT.VIRTUAL_REVERSIBLE,MATRIX_EFFECT.CODEX_REVERSIBLE].includes(effectClass))return denied('human-decision-required');
  if(effectClass===MATRIX_EFFECT.CODEX_REVERSIBLE){
    if(operation!=='codex.patch.reversible')return denied('codex-adapter-operation-required');
    if(!rollback||rollback.verified!==true||typeof rollback.strategy!=='string'||!rollback.strategy.trim()||typeof rollback.digest!=='string'||!rollback.digest.trim())return denied('verified-rollback-required');
  }
  return{
    accepted:true,reason:null,outcome:'ready-for-reversible-adapter',actorKind:NAVIGATOR_ACTOR,
    mandateId:session.mandateId,operation,targetRef,effectClass,rollback:rollback||null,
    humanDecision:null,canonical:false,reversible:true
  };
}

export function requestBoundaryAction(session,{operation,targetRef,effectClass,reason,at=now()}={}){
  if(!session||session.protocol!==MATRIX_PROTOCOL||session.status!=='active')return denied('invalid-or-inactive-matrix');
  if(!current(session))return denied('stale-matrix-state');
  if(session.pendingBoundary)return denied('human-decision-pending');
  if(![MATRIX_EFFECT.EXTERNAL,MATRIX_EFFECT.CANONICAL,MATRIX_EFFECT.IRREVERSIBLE].includes(effectClass))return denied('boundary-effect-required');
  if(typeof operation!=='string'||!operation.trim()||typeof targetRef!=='string'||!targetRef.trim())return denied('boundary-action-required');
  const boundary={
    id:id('MXB'),operation:operation.trim(),targetRef:targetRef.trim(),effectClass,
    reason:String(reason||'').trim(),digest:digest(`${operation}|${targetRef}|${effectClass}|${reason||''}`),requestedAt:at
  };
  const event={id:id('MXE'),type:'boundary-requested',boundaryId:boundary.id,effectClass,operation:boundary.operation,targetRef:boundary.targetRef,at};
  const next=addEvent(session,event,{status:'awaiting-human-decision',phase:'boundary',pendingBoundary:boundary,usage:{...session.usage,events:session.usage.events+1}});
  return{accepted:true,reason:null,outcome:'awaiting-human-decision',boundary,session:next};
}

export function resolveBoundaryAction(session,{actorKind,decision,boundaryId,boundaryDigest,rationale='',at=now()}={}){
  if(!session||session.protocol!==MATRIX_PROTOCOL||session.status!=='awaiting-human-decision'||!session.pendingBoundary)return denied('no-boundary-awaiting-decision');
  if(!current(session))return denied('stale-matrix-state');
  if(actorKind!=='human')return denied('human-decision-required');
  if(!['approve','return','discard','quiet'].includes(decision))return denied('invalid-human-decision');
  if(boundaryId!==session.pendingBoundary.id||boundaryDigest!==session.pendingBoundary.digest)return denied('decision-not-bound-to-exact-action');
  const humanDecision={id:id('MXH'),actorKind:'human',decision,boundaryId,rationale:String(rationale).trim(),at};
  const event={id:id('MXE'),type:'boundary-human-decision',decisionId:humanDecision.id,boundaryId,decision,at};
  const status=decision==='approve'?'ready-for-external-executor':decision==='return'?'active':decision==='quiet'?'paused':'closed';
  const phase=decision==='approve'?'handoff':decision==='return'?'reobserve':decision==='quiet'?'quiet':'closure';
  const next=addEvent(session,event,{status,phase,humanDecision,pendingBoundary:decision==='return'?null:session.pendingBoundary,usage:{...session.usage,events:session.usage.events+1}});
  return{accepted:true,reason:null,outcome:status,humanDecision,session:next};
}

export function haltMatrixSession(session,{actorKind='human',reason='',at=now()}={}){
  if(!session||session.protocol!==MATRIX_PROTOCOL||!['active','awaiting-human-decision','ready-for-external-executor'].includes(session.status))return denied('matrix-not-haltable');
  if(!current(session))return denied('stale-matrix-state');
  if(!['human','system'].includes(actorKind))return denied('invalid-halt-actor');
  const event={id:id('MXE'),type:'matrix-halted',actorKind,reason:String(reason).trim(),at};
  const next=addEvent(session,event,{status:'halted',phase:'closure',usage:{...session.usage,events:session.usage.events+1}});
  return{accepted:true,reason:null,session:next};
}
