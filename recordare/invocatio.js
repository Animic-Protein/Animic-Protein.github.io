(()=>{
  'use strict';
  if(window.RecordareInvocatio)return;
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const root=()=>{const parts=location.pathname.split('/').filter(Boolean);return parts.length?'../'.repeat(parts.length):'./'};
  const context=()=>({path:location.pathname,organ:clean(document.querySelector('#organName')?.textContent||document.querySelector('[data-current-organ]')?.textContent||document.querySelector('h1')?.textContent||document.title||'Còdex Viu'),invokedBy:'RECORDARE · Invocatio',canonical:false,reversible:true});
  let panel=null,button=null,lastCapture=null,lastMetadata=null;
  function mount(){
    if(button||location.pathname.includes('/recordare/'))return;
    const style=document.createElement('style');style.textContent='.recordare-invoke{position:fixed;z-index:2147482998;right:max(14px,env(safe-area-inset-right));bottom:max(58px,calc(env(safe-area-inset-bottom) + 56px));border:1px solid #00c8ff;border-radius:999px;background:#07131dee;color:#dff8ff;padding:9px 13px;font:700 12px/1 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 8px 30px #0008}.recordare-panel[hidden]{display:none}.recordare-panel{position:fixed;inset:0;z-index:2147483100;background:#02070ce8;display:grid;place-items:center;padding:14px}.recordare-shell{width:min(760px,100%);height:min(760px,92svh);border:1px solid #00c8ff66;border-radius:22px;background:#07111b;overflow:hidden;position:relative;box-shadow:0 30px 100px #000b}.recordare-shell iframe{width:100%;height:100%;border:0}.recordare-close{position:absolute;z-index:2;top:10px;right:10px;width:36px;height:36px;border-radius:50%;border:1px solid #ffffff44;background:#07111bdd;color:white;font-size:20px}';document.head.append(style);
    button=document.createElement('button');button.type='button';button.className='recordare-invoke';button.textContent='RECORDARE';button.title='Invocar RECORDARE sense abandonar aquest context';
    panel=document.createElement('div');panel.className='recordare-panel';panel.hidden=true;panel.innerHTML='<div class="recordare-shell"><button class="recordare-close" aria-label="Tancar RECORDARE">×</button><iframe title="RECORDARE · Invocatio" allow="microphone"></iframe></div>';document.body.append(button,panel);
    button.onclick=open;panel.querySelector('.recordare-close').onclick=close;panel.addEventListener('click',e=>{if(e.target===panel)close()});window.addEventListener('message',receive);
  }
  function open(){const c=context(),q=new URLSearchParams({embed:'1',context:c.organ,node:c.path,invokedBy:c.invokedBy});panel.querySelector('iframe').src=root()+'recordare/?'+q;panel.hidden=false;window.dispatchEvent(new CustomEvent('codex:recordare-invoked',{detail:c}))}
  function close(){if(!panel)return;panel.hidden=true;panel.querySelector('iframe').src='about:blank';button?.focus()}
  function receive(e){
    if(e.origin!==location.origin)return;
    if(e.data?.type==='codex:recordare-captured'){lastCapture={...e.data.detail,returnedTo:location.pathname,receivedAt:new Date().toISOString()};window.dispatchEvent(new CustomEvent('codex:recordare-returned',{detail:lastCapture}))}
    if(e.data?.type==='codex:recordare-metadata-ready'){lastMetadata={...e.data.detail,returnedTo:location.pathname,receivedAt:new Date().toISOString()};window.dispatchEvent(new CustomEvent('codex:recordare-metadata-ready',{detail:lastMetadata}))}
  }
  window.RecordareInvocatio={open,close,lastCapture:()=>lastCapture,lastMetadata:()=>lastMetadata,context};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();