import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MATRIX_BROWSER_GUARDRAILS,
  createBrowserMatrixMandate,
  exportBrowserMatrixTrace,
  invokeBrowserMatrix,
  rollbackBrowserMatrix
} from './navigator-matrix-iphone.mjs';

function ids(){
  let sequence=0;
  return prefix=>`${prefix}-${++sequence}`;
}

function mandate(overrides={}){
  return createBrowserMatrixMandate({
    mission:'Assajar una variació sintètica',priorities:['Claredat','Retorn exacte'],
    maxCycles:3,maxRevisions:2,maxEvents:12,durationMinutes:30,...overrides
  },{at:'2026-11-06T10:00:00.000Z',idFactory:ids()});
}

test('the iPhone threshold creates a human mandate with immutable guardrails first',()=>{
  const state=mandate();
  assert.equal(state.status,'mandate-ready');
  assert.equal(state.mandate.actorKind,'human');
  assert.deepEqual(state.mandate.programs,['CODEX_CREATURE']);
  assert.deepEqual(state.mandate.reversibleOperations,['codex.patch.reversible']);
  assert.deepEqual(state.mandate.priorities.slice(0,MATRIX_BROWSER_GUARDRAILS.length),MATRIX_BROWSER_GUARDRAILS);
  assert.equal(state.mandate.priorities.at(-2).label,'Claredat');
  assert.equal(state.humanDecision,null);
});

test('NAVIGATOR applies one synthetic variant and Retrodansa restores the exact fixture',async()=>{
  const initial=mandate();
  const initialSerialized=JSON.stringify(initial.fixture.fragment);
  const applied=await invokeBrowserMatrix(initial,'cobalt',{at:'2026-11-06T10:01:00.000Z',idFactory:ids()});
  assert.equal(applied.status,'applied');
  assert.equal(applied.session.actorKind,'artificial');
  assert.equal(applied.session.humanDecision,null);
  assert.equal(applied.fixture.fragment.content,'Pols cobalt B');
  assert.notEqual(applied.rollbackReceipt.beforeDigest,applied.rollbackReceipt.afterDigest);
  assert.equal(applied.trace.at(-1).outcome,'applied');
  assert.equal(initial.fixture.fragment.content,'Pols cobalt A','The input state remains immutable');

  const rolledBack=await rollbackBrowserMatrix(applied,{at:'2026-11-06T10:02:00.000Z',idFactory:ids()});
  assert.equal(rolledBack.status,'rolled-back');
  assert.equal(JSON.stringify(rolledBack.fixture.fragment),initialSerialized);
  assert.equal(rolledBack.trace.at(-1).outcome,'rolled-back');
  assert.equal(rolledBack.trace.at(-1).rollbackDigest,rolledBack.lastRollback.restoredDigest);
  assert.equal(rolledBack.humanDecision,null);

  const exported=exportBrowserMatrixTrace(rolledBack,'2026-11-06T10:03:00.000Z');
  assert.equal(exported.format,'navigator-matrix-iphone-trace');
  assert.equal(exported.localOnly,true);
  assert.equal(exported.canonical,false);
  assert.equal(exported.humanDecision,null);
});

test('expiry and stale fixture state stop the mobile rehearsal',async()=>{
  const expired=mandate({durationMinutes:15});
  await assert.rejects(
    invokeBrowserMatrix(expired,'quies',{at:'2026-11-06T10:15:00.000Z',idFactory:ids()}),
    /mandate-expired/
  );
  const applied=await invokeBrowserMatrix(mandate(),'retrodansa',{at:'2026-11-06T10:01:00.000Z',idFactory:ids()});
  applied.fixture.fragment.content='Alteració concurrent';
  await assert.rejects(
    rollbackBrowserMatrix(applied,{at:'2026-11-06T10:02:00.000Z',idFactory:ids()}),
    /stale-adapter-state/
  );
});
