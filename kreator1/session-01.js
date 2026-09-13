import {createCodexMediaRecord,evolveRecord,validateRecord,isExternalSource} from '../portal-multimedia/model.js';

const VERSION='1.1-causal';
const STORE_KEY='animic.codex.kreator1/v1';
const now=()=>new Date().toISOString();
const load=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return{}}};
const save=data=>localStorage.setItem(STORE_KEY,JSON.stringify(data));
const clean=value=>String(value||'').trim();
const hasPerceptibleDifference=session=>Boolean(clean(session?.record?.fragment?.difference));
const hasTraceableProvenance=session=>Boolean(clean(session?.record?.provenance?.originId)&&clean(session?.record?.source?.id));
const hasTransformation=session=>Boolean(session?.record?.transformation);
const hasRelation=session=>Array.isArray(session?.record?.relation)&&session.record.relation.length>0;
const hasHumanAuthorization=(session,action)=>session?.humanDecision?.action===action&&session.humanDecision?.effect?.initiated!==true;
const invalidateSuggestion=session=>{session.suggestedImpulse=null;};
const history=(session,event)=>{session.record.provenance.history=[...(session.record.provenance.history||[]),event]};
const assertDifferenceForMovement=(session,action)=>{
  if(hasPerceptibleDifference(session))return;
  throw new Error(`Sense diferència perceptible, el Còdex no pot ${action}. Només quiet o reobserve.`);
};

export const KREATOR1_IMPULSES=Object.freeze(['quiet','relate','reobserve','transform','return']);

export function beginKreator1Session({creator='KREATOR 1',sourceName='Font 001',sourceKind='media',uri='',mime='',rights='participant-authorized',description='',external}={}){
  const sessionId=`kreator1-${Date.now().toString(36)}`;
  const explicitExternal=typeof external==='boolean'?external:undefined;
  let record=createCodexMediaRecord({
    source:{id:`src-${sessionId}`,kind:sourceKind,name:clean(sourceName)||'Font 001',uri:clean(uri),mime:clean(mime),external:explicitExternal,createdAt:now()},
    provenance:{originId:`src-${sessionId}`,createdBy:clean(creator)||'KREATOR 1',rights,reversible:true,history:[{at:now(),action:'kreator1.session.started',ref:sessionId}]}
  });
  if(explicitExternal===undefined&&isExternalSource(record))record.source.external=true;
  record=evolveRecord(record,'fragment',{id:`fragment-${sessionId}`,kind:'kreator1-observation',description:clean(description),status:'unselected',perceptibleDifference:null});
  const registry=load();
  registry[sessionId]={protocolVersion:VERSION,sessionId,status:'source',record,decision:null,decisionHistory:[],impulse:null,suggestedImpulse:null,humanDecision:null,fertileErrorCandidate:null,createdAt:now(),updatedAt:now()};
  save(registry);
  return registry[sessionId];
}

export function selectKreator1Fragment(sessionId,{description='',difference=''}={}){
  const registry=load(),session=registry[sessionId];if(!session)throw new Error('Sessió KREATOR 1 desconeguda');
  if(session.humanDecision)throw new Error('El fragment no es pot substituir després de la decisió humana.');
  session.record=evolveRecord(session.record,'fragment',{id:`fragment-${sessionId}-a`,kind:'kreator1-selected-fragment',description:clean(description),difference:clean(difference),status:'selected',perceptibleDifference:Boolean(clean(difference))});
  invalidateSuggestion(session);session.status='fragment';session.updatedAt=now();save(registry);return session;
}

