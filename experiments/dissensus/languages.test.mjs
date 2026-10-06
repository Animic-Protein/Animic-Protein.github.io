import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {messages} from './dissensus-i18n.mjs';

test('all four languages cover visible, accessible and dynamic messages without Catalan fallback',()=>{
  assert.deepEqual(Object.keys(messages),['ca','ur','tl','hi']);
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const script=readFileSync(new URL('./dissensus.mjs',import.meta.url),'utf8');
  const keys=[...html.matchAll(/data-i18n(?:-aria|-placeholder)?="([^"]+)"/g),...script.matchAll(/\bt\('([^']+)'\)/g)].map(match=>match[1]);
  for(const [lang,data] of Object.entries(messages)){
    assert.deepEqual(Object.keys(data).sort(),Object.keys(messages.ca).sort());
    for(const key of keys)assert.ok(typeof data[key]==='string'&&data[key].trim(),`${lang}: missing ${key}`);
  }
});
