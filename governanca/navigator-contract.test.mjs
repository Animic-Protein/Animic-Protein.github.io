import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NAVIGATOR_SANDBOX_OPERATIONS,
  authorizeNavigatorOperation,
  closeNavigatorInvocation,
  createNavigatorInvocation,
  recordNavigatorOperation,
  recordNavigatorSuggestion
} from './navigator-contract.mjs';

const fixture={id:'fixture:traverse-01',kind:'fictional-fixture',isolation:'navigator-sandbox-0.1',synthetic:true,containsUserData:false,localOnly:true,canonical:false,reversible:true};
const instruments=['MUTATIO','SEMENT','HOMEOSTASIS','COMPOST','ZAJJ-VIU','RETRODANSA','ARCHIVUM','KREATOR-RPG','LIMEN','DISSENSUS','HARMONIA','MELODIA','RITME','LYRICS','AUDIO-VIDEO','MISCE','ARRANJAMENTS'];
const allOperations=['observe','suggest','traverse.fixture',...NAVIGATOR_SANDBOX_OPERATIONS.filter(operation=>!['observe','suggest','traverse.fixture'].includes(operation))];
const invoke=(overrides={})=>createNavigatorInvocation({invokerKind:'human',purpose:'Primera travessa fictícia',fixture,instruments,operations:allOperations,...overrides});

test('a human or artificial caller can invoke NAVIGATOR while its actor stays artificial',()=>{
  for(const invokerKind of ['human','artificial']){
    const result=invoke({invokerKind});
    assert.equal(result.accepted,true);
    assert.equal(result.invocation.invokerKind,invokerKind);
    assert.equal(result.invocation.actorKind,'artificial');
    assert.equal(result.invocation.humanDecision,null);
    assert.deepEqual(result.invocation.provenance,{localOnly:true,canonical:false,reversible:true});
  }
});

test('sandbox operations can traverse the listed instruments on the declared fictional fixture',()=>{
  const {invocation}=invoke({invokerKind:'artificial',purpose:'Provar engranatges sense material real'});
  const suggestion=recordNavigatorSuggestion(invocation,{action:'Recórrer els instruments sobre el fixture',rationale:'Prova limitada al sandbox.'});
  assert.equal(suggestion.accepted,true);
  assert.equal(suggestion.invocation.humanDecision,null);
  assert.equal(recordNavigatorSuggestion(suggestion.invocation,{action:'Segon impuls'}).reason,'suggestion-already-recorded');
  assert.equal(recordNavigatorSuggestion({...suggestion.invocation,humanDecision:{actorKind:'human'}},{action:'No suplantar la decisió'}).reason,'navigator-cannot-create-human-decision');
  let current=suggestion.invocation;
  for(const operation of NAVIGATOR_SANDBOX_OPERATIONS){
    const result=recordNavigatorOperation(current,{operation,target:fixture,summary:'Resultat fictici'});
    assert.equal(result.accepted,true,operation);
    assert.equal(result.event.actorKind,'artificial');
    assert.equal(result.event.canonical,false);
    assert.equal(result.event.reversible,true);
    assert.equal(result.event.effect,'simulated-record-only');
    assert.equal(result.invocation.humanDecision,null);
    current=result.invocation;
  }
  assert.equal(current.events.filter(event=>event.type==='sandbox-operation').length,NAVIGATOR_SANDBOX_OPERATIONS.length);
});

test('NAVIGATOR refuses real, user-supplied, mismatched or persistent targets and operations',()=>{
  const {invocation}=invoke({purpose:'Prova de veto'});
  const realTarget={...fixture,id:'creative:real-01',kind:'creative-fragment',synthetic:false,containsUserData:true,canonical:true};
  assert.equal(authorizeNavigatorOperation(invocation,{operation:'mutatio.fixture',target:realTarget}).reason,'target-outside-invocation-fixture');
  assert.equal(authorizeNavigatorOperation(invocation,{operation:'mutatio.live',target:fixture}).reason,'operation-outside-declared-capabilities');
  assert.equal(authorizeNavigatorOperation(invocation,{operation:'publish',target:fixture}).accepted,false);
  assert.equal(authorizeNavigatorOperation(invocation,{operation:'seed.fixture',target:{...fixture,id:'fixture:other'}}).reason,'target-outside-invocation-fixture');
});

