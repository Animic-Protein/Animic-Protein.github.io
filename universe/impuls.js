(() => {
  'use strict';

  const VERSION='1.2';
  const DECISIONS_KEY='animic.codex.impulse-decisions/v1';
  const KEYS={pressure:'animic-protein-branch-pressure-v1',homeo:'animic-protein-constitutional-homeostasis-v1',germs:'animic-protein-germina-v2',relations:'animic-protein-inter-nos-v2',temporal:'animic.codex.temporal-fragments/v1'};
  const ACTIONS={
    reobserve:{label:'Reescoltar',href:'../#homeostasi'},
    return:{label:'Retornar el fragment',href:'../cambra-nua-2/fragment-circulation.html'},
    transform:{label:'Metabolitzar',href:'../fusio-total/'},
    relate:{label:'Relacionar',href:'../inter-nos-creative/'},
    quiet:{label:'Deixar quiet',href:'#'}
  };
  let currentProposal=null;

  const readArray=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const readObject=key=>{try{const v=JSON.parse(localStorage.getItem(key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return{}}};
  const activePressure=()=>readArray(KEYS.pressure).reduce((best,p)=>Number(p?.score||0)>Number(best?.score||0)?p:best,{score:0,components:{}});
  const temporalRecords=()=>Object.values(readObject(KEYS.temporal));
  const hasMeaningfulTension=p=>((Number(p?.components?.conflicts)||0)+(Number(p?.components?.metabolism)||0)+(Number(p?.components?.compost)||0))>0;
  const latestHomeostasis=()=>readArray(KEYS.homeo).slice().reverse().find(h=>Number(h?.relief||0)>0&&Number(h?.pressureBasis||0)>0)||null;
  const relationDensity=()=>{const living=readArray(KEYS.germs).filter(g=>g.life!=='compost');const ids=new Set(living.map(g=>g.id));const rel=readArray(KEYS.relations).filter(r=>[r?.aId,r?.bId,r?.sourceId,r?.targetId].some(id=>ids.has(id)));return living.length?rel.length/living.length:0};
  const latestTemporal=()=>temporalRecords().sort((a,b)=>String(b?.provenance?.createdAt||b?.source?.createdAt||'').localeCompare(String(a?.provenance?.createdAt||a?.source?.createdAt||'')))[0]||null;
  const now=()=>new Date().toISOString();
  const uid=prefix=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  const subjectRef=(kind,value)=>value?`${kind}:${String(value)}`:null;
  const basis=(kind,ref,observedAt,sourceKey)=>({kind,subjectRef:ref||null,observedAt:observedAt||null,sourceKey,canonical:false,reversible:true});

  function suggest(){
    const pressure=activePressure(),temporal=latestTemporal(),homeostasis=latestHomeostasis(),living=readArray(KEYS.germs).filter(g=>g.life!=='compost'),density=relationDensity();
    if(homeostasis){const ref=subjectRef('homeostasis',homeostasis.id||homeostasis.branchId||homeostasis.sourceId);return{state:'reobserve',label:'Reescolta',text:'Hi ha alleujament homeostàtic actiu. Abans de tornar a intervenir, comprova si el context encara és el mateix.',href:'../#homeostasi',basis:basis('homeostasis',ref,homeostasis.at||homeostasis.calculatedAt,KEYS.homeo)}}
    if(temporal&&Math.abs(Number(temporal?.fragment?.difference||0))>=1){const id=temporal.fragment?.id||temporal.id||temporal.provenance?.rootRecordId||temporal.source?.id;return{state:'return',label:'Retorna el fragment',text:'Hi ha una diferència perceptible amb procedència. No la multipliquis: deixa-la circular cap a un únic òrgan pertinent.',href:'../cambra-nua-2/fragment-circulation.html',basis:basis('temporal-fragment',subjectRef('temporal-fragment',id),temporal.provenance?.createdAt||temporal.source?.createdAt,KEYS.temporal)}}
    if(Number(pressure.score||0)>0&&hasMeaningfulTension(pressure))return{state:'transform',label:'Metabolitza',text:'La pressió conté fricció o transformació real. Pot merèixer un gest, però no una conclusió automàtica.',href:'../fusio-total/',basis:basis('branch-pressure',subjectRef('branch',pressure.id),pressure.calculatedAt,KEYS.pressure)};
    if(living.length>=6&&density<.5)return{state:'relate',label:'Relaciona abans de podar',text:'Hi ha matèria viva amb poca densitat relacional. Prova una relació abans d’afegir o eliminar.',href:'../inter-nos-creative/',basis:basis('relation-density',null,null,KEYS.germs)};
    return{state:'quiet',label:'No forcis res',text:'No hi ha cap senyal prou fort per justificar moviment. El silenci també és un estat operatiu.',href:'#',basis:basis('insufficient-signal',null,null,null)};
  }

  function proposal(){
    const d=suggest(),signature=[d.state,d.label,d.text,d.href,JSON.stringify(d.basis||null)].join('|');
    if(!currentProposal||currentProposal.signature!==signature)currentProposal={...d,id:uid('impuls'),emittedAt:now(),signature,canonical:false,reversible:true,decided:false};
    return currentProposal;
  }
  function writeDecision(record){
    const records=readArray(DECISIONS_KEY).filter(item=>item?.id!==record.id);records.push(record);
    try{localStorage.setItem(DECISIONS_KEY,JSON.stringify(records.slice(-20)))}catch{}
  }
  function recordDecision(action,target){
    const p=currentProposal;if(!p)return;
    const acceptedSuggestion=action===p.state;
    const record={
      id:uid('human-decision'),
      status:'resolved',
      suggestedImpulse:{id:p.id,state:p.state,label:p.label,text:p.text,href:p.href,basis:p.basis||null,emittedAt:p.emittedAt,canonical:false,reversible:true,decided:false},
      humanDecision:{action,acceptedSuggestion,subjectRef:p.basis?.subjectRef||null,subjectBinding:p.basis?.subjectRef?'bound':'unbound',at:now()},
      effect:{kind:target&&target!=='#'?'navigate':'remain',href:target||'#',initiated:false},
      provenance:{kind:'impulse-response',organ:'IMPULS',version:VERSION,origin:'universe',canonical:false,reversible:true}
    };
    writeDecision(record);
    if(target&&target!=='#'){
      record.effect.initiated=true;
      record.effect.initiatedAt=now();
      writeDecision(record);
    }
    window.dispatchEvent(new CustomEvent('codex:human-decision',{detail:record}));
    renderResolved(record);
    if(target&&target!=='#')setTimeout(()=>location.assign(target),220);
  }

  function ensure(){
    let box=document.querySelector('#impulsPanel');if(box)return box;
    const stage=document.querySelector('#stage > div');if(!stage)return null;
    box=document.createElement('aside');box.id='impulsPanel';box.setAttribute('aria-live','polite');box.style.cssText='margin:2rem auto 0;width:min(600px,100%);padding:1.15rem;border:1px solid var(--o);border-radius:18px;background:radial-gradient(circle at 10% 0,#17384a,#06131f 65%);text-align:left;box-shadow:0 0 36px #00c8ff18';stage.insertBefore(box,stage.firstChild);return box;
  }
  function actionButton(id,label,primary=false){return `<button id="${id}" type="button" style="margin:.45rem .35rem 0 0;padding:.65rem .9rem;border:1px solid ${primary?'var(--g)':'var(--l)'};border-radius:999px;background:transparent;color:var(--t);cursor:pointer">${label}</button>`}
  function bindDecisionControls(d){
    document.querySelector('#impulsAccept')?.addEventListener('click',()=>recordDecision(d.state,d.href));
    document.querySelector('#impulsQuiet')?.addEventListener('click',()=>recordDecision('quiet','#'));
    document.querySelector('#impulsDiverge')?.addEventListener('click',()=>{
      const choices=document.querySelector('#impulsChoices');if(!choices)return;
      choices.hidden=!choices.hidden;
      if(!choices.hidden)choices.querySelector('button')?.focus();
    });
    document.querySelectorAll('#impulsChoices [data-impulse-action]').forEach(button=>button.addEventListener('click',()=>{
      const action=button.dataset.impulseAction,choice=ACTIONS[action];if(choice)recordDecision(action,choice.href);
    }));
  }
  function render(){
    const box=ensure();if(!box)return;const d=proposal();
    const alternatives=Object.entries(ACTIONS).filter(([state])=>state!==d.state&&state!=='quiet').map(([state,a])=>`<button type="button" data-impulse-action="${state}" style="margin:.35rem .3rem .1rem 0;padding:.55rem .75rem;border:1px solid var(--c);border-radius:999px;background:transparent;color:var(--t);cursor:pointer">${a.label}</button>`).join('');
    box.innerHTML=`<p class="ey" style="margin:0 0 .35rem">IMPULS · 1.1 · ${d.state}</p><p style="margin:.2rem 0;color:var(--t);font:1.45rem Georgia,serif"><strong>${d.label}</strong></p><p style="margin:.35rem 0;color:var(--m)">${d.text}</p><div role="group" aria-label="Resposta humana a la proposta">${actionButton('impulsAccept',d.state==='quiet'?'Acceptar la quietud':'Acceptar proposta',true)}${actionButton('impulsDiverge','Desviar-me')}${d.state==='quiet'?'':actionButton('impulsQuiet','Deixar quiet')}</div><div id="impulsChoices" hidden style="margin-top:.65rem;padding-top:.6rem;border-top:1px solid var(--l)"><p style="margin:.1rem 0;color:var(--m);font-size:.82rem">Escull una altra direcció humana:</p>${alternatives}</div><p style="margin:.7rem 0 0;color:#78909c;font-size:.75rem">Proposta <code>${d.id}</code> · reversible · no canònica · encara no decidida</p>`;
    bindDecisionControls(d);
    window.dispatchEvent(new CustomEvent('codex:suggested-impulse',{detail:{id:d.id,state:d.state,label:d.label,text:d.text,href:d.href,basis:d.basis||null,emittedAt:d.emittedAt,canonical:false,reversible:true,decided:false}}));
  }
  function renderResolved(record){
    const box=ensure();if(!box)return;
    const accepted=record.humanDecision.acceptedSuggestion;
    box.innerHTML=`<p class="ey" style="margin:0 0 .35rem">IMPULS · 1.1 · DECISIÓ HUMANA</p><p style="margin:.2rem 0;color:var(--t);font:1.35rem Georgia,serif"><strong>${accepted?'Proposta acceptada':'Desviació preservada'}</strong></p><p style="margin:.35rem 0;color:var(--m)">IMPULS havia proposat <b>${record.suggestedImpulse.state}</b>. La persona ha decidit <b>${record.humanDecision.action}</b>.</p><p style="margin:.7rem 0 0;color:#78909c;font-size:.75rem">Rastre local · reversible · no canònic · <code>${record.id}</code></p>`;
  }
  function expose(){
    const presence=document.getElementById('presence'),stage=document.getElementById('stage');
    if(presence)presence.style.display='none';if(stage)stage.classList.add('active');render();
    setTimeout(()=>document.getElementById('impulsPanel')?.scrollIntoView({behavior:'smooth',block:'center'}),60);
  }
  ['storage','animic:pressure-updated','animic:homeostasis-updated','codex:temporal-difference','codex:ant-relation'].forEach(name=>window.addEventListener(name,()=>{currentProposal=null;window.setTimeout(render,0)}));
  document.addEventListener('click',e=>{if(e.target?.id==='enter')setTimeout(render,0)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();if(new URLSearchParams(location.search).get('impuls')==='1')expose()},{once:true});else{render();if(new URLSearchParams(location.search).get('impuls')==='1')expose()}
  window.CodexImpulse={version:VERSION,suggest,render,expose,decisions:()=>readArray(DECISIONS_KEY)};
})();