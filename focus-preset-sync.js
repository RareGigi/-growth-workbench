(() => {
  'use strict';

  const Core = window.GrowthCore;
  if (!Core) return;

  const PRESETS = Object.freeze({
    'leaf-rain': { ambience: 'leaf-rain', music: 'graphite', ambienceVolume: 0.5, musicVolume: 0.16 },
    library: { ambience: 'library', music: 'quiet-books', ambienceVolume: 0.38, musicVolume: 0.14 },
    cafe: { ambience: 'cafe', music: 'graphite', ambienceVolume: 0.34, musicVolume: 0.13 },
    'magic-bookshop': { ambience: 'hearth', music: 'quiet-books', ambienceVolume: 0.36, musicVolume: 0.15 },
    celestial: { ambience: 'cloud-wind', music: 'constellations', ambienceVolume: 0.4, musicVolume: 0.14 },
    temple: { ambience: 'temple', music: 'temple-dawn', ambienceVolume: 0.38, musicVolume: 0.12 }
  });

  function syncSelect(channel, value) {
    const select = document.querySelector(`.timer-panel [data-focus-track="${channel}"]`);
    if (!select || select.value === value) return;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function syncVolume(channel, value) {
    const input = document.querySelector(`.timer-panel [data-focus-volume="${channel}"]`);
    if (!input) return;
    const next = String(Math.round(Math.max(0, Math.min(1, value)) * 100));
    if (input.value === next) return;
    input.value = next;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  document.addEventListener('click', (event) => {
    const control = event.target.closest('[data-focus-v2-action="recommend"]');
    if (!control) return;

    // focus-immersive.js applies the state preset first. Run after that handler so the
    // canonical player receives the same music, ambience and volume changes immediately.
    queueMicrotask(() => {
      const settings = Core.state?.focusSettings;
      if (!settings) return;
      const preset = PRESETS[settings.roomId] || PRESETS['leaf-rain'];
      syncSelect('ambience', preset.ambience);
      syncSelect('music', preset.music);
      syncVolume('ambience', preset.ambienceVolume);
      syncVolume('music', preset.musicVolume);
    });
  }, true);
})();