export function suggestKreator1Impulse(sessionId,{signals={}}={}){
  const registry=load(),session=registry[sessionId];if(!session)throw new Error('Sessió KREATOR 1 desconeguda');
  if(session.humanDecision)throw new Error('IMPULS no pot reescriure la proposta després de la decisió humana.');
  const evidence={
    contextChanged:signals.contextChanged===true,
    tensionSustained:signals.tensionSustained===true,
    relationOpportunity:signals.relationOpportunity===true,
    returnReady:signals.returnReady===true
  };
  let suggestedImpulse='quiet';
  let basis='No hi ha cap senyal prou fort per moure el fragment.';
  let certainty='low';

  if(evidence.contextChanged){
    suggestedImpulse='reobserve';
    basis='El context ha canviat; convé reescoltar abans d’intervenir.';
    certainty='bounded';
  }else if(evidence.returnReady&&hasPerceptibleDifference(session)&&hasRelation(session)&&hasTraceableProvenance(session)){
    suggestedImpulse='return';
    basis='Hi ha senyal explícit de retorn, diferència perceptible, relació i procedència traçable.';
    certainty='bounded';
  }else if(evidence.tensionSustained&&hasPerceptibleDifference(session)){
    suggestedImpulse='transform';
    basis='Hi ha tensió sostinguda explícita i diferència perceptible; es proposa una única transformació reversible.';
    certainty='bounded';
  }else if(evidence.relationOpportunity&&hasPerceptibleDifference(session)){
    suggestedImpulse='relate';
    basis='Hi ha una oportunitat relacional explícita i una diferència perceptible; es proposa una única relació reversible.';
    certainty='bounded';
  }else if(session.status==='fragment'||hasPerceptibleDifference(session)||hasTransformation(session)||hasRelation(session)){
    suggestedImpulse='reobserve';
    basis='Hi ha matèria activa, però l’evidència no basta per inferir transformació, relació o retorn.';
    certainty='low';
  }

  session.suggestedImpulse={action:suggestedImpulse,basis,certainty,evidence,at:now(),executed:false};
  history(session,{at:now(),action:'kreator1.impulse.suggested',ref:sessionId,suggestedImpulse,basis,certainty,evidence});
  session.status='suggestion';session.updatedAt=now();save(registry);
  return session.suggestedImpulse;
}

export function decideKreator1Session(sessionId,{humanAction='quiet',decision=''}={}){
  if(!KREATOR1_IMPULSES.includes(humanAction))throw new Error('Decisió humana KREATOR 1 invàlida');
  let registry=load(),session=registry[sessionId];if(!session)throw new Error('Sessió KREATOR 1 desconeguda');
  const humanRationale=clean(decision);if(!humanRationale)throw new Error('La decisió humana ha de quedar registrada.');
  if(session.humanDecision?.effect?.initiated===true)throw new Error('L’efecte ja s’ha iniciat; la decisió no es pot reescriure.');
  if(!session.suggestedImpulse){suggestKreator1Impulse(sessionId);registry=load();session=registry[sessionId]}
  const suggested=session.suggestedImpulse,diverges=suggested.action!==humanAction,decidedAt=now();
  if(session.humanDecision)session.decisionHistory=[...(session.decisionHistory||[]),session.humanDecision];
  session.humanDecision={
    action:humanAction,
    rationale:humanRationale,
    at:decidedAt,
    acceptedSuggestion:!diverges,
    effect:{kind:['quiet','reobserve'].includes(humanAction)?'remain':'authorize',initiated:false}
  };
  session.decision=humanRationale;
  session.impulse=suggested.action;
  session.fertileErrorCandidate=diverges?{kind:'impulse-human-divergence',suggestedImpulse:suggested.action,humanAction,status:'unresolved',canonical:false,note:'La discrepància es conserva sense decidir qui tenia raó.'}:null;
  history(session,{at:decidedAt,action:'kreator1.human-decision.recorded',ref:sessionId,suggestedImpulse:suggested.action,humanDecision:session.humanDecision,divergence:diverges});
  session.status='decision';session.updatedAt=decidedAt;save(registry);
  window.dispatchEvent(new CustomEvent('codex:kreator1-decision',{detail:session}));
  return session;
}

