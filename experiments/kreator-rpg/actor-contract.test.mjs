import test from 'node:test';
import assert from 'node:assert/strict';
import {ACTOR_KINDS,authorizeHumanDecision,normalizeActorKind} from '../../governanca/actor-contract.mjs';

test('actorKind accepts only the declared human and artificial values',()=>{
  assert.deepEqual(ACTOR_KINDS,['human','artificial']);
  assert.equal(normalizeActorKind('human'),'human');
  assert.equal(normalizeActorKind('artificial'),'artificial');
  assert.equal(normalizeActorKind('system'),null);
});

test('KREATOR pending cannot produce a humanDecision',()=>{
  const result=authorizeHumanDecision({actorKind:'human',kreatorStatus:'pending'});
  assert.equal(result.accepted,false);
  assert.equal(result.reason,'kreator-pending');
  assert.equal(result.humanDecision,null);
});

test('an artificial actor cannot produce a humanDecision',()=>{
  const result=authorizeHumanDecision({actorKind:'artificial',kreatorStatus:'transform'});
  assert.equal(result.accepted,false);
  assert.equal(result.reason,'actor-not-human');
  assert.equal(result.humanDecision,null);
});

test('a resolved human KREATOR decision crosses the actor threshold',()=>{
  const result=authorizeHumanDecision({actorKind:'human',kreatorStatus:'reobserve'});
  assert.equal(result.accepted,true);
  assert.deepEqual(result.humanDecision,{actorKind:'human',status:'resolved'});
});
