// js/global/numeros/numeros.js
// Seção de números — geladeira expositora interativa em CSS/HTML puro
// Porta fechada → clique → abre com fumaça de gelo → revela odômetros
// Não depende de Three.js

(function () {

  // ── dados ────────────────────────────────────────────────────────────────
  const DADOS = [
    { val: '1200', suf: '+', lbl: 'Projetos entregues' },
    { val: '98',   suf: '%', lbl: 'Satisfação'         },
    { val: '15',   suf: '+', lbl: 'Anos de exp.'       },
    { val: '24',   suf: 'h', lbl: 'Suporte técnico'    },
  ];

  // ── renderiza toda a seção ───────────────────────────────────────────────
  function render() {
    const secao = document.getElementById('numeros');
    if (!secao) return;

    secao.innerHTML = `

      <!-- grade SVG de fundo -->
      <svg class="num-grid-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="num-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0L0 0 0 60" fill="none" stroke="rgba(0,120,200,0.05)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#num-grid)"/>
        <ellipse cx="65%" cy="50%" rx="35%" ry="45%" fill="rgba(0,80,180,0.07)"/>
      </svg>

      <!-- coluna esquerda: copy -->
      <div class="num-copy">
        <span class="numeros-label">Em números</span>
        <h2 class="numeros-titulo">Nossa <span>trajetória</span></h2>
        <p class="num-sub">Resultados que comprovam nossa excelência em refrigeração industrial.</p>
        <div class="num-hint" id="num-hint">
          <span class="num-hint-dot"></span>
          Clique na porta para revelar
        </div>
      </div>

      <!-- geladeira -->
      <div class="num-fridge" id="num-fridge" title="Clique para abrir">

        <!-- corpo permanente -->
        <div class="num-fridge-body"></div>

        <!-- interior: revelado após abertura -->
        <div class="num-fridge-interior" id="num-interior">
          <div class="num-led num-led-top"></div>
          <div class="num-led num-led-bot"></div>
          <div class="num-shelves" id="num-shelves">
            ${DADOS.map((d, i) => `
              <div class="num-shelf" data-val="${d.val}" data-suf="${d.suf}" data-lbl="${d.lbl}" data-idx="${i}"></div>
            `).join('')}
          </div>
        </div>

        <!-- porta (pivô à esquerda) -->
        <div class="num-door" id="num-door">
          <div class="num-door-face">
            <div class="num-door-glare"></div>
            <div class="num-door-glass">
              <div class="num-door-glass-shine"></div>
            </div>
            <div class="num-door-brand">REFRIGERA · SIM</div>
            <div class="num-door-handle"></div>
          </div>
        </div>

        <!-- acabamentos -->
        <div class="num-fridge-top"></div>
        <div class="num-fridge-foot num-foot-l"></div>
        <div class="num-fridge-foot num-foot-r"></div>

        <!-- partículas de fumaça -->
        <div class="num-smoke-wrap" id="num-smoke"></div>

      </div>
    `;

    _buildShelves();
    document.getElementById('num-fridge').addEventListener('click', _openFridge);
  }

  // ── monta odômetros em cada prateleira ───────────────────────────────────
  function _buildShelves() {
    document.querySelectorAll('.num-shelf').forEach((shelf, i) => {
      const val    = shelf.dataset.val;
      const suf    = shelf.dataset.suf;
      const lbl    = shelf.dataset.lbl;
      const isLast = i === DADOS.length - 1;

      const row = document.createElement('div');
      row.className = 'num-odo-row';

      val.split('').forEach(d => {
        const col   = document.createElement('div');
        col.className = 'num-odo-col';

        const strip = document.createElement('div');
        strip.className = 'num-odo-strip';
        strip.dataset.target = d;

        for (let n = 0; n <= 9; n++) {
          const dig = document.createElement('div');
          dig.className = 'num-odo-dig';
          dig.textContent = n;
          strip.appendChild(dig);
        }
        col.appendChild(strip);
        row.appendChild(col);
      });

      const sfxEl = document.createElement('div');
      sfxEl.className = 'num-odo-suf';
      sfxEl.textContent = suf;
      row.appendChild(sfxEl);

      const lblEl = document.createElement('div');
      lblEl.className = 'num-shelf-lbl';
      lblEl.textContent = lbl;

      shelf.appendChild(row);
      shelf.appendChild(lblEl);

      if (!isLast) {
        const div = document.createElement('div');
        div.className = 'num-shelf-div';
        shelf.appendChild(div);
      }
    });
  }

  // ── rola os dígitos ──────────────────────────────────────────────────────
  function _rollDigits() {
    document.querySelectorAll('.num-odo-strip').forEach(strip => {
      const t = parseInt(strip.dataset.target, 10);
      strip.style.transform = `translateY(${-(t * 22)}px)`;
    });
  }

  // ── fumaça de gelo ───────────────────────────────────────────────────────
  function _spawnSmoke(count, delayBase) {
    const wrap = document.getElementById('num-smoke');
    if (!wrap) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const p    = document.createElement('div');
        const size = 22 + Math.random() * 34;
        const sx   = 10 + Math.random() * 80;
        const sy   = 15 + Math.random() * 70;
        const dx   = (-80  + Math.random() * 160).toFixed(1) + 'px';
        const dy   = (-100 - Math.random() * 120).toFixed(1) + 'px';
        const dur  = (0.8  + Math.random() * 0.9).toFixed(2) + 's';

        p.className = 'num-smoke-p';
        p.style.cssText = `
          left:${sx}%; top:${sy}%;
          width:${size}px; height:${size}px;
          --dx:${dx}; --dy:${dy};
          animation-duration:${dur};
        `;
        wrap.appendChild(p);
        setTimeout(() => p.remove(), 2400);
      }, i * 55 + delayBase);
    }
  }

  // ── toggle abre / fecha ───────────────────────────────────────────────────
  let _opened  = false;
  let _busy    = false; // impede cliques durante a animação

  function _openFridge() {
    if (_busy) return;
    _busy = true;

    const door     = document.getElementById('num-door');
    const interior = document.getElementById('num-interior');
    const shelves  = document.getElementById('num-shelves');
    const hint     = document.getElementById('num-hint');

    if (!_opened) {
      // ── ABRE ──────────────────────────────────────────────────────────────
      _opened = true;

      if (hint) { hint.style.opacity = '0'; hint.style.pointerEvents = 'none'; }

      if (door) door.classList.add('num-door--open');

      // fumaça em três ondas
      _spawnSmoke(20,  280);
      _spawnSmoke(16,  680);
      _spawnSmoke(12, 1100);

      if (interior) interior.classList.add('num-interior--visible');
      if (shelves)  shelves.classList.add('num-shelves--visible');

      document.querySelectorAll('.num-shelf').forEach((shelf, i) => {
        setTimeout(() => shelf.classList.add('num-shelf--visible'), 850 + i * 160);
      });

      setTimeout(_rollDigits, 1100);

      // libera após a animação de abertura terminar
      setTimeout(() => { _busy = false; }, 1400);

    } else {
      // ── FECHA ─────────────────────────────────────────────────────────────
      _opened = false;

      // some prateleiras
      document.querySelectorAll('.num-shelf').forEach(shelf => {
        shelf.classList.remove('num-shelf--visible');
      });

      // some interior com pequeno delay
      setTimeout(() => {
        if (shelves)  shelves.classList.remove('num-shelves--visible');
        if (interior) interior.classList.remove('num-interior--visible');
      }, 200);

      // fecha a porta
      if (door) door.classList.remove('num-door--open');

      // reexibe hint
      setTimeout(() => {
        if (hint) { hint.style.opacity = '1'; hint.style.pointerEvents = ''; }
      }, 800);

      // reseta os dígitos de volta ao 0
      setTimeout(() => {
        document.querySelectorAll('.num-odo-strip').forEach(strip => {
          strip.style.transition = 'none';
          strip.style.transform  = 'translateY(0)';
          // reativa a transição no próximo frame
          requestAnimationFrame(() => {
            strip.style.transition = '';
          });
        });
      }, 600);

      // libera após a animação de fechamento terminar
      setTimeout(() => { _busy = false; }, 1400);
    }
  }

  // ── bootstrap ────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

})();