import {CONDITIONS} from '../diferencia-perceptible/protocol.mjs';

export const LIMEN_SCHEMA='animic.codex.limen/v1';
export const MODULES=Object.freeze(['integrated','ATTENTIO','RETENTIO','DISCRIMEN','QUIES','METACOGNITIO']);
export const PHASES=Object.freeze(['baseline','interval','change','return','reflect','reveal']);
const RESPONSES=new Set(['noticed','not-noticed','uncertain']);

export function createSession({module='integrated',conditionId='absence',focus='form'}={}){
  if(!MODULES.includes(module))throw new TypeError('Mòdul LIMEN desconegut.');
  if(!CONDITIONS[conditionId])throw new TypeError('Condició desconeguda.');
  if(!['form','position','relation'].includes(focus))throw new TypeError('Orientació desconeguda.');
  return Object.freeze({schema:LIMEN_SCHEMA,module,conditionId,focus,phase:'baseline',response:null,observation:'',interpretation:'',reobservations:0});
}
export function advance(session){
  const i=PHASES.indexOf(session.phase);
  if(i<0||i>=PHASES.length-2)return session;
  return Object.freeze({...session,phase:PHASES[i+1]});
}
export function respond(session,{response,observation='',interpretation=''}={}){
  if(session.phase!=='reflect')throw new Error('La resposta només s’accepta després de l’observació.');
  if(!RESPONSES.has(response))throw new TypeError('Resposta d’observació desconeguda.');
  return Object.freeze({...session,phase:'reveal',response,observation:String(observation).slice(0,500),interpretation:String(interpretation).slice(0,500)});
}
export function reobserve(session){
  return Object.freeze({...createSession({module:session.module,conditionId:session.conditionId,focus:session.focus}),reobservations:Number(session.reobservations||0)+1});
}
export function createTrace(session,createdAt=new Date().toISOString(),differenceLabel=''){
  if(session.phase!=='reveal'||!session.response)throw new Error('Cal una resposta humana abans d’exportar el rastre.');
  return {
    schema:LIMEN_SCHEMA,
    id:'limen-'+Date.parse(createdAt).toString(36),
    type:'perceptual-practice',
    source:{id:'limen',path:'experiments/limen/',canonical:false},
    practice:{module:session.module,condition:session.conditionId,attentionFocus:session.focus,sequence:['baseline','interval','change','return'],reobservations:session.reobservations},
    reflection:{reportedPerception:session.response,observation:session.observation,interpretation:session.interpretation,disclosedDifference:differenceLabel},
    humanDecision:'return',
    effect:{transformed:false},
    provenance:{createdAt,reversible:true,canonical:false,persistence:'user-initiated-download'}
  };
}
