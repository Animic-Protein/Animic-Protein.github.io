(() => {
  'use strict';

  const button = document.querySelector('[data-ambience-toggle]');
  const audio = document.querySelector('[data-ambience-audio]');
  if (!button || !audio) return;

  const storageKey = 'codex-kreator-ambience';
  const targetVolume = 0.14;
  let desired = readPreference() === 'on';
  let fadeFrame = 0;
  let stopToken = 0;

  function readPreference() {
    try { return localStorage.getItem(storageKey); } catch { return null; }
  }

  function writePreference(value) {
    try { localStorage.setItem(storageKey, value); } catch { /* preference remains local to this page */ }
  }

  function render(state) {
    const active = state === 'playing';
    const pending = state === 'pending';
    button.setAttribute('aria-pressed', String(active));
    button.dataset.soundState = state;
    button.querySelector('[data-sound-icon]').textContent = active ? '🔊' : pending ? '🔈' : '🔇';
    button.querySelector('[data-sound-label]').textContent = active ? 'SO ACTIU' : pending ? 'TOCA PER ACTIVAR' : 'ACTIVAR SO';
    button.setAttribute('aria-label', active ? 'Silenciar Matèria sonora · Allò que es cou' : 'Activar Matèria sonora · Allò que es cou');
    button.title = active ? 'Silenciar Allò que es cou' : 'Activar Allò que es cou';
  }

  function fadeTo(volume, duration, onComplete) {
    cancelAnimationFrame(fadeFrame);
    const startedAt = performance.now();
    const initialVolume = audio.volume;
    const step = now => {
      const progress = Math.min(1, (now - startedAt) / duration);
      audio.volume = initialVolume + (volume - initialVolume) * progress;
      if (progress < 1) fadeFrame = requestAnimationFrame(step);
      else onComplete?.();
    };
    fadeFrame = requestAnimationFrame(step);
  }

  async function start() {
    stopToken += 1;
    desired = true;
    audio.muted = false;
    audio.volume = 0;
    try {
      await audio.play();
      writePreference('on');
      render('playing');
      fadeTo(targetVolume, 900);
    } catch {
      render('pending');
    }
  }

  function stop() {
    desired = false;
    const token = ++stopToken;
    writePreference('off');
    cancelAnimationFrame(fadeFrame);
    audio.muted = true;
    audio.volume = 0;
    audio.pause();
    render('off');
    requestAnimationFrame(() => {
      if (token !== stopToken || desired) return;
      audio.muted = true;
      audio.pause();
      render('off');
    });
  }

  button.addEventListener('click', () => {
    if (desired && !audio.paused) stop();
    else start();
  });

  document.addEventListener('pointerdown', event => {
    if (desired && audio.paused && !button.contains(event.target)) start();
  }, { capture: true, passive: true });

  audio.addEventListener('play', () => { if (desired && !audio.muted) render('playing'); else stop(); });
  audio.addEventListener('pause', () => render(desired ? 'pending' : 'off'));
  audio.addEventListener('volumechange', () => { if (!desired && (!audio.muted || audio.volume !== 0)) { audio.muted = true; audio.volume = 0; render('off'); } });

  render(desired ? 'pending' : 'off');
  if (desired) start();
})();
