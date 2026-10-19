export const ACTOR_KINDS=Object.freeze(['human','artificial']);

export function normalizeActorKind(value){
  return ACTOR_KINDS.includes(value)?value:null;
}

export function authorizeHumanDecision({actorKind,kreatorStatus}={}){
  const normalized=normalizeActorKind(actorKind);
  if(!normalized)return{accepted:false,reason:'invalid-actor-kind',humanDecision:null};
  if(!kreatorStatus||kreatorStatus==='pending')return{accepted:false,reason:'kreator-pending',humanDecision:null};
  if(normalized!=='human')return{accepted:false,reason:'actor-not-human',humanDecision:null};
  return{accepted:true,reason:null,humanDecision:{actorKind:'human',status:'resolved'}};
}
