import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizeTransformation,createSession,recordDecision} from './protocol.mjs';

test('a new session contains no invented human decision',()=>{
  const state=createSession();
  assert.equal(state.decision,null);
  assert.equal(state.authorizedDecision,null);
  assert.equal(state.mutation,null);
});

test('rejection remains in provenance when the person chooses another route',()=>{
  let state=recordDecision(createSession(),'reject');
  state=recordDecision(state,'other','Reobservar amb una font externa');
  assert.match(state.rejected,/rebutjada explícitament/);
  assert.match(state.authorizedDecision,/Reobservar amb una font externa/);
  assert.deepEqual(state.events.map(event=>event.choice),['reject','other']);
});

test('accepting an impulse never authorizes MUTATIO',()=>{
  const state=recordDecision(createSession(),'accept');
  assert.equal(state.mutation,null);
  assert.match(state.authorizedDecision,/cap transformació autoritzada/);
  assert.equal(authorizeTransformation(state,'Canvi concret'),state);
});

test('MUTATIO needs a transform choice and an exact non-empty action',()=>{
  let state=recordDecision(createSession(),'transform');
  assert.equal(authorizeTransformation(state,'   '),state);
  state=authorizeTransformation(state,'Canviar la frase per una pregunta oberta');
  assert.equal(state.mutation,'Canviar la frase per una pregunta oberta');
  assert.match(state.authorizedDecision,/Canviar la frase per una pregunta oberta/);
});

test('stopping closes the route and cannot authorize a later mutation',()=>{
  let state=recordDecision(createSession(),'stop');
  state=recordDecision(state,'transform');
  state=authorizeTransformation(state,'Canvi');
  assert.equal(state.decision,'stop');
  assert.equal(state.mutation,null);
  assert.equal(state.ended,true);
});
