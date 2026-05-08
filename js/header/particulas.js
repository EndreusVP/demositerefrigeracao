// js/particulas.js
// sistema de partículas — 900 pontos de gelo flutuando no fundo

const particlesCount = 900;

// arrays tipados: x,y,z por partícula
const positions = new Float32Array(particlesCount * 3);
const sizes     = new Float32Array(particlesCount);
const colors    = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  // posição aleatória no volume 3D
  positions[i * 3]     = (Math.random() - 0.5) * 80; // X
  positions[i * 3 + 1] = (Math.random() - 0.5) * 60; // Y
  positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // Z

  // tamanho variado
  sizes[i] = Math.random() * 2.5 + 0.3;

  // cor entre azul escuro e ciano
  const t = Math.random();
  colors[i * 3]     = t * 0.2;        // R
  colors[i * 3 + 1] = t * 0.7 + 0.3; // G
  colors[i * 3 + 2] = 1.0;            // B — sempre máximo
}

const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
particlesGeo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

const particlesMat = new THREE.PointsMaterial({
  size: 0.35,
  vertexColors: true,  // usa o atributo color acima
  transparent: true,
  opacity: 0.65,
  sizeAttenuation: true, // partículas distantes ficam menores
});

// exporta para o hero-background.js usar
const particles = new THREE.Points(particlesGeo, particlesMat);