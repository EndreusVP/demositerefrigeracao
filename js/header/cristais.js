// js/cristais.js
// cristais de gelo 3D — prismas hexagonais espelhados

const crystalGroup = new THREE.Group();

// cria um cristal duplo (dois cones hexagonais invertidos)
function makeCrystal(scale, x, y, z, opacity) {
  // raioTopo=0 deixa cônico, 6 lados = hexagonal
  const geo = new THREE.CylinderGeometry(0, scale, scale * 2.2, 6, 1);

  const mat = new THREE.MeshPhongMaterial({
    color: 0x00aaff,
    emissive: 0x003366, // brilho interno azul
    transparent: true,
    opacity,
    shininess: 120,     // reflexo intenso
  });

  const top = new THREE.Mesh(geo, mat);       // cone para cima
  const bot = new THREE.Mesh(geo, mat);       // cone para baixo
  bot.rotation.x = Math.PI;
  bot.position.y = -scale * 0.3;

  const crystal = new THREE.Group();
  crystal.add(top, bot);
  crystal.position.set(x, y, z);

  return crystal;
}

// 3 cristais com tamanhos e posições diferentes
const crystal1 = makeCrystal(3.2,  8, -2,  -8, 0.18); // grande, direita
const crystal2 = makeCrystal(1.8, -10,  3,  -5, 0.13); // pequeno, esquerda
const crystal3 = makeCrystal(2.4,   2,  5, -12, 0.12); // médio, fundo

crystalGroup.add(crystal1, crystal2, crystal3);