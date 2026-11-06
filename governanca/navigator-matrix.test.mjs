import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MATRIX_EFFECT,
  MATRIX_GUARDRAILS,
  MATRIX_ISOLATION,
  authorizeMandatedOperation,
  createMatrixMandate,
  createMatrixSession,
  haltMatrixSession,
  recordHumanDirective,
  recordMandatedOperation,
  requestBoundaryAction,
  resolveBoundaryAction,
  runMatrixCycle
} from './navigator-matrix.mjs';

const fixture={id:'fixture:matrix-01',kind:'fictional-fixture',isolation:MATRIX_ISOLATION,synthetic:true,containsUserData:false,localOnly:true,canonical:false,reversible:true};
const program={id:'LIMEN',source:'export const state="observe";',virtual:true,canonical:false};
const mandate=(overrides={})=>createMatrixMandate({
  actorKind:'human',mission:'Adaptar LIMEN dins la Matrix',programs:['LIMEN'],
  reversibleOperations:['matrix.observe','matrix.plan','matrix.reprogram','matrix.test','matrix.rollback'],
  priorities:[{id:'clarity',label:'Fer perceptible cada canvi.'}],budget:{maxCycles:3,maxRevisions:2,maxEvents:12},...overrides
});
const open=(overrides={})=>{
  const createdMandate=mandate(overrides.mandate||{});
  assert.equal(createdMandate.accepted,true);
  return createMatrixSession({invokerKind:'human',mandate:createdMandate.mandate,fixture,programs:[program],...overrides.session});
};

test('only a human can issue the scoped mandate and canonical guardrails stay first',()=>{
  assert.equal(mandate({actorKind:'artificial'}).reason,'human-mandate-required');
  const result=mandate();
  assert.equal(result.accepted,true);
  assert.equal(result.mandate.priorities[0].id,'human-agency');
  assert.equal(result.mandate.priorities[MATRIX_GUARDRAILS.length].id,'clarity');
  assert.equal(result.mandate.humanDecision,null);
});

test('NAVIGATOR opens as artificial actor inside a reversible virtual environment',()=>{
  const result=open();
  assert.equal(result.accepted,true);
  assert.equal(result.session.actorKind,'artificial');
  assert.equal(result.session.humanDecision,null);
  assert.deepEqual(result.session.provenance,{localOnly:true,canonical:false,reversible:true,parentMandate:result.session.mandateId});
  assert.equal(result.session.programs[0].virtual,true);
});

test('duplicate virtual program ids are rejected before MATRIX opens',()=>{
  const createdMandate=mandate();
  assert.equal(createdMandate.accepted,true);
  const duplicated=createMatrixSession({
    invokerKind:'human',mandate:createdMandate.mandate,fixture,
    programs:[program,{...program,source:'export const state="duplicate";'}]
  });
  assert.equal(duplicated.reason,'virtual-programs-required');
});

test('human directives can refine priorities without becoming irreversible authorization',()=>{
  const {session}=open();
  assert.equal(recordHumanDirective(session,{actorKind:'artificial',directive:'Canvia el programa'}).reason,'human-directive-required');
  const directed=recordHumanDirective(session,{actorKind:'human',directive:'Prioritza la claredat abans de la velocitat',priority:'clarity'});
  assert.equal(directed.accepted,true);
  assert.equal(directed.session.humanDecision,null);
  assert.equal(directed.session.directives.length,1);
});

test('the event budget bounds directives and reserves room for a boundary decision',()=>{
  const {session}=open({mandate:{budget:{maxCycles:3,maxRevisions:2,maxEvents:2}}});
  const directed=recordHumanDirective(session,{actorKind:'human',directive:'Una sola directiva dins el pressupost'});
  assert.equal(directed.accepted,true);
  assert.equal(recordHumanDirective(directed.session,{actorKind:'human',directive:'Fora de pressupost'}).reason,'event-budget-exhausted');
  const boundarySession=open({mandate:{budget:{maxCycles:3,maxRevisions:2,maxEvents:2}}}).session;
  assert.equal(requestBoundaryAction(boundarySession,{operation:'publish-change',targetRef:'main',effectClass:MATRIX_EFFECT.CANONICAL}).reason,'event-budget-exhausted');
});

