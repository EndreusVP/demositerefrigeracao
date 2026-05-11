// js/responsivo/touch.js
// comportamentos exclusivos de dispositivos touch
// a inicialização dos fios (interativa ou visual) é feita em sobre.js
// deve ser carregado APÓS todos os outros scripts

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


// ── cards de serviço ───────────────────────────────────────────────────────
// no touch: hover css não funciona — ativa flip por toque na classe .flipped

if (isTouchDevice) {
  setTimeout(() => {
    const cards = document.querySelectorAll('.card-wrap');

    cards.forEach(card => {
      card.addEventListener('touchstart', () => {
        card.classList.toggle('flipped');
      }, { passive: true });
    });
  }, 500);
}


// ── flocos decorativos ─────────────────────────────────────────────────────
// mobile: reduz opacidade dos flocos para economizar performance visual

if (isMobile) {
  setTimeout(() => {
    const canvasFlocos = document.querySelectorAll('#servicos-flocos canvas');
    canvasFlocos.forEach(c => {
      c.style.opacity = '0.06';
    });
  }, 500);
}


// ── ajuste de viewport height ──────────────────────────────────────────────
// corrige o problema de 100vh em mobile (barra do browser que some/aparece)

function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVh();
window.addEventListener('resize', setVh);

// uso no css: min-height: calc(var(--vh, 1vh) * 100)