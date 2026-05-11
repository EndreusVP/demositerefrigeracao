// js/global/sections/sobre/fios.js
// fios de ar-condicionado 3D — TubeGeometry com CatmullRomCurve3
// isolamento colorido (vermelho, azul, amarelo) + animação de vida
// interação: repulsão passiva do cursor + cortar fio com clique
// depende de: three.js carregado antes

const FiosSobre = (() => {

  // ── paleta de fios ─────────────────────────────────────────────────────────
  const FIOS_CONFIG = [
    { cor: 0xcc2200, emissiva: 0x330500, nome: 'fase-R', raio: 0.048 },
    { cor: 0x1155ee, emissiva: 0x001144, nome: 'fase-S', raio: 0.048 },
    { cor: 0xddaa00, emissiva: 0x443300, nome: 'fase-T', raio: 0.048 },
    { cor: 0x229933, emissiva: 0x001108, nome: 'terra',  raio: 0.034 },
    { cor: 0xcccccc, emissiva: 0x222222, nome: 'neutro', raio: 0.034 },
  ];

  // ── estado interno ─────────────────────────────────────────────────────────
  let renderer, scene, camera, animId, canvasEl;
  let fiosMeshes = [];   // fios vivos
  let pedacosMeshes = []; // pedaços cortados caindo
  let tempo = 0;

  // ── cursor ─────────────────────────────────────────────────────────────────
  const mouse3D = new THREE.Vector3();
  const velPts  = {};

  // ── raycaster para detectar clique nos fios ────────────────────────────────
  const raycaster  = new THREE.Raycaster();
  raycaster.params.Line = { threshold: 0.1 };
  const mouseNDC   = new THREE.Vector2();

  // ── init ───────────────────────────────────────────────────────────────────
  function init(el) {
    canvasEl = el;
    const pai = el.parentElement;
    const w   = pai.clientWidth  || window.innerWidth;
    const h   = pai.clientHeight || window.innerHeight;

    renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);
    renderer.sortObjects = true;

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    camera.position.set(0, 0, 16);

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const luz1 = new THREE.PointLight(0xffffff, 2.2, 80);
    luz1.position.set(6, 8, 14);
    scene.add(luz1);
    const luz2 = new THREE.PointLight(0xbbddff, 1.2, 60);
    luz2.position.set(-8, -6, 10);
    scene.add(luz2);

    _criarFios();
    _bindEventos(pai);

    new ResizeObserver(() => {
      const nw = pai.clientWidth  || window.innerWidth;
      const nh = pai.clientHeight || window.innerHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    }).observe(pai);

    _loop();
  }

  // ── converte tela → 3D no plano Z=0 ───────────────────────────────────────
  function _screenTo3D(clientX, clientY) {
    const rect = canvasEl.getBoundingClientRect();
    const nx   = ((clientX - rect.left)  / rect.width)  * 2 - 1;
    const ny   = -((clientY - rect.top) / rect.height) * 2 + 1;
    const vec  = new THREE.Vector3(nx, ny, 0.5);
    vec.unproject(camera);
    const dir  = vec.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(dist));
  }

  // ── eventos ────────────────────────────────────────────────────────────────
  function _bindEventos(pai) {

    pai.addEventListener('mousemove', e => {
      const p = _screenTo3D(e.clientX, e.clientY);
      mouse3D.set(p.x, p.y, 0);

      // NDC para raycaster
      const rect = canvasEl.getBoundingClientRect();
      mouseNDC.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouseNDC.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    });

    pai.addEventListener('touchmove', e => {
      e.preventDefault();
      const p = _screenTo3D(e.touches[0].clientX, e.touches[0].clientY);
      mouse3D.set(p.x, p.y, 0);
    }, { passive: false });

    // ── clique: tenta cortar o fio mais próximo ────────────────────────────
    pai.addEventListener('click', e => {
      const p = _screenTo3D(e.clientX, e.clientY);
      _tentarCortar(p);
    });

    pai.addEventListener('touchend', e => {
      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        const p = _screenTo3D(t.clientX, t.clientY);
        _tentarCortar(p);
      }
    });

    canvasEl.style.cursor = 'crosshair';
  }

  // ── tenta cortar o fio mais próximo do ponto clicado ──────────────────────
  function _tentarCortar(p) {
    const RAIO_CORTE = 1.8; // distância máxima para considerar o corte

    let melhorDist = Infinity;
    let melhorFio  = null;
    let melhorPtIdx = 0;

    fiosMeshes.forEach(fio => {
      fio.pts.forEach((pt, i) => {
        const d = Math.hypot(pt.x - p.x, pt.y - p.y);
        if (d < melhorDist) {
          melhorDist  = d;
          melhorFio   = fio;
          melhorPtIdx = i;
        }
      });
    });

    if (melhorFio && melhorDist < RAIO_CORTE) {
      _cortarFio(melhorFio, melhorPtIdx);
    }
  }

  // ── corta um fio no ponto indicado ────────────────────────────────────────
  function _cortarFio(fio, ptCorte) {
    // remove o fio original da lista e da cena
    fiosMeshes = fiosMeshes.filter(f => f.id !== fio.id);
    scene.remove(fio.mesh);
    fio.mesh.geometry.dispose();
    fio.mesh.material.dispose();

    // limpa velocidades do fio removido
    for (let i = 0; i < fio.nPontos; i++) {
      delete velPts[fio.id + '_' + i];
    }

    // garante pelo menos 2 pontos em cada pedaço
    const corte = Math.max(2, Math.min(ptCorte, fio.nPontos - 3));

    // cria dois pedaços: esquerda [0..corte] e direita [corte..fim]
    [
      fio.pts.slice(0, corte + 1),
      fio.pts.slice(corte),
    ].forEach((ptsSlice, lado) => {
      if (ptsSlice.length < 2) return;

      const ptsCopia = ptsSlice.map(p => p.clone());

      // velocidade inicial de queda + leve impulso lateral
      const vx = (Math.random() - 0.5) * 0.08;
      const vy = -(0.04 + Math.random() * 0.06); // cai para baixo
      const vr = (Math.random() - 0.5) * 0.03;  // rotação leve

      const mat = new THREE.MeshPhongMaterial({
        color:       fio.cfg.cor,
        emissive:    fio.cfg.emissiva,
        shininess:   90,
        specular:    0x555555,
        transparent: true,
        opacity:     fio.mesh.material.opacity,
        depthWrite:  false,
      });

      const curve = new THREE.CatmullRomCurve3(ptsCopia, false, 'catmullrom', 0.5);
      const geo   = new THREE.TubeGeometry(curve, ptsCopia.length * 6, fio.cfg.raio, 10, false);
      const mesh  = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      pedacosMeshes.push({
        mesh, pts: ptsCopia, cfg: fio.cfg,
        vx, vy, vr,
        vida: 1.0,        // opacidade inicial
        rotZ: 0,
      });
    });

    // ── dispara evento de fio cortado ────────────────────────────────────────
    canvasEl.dispatchEvent(new CustomEvent('fiocortado', { bubbles: true }));

    // efeito visual: flash branco rápido na seção
    _flashCorte();
  }

  // ── flash breve no corte ───────────────────────────────────────────────────
  function _flashCorte() {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed; inset: 0; z-index: 9998;
      background: rgba(255,255,255,0.18);
      pointer-events: none;
      transition: opacity 0.25s ease;
    `;
    document.body.appendChild(flash);
    requestAnimationFrame(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 300);
    });
  }

  // ── criação dos fios ───────────────────────────────────────────────────────
  let _fioId = 0;

  function _criarFios() {
    fiosMeshes.forEach(f => { scene.remove(f.mesh); });
    fiosMeshes = [];

    const TOTAL_FIOS     = 18;
    const nPontos        = 22;
    const alturaVisivel  = 14;
    const larguraVisivel = 28;

    for (let idx = 0; idx < TOTAL_FIOS; idx++) {
      const cfgBase  = FIOS_CONFIG[idx % FIOS_CONFIG.length];
      const yBase    = ((idx / (TOTAL_FIOS - 1)) - 0.5) * alturaVisivel * 0.85;
      const zBase    = Math.sin(idx * 1.3) * 3.5;
      const opacidade= 0.18 + (idx % 4) * 0.12;
      const fase     = (idx / TOTAL_FIOS) * Math.PI * 2 + idx * 0.7;
      const vel      = 0.002 + (idx % 6) * 0.0005;
      const caos     = 0.8 + (idx % 3) * 1.1;
      const id       = 'fio_' + (_fioId++);

      const pts = [];
      for (let i = 0; i < nPontos; i++) {
        const prog = i / (nPontos - 1);
        const x    = -larguraVisivel / 2 + prog * larguraVisivel;
        const ondaY1 = Math.sin(prog * Math.PI * 3.5 + fase) * caos * 1.0;
        const ondaY2 = Math.sin(prog * Math.PI * 7.0 + fase * 1.3) * caos * 0.4;
        const y      = yBase + ondaY1 + ondaY2;
        const z      = zBase + Math.sin(prog * Math.PI * 4 + fase * 0.8) * 2.0;
        pts.push(new THREE.Vector3(x, y, z));
        velPts[id + '_' + i] = { x: 0, y: 0 };
      }

      const mat = new THREE.MeshPhongMaterial({
        color:       cfgBase.cor,
        emissive:    cfgBase.emissiva,
        shininess:   90,
        specular:    0x555555,
        transparent: true,
        opacity:     opacidade,
        depthWrite:  false,
      });

      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
      const geo   = new THREE.TubeGeometry(curve, nPontos * 6, cfgBase.raio, 10, false);
      const mesh  = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      fiosMeshes.push({ id, mesh, pts, fase, vel, cfg: cfgBase,
        larguraVisivel, nPontos, zBase, yBase, caos });
    }
  }

  // ── loop ───────────────────────────────────────────────────────────────────
  function _loop() {
    animId = requestAnimationFrame(_loop);
    tempo += 0.016;
    _animar();
    _animarPedacos();
    renderer.render(scene, camera);
  }

  // ── animação dos pedaços cortados (física de queda) ────────────────────────
  function _animarPedacos() {
    const GRAVIDADE = 0.003;

    pedacosMeshes = pedacosMeshes.filter(p => {
      // gravidade + fade
      p.vy     -= GRAVIDADE;
      p.rotZ   += p.vr;
      p.vida   -= 0.008;

      p.pts.forEach(pt => {
        pt.x += p.vx;
        pt.y += p.vy;
      });

      p.mesh.rotation.z = p.rotZ;
      p.mesh.material.opacity = Math.max(0, p.vida * 0.5);

      // reconstrói geometry
      if (p.pts.length >= 2) {
        const curve   = new THREE.CatmullRomCurve3(p.pts, false, 'catmullrom', 0.5);
        const geoNova = new THREE.TubeGeometry(curve, p.pts.length * 6, p.cfg.raio, 10, false);
        p.mesh.geometry.dispose();
        p.mesh.geometry = geoNova;
      }

      // remove quando invisível
      if (p.vida <= 0) {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        return false;
      }
      return true;
    });
  }

  // ── animação dos fios vivos ────────────────────────────────────────────────
  function _animar() {
    const RAIO_REPULSAO  = 1.4;
    const FORCA_REPULSAO = 0.06;
    const AMORTECIMENTO  = 0.72;
    const RETORNO        = 0.055;

    fiosMeshes.forEach(fio => {
      const { id, pts, fase, vel, larguraVisivel, nPontos, zBase, yBase, caos } = fio;

      for (let i = 0; i < nPontos; i++) {
        const prog = i / (nPontos - 1);
        const x    = -larguraVisivel / 2 + prog * larguraVisivel;

        const ondaY1   = Math.sin(tempo * vel * 45 + fase + prog * Math.PI * 3.5) * caos * 1.0;
        const ondaY2   = Math.sin(tempo * vel * 70 + fase * 1.3 + prog * Math.PI * 7.0) * caos * 0.4;
        const yRepouso = yBase + ondaY1 + ondaY2;
        const ondaZ    = Math.sin(tempo * vel * 28 + fase * 0.8 + prog * Math.PI * 4) * 2.0;

        const key = id + '_' + i;
        const v   = velPts[key];
        if (!v) continue;

        const dx   = pts[i].x - mouse3D.x;
        const dy   = pts[i].y - mouse3D.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RAIO_REPULSAO && dist > 0.01) {
          const forca = (1 - dist / RAIO_REPULSAO) * FORCA_REPULSAO;
          v.x += (dx / dist) * forca;
          v.y += (dy / dist) * forca;
        }

        v.x += (x        - pts[i].x) * RETORNO * 0.3;
        v.y += (yRepouso - pts[i].y) * RETORNO;
        v.x *= AMORTECIMENTO;
        v.y *= AMORTECIMENTO;

        pts[i].x += v.x;
        pts[i].y += v.y;
        pts[i].z  = zBase + ondaZ;
      }

      const curve   = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
      const geoNova = new THREE.TubeGeometry(curve, nPontos * 6, fio.cfg.raio, 10, false);
      fio.mesh.geometry.dispose();
      fio.mesh.geometry = geoNova;
    });
  }

  // ── destroy ────────────────────────────────────────────────────────────────
  function destroy() {
    cancelAnimationFrame(animId);
    [...fiosMeshes, ...pedacosMeshes].forEach(f => {
      f.mesh.geometry.dispose();
      f.mesh.material.dispose();
      scene.remove(f.mesh);
    });
    renderer.dispose();
  }

  // ── initSomenteLeitura ─────────────────────────────────────────────────────
  // versão dos fios para touch devices — apenas visual, sem interação
  // não registra nenhum listener de mouse, touch ou clique
  function initSomenteLeitura(el) {
    canvasEl = el;
    const pai = el.parentElement;
    const w   = pai.clientWidth  || window.innerWidth;
    const h   = pai.clientHeight || window.innerHeight;

    renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    camera.position.set(0, 0, 16);

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const luz1 = new THREE.PointLight(0xffffff, 2.2, 80);
    luz1.position.set(6, 8, 14);
    scene.add(luz1);
    const luz2 = new THREE.PointLight(0xbbddff, 1.2, 60);
    luz2.position.set(-8, -6, 10);
    scene.add(luz2);

    // cria fios normalmente — sem _bindEventos
    _criarFios();

    new ResizeObserver(() => {
      const nw = pai.clientWidth  || window.innerWidth;
      const nh = pai.clientHeight || window.innerHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    }).observe(pai);

    // loop apenas visual — mouse3D fixo em 0,0,0, sem repulsão
    function _loopLeitura() {
      animId = requestAnimationFrame(_loopLeitura);
      tempo += 0.016;
      _animar();
      renderer.render(scene, camera);
    }

    _loopLeitura();
  }

  return { init, destroy, initSomenteLeitura };
})();