// js/global/numeros/freezer.js
// Geladeira expositora vertical 3D — Three.js
// Porta aberta com dobradiça, prateleiras de vidro, LED interno ciano
// Exporta: ExpositorModel.init(canvasEl), ExpositorModel.destroy()

const ExpositorModel = (() => {

  let renderer, scene, camera, animId;
  let porta;       // grupo da porta — animada na abertura
  let portaAngle = 0;
  let portaAberta = false;
  let luzInterna;  // PointLight interna — pulsa levemente

  // ── init ────────────────────────────────────────────────────────────────────
  function init(canvasEl) {
    const w = canvasEl.clientWidth  || 420;
    const h = canvasEl.clientHeight || 520;

    // renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    scene  = new THREE.Scene();

    // câmera — levemente lateral para ver a profundidade e a porta aberta
    camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(4.2, 1.8, 5.5);
    camera.lookAt(0, 0.5, 0);

    // iluminação
    const ambient = new THREE.AmbientLight(0x112233, 0.9);
    scene.add(ambient);

    const sol = new THREE.DirectionalLight(0xaaccff, 1.4);
    sol.position.set(5, 8, 6);
    sol.castShadow = true;
    sol.shadow.mapSize.set(1024, 1024);
    sol.shadow.camera.near = 1;
    sol.shadow.camera.far  = 30;
    sol.shadow.camera.left = sol.shadow.camera.bottom = -5;
    sol.shadow.camera.right = sol.shadow.camera.top   =  5;
    scene.add(sol);

    const fill = new THREE.DirectionalLight(0x003366, 0.6);
    fill.position.set(-4, 2, -3);
    scene.add(fill);

    // luz interna ciano — dentro da geladeira
    luzInterna = new THREE.PointLight(0x00c3ff, 1.8, 6);
    luzInterna.position.set(0, 0.5, 0.3);
    scene.add(luzInterna);

    // luz de destaque frontal suave
    const frente = new THREE.PointLight(0x004466, 0.8, 10);
    frente.position.set(0, 1, 4);
    scene.add(frente);

    _construir();
    _abrirPortaAnimado();

    // responsividade
    new ResizeObserver(() => {
      const nw = canvasEl.clientWidth  || 420;
      const nh = canvasEl.clientHeight || 520;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    }).observe(canvasEl.parentElement || canvasEl);

    _loop();
  }

  // ── materiais ───────────────────────────────────────────────────────────────
  function _mat(color, emissive = 0x000000, roughness = 0.35, metalness = 0.25) {
    return new THREE.MeshStandardMaterial({ color, emissive, roughness, metalness });
  }

  const MAT = {
    corpo:     _mat(0x1a2a3a, 0x040d16, 0.4,  0.3),
    corpoClar: _mat(0x223344, 0x060f1c, 0.3,  0.35),
    vidro:     new THREE.MeshStandardMaterial({
      color: 0x88ccff, emissive: 0x001122,
      roughness: 0.05, metalness: 0.1,
      transparent: true, opacity: 0.18,
      side: THREE.DoubleSide,
    }),
    vidroPorta: new THREE.MeshStandardMaterial({
      color: 0xaaddff, emissive: 0x002233,
      roughness: 0.05, metalness: 0.08,
      transparent: true, opacity: 0.22,
      side: THREE.DoubleSide,
    }),
    puxador:   _mat(0x334455, 0x0a1520, 0.2,  0.8),
    prateleira: _mat(0x2a3d50, 0x050d15, 0.3, 0.5),
    led:       new THREE.MeshStandardMaterial({
      color: 0x00c3ff, emissive: 0x00a0dd,
      roughness: 0.1,  metalness: 0.0,
    }),
    borracha:  _mat(0x080e14, 0x010305, 0.9, 0.0),
    aro:       _mat(0x445566, 0x0d1520, 0.2, 0.7),
  };

  // ── helpers de geometria ────────────────────────────────────────────────────
  function _box(w, h, d, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
  function _cyl(rt, rb, h, seg, mat) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.castShadow = m.receiveShadow = true;
    return m;
  }

  // ── construção principal ────────────────────────────────────────────────────
  function _construir() {
    const raiz = new THREE.Group();
    scene.add(raiz);

    // dimensões da geladeira expositora vertical
    const W = 1.8,  // largura
          H = 4.2,  // altura
          D = 1.1;  // profundidade

    // ── carcaça: fundo + laterais + topo + base ─────────────────────────────

    // painel traseiro
    const tras = _box(W, H, 0.07, MAT.corpo);
    tras.position.set(0, 0, -D / 2);
    raiz.add(tras);

    // laterais
    [-W/2, W/2].forEach(x => {
      const lat = _box(0.07, H, D, MAT.corpo);
      lat.position.set(x, 0, 0);
      raiz.add(lat);
    });

    // topo
    const topo = _box(W + 0.07, 0.1, D, MAT.corpoClar);
    topo.position.set(0, H / 2 + 0.05, 0);
    raiz.add(topo);

    // base
    const base = _box(W + 0.07, 0.1, D, MAT.corpo);
    base.position.set(0, -H / 2 - 0.05, 0);
    raiz.add(base);

    // pés
    [[-W/2+0.15, -D/2+0.15], [-W/2+0.15, D/2-0.15],
     [ W/2-0.15, -D/2+0.15], [ W/2-0.15, D/2-0.15]].forEach(([px, pz]) => {
      const pe = _cyl(0.055, 0.07, 0.18, 8, MAT.borracha);
      pe.position.set(px, -H/2 - 0.14, pz);
      raiz.add(pe);
    });

    // ── interior: fundo branco-azulado + grelha ──────────────────────────────
    const interior = _box(W - 0.08, H - 0.12, D - 0.09, _mat(0x0a1e30, 0x051020));
    interior.position.set(0, 0, 0.01);
    raiz.add(interior);

    // tira de LED no topo interno
    const ledTira = _box(W - 0.2, 0.04, 0.06, MAT.led);
    ledTira.position.set(0, H/2 - 0.12, D/2 - 0.08);
    raiz.add(ledTira);

    // led base
    const ledBase = _box(W - 0.2, 0.04, 0.06, MAT.led);
    ledBase.position.set(0, -H/2 + 0.12, D/2 - 0.08);
    raiz.add(ledBase);

    // ── prateleiras de vidro (4) ─────────────────────────────────────────────
    const nPrat = 4;
    for (let i = 0; i < nPrat; i++) {
      const y = -H/2 + 0.5 + i * ((H - 0.6) / nPrat);

      // vidro
      const prat = _box(W - 0.1, 0.025, D - 0.1, MAT.vidro);
      prat.position.set(0, y, 0);
      raiz.add(prat);

      // suportes laterais metálicos
      [-W/2 + 0.07, W/2 - 0.07].forEach(x => {
        const sup = _box(0.04, 0.08, 0.06, MAT.aro);
        sup.position.set(x, y, 0);
        raiz.add(sup);
      });
    }

    // ── gaxeta (borracha) — moldura da abertura ──────────────────────────────
    const gaxH = _box(W - 0.07, 0.04, 0.04, MAT.borracha);
    gaxH.position.set(0,  H/2 - 0.06, D/2 - 0.02);
    raiz.add(gaxH);
    const gaxB = gaxH.clone();
    gaxB.position.set(0, -H/2 + 0.06, D/2 - 0.02);
    raiz.add(gaxB);
    [-W/2 + 0.04, W/2 - 0.04].forEach(x => {
      const gaxV = _box(0.04, H - 0.12, 0.04, MAT.borracha);
      gaxV.position.set(x, 0, D/2 - 0.02);
      raiz.add(gaxV);
    });

    // ── dobradiças (3) ───────────────────────────────────────────────────────
    [-H/2 + 0.3, 0, H/2 - 0.3].forEach(y => {
      const dob = _cyl(0.04, 0.04, 0.12, 10, MAT.aro);
      dob.rotation.z = Math.PI / 2;
      dob.position.set(-W/2 + 0.035, y, D/2);
      raiz.add(dob);
    });

    // ── porta (grupo pivotado na esquerda) ──────────────────────────────────
    porta = new THREE.Group();
    // o pivô fica na aresta esquerda da porta
    porta.position.set(-W/2 + 0.04, 0, D/2);
    raiz.add(porta);

    // painel da porta (offset em X para a direita do pivô)
    const painelPorta = _box(W - 0.07, H - 0.06, 0.09, MAT.corpoClar);
    painelPorta.position.set(W/2 - 0.035, 0, 0.045);
    porta.add(painelPorta);

    // vidro da porta
    const vidroP = _box(W - 0.22, H - 0.22, 0.03, MAT.vidroPorta);
    vidroP.position.set(W/2 - 0.035, 0, 0.07);
    porta.add(vidroP);

    // moldura do vidro
    [
      [W - 0.22, 0.04, 0.05, 0,         H/2 - 0.09, 0.06],
      [W - 0.22, 0.04, 0.05, 0,        -H/2 + 0.09, 0.06],
      [0.04, H - 0.22, 0.05, W - 0.13,  0,           0.06],
      [0.04, H - 0.22, 0.05, 0.055,     0,           0.06],
    ].forEach(([bw, bh, bd, bx, by, bz]) => {
      const m = _box(bw, bh, bd, MAT.aro);
      m.position.set(bx, by, bz);
      porta.add(m);
    });

    // puxador
    const puxador = _cyl(0.025, 0.025, H * 0.45, 12, MAT.puxador);
    puxador.position.set(W - 0.12, 0, 0.13);
    porta.add(puxador);

    // caps do puxador
    [H * 0.225, -H * 0.225].forEach(y => {
      const cap = _cyl(0.04, 0.04, 0.06, 10, MAT.aro);
      cap.rotation.z = Math.PI / 2;
      cap.position.set(W - 0.085, y, 0.13);
      porta.add(cap);
    });

    // numeração digital: pequenas etiquetas de preço decorativas nas prateleiras
    _adicionarEtiquetas(raiz, W, H, D);
  }

  // ── etiquetas de preço decorativas ─────────────────────────────────────────
  function _adicionarEtiquetas(raiz, W, H, D) {
    const nPrat = 4;
    for (let i = 0; i < nPrat; i++) {
      const y = -H/2 + 0.5 + i * ((H - 0.6) / nPrat) + 0.06;
      [-0.5, 0, 0.5].forEach(x => {
        const etiBase = _box(0.22, 0.06, 0.01, new THREE.MeshStandardMaterial({
          color: 0x001a2e, emissive: 0x001020, roughness: 0.4
        }));
        etiBase.position.set(x, y, D/2 - 0.06);
        raiz.add(etiBase);

        const etiLed = _box(0.18, 0.03, 0.012, MAT.led);
        etiLed.position.set(x, y, D/2 - 0.055);
        raiz.add(etiLed);
      });
    }
  }

  // ── abre a porta suavemente ─────────────────────────────────────────────────
  function _abrirPortaAnimado() {
    // inicia fechada, abre 105° após 600ms
    portaAngle = 0;
    setTimeout(() => { portaAberta = true; }, 600);
  }

  // ── loop ────────────────────────────────────────────────────────────────────
  let tempo = 0;

  function _loop() {
    animId = requestAnimationFrame(_loop);
    tempo += 0.016;

    // animação de abertura da porta
    if (portaAberta && portaAngle < 1.83) {          // ~105°
      portaAngle += 0.012;
      portaAngle  = Math.min(portaAngle, 1.83);
    } else if (!portaAberta && portaAngle > 0) {
      portaAngle -= 0.018;
      portaAngle  = Math.max(portaAngle, 0);
    }
    if (porta) porta.rotation.y = portaAngle;

    // LED interno pulsa suavemente
    if (luzInterna) {
      luzInterna.intensity = 1.6 + Math.sin(tempo * 1.2) * 0.2;
    }

    renderer.render(scene, camera);
  }

  // ── destroy ─────────────────────────────────────────────────────────────────
  function destroy() {
    cancelAnimationFrame(animId);
    renderer.dispose();
  }

  return { init, destroy };
})();