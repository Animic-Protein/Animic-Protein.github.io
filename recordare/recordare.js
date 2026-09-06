(()=>{
  'use strict';
  const $=s=>document.querySelector(s);
  const params=new URLSearchParams(location.search),embedded=params.get('embed')==='1';
  const INDEX_KEY='animic.recordare.metadata/v1';
  let recorder=null,stream=null,chunks=[],startedAt=0,tick=null,blobUrl=null,lastDetail=null;
  const start=$('#start'),pause=$('#pause'),stop=$('#stop'),state=$('#state'),timer=$('#timer'),orb=$('#orb'),capture=$('#capture'),audio=$('#audio'),facts=$('#facts'),download=$('#download'),indexMetadata=$('#indexMetadata'),indexStatus=$('#indexStatus');
  if(params.get('context'))$('#context').value=params.get('context');
  const now=()=>new Date().toISOString();
  const fmt=ms=>{const s=Math.floor(ms/1000),m=Math.floor(s/60);return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
  const readIndex=()=>{try{const v=JSON.parse(localStorage.getItem(INDEX_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const writeIndex=items=>{try{localStorage.setItem(INDEX_KEY,JSON.stringify(items.slice(-250)));return true}catch{return false}};
  function safeMetadata(detail){return {
    id:detail.id,name:detail.name,capturedAt:detail.provenance?.capturedAt||now(),duration:detail.duration,mimeType:detail.mimeType,size:detail.size,
    source:{kind:'media',mediaKind:'audio'},context:detail.context,node:detail.node,invokedBy:detail.invokedBy,consent:Boolean(detail.consent),
    storageRef:detail.storageRef||null,localOnly:true,canonical:false,
    provenance:{kind:'recordare-capture',capturedAt:detail.provenance?.capturedAt||now(),reversible:true,indexedAt:now(),binaryTransferred:false}
  }}
  function setTimer(){timer.textContent=fmt(Date.now()-startedAt)}
  function cleanupStream(){stream?.getTracks().forEach(t=>t.stop());stream=null;clearInterval(tick);tick=null;orb.classList.remove('live')}
  function clearCapture(){if(blobUrl)URL.revokeObjectURL(blobUrl);blobUrl=null;audio.removeAttribute('src');audio.load();capture.hidden=true;facts.textContent='';chunks=[];lastDetail=null;if(indexStatus)indexStatus.textContent=''}
  async function begin(){
    if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){state.textContent='Aquest navegador no ofereix captura MediaRecorder compatible.';return}
    clearCapture();
    try{
      stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const preferred=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(t=>MediaRecorder.isTypeSupported?.(t));
      recorder=preferred?new MediaRecorder(stream,{mimeType:preferred}):new MediaRecorder(stream);chunks=[];
      recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};recorder.onstop=finish;recorder.start(250);startedAt=Date.now();tick=setInterval(setTimer,250);setTimer();orb.classList.add('live');
      state.textContent='Capturant · el contingut encara no és memòria.';start.disabled=true;pause.disabled=false;stop.disabled=false;pause.textContent='Pausa';
      window.dispatchEvent(new CustomEvent('codex:recordare-started',{detail:{capturedAt:now(),sourceKind:'media',mediaKind:'audio',node:params.get('node')||location.pathname,invokedBy:params.get('invokedBy')||'RECORDARE · Instrument'}}));
    }catch(err){cleanupStream();state.textContent=err?.name==='NotAllowedError'?'Micròfon no autoritzat. RECORDARE no captura sense permís.':'No s’ha pogut iniciar la captura.'}
  }
  function togglePause(){if(!recorder)return;if(recorder.state==='recording'){recorder.pause();pause.textContent='Reprendre';state.textContent='Captura en pausa.'}else if(recorder.state==='paused'){recorder.resume();pause.textContent='Pausa';state.textContent='Capturant.'}}
  function end(){if(recorder&&(recorder.state==='recording'||recorder.state==='paused'))recorder.stop()}
  function finish(){
    const duration=Date.now()-startedAt,mime=recorder?.mimeType||chunks[0]?.type||'audio/webm',blob=new Blob(chunks,{type:mime});cleanupStream();blobUrl=URL.createObjectURL(blob);audio.src=blobUrl;capture.hidden=false;
    const name=$('#name').value.trim()||`RECORDARE ${new Date().toLocaleString('ca-ES')}`;download.href=blobUrl;download.download=name.replace(/[\\/:*?"<>|]+/g,'-')+(mime.includes('mp4')?'.m4a':'.webm');
    const capturedAt=now();lastDetail={id:`recordare-${Date.now().toString(36)}`,name,duration,mimeType:mime,size:blob.size,source:{kind:'media',mediaKind:'audio'},context:$('#context').value.trim(),node:params.get('node')||location.pathname,invokedBy:params.get('invokedBy')||'RECORDARE · Instrument',consent:$('#consent').checked,storageRef:null,localOnly:true,canonical:false,provenance:{kind:'recordare-capture',capturedAt,reversible:true,binaryTransferred:false}};
    facts.textContent=`índex: ${name} · ${fmt(duration)} · ${mime} · ${Math.max(1,Math.round(blob.size/1024))} KB · source.kind=media · localOnly`;
    state.textContent='Captura finalitzada · encara no conservada ni canonitzada.';start.disabled=false;pause.disabled=true;stop.disabled=true;timer.textContent=fmt(duration);
    window.dispatchEvent(new CustomEvent('codex:recordare-captured',{detail:lastDetail}));if(embedded&&window.parent!==window)window.parent.postMessage({type:'codex:recordare-captured',detail:lastDetail},location.origin);
  }
  function prepareMetadata(){
    if(!lastDetail)return;
    const metadata=safeMetadata(lastDetail),items=readIndex().filter(x=>x.id!==metadata.id);items.push(metadata);
    if(!writeIndex(items)){if(indexStatus)indexStatus.textContent='No s’han pogut conservar les metadades localment.';return}
    if(indexStatus)indexStatus.textContent='Metadades preparades per Archivum · cap binari transferit.';
    window.dispatchEvent(new CustomEvent('codex:recordare-metadata-ready',{detail:metadata}));if(embedded&&window.parent!==window)window.parent.postMessage({type:'codex:recordare-metadata-ready',detail:metadata},location.origin);
  }
  function discard(){clearCapture();timer.textContent='00:00';state.textContent='Captura descartada. Cap contingut conservat.';window.dispatchEvent(new CustomEvent('codex:recordare-discarded',{detail:{reversible:true,canonical:false}}))}
  download.addEventListener('click',()=>{if(lastDetail)lastDetail.storageRef=`device-download:${download.download}`});
  start.addEventListener('click',begin);pause.addEventListener('click',togglePause);stop.addEventListener('click',end);$('#discard').addEventListener('click',discard);indexMetadata?.addEventListener('click',prepareMetadata);
  window.addEventListener('pagehide',()=>{cleanupStream();if(blobUrl)URL.revokeObjectURL(blobUrl)});
  window.Recordare={start:begin,stop:end,discard,prepareMetadata,readMetadataIndex:readIndex,lastCapture:()=>lastDetail};
})();
