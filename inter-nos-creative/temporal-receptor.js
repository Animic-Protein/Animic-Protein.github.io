(()=>{'use strict';
const STORE='animic.codex.temporal-fragments/v1';
const read=()=>{try{const v=JSON.parse(localStorage.getItem(STORE)||'{}');return v&&typeof v==='object'?Object.values(v):[]}catch{return[]}};
const arrivals=()=>read().filter(r=>(r.relation||[]).some(x=>x.kind==='return-to-inter-nos')).sort((a,b)=>String(b.updatedAt||b.provenance?.history?.at(-1)?.at||b.source?.createdAt||'').localeCompare(String(a.updatedAt||a.provenance?.history?.at(-1)?.at||a.source?.createdAt||'')));
const latest=()=>arrivals()[0]||null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mount(){
 const r=latest();if(!r)return;
 const host=document.querySelector('#interlocutor')||document.querySelector('.interlocutor')||document.querySelector('main')||document.body;
 const f=r.fragment||{};const root=r.provenance?.rootRecordId||r.source?.id||r.id;
 const box=document.createElement('section');box.id='temporal-reception';box.style.cssText='margin:0 0 24px;padding:18px;border:1px solid #31ef91;background:#05251f;border-radius:20px;box-shadow:0 0 30px #31ef9118';
 box.innerHTML=`<small style="color:#31ef91;letter-spacing:.1em">MATÈRIA REBUDA · CAMBRA NUA</small><h3 style="font:400 28px Georgia,serif;margin:7px 0">INTER NOS reconeix el fragment.</h3><p style="color:#bed0e5">No l'interpreta ni el transforma automàticament. El posa davant de l'Interlocutor perquè la persona decideixi què fer amb aquesta diferència temporal.</p><p><b>Diferència percebuda:</b> ${esc(Number(f.difference||0).toFixed(1))} s · <b>arrel:</b> <code>${esc(root)}</code></p><div style="display:flex;gap:9px;flex-wrap:wrap"><button id="temporal-listen" style="border:1px solid #31ef91;background:#0b352c;color:#eef7ff;padding:10px 13px;border-radius:99px">Portar-la a l'Interlocutor</button><a href="../cambra-nua-2/fragment-circulation.html" style="border:1px solid #3974a5;color:#eef7ff;padding:10px 13px;border-radius:99px;text-decoration:none">Veure el rastre →</a></div>`;
 host.parentNode?.insertBefore(box,host);
 box.querySelector('#temporal-listen')?.addEventListener('click',()=>{
  const ta=document.querySelector('.inter-compose textarea')||document.querySelector('textarea');
  if(ta){ta.value=`Ha arribat des de la Cambra Nua un fragment temporal amb una diferència percebuda de ${Number(f.difference||0).toFixed(1)} s. No decideixis per mi: ajuda'm a escoltar què posa en relació.`;ta.focus();ta.scrollIntoView({behavior:'smooth',block:'center'})}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();