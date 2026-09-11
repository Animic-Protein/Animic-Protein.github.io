(() => {
  'use strict';
  const DB_NAME='codex-eco-01';
  const DB_VERSION=1;
  const STORE='captures';
  const SOURCE_ID='eco-01-pulse';
  const cards=[...document.querySelectorAll('.space')];

  function openDb(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{ if(!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE,{keyPath:'id'}); };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('indexeddb-open-failed'));
    });
  }

  async function save(index,file,label){
    const db=await openDb();
    const record={
      id:`current-${index}`,
      sourceId:SOURCE_ID,
      spaceLabel:label,
      capturedAt:file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString(),
      mimeType:file.type||'application/octet-stream',
      size:file.size,
      importedEvidence:true,
      originalFilename:file.name,
      blob:file
    };
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put(record);
      tx.oncomplete=resolve;
      tx.onerror=()=>reject(tx.error||new Error('indexeddb-write-failed'));
      tx.onabort=()=>reject(tx.error||new Error('indexeddb-write-aborted'));
    });
  }

  cards.forEach((card,index)=>{
    const capture=card.querySelector('.capture');
    if(!capture||card.querySelector('.import-evidence')) return;
    const button=document.createElement('button');
    button.type='button';
    button.className='import-evidence';
    button.textContent='Importar evidència existent';
    button.style.cssText='margin-left:8px;border:1px solid #087dff;border-radius:999px;background:transparent;padding:10px 13px;color:#087dff;cursor:pointer';
    const picker=document.createElement('input');
    picker.type='file';
    picker.accept='audio/*,.webm,.m4a,.mp4';
    picker.hidden=true;
    button.addEventListener('click',()=>picker.click());
    picker.addEventListener('change',async()=>{
      const file=picker.files?.[0];
      if(!file) return;
      const label=card.querySelector('.place input')?.value.trim()||`Espai ${index+1} · evidència importada`;
      const status=card.querySelector('.status');
      try{
        status.textContent='Important i preservant evidència…';
        await save(index,file,label);
        status.textContent='Evidència importada. Restaurant sessió…';
        location.reload();
      }catch(_){
        status.textContent='No s’ha pogut importar aquesta evidència.';
      }
    });
    capture.insertAdjacentElement('afterend',button);
    button.insertAdjacentElement('afterend',picker);
  });
})();
