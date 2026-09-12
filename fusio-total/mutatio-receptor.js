(() => {
  'use strict';

  const VERSION='0.1';
  const DECISIONS_KEY='animic.codex.impulse-decisions/v1';
  const RECEPTIONS_KEY='animic.codex.mutatio-receptions/v1';
  const read=key=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch{return[]}};
  const write=(key,records)=>{try{localStorage.setItem(key,JSON.stringify(records.slice(-20)))}catch{}};
  const now=()=>new Date().toISOString();
  const latestTransform=()=>read(DECISIONS_KEY).slice().reverse().find(record=>record?.status==='resolved'&&record?.humanDecision?.action==='transform'&&record?.effect?.kind==='navigate'&&String(record?.effect?.href||'').includes('fusio-total'))||null;
  const receptionFor=decisionId=>read(RECEPTIONS_KEY).find(record=>record?.decisionId===decisionId)||null;

  function saveReception(record){
    const records=read(RECEPTIONS_KEY).filter(item=>item?.id!==record.id&&item?.decisionId!==record.decisionId);
    records.push(record);write(RECEPTIONS_KEY,records);
  }
  function forgetReception(decisionId){
    write(RECEPTIONS_KEY,read(RECEPTIONS_KEY).filter(item=>item?.decisionId!==decisionId));
  }
  function ensure(){
    let panel=document.getElementById('mutatio-receptor');if(panel)return panel;
    const main=document.querySelector('main'),gates=document.querySelector('.gates');if(!main||!gates)return null;
    panel=document.createElement('section');panel.id='mutatio-receptor';panel.setAttribute('aria-live','polite');
    panel.style.cssText='display:none;margin:0 0 2rem;padding:1.2rem;border:1px solid var(--g);border-radius:22px;background:radial-gradient(circle at 10% 0,#0b3520,#06131f 70%);';
    main.insertBefore(panel,gates);return panel;
  }
  function button(label,destination){
    return `<button type="button" data-mutatio-destination="${destination}" style="margin:.45rem .35rem 0 0;padding:.65rem .85rem;border:1px solid var(--o);border-radius:999px;background:transparent;color:var(--t);cursor:pointer">${label}</button>`;
  }
  function resolve(decision,destination,target){
    const record={
      id:`mutatio-reception-${decision.id}`,
      decisionId:decision.id,
      proposalId:decision.suggestedImpulse?.id||null,
      receivedAt:now(),
      humanResolution:{destination,at:now()},
      effect:{kind:target?'navigate':'remain',href:target||'#',initiated:Boolean(target)},
      status:destination==='pending'?'pending':'resolved',
      provenance:{kind:'mutatio-reception',version:VERSION,canonical:false,reversible:true}
    };
    saveReception(record);
    window.dispatchEvent(new CustomEvent('codex:mutatio-reception-resolved',{detail:record}));
    render();
    if(target)setTimeout(()=>location.assign(target),220);
  }
  function bind(decision){
    document.querySelectorAll('[data-mutatio-destination]').forEach(control=>control.addEventListener('click',()=>{
      const destination=control.dataset.mutatioDestination;
      if(destination==='instrument-z')resolve(decision,destination,'../#instrument-z');
      else if(destination==='compost')resolve(decision,destination,'../#compost');
      else resolve(decision,'pending',null);
    }));
    document.getElementById('forget-mutatio-reception')?.addEventListener('click',()=>{forgetReception(decision.id);render()});
  }
  function render(){
    const panel=ensure();if(!panel)return;
    const decision=latestTransform();
    if(!decision){panel.style.display='none';panel.innerHTML='';return}
    panel.style.display='block';
    const reception=receptionFor(decision.id);
    if(reception){
      const label=reception.humanResolution?.destination||'pending';
      panel.innerHTML=`<p class="ey">MUTATIO · RECEPTOR 0.1</p><h2 style="margin:.25rem 0">Decisió rebuda i preservada.</h2><p style="color:var(--m)">IMPULS havia proposat <b>${decision.suggestedImpulse?.state||'—'}</b>; la persona va decidir <b>transform</b>. Destí humà: <b>${label}</b>.</p><p class="law">Rebre no equival a transformar. Cap cànon ha estat modificat.</p><button id="forget-mutatio-reception" type="button" class="quiet">Retirar aquesta recepció</button>`;
      bind(decision);return;
    }
    const divergence=decision.humanDecision?.acceptedSuggestion===false?'La decisió divergeix de la proposta original. Aquesta discrepància es conserva.':'La persona ha acceptat la proposta de transformació.';
    panel.innerHTML=`<p class="ey">MUTATIO · RECEPTOR 0.1</p><h2 style="margin:.25rem 0">La decisió ha arribat.</h2><p style="color:var(--m)">${divergence} Encara no hi ha prou base per transformar automàticament: cal escollir un únic destí reversible.</p><p style="color:var(--m);font-size:.82rem">Decisió <code>${decision.id}</code> · proposta <code>${decision.suggestedImpulse?.id||'sense-id'}</code></p><div role="group" aria-label="Destí humà de MUTATIO">${button('Contrastar amb Instrument Z','instrument-z')}${button('Portar al Compost','compost')}${button('Deixar pendent','pending')}</div><p class="law">humanDecision no és transformació automàtica.</p>`;
    bind(decision);
  }

  window.addEventListener('storage',render);
  window.addEventListener('codex:human-decision',render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
  window.CodexMutatioReceiver={version:VERSION,render,receptions:()=>read(RECEPTIONS_KEY)};
})();