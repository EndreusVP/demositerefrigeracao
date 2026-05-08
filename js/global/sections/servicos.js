// js/sections/servicos.js
// seção de serviços — renderiza os cards e inicia os flocos decorativos
// depende de: flocos-decorativos.js carregado antes

// dados de cada serviço — frente e verso do card
const servicos = [
  {
    icone: '❄️',
    tag: 'Residencial',
    nome: 'Instalação de Ar',
    desc: 'Instalação profissional de splits e sistemas centrais.',
    versoTitulo: 'O que incluímos',
    versoItens: [
      'Splits e multi-splits',
      'Ar central e VRF',
      'Dutos e infraestrutura',
      'Teste e comissionamento',
    ],
  },
  {
    icone: '🔧',
    tag: 'Preventiva',
    nome: 'Manutenção Preventiva',
    desc: 'Revisões periódicas para manter o sistema em perfeito estado.',
    versoTitulo: 'O que incluímos',
    versoItens: [
      'Limpeza de filtros',
      'Verificação de gás',
      'Inspeção elétrica',
      'Relatório técnico',
    ],
  },
  {
    icone: '⚡',
    tag: 'Corretiva',
    nome: 'Manutenção Corretiva',
    desc: 'Diagnóstico e reparo rápido de falhas e defeitos.',
    versoTitulo: 'O que incluímos',
    versoItens: [
      'Diagnóstico completo',
      'Troca de peças',
      'Recarga de gás',
      'Garantia do serviço',
    ],
  },
  {
    icone: '🧊',
    tag: 'Industrial',
    nome: 'Câmara Fria',
    desc: 'Projeto, instalação e manutenção de câmaras frigoríficas.',
    versoTitulo: 'O que incluímos',
    versoItens: [
      'Câmaras de resfriamento',
      'Câmaras de congelamento',
      'Painéis isotérmicos',
      'Controle de temperatura',
    ],
  },
  {
    icone: '🏭',
    tag: 'Industrial',
    nome: 'Refrigeração Industrial',
    desc: 'Soluções de grande porte para indústrias e galpões.',
    versoTitulo: 'O que incluímos',
    versoItens: [
      'Chillers e fan coils',
      'Torres de resfriamento',
      'Sistemas de CO₂',
      'Automação e controle',
    ],
  },
  {
    icone: '🫧',
    tag: 'Higienização',
    nome: 'Limpeza e Higienização',
    desc: 'Limpeza especializada com produtos certificados.',
    versoTitulo: 'O que incluímos',
    versoItens: [
      'Higienização de evaporador',
      'Limpeza química de dutos',
      'Laudo de qualidade do ar',
      'Certificado de execução',
    ],
  },
];

// renderiza os cards no grid
function renderCards() {
  const grid = document.querySelector('.servicos-grid');
  if (!grid) return;

  servicos.forEach(s => {
    const wrap = document.createElement('div');
    wrap.className = 'card-wrap';

    wrap.innerHTML = `
      <div class="card-inner">

        <!-- frente -->
        <div class="card-frente">
          <span class="card-tag">${s.tag}</span>
          <span class="card-icone">${s.icone}</span>
          <p class="card-nome">${s.nome}</p>
          <p class="card-desc">${s.desc}</p>
        </div>

        <!-- verso -->
        <div class="card-verso">
          <p class="verso-titulo">${s.versoTitulo}</p>
          <ul class="verso-lista">
            ${s.versoItens.map(item => `<li>${item}</li>`).join('')}
          </ul>
          <button class="verso-btn">Solicitar</button>
        </div>

      </div>
    `;

    grid.appendChild(wrap);
  });
}

// inicia tudo quando o dom estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  renderCards();

  // flocos decorativos nas extremidades da seção
  // initFlocos vem de flocos-decorativos.js
  initFlocos('servicos-flocos', {
    quantidade: 6,
    opacidade:  0.1,
    velocidade: 0.003,
  });
});