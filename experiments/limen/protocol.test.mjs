import assert from 'node:assert/strict';
import {advance,createSession,createTrace,reobserve,respond} from './protocol.mjs';

for(const module of ['integrated','ATTENTIO','RETENTIO','DISCRIMEN','QUIES','METACOGNITIO']){
  const started=createSession({module,conditionId:'absence',focus:'relation'});
  assert.equal(started.module,module);
  assert.equal(started.phase,'baseline');
}
let session=createSession({module:'METACOGNITIO',conditionId:'position',focus:'position'});
for(const phase of ['interval','change','return','reflect'])session=advance(session);
assert.equal(session.phase,'reflect');
assert.throws(()=>createTrace(session),/resposta humana/);
session=respond(session,{response:'uncertain',observation:'No ho sé encara.',interpretation:'Potser és el context.'});
assert.equal(session.phase,'reveal');
const trace=createTrace(session,'2026-10-01T00:00:00.000Z','Dos elements intercanvien la posició.');
assert.equal(trace.practice.module,'METACOGNITIO');
assert.equal(trace.reflection.reportedPerception,'uncertain');
assert.equal(trace.effect.transformed,false);
assert.equal(trace.provenance.reversible,true);
assert.equal(trace.provenance.canonical,false);
assert.equal(trace.provenance.persistence,'user-initiated-download');
const again=reobserve(session);
assert.equal(again.phase,'baseline');
assert.equal(again.reobservations,1);
assert.equal(advance({...session,phase:'reveal'}).phase,'reveal');
assert.throws(()=>createSession({module:'unknown'}),/Mòdul LIMEN/);
console.log('LIMEN protocol: OK');
