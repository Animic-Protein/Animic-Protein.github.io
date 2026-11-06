import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MATRIX_ISOLATION,
  createMatrixMandate,
  createMatrixSession
} from '../governanca/navigator-matrix.mjs';
import {
  applyCreatureFixturePatch,
  rollbackCreatureFixturePatch
} from './navigator-matrix-adapter.mjs';

class MemoryStorage{
  #values=new Map();
  getItem(key){return this.#values.has(key)?this.#values.get(key):null}
  setItem(key,value){this.#values.set(key,String(value))}
  removeItem(key){this.#values.delete(key)}
}

class MemoryPage{
  constructor(storage){this.storage=storage}
  url(){return'http://127.0.0.1:8080/codex-creature/'}
  async evaluate(fn,arg){
    const previous=globalThis.localStorage;
    globalThis.localStorage=this.storage;
    try{return fn(arg)}finally{
      if(previous===undefined)delete globalThis.localStorage;
      else globalThis.localStorage=previous;
    }
  }
}

const fragmentKey='codex-creature-fragments-v1';
const fragment={
  id:'fixture:memory-source',title:'A',content:'Cobalt A',author:'Fixture MATRIX',
  origin:'misce',decision:'draft',events:[{type:'created',decision:'fixture-only'}]
};
const fixture={
  id:'fixture:memory-pass',kind:'fictional-fixture',isolation:MATRIX_ISOLATION,
  synthetic:true,containsUserData:false,localOnly:true,canonical:false,reversible:true,
  fragmentId:fragment.id
};

function open(){
  const mandate=createMatrixMandate({
    actorKind:'human',mission:'Prova unitària reversible',programs:['CODEX_CREATURE'],
    reversibleOperations:['codex.patch.reversible'],budget:{maxCycles:2,maxRevisions:2,maxEvents:6}
  });
  assert.equal(mandate.accepted,true);
  const opened=createMatrixSession({
    invokerKind:'artificial',mandate:mandate.mandate,fixture,
    programs:[{id:'CODEX_CREATURE',source:'memory-fixture',virtual:true,canonical:false}]
  });
  assert.equal(opened.accepted,true);
  return opened.session;
}

test('the Creature MATRIX adapter applies and exactly rolls back a fixture-only store',async()=>{
  const storage=new MemoryStorage();
  const page=new MemoryPage(storage);
  const initial=JSON.stringify([fragment]);
  storage.setItem(fragmentKey,initial);
  const applied=await applyCreatureFixturePatch({page,session:open(),fixture,patch:{content:'Cobalt B'},at:'2026-11-06T09:00:00.000Z'});
  assert.equal(applied.accepted,true);
  assert.equal(JSON.parse(storage.getItem(fragmentKey))[0].content,'Cobalt B');
  const rolledBack=await rollbackCreatureFixturePatch({page,session:applied.session,fixture,receipt:applied.rollbackReceipt,at:'2026-11-06T09:01:00.000Z'});
  assert.equal(rolledBack.accepted,true);
  assert.equal(storage.getItem(fragmentKey),initial);
  assert.deepEqual(rolledBack.session.events.slice(-2).map(event=>event.outcome),['applied','rolled-back']);
});

test('the Creature MATRIX adapter refuses a store mixed with non-fixture material',async()=>{
  const storage=new MemoryStorage();
  const page=new MemoryPage(storage);
  storage.setItem(fragmentKey,JSON.stringify([fragment,{...fragment,id:'real:01',author:'Human',events:[{type:'created',decision:'draft'}]}]));
  const denied=await applyCreatureFixturePatch({page,session:open(),fixture,patch:{content:'No'},at:'2026-11-06T09:00:00.000Z'});
  assert.equal(denied.reason,'fixture-only-store-required');
  assert.equal(denied.humanDecision,null);
});
