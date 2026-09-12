const RECORD_URLS=['../archivum/custodia/history-tales-v1.1.json','../archivum/custodia/eco-01-cas-real-01.json'];
const LABELS={repository_preserved:'Repositori verificat',local_only:'Només local',external_unverified:'Extern no verificat',externally_verified:'Extern verificat',derivative_preserved:'Derivat preservat',missing_original:'Original absent',not_materialized:'No materialitzat'};
const OPEN=new Set(['local_only','external_unverified','missing_original','not_materialized']);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
function recordCard(record){
 const card=el('article','custody-record');
 const head=el('div','custody-head'),title=el('div');
 title.append(el('p','ey',record.subject.status.replaceAll('_',' ')),el('h3','',record.subject.title));
 head.append(title,el('span','custody-count',record.evidence.length+' evidències'));card.append(head);
 const states=record.evidence.reduce((a,x)=>(a[x.custodyState]=(a[x.custodyState]||0)+1,a),{});
 const badges=el('div','custody-badges');Object.entries(states).forEach(([state,count])=>{const b=el('span','custody-badge '+(OPEN.has(state)?'open':'kept'),count+' · '+(LABELS[state]||state));badges.append(b)});card.append(badges);
 const gaps=el('ul','custody-gaps');record.gaps.forEach(g=>gaps.append(el('li','',g)));card.append(el('p','custody-note','Buits explícits'),gaps);
 const source=record.provenance.sources[0],link=el('a','btn','Obrir rastre font');link.href='../'+source;card.append(link);
 return card;
}
async function load(panel){
 const list=panel.querySelector('#custodyRecords'),state=panel.querySelector('#custodyState');
 try{const records=await Promise.all(RECORD_URLS.map(async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(String(r.status));return r.json()}));list.replaceChildren(...records.map(recordCard));state.textContent='2 registres carregats · cap binari transferit.'}
 catch{state.textContent='No s’han pogut carregar els registres. El contracte continua disponible al repositori.'}
}
function mount(){
 const organs=document.querySelector('.organs'),main=document.querySelector('main');if(!organs||!main||document.querySelector('#custodia'))return;
 const style=el('style');style.textContent='.custody-record{border:1px solid #244a64;border-radius:18px;padding:16px;background:#061019;margin:12px 0}.custody-head{display:flex;gap:12px;justify-content:space-between;align-items:start;flex-wrap:wrap}.custody-record h3{font:400 1.6rem Georgia,serif;margin:.2rem 0}.custody-count,.custody-badge{border:1px solid #244a64;border-radius:999px;padding:.35rem .6rem;color:#aebdca;font-size:.78rem}.custody-badges{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.custody-badge.open{border-color:#e3a629;color:#e3a629}.custody-badge.kept{border-color:#3fff67;color:#3fff67}.custody-note{color:#aebdca;margin-bottom:.2rem}.custody-gaps{color:#aebdca}.custody-actions{display:flex;gap:8px;flex-wrap:wrap}';document.head.append(style);
 const organ=el('article','organ');organ.innerHTML='<p class="ey">MEMÒRIA / PROVENANCE</p><h2>Archivum · Custòdia</h2><p class="mut">Comprova què existeix, on és i què continua absent sense confondre derivat i original.</p><button class="btn ochre" id="openCustodia">Comprovar custòdia</button>';organs.append(organ);
 const panel=el('section','panel');panel.id='custodia';panel.hidden=true;panel.innerHTML='<p class="ey">ARCHIVUM · CUSTÒDIA 1.0</p><h2>Conservar també és declarar el buit.</h2><p class="mut">Contracte + History Tales v1.1 + ECO 01 · CAS REAL 01. Aquesta vista només llegeix metadades; no carrega ni transfereix binaris.</p><div class="custody-actions"><a class="btn ochre" href="../governanca/ARCHIVUM_CUSTODIA_1.0.md">Llegir contracte</a><button class="btn" id="closeCustodia">Tancar</button></div><div id="custodyState" class="status">Carregant registres…</div><div id="custodyRecords"></div>';main.append(panel);
 const open=()=>{panel.hidden=false;load(panel);history.replaceState(null,'','#custodia');panel.scrollIntoView({behavior:'smooth',block:'start'})};
 document.querySelector('#openCustodia').onclick=open;panel.querySelector('#closeCustodia').onclick=()=>{panel.hidden=true;history.replaceState(null,'',location.pathname+location.search)};if(location.hash==='#custodia')setTimeout(open,0);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
