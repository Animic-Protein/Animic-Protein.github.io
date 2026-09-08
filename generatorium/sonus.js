(()=>{
'use strict';
const VERSION='SONUS 1.0';
const q=s=>document.querySelector(s);
const num=s=>{const n=parseFloat(String(s||'').replace('s',''));return Number.isFinite(n)?n:null};
const activeRate=()=>Number(q('.rate.active')?.dataset?.rate||1);
const activeMode=()=>q('#versarium.active')?'versarium':q('#reverse.active')?'reverse':q('#loop.active')?'loop':'forward';
const source=()=>{const f=q('#file')?.files?.[0];return f?{kind:'media',name:f.name,mime:f.type||'application/octet-stream',size:f.size,lastModified:f.lastModified}:{kind:'media',name:null,mime:null,size:null,lastModified:null}};
const context=()=>({hasSource:Boolean(q('#file')?.files?.[0]),mode:activeMode(),rate:activeRate(),in:num(q('#inLabel')?.textContent),out:num(q('#outLabel')?.textContent)});
function suggest(){
 const c=context();
 if(!c.hasSource)return{action:'quiet',basis:'No hi ha matèria sonora atribuïda.',certainty:'high'};
 if(c.in!==null&&c.out!==null&&c.out<=c.in)return{action:'reobserve',basis:'El fragment temporal encara no té una extensió executable clara.',certainty:'high'};
 if(c.mode==='forward'&&c.rate===1)return{action:'quiet',basis:'La font ja pot ser escoltada sense transformació.',certainty:'medium'};
 return{action:'generate',basis:`Hi ha una possibilitat perceptible en ${c.mode} a velocitat ${c.rate}.`,certainty:'medium'};
}
function snapshot(trigger='manual'){
 const phenomenon={kind:'generated-phenomenon',generator:'SONUS',generatorVersion:VERSION,instrument:'Looperum',operation:activeMode(),parameters:{in:num(q('#inLabel')?.textContent),out:num(q('#outLabel')?.textContent),rate:activeRate()},source:source(),authorization:'human-interaction',trigger,canonical:false,reversible:true,decided:false,generatedAt:new Date().toISOString()};
 window.dispatchEvent(new CustomEvent('codex:generated-phenomenon',{detail:phenomenon}));
 if(window.parent!==window)window.parent.postMessage({type:'codex:generated-phenomenon',detail:phenomenon},location.origin);
 try{localStorage.setItem('animic.codex.last-generated-phenomenon',JSON.stringify(phenomenon));}catch{}
 return phenomenon;
}
function install(){
 const status=q('#status');if(status&&!q('#generatoriumState')){const p=document.createElement('p');p.id='generatoriumState';p.className='status';p.textContent='GENERATORIUM · SONUS 1.0 · pot generar, reobservar o callar. La persona decideix.';status.insertAdjacentElement('afterend',p);}
 const refresh=()=>{const s=suggest(),p=q('#generatoriumState');if(p)p.textContent=`GENERATORIUM · ${s.action.toUpperCase()} · ${s.basis} · proposta reversible · no canònica.`;window.dispatchEvent(new CustomEvent('codex:sonus-suggestion',{detail:{...s,generator:'SONUS',generatorVersion:VERSION,suggested:true,executed:false,at:new Date().toISOString()}}));return s};
 ['#file','#in','#out'].forEach(sel=>q(sel)?.addEventListener('change',refresh));
 ['#play','#loop','#reverse','#versarium'].forEach(sel=>q(sel)?.addEventListener('click',()=>setTimeout(()=>{const x=snapshot(sel.slice(1));const p=q('#generatoriumState');if(p)p.textContent=`GENERATORIUM · ${x.operation} · fenomen efímer emès per decisió humana · reversible · no canònic.`;},0)));
 setTimeout(refresh,0);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.GeneratoriumSonus={version:VERSION,snapshot,suggest,context};
})();
