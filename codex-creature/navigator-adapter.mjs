import assert from 'node:assert/strict';
import {closeNavigatorInvocation,recordNavigatorOperation} from '../governanca/navigator-contract.mjs';

const route=[
  ['HARMONIA','harmonia'],
  ['MELODIA','melodia'],
  ['RITME','ritme'],
  ['LYRICS','lyrics'],
  ['AUDIO-VIDEO','audiovideo'],
  ['MISCE','misce']
];

export async function traverseCreaturePage({page,invocation,fixture}={}){
  assert.ok(page,'A browser page is required');
  assert.ok(invocation?.status==='active','An active NAVIGATOR invocation is required');
  assert.equal(new URL(page.url()).pathname.endsWith('/codex-creature/'),true,'The adapter only traverses the Còdex Creature page');

  const initialStorage=await page.evaluate(()=>({
    fragments:localStorage.getItem('codex-creature-fragments-v1'),
    arrangements:localStorage.getItem('codex-creature-arrangements-v1')
  }));
  assert.equal(await page.locator('.dept-card').count(),6,'All six Creature departments must be present');
  assert.equal(await page.locator('.workspace').count(),7,'Six departments and the transversal Arrangements workspace must be present');

  let current=invocation;
  for(const [name,id] of route){
    const operation=`creature.${name.toLowerCase()}.fixture`;
    const link=page.locator(`.dept-nav a[href="#${id}"]`);
    await link.click();
    assert.equal(new URL(page.url()).hash,`#${id}`,`Navigation reaches ${name}`);
    assert.equal(await page.locator(`#${id} h2`).count(),1,`${name} workspace is rendered`);
    const result=recordNavigatorOperation(current,{operation,target:fixture,summary:`Observed ${name} route; no department data written.`});
    assert.equal(result.accepted,true,`${name} is within the invocation scope`);
    current=result.invocation;
  }

  await page.locator('.cross-link a[href="#arranjaments"]').click();
  assert.equal(new URL(page.url()).hash,'#arranjaments','Navigation reaches the transversal Arrangements workspace');
  assert.equal(await page.locator('#arrangementForm').count(),1,'The arrangement form is present');
  if(fixture.arrangementId){
    const arrangement=await page.evaluate(id=>JSON.parse(localStorage.getItem('codex-creature-arrangements-v1')||'[]').find(item=>item.id===id),fixture.arrangementId);
    assert.ok(arrangement,'The declared synthetic arrangement remains present');
    assert.equal(arrangement.sourceFragment?.id,fixture.sourceFragmentId,'The arrangement keeps its source reference');
    assert.equal(Object.hasOwn(arrangement.sourceFragment||{},'content'),false,'The arrangement does not copy source content');
    assert.equal(await page.locator('#arrangementsList .arrangement-card').count(),1,'The arrangement fixture renders in the transversal workspace');
  }
  const arrangementResult=recordNavigatorOperation(current,{
    operation:'arrangement.fixture',target:fixture,
    summary:'Observed the transversal arrangement and its source-reference control; no arrangement created.'
  });
  assert.equal(arrangementResult.accepted,true,'Arrangements is within the invocation scope');
  current=arrangementResult.invocation;

  const sourceId=fixture.sourceFragmentId;
  const source=sourceId?await page.evaluate(id=>JSON.parse(localStorage.getItem('codex-creature-fragments-v1')||'[]').find(item=>item.id===id),sourceId):null;
  if(sourceId){
    assert.ok(source,'The declared synthetic source fragment remains present');
    assert.equal(source.decision,'draft','NAVIGATOR does not approve a human-gated transfer');
    assert.equal(await page.locator(`#list-harmonia [data-action="approve"][data-id="${sourceId}"]`).count(),1,'The human approval control remains available');
    assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('codex-creature-fragments-v1')||'[]').some(item=>item.parentId===id),sourceId),false,'NAVIGATOR does not create a received copy');
  }

  const finalStorage=await page.evaluate(()=>({
    fragments:localStorage.getItem('codex-creature-fragments-v1'),
    arrangements:localStorage.getItem('codex-creature-arrangements-v1')
  }));
  assert.deepEqual(finalStorage,initialStorage,'The adapter is read-only against both Creature stores');

  const closed=closeNavigatorInvocation(current,{outcome:'completed',summary:'Creature page observed; no transfer decision or store mutation performed.'});
  assert.equal(closed.accepted,true);
  assert.equal(closed.invocation.humanDecision,null);
  return closed.invocation;
}