test('NAVIGATOR refuses invocations without an explicit synthetic fixture',()=>{
  assert.equal(createNavigatorInvocation({invokerKind:'artificial',purpose:'Sense fixture'}).reason,'fictional-sandbox-fixture-required');
  assert.equal(invoke({invokerKind:'system'}).reason,'invalid-invoker-kind');
  assert.equal(invoke({purpose:'  '}).reason,'purpose-required');
});

test('invocation scope is explicit and instrument operations cannot exceed it',()=>{
  const noScope=createNavigatorInvocation({invokerKind:'human',purpose:'Sense abast',fixture});
  assert.equal(noScope.reason,'explicit-instrument-scope-required');
  assert.equal(invoke({instruments:['LIMEN'],operations:['mutatio.fixture']}).reason,'operation-outside-declared-instruments');
  const {invocation}=invoke({instruments:['LIMEN'],operations:['observe','limen.fixture']});
  assert.equal(recordNavigatorSuggestion(invocation,{action:'No autoritzat'}).reason,'suggestion-outside-declared-capabilities');
  assert.equal(authorizeNavigatorOperation(invocation,{operation:'mutatio.fixture',target:fixture}).reason,'operation-outside-declared-capabilities');
});

test('Creature rehearsal can name all six departments and its transversal arrangement',()=>{
  const creatureDepartments=['HARMONIA','MELODIA','RITME','LYRICS','AUDIO-VIDEO','MISCE'];
  const {invocation}=invoke({
    instruments:[...creatureDepartments,'ARRANJAMENTS'],
    operations:['observe','suggest','traverse.fixture',...creatureDepartments.map(name=>`creature.${name.toLowerCase()}.fixture`),'arrangement.fixture']
  });
  let current=invocation;
  for(const department of creatureDepartments){
    const operation=`creature.${department.toLowerCase()}.fixture`;
    const result=recordNavigatorOperation(current,{operation,target:fixture,summary:`Passada simulada per ${department}`});
    assert.equal(result.accepted,true,department);
    current=result.invocation;
  }
  const arrangement=recordNavigatorOperation(current,{operation:'arrangement.fixture',target:fixture,summary:'Referència fictícia a un fragment'});
  assert.equal(arrangement.accepted,true);
  assert.equal(arrangement.event.effect,'simulated-record-only');
  assert.equal(arrangement.invocation.humanDecision,null);
});

test('pass revisions reject stale branches and stale states after closure',()=>{
  const {invocation}=invoke({instruments:['LIMEN'],operations:['observe','suggest','limen.fixture']});
  const suggestion=recordNavigatorSuggestion(invocation,{action:'Un únic impuls per aquesta passada'});
  assert.equal(suggestion.accepted,true);
  assert.equal(suggestion.invocation.revision,invocation.revision+1);
  assert.equal(recordNavigatorSuggestion(invocation,{action:'Branca paral·lela'}).reason,'stale-invocation-state');
  const closed=closeNavigatorInvocation(suggestion.invocation,{outcome:'completed'});
  assert.equal(closed.accepted,true);
  assert.equal(recordNavigatorOperation(suggestion.invocation,{operation:'limen.fixture',target:fixture}).reason,'stale-invocation-state');
  assert.equal(recordNavigatorOperation(closed.invocation,{operation:'limen.fixture',target:fixture}).reason,'invalid-or-closed-invocation');
});

test('closing a pass is traceable and blocks further operations',()=>{
  const {invocation}=invoke({instruments:['LIMEN'],operations:['observe','limen.fixture']});
  const closed=closeNavigatorInvocation(invocation,{outcome:'completed',summary:'Passada de prova acabada.'});
  assert.equal(closed.accepted,true);
  assert.equal(closed.invocation.status,'closed');
  assert.equal(closed.invocation.humanDecision,null);
  assert.equal(authorizeNavigatorOperation(closed.invocation,{operation:'limen.fixture',target:fixture}).reason,'invalid-or-closed-invocation');
  assert.equal(closeNavigatorInvocation(closed.invocation).accepted,false);
});
