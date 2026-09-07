(()=>{
'use strict';
const VERSION='SONUS 0.1';
const q=s=>document.querySelector(s);
const num=s=>{const n=parseFloat(String(s||'').replace('s',''));return Number.isFinite(n)?n:null};
const activeRate=()=>Number(q('.rate.active')?.dataset?.rate||1);
const activeMode=()=>q('#versarium.active')?'versarium':q('#reverse.active')?'reverse':q('#loop.active')?'loop':'forward';
const source=()=>{const f=q('#file')?.files?.[0];return f?{kind:'media',name:f.name,mime:f.type||'application/octet-stream',size:f.size,lastModified:f.lastModified}:{kind:'media',name:null,mime:null,size:null,lastModified:null}};
function snapshot(trigger='manual'){
 const phenomenon={
  kind:'generated-phenomenon',generator:'SONUS',generatorVersion:VERSION,instrument:'Looperum',
  operation:activeMode(),parameters:{in:num(q('#inLabel')?.textContent),out:num(q('#outLabel')?.textContent),rate:activeRate()},
  source:source(),authorization:'human-interaction',trigger,canonical:false,reversible:true,decided:false,generatedAt:new Date().toISOString()
 };
 window.dispatchEvent(new CustomEvent('codex:generated-phenomenon',{detail:phenomenon}));
 if(window.parent!==window)window.parent.postMessage({type:'codex:generated-phenomenon',detail:phenomenon},location.origin);
 try{localStorage.setItem('animic.codex.last-generated-phenomenon',JSON.stringify(phenomenon));}catch{}
 return phenomenon;
}
function install(){
 const status=q('#status');if(status&&!q('#generatoriumState')){const p=document.createElement('p');p.id='generatoriumState';p.className='status';p.textContent='GENERATORIUM · SONUS 0.1 · espera una acció humana.';status.insertAdjacentElement('afterend',p);}
 ['#play','#loop','#reverse','#versarium'].forEach(sel=>q(sel)?.addEventListener('click',()=>setTimeout(()=>{const x=snapshot(sel.slice(1));const p=q('#generatoriumState');if(p)p.textContent=`GENERATORIUM · ${x.operation} · fenomen efímer emès · reversible · no canònic.`;},0)));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.GeneratoriumSonus={version:VERSION,snapshot};
})();
