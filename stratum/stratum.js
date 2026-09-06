(()=>{
'use strict';
const CORPUS=[
{text:'El Còdex no representa el pensament: assaja condicions perquè el pensament es transformi.',state:'canonical',stratum:'Sediment verbal',context:'Ecosistema del Pensament',origin:'Archivum · sediment verbal',certainty:'declared'},
{text:'Quan una continuïtat falla, no la reparis immediatament: escolta què queda sostenint el temps.',state:'provisional',stratum:'Sediment verbal',context:'Error fèrtil I · Compost',origin:'Archivum · sediment verbal',certainty:'provisional'},
{text:'El Còdex proposa. La persona decideix. La discrepància roman oberta. L’experiència transforma. El Còdex recorda.',state:'canonical',stratum:'Sediment verbal',context:'Impuls Operatiu 1.2',origin:'Archivum · sediment verbal',certainty:'declared'},
{text:'Percebre no equival a interpretar; interpretar no equival a decidir; proposar no equival a executar.',state:'emergent',stratum:'Sediment verbal',context:'Impuls / KREATOR',origin:'Archivum · sediment verbal',certainty:'emergent'},
{text:'La discrepància entre la proposta del Còdex i la decisió humana es conserva sense decidir immediatament qui tenia raó.',state:'emergent',stratum:'Sediment verbal',context:'Impuls / decisió humana',origin:'Archivum · sediment verbal',certainty:'emergent'},
{text:'Ruta simple, directa i reversible; una desviació només es justifica per una funció perceptible o operativa clara.',state:'canonical',stratum:'Vocabulari Viu',context:'Occam',origin:'Archivum · sediment verbal',certainty:'declared'},
{text:'Tot ordre esdevé caos natural i, naturalment, el caos esdevé el seu ordre.',state:'canonical',stratum:'Sediment verbal',context:'Ordre / caos',origin:'Archivum · sediment verbal',certainty:'declared'},
{text:'El caos no és l’absència d’ordre: és l’ordre abans de reconèixer-se.',state:'emergent',stratum:'Glossae Vivens',context:'Glossa d’ordre / caos',origin:'Arqueologia verbal 1.0',certainty:'recovered'},
{text:'IMPULS apareix. MASTER és invocat. LOCUTUS formula. KREATOR decideix. MUTATIO transforma. El Còdex recorda.',state:'canonical',stratum:'Latinismes',context:'Arquitectura constitucional',origin:'Archivum · sediment verbal',certainty:'declared'},
{text:'RECORDARE captura. Archivum conserva. La memòria relaciona. KREATOR decideix què significa.',state:'provisional',stratum:'Latinismes',context:'RECORDARE',origin:'Governança RECORDARE 1.0',certainty:'provisional'},
{text:'Ítaca no era un lugar, era un temblor.',state:'emergent',stratum:'Sediment verbal',context:'Ítaca · Teatre del Tremolor · Silenci',origin:'Arqueologia verbal 1.0',certainty:'recovered'},
{text:'Creativitum nunc Pacevem.',state:'emergent',stratum:'Latinismes',context:'Brodsky · Creativitat',origin:'Arqueologia verbal 1.0',certainty:'recovered'},
{text:'No fusionaria el contingut financer amb l’univers artístic; fusionaria la gramàtica operativa.',state:'emergent',stratum:'Glossae Vivens',context:'Longbridge · metabolització',origin:'Arqueologia verbal 1.0',certainty:'recovered'},
{text:'El Looperum ha de poder crear bucles a partir d’altres fonts o del seu propi Arxiu, i el seu comportament ha de ser el mateix Còdex.',state:'emergent',stratum:'Vocabulari Viu',context:'Looperum · Archivum',origin:'Arqueologia verbal 1.0',certainty:'recovered'},
{text:'La desaparició d’una direcció modifica realment l’escolta i una decisió posterior.',state:'emergent',stratum:'Sediment verbal',context:'Travessa β·02',origin:'Arqueologia verbal 1.0',certainty:'recovered'},
{text:'Qualsevol persona amb impuls de crear.',state:'emergent',stratum:'Sediment verbal',context:'Guia personal',origin:'Arqueologia verbal 1.0',certainty:'approved'},
{text:'La Formiga apareix quan ens apropem a alguna cosa que pot funcionar.',state:'emergent',stratum:'Vocabulari Viu',context:'Formiga · relacions',origin:'Arqueologia verbal 1.0',certainty:'recovered'},
{text:'Una relació no és una fusió.',state:'emergent',stratum:'Glossae Vivens',context:'INTER NOS · navegació relacional',origin:'Arqueologia verbal 1.0',certainty:'condensed'},
{text:'El silenci també és un estat operatiu.',state:'emergent',stratum:'Vocabulari Viu',context:'quiet · universe/impuls.js',origin:'GitHub + Arqueologia verbal 1.0',certainty:'confirmed'},
{text:'La convergència no és certesa.',state:'emergent',stratum:'Glossae Vivens',context:'Formiga · CONFLUENTIA',origin:'GitHub + Arqueologia verbal 1.0',certainty:'confirmed'},
{text:'STRATUM',state:'provisional',stratum:'Latinismes',context:'Instrumentum Archaeologiae · Corpus instrumentalis',origin:'governanca/STRATUM_1.0.md',certainty:'constituted'},
{text:'Excavar és recuperar sense substituir, relacionar sense fusionar i mostrar la genealogia sense decidir-ne el sentit.',state:'provisional',stratum:'Sediment verbal',context:'STRATUM 1.0',origin:'governanca/STRATUM_1.0.md',certainty:'constituted'}
];
const normalize=s=>(s||'').toLocaleLowerCase('ca').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const strata=[...new Set(CORPUS.map(x=>x.stratum))]; let active='Tots';
const $=s=>document.querySelector(s), results=$('#results'),status=$('#status'),q=$('#q'),bar=$('#strata');
function renderFilters(){bar.innerHTML=['Tots',...strata].map(s=>`<button type="button" data-s="${s}" aria-pressed="${s===active}">${s}</button>`).join('');bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{active=b.dataset.s;renderFilters();excavate();});}
function score(item,terms){const hay=normalize([item.text,item.context,item.origin,item.stratum,item.state,item.certainty].join(' '));return terms.reduce((n,t)=>n+(hay.includes(t)?1:0),0)}
function excavate(){const raw=q.value.trim();const terms=normalize(raw).split(/\s+/).filter(Boolean);if(!terms.length){results.innerHTML='';status.textContent='Escriu una paraula o una frase. STRATUM mostrarà només allò que pot rastrejar.';return;}let found=CORPUS.map(x=>({...x,_score:score(x,terms)})).filter(x=>x._score>0&&(active==='Tots'||x.stratum===active)).sort((a,b)=>b._score-a._score);status.textContent=`${found.length} estrat${found.length===1?'':'s'} recuperat${found.length===1?'':'s'} · consulta: “${raw}” · cap resultat modifica l’original.`;results.innerHTML=found.length?found.map(x=>`<article class="card"><div class="meta"><span class="tag">${x.stratum}</span><span class="tag state-${x.state}">${x.state}</span><span class="tag">${x.certainty}</span></div><p class="quote">${x.text}</p><p class="context">${x.context}</p><p class="prov">provenance · ${x.origin}</p></article>`).join(''):`<div class="empty">Cap estrat rastrejable. STRATUM no omple el buit: prova una altra formulació o incorpora provenance abans de relacionar.</div>`;window.dispatchEvent(new CustomEvent('codex:stratum-excavated',{detail:{query:raw,count:found.length,stratum:active}}));}
$('#searchForm').addEventListener('submit',e=>{e.preventDefault();excavate()});
const params=new URLSearchParams(location.search);if(params.get('q'))q.value=params.get('q');renderFilters();if(q.value)excavate();
window.Stratum={excavate:(query)=>{q.value=query||'';excavate();},corpus:()=>CORPUS.map(x=>({...x}))};
})();
