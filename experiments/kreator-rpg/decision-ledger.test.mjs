import test from 'node:test';
import assert from 'node:assert/strict';
import {activeDecision,appendHumanDecision,decisionStatus,latestHumanDecisionSummary} from './decision-ledger.mjs';

const decision=(id,action='reobserve')=>({id,type:'human-decision',actorKind:'human',action,at:`2026-09-23T18:00:${id.endsWith('1')?'00':'10'}.000Z`,route:{movement:'rastre',difference:'diferència sintètica'},effect:{initiated:false},provenance:{reversible:true,canonical:false}});

test('a consecutive human decision explicitly supersedes the still-active decision',()=>{
  const events=[];
  appendHumanDecision(events,decision('decision-1'));
  const second=appendHumanDecision(events,decision('decision-2','transform'));

  assert.equal(events.length,2);
  assert.equal(events[0].id,'decision-1');
  assert.equal(events[1].supersedes,'decision-1');
  assert.equal(decisionStatus(events,events[0]),'superseded');
  assert.equal(activeDecision(events),events[1]);
  assert.deepEqual(events.map(event=>event.provenance),[
    {reversible:true,canonical:false},{reversible:true,canonical:false}
  ]);
  assert.equal(second.id,'decision-2');
});

test('only the replacing decision can authorize a later synthetic effect',()=>{
  const events=[];
  appendHumanDecision(events,decision('decision-1'));
  const replacement=appendHumanDecision(events,decision('decision-2','transform'));
  events.push({id:'movement-1',type:'movement',authorizedBy:{kind:'human-decision',id:replacement.id,action:replacement.action}});

  assert.equal(decisionStatus(events,events[0]),'superseded');
  assert.equal(decisionStatus(events,replacement),'effect-authorized');
  assert.equal(activeDecision(events),null);
  assert.equal(events.at(-1).authorizedBy.id,'decision-2');
});

test('route invalidation and closure retire the active decision and export its outcome',()=>{
  const invalidated=[decision('decision-1')];
  invalidated.push({type:'decision-invalidated',decisionId:'decision-1'});
  assert.equal(decisionStatus(invalidated,invalidated[0]),'invalidated');
  assert.equal(activeDecision(invalidated),null);

  const closed=[decision('decision-2')];
  closed.push({type:'closure',authorizedBy:{id:'decision-2'}});
  assert.equal(decisionStatus(closed,closed[0]),'closed-without-effect');
  assert.equal(activeDecision(closed),null);
  assert.deepEqual(latestHumanDecisionSummary(closed),{
    id:'decision-2',actorKind:'human',action:'reobserve',at:'2026-09-23T18:00:10.000Z',status:'closed-without-effect',unresolvedPriorDecisionIds:[]
  });
});

test('JSON decision summary preserves the explicit supersession relation',()=>{
  const events=[];
  appendHumanDecision(events,decision('decision-1'));
  appendHumanDecision(events,decision('decision-2','transform'));
  const json=JSON.parse(JSON.stringify({humanDecision:latestHumanDecisionSummary(events),events}));

  assert.equal(json.humanDecision.id,'decision-2');
  assert.equal(json.humanDecision.status,'active');
  assert.equal(json.humanDecision.supersedes,'decision-1');
  assert.deepEqual(json.humanDecision.unresolvedPriorDecisionIds,[]);
  assert.equal(json.events[0].id,'decision-1');
  assert.equal(json.events[1].id,'decision-2');
});

test('legacy consecutive decisions remain preserved and are not assigned an invented replacement relation',()=>{
  const events=[decision('legacy-1'),decision('legacy-2','transform')];

  assert.equal(decisionStatus(events,events[0]),'unresolved');
  assert.equal(activeDecision(events),events[1]);
  const summary=latestHumanDecisionSummary(events);
  assert.equal(summary.status,'active');
  assert.deepEqual(summary.unresolvedPriorDecisionIds,['legacy-1']);
  assert.equal(events[1].supersedes,undefined);
});
