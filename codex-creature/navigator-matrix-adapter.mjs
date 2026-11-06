import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  MATRIX_EFFECT,
  MATRIX_ISOLATION,
  authorizeMandatedOperation,
  recordMandatedOperation
} from '../governanca/navigator-matrix.mjs';

const PROGRAM='CODEX_CREATURE';
const OPERATION='codex.patch.reversible';
const FRAGMENT_KEY='codex-creature-fragments-v1';
const loopbackHosts=new Set(['127.0.0.1','localhost','[::1]']);
const digest=value=>createHash('sha256').update(value===null?'[absent]':String(value)).digest('hex');

function assertCreaturePage(page){
  assert.ok(page,'A browser page is required');
  const url=new URL(page.url());
  assert.ok(loopbackHosts.has(url.hostname),'The MATRIX adapter only runs against a loopback test server');
  assert.ok(url.pathname.endsWith('/codex-creature/'),'The MATRIX adapter only uses the Còdex Creature page');
}

function fixtureOnly(fragment){
  return Boolean(
    fragment&&typeof fragment.id==='string'&&
    fragment.author==='Fixture MATRIX'&&
    Array.isArray(fragment.events)&&
    fragment.events.some(event=>event?.decision==='fixture-only')
  );
}

function validFixture(fixture,session){
  return Boolean(
    fixture&&fixture.id===session.fixtureRef&&fixture.kind==='fictional-fixture'&&
    fixture.isolation===MATRIX_ISOLATION&&fixture.synthetic===true&&
    fixture.containsUserData===false&&fixture.localOnly===true&&
    fixture.canonical===false&&fixture.reversible===true&&
    typeof fixture.fragmentId==='string'&&fixture.fragmentId.trim()
  );
}

function validPatch(patch){
  if(!patch||typeof patch!=='object'||Array.isArray(patch))return false;
  const fields=Object.keys(patch);
  return fields.length>0&&fields.every(field=>
    ['title','content'].includes(field)&&typeof patch[field]==='string'&&patch[field].trim()
  );
}

async function readRaw(page){
  return page.evaluate(key=>localStorage.getItem(key),FRAGMENT_KEY);
}

async function restoreRaw(page,raw){
  await page.evaluate(({key,value})=>{
    if(value===null)localStorage.removeItem(key);
    else localStorage.setItem(key,value);
  },{key:FRAGMENT_KEY,value:raw});
}

function parseFixtureStore(raw){
  let fragments;
  try{fragments=JSON.parse(raw||'[]')}catch{return{accepted:false,reason:'invalid-fragment-store',humanDecision:null}}
  if(!Array.isArray(fragments)||fragments.length===0)return{accepted:false,reason:'fixture-only-store-required',humanDecision:null};
  if(!fragments.every(fixtureOnly))return{accepted:false,reason:'fixture-only-store-required',humanDecision:null};
  return{accepted:true,fragments};
}

function authorize(session,rollback,at){
  return authorizeMandatedOperation(session,{
    operation:OPERATION,
    targetRef:PROGRAM,
    effectClass:MATRIX_EFFECT.CODEX_REVERSIBLE,
    rollback,
    at
  });
}

