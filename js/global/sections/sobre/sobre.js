// js/global/sections/sobre/sobre.js
// orquestrador da seção Sobre
// depende de: fios.js carregado antes (FiosSobre global)
// NOTA: scripts estão no final do body, DOM já está pronto — sem DOMContentLoaded

const canvasSobre = document.getElementById('sobre-canvas');

if (canvasSobre) {

  // detecta touch device — mesmo critério do touch.js
  const _isTouch = (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );

  if (_isTouch) {
    // touch/tablet — canvas puramente visual, sem capturar eventos de toque
    // pointer-events none garante que o scroll passa pelo canvas normalmente
    canvasSobre.style.pointerEvents = 'none';
    canvasSobre.style.cursor        = 'default';
    FiosSobre.initSomenteLeitura(canvasSobre);

  } else {
    // desktop — interação completa com fios
    FiosSobre.init(canvasSobre);

    // fio cortado → ativa tema escuro na seção
    canvasSobre.addEventListener('fiocortado', () => {
      const secao = document.getElementById('sobre');
      if (secao && !secao.classList.contains('tema-escuro')) {
        secao.classList.add('tema-escuro');
      }
    });
  }
}