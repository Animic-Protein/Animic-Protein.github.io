// Archivum · sediment verbal del Còdex Viu
// Conservar no és canonitzar: cada entrada manté estat i procedència explícits.

export const ARCHIVUM_VERBAL_SCHEMA='animic.archivum.verbal/v1';
export const ARCHIVUM_VERBAL_STATES=Object.freeze(['canonical','provisional','emergent','fertile-discard']);
const clean=v=>String(v??'').trim();
const slug=v=>clean(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'fragment';

export const ARCHIVUM_VERBAL_SEED=Object.freeze([
  {id:'verbal-ecosistema-pensament',text:'El Còdex no representa el pensament: assaja condicions perquè el pensament es transformi.',state:'canonical',context:'Definició d’Ecosistema del Pensament',relations:['Còdex Viu','ANÍMIC Protein'],provenance:{origin:'project-canon',certainty:'confirmed'}},
  {id:'verbal-error-fertil-i',text:'Quan una continuïtat falla, no la reparis immediatament: escolta què queda sostenint el temps.',state:'provisional',context:'Error fèrtil I · Compost',relations:['Compost','Error Fèrtil','Cambra Nua del Temps'],provenance:{origin:'project-canon',certainty:'confirmed'}},
  {id:'verbal-impuls-constitucional',text:'El Còdex proposa. La persona decideix. La discrepància roman oberta. L’experiència transforma. El Còdex recorda.',state:'canonical',context:'Impuls Operatiu 1.2',relations:['Impuls Operatiu','KREATOR','provenance'],provenance:{origin:'governanca/IMPULS_OPERATIU_1.0.md',certainty:'confirmed'}},
  {id:'verbal-percebre-interpretar-decidir',text:'Percebre no equival a interpretar; interpretar no equival a decidir; proposar no equival a executar.',state:'emergent',context:'Auditoria de suggestKreator1Impulse() · PR #68',relations:['Incertesa','Impuls Operatiu','decisió humana'],provenance:{origin:'audit-pr-68',certainty:'emergent'}},
  {id:'verbal-divergencia-viva',text:'La discrepància entre la proposta del Còdex i la decisió humana es conserva sense decidir immediatament qui tenia raó.',state:'emergent',context:'PR #68 · candidata a Error Fèrtil',relations:['Error Fèrtil','suggestedImpulse','humanDecision'],provenance:{origin:'audit-pr-68',certainty:'emergent'}},
  {id:'verbal-occam',text:'Ruta simple, directa i reversible; una desviació només es justifica per una funció perceptible o operativa clara.',state:'canonical',context:'Navalla d’Occam aplicada al Còdex Viu',relations:['Occam','reversibilitat'],provenance:{origin:'project-canon',certainty:'confirmed'}},
  {id:'verbal-rastre-fantasma',text:'L’acte desapareix; el rastre declara qui n’ha assumit el cost i quin fruit ha quedat.',state:'emergent',context:'Rastre fantasma · formulació històrica recuperada',relations:['Rastre fantasma','provenance'],provenance:{origin:'conversation-history',certainty:'recovered'}},
  {id:'verbal-ordre-caos',text:'Tot ordre esdevé caos natural i, naturalment, el caos esdevé el seu ordre.',state:'canonical',context:'AEQ·I · ordre/caos',relations:['AEQ·I','Carpetes Vives'],provenance:{origin:'conversation-history',certainty:'approved'}},
  {id:'verbal-caos-glossa',text:'El caos no és l’absència d’ordre: és l’ordre abans de reconèixer-se.',state:'emergent',context:'Glossa històrica AEQ·I',relations:['AEQ·I','ordre','caos'],provenance:{origin:'conversation-history',certainty:'recovered'}},
  {id:'verbal-harmonia',text:'L’harmonia és l’art de conviure en la diferència. El pedal recorda; la retroharmonia retorna; l’harmonia inversa interroga el reflex.',state:'emergent',context:'Harmonia Viva · formulació recuperada',relations:['Harmonia Viva','retroharmonia'],provenance:{origin:'conversation-history',certainty:'recovered'}}
]);

export function createVerbalItem({text,state='emergent',context='',relations=[],origin='human-capture',certainty='declared'}={}){
  const phrase=clean(text);
  if(!phrase)throw new Error('Cal una frase per conservar a Archivum.');
  if(!ARCHIVUM_VERBAL_STATES.includes(state))throw new Error('Estat verbal no reconegut.');
  const rels=[...new Set((Array.isArray(relations)?relations:String(relations||'').split(',')).map(clean).filter(Boolean))];
  return {id:`verbal-${slug(phrase)}-${Date.now().toString(36)}`,text:phrase,state,context:clean(context),relations:rels,provenance:{origin:clean(origin)||'human-capture',certainty:clean(certainty)||'declared'}};
}

export function verbalArchiveEntry(item){
  return {
    id:item.id,
    savedAt:Date.now(),
    name:item.text,
    kind:'verbal-fragment',
    tags:['sediment-verbal',item.state,...item.relations],
    note:item.context,
    verbal:{schema:ARCHIVUM_VERBAL_SCHEMA,text:item.text,state:item.state,context:item.context,relations:item.relations,provenance:item.provenance},
    technicalSheet:{title:item.text,description:item.context,instrument:'Archivum · sediment verbal',relations:item.relations.join(', '),sourceNote:`${item.provenance.origin} · ${item.provenance.certainty}`},
    record:{source:{id:`source-${item.id}`,kind:'generated',name:'Sediment verbal del Còdex'},fragment:{id:item.id,kind:'verbal-fragment',description:item.text},provenance:{originId:item.provenance.origin,createdBy:'ANÍMIC Protein / Còdex Viu',reversible:true,history:[{at:new Date().toISOString(),action:'archivum.verbal.preserved',state:item.state}]}}
  };
}

export async function captureVerbalFragment(saveArchiveEntry,input={}){
  const item=createVerbalItem(input);
  return saveArchiveEntry(verbalArchiveEntry(item));
}

export async function seedVerbalArchivum(saveArchiveEntry,loadArchiveEntries){
  const existing=await loadArchiveEntries().catch(()=>[]);
  const ids=new Set(existing.map(x=>x.id));
  let added=0;
  for(const item of ARCHIVUM_VERBAL_SEED){if(ids.has(item.id))continue;await saveArchiveEntry(verbalArchiveEntry(item));added++}
  return {added,total:ARCHIVUM_VERBAL_SEED.length};
}

export function exportVerbalArchivum(entries,{states=ARCHIVUM_VERBAL_STATES}={}){
  const allowed=new Set(states);
  return entries.filter(e=>e.verbal&&allowed.has(e.verbal.state)).map(e=>({id:e.id,text:e.verbal.text,state:e.verbal.state,context:e.verbal.context,relations:e.verbal.relations,provenance:e.verbal.provenance}));
}
