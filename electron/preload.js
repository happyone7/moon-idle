// Preload script — minimal, game uses localStorage directly
// No Node.js APIs exposed to renderer
window.addEventListener('DOMContentLoaded', () => {
  // Electron environment detection for game
  window.__ELECTRON__ = true;
});
