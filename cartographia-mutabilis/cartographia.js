const constellations=[
  {title:'1 · Llavor / MUTATIO',nodes:[['llavor','Llavor / MUTATIO','Una idea entra, canvia de forma i pot tornar a sembrar-se.'],['sembra','Sembra','Conserva una possibilitat sense convertir-la en llei.'],['compost','Compost','Allò descartat continua com a nutrient reversible.'],['atzar','Atzar','Desvia la ruta; no decideix què és veritat.']]},
  {title:'2 · Pensament',nodes:[['arrels','Arrels','Interlocutors filosòfics, científics i poètics del Còdex.'],['aforismes','Aforismes','Condensacions que obren sistemes més grans.'],['occam','Navalla d’Occam','Ruta simple, directa i reversible.'],['incertesa','Incertesa','Sense evidència suficient: QUIET o REOBSERVE.']]},
  {title:'3 · Escolta',nodes:[['rosa','Rosa de l’Escolta','Orienta entre figura i fons sense clausurar.'],['harmonia','Harmonia Viva','Camps, tensions i pedals que respiren.'],['zajj','Zajj-viu','Improvisació, risc i escolta col·lectiva.'],['silenci','Silenci','Material actiu, no simple absència.']]},
  {title:'4 · Moviment',nodes:[['retrodansa','Retrodansa','Recorre del final cap a l’origen.'],['rastre','Rastre fantasma','Persistència perceptiva d’allò que ja no hi és.'],['cos','Cos','Lector, instrument i territori.'],['gest','Gest','Acció situada que pot deixar diferència.']]},
  {title:'5 · Univers visual',nodes:[['herbarium','Herbarium','Arxiu vegetal de formes, proves i espècies.'],['simbols','Símbols','Vocabulari visual reutilitzable i mutable.'],['rosetta','Rosetta','Traducció entre llenguatges i signes.'],['lamines','Làmines','Cartografies i peces editorials del Còdex.']]},
  {title:'6 · Continuum',nodes:[['inter-nos','INTER NOS','Allò que neix entre dos nodes sense pertànyer del tot a cap.'],['cambra','Cambra Nua del Temps','Espera sense rellotge; fa perceptible la durada.'],['relacions','Relacions','Connexions documentades, emergents o provisionals.'],['centre','Centre','Retorn abans de produir una decisió nova.']]},
  {title:'7 · Metacòdex',nodes:[['governanca','Governança','Regles de cura, participació i reversibilitat.'],['autoria','Autoria','Traça humana, col·laborativa i maquinal.'],['versions','Versions','MUTATIO sense amnèsia.'],['provenance','Traçabilitat','Reconstrueix procedència, decisions i canvis.']]}
];

const relationTypes={
  resonance:{label:'ressonància activa',css:'resonance'},
  causality:{label:'causalitat',css:'causality'},
  hypothesis:{label:'hipòtesi',css:'hypothesis'},
  reciprocity:{label:'reciprocitat',css:'reciprocity'},
  tension:{label:'tensió fèrtil',css:'tension'}
};
const descriptions=new Map([['codex',['Còdex Viu','Centre relacional de l’organisme. Tot pot connectar-se, transformar-se i retornar sense perdre procedència.']]]);
const map=document.querySelector('#map');
const title=document.querySelector('#node-title');
const desc=document.querySelector('#node-desc');
const output=document.querySelector('#output');
const selection=document.querySelector('#selection');
const relationList=document.querySelector('#relations');
const relationField=document.querySelector('#relation-field');
const relationLine=document.querySelector('#relation-line');
const relationGlow=document.querySelector('#relation-glow');
const relationType=document.querySelector('#relation-type');
const relateButton=document.querySelector('#relate');
const pairButton=document.querySelector('#keep-pair');
const proposeButton=document.querySelector('#propose-figure');
const seedButton=document.querySelector('#seed');
const clearButton=document.querySelector('#clear');
const seedDialog=document.querySelector('#seed-dialog');
const figureDialog=document.querySelector('#figure-dialog');
const figureName=document.querySelector('#figure-name');
const figureRationale=document.querySelector('#figure-rationale');
const storageKey='animic-cartographia-mutabilis-relations-v1';
let active='codex';
let queue=[];
let tracedFigure=[];
let pendingFigure=null;
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
});

relateButton.addEventListener('click',()=>{
  if(queue.includes(active))queue=queue.filter(id=>id!==active);
  else if(queue.length<5)queue.push(active);
  else output.textContent='La figura ja té cinc nodes. Retira’n un abans d’afegir-ne un altre.';
  syncQueue();
});

