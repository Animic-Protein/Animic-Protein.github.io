import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NAVIGATOR_GITHUB_CAPABILITIES,
  NAVIGATOR_GITHUB_ZONE,
  approveNavigatorZoneRequest,
  createNavigatorZoneMandate,
  requestNavigatorZoneOperation,
  revokeNavigatorZoneMandate
} from './navigator-zones.mjs';

const repository='Animic-Protein/Animic-Protein.github.io';
const mandate=async(overrides={})=>(await createNavigatorZoneMandate({actorKind:'human',repository,capabilities:[...NAVIGATOR_GITHUB_CAPABILITIES],expiresAt:new Date(Date.now()+3600000).toISOString(),...overrides})).mandate;
const request=async(operation,overrides={})=>requestNavigatorZoneOperation(await mandate(),{operation,repository,resource:'cambra-nua-2/trace-history.browser.test.mjs',details:{title:'Prova limitada',body:'Només esborrany'},...overrides});

test('a human mandate opens one exact GitHub repository zone with bounded capabilities',async()=>{
  const opened=await createNavigatorZoneMandate({actorKind:'human',repository,capabilities:['repository.read','patch.prepare','pull-request.draft.create'],expiresAt:new Date(Date.now()+3600000).toISOString()});
  assert.equal(opened.accepted,true);
  assert.equal(opened.mandate.zone,NAVIGATOR_GITHUB_ZONE);
  assert.deepEqual(opened.mandate.capabilities,['repository.read','patch.prepare','pull-request.draft.create']);
  assert.equal(opened.mandate.issuedBy,'human');
  assert.equal(opened.execution,'not-executed');
  assert.equal((await createNavigatorZoneMandate({actorKind:'artificial',repository,capabilities:['repository.read']})).reason,'human-zone-mandate-required');
  assert.equal((await createNavigatorZoneMandate({actorKind:'human',repository:'*/*',capabilities:['repository.read']})).reason,'repository-outside-declared-zone');
  assert.equal((await createNavigatorZoneMandate({actorKind:'human',repository,capabilities:['repository.delete']})).reason,'capability-outside-declared-zone');
  assert.equal((await createNavigatorZoneMandate({actorKind:'human',repository,capabilities:['repository.read']})).reason,'finite-zone-expiry-required');
  assert.equal((await createNavigatorZoneMandate({actorKind:'human',repository,capabilities:['repository.read'],expiresAt:new Date(Date.now()+3600000).toISOString(),maxRequests:100})).reason,'finite-zone-budget-required');
});

test('read and patch preparation stay inside the named repository and do not execute',async()=>{
  for(const operation of ['repository.read','patch.prepare']){
    const result=await request(operation);
    assert.equal(result.accepted,true);
    assert.equal(result.request.zone,NAVIGATOR_GITHUB_ZONE);
    assert.equal(result.request.repository,repository);
    assert.equal(result.request.status,'authorized-awaiting-adapter');
    assert.equal(result.request.execution,'not-executed');
    assert.equal(result.request.humanDecision,null);
  }
  assert.equal((await request('repository.read',{repository:'Animic-Protein/another-repo'})).reason,'repository-outside-zone-mandate');
  assert.equal((await request('repository.read',{resource:''})).reason,'exact-resource-required');
  assert.equal((await request('repository.read',{resource:'../outside.md'})).reason,'exact-resource-required');
  assert.equal((await request('repository.read',{resource:'/README.md'})).reason,'exact-resource-required');
});

