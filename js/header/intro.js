// js/intro.js
// animação de abertura do site — floco de neve 3D
// roda uma vez, revela o conteúdo e se encerra
// depende de: three.js carregado antes

// canvas próprio da intro — removido do dom ao terminar
const introCanvas = document.createElement('canvas');
introCanvas.id = 'intro-canvas';
introCanvas.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 9999;
  background: #020b18;
`;
document.body.appendChild(introCanvas);

// trava o scroll enquanto a intro roda
document.body.style.overflow = 'hidden';


// renderer da intro
const introRenderer = new THREE.WebGLRenderer({ canvas: introCanvas, antialias: true, alpha: false });
introRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
introRenderer.setClearColor(0x020b18, 1);
introRenderer.setSize(window.innerWidth, window.innerHeight);

// cena e câmera da intro
const introScene  = new THREE.Scene();
const introCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
introCamera.position.z = 5;

// responsividade da intro
window.addEventListener('resize', () => {
  introRenderer.setSize(window.innerWidth, window.innerHeight);
  introCamera.aspect = window.innerWidth / window.innerHeight;
  introCamera.updateProjectionMatrix();
});


// iluminação da intro
const introAmbient = new THREE.AmbientLight(0x003366, 1);
introScene.add(introAmbient);

const introLight1 = new THREE.PointLight(0x00c3ff, 3, 20);
introLight1.position.set(3, 3, 3);
introScene.add(introLight1);

const introLight2 = new THREE.PointLight(0x0044ff, 2, 15);
introLight2.position.set(-3, -2, 2);
introScene.add(introLight2);


// floco de neve 3D — grupo com 6 braços + 6 braços secundários
const snowflake = new THREE.Group();
introScene.add(snowflake);

const armMat = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  emissive: 0x003388,
  shininess: 150,
  transparent: true,
  opacity: 1,
});

// cria um braço do floco (haste + dois galhos)
function makeArm() {
  const arm = new THREE.Group();

  // haste principal
  const hasteGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
  const haste    = new THREE.Mesh(hasteGeo, armMat);
  haste.position.y = 0.6;
  arm.add(haste);

  // galhos simétricos no meio da haste
  [-0.25, 0.25].forEach(offset => {
    const galhoGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8);
    const galho    = new THREE.Mesh(galhoGeo, armMat);
    galho.rotation.z = Math.PI / 3; // 60 graus
    galho.position.y = 0.6 + offset;
    arm.add(galho);
  });

  // ponta do braço (pirâmide hexagonal)
  const pontaGeo = new THREE.CylinderGeometry(0, 0.07, 0.18, 6);
  const ponta    = new THREE.Mesh(pontaGeo, armMat);
  ponta.position.y = 1.26;
  arm.add(ponta);

  return arm;
}

// 6 braços girados 60° entre si formam o floco completo
for (let i = 0; i < 6; i++) {
  const arm = makeArm();
  arm.rotation.z = (Math.PI / 3) * i; // 0°, 60°, 120°, 180°, 240°, 300°
  snowflake.add(arm);
}

// núcleo central do floco
const coreGeo = new THREE.OctahedronGeometry(0.12, 0);
const core    = new THREE.Mesh(coreGeo, armMat);
snowflake.add(core);

// escala inicial zero — cresce durante a animação
snowflake.scale.set(0, 0, 0);


// partículas de explosão — liberadas no final
const burstCount = 300;
const burstPositions = new Float32Array(burstCount * 3);
const burstVelocities = [];

for (let i = 0; i < burstCount; i++) {
  burstPositions[i * 3]     = 0;
  burstPositions[i * 3 + 1] = 0;
  burstPositions[i * 3 + 2] = 0;

  // velocidade aleatória em todas as direções
  burstVelocities.push(new THREE.Vector3(
    (Math.random() - 0.5) * 0.18,
    (Math.random() - 0.5) * 0.18,
    (Math.random() - 0.5) * 0.18,
  ));
}

const burstGeo = new THREE.BufferGeometry();
burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));

const burstMat = new THREE.PointsMaterial({
  size: 0.06,
  color: 0x00c3ff,
  transparent: true,
  opacity: 0,
  sizeAttenuation: true,
});

const burst = new THREE.Points(burstGeo, burstMat);
introScene.add(burst);


// controle de fases da intro
// fase 0 — crescendo   (0.0 ~ 0.4)
// fase 1 — girando     (0.4 ~ 0.7)
// fase 2 — explodindo  (0.7 ~ 0.85)
// fase 3 — revelando   (0.85 ~ 1.0)
let progress  = 0;
let introOver = false;

// lerp linear entre dois valores
function lerp(a, b, t) { return a + (b - a) * t; }

// ease out — desacelera no final
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

// ease in out — suave nos dois extremos
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }


// encerra a intro: remove canvas, libera scroll, inicia hero
function endIntro() {
  if (introOver) return;
  introOver = true;

  // fade out do canvas via css
  introCanvas.style.transition = 'opacity 0.6s ease';
  introCanvas.style.opacity    = '0';

  setTimeout(() => {
    introCanvas.remove();              // remove do dom
    document.body.style.overflow = ''; // libera scroll

    // dispara evento para o hero-background.js saber que pode iniciar
    window.dispatchEvent(new Event('introEnd'));
  }, 600);
}


// loop de animação da intro
function animateIntro() {
  if (introOver) return;
  requestAnimationFrame(animateIntro);

  progress += 0.008; // velocidade geral da intro
  const p = Math.min(progress, 1);

  // fase 0 — floco cresce do zero
  if (p < 0.4) {
    const t = easeOut(p / 0.4);
    snowflake.scale.setScalar(t * 1.2);
    snowflake.rotation.z += 0.01;
    snowflake.rotation.y += 0.005;
  }

  // fase 1 — floco gira e pulsa levemente
  else if (p < 0.7) {
    const t = (p - 0.4) / 0.3;
    snowflake.scale.setScalar(1.2 + Math.sin(t * Math.PI * 3) * 0.06); // pulso
    snowflake.rotation.z += 0.025;
    snowflake.rotation.y += 0.012;
    introLight1.intensity = 3 + Math.sin(t * Math.PI * 4) * 1.5;       // brilho pulsando
  }

  // fase 2 — floco explode em partículas
  else if (p < 0.85) {
    const t = easeOut((p - 0.7) / 0.15);

    // floco encolhe e some
    snowflake.scale.setScalar(lerp(1.2, 0, t));
    snowflake.rotation.z += 0.06;

    // partículas aparecem e se expandem
    burstMat.opacity = lerp(0, 1, t);
    const pos = burstGeo.attributes.position.array;

    for (let i = 0; i < burstCount; i++) {
      pos[i * 3]     += burstVelocities[i].x;
      pos[i * 3 + 1] += burstVelocities[i].y;
      pos[i * 3 + 2] += burstVelocities[i].z;
    }
    burstGeo.attributes.position.needsUpdate = true;
  }

  // fase 3 — partículas somem, intro encerra
  else {
    const t = (p - 0.85) / 0.15;

    burstMat.opacity = lerp(1, 0, easeInOut(t));

    // continua movendo as partículas
    const pos = burstGeo.attributes.position.array;
    for (let i = 0; i < burstCount; i++) {
      pos[i * 3]     += burstVelocities[i].x * 0.5;
      pos[i * 3 + 1] += burstVelocities[i].y * 0.5;
      pos[i * 3 + 2] += burstVelocities[i].z * 0.5;
    }
    burstGeo.attributes.position.needsUpdate = true;

    if (p >= 1) endIntro();
  }

  introRenderer.render(introScene, introCamera);
}

animateIntro();