pairButton.addEventListener('click',()=>{
  if(queue.length!==2)return;
  const nodes=[...queue];
  const known=canonicalPair(nodes);
  const now=new Date().toISOString();
  relations.unshift({kind:'relation',at:now,nodes,state:known?'canònica':'emergent',relationType:relationType.value,provenance:{suggestedAt:now,humanDecision:'relate',decidedAt:now,source:'Cartographia Mutabilis 1.2'}});
  persist();
  output.textContent=`INTER NOS · ${nodeLabels(nodes).join(' ↔ ')} · ${relationTypes[relationType.value].label} · no canonitza`;
  tracedFigure=nodes;drawFigure(nodes,relationType.value,known);
  queue=[];syncQueue();renderRelations();
});

proposeButton.addEventListener('click',()=>{
  if(queue.length<3||queue.length>5)return;
  pendingFigure={nodes:[...queue],relationType:relationType.value,suggestedAt:new Date().toISOString()};
  document.querySelector('#figure-nodes').textContent=nodeLabels(queue).join(' · ');
  figureName.value=suggestName(queue);
  figureRationale.value='';
  figureDialog.showModal();
});

document.querySelector('#quiet-figure').addEventListener('click',event=>decideFigure(event,'quiet'));
document.querySelector('#seed-figure').addEventListener('click',event=>decideFigure(event,'relate'));

function decideFigure(event,decision){
  if(!pendingFigure)return;
  const name=figureName.value.trim();
  if(!name){event.preventDefault();figureName.focus();return;}
  const now=new Date().toISOString();
  const item={kind:'constellation',at:now,nodes:[...pendingFigure.nodes],name,text:figureRationale.value.trim(),relationType:pendingFigure.relationType,state:decision==='quiet'?'quiet':'sembrada',provenance:{suggestedAt:pendingFigure.suggestedAt,humanDecision:decision,decidedAt:now,source:'Cartographia Mutabilis 1.2'}};
  relations.unshift(item);persist();
  if(decision==='quiet'){
    output.textContent=`QUIET · «${name}» queda com a rastre no materialitzat.`;
    drawFigure([]);
  }else{
    tracedFigure=[...item.nodes];drawFigure(item.nodes,item.relationType);
    output.textContent=`Constel·lació sembrada · «${name}» · provisional i reversible.`;
  }
  queue=[];pendingFigure=null;syncQueue();renderRelations();
}

seedButton.addEventListener('click',()=>seedDialog.showModal());
document.querySelector('#keep-seed').addEventListener('click',event=>{
  const text=document.querySelector('#seed-text').value.trim();
  if(!text){event.preventDefault();return;}
  const now=new Date().toISOString();
  relations.unshift({kind:'seed',at:now,nodes:[active],state:'sembrada',text,provenance:{humanDecision:'relate',decidedAt:now,source:'Cartographia Mutabilis 1.2'}});
  persist();
  output.textContent=`Llavor sembrada a ${descriptions.get(active)[0]} · provisional i reversible`;
  document.querySelector('#seed-text').value='';renderRelations();
});

relationList.addEventListener('click',event=>{
  const button=event.target.closest('[data-remove]');
  if(!button)return;
  relations=relations.filter(item=>item.id!==button.dataset.remove);
  persist();tracedFigure=[];drawFigure([]);renderRelations();
  output.textContent='Rastre retirat de la memòria local.';
});

clearButton.addEventListener('click',()=>{
  relations=[];queue=[];tracedFigure=[];localStorage.removeItem(storageKey);renderRelations();syncQueue();drawFigure([]);output.textContent='Relacions locals retirades.';
});

