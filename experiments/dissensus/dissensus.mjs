import {authorizeTransformation,createSession,recordDecision} from './protocol.mjs';

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const SOURCE_REF_DEFAULT=$('#sourceRef').value;
const IMPULSE='REOBSERVAR: quines evidències sostindrien el mot «necessàriament», i quines condicions o contraexemples el posarien en qüestió?';
const AI_ARGUMENTS={
  support:$('#support').value,
  objection:$('#objection').value
};
let state=createSession();

function focusValue(){return document.querySelector('input[name="focus"]:checked')?.value||null}
function focusLabel(){
  const value=focusValue();
  if(value==='other')return $('#focusOther').value.trim()||'Una altra orientació (sense detall)';
  return value?({formulació:'La formulació',evidències:'Les evidències',relacions:'Les relacions implicades'}[value]||value):null;
}
function render(){
  const source=$('#sourceText').value.trim();
  $('#retainedQuote').textContent=source||'La font encara no s’ha especificat.';
  $('#caseStatus').textContent=state.ended?'Aturat · sense més accions':state.decision?'Decisió humana registrada':'Obert · sense decisió humana';
  $('#otherRouteWrap').hidden=state.decision!=='reject';
  $$('[data-decision]').forEach(button=>button.disabled=state.ended||Boolean(state.mutation));
  $('#chooseOtherRoute').disabled=state.decision!=='reject'||!$('#otherRoute').value.trim()||state.ended||Boolean(state.mutation);
  $('#stopNotice').hidden=!state.ended;
  $('#authorizeMutation').disabled=state.decision!=='transform'||state.ended||!$('#mutationText').value.trim()||Boolean(state.mutation);
  $('#mutationSection').hidden=state.decision!=='transform';
  $('#mutationStatus').textContent=state.mutation?`Autorització registrada per a: ${state.mutation}`:'Encara no hi ha cap transformació autoritzada.';
  const decisionText={accept:'Acceptar REOBSERVAR',reject:'Rebutjar REOBSERVAR',other:'Rebutjar REOBSERVAR i triar una altra ruta',quiet:'Quedar-se en quietud',transform:'Transformar (autorització exacta encara pendent)',stop:'Aturar la prova'};
  $('#decisionStatus').textContent=state.decision?`Has triat: ${decisionText[state.decision]}. Aquesta opció no executa cap transformació.`:'Cap decisió registrada.';
  const rows=[
    ['Font',source?`${source} — ${$('#sourceRef').value.trim()||'referència no especificada'}`:'Pendent d’indicar'],
    ['ATTENTIO',focusLabel()||'No especificat'],
    ['Proposta de la IA',IMPULSE],
    ['FRICTIONES · IA',`Argument: ${$('#support').value.trim()||'en blanc'} Objecció: ${$('#objection').value.trim()||'en blanc'} Fonts verificades: cap`],
    ['Rebuig',state.rejected??'Pendent; encara no hi ha rebuig registrat'],
    ['Decisió autoritzada',state.authorizedDecision??'Pendent; no hi ha cap acció autoritzada'],
    ['MUTATIO',state.mutation?`Autoritzada i registrada: ${state.mutation}`:'No executada ni autoritzada'],
    ['Incertesa',$('#uncertainty').value.trim()||'No declarada; pot quedar oberta'],
    ['Estat',state.ended?'Aturat':'Sessió oberta; cap resultat d’eficàcia provat']
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
    createdAt:new Date().toISOString(),
    localOnly:true,
    canonical:false,
    reversible:true,
    case:{id:'probatio-libertatis-case-01',status:state.ended?'stopped':state.decision?'decision-recorded':'not-tested-with-participant'},
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
  $('#privacyStatus').textContent='El rastre JSON s’ha creat al teu dispositiu. No s’ha enviat ni desat al Còdex.';
});
$('#dissolve').addEventListener('click',()=>{
  state=createSession();
  $$('[data-decision]').forEach(button=>button.setAttribute('aria-pressed','false'));
  $$('input[name="focus"]').forEach(input=>input.checked=false);
  $('#focusOther').value='';$('#otherRoute').value='';$('#mutationText').value='';$('#sourceRef').value=SOURCE_REF_DEFAULT;
  $('#support').value=AI_ARGUMENTS.support;$('#objection').value=AI_ARGUMENTS.objection;
  $('#uncertainty').value='No s’han aportat evidències empíriques; encara no hi ha resposta d’una persona participant.';
  $('#sourceText').value='La inteligencia artificial empobrece necesariamente la creatividad humana.';
  $('#privacyStatus').textContent='La sessió s’ha dissolt. No hi havia cap rastre guardat al navegador.';
  render();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
});

render();
