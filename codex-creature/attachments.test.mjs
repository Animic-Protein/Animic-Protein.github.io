import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const helperStart = html.indexOf('function attachmentBlob(file){');
const helperEnd = html.indexOf('\nfunction safeName', helperStart);
const importerStart = html.indexOf('function importFragments(data){');
const importerEnd = html.indexOf('\nfunction readFile', importerStart);
assert.notEqual(helperStart, -1, 'the page defines its attachment decoder');
assert.notEqual(helperEnd, -1, 'the attachment helpers have a stable end marker');
assert.notEqual(importerStart, -1, 'the page defines its fragment importer');
assert.notEqual(importerEnd, -1, 'the fragment importer has a stable end marker');

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
  assert.doesNotMatch(html, /<script[^>]+src=/i);
});
