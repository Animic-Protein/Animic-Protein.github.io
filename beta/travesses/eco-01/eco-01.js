(() => {
  'use strict';
  const SOURCE = Object.freeze({id:'eco-01-pulse',kind:'generated',frequencyHz:440,durationMs:240,constant:true});
  const cards = [...document.querySelectorAll('.space')];
  const captures = [null,null,null];
  const objectUrls = [];
  let audioContext;
  let traceUrl = '';

  const preferredMime = () => {
    if (!window.MediaRecorder) return '';
    return ['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(t => MediaRecorder.isTypeSupported(t)) || '';
  };

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
      if (captures[index]?.url) URL.revokeObjectURL(captures[index].url);
      const url = URL.createObjectURL(blob);
      objectUrls.push(url);
      captures[index] = {
        id:`eco-01-return-${index + 1}`,
        sourceId:SOURCE.id,
        spaceLabel:label,
        capturedAt:new Date().toISOString(),
        mimeType:blob.type,
        size:blob.size,
        localOnly:true,
        canonical:false,
        url
      };
      card.querySelector('audio').src = url;
      card.querySelector('.download').href = url;
      card.classList.add('complete');
      status.textContent = `Captura local preparada · ${Math.round(blob.size / 1024)} KB`;
      if (captures.every(Boolean)) document.getElementById('compare').classList.add('ready');
    } catch (error) {
      status.textContent = error?.name === 'NotAllowedError' ? 'Permís de micròfon no concedit. No s’ha creat cap rastre.' : 'La captura ha fallat. Conserva la fallada o torna-ho a provar.';
      button.disabled = false;
    } finally {
      stream?.getTracks().forEach(track => track.stop());
    }
  }

  cards.forEach((card,index) => card.querySelector('.capture').addEventListener('click',() => captureReturn(card,index)));

  function observationAt(index) {
    return document.querySelector(`input[name="o${index}"]:checked`)?.value || '';
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
      status:'executed-locally-pending-primary-evidence-preservation',
      source:SOURCE,
      captures:captures.map(({url,...capture}) => capture),
      audible:{
        kind:'relational-property',
        components:['source','space','time','listener'],
        observations,
        differencePerceived:hasDifference
      },
      transformation:{material:false,relational:relationalState},
      humanDecision,
      provenance:{
        attributedSource:{author:'Michel Faber',work:'Listen: On Music, Sound and Us',chapter:'Somewhat Marred by an Echo'},
        metabolizedBy:'Anímic Protein',
        canonical:false,
        reversible:true,
        binaryTransferred:false
      }
    };

    try { localStorage.setItem('codex:eco-01:last-trace',JSON.stringify(trace)); } catch (_) {}
    if (traceUrl) URL.revokeObjectURL(traceUrl);
    traceUrl = URL.createObjectURL(new Blob([JSON.stringify(trace,null,2)],{type:'application/json'}));
    document.getElementById('traceDownload').href = traceUrl;
    document.getElementById('provenance').innerHTML = captures.map((capture,index) =>
      `<div><b>Retorn ${index + 1}</b> · ${escapeHtml(capture.spaceLabel)} · ${escapeHtml(observations[index])} · ${Math.round(capture.size/1024)} KB</div>`
    ).join('');
    document.getElementById('finding').textContent = hasDifference
      ? 'Hi ha diferència perceptible declarada. La formiga assenyala una relació candidata, no una conclusió.'
      : relationalState === 'unknown'
        ? 'La diferència roman indeterminada. Incertesa preservada; reobservar és legítim.'
        : 'No s’ha declarat diferència perceptible. La Travessa no força cap relació.';
    document.getElementById('ant').classList.toggle('show',hasDifference);
    document.getElementById('result').classList.add('ready');
    status.textContent = 'Decisió registrada. Ara es revela la procedència.';
    document.getElementById('result').scrollIntoView({behavior:'smooth'});
  });

  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = value;
    return node.innerHTML;
  }

  document.getElementById('reset').addEventListener('click',() => {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    if (traceUrl) URL.revokeObjectURL(traceUrl);
    try { localStorage.removeItem('codex:eco-01:last-trace'); } catch (_) {}
    location.reload();
  });

  window.addEventListener('pagehide',() => {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    if (traceUrl) URL.revokeObjectURL(traceUrl);
  });
})();
