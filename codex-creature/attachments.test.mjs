import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const helperStart = html.indexOf('function attachmentBlob(file){');
const helperEnd = html.indexOf('\nfunction safeName', helperStart);
const importerStart = html.indexOf('function importFragments(data){');
const importerEnd = html.indexOf('\nfunction readFile', importerStart);
const arrangementOptionsStart = html.indexOf('function arrangementSourceOptions(){');
const arrangementOptionsEnd = html.indexOf('\nfunction renderArrangements', arrangementOptionsStart);
assert.notEqual(helperStart, -1, 'the page defines its attachment decoder');
assert.notEqual(helperEnd, -1, 'the attachment helpers have a stable end marker');
assert.notEqual(importerStart, -1, 'the page defines its fragment importer');
assert.notEqual(importerEnd, -1, 'the fragment importer has a stable end marker');
assert.notEqual(arrangementOptionsStart, -1, 'the arrangement source selector exists');
assert.notEqual(arrangementOptionsEnd, -1, 'the arrangement source selector has a stable end marker');

const helpers = vm.createContext({atob, Blob, Uint8Array, fragments: [], makeId: () => 'fixture:duplicate'});
vm.runInContext(html.slice(helperStart, helperEnd), helpers);
vm.runInContext(html.slice(importerStart, importerEnd), helpers);

const fixtures = [
  {
    name: 'fixture.mid',
    type: 'audio/midi',
    bytes: Uint8Array.from([0x4d,0x54,0x68,0x64,0,0,0,6,0,0,0,1,0,96,0x4d,0x54,0x72,0x6b,0,0,0,4,0,0xff,0x2f,0])
  },
  {
    name: 'fixture.wav',
    type: 'audio/wav',
    bytes: Uint8Array.from([0x52,0x49,0x46,0x46,0x24,0,0,0,0x57,0x41,0x56,0x45,0x66,0x6d,0x74,0x20,0x10,0,0,0,1,0,1,0,0x44,0xac,0,0,0x88,0x58,1,0,2,0,0x10,0,0x64,0x61,0x74,0x61,0,0,0,0])
  },
  {
    name: 'fixture.aiff',
    type: 'audio/aiff',
    bytes: Uint8Array.from([0x46,0x4f,0x52,0x4d,0,0,0,0x2f,0x41,0x49,0x46,0x46,0x43,0x4f,0x4d,0x4d,0,0,0,0x12,0,1,0,0,0,1,0,8,0x40,0x0e,0xac,0x44,0,0,0,0,0,0,0x53,0x53,0x4e,0x44,0,0,0,9,0,0,0,0,0,0,0,0,0x80])
  },
  {
    name: 'fixture.nam',
    type: 'application/json',
    bytes: Uint8Array.from(Buffer.from('{"syntheticFixture":"Neural Amp Modeler"}', 'utf8'))
  },
  {
    name: 'fixture.xml',
    type: 'application/xml',
    bytes: Uint8Array.from(Buffer.from('<preset synthetic="true" />', 'utf8'))
  }
];

test('MIDI, WAV, AIFF, NAM, and XML attachments survive the JSON import path byte-identically', async () => {
  const fragments = fixtures.map((fixture, index) => ({
    id: `fixture:${index}`,
    title: `Synthetic ${fixture.name}`,
    author: 'Fixture author',
    origin: 'harmonia',
    destination: 'melodia',
    decision: 'draft',
    events: [{type: 'created', decision: 'human-supplied'}],
    file: {
      name: fixture.name,
      type: fixture.type,
      size: fixture.bytes.length,
      data: Buffer.from(fixture.bytes).toString('base64')
    }
  }));

  const exported = JSON.stringify({format: 'codex-creature-fragments', version: 1, fragments});
  const importCount = helpers.importFragments(JSON.parse(exported));
  const imported = JSON.parse(JSON.stringify(helpers.fragments));
  assert.equal(importCount, fixtures.length, 'the page importer accepts both synthetic fragments');

  for (let i = 0; i < fixtures.length; i++) {
    const recovered = new Uint8Array(await helpers.attachmentBlob(imported[i].file).arrayBuffer());
    assert.deepEqual(recovered, fixtures[i].bytes, `${fixtures[i].name} bytes are unchanged`);
    assert.equal(imported[i].author, fragments[i].author);
    assert.equal(imported[i].origin, fragments[i].origin);
    assert.deepEqual(imported[i].events, fragments[i].events);
    assert.equal(helpers.attachmentDownloadName(imported[i].file), fixtures[i].name);
  }
});

