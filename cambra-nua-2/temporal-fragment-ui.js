import {createTemporalFragment,relateTemporalFragment,TEMPORAL_DESTINATIONS} from './temporal-fragment.js';

let activeRecord=null;
const wantsCirculation=()=>new URLSearchParams(location.search).get('return')==='circulation';

function ensureUi(){
  const result=document.querySelector('#result');
  if(!result||document.querySelector('#temporalReturns'))return;
  const box=document.createElement('section');
  box.id='temporalReturns';
  box.style.cssText='margin-top:18px;padding-top:16px;border-top:1px solid var(--line)';
  box.innerHTML='<p class="ey">FRAGMENT TEMPORAL</p><p class="mut" id="fragmentState">Quan revelis la diferència, el Còdex conservarà un únic fragment local amb procedència.</p><div class="actions" id="fragmentActions"></div>';
  result.append(box);
}

function renderActions(){
  ensureUi();
  const actions=document.querySelector('#fragmentActions'),state=document.querySelector('#fragmentState');
  if(!actions||!activeRecord)return;
  actions.replaceChildren();
  state.textContent=`Fragment creat · diferència ${Number(activeRecord.fragment?.difference||0).toFixed(1)} s · origen ${activeRecord.provenance?.originId||'—'} · reversible · no canònic.`;

  const circulation=document.createElement('a');
  circulation.className='button';
  circulation.href='./fragment-circulation.html?from=espera';
  circulation.textContent='Continuar amb aquest fragment →';
  actions.append(circulation);

  if(!wantsCirculation()){
    const details=document.createElement('details');
    details.style.marginTop='8px';
    const summary=document.createElement('summary');summary.className='mut';summary.textContent='Altres retorns possibles';details.append(summary);
    const extra=document.createElement('div');extra.className='actions';extra.style.marginTop='8px';
    Object.entries(TEMPORAL_DESTINATIONS).forEach(([key,dest])=>{
      const a=document.createElement('a');a.className='button secondary';a.href=dest.href||'#';a.textContent=`Retornar → ${dest.label}`;
      a.addEventListener('click',()=>{const out=relateTemporalFragment(activeRecord,key);activeRecord=out.record;window.__codexTemporalFragment=activeRecord;state.textContent=out.deduplicated?`Relació ja existent → ${dest.label}. No s’ha creat cap còpia.`:`Relació afegida → ${dest.label}. El fragment continua sent únic.`});
      extra.append(a);
    });
    details.append(extra);actions.append(details);
  }
}

window.addEventListener('codex:temporal-difference',event=>{
  try{
    activeRecord=createTemporalFragment(event.detail||{});
    window.__codexTemporalFragment=activeRecord;
    renderActions();
    window.FormigaPont?.show?.('pont','La diferència ja té procedència. Ara pot circular sense duplicar-se.','./fragment-circulation.html?from=espera','Continuar amb el fragment');
  }catch(err){
    console.warn('Temporal fragment failed',err);
    ensureUi();
    const state=document.querySelector('#fragmentState');if(state)state.textContent='No s’ha pogut conservar el fragment. Torna a revelar la diferència.';
  }
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureUi,{once:true});else ensureUi();
