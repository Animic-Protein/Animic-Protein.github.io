import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NAVIGATOR_SANDBOX_OPERATIONS,
  authorizeNavigatorOperation,
  createNavigatorInvocation,
  recordNavigatorOperation,
  recordNavigatorSuggestion
} from './navigator-contract.mjs';

const fixture={id:'fixture:traverse-01',kind:'fictional-fixture',isolation:'navigator-sandbox-0.1',synthetic:true,containsUserData:false,localOnly:true,canonical:false,reversible:true};

test('a human or artificial caller can invoke NAVIGATOR while its actor stays artificial',()=>{
  for(const invokerKind of ['human','artificial']){
    const result=createNavigatorInvocation({invokerKind,purpose:'Primera travessa fictícia',fixture});
    assert.equal(result.accepted,true);
    assert.equal(result.invocation.invokerKind,invokerKind);
    assert.equal(result.invocation.actorKind,'artificial');
    assert.equal(result.invocation.humanDecision,null);
    assert.deepEqual(result.invocation.provenance,{localOnly:true,canonical:false,reversible:true});
  }
});

test('sandbox operations can traverse the listed instruments on the declared fictional fixture',()=>{
  const {invocation}=createNavigatorInvocation({invokerKind:'artificial',purpose:'Provar engranatges sense material real',fixture});
  const suggestion=recordNavigatorSuggestion(invocation,{action:'Recórrer els instruments sobre el fixture',rationale:'Prova limitada al sandbox.'});
  assert.equal(suggestion.accepted,true);
  assert.equal(suggestion.invocation.humanDecision,null);
  assert.equal(recordNavigatorSuggestion({...suggestion.invocation,humanDecision:{actorKind:'human'}},{action:'No suplantar la decisió'}).reason,'navigator-cannot-create-human-decision');
  let current=suggestion.invocation;
  for(const operation of NAVIGATOR_SANDBOX_OPERATIONS){
    const result=recordNavigatorOperation(current,{operation,target:fixture,summary:'Resultat fictici'});
    assert.equal(result.accepted,true,operation);
    assert.equal(result.event.actorKind,'artificial');
    assert.equal(result.event.canonical,false);
    assert.equal(result.event.reversible,true);
    assert.equal(result.invocation.humanDecision,null);
    current=result.invocation;
  }
  assert.equal(current.events.filter(event=>event.type==='sandbox-operation').length,NAVIGATOR_SANDBOX_OPERATIONS.length);
});

test('NAVIGATOR refuses real, user-supplied, mismatched or persistent targets and operations',()=>{
  const {invocation}=createNavigatorInvocation({invokerKind:'human',purpose:'Prova de veto',fixture});
  const realTarget={...fixture,id:'creative:real-01',kind:'creative-fragment',synthetic:false,containsUserData:true,canonical:true};
  assert.equal(authorizeNavigatorOperation(invocation,{operation:'mutatio.fixture',target:realTarget}).reason,'target-outside-invocation-fixture');
  assert.equal(authorizeNavigatorOperation(invocation,{operation:'mutatio.live',target:fixture}).reason,'operation-outside-sandbox-capabilities');
  assert.equal(authorizeNavigatorOperation(invocation,{operation:'publish',target:fixture}).accepted,false);
  assert.equal(authorizeNavigatorOperation(invocation,{operation:'seed.fixture',target:{...fixture,id:'fixture:other'}}).reason,'target-outside-invocation-fixture');
});

test('NAVIGATOR refuses invocations without an explicit synthetic fixture',()=>{
  assert.equal(createNavigatorInvocation({invokerKind:'artificial',purpose:'Sense fixture'}).reason,'fictional-sandbox-fixture-required');
  assert.equal(createNavigatorInvocation({invokerKind:'system',purpose:'Actor no declarat',fixture}).reason,'invalid-invoker-kind');
  assert.equal(createNavigatorInvocation({invokerKind:'human',purpose:'  ',fixture}).reason,'purpose-required');
});