test('original download names preserve Unicode and remove path and control characters', () => {
  assert.equal(helpers.attachmentDownloadName({name: 'Música d’assaig.aiff'}), 'Música d’assaig.aiff');
  assert.equal(helpers.attachmentDownloadName({name: 'C:\\fakepath\\Música.aiff'}), 'Música.aiff');
  assert.equal(helpers.attachmentDownloadName({name: '/tmp/../../prova.wav'}), 'prova.wav');
  assert.equal(helpers.attachmentDownloadName({name: '\u0000mix\n.wav'}), 'mix.wav');
  assert.equal(helpers.attachmentDownloadName({name: ''}), 'fitxer');
});

test('downloadAttachment builds the original MIME Blob and filename', async () => {
  const fixture = fixtures.find(item => item.type === 'audio/aiff');
  const anchors = [];
  const objectUrls = [];
  const revokedUrls = [];
  helpers.document = {
    createElement(tag) {
      assert.equal(tag, 'a');
      const anchor = {clickCount: 0, click() {this.clickCount++}};
      anchors.push(anchor);
      return anchor;
    }
  };
  helpers.URL = {
    createObjectURL(blob) {objectUrls.push(blob); return 'blob:synthetic-aiff'},
    revokeObjectURL(url) {revokedUrls.push(url)}
  };
  helpers.setTimeout = callback => {callback(); return 1};

  helpers.downloadAttachment({
    name: 'Música d’assaig.aiff',
    type: fixture.type,
    data: Buffer.from(fixture.bytes).toString('base64')
  });

  assert.equal(anchors.length, 1);
  assert.equal(anchors[0].href, 'blob:synthetic-aiff');
  assert.equal(anchors[0].download, 'Música d’assaig.aiff');
  assert.equal(anchors[0].clickCount, 1);
  assert.equal(objectUrls[0].type, 'audio/aiff');
  assert.deepEqual(new Uint8Array(await objectUrls[0].arrayBuffer()), fixture.bytes);
  assert.deepEqual(revokedUrls, ['blob:synthetic-aiff']);
});

