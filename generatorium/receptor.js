(()=>{
'use strict';
if(window.CodexGeneratedPhenomenonReceptor)return;
let current=null,panel=null;
const routeFor=p=>{
  const op=String(p?.operation||'forward');
  if(op==='reverse'||op==='versarium')return{organ:'Cambra Nua del Temps',href:'../cambra-nua-2/',reason:'La diferència principal és temporal: inversió o alternança de direcció.'};
  return{organ:'Rosa de l’Escolta',href:'../#rosa',reason:'El fenomen demana escolta abans d’interpretació o relació.'};
};
const decision=(kind,extra={})=>{
  if(!current)return null;
  const d={kind:'humanDecision',decision:kind,phenomenon:current,decidedAt:new Date().toISOString(),canonical:false,reversible:true,...extra};
  window.dispatchEvent(new CustomEvent('codex:human-decision',{detail:d}));
  try{localStorage.setItem('animic.codex.last-human-decision',JSON.stringify(d));}catch{}
  return d;
};
function ensure(){
  if(panel)return panel;
  const style=document.createElement('style');style.textContent='.metabolic-receptor{margin:18px 0;padding:16px;border:1px solid #3fff6760;border-radius:18px;background:#061019}.metabolic-receptor[hidden]{display:none}.metabolic-receptor .mr-actions{display:flex;gap:8px;flex-wrap:wrap}.metabolic-receptor .mr-muted{color:#aebdca;font-size:.88rem}.metabolic-receptor .mr-route{color:#e3a629;font-family:Georgia,serif;font-size:1.25rem}.metabolic-receptor button,.metabolic-receptor a{border:1px solid #00c8ff;border-radius:999px;background:#0e1c27;color:#f8fbff;padding:.7rem 1rem;text-decoration:none;cursor:pointer}';document.head.append(style);
  panel=document.createElement('section');panel.className='metabolic-receptor';panel.hidden=true;panel.innerHTML='<p class="ey">RETORN METABÒLIC · 0.1</p><p class="mr-muted">S’ha produït un fenomen. El Còdex no l’interpreta ni el conserva automàticament.</p><p class="mr-route" id="mrRoute"></p><p class="mr-muted" id="mrReason"></p><div class="mr-actions"><a id="mrObserve" href="#">Observar-hi</a><button id="mrKeep" type="button">Conservar amb RECORDARE</button><button id="mrQuiet" type="button">Deixar quiet</button></div><p class="mr-muted" id="mrState">Esperant decisió humana.</p>';
  const anchor=document.querySelector('#generatoriumState')||document.querySelector('#status')||document.querySelector('main');anchor?.insertAdjacentElement('afterend',panel);
  panel.querySelector('#mrObserve').onclick=()=>{const r=routeFor(current),d=decision('observe',{route:r.organ});if(d)try{localStorage.setItem('animic.codex.pending-generated-phenomenon',JSON.stringify(current));}catch{}};
  panel.querySelector('#mrKeep').onclick=()=>{const d=decision('conserve',{route:'RECORDARE'});if(!d)return;try{localStorage.setItem('animic.codex.pending-generated-phenomenon',JSON.stringify(current));}catch{};panel.querySelector('#mrState').textContent='Decisió humana: conservar. RECORDARE rep el context; cap cànon automàtic.';window.RecordareInvocatio?.open();};
  panel.querySelector('#mrQuiet').onclick=()=>{decision('quiet');panel.querySelector('#mrState').textContent='Decisió humana: deixar quiet. El fenomen continua efímer.';panel.hidden=true;};
  return panel;
}
function receive(p){
  if(!p||p.kind!=='generated-phenomenon')return;
  current=p;const box=ensure(),r=routeFor(p);box.hidden=false;box.querySelector('#mrRoute').textContent=`Ruta pertinent: ${r.organ}`;box.querySelector('#mrReason').textContent=r.reason;box.querySelector('#mrObserve').href=r.href;box.querySelector('#mrState').textContent='Generar no equival a percebre; percebre no equival a relacionar; relacionar no equival a decidir.';
  window.dispatchEvent(new CustomEvent('codex:generated-phenomenon-received',{detail:{phenomenon:p,suggestedRoute:r,canonical:false,reversible:true,decided:false}}));
}
window.addEventListener('codex:generated-phenomenon',e=>receive(e.detail));
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='codex:generated-phenomenon')receive(e.data.detail)});
try{const p=JSON.parse(localStorage.getItem('animic.codex.last-generated-phenomenon')||'null');if(p)setTimeout(()=>receive(p),0)}catch{}
window.CodexGeneratedPhenomenonReceptor={receive,routeFor,current:()=>current};
})();