export function transformKreator1(sessionId,{operation='',description=''}={}){
  const registry=load(),session=registry[sessionId];if(!session)throw new Error('Sessió KREATOR 1 desconeguda');
  if(!hasHumanAuthorization(session,'transform'))throw new Error('MUTATIO requereix una decisió humana transform registrada abans de l’operació.');
  assertDifferenceForMovement(session,'transformar');
  if(!clean(operation))throw new Error('Cal una única operació de transformació');
  const initiatedAt=now();
  session.humanDecision.effect.initiated=true;session.humanDecision.effect.initiatedAt=initiatedAt;
  session.record=evolveRecord(session.record,'transformation',{kind:'kreator1-first-mutation',operation:clean(operation),description:clean(description),authorizedBy:{kind:'humanDecision',action:'transform',at:session.humanDecision.at},reversible:true,at:initiatedAt});
  history(session,{at:initiatedAt,action:'kreator1.mutatio.initiated',ref:session.record.transformation?.id||sessionId,humanDecisionAt:session.humanDecision.at});
  session.status='transformation';session.updatedAt=now();save(registry);return session;
}

export function relateKreator1(sessionId,{target='',kind='kreator1-emergent-relation',label=''}={}){
  const registry=load(),session=registry[sessionId];if(!session)throw new Error('Sessió KREATOR 1 desconeguda');
  if(!hasHumanAuthorization(session,'relate'))throw new Error('Relacionar requereix una decisió humana relate registrada abans de l’operació.');
  assertDifferenceForMovement(session,'relacionar');
  if(!clean(target))return session;
  const initiatedAt=now();session.humanDecision.effect.initiated=true;session.humanDecision.effect.initiatedAt=initiatedAt;
  session.record=evolveRecord(session.record,'relation',{kind,target:clean(target),label:clean(label),suggested:true,decisionRequired:false,decisionResolved:true,humanDecisionAt:session.humanDecision.at,canonical:false,reversible:true,traceRef:session.record.provenance?.originId});
  history(session,{at:initiatedAt,action:'kreator1.relation.initiated',ref:session.record.relation.at(-1)?.id||sessionId,humanDecisionAt:session.humanDecision.at});
  session.status='relation';session.updatedAt=now();save(registry);return session;
}

export function withdrawKreator1Decision(sessionId){
  const registry=load(),session=registry[sessionId];if(!session)throw new Error('Sessió KREATOR 1 desconeguda');
  if(session.humanDecision?.effect?.initiated===true)throw new Error('L’efecte ja s’ha iniciat i no es pot retirar des d’aquest llindar.');
  if(!session.humanDecision)throw new Error('No hi ha cap autorització per retirar.');
  return decideKreator1Session(sessionId,{humanAction:'quiet',decision:'Autorització retirada humanament abans d’iniciar MUTATIO.'});
}

export function closeKreator1Session(sessionId,{unexpected='',nextWish=''}={}){
  const registry=load(),session=registry[sessionId];if(!session)throw new Error('Sessió KREATOR 1 desconeguda');
  if(!session.humanDecision)throw new Error('La sessió no es pot tancar sense una decisió humana prèvia.');
  if(session.humanDecision.action==='transform'&&!hasTransformation(session))throw new Error('La decisió transform encara no ha produït cap MUTATIO; executa-la o retira l’autorització.');
  const check=validateRecord(session.record);if(!check.valid)throw new Error('Registre KREATOR 1 invàlid: '+check.errors.join(', '));
  session.unexpected=clean(unexpected);session.nextWish=clean(nextWish);session.status='closed';session.updatedAt=now();
  history(session,{at:now(),action:'kreator1.session.closed',ref:sessionId,suggestedImpulse:session.suggestedImpulse?.action||null,suggestedCertainty:session.suggestedImpulse?.certainty||null,suggestedEvidence:session.suggestedImpulse?.evidence||null,humanDecision:session.humanDecision,divergence:Boolean(session.fertileErrorCandidate),fertileErrorCandidate:Boolean(session.fertileErrorCandidate)});
  save(registry);window.dispatchEvent(new CustomEvent('codex:kreator1-session',{detail:session}));return session;
}

export function getKreator1Sessions(){return Object.values(load())}
