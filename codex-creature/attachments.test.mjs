import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const helperStart = html.indexOf('function attachmentBlob(file){');
const helperEnd = html.indexOf('\nfunction safeName', helperStart);
assert.notEqual(helperStart, -1, 'the page defines its attachment decoder');
assert.notEqual(helperEnd, -1, 'the attachment helpers have a stable end marker');

const helpers = vm.createContext({atob, Blob, Uint8Array});
vm.runInContext(html.slice(helperStart, helperEnd), helpers);

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
  }
];

test('MIDI and WAV attachments download byte-identically after JSON export/import', async () => {
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
  const imported = JSON.parse(exported).fragments;

  for (let i = 0; i < fixtures.length; i++) {
    const recovered = new Uint8Array(await helpers.attachmentBlob(imported[i].file).arrayBuffer());
    assert.deepEqual(recovered, fixtures[i].bytes, `${fixtures[i].name} bytes are unchanged`);
    assert.equal(imported[i].author, fragments[i].author);
    assert.equal(imported[i].origin, fragments[i].origin);
    assert.deepEqual(imported[i].events, fragments[i].events);
    assert.equal(helpers.attachmentDownloadName(imported[i].file), fixtures[i].name);
  }
});

test('each attachment card exposes a local original-file download action', () => {
  assert.match(html, /data-action="download-file"[^>]*>Descarregar fitxer original/);
  assert.match(html, /if\(action==="download-file"\)[\s\S]*?downloadAttachment\(f\.file\)/);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
});
