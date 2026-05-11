// js/global/sections/trabalhos/trabalhos-placas.js
// Estante isométrica 3D — placas metálicas com SVG temático
// Ao clicar: placa avança + gira 180° → dispara evento 'cuboclicado'
// Depende de: three.js + trabalhos-data.js

const TrabalhosCubos = (() => {

    let renderer, scene, camera, animId, canvasEl;
    let placas       = [];   // grupos Three.js de cada placa
    let placaAtiva   = -1;   // índice da placa animando
    let tempoGlobal  = 0;
  
    // ── constantes de layout isométrico ──────────────────────────────────────
    const COLS        = 3;
    const ROWS        = 2;
    const ESP_X       = 2.55;   // espaço entre colunas
    const ESP_Y       = 3.10;   // espaço entre linhas
    const PLACA_W     = 2.1;
    const PLACA_H     = 2.6;
    const PLACA_D     = 0.14;   // espessura da ficha metálica
  
    // ── SVGs temáticos por categoria ──────────────────────────────────────────
    const SVGS = {
      'Refrigeração Industrial': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
          <rect width="200" height="240" fill="#020b18"/>
          <!-- prédios skyline -->
          <rect x="10"  y="120" width="30" height="100" fill="#0a2040" stroke="#00c3ff" stroke-width="1"/>
          <rect x="48"  y="80"  width="40" height="140" fill="#071828" stroke="#0099cc" stroke-width="1"/>
          <rect x="96"  y="100" width="35" height="120" fill="#0a2040" stroke="#00c3ff" stroke-width="1"/>
          <rect x="138" y="60"  width="45" height="160" fill="#071828" stroke="#0099cc" stroke-width="1"/>
          <!-- janelas -->
          <rect x="16"  y="130" width="8"  height="6" fill="#00c3ff" opacity="0.7"/>
          <rect x="28"  y="130" width="8"  height="6" fill="#00c3ff" opacity="0.4"/>
          <rect x="55"  y="90"  width="8"  height="6" fill="#00c3ff" opacity="0.7"/>
          <rect x="68"  y="90"  width="8"  height="6" fill="#0077ff" opacity="0.5"/>
          <rect x="55"  y="105" width="8"  height="6" fill="#00c3ff" opacity="0.6"/>
          <rect x="68"  y="105" width="8"  height="6" fill="#00c3ff" opacity="0.3"/>
          <rect x="145" y="75"  width="8"  height="6" fill="#00c3ff" opacity="0.8"/>
          <rect x="158" y="75"  width="8"  height="6" fill="#0077ff" opacity="0.5"/>
          <rect x="145" y="90"  width="8"  height="6" fill="#00c3ff" opacity="0.6"/>
          <!-- linha do horizonte -->
          <line x1="0" y1="220" x2="200" y2="220" stroke="#00c3ff" stroke-width="0.5" opacity="0.4"/>
          <!-- label -->
          <text x="100" y="30" text-anchor="middle" fill="#00c3ff" font-size="11" font-family="monospace" opacity="0.9">SHOPPING</text>
          <text x="100" y="48" text-anchor="middle" fill="#0077ff" font-size="9"  font-family="monospace" opacity="0.7">VRF · 480.000 BTU</text>
        </svg>`,
  
      'Câmara Fria': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
          <rect width="200" height="240" fill="#020b18"/>
          <!-- cristais de gelo -->
          <g opacity="0.9">
            <!-- cristal 1 central -->
            <line x1="100" y1="60"  x2="100" y2="160" stroke="#00c3ff" stroke-width="2"/>
            <line x1="60"  y1="80"  x2="140" y2="140" stroke="#00c3ff" stroke-width="2"/>
            <line x1="140" y1="80"  x2="60"  y2="140" stroke="#00c3ff" stroke-width="2"/>
            <!-- galhos -->
            <line x1="100" y1="85"  x2="85"  y2="75"  stroke="#0099cc" stroke-width="1.5"/>
            <line x1="100" y1="85"  x2="115" y2="75"  stroke="#0099cc" stroke-width="1.5"/>
            <line x1="100" y1="110" x2="85"  y2="100" stroke="#0099cc" stroke-width="1.5"/>
            <line x1="100" y1="110" x2="115" y2="100" stroke="#0099cc" stroke-width="1.5"/>
            <line x1="100" y1="135" x2="85"  y2="125" stroke="#0099cc" stroke-width="1.5"/>
            <line x1="100" y1="135" x2="115" y2="125" stroke="#0099cc" stroke-width="1.5"/>
            <!-- núcleo -->
            <circle cx="100" cy="110" r="5" fill="#00c3ff" opacity="0.8"/>
          </g>
          <!-- cristais pequenos -->
          <g opacity="0.45">
            <line x1="30" y1="150" x2="30" y2="190" stroke="#00c3ff" stroke-width="1"/>
            <line x1="16" y1="162" x2="44" y2="178" stroke="#00c3ff" stroke-width="1"/>
            <line x1="44" y1="162" x2="16" y2="178" stroke="#00c3ff" stroke-width="1"/>
            <line x1="165" y1="140" x2="165" y2="175" stroke="#00c3ff" stroke-width="1"/>
            <line x1="153" y1="150" x2="177" y2="165" stroke="#00c3ff" stroke-width="1"/>
            <line x1="177" y1="150" x2="153" y2="165" stroke="#00c3ff" stroke-width="1"/>
          </g>
          <text x="100" y="25"  text-anchor="middle" fill="#00c3ff" font-size="11" font-family="monospace" opacity="0.9">CÂMARA FRIA</text>
          <text x="100" y="215" text-anchor="middle" fill="#0077ff" font-size="9"  font-family="monospace" opacity="0.7">-18°C a +4°C</text>
        </svg>`,
  
      'Ar Condicionado Central': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
          <rect width="200" height="240" fill="#020b18"/>
          <!-- cruz hospitalar -->
          <rect x="80"  y="50"  width="40" height="100" rx="4" fill="#004477" stroke="#00c3ff" stroke-width="1.5"/>
          <rect x="50"  y="80"  width="100" height="40" rx="4" fill="#004477" stroke="#00c3ff" stroke-width="1.5"/>
          <rect x="88"  y="58"  width="24" height="84"  rx="2" fill="#0055aa" opacity="0.5"/>
          <rect x="58"  y="88"  width="84" height="24"  rx="2" fill="#0055aa" opacity="0.5"/>
          <!-- ondas de sinal -->
          <path d="M30 170 Q100 150 170 170" stroke="#00c3ff" stroke-width="1.5" fill="none" opacity="0.6"/>
          <path d="M20 185 Q100 160 180 185" stroke="#0077ff" stroke-width="1"   fill="none" opacity="0.4"/>
          <path d="M10 200 Q100 175 190 200" stroke="#00c3ff" stroke-width="0.8" fill="none" opacity="0.25"/>
          <text x="100" y="25"  text-anchor="middle" fill="#00c3ff" font-size="11" font-family="monospace" opacity="0.9">HOSPITAL</text>
          <text x="100" y="225" text-anchor="middle" fill="#0077ff" font-size="9"  font-family="monospace" opacity="0.7">VRF + CHILLER</text>
        </svg>`,
  
      'Refrigeração Industrial': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
          <rect width="200" height="240" fill="#020b18"/>
          <!-- estrutura metálica galpão isométrica -->
          <!-- chão -->
          <polygon points="20,190 100,210 180,190 100,170" fill="#041020" stroke="#0055aa" stroke-width="1"/>
          <!-- paredes -->
          <polygon points="20,100 20,190 100,210 100,120" fill="#071828" stroke="#00c3ff" stroke-width="1"/>
          <polygon points="180,100 180,190 100,210 100,120" fill="#040e1a" stroke="#0077ff" stroke-width="1"/>
          <!-- telhado -->
          <polygon points="20,100 100,80 180,100 100,120" fill="#0a2040" stroke="#00c3ff" stroke-width="1.5"/>
          <!-- cumeeira -->
          <line x1="100" y1="60" x2="100" y2="80" stroke="#00c3ff" stroke-width="2" opacity="0.8"/>
          <!-- vigas -->
          <line x1="20" y1="140" x2="100" y2="155" stroke="#0099cc" stroke-width="0.8" opacity="0.5"/>
          <line x1="180" y1="140" x2="100" y2="155" stroke="#0099cc" stroke-width="0.8" opacity="0.5"/>
          <!-- janela lateral -->
          <rect x="35"  y="130" width="30" height="30" fill="#001530" stroke="#00c3ff" stroke-width="0.8" opacity="0.8"/>
          <line x1="50" y1="130" x2="50" y2="160" stroke="#0077ff" stroke-width="0.5"/>
          <line x1="35" y1="145" x2="65" y2="145" stroke="#0077ff" stroke-width="0.5"/>
          <text x="100" y="32"  text-anchor="middle" fill="#00c3ff" font-size="11" font-family="monospace" opacity="0.9">GALPÃO</text>
          <text x="100" y="50"  text-anchor="middle" fill="#0077ff" font-size="9"  font-family="monospace" opacity="0.7">8.200 m²</text>
        </svg>`,
  
      'Câmara Fria + Ar Condicionado': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
          <rect width="200" height="240" fill="#020b18"/>
          <!-- ilha de frio / expositora -->
          <!-- corpo do expositor -->
          <rect x="30" y="110" width="140" height="80" rx="4" fill="#04121e" stroke="#00c3ff" stroke-width="1.5"/>
          <!-- vidro frontal -->
          <rect x="36" y="116" width="128" height="68" rx="2" fill="#001830" stroke="#0077ff" stroke-width="0.8" opacity="0.7"/>
          <!-- prateleiras -->
          <line x1="36" y1="138" x2="164" y2="138" stroke="#0099cc" stroke-width="1" opacity="0.6"/>
          <line x1="36" y1="158" x2="164" y2="158" stroke="#0099cc" stroke-width="1" opacity="0.6"/>
          <!-- produtos nas prateleiras (retângulos) -->
          <rect x="42" y="120" width="18" height="16" rx="1" fill="#0055aa" opacity="0.7"/>
          <rect x="63" y="120" width="18" height="16" rx="1" fill="#003388" opacity="0.7"/>
          <rect x="84" y="120" width="18" height="16" rx="1" fill="#0055aa" opacity="0.7"/>
          <rect x="42" y="141" width="18" height="16" rx="1" fill="#004477" opacity="0.7"/>
          <rect x="63" y="141" width="18" height="16" rx="1" fill="#0055aa" opacity="0.7"/>
          <!-- LEDs -->
          <line x1="36" y1="117" x2="164" y2="117" stroke="#00c3ff" stroke-width="2" opacity="0.9"/>
          <!-- pernas -->
          <rect x="45"  y="190" width="8" height="20" fill="#0a1828" stroke="#0044aa" stroke-width="0.5"/>
          <rect x="147" y="190" width="8" height="20" fill="#0a1828" stroke="#0044aa" stroke-width="0.5"/>
          <!-- flocos de neve decorativos -->
          <text x="150" y="85"  fill="#00c3ff" font-size="18" opacity="0.4">❄</text>
          <text x="25"  y="100" fill="#00c3ff" font-size="14" opacity="0.3">❄</text>
          <text x="100" y="25"  text-anchor="middle" fill="#00c3ff" font-size="11" font-family="monospace" opacity="0.9">REDE FrezFresh</text>
          <text x="100" y="43"  text-anchor="middle" fill="#0077ff" font-size="9"  font-family="monospace" opacity="0.7">12 UNIDADES</text>
        </svg>`,
  
      'Refrigeração de Precisão': `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
          <rect width="200" height="240" fill="#020b18"/>
          <!-- racks de servidor -->
          <rect x="25"  y="60" width="50" height="140" rx="2" fill="#04101e" stroke="#00c3ff" stroke-width="1.2"/>
          <rect x="85"  y="60" width="50" height="140" rx="2" fill="#04101e" stroke="#0077ff" stroke-width="1.2"/>
          <rect x="145" y="60" width="30" height="140" rx="2" fill="#04101e" stroke="#00c3ff" stroke-width="1.2"/>
          <!-- LEDs dos racks -->
          ${Array.from({length:8}, (_,i) => `
            <rect x="30"  y="${70 + i*16}" width="38" height="10" rx="1" fill="#001830" stroke="#0055aa" stroke-width="0.5"/>
            <circle cx="62" cy="${75 + i*16}" r="2.5" fill="${i%3===0?'#00c3ff':i%3===1?'#0077ff':'#00aa88'}" opacity="0.9"/>
            <rect x="90"  y="${70 + i*16}" width="38" height="10" rx="1" fill="#001830" stroke="#0055aa" stroke-width="0.5"/>
            <circle cx="122" cy="${75 + i*16}" r="2.5" fill="${i%2===0?'#00c3ff':'#0077ff'}" opacity="0.9"/>
          `).join('')}
          <!-- cabos -->
          <path d="M75 90 Q80 110 85 90"  stroke="#0044aa" stroke-width="1.5" fill="none" opacity="0.6"/>
          <path d="M75 130 Q80 150 85 130" stroke="#003388" stroke-width="1.5" fill="none" opacity="0.6"/>
          <!-- circuito no fundo -->
          <line x1="0"   y1="220" x2="200" y2="220" stroke="#00c3ff" stroke-width="0.5" opacity="0.3"/>
          <text x="100" y="25"  text-anchor="middle" fill="#00c3ff" font-size="11" font-family="monospace" opacity="0.9">DATA CENTER</text>
          <text x="100" y="43"  text-anchor="middle" fill="#0077ff" font-size="9"  font-family="monospace" opacity="0.7">N+1 · 1.2 MW</text>
        </svg>`,
    };
  
    // ── gera textura canvas a partir do SVG ───────────────────────────────────
    function _svgParaTextura(svgStr) {
      return new Promise(resolve => {
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        const url  = URL.createObjectURL(blob);
        const img  = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = 200; c.height = 240;
          c.getContext('2d').drawImage(img, 0, 0, 200, 240);
          URL.revokeObjectURL(url);
          const tex = new THREE.CanvasTexture(c);
          resolve(tex);
        };
        img.src = url;
      });
    }
  
    // ── init ─────────────────────────────────────────────────────────────────
    async function init(el) {
      canvasEl = el;
      const pai = el.parentElement;
      const w   = pai.clientWidth  || 900;
      const h   = pai.clientHeight || 480;
  
      renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(w, h);
      renderer.shadowMap.enabled = true;
      renderer.toneMapping       = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
  
      scene  = new THREE.Scene();
  
      // câmera isométrica — perspectiva suave
      camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
      camera.position.set(0, 3.5, 14);
      camera.lookAt(0, 0.5, 0);
  
      _iluminacao();
      _criarEstante();
      await _criarPlacas();
      _bindEventos(pai);
  
      new ResizeObserver(() => {
        const nw = pai.clientWidth  || 900;
        const nh = pai.clientHeight || 480;
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      }).observe(pai);
  
      _loop();
    }
  
    // ── iluminação ────────────────────────────────────────────────────────────
    function _iluminacao() {
      scene.add(new THREE.AmbientLight(0x112244, 1.2));
  
      const dir = new THREE.DirectionalLight(0xaaccff, 1.6);
      dir.position.set(4, 10, 8);
      dir.castShadow = true;
      dir.shadow.mapSize.set(1024, 1024);
      scene.add(dir);
  
      const fill = new THREE.DirectionalLight(0x003366, 0.8);
      fill.position.set(-6, 2, 4);
      scene.add(fill);
  
      const rim = new THREE.PointLight(0x00c3ff, 1.2, 30);
      rim.position.set(0, 6, 2);
      scene.add(rim);
    }
  
    // ── estante metálica ──────────────────────────────────────────────────────
    function _criarEstante() {
      const matMetal = new THREE.MeshPhongMaterial({
        color: 0x1a2a3a, emissive: 0x050c15, shininess: 80, specular: 0x224466,
      });
      const matChrome = new THREE.MeshPhongMaterial({
        color: 0x334455, emissive: 0x0a1520, shininess: 180, specular: 0x6699aa,
      });
  
      // prateleiras horizontais (3 linhas + base)
      const pratAltura = [
        ROWS === 2 ? ESP_Y * 0.5 + 0.05 : 0,
        ROWS === 2 ? -ESP_Y * 0.5 + 0.05 : 0,
        -ESP_Y * 0.5 - PLACA_H * 0.5 - 0.15,  // base
      ];
  
      pratAltura.forEach(py => {
        const prat = new THREE.Mesh(
          new THREE.BoxGeometry(COLS * ESP_X + 0.8, 0.08, PLACA_D * 3 + 0.3),
          matChrome
        );
        prat.position.set(0, py, 0);
        prat.receiveShadow = true;
        scene.add(prat);
      });
  
      // colunas verticais (laterais + centro)
      const colX = [
        -(COLS - 1) * ESP_X * 0.5 - 0.45,
        0,
        (COLS - 1) * ESP_X * 0.5 + 0.45,
      ];
      colX.forEach(cx => {
        const col = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, ROWS * ESP_Y + 0.6, 0.06),
          matMetal
        );
        col.position.set(cx, 0, 0);
        col.castShadow = true;
        scene.add(col);
      });
  
      // base horizontal
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(COLS * ESP_X + 0.8, 0.05, 0.5),
        matMetal
      );
      base.position.set(0, -ESP_Y * 0.5 - PLACA_H * 0.5 - 0.15, 0);
      scene.add(base);
    }
  
    // ── placas metálicas ──────────────────────────────────────────────────────
    async function _criarPlacas() {
      const matVerso = new THREE.MeshPhongMaterial({
        color: 0x1a2535, emissive: 0x060d1a, shininess: 120, specular: 0x334455,
      });
      const matBorda = new THREE.MeshPhongMaterial({
        color: 0x223344, emissive: 0x080f1e, shininess: 80, specular: 0x2a4060,
      });
  
      for (let idx = 0; idx < TRABALHOS.length; idx++) {
        const proj = TRABALHOS[idx];
        const col  = idx % COLS;
        const row  = Math.floor(idx / COLS);
  
        const xPos = (col - (COLS - 1) / 2) * ESP_X;
        const yPos = (row === 0 ? 1 : -1) * (ESP_Y * 0.5 - PLACA_H * 0.5 - 0.12);
  
        // textura SVG na frente
        const svgKey = proj.categoria;
        const svgStr = SVGS[svgKey] || SVGS['Refrigeração Industrial'];
        const tex    = await _svgParaTextura(svgStr);
  
        const matFrente = new THREE.MeshPhongMaterial({
          map: tex, shininess: 60, specular: 0x112233,
        });
  
        // borda metálica emissiva com cor do projeto
        const corBorda = new THREE.Color(proj.cor);
        const matAcento = new THREE.MeshPhongMaterial({
          color: corBorda, emissive: corBorda.clone().multiplyScalar(0.5),
          shininess: 200, specular: 0x88aacc,
        });
  
        // geometrias das 6 faces da placa
        const materiais = [
          matBorda,   // direita
          matBorda,   // esquerda
          matAcento,  // topo (acento colorido)
          matBorda,   // base
          matFrente,  // frente (SVG)
          matVerso,   // verso (metálico escuro)
        ];
  
        const geo   = new THREE.BoxGeometry(PLACA_W, PLACA_H, PLACA_D);
        const placa = new THREE.Mesh(geo, materiais);
        placa.castShadow = placa.receiveShadow = true;
  
        // borda luminosa (edges)
        const edgeGeo = new THREE.EdgesGeometry(geo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(proj.cor), transparent: true, opacity: 0.25,
        });
        const edges = new THREE.LineSegments(edgeGeo, edgeMat);
  
        // label no verso (número do projeto)
        const grupo = new THREE.Group();
        grupo.add(placa);
        grupo.add(edges);
        grupo.position.set(xPos, yPos, 0);
  
        grupo.userData = {
          idx,
          proj,
          xBase:     xPos,
          yBase:     yPos,
          zBase:     0,
          rotYBase:  0,
          placaMesh: placa,
          edgeMesh:  edges,
          estado:    'repouso', // 'repouso' | 'saindo' | 'frente' | 'voltando'
          progAnim:  0,
          floatFase: Math.random() * Math.PI * 2,
        };
  
        scene.add(grupo);
        placas.push(grupo);
      }
    }
  
    // ── animação de cada placa ────────────────────────────────────────────────
    function _animarPlacas() {
      placas.forEach(g => {
        const d = g.userData;
  
        if (d.estado === 'repouso') {
          // flutuação suave
          g.position.y = d.yBase + Math.sin(tempoGlobal * 0.6 + d.floatFase) * 0.035;
          // rotação Y muito leve
          g.rotation.y += (0 - g.rotation.y) * 0.05;
          return;
        }
  
        d.progAnim += 0.022;
        const t = Math.min(d.progAnim, 1);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease in-out
  
        if (d.estado === 'saindo') {
          // avança Z + rotaciona 180°
          g.position.z  = d.zBase + e * 2.2;
          g.rotation.y  = e * Math.PI;
          if (t >= 1) {
            d.estado    = 'frente';
            d.progAnim  = 0;
            // dispara evento para abrir painel
            if (canvasEl) canvasEl.dispatchEvent(new CustomEvent('cuboclicado', {
              bubbles: true, detail: { idx: d.idx },
            }));
          }
        }
  
        if (d.estado === 'voltando') {
          g.position.z = d.zBase + (1 - e) * 2.2;
          g.rotation.y = (1 - e) * Math.PI;
          if (t >= 1) {
            d.estado   = 'repouso';
            d.progAnim = 0;
            g.position.z = d.zBase;
            g.rotation.y = 0;
          }
        }
      });
    }
  
    // ── eventos ───────────────────────────────────────────────────────────────
    function _bindEventos(pai) {
      pai.addEventListener('click',    e => _onClique(e.clientX, e.clientY));
      pai.addEventListener('touchend', e => {
        const t = e.changedTouches[0];
        _onClique(t.clientX, t.clientY);
      });
      window.addEventListener('keydown', e => {
        if (e.key === 'Escape') _voltarTodas();
      });
    }
  
    function _onClique(clientX, clientY) {
      const rect  = canvasEl.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width)  * 2 - 1,
        -((clientY - rect.top)  / rect.height) * 2 + 1,
      );
      const ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);
      const meshes = placas.map(g => g.userData.placaMesh);
      const hits   = ray.intersectObjects(meshes);
      if (!hits.length) return;
  
      const hit   = hits[0].object;
      const grupo = placas.find(g => g.userData.placaMesh === hit);
      if (!grupo) return;
  
      const d = grupo.userData;
      if (d.estado === 'repouso' || d.estado === 'frente') {
        // volta todas as outras primeiro
        placas.forEach(g => {
          if (g !== grupo && (g.userData.estado === 'frente' || g.userData.estado === 'saindo')) {
            g.userData.estado   = 'voltando';
            g.userData.progAnim = 1 - g.userData.progAnim;
          }
        });
        if (d.estado === 'repouso') {
          d.estado   = 'saindo';
          d.progAnim = 0;
        } else {
          // já está na frente — volta
          d.estado   = 'voltando';
          d.progAnim = 0;
        }
      }
    }
  
    function _voltarTodas() {
      placas.forEach(g => {
        const d = g.userData;
        if (d.estado === 'frente' || d.estado === 'saindo') {
          d.estado   = 'voltando';
          d.progAnim = 1 - d.progAnim;
        }
      });
    }
  
    // ── API pública (compatível com trabalhos.js) ─────────────────────────────
    function anterior() {}
    function proximo()  {}
    function getIndiceAtivo() { return 0; }
  
    // ── loop ──────────────────────────────────────────────────────────────────
    function _loop() {
      animId = requestAnimationFrame(_loop);
      tempoGlobal += 0.016;
      _animarPlacas();
      renderer.render(scene, camera);
    }
  
    function destroy() {
      cancelAnimationFrame(animId);
      placas.forEach(g => {
        g.userData.placaMesh.geometry.dispose();
        g.userData.placaMesh.material.forEach?.(m => m.dispose());
        g.userData.edgeMesh.geometry.dispose();
        g.userData.edgeMesh.material.dispose();
      });
      renderer.dispose();
    }
  
    return { init, destroy, anterior, proximo, getIndiceAtivo };
  })();