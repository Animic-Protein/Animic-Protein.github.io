export const createSession=()=>({decision:null,rejected:null,authorizedDecision:null,mutation:null,ended:false,events:[]});

const OPTIONS=new Set(['accept','reject','other','quiet','transform','stop']);

export function recordDecision(state,choice,otherRoute=''){
  if(state.ended||state.mutation||!OPTIONS.has(choice)||(choice==='other'&&!otherRoute.trim()))return state;
  const next={...state,decision:choice,events:[...state.events,{at:new Date().toISOString(),previousDecision:state.decision,choice,otherRoute:['reject','other'].includes(choice)?(otherRoute.trim()||null):null}]};
  if(choice==='reject'){
    next.rejected='La proposta REOBSERVAR ha estat rebutjada explícitament.';
    next.authorizedDecision='Rebuig explícit de REOBSERVAR; cap altra acció autoritzada';
  }else if(choice==='other'){
    next.authorizedDecision=`Rebuig de REOBSERVAR; ruta triada explícitament: ${otherRoute.trim()}`;
  }else if(choice==='accept'){
    next.authorizedDecision='Continuar amb REOBSERVAR; cap transformació autoritzada';
  }else if(choice==='quiet'){
    next.authorizedDecision='Quedar-se en quietud; cap transformació autoritzada';
  }else if(choice==='transform'){
    next.authorizedDecision='Transformar; manca autoritzar una acció exacta';
  }else{
    next.authorizedDecision='Aturar la prova; cap transformació autoritzada';
    next.ended=true;
  }
  return next;
}

export function authorizeTransformation(state,exactChange){
  const exact=exactChange.trim();
  if(state.ended||state.mutation||state.decision!=='transform'||!exact)return state;
  return {...state,mutation:exact,authorizedDecision:`Autorització explícita de la persona per registrar el canvi exacte: ${exact}`};
}
