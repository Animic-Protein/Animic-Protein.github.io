import { createHash } from 'node:crypto';
import { appendFile } from 'node:fs/promises';

const REPOSITORY = 'Animic-Protein/Animic-Protein.github.io';
const ZONE = 'github:' + REPOSITORY;
const fail = message => {
  console.error('NAVIGATOR read adapter refused: ' + message);
  process.exit(1);
};
const canonical = value => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
};
const digest = value => createHash('sha256')
  .update(JSON.stringify(canonical(value)), 'utf8')
  .digest('hex');
const safeResource = value => {
  if (typeof value !== 'string' || value.trim() !== value || !value) return false;
  if (value.startsWith('/') || value.includes('\\') || value.includes('://') || /[?#\u0000-\u001f\u007f]/.test(value)) return false;
  const segments = value.split('/');
  return segments.every(segment =>
    segment &&
    segment !== '.' &&
    segment !== '..' &&
    !/%(?:2e|2f|5c)/i.test(segment)
  );
};

const repo = process.env.GITHUB_REPOSITORY;
const ref = process.env.GITHUB_REF;
const token = process.env.GITHUB_TOKEN;
const actor = process.env.GITHUB_ACTOR;
const requestId = process.env.NAVIGATOR_REQUEST_ID;
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (repo !== REPOSITORY) fail('repository mismatch');
if (ref !== 'refs/heads/main') fail('run the adapter from main only');
if (!token || !actor || !requestId || !summaryPath) fail('required authenticated workflow context is missing');

let trace;
try {
  trace = JSON.parse(process.env.NAVIGATOR_REQUEST_JSON || '');
} catch {
  fail('request JSON is invalid');
}
const mandate = trace?.mandate;
if (trace?.format !== 'navigator-zone-request/v1') fail('unsupported trace format');
if (!mandate || mandate.status !== 'active') fail('mandate is not active in the submitted trace');
if (mandate.zone !== ZONE || mandate.repository !== REPOSITORY) fail('mandate is outside the exact repository zone');
if (mandate.issuedBy !== 'human' || mandate.actorKind !== 'artificial') fail('human-issued mandate required');
if (!Array.isArray(mandate.capabilities) || !mandate.capabilities.includes('repository.read')) fail('repository.read capability is missing');
if (!mandate.usage || !Number.isInteger(mandate.usage.requests) || !Number.isInteger(mandate.usage.maxRequests) ||
    mandate.usage.requests < 1 || mandate.usage.requests > mandate.usage.maxRequests || mandate.usage.maxRequests > 20) fail('mandate request budget is invalid');
if (!mandate.expiresAt || !Number.isFinite(Date.parse(mandate.expiresAt)) || Date.parse(mandate.expiresAt) <= Date.now()) fail('mandate has expired');

const matches = Array.isArray(trace.requests) ? trace.requests.filter(request => request.id === requestId) : [];
if (matches.length !== 1) fail('request ID must identify exactly one request in the trace');
const request = matches[0];
if (!Number.isInteger(mandate.revision) || !Number.isInteger(request.mandateRevision) || request.mandateRevision < 0 || request.mandateRevision >= mandate.revision) fail('mandate revision does not cover this request');
if (request.mandateId !== mandate.id || request.zone !== ZONE || request.repository !== REPOSITORY) fail('request and mandate do not match');
if (request.operation !== 'repository.read' || request.status !== 'authorized-awaiting-adapter' || request.execution !== 'not-executed') {
  fail('request is not an unexecuted authorized repository.read operation');
}
if (request.humanDecision !== null) fail('repository.read request has unexpected human decision metadata');
if (!safeResource(request.resource)) fail('resource path is not a safe exact repository path');
if (request.expiresAt !== mandate.expiresAt || Date.parse(request.expiresAt) <= Date.now()) fail('request has expired or does not match mandate expiry');
if (!request.details || typeof request.details !== 'object' || Array.isArray(request.details)) fail('request details are invalid');

const expectedDigest = digest({
  mandateId: mandate.id,
  zone: mandate.zone,
  operation: request.operation,
  repository: request.repository,
  resource: request.resource.trim(),
  details: request.details
});
if (request.actionDigest !== expectedDigest) fail('action digest does not match the exact request');
const recorded = Array.isArray(mandate.events) && mandate.events.some(event =>
  event.type === 'zone-operation-requested' &&
  event.requestId === request.id &&
  event.operation === request.operation &&
  event.resource === request.resource &&
  event.actionDigest === request.actionDigest
);
if (!recorded) fail('request is not present in the mandate event ledger');

const encodedPath = request.resource.split('/').map(encodeURIComponent).join('/');
const apiUrl = 'https://api.github.com/repos/' + REPOSITORY + '/contents/' + encodedPath + '?ref=main';
let response;
try {
  response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'NAVIGATOR-0.8-read-adapter'
    }
  });
} catch {
  fail('GitHub API request failed before a response was received');
}
if (!response.ok) fail('GitHub API returned HTTP ' + response.status);
const file = await response.json();
if (file.type !== 'file' || typeof file.content !== 'string' || file.encoding !== 'base64') {
  fail('GitHub did not return a UTF-8 file blob');
}
const bytes = Buffer.from(file.content.replace(/\s/g, ''), 'base64');
if (bytes.length > 65536) fail('file exceeds the 64 KiB adapter response limit');
const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
const result = {
  format: 'navigator-zone-read-result/v1',
  status: 'executed',
  execution: 'executed',
  adapter: 'github-actions-readonly-v1',
  mandateId: mandate.id,
  requestId: request.id,
  actionDigest: request.actionDigest,
  operation: 'repository.read',
  repository: REPOSITORY,
  resource: request.resource,
  ref: 'main',
  commit: file.commit?.sha || process.env.GITHUB_SHA,
  blobSha: file.sha,
  authenticatedActor: actor,
  workflowRunId: process.env.GITHUB_RUN_ID || null,
  executedAt: new Date().toISOString(),
  contentBytes: bytes.length,
  content
};
const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapedContent = escapeHtml(content);
const resultRecord = { ...result };
delete resultRecord.content;
const markdown = [
  '## NAVIGATOR 0.8 · lectura GitHub executada',
  '',
  '- Estat: <code>executed</code>',
  '- Operació: <code>repository.read</code>',
  '- Zona: <code>' + ZONE + '</code>',
  '- Recurs: <code>' + escapeHtml(request.resource) + '</code>',
  '- Referència: <code>main</code> · commit <code>' + escapeHtml(result.commit) + '</code>',
  '- Blob: <code>' + escapeHtml(result.blobSha) + '</code> · ' + result.contentBytes + ' bytes',
  '- Mandat: <code>' + escapeHtml(mandate.id) + '</code> · petició <code>' + escapeHtml(request.id) + '</code>',
  '- Empremta validada: <code>' + escapeHtml(request.actionDigest) + '</code>',
  '- Executat per GitHub: <code>' + escapeHtml(actor) + '</code> · run <code>' + escapeHtml(result.workflowRunId) + '</code>',
  '- Moment: <code>' + escapeHtml(result.executedAt) + '</code>',
  '',
  'La sortida JSON del resultat és a continuació; la resta del rastre local no s’ha modificat.',
  '',
  '<details><summary>Contingut llegit</summary><pre>' + escapedContent + '</pre></details>',
  '',
  '<details><summary>Registre JSON d’execució</summary><pre>' +
    escapeHtml(JSON.stringify(resultRecord, null, 2)) +
    '</pre></details>',
  ''
].join('\n');
await appendFile(summaryPath, markdown, 'utf8');
console.log(JSON.stringify({ ...resultRecord, content: '[shown in workflow summary]' }, null, 2));
