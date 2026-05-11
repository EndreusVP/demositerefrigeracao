// js/global/sections/trabalhos/trabalhos.js
// Orquestrador da seção Trabalhos — estante isométrica de placas
// Depende de: three.js, flocos-decorativos.js, trabalhos-data.js, trabalhos-placas.js

(function () {

    // ── monta o HTML da seção ──────────────────────────────────────────────────
    function _renderSecao() {
      const secao = document.getElementById('trabalhos');
      if (!secao) return;
  
      secao.innerHTML = `
        <div id="trabalhos-flocos" style="position:absolute;inset:0;pointer-events:none;z-index:0;"></div>
  
        <div class="trab-header">
          <span class="trab-label">Portfólio</span>
          <h2 class="trab-titulo">Nossos <span>Trabalhos</span></h2>
          <p class="trab-sub">Clique em uma placa para ver os detalhes do projeto.</p>
        </div>
  
        <div class="trab-stage" id="trab-stage">
          <canvas id="trab-canvas"></canvas>
  
          <div class="trab-hint" id="trab-hint">
            <i class="fa-solid fa-hand-pointer"></i>
            Clique em uma placa para ver detalhes
          </div>
        </div>
  
        <!-- painel lateral de detalhe -->
        <div class="trab-painel" id="trab-painel" aria-hidden="true">
          <button class="trab-painel-fechar" id="trab-fechar" aria-label="Fechar">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="trab-painel-inner" id="trab-painel-inner"></div>
        </div>
  
        <div class="trab-overlay" id="trab-overlay"></div>
      `;
  
      _initCarrossel();
      _bindEventos();
      _initFlocos();
      _initObserver();
    }
  
    // ── inicia o Three.js ──────────────────────────────────────────────────────
    function _initCarrossel() {
      const canvas = document.getElementById('trab-canvas');
      if (!canvas || typeof TrabalhosCubos === 'undefined') return;
      TrabalhosCubos.init(canvas);
    }
  
    function _initFlocos() {
      if (typeof initFlocos === 'undefined') return;
      initFlocos('trabalhos-flocos', { quantidade: 5, opacidade: 0.08, velocidade: 0.003 });
    }
  
    function _initObserver() {
      const secao = document.getElementById('trabalhos');
      if (!secao) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { secao.classList.add('trab--visivel'); obs.unobserve(secao); }
        });
      }, { threshold: 0.12 });
      obs.observe(secao);
    }
  
    // ── eventos ────────────────────────────────────────────────────────────────
    function _bindEventos() {
      const canvas = document.getElementById('trab-canvas');
  
      // placa clicada → abre painel
      canvas?.addEventListener('cuboclicado', e => _abrirPainel(e.detail.idx));
  
      // fechar
      document.getElementById('trab-fechar')?.addEventListener('click', _fecharPainel);
      document.getElementById('trab-overlay')?.addEventListener('click', _fecharPainel);
      document.addEventListener('keydown', e => { if (e.key === 'Escape') _fecharPainel(); });
    }
  
    // ── painel ─────────────────────────────────────────────────────────────────
    function _abrirPainel(idx) {
      const proj    = TRABALHOS[idx];
      if (!proj) return;
      const inner   = document.getElementById('trab-painel-inner');
      const painel  = document.getElementById('trab-painel');
      const overlay = document.getElementById('trab-overlay');
      const hint    = document.getElementById('trab-hint');
      if (!inner || !painel) return;
  
      inner.innerHTML = `
        <div class="trab-painel-acento" style="background:${proj.corHex}"></div>
        <div class="trab-painel-categoria" style="color:${proj.corHex}">
          <i class="fa-solid ${proj.icone}"></i>
          ${proj.categoria}
        </div>
        <h3 class="trab-painel-nome">${proj.nome}</h3>
        <p class="trab-painel-desc">${proj.desc}</p>
        <div class="trab-painel-dados">
          ${proj.dados.map(d => `
            <div class="trab-dado">
              <span class="trab-dado-label">${d.label}</span>
              <span class="trab-dado-valor" style="color:${proj.corHex}">${d.valor}</span>
            </div>
          `).join('')}
        </div>
        <button class="trab-painel-btn" style="border-color:${proj.corHex};color:${proj.corHex}">
          <i class="fa-solid fa-arrow-right"></i>
          Ver Projeto Completo
        </button>
      `;
  
      painel.classList.add('trab-painel--aberto');
      painel.setAttribute('aria-hidden', 'false');
      if (overlay) overlay.classList.add('trab-overlay--visivel');
      if (hint)    hint.style.opacity = '0';
    }
  
    function _fecharPainel() {
      document.getElementById('trab-painel')?.classList.remove('trab-painel--aberto');
      document.getElementById('trab-painel')?.setAttribute('aria-hidden', 'true');
      document.getElementById('trab-overlay')?.classList.remove('trab-overlay--visivel');
      const hint = document.getElementById('trab-hint');
      if (hint) hint.style.opacity = '1';
    }
  
    // ── bootstrap ──────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _renderSecao);
    } else {
      _renderSecao();
    }
  
  })();