test('a passing virtual revision is applied and remains non-canonical',()=>{
  const {session}=open();
  const revised=runMatrixCycle(session,{
    observation:'El missatge de pausa és ambigu.',condition:'Cal distingir QUIES de cancel·lació.',
    programId:'LIMEN',nextSource:'export const state="quies";',rollbackSource:program.source,
    testResult:{passed:true,summary:'Contracte i sintaxi correctes.'}
  });
  assert.equal(revised.accepted,true);
  assert.equal(revised.outcome,'applied');
  assert.equal(revised.session.programs[0].source,'export const state="quies";');
  assert.equal(revised.event.canonical,false);
  assert.equal(revised.event.reversible,true);
});

test('a failing revision performs Retrodansa to the last passing source',()=>{
  const {session}=open();
  const failed=runMatrixCycle(session,{
    observation:'Provar una hipòtesi.',condition:'La prova ha de conservar el contracte.',
    programId:'LIMEN',nextSource:'broken(',rollbackSource:program.source,
    testResult:{passed:false,summary:'Error de sintaxi.'}
  });
  assert.equal(failed.accepted,true);
  assert.equal(failed.outcome,'rolled-back');
  assert.equal(failed.session.programs[0].source,program.source);
  assert.equal(failed.session.phase,'reobserve');
  assert.equal(failed.event.rollbackDigest,failed.session.programs[0].digest);
});

test('budget and stale-state checks prevent uncontrolled self-reprogramming',()=>{
  const {session}=open({mandate:{budget:{maxCycles:1,maxRevisions:1,maxEvents:4}}});
  const first=runMatrixCycle(session,{observation:'A',condition:'B',programId:'LIMEN',nextSource:'export const state="a";',rollbackSource:program.source,testResult:{passed:true}});
  assert.equal(first.accepted,true);
  assert.equal(runMatrixCycle(session,{observation:'C',condition:'D',programId:'LIMEN',nextSource:'x',rollbackSource:program.source,testResult:{passed:true}}).reason,'stale-matrix-state');
  assert.equal(runMatrixCycle(first.session,{observation:'C',condition:'D',programId:'LIMEN',nextSource:'x',rollbackSource:first.session.programs[0].source,testResult:{passed:true}}).reason,'cycle-budget-exhausted');
});

test('mandate expiry stops new work but still permits a human non-approving closure',()=>{
  const createdMandate=mandate({expiresAt:'2026-11-06T10:00:00.000Z'});
  assert.equal(createdMandate.accepted,true);
  const opened=createMatrixSession({
    invokerKind:'artificial',mandate:createdMandate.mandate,fixture,programs:[program],at:'2026-11-06T09:00:00.000Z'
  });
  assert.equal(opened.accepted,true);
  assert.equal(runMatrixCycle(opened.session,{
    observation:'A',condition:'B',programId:'LIMEN',nextSource:'x',rollbackSource:program.source,
    testResult:{passed:true},at:'2026-11-06T10:00:00.000Z'
  }).reason,'mandate-expired');

  const boundarySession=createMatrixSession({
    invokerKind:'human',mandate:createdMandate.mandate,fixture,programs:[program],at:'2026-11-06T09:00:00.000Z'
  });
  const requested=requestBoundaryAction(boundarySession.session,{
    operation:'publish-change',targetRef:'main',effectClass:MATRIX_EFFECT.CANONICAL,at:'2026-11-06T09:30:00.000Z'
  });
  assert.equal(resolveBoundaryAction(requested.session,{
    actorKind:'human',decision:'approve',boundaryId:requested.boundary.id,boundaryDigest:requested.boundary.digest,
    at:'2026-11-06T10:00:00.000Z'
  }).reason,'mandate-expired');
  const discarded=resolveBoundaryAction(requested.session,{
    actorKind:'human',decision:'discard',boundaryId:requested.boundary.id,boundaryDigest:requested.boundary.digest,
    at:'2026-11-06T10:00:00.000Z'
  });
  assert.equal(discarded.accepted,true);
  assert.equal(discarded.session.status,'closed');
});

