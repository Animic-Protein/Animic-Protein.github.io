import {createTemporalFragment,relateTemporalFragment,TEMPORAL_DESTINATIONS,getWaitCaptures,clearWaitCaptures,TEMPORAL_CAPTURE_LIMIT} from './temporal-fragment.js';
import {formatDuration} from './perceived-duration.mjs';

let activeRecord=null;
const wantsCirculation=()=>new URLSearchParams(location.search).get('return')==='circulation';

function ensureUi(){
  const result=document.querySelector('#result');
  if(!result||document.querySelector('#temporalReturns'))return;
  const box=document.createElement('section');
  box.id='temporalReturns';
  box.style.cssText='margin-top:18px;padding-top:16px;border-top:1px solid var(--line)';
  box.innerHTML=`<p class="ey">FRAGMENT TEMPORAL</p><p class="mut" id="fragmentState">Cada captura revelada pot quedar com a fragment local, reversible i amb procedència. Es conserven les ${TEMPORAL_CAPTURE_LIMIT} més recents.</p><div class="actions" id="fragmentActions"></div>`;
  result.append(box);
}

function renderHistory(){
  const list=document.querySelector('#historyList'),empty=document.querySelector('#historyEmpty'),clear=document.querySelector('#clearHistory');
  if(!list||!empty||!clear)return;
  const captures=getWaitCaptures();
  list.replaceChildren();
  empty.hidden=captures.length>0;
  clear.hidden=captures.length===0;
  captures.forEach((record,index)=>{
    const card=document.createElement('article');card.className='capture';
    const title=document.createElement('strong');title.textContent=`Captura ${captures.length-index} · ${formatDuration(record.fragment?.perceived)} percebuts`;
    const detail=document.createElement('small');detail.textContent=`Cronològic ${formatDuration(record.fragment?.chronological)} · diferència ${Number(record.fragment?.difference||0).toFixed(1)} s${record.fragment?.timingIntegrity==='backgrounded'?' · sessió en segon pla; cronologia potencialment incompleta':''}`;
    card.append(title,detail);list.append(card);
  });
}

function renderActions(){
  ensureUi();
  const actions=document.querySelector('#fragmentActions'),state=document.querySelector('#fragmentState');
  if(!actions||!activeRecord)return;
  actions.replaceChildren();
  state.textContent=`Captura guardada localment · diferència ${Number(activeRecord.fragment?.difference||0).toFixed(1)} s · origen ${activeRecord.provenance?.originId||'—'} · ${activeRecord.fragment?.timingIntegrity==='backgrounded'?'en segon pla; cronologia potencialment incompleta · ':''}reversible · no canònica.`;

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
    renderHistory();
    window.__codexTemporalFragment=activeRecord;
    renderActions();
    window.FormigaPont?.show?.('pont','La diferència ja té procedència. Ara pot circular sense duplicar-se.','./fragment-circulation.html?from=espera','Continuar amb el fragment');
  }catch(err){
    console.warn('Temporal fragment failed',err);
    ensureUi();
    const state=document.querySelector('#fragmentState');if(state)state.textContent='No s’ha pogut conservar el fragment. Torna a revelar la diferència.';
  }
});

document.querySelector('#clearHistory')?.addEventListener('click',()=>{clearWaitCaptures();renderHistory();document.querySelector('#fragmentActions')?.replaceChildren();document.querySelector('#fragmentState')?.replaceChildren(document.createTextNode('Les captures locals d’aquest exercici s’han dissolt.'))});
renderHistory();

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureUi,{once:true});else ensureUi();
