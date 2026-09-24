const constellations=[
  {title:'1 · Llavor / MUTATIO',nodes:[['llavor','Llavor / MUTATIO','Una idea entra, canvia de forma i pot tornar a sembrar-se.'],['sembra','Sembra','Conserva una possibilitat sense convertir-la en llei.'],['compost','Compost','Allò descartat continua com a nutrient reversible.'],['atzar','Atzar','Desvia la ruta; no decideix què és veritat.']]},
  {title:'2 · Pensament',nodes:[['arrels','Arrels','Interlocutors filosòfics, científics i poètics del Còdex.'],['aforismes','Aforismes','Condensacions que obren sistemes més grans.'],['occam','Navalla d’Occam','Ruta simple, directa i reversible.'],['incertesa','Incertesa','Sense evidència suficient: QUIET o REOBSERVE.']]},
  {title:'3 · Escolta',nodes:[['rosa','Rosa de l’Escolta','Orienta entre figura i fons sense clausurar.'],['harmonia','Harmonia Viva','Camps, tensions i pedals que respiren.'],['zajj','Zajj-viu','Improvisació, risc i escolta col·lectiva.'],['silenci','Silenci','Material actiu, no simple absència.']]},
  {title:'4 · Moviment',nodes:[['retrodansa','Retrodansa','Recorre del final cap a l’origen.'],['rastre','Rastre fantasma','Persistència perceptiva d’allò que ja no hi és.'],['cos','Cos','Lector, instrument i territori.'],['gest','Gest','Acció situada que pot deixar diferència.']]},
  {title:'5 · Univers visual',nodes:[['herbarium','Herbarium','Arxiu vegetal de formes, proves i espècies.'],['simbols','Símbols','Vocabulari visual reutilitzable i mutable.'],['rosetta','Rosetta','Traducció entre llenguatges i signes.'],['lamines','Làmines','Cartografies i peces editorials del Còdex.']]},
  {title:'6 · Continuum',nodes:[['inter-nos','INTER NOS','Allò que neix entre dos nodes sense pertànyer del tot a cap.'],['cambra','Cambra Nua del Temps','Espera sense rellotge; fa perceptible la durada.'],['relacions','Relacions','Connexions documentades, emergents o provisionals.'],['centre','Centre','Retorn abans de produir una decisió nova.']]},
  {title:'7 · Metacòdex',nodes:[['governanca','Governança','Regles de cura, participació i reversibilitat.'],['autoria','Autoria','Traça humana, col·laborativa i maquinal.'],['versions','Versions','MUTATIO sense amnèsia.'],['provenance','Traçabilitat','Reconstrueix procedència, decisions i canvis.']]}
];

const descriptions=new Map([['codex',['Còdex Viu','Centre relacional de l’organisme. Tot pot connectar-se, transformar-se i retornar sense perdre procedència.']]]);
const map=document.querySelector('#map');
const title=document.querySelector('#node-title');
const desc=document.querySelector('#node-desc');
const output=document.querySelector('#output');
const relationList=document.querySelector('#relations');
const relationField=document.querySelector('#relation-field');
const relationLine=document.querySelector('#relation-line');
const relationGlow=document.querySelector('#relation-glow');
const relateButton=document.querySelector('#relate');
const seedButton=document.querySelector('#seed');
const clearButton=document.querySelector('#clear');
const seedDialog=document.querySelector('#seed-dialog');
const storageKey='animic-cartographia-mutabilis-relations-v1';
let active='codex';
let queue=[];
let tracedPair=[];
let relations=readRelations();

for(const group of constellations){
  const section=document.createElement('section');
  section.className='constellation';
  section.innerHTML=`<h3>${group.title}</h3><div class="nodes"></div>`;
  const nodes=section.querySelector('.nodes');
  for(const [id,label,description] of group.nodes){
    descriptions.set(id,[label,description]);
    const button=document.createElement('button');
    button.type='button';button.className='node';button.dataset.node=id;button.textContent=label;
    nodes.append(button);
  }
  map.append(section);
}

map.addEventListener('click',event=>{
  const button=event.target.closest('[data-node]');
  if(!button)return;
  active=button.dataset.node;
  const [label,description]=descriptions.get(active);
  title.textContent=label;desc.textContent=description;
  document.querySelectorAll('[data-node]').forEach(node=>node.classList.toggle('active',node.dataset.node===active));
  if(queue.length===1&&queue[0]!==active)drawRelation([queue[0],active],'preview');
});

