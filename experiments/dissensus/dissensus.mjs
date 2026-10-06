import {authorizeTransformation,createSession,recordDecision} from './protocol.mjs';
import {initializeLanguages,language,resetDefaults,setLanguage,t} from './dissensus-i18n.mjs';

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const SOURCE_REF_DEFAULT=$('#sourceRef').value;

let state=createSession();
initializeLanguages();
let privacyStatusKey='privacyStatus';
const IMPULSE=t('impulseText');

function focusValue(){return document.querySelector('input[name="focus"]:checked')?.value||null}
function focusLabel(){
  const value=focusValue();
  if(value==='other')return $('#focusOther').value.trim()||t('focusOtherFallback');
  return value?({formulació:t('focusFormulation'),evidències:t('focusEvidence'),relacions:t('focusRelations')}[value]||value):null;
}
function authorizedLabel(){
  if(state.mutation)return `${t('mutatioRecorded')} ${state.mutation}`;
  const keys={accept:'authorizedAccept',reject:'authorizedReject',other:'authorizedOther',quiet:'authorizedQuiet',transform:'authorizedTransform',stop:'authorizedStop'};
  return state.decision? t(keys[state.decision])+(state.decision==='other'?` ${$('#otherRoute').value.trim()}`:''):t('noAuthorizedAction');
}
function render(){
  $('#privacyStatus').textContent=t(privacyStatusKey);
  const source=$('#sourceText').value.trim();
  $('#retainedQuote').textContent=source||t('notSpecified');
  $('#caseStatus').textContent=state.ended?t('caseStopped'):state.decision?t('caseDecided'):t('caseOpen');
  $('#otherRouteWrap').hidden=state.decision!=='reject';
  $$('[data-decision]').forEach(button=>button.disabled=state.ended||Boolean(state.mutation));
  $('#chooseOtherRoute').disabled=state.decision!=='reject'||!$('#otherRoute').value.trim()||state.ended||Boolean(state.mutation);
  $('#stopNotice').hidden=!state.ended;
  $('#authorizeMutation').disabled=state.decision!=='transform'||state.ended||!$('#mutationText').value.trim()||Boolean(state.mutation);
  $('#mutationSection').hidden=state.decision!=='transform';
  $('#mutationStatus').textContent=state.mutation?`${t('mutationRegistered')} ${state.mutation}`:t('mutationNotAuthorized');
  const decisionText={accept:t('decisionAcceptTrace'),reject:t('decisionRejectTrace'),other:t('decisionOtherTrace'),quiet:t('decisionQuietTrace'),transform:t('decisionTransformTrace'),stop:t('decisionStopTrace')};
  $('#decisionStatus').textContent=state.decision?`${t('chose')} ${decisionText[state.decision]}. ${t('noTransform')}`:t('noDecisionRecorded');
  const rows=[
    [t('sourceTerm'),source?`${source} — ${$('#sourceRef').value.trim()||t('notSpecified')}`:t('pendingSource')],
    [t('attentioTerm'),focusLabel()||t('unspecified')],
    [t('impulseTerm'),t('impulseText')],
    [t('frictionTerm'),`${t('supportPrefix')} ${$('#support').value.trim()||t('blank')}${t('objectionPrefix')} ${$('#objection').value.trim()||t('blank')}${t('noVerifiedSources')}`],
    [t('rejectionTerm'),state.rejected?t('rejectionRecorded'):t('rejectionPending')],
    [t('authorizedDecisionTerm'),authorizedLabel()],
    [t('mutatioTerm'),state.mutation?`${t('mutatioRecorded')} ${state.mutation}`:t('notExecuted')],
    [t('uncertaintyTerm'),$('#uncertainty').value.trim()||t('notDeclared')],
    [t('statusTerm'), (state.ended?t('stopped'):state.decision?t('caseDecided'):t('sessionOpen'))+' · '+t('empiricalStatus')]
  ];
  const dl=$('#traceSummary');dl.replaceChildren();
  for(const [term,value] of rows){const dt=document.createElement('dt');dt.textContent=term;const dd=document.createElement('dd');dd.textContent=value;dl.append(dt,dd)}
}

function choose(decision){
  state=recordDecision(state,decision,$('#otherRoute').value);
  $$('[data-decision]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.decision===decision)));
  render();
}

$$('[data-decision]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.decision)));
$('#chooseOtherRoute').addEventListener('click',()=>choose('other'));
$$('[data-language]').forEach(button=>button.addEventListener('click',()=>{setLanguage(button.dataset.language);render();}));
$('#authorizeMutation').addEventListener('click',()=>{
  const exact=$('#mutationText').value.trim();
  state=authorizeTransformation(state,exact);
  render();
});
['sourceText','sourceRef','focusOther','support','objection','uncertainty','mutationText','otherRoute'].forEach(id=>$('#'+id).addEventListener('input',render));
$$('input[name="focus"]').forEach(input=>input.addEventListener('change',render));

function trace(){
  return {
    schema:'animic.codex.dissensus/v0.1',
    interfaceLanguage:language(),
    createdAt:new Date().toISOString(),
    localOnly:true,
    canonical:false,
    reversible:true,
    case:{id:'probatio-libertatis-case-01',validationStatus:'not-validated-empirically-with-a-participant',sessionStatus:state.ended?'stopped':state.decision?'decision-recorded':'not-started'},
    source:{text:$('#sourceText').value.trim(),reference:$('#sourceRef').value.trim()},
    attentio:{choice:focusLabel(),detail:$('#focusOther').value.trim()||null},
    retentio:{text:$('#sourceText').value.trim()},
    frictiones:{authorship:'AI draft; no verified sources attached',support:$('#support').value.trim(),objection:$('#objection').value.trim(),verifiedSources:[]},
    suggestedImpulse:{author:'AI',text:IMPULSE},
    humanRejection:state.rejected,
    humanDecision:{choice:state.decision,authorizedAction:state.authorizedDecision,otherRoute:$('#otherRoute').value.trim()||null},
    decisionHistory:state.events,
    mutatio:{authorized:!!state.mutation,exactChange:state.mutation},
    uncertainty:$('#uncertainty').value.trim()||null,
    persistence:'Only exported after explicit user action; no automatic network or browser storage.'
  };
}

$('#exportTrace').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(trace(),null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='DISSENSUS-rastre.json';link.click();URL.revokeObjectURL(url);
  privacyStatusKey='exportDone';render();
});
$('#dissolve').addEventListener('click',()=>{
  state=createSession();
  $$('[data-decision]').forEach(button=>button.setAttribute('aria-pressed','false'));
  $$('input[name="focus"]').forEach(input=>input.checked=false);
  $('#focusOther').value='';$('#otherRoute').value='';$('#mutationText').value='';$('#sourceRef').value=SOURCE_REF_DEFAULT;
  resetDefaults();
  $('#uncertainty').value=t('uncertaintyDefault');
  $('#sourceText').value='La inteligencia artificial empobrece necesariamente la creatividad humana.';
  privacyStatusKey='dissolveDone';
  render();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
});

const workbench=$('#workbench');
const invitation=$('#invitation');
const declineNote=$('#declineNote');
const skipLink=$('#skipLink');
$('#beginSession').addEventListener('click',()=>{
  invitation.hidden=true;
  workbench.hidden=false;
  skipLink.hidden=false;
  $('#case-title').focus();
});
$('#declineSession').addEventListener('click',()=>{
  invitation.hidden=true;
  declineNote.hidden=false;
});

render();