test('creating a draft pull request requires an exact one-use human decision and still awaits an adapter',async()=>{
  const pending=(await request('pull-request.draft.create')).request;
  assert.equal(pending.status,'human-approval-required');
  assert.equal(approveNavigatorZoneRequest(pending,{actorKind:'artificial',decision:'approve',actionDigest:pending.actionDigest}).reason,'valid-human-decision-required');
  assert.equal(approveNavigatorZoneRequest(pending,{actorKind:'human',decision:'approve',actionDigest:'b'.repeat(64)}).reason,'decision-action-digest-mismatch');
  const changed=(await request('pull-request.draft.create',{details:{title:'Canviat després de demanar autorització'}})).request;
  assert.notEqual(changed.actionDigest,pending.actionDigest,'canviar els detalls invalida l’empremta aprovada');
  const approved=approveNavigatorZoneRequest(pending,{actorKind:'human',decision:'approve',actionDigest:pending.actionDigest});
  assert.equal(approved.accepted,true);
  assert.equal(approved.request.status,'authorized-awaiting-adapter');
  assert.equal(approved.request.humanDecision.actionDigest,pending.actionDigest);
  assert.equal(approved.request.execution,'not-executed');
  assert.equal(approveNavigatorZoneRequest(approved.request,{actorKind:'human',decision:'approve',actionDigest:pending.actionDigest}).reason,'request-not-awaiting-human-approval');
  assert.equal(approveNavigatorZoneRequest(pending,{actorKind:'human',decision:'approve',actionDigest:pending.actionDigest}).reason,'request-not-awaiting-human-approval','the original pending request cannot be replayed');
});

test('merge, publish, deploy, canonical and irreversible actions remain outside the zone',async()=>{
  for(const operation of ['pull-request.merge','repository.publish','pages.deploy','canonicalize','external.irreversible']){
    assert.equal((await request(operation)).reason,'operation-outside-zone-mandate',operation);
  }
});

test('a human can revoke the zone mandate and artificial revocation is denied',async()=>{
  const active=await mandate();
  assert.equal(revokeNavigatorZoneMandate(active,{actorKind:'artificial'}).reason,'human-revocation-required');
  const revoked=revokeNavigatorZoneMandate(active,{actorKind:'human'});
  assert.equal(revoked.accepted,true);
  assert.equal(revoked.mandate.status,'revoked');
  assert.equal(revoked.mandate.events.at(-1).type,'zone-mandate-revoked');
});

test('revocation cancels pending external requests before their one-use approval',async()=>{
  const active=await mandate();
  const pending=await requestNavigatorZoneOperation(active,{operation:'pull-request.draft.create',repository,resource:'cambra-nua-2/trace-history.browser.test.mjs',details:{title:'Proposta'}});
  const revoked=revokeNavigatorZoneMandate(pending.mandate,{actorKind:'human'});
  assert.equal(revoked.accepted,true);
  assert.equal(approveNavigatorZoneRequest(pending.request,{actorKind:'human',decision:'approve',actionDigest:pending.request.actionDigest}).reason,'request-not-awaiting-human-approval');
});

test('zone mandates expire, consume a finite request budget and reject stale revisions',async()=>{
  const opened=await createNavigatorZoneMandate({actorKind:'human',repository,capabilities:['repository.read'],expiresAt:'2026-11-21T00:00:00.000Z',maxRequests:1,at:'2026-11-20T00:00:00.000Z'});
  let current=opened.mandate;
  const first=await requestNavigatorZoneOperation(current,{operation:'repository.read',repository,resource:'README.md',details:{},at:'2026-11-20T00:01:00.000Z'});
  assert.equal(first.accepted,true);
  assert.equal(first.mandate.usage.requests,1);
  assert.equal((await requestNavigatorZoneOperation(current,{operation:'repository.read',repository,resource:'README.md',details:{},at:'2026-11-20T00:02:00.000Z'})).reason,'stale-zone-mandate');
  current=first.mandate;
  assert.equal((await requestNavigatorZoneOperation(current,{operation:'repository.read',repository,resource:'README.md',details:{},at:'2026-11-20T00:03:00.000Z'})).reason,'zone-request-budget-exhausted');
  assert.equal((await requestNavigatorZoneOperation(current,{operation:'repository.read',repository,resource:'README.md',details:{},at:'2026-11-22T00:00:00.000Z'})).reason,'zone-mandate-expired');
});
