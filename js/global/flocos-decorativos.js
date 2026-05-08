// js/global/flocos-decorativos.js
// flocos 3D decorativos nas extremidades das seções
// reutilizável — chame initFlocos(containerId) em qualquer seção
// depende de: three.js carregado antes

// guarda todas as instâncias ativas para o loop global
const _instanciasFlocos = [];

// inicia os flocos decorativos em um container específico
// containerId: id do elemento html que receberá o canvas
// opções: { quantidade, opacidade, velocidade }
function initFlocos(containerId, opcoes = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const {
    quantidade  = 4,
    opacidade   = 0.12,
    velocidade  = 0.004,
  } = opcoes;

  // canvas do floco — cobre o container inteiro
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
  `;
  container.appendChild(canvas);

  // renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(container.clientWidth, container.clientHeight);

  // cena e câmera
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.z = 6;

  // responsividade
  const resizeObs = new ResizeObserver(() => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
  });
  resizeObs.observe(container);

  // iluminação suave
  const ambientLight = new THREE.AmbientLight(0x003366, 0.6);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x00c3ff, 1.2, 20);
  pointLight.position.set(2, 2, 4);
  scene.add(pointLight);

  // material compartilhado entre todos os flocos
  const mat = new THREE.MeshPhongMaterial({
    color: 0x00aaff,
    emissive: 0x002244,
    shininess: 100,
    transparent: true,
    opacity: opacidade,
  });

  // cria um floco de neve 3D (6 braços + núcleo)
  function makeFloco(escala) {
    const floco = new THREE.Group();

    // braços — 6 rotacionados 60° entre si
    for (let i = 0; i < 6; i++) {
      const braco = new THREE.Group();

      // haste principal
      const hasteGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 8);
      const haste    = new THREE.Mesh(hasteGeo, mat);
      haste.position.y = 0.5;
      braco.add(haste);

      // galhos simétricos
      [-0.2, 0.2].forEach(offset => {
        const galhoGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8);
        const galho    = new THREE.Mesh(galhoGeo, mat);
        galho.rotation.z = Math.PI / 3;
        galho.position.y = 0.5 + offset;
        braco.add(galho);
      });

      // ponta hexagonal
      const pontaGeo = new THREE.CylinderGeometry(0, 0.06, 0.15, 6);
      const ponta    = new THREE.Mesh(pontaGeo, mat);
      ponta.position.y = 1.08;
      braco.add(ponta);

      braco.rotation.z = (Math.PI / 3) * i;
      floco.add(braco);
    }

    // núcleo central
    const coreGeo = new THREE.OctahedronGeometry(0.1, 0);
    const core    = new THREE.Mesh(coreGeo, mat);
    floco.add(core);

    floco.scale.setScalar(escala);
    return floco;
  }

  // posiciona flocos nas extremidades esquerda e direita
  const flocos = [];
  const largura = 4.5; // distância do centro até as extremidades

  for (let i = 0; i < quantidade; i++) {
    const floco = makeFloco(0.6 + Math.random() * 0.5);

    // alterna entre extremidade esquerda e direita
    const lado = i % 2 === 0 ? -largura : largura;
    floco.position.set(
      lado + (Math.random() - 0.5) * 1.2,    // X — extremidade com leve variação
      (Math.random() - 0.5) * 4,              // Y — altura aleatória
      (Math.random() - 0.5) * 2              // Z — profundidade aleatória
    );

    // velocidade e direção de rotação únicos por floco
    floco.userData = {
      vRotX: (Math.random() - 0.5) * velocidade * 2,
      vRotY: (Math.random() - 0.5) * velocidade * 2,
      vRotZ: velocidade * (Math.random() > 0.5 ? 1 : -1),
      vFloat: Math.random() * 0.003,          // velocidade de flutuação
      floatOffset: Math.random() * Math.PI * 2, // fase inicial da flutuação
      posYInicial: floco.position.y,
    };

    scene.add(floco);
    flocos.push(floco);
  }

  // guarda instância para o loop global
  _instanciasFlocos.push({ renderer, scene, camera, flocos });
}

// loop global — anima todas as instâncias de flocos
let _tempoFlocos = 0;

function _loopFlocos() {
  requestAnimationFrame(_loopFlocos);
  _tempoFlocos += 0.016;

  _instanciasFlocos.forEach(({ renderer, scene, camera, flocos }) => {
    flocos.forEach(floco => {
      const d = floco.userData;

      // rotação contínua
      floco.rotation.x += d.vRotX;
      floco.rotation.y += d.vRotY;
      floco.rotation.z += d.vRotZ;

      // flutuação senoidal suave
      floco.position.y = d.posYInicial + Math.sin(_tempoFlocos * d.vFloat * 60 + d.floatOffset) * 0.3;
    });

    renderer.render(scene, camera);
  });
}

_loopFlocos();