relateButton.addEventListener('click',()=>{
  if(queue.includes(active)){
    queue=queue.filter(id=>id!==active);
  }else if(queue.length<2){
    queue.push(active);
  }else{
    queue=[active];
  }
  syncQueue();
  if(queue.length===2){
    const pair=[...queue];
    const labels=pair.map(id=>descriptions.get(id)[0]);
    const known=canonicalPair(pair);
    relations.unshift({at:new Date().toISOString(),nodes:pair,state:known?'canònica':'emergent'});
    relations=relations.slice(0,24);
    localStorage.setItem(storageKey,JSON.stringify(relations));
    output.textContent=`INTER NOS · ${labels.join(' ↔ ')} · ${known?'relació canònica':'relació emergent'} · no canonitza`;
    tracedPair=pair;drawRelation(pair,known?'canonical':'emergent');
    queue=[];syncQueue();renderRelations();
  }
});

seedButton.addEventListener('click',()=>seedDialog.showModal());
document.querySelector('#keep-seed').addEventListener('click',event=>{
  const text=document.querySelector('#seed-text').value.trim();
  if(!text){event.preventDefault();return;}
  relations.unshift({at:new Date().toISOString(),nodes:[active],state:'sembrada',text});
  relations=relations.slice(0,24);
  localStorage.setItem(storageKey,JSON.stringify(relations));
  output.textContent=`Llavor sembrada a ${descriptions.get(active)[0]} · provisional i reversible`;
  document.querySelector('#seed-text').value='';renderRelations();
});
clearButton.addEventListener('click',()=>{
  relations=[];queue=[];tracedPair=[];localStorage.removeItem(storageKey);renderRelations();syncQueue();drawRelation([]);output.textContent='Relacions locals retirades.';
});

function canonicalPair(pair){
  const key=[...pair].sort().join('|');
  return new Set(['cambra|silenci','inter-nos|relacions','compost|llavor','autoria|provenance','rosa|zajj']).has(key);
}
function syncQueue(){
  document.querySelectorAll('[data-node]').forEach(node=>node.classList.toggle('queued',queue.includes(node.dataset.node)));
  if(queue.length===1){
    output.textContent=`Primer node: ${descriptions.get(queue[0])[0]}. Tria un segon node i prem Relaciona.`;
    if(queue[0]===active)drawRelation([]);
  }else if(queue.length===0&&!relations.length){
    output.textContent='Cap relació activa.';drawRelation([]);
  }else if(queue.length===0&&tracedPair.length===2){
    drawRelation(tracedPair,canonicalPair(tracedPair)?'canonical':'emergent');
  }
}
function drawRelation(pair,state='emergent'){
  if(pair.length!==2){relationField.classList.remove('visible','canonical');return;}
  const nodes=pair.map(id=>map.querySelector(`[data-node="${id}"]`));
  if(nodes.some(node=>!node))return;
  const mapBox=map.getBoundingClientRect();
  const points=nodes.map(node=>{const box=node.getBoundingClientRect();return {x:box.left+box.width/2-mapBox.left,y:box.top+box.height/2-mapBox.top};});
  for(const line of [relationGlow,relationLine]){
    line.setAttribute('x1',points[0].x);line.setAttribute('y1',points[0].y);
    line.setAttribute('x2',points[1].x);line.setAttribute('y2',points[1].y);
  }
  relationField.classList.toggle('canonical',state==='canonical');
  relationField.classList.add('visible');
}
function readRelations(){
  try{const value=JSON.parse(localStorage.getItem(storageKey)||'[]');return Array.isArray(value)?value:[]}catch{return []}
}
function renderRelations(){
  document.querySelectorAll('[data-node]').forEach(node=>node.classList.remove('remembered'));
  clearButton.disabled=!relations.length;
  if(!relations.length){relationList.innerHTML='<li class="empty">Encara no hi ha cap relació local.</li>';return;}
  const latestPair=relations.find(item=>item.nodes?.length===2);
  if(latestPair){
    tracedPair=[...latestPair.nodes];
    tracedPair.forEach(id=>map.querySelector(`[data-node="${id}"]`)?.classList.add('remembered'));
    requestAnimationFrame(()=>drawRelation(tracedPair,latestPair.state==='canònica'?'canonical':'emergent'));
  }
  relationList.replaceChildren(...relations.map(item=>{
    const li=document.createElement('li');
    const labels=item.nodes.map(id=>descriptions.get(id)?.[0]||id).join(' ↔ ');
    const content=document.createElement('span');content.textContent=item.text?`${labels} · ${item.text}`:labels;
    const state=document.createElement('b');state.textContent=item.state;
    li.append(content,state);return li;
  }));
}

window.addEventListener('resize',()=>{if(tracedPair.length===2)drawRelation(tracedPair,canonicalPair(tracedPair)?'canonical':'emergent')});
renderRelations();
