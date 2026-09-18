(() => {
  'use strict';

  const canvas = document.querySelector('[data-spectrum-canvas]');
  const input = document.querySelector('[data-spectrum-input]');
  const media = document.querySelector('[data-spectrum-media]');
  const ambience = document.querySelector('[data-ambience-audio]');
  const ambienceToggle = document.querySelector('[data-ambience-toggle]');
  const transport = document.querySelector('[data-spectrum-transport]');
  const clear = document.querySelector('[data-spectrum-clear]');
  const status = document.querySelector('[data-spectrum-status]');
  const level = document.querySelector('[data-spectrum-level]');
  if (!canvas || !input || !media || !status || !level) return;

  const paint = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let audioContext;
  let analyser;
  let ambienceSource;
  let mediaSource;
  let objectUrl;
  let bins;
  let raf;

  function ensureGraph() {
    if (!audioContext) {
      const AudioEngine = window.AudioContext || window.webkitAudioContext;
      if (!AudioEngine) return false;
      audioContext = new AudioEngine();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      analyser.connect(audioContext.destination);
      bins = new Uint8Array(analyser.frequencyBinCount);
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    return true;
  }

  function connect(element, kind) {
    if (!ensureGraph()) return false;
    if (kind === 'ambience' && !ambienceSource) {
      ambienceSource = audioContext.createMediaElementSource(element);
      ambienceSource.connect(analyser);
    }
    if (kind === 'media' && !mediaSource) {
      mediaSource = audioContext.createMediaElementSource(element);
      mediaSource.connect(analyser);
    }
    return true;
  }

  function isReceiving() {
    return Boolean((ambience && !ambience.paused) || !media.paused);
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const box = canvas.getBoundingClientRect();
    const width = Math.max(240, Math.round(box.width));
    const height = Math.max(78, Math.round(box.height));
    if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      paint.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    return { width, height };
  }

  function drawGrid(width, height) {
    paint.clearRect(0, 0, width, height);
    paint.strokeStyle = 'rgba(104,221,255,.12)';
    paint.lineWidth = 1;
    for (let x = 0; x <= width; x += width / 8) {
      paint.beginPath(); paint.moveTo(x, 0); paint.lineTo(x, height); paint.stroke();
    }
    for (let y = 0; y <= height; y += height / 4) {
      paint.beginPath(); paint.moveTo(0, y); paint.lineTo(width, y); paint.stroke();
    }
  }

  function draw() {
    const { width, height } = resize();
    drawGrid(width, height);
    const active = analyser && bins && isReceiving();
    let energy = 0;

    if (active) {
      analyser.getByteFrequencyData(bins);
      const bars = Math.min(48, bins.length);
      const step = Math.max(1, Math.floor(bins.length / bars));
      const barWidth = width / bars;
      for (let i = 0; i < bars; i++) {
        const value = bins[i * step] / 255;
        energy += value;
        const barHeight = Math.max(2, value * height * .88);
        const gradient = paint.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(224,178,90,.88)');
        gradient.addColorStop(1, 'rgba(104,221,255,.92)');
        paint.fillStyle = gradient;
        paint.fillRect(i * barWidth + 1, height - barHeight, Math.max(1, barWidth - 2), barHeight);
      }
      energy /= bars;
    } else {
      paint.strokeStyle = 'rgba(224,178,90,.55)';
      paint.beginPath();
      for (let x = 0; x <= width; x += 4) {
        const pulse = reducedMotion.matches ? 0 : Math.sin(x * .055 + performance.now() * .001) * 2;
        const y = height / 2 + pulse;
        if (x === 0) paint.moveTo(x, y); else paint.lineTo(x, y);
      }
      paint.stroke();
    }

    const percent = Math.round(Math.min(1, energy * 2.3) * 100);
    level.style.setProperty('--signal', `${percent}%`);
    level.setAttribute('aria-valuemin', '0');
    level.setAttribute('aria-valuemax', '100');
    level.setAttribute('aria-valuenow', String(percent));
    level.setAttribute('aria-label', active ? `Nivell de senyal ${percent}%` : 'Sense senyal');
    canvas.setAttribute('aria-label', active ? `Spectrum Annalis rep un senyal. Intensitat ${percent}%.` : 'Spectrum Annalis en espera, sense senyal.');
    raf = requestAnimationFrame(draw);
  }

  async function receive(file) {
    if (!file || (!file.type.startsWith('audio/') && !file.type.startsWith('video/'))) {
      status.textContent = 'FORMAT NO AUDIBLE';
      return;
    }
    if (!connect(media, 'media')) {
      status.textContent = 'RECEPTOR NO DISPONIBLE';
      return;
    }
    if (ambience && !ambience.paused) ambience.pause();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    media.src = objectUrl;
    status.textContent = `REBUT · ${file.name}`;
    transport.hidden = false;
    clear.hidden = false;
    try {
      await audioContext.resume();
      await media.play();
      transport.textContent = 'PAUSA';
    } catch {
      status.textContent = `PREPARAT · ${file.name}`;
      transport.textContent = 'REPRODUEIX';
    }
  }

  input.addEventListener('change', () => receive(input.files?.[0]));
  transport.addEventListener('click', async () => {
    if (!media.src) return;
    if (media.paused) {
      ensureGraph();
      await media.play();
      transport.textContent = 'PAUSA';
    } else {
      media.pause();
      transport.textContent = 'REPRODUEIX';
    }
  });
  clear.addEventListener('click', () => {
    media.pause();
    media.removeAttribute('src');
    media.load();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    input.value = '';
    transport.hidden = true;
    clear.hidden = true;
    status.textContent = 'ESPERA · SENSE SENYAL';
  });

  ambienceToggle?.addEventListener('pointerdown', () => connect(ambience, 'ambience'), { capture: true });
  ambience?.addEventListener('play', () => {
    connect(ambience, 'ambience');
    status.textContent = 'REBUT · ALLÒ QUE ES COU';
  });
  ambience?.addEventListener('pause', () => {
    if (media.paused) status.textContent = 'ESPERA · SENSE SENYAL';
  });
  media.addEventListener('ended', () => { transport.textContent = 'REPRODUEIX'; });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });

  draw();
})();