export async function applyCreatureFixturePatch({page,session,fixture,patch,at=new Date().toISOString()}={}){
  assertCreaturePage(page);
  if(!session||session.status!=='active')return{accepted:false,reason:'active-matrix-session-required',humanDecision:null};
  if(!validFixture(fixture,session))return{accepted:false,reason:'matrix-fixture-required',humanDecision:null};
  if(!validPatch(patch))return{accepted:false,reason:'allowlisted-fixture-patch-required',humanDecision:null};

  const rawBefore=await readRaw(page);
  const parsed=parseFixtureStore(rawBefore);
  if(!parsed.accepted)return parsed;
  const matches=parsed.fragments.filter(fragment=>fragment.id===fixture.fragmentId);
  if(matches.length!==1)return{accepted:false,reason:'unique-fixture-fragment-required',humanDecision:null};
  const source=matches[0];
  if(Object.entries(patch).every(([field,value])=>source[field]===value))return{accepted:false,reason:'perceptible-difference-required',humanDecision:null};

  const beforeDigest=digest(rawBefore);
  const authorization=authorize(session,{
    verified:true,
    strategy:'restore-exact-localstorage-value',
    digest:beforeDigest
  },at);
  if(!authorization.accepted)return authorization;

  const fragments=parsed.fragments.map(fragment=>fragment.id===fixture.fragmentId?{
    ...fragment,
    ...patch,
    updatedAt:at,
    events:[...fragment.events,{
      type:'navigator-matrix-patch',
      actorKind:'artificial',
      decision:'fixture-only',
      protocol:'NAVIGATOR-MATRIX-0.4',
      authorizationId:authorization.id,
      at
    }]
  }:fragment);
  const rawAfter=JSON.stringify(fragments);
  const afterDigest=digest(rawAfter);

  try{
    await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:FRAGMENT_KEY,value:rawAfter});
    const observed=await readRaw(page);
    if(observed!==rawAfter)throw new Error('written-value-mismatch');
  }catch{
    await restoreRaw(page,rawBefore);
    const restoredDigest=digest(await readRaw(page));
    const failed=recordMandatedOperation(session,{
      authorization,outcome:'failed',beforeDigest,afterDigest:restoredDigest,
      rollbackDigest:restoredDigest,summary:'L’adaptador no ha superat la verificació i ha restaurat la còpia exacta.',at
    });
    return{accepted:false,reason:'adapter-verification-failed',humanDecision:null,session:failed.session||session};
  }

  const recorded=recordMandatedOperation(session,{
    authorization,outcome:'applied',beforeDigest,afterDigest,
    summary:`Fragment sintètic ${fixture.fragmentId} modificat dins Còdex Creature.`,at
  });
  if(!recorded.accepted){
    await restoreRaw(page,rawBefore);
    return{...recorded,rollbackPerformed:true};
  }

  return{
    accepted:true,
    reason:null,
    outcome:'applied',
    humanDecision:null,
    fragmentRef:fixture.fragmentId,
    changedFields:Object.keys(patch),
    beforeDigest,
    afterDigest,
    authorizationId:authorization.id,
    session:recorded.session,
    rollbackReceipt:{
      protocol:'NAVIGATOR-MATRIX-CREATURE-ADAPTER-0.1',
      sessionId:recorded.session.id,
      sessionRevision:recorded.session.revision,
      fixtureId:fixture.id,
      fragmentId:fixture.fragmentId,
      storeKey:FRAGMENT_KEY,
      beforeDigest,
      afterDigest,
      snapshot:rawBefore
    }
  };
}

export async function rollbackCreatureFixturePatch({page,session,fixture,receipt,at=new Date().toISOString()}={}){
  assertCreaturePage(page);
  if(!session||session.status!=='active')return{accepted:false,reason:'active-matrix-session-required',humanDecision:null};
  if(!validFixture(fixture,session))return{accepted:false,reason:'matrix-fixture-required',humanDecision:null};
  if(!receipt||receipt.protocol!=='NAVIGATOR-MATRIX-CREATURE-ADAPTER-0.1'||receipt.sessionId!==session.id||receipt.sessionRevision!==session.revision||receipt.fixtureId!==fixture.id||receipt.fragmentId!==fixture.fragmentId||receipt.storeKey!==FRAGMENT_KEY){
    return{accepted:false,reason:'exact-rollback-receipt-required',humanDecision:null};
  }
  const rawCurrent=await readRaw(page);
  const currentDigest=digest(rawCurrent);
  if(currentDigest!==receipt.afterDigest)return{accepted:false,reason:'stale-adapter-state',humanDecision:null};

  const authorization=authorize(session,{
    verified:true,
    strategy:'restore-exact-localstorage-value',
    digest:receipt.beforeDigest
  },at);
  if(!authorization.accepted)return authorization;

  await restoreRaw(page,receipt.snapshot);
  const restoredDigest=digest(await readRaw(page));
  if(restoredDigest!==receipt.beforeDigest){
    return{accepted:false,reason:'rollback-verification-failed',humanDecision:null,session};
  }
  const recorded=recordMandatedOperation(session,{
    authorization,outcome:'rolled-back',beforeDigest:currentDigest,afterDigest:restoredDigest,
    rollbackDigest:restoredDigest,summary:`Retrodansa exacta del fragment sintètic ${fixture.fragmentId}.`,at
  });
  if(!recorded.accepted)return recorded;
  return{
    accepted:true,
    reason:null,
    outcome:'rolled-back',
    humanDecision:null,
    fragmentRef:fixture.fragmentId,
    restoredDigest,
    authorizationId:authorization.id,
    session:recorded.session
  };
}