function canonicalPair(pair){
  const key=[...pair].sort().join('|');
  return new Set(['cambra|silenci','inter-nos|relacions','compost|llavor','autoria|provenance','rosa|zajj']).has(key);
}
function syncQueue(){
  document.querySelectorAll('[data-node]').forEach(node=>node.classList.toggle('queued',queue.includes(node.dataset.node)));
  selection.textContent=`${queue.length} / 5 nodes seleccionats${queue.length?` · ${nodeLabels(queue).join(' · ')}`:''}`;
  pairButton.disabled=queue.length!==2;
  proposeButton.disabled=queue.length<3||queue.length>5;
  if(queue.length){
    output.textContent=queue.length===1?'Tria almenys un segon node.':queue.length===2?'Pots conservar la parella o afegir un tercer node.':'Figura possible: proposa-la perquè la persona decideixi.';
    drawFigure(queue,relationType.value);
  }else if(!relations.length){
    output.textContent='Cap relació activa.';drawFigure([]);
  }else if(tracedFigure.length>1){
    const latest=relations.find(item=>sameNodes(item.nodes,tracedFigure));
    drawFigure(tracedFigure,latest?.relationType||'resonance',latest?.state==='canònica');
  }
}
function drawFigure(nodes,type='resonance',canonical=false){
  relationField.setAttribute('class','relation-field');
  if(nodes.length<2){relationLine.setAttribute('d','');relationGlow.setAttribute('d','');return;}
  const elements=nodes.map(id=>map.querySelector(`[data-node="${id}"]`));
  if(elements.some(node=>!node))return;
  const mapBox=map.getBoundingClientRect();
  const points=elements.map(node=>{const box=node.getBoundingClientRect();return {x:box.left+box.width/2-mapBox.left,y:box.top+box.height/2-mapBox.top};});
  const path=points.map((point,index)=>`${index?'L':'M'} ${point.x} ${point.y}`).join(' ')+(points.length>2?' Z':'');
  relationLine.setAttribute('d',path);relationGlow.setAttribute('d',path);
  relationField.classList.add('visible',relationTypes[type]?.css||'resonance');
  relationField.classList.toggle('canonical',canonical);
}
function readRelations(){
  try{
    const value=JSON.parse(localStorage.getItem(storageKey)||'[]');
    if(!Array.isArray(value))return [];
    return value.map((item,index)=>({...item,id:item.id||`legacy-${item.at||index}`,kind:item.kind||(item.nodes?.length===1?'seed':'relation'),relationType:item.relationType||'resonance'}));
  }catch{return []}
}
function persist(){
  relations=relations.slice(0,24).map(item=>({...item,id:item.id||crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`}));
  localStorage.setItem(storageKey,JSON.stringify(relations));
}
function renderRelations(){
  document.querySelectorAll('[data-node]').forEach(node=>node.classList.remove('remembered'));
  clearButton.disabled=!relations.length;
  if(!relations.length){relationList.innerHTML='<li class="empty">Encara no hi ha cap relació local.</li>';return;}
  const latestVisible=relations.find(item=>item.nodes?.length>1&&item.state!=='quiet');
  if(latestVisible){
    tracedFigure=[...latestVisible.nodes];
    tracedFigure.forEach(id=>map.querySelector(`[data-node="${id}"]`)?.classList.add('remembered'));
    requestAnimationFrame(()=>drawFigure(tracedFigure,latestVisible.relationType,latestVisible.state==='canònica'));
  }
  relationList.replaceChildren(...relations.map(item=>{
    const li=document.createElement('li');
    li.className=`memory-${item.kind||'relation'} state-${item.state||'emergent'}`;
    const content=document.createElement('span');
    const labels=nodeLabels(item.nodes||[]).join(' ↔ ');
    const type=relationTypes[item.relationType]?.label;
    const heading=item.name?`«${item.name}» · ${labels}`:item.text?`${labels} · ${item.text}`:labels;
    const main=document.createElement('strong');main.textContent=heading;
    const meta=document.createElement('small');
    const decision=item.provenance?.humanDecision?` · decisió: ${item.provenance.humanDecision}`:'';
    meta.textContent=`${type||'llavor'} · ${item.state}${decision}`;
    content.append(main,meta);
    const remove=document.createElement('button');remove.type='button';remove.className='remove-trace';remove.dataset.remove=item.id;remove.textContent='Retira';remove.setAttribute('aria-label',`Retirar ${item.name||labels}`);
    li.append(content,remove);return li;
  }));
}
function nodeLabels(nodes){return nodes.map(id=>descriptions.get(id)?.[0]||id)}
function sameNodes(a=[],b=[]){return a.length===b.length&&a.every(id=>b.includes(id))}
function suggestName(nodes){
  const labels=nodeLabels(nodes).map(label=>label.replace(/\s*\/.*$/,'').replace(/^(La |El )/,'').trim());
  return `Constel·lació ${labels.slice(0,3).join(' · ')}`;
}

relationType.addEventListener('change',()=>{if(queue.length>1)drawFigure(queue,relationType.value)});
window.addEventListener('resize',()=>{if(queue.length>1)drawFigure(queue,relationType.value);else if(tracedFigure.length>1){const latest=relations.find(item=>sameNodes(item.nodes,tracedFigure));drawFigure(tracedFigure,latest?.relationType||'resonance',latest?.state==='canònica')}});
renderRelations();syncQueue();
