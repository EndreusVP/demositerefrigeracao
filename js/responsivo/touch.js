// ── detecção de dispositivo ────────────────────────────────────────────────

// true se for touch device (mobile ou tablet)
const isTouchDevice = (
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  window.matchMedia('(pointer: coarse)').matches
);

// true se for mobile (até 767px)
const isMobile = window.matchMedia('(max-width: 767px)').matches;

// true se for tablet (768px ~ 1023px)
const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;


// ── fios da seção sobre ────────────────────────────────────────────────────
// em qualquer dispositivo touch: desativa interação completamente

if (isTouchDevice) {
  const canvasSobre = document.getElementById('sobre-canvas');

  if (canvasSobre) {
    // remove pointer-events — cursor não afeta os fios
    canvasSobre.style.pointerEvents = 'none';
    canvasSobre.style.cursor        = 'default';

    // substitui o canvas por versão apenas visual
    // FiosSobre.destroy() libera os listeners de mouse/click
    // e recria os fios sem nenhuma interação
    if (typeof FiosSobre !== 'undefined') {
      FiosSobre.destroy();
      FiosSobre.initSomenteLeitura(canvasSobre);
    }
  }
}


// ── cards de serviço ───────────────────────────────────────────────────────
// no touch: hover css não funciona bem — ativa flip por toque

if (isTouchDevice) {
  document.addEventListener('DOMContentLoaded', () => {
    // aguarda os cards serem renderizados pelo servicos.js
    setTimeout(() => {
      const cards = document.querySelectorAll('.card-wrap');

      cards.forEach(card => {
        card.addEventListener('touchstart', () => {
          // toggle da classe — toque ativa/desativa o flip
          card.classList.toggle('flipped');
        }, { passive: true });
      });
    }, 500);
  });
}


// ── flocos decorativos ─────────────────────────────────────────────────────
// mobile: reduz quantidade de flocos para economizar performance

if (isMobile) {
  // sobrescreve a opção de quantidade ao chamar initFlocos
  // como initFlocos já foi chamado, apenas limita via CSS opacity
  const canvasFlocos = document.querySelectorAll('#servicos-flocos canvas');
  canvasFlocos.forEach(c => {
    c.style.opacity = '0.06'; // ainda mais sutil no mobile
  });
}


// ── ajuste de viewport height ──────────────────────────────────────────────
// corrige o problema de 100vh em mobile (barra do browser)

function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVh();
window.addEventListener('resize', setVh);

// uso: no css, troque min-height: 100vh por min-height: calc(var(--vh, 1vh) * 100)