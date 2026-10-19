(() => {
  'use strict';

  const SOURCE = Object.freeze({id:'eco-01-pulse',kind:'generated',frequencyHz:440,durationMs:240,constant:true});
  const DB_NAME = 'codex-eco-01';
  const DB_VERSION = 1;
  const STORE = 'captures';
  const TRACE_ID = 'trace';
  const TRACE_KEY = 'codex:eco-01:last-trace';
  const cards = [...document.querySelectorAll('.space')];
  const captures = [null,null,null];
  const objectUrls = [];
  let audioContext;
  let traceUrl = '';
  let dbPromise;

  function openDb(){
    if(!('indexedDB' in window)) return Promise.reject(new Error('indexeddb-unavailable'));
    if(!dbPromise){
      dbPromise = new Promise((resolve,reject)=>{
        const req=indexedDB.open(DB_NAME,DB_VERSION);
        req.onupgradeneeded=()=>{ if(!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE,{keyPath:'id'}); };
        req.onsuccess=()=>resolve(req.result);
        req.onerror=()=>reject(req.error||new Error('indexeddb-open-failed'));
      });
    }
    return dbPromise;
  }

  async function dbPut(record){
    const db=await openDb();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put(record);
      tx.oncomplete=resolve;
      tx.onerror=()=>reject(tx.error||new Error('indexeddb-write-failed'));
      tx.onabort=()=>reject(tx.error||new Error('indexeddb-write-aborted'));
    });
  }

  async function dbGet(id){
    const db=await openDb();
    return await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readonly');
      const req=tx.objectStore(STORE).get(id);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error||new Error('indexeddb-read-failed'));
    });
  }

  async function dbClear(){
    const db=await openDb();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete=resolve;
      tx.onerror=()=>reject(tx.error||new Error('indexeddb-clear-failed'));
      tx.onabort=()=>reject(tx.error||new Error('indexeddb-clear-aborted'));
    });
  }

  const preferredMime=()=>{
    if(!window.MediaRecorder) return '';
    return ['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t))||'';
  };
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function ensureSessionBanner(){
    let node=document.getElementById('sessionState');
    if(node) return node;
    node=document.createElement('div');
    node.id='sessionState';
    node.className='session-state';
    node.setAttribute('aria-live','polite');
    const spaces=document.getElementById('spaces');
    spaces?.parentElement?.insertBefore(node,spaces);
    return node;
  }

  function updateProgress(message=''){
    const count=captures.filter(Boolean).length;
    const node=ensureSessionBanner();
    node.innerHTML=`<b>Sessió ECO 01 · ${count}/3 retorns preservats</b>${message?`<span>${message}</span>`:''}`;
    if(count===3) document.getElementById('compare')?.classList.add('ready');
  }

  async function playPulse(){
    audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();
    await audioContext.resume();
    const oscillator=audioContext.createOscillator();
    const gain=audioContext.createGain();
    oscillator.frequency.value=SOURCE.frequencyHz;
    gain.gain.setValueAtTime(0.0001,audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16,audioContext.currentTime+0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001,audioContext.currentTime+SOURCE.durationMs/1000);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime+SOURCE.durationMs/1000+0.02);
    const pulse=document.getElementById('pulse');
    pulse.classList.add('live');
    setTimeout(()=>pulse.classList.remove('live'),SOURCE.durationMs+180);
  }

  document.getElementById('pulse')?.addEventListener('click',()=>playPulse().catch(()=>{}));

  function bindCapture(card,index,record,mode='restored'){
    if(captures[index]?.url) URL.revokeObjectURL(captures[index].url);
    const url=URL.createObjectURL(record.blob);
    objectUrls.push(url);
    captures[index]={
      id:record.id,sourceId:record.sourceId,spaceLabel:record.spaceLabel,capturedAt:record.capturedAt,
      mimeType:record.mimeType,size:record.size,localOnly:true,canonical:false,persistedLocally:true,
      importedEvidence:!!record.importedEvidence,originalFilename:record.originalFilename||null,url
    };
    card.querySelector('audio').src=url;
    const download=card.querySelector('.download');
    download.href=url;
    download.download=`eco-01-retorn-${index+1}.${record.mimeType?.includes('mp4')?'m4a':'webm'}`;
    card.classList.add('complete');
    card.querySelector('.capture').disabled=true;
    const label=mode==='captured'?'Captura preservada':mode==='imported'?'Evidència importada':'Captura restaurada';
    card.querySelector('.status').textContent=`${label} · ${Math.round(record.size/1024)} KB`;
    updateProgress(mode==='restored'?'Sessió recuperada del dispositiu.':'');
  }

  async function restoreCaptures(){
    try{
      for(let index=0;index<3;index++){
        const record=await dbGet(`current-${index}`);
        if(record?.blob instanceof Blob && record.blob.size) bindCapture(cards[index],index,record,'restored');
      }
      updateProgress(captures.some(Boolean)?'Pots continuar sense repetir els retorns ja preservats.':'Sessió nova.');
    }catch(_){
      updateProgress('Persistència local no disponible en aquest navegador.');
    }
  }

  async function saveCapture(index,meta,blob,extra={}){
    const record={id:`current-${index}`,...meta,...extra,blob};
    await dbPut(record);
    return record;
  }

  async function captureReturn(card,index){
    const input=card.querySelector('input');
    const status=card.querySelector('.status');
    const button=card.querySelector('.capture');
    const label=input.value.trim();
    if(!label){ status.textContent='Posa un nom privat a l’espai abans de capturar.'; input.focus(); return; }
    if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){ status.textContent='Aquest navegador no permet la captura d’àudio requerida.'; return; }
    button.disabled=true;
    status.textContent='Demanant accés al micròfon…';
    let stream;
    try{
      stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const mimeType=preferredMime();
      const recorder=new MediaRecorder(stream,mimeType?{mimeType}:undefined);
      const chunks=[];
      recorder.addEventListener('dataavailable',e=>{if(e.data.size) chunks.push(e.data);});
      const stopped=new Promise((resolve,reject)=>{
        recorder.addEventListener('stop',resolve,{once:true});
        recorder.addEventListener('error',e=>reject(e.error||new Error('media-recorder-error')),{once:true});
      });
      recorder.start();
      status.textContent='Capturant silenci de base…';
      await wait(420);
      status.textContent='Pols emès. Escoltant el retorn…';
      await playPulse();
      await wait(2800);
      recorder.stop();
      await stopped;
      const blob=new Blob(chunks,{type:recorder.mimeType||chunks[0]?.type||'audio/webm'});
      if(!blob.size) throw new Error('empty-capture');
      const record=await saveCapture(index,{sourceId:SOURCE.id,spaceLabel:label,capturedAt:new Date().toISOString(),mimeType:blob.type,size:blob.size},blob);
      bindCapture(card,index,record,'captured');
    }catch(error){
      status.textContent=error?.name==='NotAllowedError'?'Permís de micròfon no concedit. No s’ha creat cap rastre.':'La captura no ha quedat preservada. Pots tornar-ho a provar sense afectar els altres retorns.';
      button.disabled=false;
    }finally{ stream?.getTracks().forEach(track=>track.stop()); }
  }

  function addImportControl(card,index){
    if(card.querySelector('.import-evidence')) return;
    const button=document.createElement('button');
    button.type='button';
    button.className='import-evidence';
    button.textContent='Importar evidència existent';
    const picker=document.createElement('input');
    picker.type='file'; picker.accept='audio/*,.webm,.m4a,.mp4'; picker.hidden=true;
    button.addEventListener('click',()=>picker.click());
    picker.addEventListener('change',async()=>{
      const file=picker.files?.[0]; if(!file) return;
      const status=card.querySelector('.status');
      const label=card.querySelector('.place input')?.value.trim()||`Espai ${index+1} · evidència importada`;
      try{
        status.textContent='Important i preservant…';
        const record=await saveCapture(index,{sourceId:SOURCE.id,spaceLabel:label,capturedAt:file.lastModified?new Date(file.lastModified).toISOString():new Date().toISOString(),mimeType:file.type||'application/octet-stream',size:file.size},file,{importedEvidence:true,originalFilename:file.name});
        bindCapture(card,index,record,'imported');
      }catch(_){ status.textContent='No s’ha pogut importar aquesta evidència.'; }
    });
    card.querySelector('.capture').insertAdjacentElement('afterend',button);
    button.insertAdjacentElement('afterend',picker);
  }

  cards.forEach((card,index)=>{
    card.querySelector('.capture').addEventListener('click',()=>captureReturn(card,index));
    addImportControl(card,index);
  });

  function observationAt(index){ return document.querySelector(`input[name="o${index}"]:checked`)?.value||''; }

  async function loadTrace(){
    try{
      const fromDb=await dbGet(TRACE_ID);
      if(fromDb?.trace) return fromDb.trace;
    }catch(_){}
    try{ const raw=localStorage.getItem(TRACE_KEY); return raw?JSON.parse(raw):null; }catch(_){ return null; }
  }

  async function saveTrace(trace){
    try{ await dbPut({id:TRACE_ID,trace}); }catch(_){}
    try{ localStorage.setItem(TRACE_KEY,JSON.stringify(trace)); }catch(_){}
  }

  function renderTrace(trace,restored=false){
    if(traceUrl) URL.revokeObjectURL(traceUrl);
    traceUrl=URL.createObjectURL(new Blob([JSON.stringify(trace,null,2)],{type:'application/json'}));
    document.getElementById('traceDownload').href=traceUrl;
    document.getElementById('provenance').innerHTML=captures.map((c,i)=>`<div><b>Retorn ${i+1}</b> · ${escapeHtml(c.spaceLabel)} · ${escapeHtml(trace.audible.observations[i])} · ${Math.round(c.size/1024)} KB</div>`).join('');
    document.getElementById('finding').textContent=trace.audible.differencePerceived?'Hi ha diferència perceptible declarada. La formiga assenyala una relació candidata, no una conclusió.':trace.transformation.relational==='unknown'?'La diferència roman indeterminada. Incertesa preservada; reobservar és legítim.':'No s’ha declarat diferència perceptible. La Travessa no força cap relació.';
    document.getElementById('ant').classList.toggle('show',trace.audible.differencePerceived);
    document.getElementById('result').classList.add('ready');
    document.getElementById('compareStatus').textContent=restored?'Sessió completa restaurada. Procedència i decisió recuperades.':'Decisió registrada. Ara es revela la procedència.';
  }

  async function restoreTrace(){
    const trace=await loadTrace();
    if(!trace?.audible?.observations) return;
    trace.audible.observations.forEach((value,index)=>{ const radio=document.querySelector(`input[name="o${index}"][value="${value}"]`); if(radio) radio.checked=true; });
    if(trace.humanDecision) document.getElementById('decision').value=trace.humanDecision;
    if(captures.every(Boolean)) renderTrace(trace,true);
  }

  document.getElementById('reveal').addEventListener('click',async()=>{
    const observations=[0,1,2].map(observationAt);
    const humanDecision=document.getElementById('decision').value;
    const status=document.getElementById('compareStatus');
    if(!captures.every(Boolean)){ status.textContent='Falten retorns reals.'; return; }
    if(observations.some(v=>!v)){ status.textContent='Declara mateix, diferent o no ho sé per als tres retorns.'; return; }
    if(!humanDecision){ status.textContent='La Travessa només pot tancar amb una decisió humana.'; return; }
    const hasDifference=observations.includes('different');
    const relationalState=hasDifference?true:observations.every(v=>v==='same')?false:'unknown';
    const trace={
      id:`eco-01-${Date.now()}`,
      protocol:'ECO 01 · El lloc que respon',
      status:'executed-locally-primary-evidence-persisted-on-device',
      source:SOURCE,
      captures:captures.map(({url,...c})=>c),
      audible:{kind:'relational-property',components:['source','space','time','listener'],observations,differencePerceived:hasDifference},
      transformation:{material:false,relational:relationalState},
      humanDecision,
      provenance:{attributedSource:{author:'Michel Faber',work:'Listen: On Music, Sound and Us',chapter:'Somewhat Marred by an Echo'},metabolizedBy:'Anímic Protein',canonical:false,reversible:true,binaryTransferred:false,binaryPersistence:'indexeddb-local-device'}
    };
    await saveTrace(trace);
    renderTrace(trace,false);
    document.getElementById('result').scrollIntoView({behavior:'smooth'});
  });

  function escapeHtml(value){ const node=document.createElement('span'); node.textContent=value; return node.innerHTML; }

  document.getElementById('reset').addEventListener('click',async()=>{
    if(!window.confirm('Això eliminarà les tres captures preservades en aquest dispositiu i el rastre de la sessió. Continuar?')) return;
    objectUrls.forEach(URL.revokeObjectURL);
    if(traceUrl) URL.revokeObjectURL(traceUrl);
    try{ localStorage.removeItem(TRACE_KEY); }catch(_){}
    try{ await dbClear(); }catch(_){}
    location.reload();
  });

  window.addEventListener('pagehide',()=>{
    objectUrls.forEach(url=>URL.revokeObjectURL(url));
    if(traceUrl) URL.revokeObjectURL(traceUrl);
  });

  (async()=>{ await restoreCaptures(); await restoreTrace(); })();
})();
