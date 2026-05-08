// js/hero-background.js
// setup do three.js: renderer, câmera, luzes e loop de animação
// depende de: particulas.js e cristais.js carregados antes

// renderer
const canvas = document.getElementById('canvas-bg');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x020b18, 1);

// cena e câmera
const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.z = 30;

// responsividade
function resize() {
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight || window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener('resize', resize);

// rastreamento do mouse — move a câmera suavemente
const mouse = new THREE.Vector2(0, 0);
document.addEventListener('mousemove', e => {
  mouse.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
  mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// adiciona objetos na cena (vindos de particulas.js e cristais.js)
scene.add(particles);
scene.add(crystalGroup);

// iluminação
const ambientLight = new THREE.AmbientLight(0x003366, 0.8);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x00c3ff, 1.5, 50); // ciano — orbita
pointLight1.position.set(10, 10, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x0044ff, 1, 40);   // azul — fixo
pointLight2.position.set(-10, -5, 5);
scene.add(pointLight2);

// loop de animação
let t = 0;

function animate() {
  requestAnimationFrame(animate);
  t += 0.008;

  // partículas giram lentamente
  particles.rotation.y += 0.0012;
  particles.rotation.x += 0.0004;

  // câmera segue o mouse com inércia
  camera.position.x += (mouse.x * 3 - camera.position.x) * 0.04;
  camera.position.y += (mouse.y * 2 - camera.position.y) * 0.04;
  camera.lookAt(scene.position);

  // cristais: rotação + flutuação senoidal
  crystal1.rotation.y = t * 0.4;
  crystal1.position.y = -2 + Math.sin(t * 0.7) * 0.8;

  crystal2.rotation.y = -t * 0.3;
  crystal2.position.y =  3 + Math.cos(t * 0.5) * 0.6;

  crystal3.rotation.y = t * 0.5;
  crystal3.position.y =  5 + Math.sin(t * 0.9) * 0.5;

  // luz 1 orbitando
  pointLight1.position.x = Math.sin(t * 0.6) * 12;
  pointLight1.position.y = Math.cos(t * 0.4) * 8;

  renderer.render(scene, camera);
}

animate();