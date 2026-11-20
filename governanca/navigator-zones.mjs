export const NAVIGATOR_GITHUB_ZONE='github:Animic-Protein/Animic-Protein.github.io';
export const NAVIGATOR_GITHUB_CAPABILITIES=Object.freeze([
  'repository.read',
  'patch.prepare',
  'pull-request.draft.create'
]);

const denied=reason=>({accepted:false,reason,execution:'not-executed'});
const canonical=value=>{
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
  return value;
};
const digest=async value=>{
  const bytes=new TextEncoder().encode(JSON.stringify(canonical(value)));
  const hash=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
};
const canonicalRepository=value=>typeof value==='string'&&/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value);
const canonicalResource=value=>typeof value==='string'&&value.trim().length>0&&!value.startsWith('/')&&!value.includes('\\')&&!value.includes('://')&&!value.split('/').some(part=>part==='.'||part==='..');
const latestMandateRevision=new Map();
const latestRequestStatus=new Map();
const revokedMandates=new Set();
const requestsByMandate=new Map();
let sequence=0;

export async function createNavigatorZoneMandate({actorKind,repository,capabilities=[],expiresAt,maxRequests=12,at=new Date().toISOString()}={}){
  if(actorKind!=='human')return denied('human-zone-mandate-required');
  if(repository!== 'Animic-Protein/Animic-Protein.github.io'||!canonicalRepository(repository))return denied('repository-outside-declared-zone');
  if(!Array.isArray(capabilities)||!capabilities.length||capabilities.some(item=>!NAVIGATOR_GITHUB_CAPABILITIES.includes(item)))return denied('capability-outside-declared-zone');
  if(!expiresAt||!Number.isFinite(Date.parse(expiresAt))||Date.parse(expiresAt)<=Date.parse(at))return denied('finite-zone-expiry-required');
  if(!Number.isInteger(maxRequests)||maxRequests<1||maxRequests>20)return denied('finite-zone-budget-required');
  const mandate={
    id:`NAV-ZONE-${Date.now().toString(36)}-${(++sequence).toString(36)}`,
    zone:NAVIGATOR_GITHUB_ZONE,
    provider:'github',
    repository,
    capabilities:[...new Set(capabilities)],
    issuedBy:'human',
    actorKind:'artificial',
    expiresAt,
    revision:0,
    usage:{requests:0,maxRequests},
    status:'active',
    events:[{type:'zone-mandate-issued',at,zone:NAVIGATOR_GITHUB_ZONE,repository,capabilities:[...new Set(capabilities)],issuedBy:'human'}]
  };
  latestMandateRevision.set(mandate.id,mandate.revision);
  return{accepted:true,reason:null,mandate,execution:'not-executed'};
}

export async function requestNavigatorZoneOperation(mandate,{operation,repository,resource='',details={},at=new Date().toISOString()}={}){
  if(!mandate||mandate.status!=='active'||mandate.zone!==NAVIGATOR_GITHUB_ZONE)return denied('inactive-or-unknown-zone-mandate');
  if(latestMandateRevision.get(mandate.id)!==mandate.revision)return denied('stale-zone-mandate');
  if(mandate.expiresAt&&Date.parse(mandate.expiresAt)<=Date.parse(at))return denied('zone-mandate-expired');
  if(mandate.usage.requests>=mandate.usage.maxRequests)return denied('zone-request-budget-exhausted');
  if(repository!==mandate.repository||repository!== 'Animic-Protein/Animic-Protein.github.io')return denied('repository-outside-zone-mandate');
  if(!mandate.capabilities.includes(operation))return denied('operation-outside-zone-mandate');
  if(!['repository.read','patch.prepare','pull-request.draft.create'].includes(operation))return denied('operation-not-supported');
  if(!canonicalResource(resource))return denied('exact-resource-required');
  if(!details||typeof details!=='object'||Array.isArray(details))return denied('operation-details-required');
  const actionDigest=await digest({mandateId:mandate.id,zone:mandate.zone,operation,repository,resource:resource.trim(),details});
  const request={
    id:`NAV-REQ-${Date.now().toString(36)}-${(++sequence).toString(36)}`,
    mandateId:mandate.id,
    mandateRevision:mandate.revision,
    expiresAt:mandate.expiresAt,
    zone:mandate.zone,
    repository,
    operation,
    resource:resource.trim(),
    details:canonical(details),
    actionDigest,
    status:operation==='pull-request.draft.create'?'human-approval-required':'authorized-awaiting-adapter',
    effect:operation==='repository.read'?'read-only':operation==='patch.prepare'?'local-draft':'external-draft',
    execution:'not-executed',
    humanDecision:null,
    at
  };
  latestRequestStatus.set(request.id,request.status);
  const requestIds=requestsByMandate.get(mandate.id)||[];
  requestsByMandate.set(mandate.id,[...requestIds,request.id]);
  const nextMandate={...mandate,revision:mandate.revision+1,usage:{...mandate.usage,requests:mandate.usage.requests+1},events:[...mandate.events,{type:'zone-operation-requested',at,requestId:request.id,operation,resource:request.resource,actionDigest,execution:'not-executed'}]};
  latestMandateRevision.set(nextMandate.id,nextMandate.revision);
  return{accepted:true,reason:null,request,mandate:nextMandate};
}

export function approveNavigatorZoneRequest(request,{actorKind,decision,actionDigest,at=new Date().toISOString()}={}){
  if(!request||request.status!=='human-approval-required'||latestRequestStatus.get(request.id)!==request.status)return denied('request-not-awaiting-human-approval');
  if(revokedMandates.has(request.mandateId))return denied('zone-mandate-revoked');
  if(request.expiresAt&&Date.parse(request.expiresAt)<=Date.parse(at))return denied('zone-mandate-expired');
  if(actorKind!=='human'||!['approve','deny','quiet','halt'].includes(decision))return denied('valid-human-decision-required');
  if(actionDigest!==request.actionDigest)return denied('decision-action-digest-mismatch');
  const status=decision==='approve'?'authorized-awaiting-adapter':decision==='deny'?'denied':decision;
  const next={...request,status,humanDecision:{actorKind,decision,actionDigest,at},execution:'not-executed'};
  latestRequestStatus.set(request.id,status);
  return{accepted:decision==='approve',reason:decision==='approve'?null:`human-${decision}`,request:next,execution:'not-executed'};
}

export function revokeNavigatorZoneMandate(mandate,{actorKind,at=new Date().toISOString()}={}){
  if(!mandate||mandate.status!=='active')return denied('inactive-or-unknown-zone-mandate');
  if(latestMandateRevision.get(mandate.id)!==mandate.revision)return denied('stale-zone-mandate');
  if(actorKind!=='human')return denied('human-revocation-required');
  const next={...mandate,status:'revoked',revision:mandate.revision+1,events:[...mandate.events,{type:'zone-mandate-revoked',at,zone:mandate.zone,repository:mandate.repository,revokedBy:'human'}]};
  latestMandateRevision.set(next.id,next.revision);
  revokedMandates.add(next.id);
  for(const requestId of requestsByMandate.get(next.id)||[])latestRequestStatus.set(requestId,'revoked');
  return{accepted:true,reason:null,mandate:next,execution:'not-executed'};
}
