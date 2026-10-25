import assert from 'node:assert/strict';
import {
  authorizeNavigatorOperation,
  closeNavigatorInvocation,
  recordNavigatorOperation
} from '../governanca/navigator-contract.mjs';

const OPERATION='creature.transfer.fixture';
const loopbackHosts=new Set(['127.0.0.1','localhost','[::1]']);

function assertCreaturePage(page){
  assert.ok(page,'A browser page is required');
  const url=new URL(page.url());
  assert.ok(loopbackHosts.has(url.hostname),'The adapter only runs against a loopback test server');
  assert.ok(url.pathname.endsWith('/codex-creature/'),'The adapter only uses the Còdex Creature page');
}

function authorize(invocation,fixture){
  return authorizeNavigatorOperation(invocation,{operation:OPERATION,target:fixture});
}

async function readFragments(page){
  return page.evaluate(()=>JSON.parse(localStorage.getItem('codex-creature-fragments-v1')||'[]'));
}

export async function prepareCreatureFixtureHandoff({page,invocation,fixture}={}){
  assertCreaturePage(page);
  assert.ok(invocation?.status==='active','An active NAVIGATOR invocation is required');
  const authorization=authorize(invocation,fixture);
  if(!authorization.accepted)return authorization;
  if(!fixture?.sourceFragmentId||!['HARMONIA','MELODIA'].includes(fixture.fromDepartment)||!['HARMONIA','MELODIA'].includes(fixture.toDepartment)||fixture.fromDepartment===fixture.toDepartment){
    return{accepted:false,reason:'fixture-transfer-route-required',humanDecision:null};
  }
  const source= (await readFragments(page)).find(fragment=>fragment.id===fixture.sourceFragmentId);
  if(!source||source.origin!==fixture.fromDepartment.toLowerCase()||source.destination!==fixture.toDepartment.toLowerCase()||source.decision!=='draft'){
    return{accepted:false,reason:'pending-fictional-source-required',humanDecision:null};
  }
  if((await readFragments(page)).some(fragment=>fragment.parentId===source.id)){
    return{accepted:false,reason:'fixture-already-transferred',humanDecision:null};
  }

  const sourceLink=page.locator(`.dept-nav a[href="#${source.origin}"]`);
  await sourceLink.click();
  const sourceCard=page.locator(`#list-${source.origin} [data-id="${source.id}"]`).locator('xpath=ancestor::article[contains(@class,"fragment")]');
  assert.equal(await sourceCard.locator(`[data-dest="${source.id}"]`).inputValue(),fixture.toDepartment.toLowerCase(),'The declared destination is visible');
  assert.equal(await sourceCard.locator(`[data-action="approve"][data-id="${source.id}"]`).count(),1,'The human approval control is available');

  const recorded=recordNavigatorOperation(invocation,{
    operation:OPERATION,
    target:fixture,
    summary:`Fixture handoff ${fixture.fromDepartment} → ${fixture.toDepartment} prepared; awaiting explicit human action.`
  });
  if(!recorded.accepted)return recorded;
  return{
    accepted:true,
    reason:null,
    status:'awaiting-human-decision',
    sourceRef:source.id,
    fromDepartment:fixture.fromDepartment,
    toDepartment:fixture.toDepartment,
    humanDecision:null,
    invocation:recorded.invocation
  };
}

export async function observeCompletedCreatureFixtureHandoff({page,invocation,fixture}={}){
  assertCreaturePage(page);
  assert.ok(invocation?.status==='active','An active NAVIGATOR invocation is required');
  const authorization=authorize(invocation,fixture);
  if(!authorization.accepted)return authorization;
  const fragments=await readFragments(page);
  const source=fragments.find(fragment=>fragment.id===fixture.sourceFragmentId);
  const copy=fragments.find(fragment=>fragment.parentId===fixture.sourceFragmentId);
  const approval=source?.events?.find(event=>
    event.type==='transfer-approved'&&
    event.decision==='human-approved'&&
    event.from===fixture.fromDepartment.toLowerCase()&&
    event.to===fixture.toDepartment.toLowerCase()
  );
  const received=copy?.events?.some(event=>
    event.type==='received-copy'&&
    event.decision==='human-approved'&&
    event.parentId===fixture.sourceFragmentId
  );
  if(!source||source.origin!==fixture.fromDepartment.toLowerCase()||source.destination!==fixture.toDepartment.toLowerCase()||source.decision!=='transfer-approved'||!approval||!copy||!received||copy.origin!==fixture.toDepartment.toLowerCase()||copy.content!==source.content){
    return{accepted:false,reason:'human-approval-pending',humanDecision:null,invocation};
  }

  const recorded=recordNavigatorOperation(invocation,{
    operation:OPERATION,
    target:fixture,
    summary:'Observed the instrument’s human-approved transfer on the fictional fixture.'
  });
  if(!recorded.accepted)return recorded;
  const closed=closeNavigatorInvocation(recorded.invocation,{
    outcome:'completed',
    summary:'Fixture transfer verified; no real creative material was used.'
  });
  if(!closed.accepted)return closed;
  return{
    accepted:true,
    reason:null,
    status:'completed',
    sourceRef:source.id,
    receivedRef:copy.id,
    fromDepartment:fixture.fromDepartment,
    toDepartment:fixture.toDepartment,
    instrumentDecisionRef:approval.type,
    humanDecision:null,
    invocation:closed.invocation
  };
}
