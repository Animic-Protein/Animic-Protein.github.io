(() => {
  'use strict';

  const button = document.querySelector('[data-ambience-toggle]');
  const audio = document.querySelector('[data-ambience-audio]');
  if (!button || !audio) return;

  const storageKey = 'codex-kreator-ambience';
  const targetVolume = 0.14;
  let desired = readPreference() === 'on';
  let fadeFrame = 0;

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
    desired = true;
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
    writePreference('off');
    render('off');
    fadeTo(0, 350, () => audio.pause());
  }

  button.addEventListener('click', () => {
    if (desired && !audio.paused) stop();
    else start();
  });

  document.addEventListener('pointerdown', event => {
    if (desired && audio.paused && !button.contains(event.target)) start();
  }, { capture: true, passive: true });

  audio.addEventListener('play', () => render('playing'));
  audio.addEventListener('pause', () => { if (desired) render('pending'); });

  render(desired ? 'pending' : 'off');
  if (desired) start();
})();