test('each attachment card exposes a local original-file download action', () => {
  assert.match(html, /data-action="download-file"[^>]*>Descarregar fitxer original/);
  assert.match(html, /if\(action==="download-file"\)[\s\S]*?downloadAttachment\(f\.file\)/);
  assert.match(html, /accept="[^"]*\.nam/i);
  assert.match(html, /accept="[^"]*\.xml/i);
  assert.match(html, /\.nam` i `\.xml` es conserven com a originals; Creature no els interpreta/);
  const scriptSources=[...html.matchAll(/<script[^>]+src="([^"]+)"/gi)].map(match=>match[1]);
  assert.deepEqual(scriptSources,['./navigator-matrix-iphone.mjs'],'Creature only loads the reviewed local MATRIX module');
});



test('repeated IDs within one JSON import are assigned distinct IDs without losing fragment data', () => {
  helpers.fragments.length = 0;
  const generated = ['fixture:copy-1'];
  helpers.makeId = () => generated.shift();
  const original = {
    id: 'TEST-01', title: 'Original fragment', author: 'Synthetic author', origin: 'harmonia',
    source: {reference: 'synthetic-source'}, content: 'Synthetic content',
    file: {name: 'synthetic.wav', type: 'audio/wav', data: 'AQID'},
    decision: 'human-kept', events: [{type: 'decision', decision: 'human-kept'}]
  };
  const duplicate = {...original, title: 'Second synthetic fragment', author: 'Second author', content: 'Second content'};

  assert.equal(helpers.importFragments({fragments: [original, duplicate]}), 2);
  const imported = JSON.parse(JSON.stringify(helpers.fragments));
  assert.deepEqual(imported.map(item => item.id), ['TEST-01', 'fixture:copy-1']);
  assert.equal(imported[1].parentId, 'TEST-01');
  assert.equal(imported[1].title, duplicate.title);
  assert.equal(imported[1].author, duplicate.author);
  assert.equal(imported[1].source.reference, 'synthetic-source');
  assert.equal(imported[1].content, duplicate.content);
  assert.deepEqual(imported[1].file, duplicate.file);
  assert.equal(imported[1].decision, 'human-kept');
  assert.deepEqual(imported[1].events.slice(0, 1), duplicate.events);
  assert.equal(imported[1].events.at(-1).type, 'imported-copy');
  assert.equal(new Set(imported.map(item => item.id)).size, imported.length);
});

test('an imported ID colliding with a local fragment is regenerated and local data stays intact', () => {
  helpers.fragments.length = 0;
  helpers.fragments.push({id: 'TEST-01', origin: 'harmonia', title: 'Local fragment', content: 'Local content'});
  helpers.makeId = () => 'fixture:local-copy';
  assert.equal(helpers.importFragments([{id: 'TEST-01', origin: 'melodia', title: 'Imported fragment'}]), 1);
  const imported = JSON.parse(JSON.stringify(helpers.fragments));
  assert.equal(imported[0].title, 'Local fragment');
  assert.equal(imported[0].content, 'Local content');
  assert.equal(imported[1].id, 'fixture:local-copy');
  assert.equal(imported[1].parentId, 'TEST-01');
  assert.equal(new Set(imported.map(item => item.id)).size, imported.length);
});

test('successive imports of the same ID remain unique across import calls', () => {
  helpers.fragments.length = 0;
  helpers.makeId = () => 'fixture:successive-copy';
  const fragment = {id: 'TEST-01', origin: 'harmonia', title: 'Repeated import'};
  assert.equal(helpers.importFragments([fragment]), 1);
  assert.equal(helpers.importFragments([fragment]), 1);
  const imported = JSON.parse(JSON.stringify(helpers.fragments));
  assert.deepEqual(imported.map(item => item.id), ['TEST-01', 'fixture:successive-copy']);
  assert.equal(imported[1].parentId, 'TEST-01');
  assert.equal(new Set(imported.map(item => item.id)).size, imported.length);
});

test('arrangement source references resolve to the exact unique fragment ID', () => {
  helpers.fragments.length = 0;
  helpers.makeId = () => 'fixture:arranged-copy';
  const first = {id: 'TEST-01', origin: 'harmonia', title: 'First fragment'};
  const duplicate = {id: 'TEST-01', origin: 'melodia', title: 'Second fragment'};
  helpers.importFragments([first, duplicate]);
  const imported = JSON.parse(JSON.stringify(helpers.fragments));
  const select = {value: 'TEST-01', innerHTML: ''};
  helpers.DEPTS = [{id: 'harmonia', name: 'Harmonia'}, {id: 'melodia', name: 'Melodia'}];
  helpers.esc = value => String(value ?? '');
  helpers.$ = selector => selector === '#arrangementSourceFragment' ? select : null;
  vm.runInContext(html.slice(arrangementOptionsStart, arrangementOptionsEnd), helpers);
  vm.runInContext('arrangementSourceOptions()', helpers);
  assert.match(select.innerHTML, /value="TEST-01">First fragment/);
  assert.match(select.innerHTML, /value="fixture:arranged-copy">Second fragment/);
  assert.equal(select.value, 'TEST-01');
  const arrangement = {sourceFragment: {id: select.value}};
  assert.equal(imported.find(item => item.id === arrangement.sourceFragment.id).title, 'First fragment');
  select.value = 'fixture:arranged-copy';
  vm.runInContext('arrangementSourceOptions()', helpers);
  assert.equal(select.value, 'fixture:arranged-copy');
  assert.equal(imported.find(item => item.id === select.value).title, 'Second fragment');
  assert.equal(new Set(imported.map(item => item.id)).size, imported.length);
});