test('a reversible Codex adapter can operate freely only inside the human mandate and with verified rollback',()=>{
  const createdMandate=createMatrixMandate({
    actorKind:'human',mission:'Polir LIMEN reversible',programs:['LIMEN'],
    reversibleOperations:['codex.patch.reversible'],budget:{maxCycles:2,maxRevisions:1,maxEvents:6}
  });
  const created=createMatrixSession({invokerKind:'artificial',mandate:createdMandate.mandate,fixture,programs:[program]});
  assert.equal(authorizeMandatedOperation(created.session,{operation:'codex.patch.reversible',targetRef:'LIMEN',effectClass:MATRIX_EFFECT.CODEX_REVERSIBLE}).reason,'verified-rollback-required');
  const authorized=authorizeMandatedOperation(created.session,{
    operation:'codex.patch.reversible',targetRef:'LIMEN',effectClass:MATRIX_EFFECT.CODEX_REVERSIBLE,
    rollback:{verified:true,strategy:'restore-parent-digest',digest:created.session.programs[0].digest}
  });
  assert.equal(authorized.accepted,true);
  assert.equal(authorized.outcome,'ready-for-reversible-adapter');
  assert.equal(authorized.humanDecision,null);
  assert.equal(authorizeMandatedOperation(created.session,{operation:'codex.patch.reversible',targetRef:'DISSENSUS',effectClass:MATRIX_EFFECT.CODEX_REVERSIBLE,rollback:{verified:true,strategy:'restore',digest:'x'}}).reason,'program-outside-mandate');
  const recorded=recordMandatedOperation(created.session,{
    authorization:authorized,outcome:'applied',beforeDigest:authorized.rollback.digest,afterDigest:'after',
    summary:'Adaptador sintètic aplicat i verificat.'
  });
  assert.equal(recorded.accepted,true);
  assert.equal(recorded.session.events.at(-1).type,'mandated-adapter-operation');
  assert.equal(recorded.session.events.at(-1).authorizationId,authorized.id);
  assert.equal(recorded.session.humanDecision,null);
  assert.equal(recordMandatedOperation(created.session,{
    authorization:authorized,outcome:'applied',beforeDigest:authorized.rollback.digest,afterDigest:'after'
  }).reason,'stale-matrix-state');
  assert.equal(recordMandatedOperation(recorded.session,{
    authorization:authorized,outcome:'applied',beforeDigest:authorized.rollback.digest,afterDigest:'after'
  }).reason,'invalid-adapter-authorization');
});

test('external, canonical and irreversible effects stop at the human boundary',()=>{
  for(const effectClass of [MATRIX_EFFECT.EXTERNAL,MATRIX_EFFECT.CANONICAL,MATRIX_EFFECT.IRREVERSIBLE]){
    const {session}=open();
    const boundary=requestBoundaryAction(session,{operation:'publish-change',targetRef:'main',effectClass,reason:'Sortir de la Matrix'});
    assert.equal(boundary.accepted,true);
    assert.equal(boundary.outcome,'awaiting-human-decision');
    assert.equal(boundary.session.humanDecision,null);
  }
});

test('human approval is bound to one exact boundary and only prepares a handoff',()=>{
  const {session}=open();
  const requested=requestBoundaryAction(session,{operation:'publish-change',targetRef:'main',effectClass:MATRIX_EFFECT.IRREVERSIBLE,reason:'Canvi sense retorn automàtic'});
  assert.equal(resolveBoundaryAction(requested.session,{actorKind:'artificial',decision:'approve',boundaryId:requested.boundary.id,boundaryDigest:requested.boundary.digest}).reason,'human-decision-required');
  assert.equal(resolveBoundaryAction(requested.session,{actorKind:'human',decision:'approve',boundaryId:'other',boundaryDigest:requested.boundary.digest}).reason,'decision-not-bound-to-exact-action');
  const approved=resolveBoundaryAction(requested.session,{actorKind:'human',decision:'approve',boundaryId:requested.boundary.id,boundaryDigest:requested.boundary.digest,rationale:'Autorització concreta'});
  assert.equal(approved.accepted,true);
  assert.equal(approved.outcome,'ready-for-external-executor');
  assert.equal(approved.session.humanDecision.actorKind,'human');
  assert.notEqual(approved.session.status,'completed');
});

test('return, quiet and halt preserve human control and stop further cycles',()=>{
  const {session}=open();
  const requested=requestBoundaryAction(session,{operation:'external-call',targetRef:'service:test',effectClass:MATRIX_EFFECT.EXTERNAL});
  const returned=resolveBoundaryAction(requested.session,{actorKind:'human',decision:'return',boundaryId:requested.boundary.id,boundaryDigest:requested.boundary.digest});
  assert.equal(returned.session.status,'active');
  assert.equal(returned.session.phase,'reobserve');
  const halted=haltMatrixSession(returned.session,{actorKind:'human',reason:'Aturada voluntària'});
  assert.equal(halted.session.status,'halted');
  assert.equal(runMatrixCycle(halted.session,{observation:'A',condition:'B',programId:'LIMEN',nextSource:'x',rollbackSource:program.source,testResult:{passed:true}}).reason,'invalid-or-inactive-matrix');
});
