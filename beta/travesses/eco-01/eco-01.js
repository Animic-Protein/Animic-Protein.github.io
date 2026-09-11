(() => {
  'use strict';

  const SOURCE = Object.freeze({id:'eco-01-pulse',kind:'generated',frequencyHz:440,durationMs:240,constant:true});
  const DB_NAME = 'codex-eco-01';
  const DB_VERSION = 1;
  const CAPTURE_STORE = 'captures';
  const SESSION_KEY = 'current';
  const TRACE_KEY = 'codex:eco-01:last-trace';

  const cards = [...document.querySelectorAll('.space')];
  const captures = [null,null,null];
  const objectUrls = [];
  let audioContext;
  let traceUrl = '';
  let dbPromise;

  const preferredMime = () => {
    if (!window.MediaRecorder) return '';
    return ['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(t => MediaRecorder.isTypeSupported(t)) || '';
  };

  function openDb() {
    if (!('indexedDB' in window)) return Promise.reject(new Error('indexeddb-unavailable'));
    if (!dbPromise) {
      dbPromise = new Promise((resolve,reject) => {
        const request = indexedDB.open(DB_NAME,DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(CAPTURE_STORE)) db.createObjectStore(CAPTURE_STORE,{keyPath:'id'});
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('indexeddb-open-failed'));
      });
    }
    return dbPromise;
  }

  async function idbPut(record) {
    const db = await openDb();
    await new Promise((resolve,reject) => {
      const tx = db.transaction(CAPTURE_STORE,'readwrite');
      tx.objectStore(CAPTURE_STORE).put(record);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('indexeddb-write-failed'));
      tx.onabort = () => reject(tx.error || new Error('indexeddb-write-aborted'));
    });
  }

  async function idbGet(id) {
    const db = await openDb();
    return await new Promise((resolve,reject) => {
      const tx = db.transaction(CAPTURE_STORE,'readonly');
      const req = tx.objectStore(CAPTURE_STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error || new Error('indexeddb-read-failed'));
    });
  }

  async function idbClear() {
    const db = await openDb();
    await new Promise((resolve,reject) => {
      const tx = db.transaction(CAPTURE_STORE,'readwrite');
      tx.objectStore(CAPTURE_STORE).clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('indexeddb-clear-failed'));
      tx.onabort = () => reject(tx.error || new Error('indexeddb-clear-aborted'));
    });
  }

  async function playPulse() {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = SOURCE.frequencyHz;
    gain.gain.setValueAtTime(0.0001,audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16,audioContext.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001,audioContext.currentTime + SOURCE.durationMs / 1000);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + SOURCE.durationMs / 1000 + 0.02);
    const pulse = document.getElementById('pulse');
    pulse.classList.add('live');
    setTimeout(() => pulse.classList.remove('live'),SOURCE.durationMs + 180);
  }

  document.getElementById('pulse').addEventListener('click',() => playPulse().catch(() => {}));
  const wait = ms => new Promise(resolve => setTimeout(resolve,ms));

  function bindCaptureToCard(card,index,record,restored=false) {
    if (captures[index]?.url) URL.revokeObjectURL(captures[index].url);
    const url = URL.createObjectURL(record.blob);
    objectUrls.push(url);
    captures[index] = {
      id:record.id,
      sourceId:record.sourceId,
      spaceLabel:record.spaceLabel,
      capturedAt:record.capturedAt,
      mimeType:record.mimeType,
      size:record.size,
      localOnly:true,
      canonical:false,
      persistedLocally:true,
      url
    };
    card.querySelector('audio').src = url;
    const download = card.querySelector('.download');
    download.href = url;
    const ext = record.mimeType.includes('mp4') ? 'm4a' : 'webm';
    download.download = `eco-01-retorn-${index + 1}.${ext}`;
    card.classList.add('complete');
    card.querySelector('.capture').disabled = true;
    card.querySelector('.status').textContent = restored
      ? `Captura restaurada del dispositiu · ${Math.round(record.size/1024)} KB`
      : `Captura preservada al dispositiu · ${Math.round(record.size/1024)} KB`;
    if (captures.every(Boolean)) document.getElementById('compare').classList.add('ready');
  }

  async function persistCapture(index,meta,blob) {
    const record = {...meta,id:`${SESSION_KEY}-${index}`,blob};
    await idbPut(record);
    return record;
  }

  async function restoreCaptures() {
    try {
      const restored = await Promise.all([0,1,2].map(index => idbGet(`${SESSION_KEY}-${index}`)));
      restored.forEach((record,index) => {
        if (record?.blob instanceof Blob && record.blob.size) bindCaptureToCard(cards[index],index,record,true);
      });
    } catch (_) {
      cards.forEach(card => {
        if (!card.classList.contains('complete')) card.querySelector('.status').textContent = 'Persistència local no disponible en aquest navegador.';
      });
    }
  }

  async function captureReturn(card,index) {
    const input = card.querySelector('input');
    const status = card.querySelector('.status');
    const button = card.querySelector('.capture');
    const label = input.value.trim();
    if (!label) {
      status.textContent = 'Posa un nom privat a l’espai abans de capturar.';
      input.focus();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      status.textContent = 'Aquest navegador no permet la captura d’àudio requerida.';
      return;
    }
    button.disabled = true;
    status.textContent = 'Demanant accés al micròfon…';
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({audio:true});
      const mimeType = preferredMime();
      const recorder = new MediaRecorder(stream,mimeType ? {mimeType} : undefined);
      const chunks = [];
      recorder.addEventListener('dataavailable',event => { if (event.data.size) chunks.push(event.data); });
      const stopped = new Promise((resolve,reject) => {
        recorder.addEventListener('stop',resolve,{once:true});
        recorder.addEventListener('error',event => reject(event.error || new Error('media-recorder-error')),{once:true});
      });
      recorder.start();
      status.textContent = 'Capturant silenci de base…';
      await wait(420);
      status.textContent = 'Pols emès. Escoltant el retorn…';
      await playPulse();
      await wait(2800);
      recorder.stop();
      await stopped;
      const blob = new Blob(chunks,{type:recorder.mimeType || chunks[0]?.type || 'audio/webm'});
      if (!blob.size) throw new Error('empty-capture');
      const meta = {
        sourceId:SOURCE.id,
        spaceLabel:label,
        capturedAt:new Date().toISOString(),
        mimeType:blob.type,
        size:blob.size
      };
      const record = await persistCapture(index,meta,blob);
      bindCaptureToCard(card,index,record,false);
    } catch (error) {
      status.textContent = error?.name === 'NotAllowedError'
        ? 'Permís de micròfon no concedit. No s’ha creat cap rastre.'
        : error?.message?.includes('indexeddb')
          ? 'S’ha capturat àudio, però no s’ha pogut preservar localment. No tanquis la pàgina.'
          : 'La captura ha fallat. Conserva la fallada o torna-ho a provar.';
      button.disabled = false;
    } finally {
      stream?.getTracks().forEach(track => track.stop());
    }
  }

  cards.forEach((card,index) => card.querySelector('.capture').addEventListener('click',() => captureReturn(card,index)));

  function observationAt(index) {
    return document.querySelector(`input[name="o${index}"]:checked`)?.value || '';
  }

  function restoreTrace() {
    try {
      const raw = localStorage.getItem(TRACE_KEY);
      if (!raw) return;
      const trace = JSON.parse(raw);
      if (!Array.isArray(trace?.audible?.observations)) return;
      trace.audible.observations.forEach((value,index) => {
        const radio = document.querySelector(`input[name="o${index}"][value="${value}"]`);
        if (radio) radio.checked = true;
      });
      if (trace.humanDecision) document.getElementById('decision').value = trace.humanDecision;
      if (captures.every(Boolean)) renderTrace(trace,true);
    } catch (_) {}
  }

  function renderTrace(trace,restored=false) {
    if (traceUrl) URL.revokeObjectURL(traceUrl);
    traceUrl = URL.createObjectURL(new Blob([JSON.stringify(trace,null,2)],{type:'application/json'}));
    document.getElementById('traceDownload').href = traceUrl;
    document.getElementById('provenance').innerHTML = captures.map((capture,index) =>
      `<div><b>Retorn ${index + 1}</b> · ${escapeHtml(capture.spaceLabel)} · ${escapeHtml(trace.audible.observations[index])} · ${Math.round(capture.size/1024)} KB</div>`
    ).join('');
    document.getElementById('finding').textContent = trace.audible.differencePerceived
      ? 'Hi ha diferència perceptible declarada. La formiga assenyala una relació candidata, no una conclusió.'
      : trace.transformation.relational === 'unknown'
        ? 'La diferència roman indeterminada. Incertesa preservada; reobservar és legítim.'
        : 'No s’ha declarat diferència perceptible. La Travessa no força cap relació.';
    document.getElementById('ant').classList.toggle('show',trace.audible.differencePerceived);
    document.getElementById('result').classList.add('ready');
    document.getElementById('compareStatus').textContent = restored
      ? 'Sessió restaurada del dispositiu. Procedència i decisió recuperades.'
      : 'Decisió registrada. Ara es revela la procedència.';
  }

  document.getElementById('reveal').addEventListener('click',() => {
    const observations = [0,1,2].map(observationAt);
    const humanDecision = document.getElementById('decision').value;
    const status = document.getElementById('compareStatus');
    if (!captures.every(Boolean)) {
      status.textContent = 'Falten retorns reals.';
      return;
    }
    if (observations.some(value => !value)) {
      status.textContent = 'Declara mateix, diferent o no ho sé per als tres retorns.';
      return;
    }
    if (!humanDecision) {
      status.textContent = 'La Travessa només pot tancar amb una decisió humana.';
      return;
    }

    const hasDifference = observations.includes('different');
    const relationalState = hasDifference ? true : observations.every(v => v === 'same') ? false : 'unknown';
    const trace = {
      id:`eco-01-${Date.now()}`,
      protocol:'ECO 01 · El lloc que respon',
      status:'executed-locally-primary-evidence-persisted-on-device',
      source:SOURCE,
      captures:captures.map(({url,...capture}) => capture),
      audible:{kind:'relational-property',components:['source','space','time','listener'],observations,differencePerceived:hasDifference},
      transformation:{material:false,relational:relationalState},
      humanDecision,
      provenance:{
        attributedSource:{author:'Michel Faber',work:'Listen: On Music, Sound and Us',chapter:'Somewhat Marred by an Echo'},
        metabolizedBy:'Anímic Protein',
        canonical:false,
        reversible:true,
        binaryTransferred:false,
        binaryPersistence:'indexeddb-local-device'
      }
    };

    try { localStorage.setItem(TRACE_KEY,JSON.stringify(trace)); } catch (_) {}
    renderTrace(trace,false);
    document.getElementById('result').scrollIntoView({behavior:'smooth'});
  });

  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = value;
    return node.innerHTML;
  }

  document.getElementById('reset').addEventListener('click',async () => {
    const confirmed = window.confirm('Això eliminarà les tres captures preservades en aquest dispositiu i el rastre de la sessió. Continuar?');
    if (!confirmed) return;
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    if (traceUrl) URL.revokeObjectURL(traceUrl);
    try { localStorage.removeItem(TRACE_KEY); } catch (_) {}
    try { await idbClear(); } catch (_) {}
    location.reload();
  });

  window.addEventListener('pagehide',() => {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    if (traceUrl) URL.revokeObjectURL(traceUrl);
  });

  (async () => {
    await restoreCaptures();
    restoreTrace();
  })();
})();
