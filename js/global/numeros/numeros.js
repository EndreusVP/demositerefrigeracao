// js/global/numeros/numeros.js
// Seção de números — geladeira expositora 3D com displays digitais internos
// Os cards HTML dos números são sobrepostos via CSS 3D transform sobre o canvas
// Sem dependências externas além de freezer.js (Three.js)

// ── dados ──────────────────────────────────────────────────────────────────
const NUMEROS_DATA = [
  {
    icone:  'fa-solid fa-snowflake',
    valor:  '1200',
    sufixo: '+',
    nome:   'Projetos entregues',
    desc:   'instalações concluídas',
  },
  {
    icone:  'fa-solid fa-star',
    valor:  '98',
    sufixo: '%',
    nome:   'Satisfação',
    desc:   'dos clientes',
  },
  {
    icone:  'fa-solid fa-calendar-check',
    valor:  '15',
    sufixo: '+',
    nome:   'Anos',
    desc:   'de experiência',
  },
  {
    icone:  'fa-solid fa-headset',
    valor:  '24',
    sufixo: 'h',
    nome:   'Suporte',
    desc:   'técnico ativo',
  },
];

// ── renderiza a seção ──────────────────────────────────────────────────────
function renderNumeros() {
  const secao = document.getElementById('numeros');
  if (!secao) return;

  // limpa conteúdo gerado anteriormente
  secao.innerHTML = '';

  // layout: duas colunas — esquerda (texto + displays), direita (canvas 3D)
  secao.style.cssText += `
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 4rem;
    padding: 6rem 4rem;
    position: relative;
    overflow: hidden;
  `;

  // ── coluna esquerda ────────────────────────────────────────────────────────
  const esquerda = document.createElement('div');
  esquerda.className = 'numeros-esquerda';
  esquerda.style.cssText = `
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 460px;
    flex-shrink: 0;
  `;

  // cabeçalho
  const header = document.createElement('div');
  header.innerHTML = `
    <span class="numeros-label">Em números</span>
    <h2 class="numeros-titulo">Nossa <span>trajetória</span></h2>
    <p class="numeros-subtexto">Resultados que provam nossa excelência em refrigeração industrial.</p>
  `;
  esquerda.appendChild(header);

  // grid 2×2
  const grid = document.createElement('div');
  grid.className = 'numeros-grid';

  NUMEROS_DATA.forEach(dado => {
    const item = _criarItem(dado);
    grid.appendChild(item);
  });

  esquerda.appendChild(grid);
  secao.appendChild(esquerda);

  // ── coluna direita: canvas 3D ──────────────────────────────────────────────
  const direita = document.createElement('div');
  direita.className = 'numeros-direita';
  direita.style.cssText = `
    position: relative;
    z-index: 2;
    flex-shrink: 0;
  `;

  const canvas = document.createElement('canvas');
  canvas.id = 'expositor-canvas';
  canvas.style.cssText = `
    width: 380px;
    height: 500px;
    display: block;
    filter: drop-shadow(0 24px 64px rgba(0, 60, 180, 0.35));
  `;
  direita.appendChild(canvas);

  // label decorativo abaixo do canvas
  const labelCanvas = document.createElement('div');
  labelCanvas.style.cssText = `
    text-align: center;
    margin-top: 0.8rem;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(0, 195, 255, 0.35);
  `;
  labelCanvas.textContent = 'Expositor · Linha Premium';
  direita.appendChild(labelCanvas);

  secao.appendChild(direita);

  // ── inicia o modelo 3D após o canvas estar no DOM ─────────────────────────
  requestAnimationFrame(() => {
    if (typeof ExpositorModel !== 'undefined') {
      ExpositorModel.init(canvas);
    }
  });

  // ── IntersectionObserver para os odômetros ────────────────────────────────
  _observarNumeros();
}

// ── cria um item do odômetro ───────────────────────────────────────────────
function _criarItem(dado) {
  const item = document.createElement('div');
  item.className = 'numero-item';

  // topo: ícone
  const topo = document.createElement('div');
  topo.className = 'numero-topo';

  const icone = document.createElement('span');
  icone.className = 'numero-icone';
  icone.innerHTML = `<i class="${dado.icone}"></i>`;
  topo.appendChild(icone);

  item.appendChild(topo);

  // odômetro
  const wrap = document.createElement('div');
  wrap.className = 'odometro-wrap';

  const colunas = [];
  dado.valor.split('').forEach(d => {
    const col = document.createElement('div');
    col.className = 'digito-col';

    const faixa = document.createElement('div');
    faixa.className = 'digito-faixa';

    for (let n = 0; n <= 9; n++) {
      const dig = document.createElement('div');
      dig.className = 'digito';
      dig.textContent = n;
      faixa.appendChild(dig);
    }

    col.appendChild(faixa);
    wrap.appendChild(col);
    colunas.push({ faixa, alvo: parseInt(d, 10) });
  });

  // sufixo
  if (dado.sufixo) {
    const fixo = document.createElement('div');
    fixo.className = 'digito-fixo';
    fixo.textContent = dado.sufixo;
    wrap.appendChild(fixo);
  }

  item.appendChild(wrap);

  // nome + desc
  const nome = document.createElement('p');
  nome.className = 'numero-nome';
  nome.textContent = dado.nome;
  item.appendChild(nome);

  const desc = document.createElement('p');
  desc.className = 'numero-desc';
  desc.textContent = dado.desc;
  item.appendChild(desc);

  item._colunas = colunas;
  item._animado = false;

  return item;
}

// ── anima os dígitos rolando ────────────────────────────────────────────────
function _animarItem(item) {
  if (item._animado) return;
  item._animado = true;

  item._colunas.forEach((col, idx) => {
    setTimeout(() => {
      const alt = window.innerWidth <= 767 ? 30 : 36;
      col.faixa.style.transform = `translateY(${-(col.alvo * alt)}px)`;
    }, idx * 90);
  });
}

// ── observer ───────────────────────────────────────────────────────────────
function _observarNumeros() {
  // aguarda render
  setTimeout(() => {
    const itens = document.querySelectorAll('.numero-item');
    if (!itens.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => _animarItem(e.target), 250);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    itens.forEach(i => obs.observe(i));
  }, 100);
}

// ── bootstrap ──────────────────────────────────────────────────────────────
renderNumeros();