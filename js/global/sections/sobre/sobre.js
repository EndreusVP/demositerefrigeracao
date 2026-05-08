// js/global/sections/sobre/sobre.js
// orquestrador da seção Sobre
// depende de: fios.js carregado antes (FiosSobre global)
// NOTA: scripts estão no final do body, DOM já está pronto — sem DOMContentLoaded

const canvasSobre = document.getElementById('sobre-canvas');
if (canvasSobre) {
  FiosSobre.init(canvasSobre);

  // quando qualquer fio for cortado → ativa tema escuro na seção
  canvasSobre.addEventListener('fiocortado', () => {
    const secao = document.getElementById('sobre');
    if (secao && !secao.classList.contains('tema-escuro')) {
      secao.classList.add('tema-escuro');
    }
  });
}