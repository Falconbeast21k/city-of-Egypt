'use strict';

(function () {

  /* ═══════════════════════════════════════════
     LOADER — SET UP FIRST, BEFORE ANYTHING ELSE
     ═══════════════════════════════════════════ */
  const loaderFill = document.getElementById('loaderFill');
  const loaderEl   = document.getElementById('loader');

  function hideLoader() {
    loaderEl.classList.add('hidden');
    var tb0 = document.getElementById('tb0');
    if (tb0) tb0.classList.add('visible');
  }

  // Simulate loading progress
  var loadPct = 0;
  var loadInt = setInterval(function () {
    loadPct += Math.random() * 14 + 5;
    if (loadPct >= 100) {
      loadPct = 100;
      clearInterval(loadInt);
      loaderFill.style.width = '100%';
      setTimeout(hideLoader, 600);
    } else {
      loaderFill.style.width = loadPct + '%';
    }
  }, 80);

  // Hard fallback — always hide after 8 s no matter what
  setTimeout(hideLoader, 8000);

  /* ═══════════════════════════════════════════
     RENDERER + SCENE
     ═══════════════════════════════════════════ */
  var canvas   = document.getElementById('threeCanvas');
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping        = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  var scene  = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0700);
  scene.fog = new THREE.FogExp2(0x1c0d04, 0.008);

  var camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 900);
  camera.position.set(0, 35, 110);

  /* ═══════════════════════════════════════════
     COLORS
     ═══════════════════════════════════════════ */
  var C = {
    sand:       0xc8a050,
    amber:      0xe8900a,
    gold:       0xffd700,
    sandDark:   0x8b6914,
    capstone:   0xffa020,
    stone:      0xb89060,
    stoneDeep:  0x7a5a2e,
    marble:     0xf0e8d0,
    marbleDim:  0xd4c8a0,
    lotus:      0x4a9e6f,
    lotusGold:  0xffd060,
    cobalt:     0x1a5c8e,
    tileGold:   0xd4a000,
    glassBlue:  0x29b6f6,
    nile:       0x1565c0,
    steel:      0x90a4ae,
    concrete:   0x78909c,
    neonCyan:   0x00f5ff,
    neonViolet: 0xbf5fff,
    neonGold:   0xffd700,
    neonPink:   0xff2d78,
    neonGreen:  0x39ff14
  };

  /* ═══════════════════════════════════════════
     MATERIAL HELPERS
     ═══════════════════════════════════════════ */
  function stoneMat(color, rough) {
    rough = rough !== undefined ? rough : 0.9;
    return new THREE.MeshStandardMaterial({ color: color, roughness: rough, metalness: 0 });
  }
  function goldMat(color) {
    color = color !== undefined ? color : C.gold;
    return new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.9, roughness: 0.05, metalness: 1 });
  }
  function glowMat(color, intensity, opacity) {
    intensity = intensity !== undefined ? intensity : 0.8;
    opacity   = opacity   !== undefined ? opacity   : 1;
    return new THREE.MeshStandardMaterial({
      color: color, emissive: color, emissiveIntensity: intensity,
      roughness: 0.15, metalness: 0.4,
      transparent: opacity < 1, opacity: opacity
    });
  }
  function glassMat(color) {
    return new THREE.MeshStandardMaterial({
      color: color, emissive: color, emissiveIntensity: 0.15,
      roughness: 0.05, metalness: 0.8, transparent: true, opacity: 0.65
    });
  }
  function edgeLine(geo, color, opacity) {
    opacity = opacity !== undefined ? opacity : 0.6;
    return new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity })
    );
  }

  // Helical tower builder
  function buildHelicalTower(grp, x, z, floors, floorHeight, width, twist, color) {
    color = color !== undefined ? color : C.glassBlue;
    var g = new THREE.Group();
    var fGeo = new THREE.BoxGeometry(width, floorHeight * 0.88, width);
    var mats = [
      glassMat(color),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.3 })
    ];

    for (var i = 0; i < floors; i++) {
      var y = i * floorHeight;
      var rot = i * twist;
      
      var mesh = new THREE.Mesh(fGeo, mats[i % 2]);
      mesh.position.y = y + floorHeight / 2;
      mesh.rotation.y = rot;
      g.add(mesh);

      var el = edgeLine(fGeo, color, 0.45);
      el.position.y = mesh.position.y;
      el.rotation.y = rot;
      g.add(el);
    }
    
    var coreGeo = new THREE.CylinderGeometry(width * 0.18, width * 0.18, floors * floorHeight, 8);
    var core = new THREE.Mesh(coreGeo, goldMat(C.neonGold));
    core.position.y = (floors * floorHeight) / 2;
    g.add(core);

    g.position.set(x, 0, z);
    grp.add(g);
    return g;
  }

  // Honeycomb citadel builder
  function buildHoneycombCitadel(grp, x, z, r, baseH, color) {
    color = color !== undefined ? color : C.neonCyan;
    var g = new THREE.Group();
    var w = r * Math.sqrt(3);

    var offsets = [
      { dx: 0, dz: 0, h: baseH * 1.5 },
      { dx: w, dz: 0, h: baseH * 1.15 },
      { dx: -w, dz: 0, h: baseH * 1.15 },
      { dx: w / 2, dz: r * 1.5, h: baseH * 0.95 },
      { dx: -w / 2, dz: r * 1.5, h: baseH * 0.95 },
      { dx: w / 2, dz: -r * 1.5, h: baseH * 0.95 },
      { dx: -w / 2, dz: -r * 1.5, h: baseH * 0.95 }
    ];

    var cells = [];
    offsets.forEach(function (off, ci) {
      var h = off.h;
      var cg = new THREE.CylinderGeometry(r * 0.94, r * 0.94, h, 6);
      var mat = glowMat(color, 0.65, 0.78);
      var mesh = new THREE.Mesh(cg, mat);
      mesh.position.set(off.dx, h / 2, off.dz);
      g.add(mesh);

      var el = edgeLine(cg, color, 0.85);
      el.position.set(off.dx, h / 2, off.dz);
      g.add(el);

      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.55, 0.08, 4, 6),
        goldMat(color)
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(off.dx, h + 1.2, off.dz);
      g.add(ring);

      cells.push({ mesh: mesh, el: el, ring: ring, baseH: h, phase: ci * 0.5 });
    });

    g.position.set(x, 0, z);
    grp.add(g);
    return { g: g, cells: cells };
  }

  // Spiraling Helical Pyramid builder
  function buildHelicalPyramid(grp, x, z, baseSize, height, color) {
    color = color !== undefined ? color : C.neonGold;
    var g = new THREE.Group();

    var pyrGeo = new THREE.ConeGeometry(baseSize, height, 4);
    var pyrMesh = new THREE.Mesh(pyrGeo, stoneMat(0x111122, 0.8));
    pyrMesh.rotation.y = Math.PI / 4;
    pyrMesh.position.y = height / 2;
    g.add(pyrMesh);

    var el = edgeLine(pyrGeo, color, 0.35);
    el.rotation.y = Math.PI / 4;
    el.position.y = height / 2;
    g.add(el);

    var steps = 36;
    var trackNodes = [];
    for (var i = 0; i < steps; i++) {
      var pct = i / steps;
      var theta = pct * Math.PI * 6;
      var currRadius = baseSize * (1 - pct) * 0.82;
      var currY = pct * height;

      var tx = Math.cos(theta) * currRadius;
      var tz = Math.sin(theta) * currRadius;

      var nodeGeo = new THREE.BoxGeometry(0.85, 0.35, 0.85);
      var node = new THREE.Mesh(nodeGeo, glowMat(color, 2.5));
      node.position.set(tx, currY, tz);
      node.rotation.y = theta;
      g.add(node);

      var nel = edgeLine(nodeGeo, color, 0.9);
      nel.position.set(tx, currY, tz);
      nel.rotation.y = theta;
      g.add(nel);

      trackNodes.push(node);
    }

    g.position.set(x, 0, z);
    grp.add(g);
    return { g: g, nodes: trackNodes };
  }

  // Segmented floating obelisk builder
  function buildSegmentedObelisk(grp, x, z, height, segmentsCount, color) {
    color = color !== undefined ? color : C.neonCyan;
    var g = new THREE.Group();
    var segH = height / segmentsCount;
    var meshes = [];

    for (var i = 0; i < segmentsCount; i++) {
      var w = 1.0 - (i / segmentsCount) * 0.42; // tapers upwards
      var geo = new THREE.BoxGeometry(w, segH * 0.72, w);
      var mesh = new THREE.Mesh(geo, glowMat(color, 0.8, 0.85));
      mesh.position.y = i * segH + segH / 2;
      g.add(mesh);

      var el = edgeLine(geo, color, 0.95);
      el.position.y = mesh.position.y;
      g.add(el);

      meshes.push({ mesh: mesh, el: el, baseOffset: mesh.position.y, phase: i * 0.7 });
    }

    // Central glowing laser beam
    var beamGeo = new THREE.CylinderGeometry(0.06, 0.06, height, 8);
    var beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.65 }));
    beam.position.y = height / 2;
    g.add(beam);

    g.position.set(x, 0, z);
    grp.add(g);
    return { g: g, segments: meshes, beam: beam };
  }

  // Aerial traffic lanes and vehicles
  var trafficStreams = [];
  function addTrafficLane(grp, startPt, endPt, count, color) {
    var vehicles = [];
    for (var i = 0; i < count; i++) {
      var boxGeo = new THREE.BoxGeometry(0.24, 0.12, 0.48);
      var veh = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: color }));
      grp.add(veh);
      
      var trailGeo = new THREE.BufferGeometry();
      var pts = [startPt.clone(), endPt.clone()];
      trailGeo.setFromPoints(pts);
      var trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.16 }));
      grp.add(trail);

      vehicles.push({
        mesh: veh,
        start: startPt,
        end: endPt,
        speed: 0.12 + Math.random() * 0.22,
        progress: Math.random()
      });
    }
    trafficStreams.push({ vehicles: vehicles });
  }

  // Holographic Quantum Core
  function buildQuantumCore(grp, x, y, z, r, color) {
    var g = new THREE.Group();
    var geo1 = new THREE.OctahedronGeometry(r, 0);
    var geo2 = new THREE.OctahedronGeometry(r * 0.62, 0);

    var mat1 = new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: 0.5 });
    var mat2 = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, transparent: true, opacity: 0.65 });
    
    var core1 = new THREE.Mesh(geo1, mat1);
    var core2 = new THREE.Mesh(geo2, mat2);
    
    g.add(core1);
    g.add(core2);

    var ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.25, 0.06, 4, 28), glowMat(color, 2.5));
    ring.rotation.x = Math.PI / 2;
    g.add(ring);

    g.position.set(x, y, z);
    grp.add(g);
    return { g: g, core1: core1, core2: core2, ring: ring };
  }

  /* ═══════════════════════════════════════════
     MOUSE
     ═══════════════════════════════════════════ */
  var mouse = { nx: 0, ny: 0 };
  var customCursor = document.getElementById('custom-cursor');
  document.addEventListener('mousemove', function (e) {
    mouse.nx = (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.ny = -(e.clientY / window.innerHeight) * 2 + 1;
    if (customCursor) {
      customCursor.style.display = 'block';
      customCursor.style.transform = 'translate3d(' + e.clientX + 'px, ' + e.clientY + 'px, 0) rotate(45deg)';
    }
  });

  /* ═══════════════════════════════════════════
     CAMERA PATH  (7 keyframes, one per section)
     ═══════════════════════════════════════════ */
  var CAM = [
    { p: new THREE.Vector3(0,  48, 110),   l: new THREE.Vector3(0,  5, -10)  },  // Intro
    { p: new THREE.Vector3(-28, 18,  5),   l: new THREE.Vector3(0,  8, -35)  },  // Ancient
    { p: new THREE.Vector3( 20,  9, -65),  l: new THREE.Vector3(0, 12, -100) },  // Classical
    { p: new THREE.Vector3(-14, 16, -120), l: new THREE.Vector3(5, 10, -158) },  // Medieval
    { p: new THREE.Vector3( 30, 20, -175), l: new THREE.Vector3(-5, 10, -215)},  // Modern
    { p: new THREE.Vector3(-10, 24, -232), l: new THREE.Vector3(0, 22, -272) },  // Future
    { p: new THREE.Vector3( 85, 60, -130), l: new THREE.Vector3(0,  8, -155) }   // Outro
  ];

  /* ═══════════════════════════════════════════
     BACKGROUND TRANSITIONS
     ═══════════════════════════════════════════ */
  var BG = [
    { bg: new THREE.Color(0x0e0700), fog: new THREE.Color(0x1c0d04) },
    { bg: new THREE.Color(0x0d0500), fog: new THREE.Color(0x241202) },
    { bg: new THREE.Color(0x0a0502), fog: new THREE.Color(0x1a0e05) },
    { bg: new THREE.Color(0x04080f), fog: new THREE.Color(0x08101e) },
    { bg: new THREE.Color(0x030810), fog: new THREE.Color(0x060c18) },
    { bg: new THREE.Color(0x010210), fog: new THREE.Color(0x010518) },
    { bg: new THREE.Color(0x010208), fog: new THREE.Color(0x020412) }
  ];

  /* ═══════════════════════════════════════════
     ████  ANCIENT EGYPT  (z = +40 to -65)
     ═══════════════════════════════════════════ */
  var ancientGrp = new THREE.Group();
  scene.add(ancientGrp);

  // Desert dunes
  var duneGeo = new THREE.PlaneGeometry(320, 220, 55, 55);
  var dPos = duneGeo.attributes.position;
  for (var i = 0; i < dPos.count; i++) {
    var dx = dPos.getX(i), dz = dPos.getZ(i);
    dPos.setY(i, Math.sin(dx * 0.07) * Math.cos(dz * 0.05) * 1.6
                + Math.sin(dx * 0.2 + dz * 0.1) * 0.4
                + Math.random() * 0.2);
  }
  duneGeo.computeVertexNormals();
  var duneMesh = new THREE.Mesh(duneGeo, stoneMat(0xb89a48, 0.98));
  duneMesh.rotation.x = -Math.PI / 2;
  duneMesh.position.set(0, -0.4, -40);
  scene.add(duneMesh);

  // Pyramid
  function buildPyramid(grp, x, z, base, height, color) {
    color = color || C.stone;
    var g = new THREE.Group();

    var pyGeo  = new THREE.ConeGeometry(base, height, 4);
    var pyMesh = new THREE.Mesh(pyGeo, stoneMat(color, 0.85));
    pyMesh.rotation.y = Math.PI / 4;
    pyMesh.position.y = height / 2;
    g.add(pyMesh);

    var el = edgeLine(pyGeo, C.amber, 0.2);
    el.rotation.y = Math.PI / 4;
    el.position.y = height / 2;
    g.add(el);

    var capGeo = new THREE.ConeGeometry(base * 0.07, base * 0.14, 4);
    var cap    = new THREE.Mesh(capGeo, goldMat(C.capstone));
    cap.rotation.y = Math.PI / 4;
    cap.position.y = height + base * 0.07;
    g.add(cap);

    var baseFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(base * 2.1, base * 2.1),
      stoneMat(0x7a5a2a, 1)
    );
    baseFloor.rotation.x = -Math.PI / 2;
    baseFloor.rotation.z =  Math.PI / 4;
    baseFloor.position.y = 0.05;
    g.add(baseFloor);

    g.position.set(x, 0, z);
    grp.add(g);
    return g;
  }

  buildPyramid(ancientGrp,   0, -12, 24, 32, 0xb08040);
  buildPyramid(ancientGrp, -32,  -4, 17, 23, 0xb89050);
  buildPyramid(ancientGrp,  24,   2, 11, 15, 0xc8a060);

  // Obelisk
  function buildObelisk(grp, x, z, height, color) {
    color = color || C.sandDark;
    var g = new THREE.Group();

    var shGeo = new THREE.CylinderGeometry(0.12, 0.65, height, 4);
    var shaft  = new THREE.Mesh(shGeo, stoneMat(color, 0.8));
    shaft.rotation.y = Math.PI / 4;
    shaft.position.y = height / 2 + 1.2;
    g.add(shaft);

    var el = edgeLine(shGeo, C.amber, 0.3);
    el.rotation.y = Math.PI / 4;
    el.position.y = height / 2 + 1.2;
    g.add(el);

    var tipGeo = new THREE.ConeGeometry(0.28, 1.1, 4);
    var tip    = new THREE.Mesh(tipGeo, goldMat());
    tip.rotation.y = Math.PI / 4;
    tip.position.y = height + 1.7;
    g.add(tip);

    var ped = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.8), stoneMat(C.stoneDeep));
    ped.position.y = 0.6;
    g.add(ped);

    for (var bi = 0; bi < 4; bi++) {
      var band = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.18, 0.7),
        new THREE.MeshStandardMaterial({ color: C.amber, emissive: C.amber, emissiveIntensity: 0.7 })
      );
      band.position.y = 2 + bi * 3.5;
      g.add(band);
    }

    g.position.set(x, 0, z);
    grp.add(g);
    return tip;
  }

  var obeliskTips = [];
  obeliskTips.push(buildObelisk(ancientGrp, -14,  24, 20, C.sandDark));
  obeliskTips.push(buildObelisk(ancientGrp,  14,  24, 18, C.stoneDeep));
  obeliskTips.push(buildObelisk(ancientGrp,  -9, -30, 24, 0x9a7830));
  obeliskTips.push(buildObelisk(ancientGrp,   9, -30, 22, C.sandDark));

  // Sphinx
  function buildSphinx(grp, x, z, scale) {
    scale = scale || 1;
    var g  = new THREE.Group();
    var sm = stoneMat(C.stone, 0.88);

    var body = new THREE.Mesh(new THREE.BoxGeometry(5 * scale, 3.5 * scale, 13 * scale), sm);
    body.position.y = 1.75 * scale;
    g.add(body);

    var head = new THREE.Mesh(new THREE.SphereGeometry(1.8 * scale, 10, 10), stoneMat(C.sandDark, 0.85));
    head.position.set(0, 5.6 * scale, -5 * scale);
    g.add(head);

    var nemes = new THREE.Mesh(new THREE.CylinderGeometry(1.0 * scale, 2.1 * scale, 4 * scale, 10), stoneMat(C.stoneDeep));
    nemes.position.set(0, 4.1 * scale, -5 * scale);
    g.add(nemes);

    var pawGeo = new THREE.BoxGeometry(1.7 * scale, 1 * scale, 6 * scale);
    [-1.8 * scale, 1.8 * scale].forEach(function (px) {
      var paw = new THREE.Mesh(pawGeo, sm);
      paw.position.set(px, 0.5 * scale, -8.5 * scale);
      g.add(paw);
    });

    var uraeus = new THREE.Mesh(new THREE.TorusGeometry(0.35 * scale, 0.08 * scale, 6, 12), goldMat());
    uraeus.rotation.x = Math.PI / 2;
    uraeus.position.set(0, 7.5 * scale, -5 * scale);
    g.add(uraeus);

    g.position.set(x, 0, z);
    grp.add(g);
    return g;
  }

  buildSphinx(ancientGrp,  16,  8, 1);
  buildSphinx(ancientGrp, -16, 30, 0.65);
  buildSphinx(ancientGrp,  16, 30, 0.65);

  // Hieroglyph walls
  function buildHWall(grp, x, z, rotY) {
    var g    = new THREE.Group();
    var wall = new THREE.Mesh(new THREE.BoxGeometry(22, 9, 0.9), stoneMat(C.stoneDeep));
    wall.position.y = 4.5;
    g.add(wall);

    var cornice = new THREE.Mesh(new THREE.BoxGeometry(23, 1.3, 1.3), stoneMat(0xc8a860));
    cornice.position.y = 9.65;
    g.add(cornice);

    for (var col = 0; col < 5; col++) {
      for (var row = 0; row < 2; row++) {
        var panel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.2, 0.18), stoneMat(0x6a4a1e));
        panel.position.set(col * 4 - 8, row * 3.8 + 2, 0.56);
        g.add(panel);

        var sym = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.6, 0.12),
          new THREE.MeshStandardMaterial({ color: C.amber, emissive: C.amber, emissiveIntensity: 0.9 })
        );
        sym.position.set(col * 4 - 8, row * 3.8 + 2, 0.68);
        g.add(sym);
      }
    }

    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    grp.add(g);
  }
  buildHWall(ancientGrp, -18, -45, 0);
  buildHWall(ancientGrp,  18, -45, 0);
  buildHWall(ancientGrp,   0, -58, Math.PI / 2);

  // Sand particles
  (function () {
    var n = 1400, sp = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      sp[i * 3]     = (Math.random() - 0.5) * 90;
      sp[i * 3 + 1] = Math.random() * 14;
      sp[i * 3 + 2] = Math.random() * 60 - 20;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: C.amber, size: 0.06, transparent: true, opacity: 0.5 })));
  }());

  /* ═══════════════════════════════════════════
     ████  CLASSICAL TEMPLES  (z = -68 to -118)
     ═══════════════════════════════════════════ */
  var classicalGrp = new THREE.Group();
  scene.add(classicalGrp);

  function buildColumn(x, y, z, r, h, color) {
    color = color || C.marble;
    var g = new THREE.Group();

    var shaft = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.82, r, h, 14), stoneMat(color, 0.55));
    shaft.position.y = h / 2;
    g.add(shaft);

    var cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.55, r * 0.82, r * 0.55, 14), stoneMat(0xe8dcc8, 0.5));
    cap.position.y = h + r * 0.28;
    g.add(cap);

    var abacus = new THREE.Mesh(new THREE.BoxGeometry(r * 3.1, r * 0.32, r * 3.1), stoneMat(0xf5f5dc, 0.45));
    abacus.position.y = h + r * 0.62;
    g.add(abacus);

    var base = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.25, r * 1.45, r * 0.42, 14), stoneMat(C.marbleDim));
    base.position.y = r * 0.21;
    g.add(base);

    g.position.set(x, y, z);
    return g;
  }

  function buildTemple(cx, cz, scale) {
    scale = scale || 1;
    var g    = new THREE.Group();
    var colH = 13 * scale;
    var colR = 0.65 * scale;

    // Platform
    var platform = new THREE.Mesh(
      new THREE.BoxGeometry(30 * scale, 1.6 * scale, 20 * scale),
      stoneMat(C.marbleDim, 0.75)
    );
    platform.position.y = 0.8 * scale;
    g.add(platform);

    // Columns
    [-11, -6.5, -2, 2, 6.5, 11].forEach(function (cx2) {
      g.add(buildColumn(cx2 * scale, 1.6 * scale, -8 * scale, colR, colH, C.marble));
      g.add(buildColumn(cx2 * scale, 1.6 * scale,  8 * scale, colR, colH, C.marble));
    });
    [-4, 0, 4].forEach(function (cz2) {
      g.add(buildColumn(-13 * scale, 1.6 * scale, cz2 * scale, colR, colH, 0xddd5c0));
      g.add(buildColumn( 13 * scale, 1.6 * scale, cz2 * scale, colR, colH, 0xddd5c0));
    });

    // Entablature
    var entab = new THREE.Mesh(
      new THREE.BoxGeometry(31 * scale, 1.6 * scale, 18 * scale),
      stoneMat(0xe8dcc8, 0.6)
    );
    entab.position.y = (colH + 2.4) * scale;
    g.add(entab);

    // Pediment
    var pediment = new THREE.Mesh(new THREE.ConeGeometry(16 * scale, 5.5 * scale, 3), stoneMat(0xf0e8d0, 0.55));
    pediment.rotation.y = Math.PI / 6;
    pediment.position.y = (colH + 5.2) * scale;
    g.add(pediment);

    g.position.set(cx, 0, cz);
    classicalGrp.add(g);
    return g;
  }

  buildTemple(0, -84);
  buildTemple(-38, -96, 0.75);
  buildTemple( 36, -92, 0.72);

  // Lotus columns
  var lotusCenters = [];
  function buildLotusCol(x, z) {
    var g = new THREE.Group();
    g.add(buildColumn(0, 0, 0, 0.5, 11, C.marbleDim));
    for (var i = 0; i < 8; i++) {
      var a     = (i / 8) * Math.PI * 2;
      var petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 7, 7),
        new THREE.MeshStandardMaterial({ color: C.lotus, emissive: C.lotus, emissiveIntensity: 0.55 })
      );
      petal.position.set(Math.cos(a) * 1.0, 12, Math.sin(a) * 1.0);
      g.add(petal);
    }
    var center = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 8), goldMat(C.lotusGold));
    center.position.y = 12.6;
    g.add(center);
    g.position.set(x, 0, z);
    classicalGrp.add(g);
    return center;
  }

  lotusCenters.push(buildLotusCol(-20, -72));
  lotusCenters.push(buildLotusCol( 20, -72));
  lotusCenters.push(buildLotusCol(-28, -108));
  lotusCenters.push(buildLotusCol( 28, -108));
  lotusCenters.push(buildLotusCol(  0, -112));

  for (var si = 0; si < 4; si++) {
    buildSphinx(classicalGrp, -8, -70 - si * 9, 0.5);
    buildSphinx(classicalGrp,  8, -70 - si * 9, 0.5);
  }

  /* ═══════════════════════════════════════════
     ████  MEDIEVAL CAIRO  (z = -120 to -172)
     ═══════════════════════════════════════════ */
  var medievalGrp = new THREE.Group();
  scene.add(medievalGrp);

  function buildMosque(x, z, scale) {
    scale = scale || 1;
    var g       = new THREE.Group();
    var wallMat = stoneMat(0xc8b87a, 0.78);
    var domeMat = new THREE.MeshStandardMaterial({ color: C.cobalt, roughness: 0.28, metalness: 0.45 });
    var gldM    = goldMat(C.tileGold);

    // Body
    var body = new THREE.Mesh(new THREE.BoxGeometry(22 * scale, 11 * scale, 22 * scale), wallMat);
    body.position.y = 5.5 * scale;
    g.add(body);

    // Façade panels
    for (var pi = -2; pi <= 2; pi++) {
      var panel = new THREE.Mesh(new THREE.BoxGeometry(3.5 * scale, 8 * scale, 0.3 * scale), stoneMat(0xddd090, 0.75));
      panel.position.set(pi * 4.5 * scale, 5.5 * scale, -11.2 * scale);
      g.add(panel);
    }

    // Dome
    var dome = new THREE.Mesh(new THREE.SphereGeometry(6.5 * scale, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
    dome.position.y = 11 * scale;
    g.add(dome);

    // Drum
    var drum = new THREE.Mesh(new THREE.CylinderGeometry(5.5 * scale, 6 * scale, 2 * scale, 16), stoneMat(0xc8b87a));
    drum.position.y = 10 * scale;
    g.add(drum);

    // Finial + crescent
    var fin = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.12 * scale, 3 * scale, 8), gldM);
    fin.position.y = 18.5 * scale;
    g.add(fin);

    var crescent = new THREE.Mesh(new THREE.TorusGeometry(0.55 * scale, 0.12 * scale, 6, 14, Math.PI * 1.4), gldM);
    crescent.rotation.z = Math.PI / 2;
    crescent.position.y = 20.5 * scale;
    g.add(crescent);

    // Minarets
    [[-10, -10], [10, -10], [-10, 10], [10, 10]].forEach(function (mc) {
      var mx = mc[0], mz = mc[1];
      var sh = new THREE.Mesh(new THREE.CylinderGeometry(0.6 * scale, 0.85 * scale, 20 * scale, 10), stoneMat(0xd4c080));
      sh.position.set(mx * scale, 10 * scale, mz * scale);
      g.add(sh);

      var bal = new THREE.Mesh(new THREE.CylinderGeometry(1.15 * scale, 0.95 * scale, 0.6 * scale, 10), stoneMat(0xb8a060));
      bal.position.set(mx * scale, 16 * scale, mz * scale);
      g.add(bal);

      var cone = new THREE.Mesh(new THREE.ConeGeometry(0.7 * scale, 2.8 * scale, 8), domeMat);
      cone.position.set(mx * scale, 21.4 * scale, mz * scale);
      g.add(cone);

      var star = new THREE.Mesh(new THREE.OctahedronGeometry(0.32 * scale), gldM);
      star.position.set(mx * scale, 22.9 * scale, mz * scale);
      g.add(star);
    });

    // Arches
    for (var ai = -1; ai <= 1; ai++) {
      var arch = new THREE.Mesh(new THREE.TorusGeometry(1.6 * scale, 0.22 * scale, 8, 14, Math.PI), stoneMat(0xe8d890));
      arch.position.set(ai * 5.5 * scale, 6 * scale, -11.2 * scale);
      g.add(arch);
    }

    // Star ring
    var ring = new THREE.Mesh(new THREE.TorusGeometry(3.8 * scale, 0.09 * scale, 6, 8), goldMat(C.tileGold));
    ring.position.set(0, 7.5 * scale, -11.2 * scale);
    g.add(ring);

    g.position.set(x, 0, z);
    medievalGrp.add(g);
    return g;
  }

  buildMosque(  0, -138);
  buildMosque(-42, -148, 0.75);
  buildMosque( 38, -152, 0.72);

  var bazaarStars = [];
  function buildBazaar(x, z) {
    var g = new THREE.Group();

    var body = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 10), stoneMat(0xd4b87a));
    body.position.y = 3.5;
    g.add(body);

    var dome = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x3a6a8e, roughness: 0.35, metalness: 0.38 })
    );
    dome.position.y = 7;
    g.add(dome);

    var star = new THREE.Mesh(new THREE.OctahedronGeometry(0.38), goldMat(C.tileGold));
    star.position.y = 11;
    g.add(star);

    [-2.5, 2.5].forEach(function (wx) {
      var warch = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.12, 6, 10, Math.PI), stoneMat(0xe8d890));
      warch.position.set(wx, 4.5, -5.1);
      g.add(warch);
    });

    g.position.set(x, 0, z);
    medievalGrp.add(g);
    bazaarStars.push(star);
  }

  buildBazaar(-20, -124); buildBazaar( 20, -124);
  buildBazaar(-24, -165); buildBazaar( 24, -165);
  buildBazaar( -8, -167); buildBazaar(  8, -167);

  /* ═══════════════════════════════════════════
     ████  MODERN CAIRO  (z = -172 to -222)
     ═══════════════════════════════════════════ */
  var modernGrp = new THREE.Group();
  scene.add(modernGrp);

  // Nile River
  var nileGeo = new THREE.PlaneGeometry(22, 130, 20, 20);
  var nileMat = new THREE.MeshStandardMaterial({
    color: C.nile, emissive: 0x0a2a60, emissiveIntensity: 0.45,
    roughness: 0.1, metalness: 0.25, transparent: true, opacity: 0.82
  });
  var nile = new THREE.Mesh(nileGeo, nileMat);
  nile.rotation.x = -Math.PI / 2;
  nile.position.set(8, 0.2, -200);
  modernGrp.add(nile);

  [-4, 20].forEach(function (sx) {
    var shore = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 130),
      new THREE.MeshStandardMaterial({ color: 0x1a4a80, emissive: 0x1a4a80, emissiveIntensity: 0.4, transparent: true, opacity: 0.3 })
    );
    shore.rotation.x = -Math.PI / 2;
    shore.position.set(sx, 0.15, -200);
    modernGrp.add(shore);
  });

  // Glass towers
  function buildGlassTower(x, z, w, h, color) {
    var g    = new THREE.Group();
    var tGeo = new THREE.BoxGeometry(w, h, w * 0.75);

    var tMesh = new THREE.Mesh(tGeo, glassMat(color));
    tMesh.position.y = h / 2;
    g.add(tMesh);

    var el = edgeLine(tGeo, C.glassBlue, 0.4);
    el.position.y = h / 2;
    g.add(el);

    for (var floor = 2; floor < h - 2; floor += 3) {
      var band = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.1, 0.12, w * 0.75 + 0.1),
        new THREE.MeshStandardMaterial({ color: C.glassBlue, emissive: C.glassBlue, emissiveIntensity: 0.5, transparent: true, opacity: 0.6 })
      );
      band.position.y = floor;
      g.add(band);
    }

    // Pyramid crown (heritage nod)
    var crown = new THREE.Mesh(new THREE.ConeGeometry(w * 0.6, h * 0.14, 4), goldMat(C.tileGold));
    crown.rotation.y = Math.PI / 4;
    crown.position.y = h + h * 0.07;
    g.add(crown);

    g.position.set(x, 0, z);
    modernGrp.add(g);
    return g;
  }

  var helicalTowers = [];
  helicalTowers.push(buildHelicalTower(modernGrp, -12, -188, 14, 2.4, 6.5, 0.12, C.neonCyan));
  helicalTowers.push(buildHelicalTower(modernGrp, 18, -202, 16, 2.2, 5.8, -0.10, C.neonViolet));

  buildGlassTower(-25, -178,  9, 32, C.glassBlue);
  buildGlassTower(-33, -190,  7, 24, 0x4dd0e1);
  buildGlassTower(-20, -200,  8, 38, 0x0288d1);
  buildGlassTower(-28, -212, 10, 28, C.nile);
  buildGlassTower( 32, -180,  8, 26, 0x26c6da);
  buildGlassTower( 40, -194,  6, 34, C.glassBlue);
  buildGlassTower( 27, -205,  9, 22, 0x4dd0e1);
  buildGlassTower( 36, -215,  7, 30, 0x0288d1);

  // Cairo Tower
  var cairoTowerBlink = null;
  (function () {
    var g = new THREE.Group();

    var shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 2.0, 42, 14),
      new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.25, metalness: 0.85 })
    );
    shaft.position.y = 21;
    g.add(shaft);

    var deck = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 3.5, 2.8, 14),
      new THREE.MeshStandardMaterial({ color: 0x607d8b, roughness: 0.2, metalness: 0.7 })
    );
    deck.position.y = 43;
    g.add(deck);

    for (var ry = 5; ry < 40; ry += 6) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(2, 0.12, 6, 16),
        new THREE.MeshStandardMaterial({ color: 0x9e9e9e, metalness: 0.8 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = ry;
      g.add(ring);
    }

    var ant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.18, 9, 6),
      new THREE.MeshStandardMaterial({ color: 0xbdbdbd, metalness: 0.9 })
    );
    ant.position.y = 48.5;
    g.add(ant);

    cairoTowerBlink = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xff2020, emissive: 0xff0000, emissiveIntensity: 2 })
    );
    cairoTowerBlink.position.y = 53.5;
    g.add(cairoTowerBlink);

    g.position.set(5, 0, -193);
    modernGrp.add(g);
  }());

  // Bridges
  function buildBridge(z) {
    var g    = new THREE.Group();
    var deck = new THREE.Mesh(
      new THREE.BoxGeometry(38, 0.75, 7),
      new THREE.MeshStandardMaterial({ color: C.concrete, roughness: 0.4, metalness: 0.6 })
    );
    deck.position.y = 4.5;
    g.add(deck);

    [-9, 9].forEach(function (ax) {
      var arch = new THREE.Mesh(
        new THREE.TorusGeometry(5, 0.32, 8, 18, Math.PI),
        new THREE.MeshStandardMaterial({ color: C.steel, roughness: 0.3, metalness: 0.7 })
      );
      arch.position.set(ax, 0, 0);
      g.add(arch);
    });

    for (var li = -3; li <= 3; li++) {
      var lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xffee88, emissive: 0xffee88, emissiveIntensity: 2 })
      );
      lamp.position.set(li * 5, 5.5, 3);
      g.add(lamp);
    }

    g.position.set(0, 0, z);
    modernGrp.add(g);
  }
  buildBridge(-183);
  buildBridge(-213);

  /* ═══════════════════════════════════════════
     ████  FUTURE EGYPT  (z = -225 to -285)
     ═══════════════════════════════════════════ */
  var futureGrp = new THREE.Group();
  scene.add(futureGrp);

  // Floating inverted pyramids
  var fpData = [
    { x:  0, z: -238, s: 13, c: C.neonCyan,   alt: 32 },
    { x: -28, z: -252, s:  9, c: C.neonViolet, alt: 24 },
    { x:  30, z: -255, s:  8, c: C.neonGold,   alt: 27 },
    { x: -14, z: -270, s:  6, c: C.neonPink,   alt: 20 },
    { x:  18, z: -272, s:  7, c: C.neonGreen,  alt: 22 }
  ];

  var floatingPyramids = fpData.map(function (d) {
    var g   = new THREE.Group();
    var geo = new THREE.ConeGeometry(d.s, d.s * 2, 4);

    var mesh = new THREE.Mesh(geo, glowMat(d.c, 1.0, 0.7));
    mesh.rotation.x = Math.PI;
    mesh.rotation.y = Math.PI / 4;
    mesh.position.y = d.alt;
    g.add(mesh);

    var el = edgeLine(geo, d.c, 0.95);
    el.rotation.x = Math.PI;
    el.rotation.y = Math.PI / 4;
    el.position.y = d.alt;
    g.add(el);

    // Energy beam
    var beamGeo = new THREE.CylinderGeometry(0.06, d.s * 0.9, d.alt, 6, 1, true);
    var beam    = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: d.c, transparent: true, opacity: 0.25, side: THREE.DoubleSide }));
    beam.position.y = d.alt / 2;
    g.add(beam);

    // Ground rune
    var rune = new THREE.Mesh(
      new THREE.RingGeometry(d.s * 1.05, d.s * 1.15, 4),
      new THREE.MeshBasicMaterial({ color: d.c, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    rune.rotation.x = -Math.PI / 2;
    rune.rotation.z =  Math.PI / 4;
    rune.position.y = 0.05;
    g.add(rune);

    g.position.set(d.x, 0, d.z);
    futureGrp.add(g);
    return { mesh: mesh, el: el, g: g, baseAlt: d.alt };
  });

  // Segmented floating obelisks
  var segmentedObelisks = [];
  [
    { x: -20, z: -228, h: 26, s: 5, c: C.neonCyan   },
    { x:  20, z: -228, h: 23, s: 4, c: C.neonViolet },
    { x: -38, z: -248, h: 19, s: 4, c: C.neonGold   },
    { x:  38, z: -248, h: 21, s: 5, c: C.neonPink   },
    { x: -12, z: -265, h: 17, s: 3, c: C.neonGreen  },
    { x:  12, z: -265, h: 19, s: 4, c: C.neonCyan   }
  ].forEach(function (d) {
    segmentedObelisks.push(buildSegmentedObelisk(futureGrp, d.x, d.z, d.h, d.s, d.c));
  });

  // Aerial traffic lanes (between Modern and Future sectors)
  addTrafficLane(futureGrp, new THREE.Vector3(-25, 20, -178), new THREE.Vector3(-44, 28, -228), 3, C.neonCyan);
  addTrafficLane(futureGrp, new THREE.Vector3(32, 18, -180), new THREE.Vector3(44, 25, -228), 3, C.neonViolet);
  addTrafficLane(futureGrp, new THREE.Vector3(-20, 25, -200), new THREE.Vector3(-26, 18, -242), 2, C.neonGold);
  addTrafficLane(futureGrp, new THREE.Vector3(27, 16, -205), new THREE.Vector3(26, 15, -245), 2, C.neonPink);
  addTrafficLane(futureGrp, new THREE.Vector3(-44, 22, -228), new THREE.Vector3(0, 28, -266), 3, C.neonCyan);
  addTrafficLane(futureGrp, new THREE.Vector3(44, 22, -228), new THREE.Vector3(0, 28, -266), 3, C.neonViolet);

  // Holographic Quantum Core above the central helical pyramid
  var quantumCore = buildQuantumCore(futureGrp, 0, 26, -266, 4.5, C.neonCyan);

  // Eye of Ra
  var eyeOfRa = new THREE.Group();
  (function () {
    var ring = new THREE.Mesh(new THREE.TorusGeometry(7, 0.32, 8, 44), glowMat(C.neonGold, 1.6));
    eyeOfRa.add(ring);

    var pupil = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 14), glowMat(C.neonCyan, 2.8, 0.82));
    eyeOfRa.add(pupil);

    for (var ri = 0; ri < 12; ri++) {
      var ra = (ri / 12) * Math.PI * 2;
      var pts = [
        new THREE.Vector3(Math.cos(ra) * 7.5, Math.sin(ra) * 7.5, 0),
        new THREE.Vector3(Math.cos(ra) * 11,  Math.sin(ra) * 11,  0)
      ];
      eyeOfRa.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: C.neonGold, transparent: true, opacity: 0.55 })
      ));
    }

    var tear = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4, 3), glowMat(C.neonGold, 1.2, 0.8));
    tear.rotation.z = Math.PI;
    tear.position.y = -9;
    eyeOfRa.add(tear);
  }());
  eyeOfRa.position.set(0, 30, -260);
  eyeOfRa.rotation.x = -Math.PI / 5;
  futureGrp.add(eyeOfRa);

  // Torus knots
  var torusKnots = [];
  [[-22, -238, C.neonCyan], [22, -250, C.neonViolet], [0, -278, C.neonGold]].forEach(function (d) {
    var geo  = new THREE.TorusKnotGeometry(3.2, 0.42, 80, 10, 2, 3);
    var mesh = new THREE.Mesh(geo, glowMat(d[2], 1.4, 0.9));
    mesh.position.set(d[0], 16, d[1]);
    futureGrp.add(mesh);
    var el = edgeLine(geo, d[2], 0.35);
    el.position.set(d[0], 16, d[1]);
    futureGrp.add(el);
    torusKnots.push({ mesh: mesh, el: el });
  });

  // Hex grid
  (function () {
    var grp = new THREE.Group();
    var r = 4.2, w = r * Math.sqrt(3), h = r * 1.5;
    for (var row = -5; row <= 5; row++) {
      for (var col = -9; col <= 9; col++) {
        var ox = row % 2 === 0 ? 0 : w / 2;
        var hx = col * w + ox, hz = row * h;
        var pts = [];
        for (var vi = 0; vi < 7; vi++) {
          var va = (vi / 6) * Math.PI * 2 + Math.PI / 6;
          pts.push(new THREE.Vector3(Math.cos(va) * r * 0.96, 0.06, Math.sin(va) * r * 0.96));
        }
        var hLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: (Math.random() > 0.5 ? C.neonCyan : C.neonViolet), transparent: true, opacity: 0.18 })
        );
        hLine.position.set(hx, 0, hz);
        grp.add(hLine);
      }
    }
    grp.position.set(0, 0, -250);
    futureGrp.add(grp);
  }());

  // Premium Cyber-Egyptian Skyscraper Builder
  function buildFutureSkyscraper(x, z, height, width, color) {
    var g = new THREE.Group();

    // 1. Core structural skeleton (glowing wireframe core)
    var coreGeo = new THREE.BoxGeometry(width * 0.55, height, width * 0.55);
    var core = new THREE.Mesh(coreGeo, glowMat(color, 1.2, 0.72));
    core.position.y = height / 2;
    g.add(core);

    // 2. Outer glass panels (semi-transparent skin)
    var glassGeo = new THREE.BoxGeometry(width, height * 0.96, width);
    var glass = new THREE.Mesh(glassGeo, glassMat(color));
    glass.position.y = height / 2;
    g.add(glass);

    // 3. Glowing neon edge lines
    var edges = edgeLine(glassGeo, color, 0.9);
    edges.position.y = height / 2;
    g.add(edges);

    // 4. Horizontal neon ribs/floors
    var floorsCount = Math.floor(height / 5.5);
    for (var f = 0; f < floorsCount; f++) {
      var fy = f * 5.5 + 2.8;
      var ribGeo = new THREE.BoxGeometry(width * 1.04, 0.22, width * 1.04);
      var rib = new THREE.Mesh(ribGeo, glowMat(color, 1.6));
      rib.position.y = fy;
      g.add(rib);
      
      // Face accent ring details
      if (f % 3 === 0) {
        var ringGeo = new THREE.TorusGeometry(width * 0.72, 0.12, 4, 8);
        var ring = new THREE.Mesh(ringGeo, goldMat(C.neonGold));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = fy;
        g.add(ring);
      }
    }

    // 5. Crown: Holographic glowing capstone
    var capGeo = new THREE.ConeGeometry(width * 0.55, width * 1.1, 4);
    var cap = new THREE.Mesh(capGeo, glowMat(color, 2.5, 0.9));
    cap.rotation.y = Math.PI / 4;
    cap.position.y = height + (width * 0.55);
    g.add(cap);

    // Vertical energy beam
    var beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 90, 8);
    var beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
      color: color, transparent: true, opacity: 0.35
    }));
    beam.position.y = height + 45;
    g.add(beam);

    g.position.set(x, 0, z);
    futureGrp.add(g);
    return g;
  }

  // Future City Starry Nebula Field
  (function () {
    var starCount = 600;
    var positions = new Float32Array(starCount * 3);
    var colors = new Float32Array(starCount * 3);
    
    var nebulaColors = [
      new THREE.Color(C.neonCyan),
      new THREE.Color(C.neonViolet),
      new THREE.Color(C.neonPink)
    ];

    for (var i = 0; i < starCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 320;
      positions[i * 3 + 1] = Math.random() * 85 + 32;
      positions[i * 3 + 2] = Math.random() * -120 - 200; // far back in future section
      
      var col = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    var starPoints = new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 0.45, vertexColors: true, transparent: true, opacity: 0.75, sizeAttenuation: true
    }));
    futureGrp.add(starPoints);
  }());

  // Additional flying traffic lanes connecting skyscrapers
  addTrafficLane(futureGrp, new THREE.Vector3(-44, 15, -228), new THREE.Vector3(-54, 30, -255), 4, C.neonCyan);
  addTrafficLane(futureGrp, new THREE.Vector3(44, 15, -228), new THREE.Vector3(54, 30, -258), 4, C.neonPink);
  addTrafficLane(futureGrp, new THREE.Vector3(-54, 25, -255), new THREE.Vector3(-32, 35, -285), 3, C.neonGold);
  addTrafficLane(futureGrp, new THREE.Vector3(54, 25, -258), new THREE.Vector3(32, 35, -285), 3, C.neonGreen);
  addTrafficLane(futureGrp, new THREE.Vector3(-32, 40, -285), new THREE.Vector3(0, 26, -266), 4, C.neonCyan);
  addTrafficLane(futureGrp, new THREE.Vector3(32, 40, -285), new THREE.Vector3(0, 26, -266), 4, C.neonViolet);

  var honeycombCitadels = [];
  honeycombCitadels.push(buildHoneycombCitadel(futureGrp, -26, -242, 2.5, 12, C.neonCyan));
  honeycombCitadels.push(buildHoneycombCitadel(futureGrp, 26, -245, 2.2, 10, C.neonViolet));

  var helicalPyramid = buildHelicalPyramid(futureGrp, 0, -266, 16, 22, C.neonGold);

  // Dense skyscraper horizon canyon
  buildFutureSkyscraper(-44, -228, 52, 7.5, C.neonCyan);
  buildFutureSkyscraper( 44, -228, 46, 7.5, C.neonViolet);
  buildFutureSkyscraper(-54, -255, 58, 8.5, C.neonGold);
  buildFutureSkyscraper( 54, -258, 50, 8.5, C.neonPink);
  buildFutureSkyscraper(-48, -276, 44, 6.5, C.neonGreen);
  buildFutureSkyscraper( 48, -274, 42, 6.5, C.neonCyan);
  buildFutureSkyscraper(-32, -285, 62, 9.0, C.neonViolet);
  buildFutureSkyscraper( 32, -285, 56, 9.0, C.neonGold);
  buildFutureSkyscraper(-60, -240, 40, 7.0, C.neonCyan);
  buildFutureSkyscraper( 60, -240, 38, 7.0, C.neonPink);

  /* ═══════════════════════════════════════════
     GROUND & GRID
     ═══════════════════════════════════════════ */
  var groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 420),
    stoneMat(0x090604, 1)
  );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(0, -0.3, -145);
  scene.add(groundMesh);

  var gridH = new THREE.GridHelper(500, 90, 0x00f5ff, 0x0a1828);
  gridH.material.opacity = 0.07;
  gridH.material.transparent = true;
  gridH.position.set(0, 0.02, -130);
  scene.add(gridH);

  /* ═══════════════════════════════════════════
     GLOBAL PARTICLES
     ═══════════════════════════════════════════ */
  var particleGeo, particleArr, PARTICLE_N = 3000;
  (function () {
    var pp = new Float32Array(PARTICLE_N * 3);
    var pc = new Float32Array(PARTICLE_N * 3);
    var pal = [
      new THREE.Color(C.amber), new THREE.Color(C.gold),
      new THREE.Color(C.neonCyan), new THREE.Color(C.neonViolet),
      new THREE.Color(C.neonPink), new THREE.Color(C.neonGreen)
    ];
    for (var i = 0; i < PARTICLE_N; i++) {
      pp[i * 3]     = (Math.random() - 0.5) * 130;
      pp[i * 3 + 1] = Math.random() * 55 + 1;
      pp[i * 3 + 2] = Math.random() * -285 + 45;
      var col = pal[Math.floor(Math.random() * pal.length)];
      pc[i * 3] = col.r; pc[i * 3 + 1] = col.g; pc[i * 3 + 2] = col.b;
    }
    particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    particleGeo.setAttribute('color',    new THREE.BufferAttribute(pc, 3));
    particleArr = pp;
    scene.add(new THREE.Points(particleGeo, new THREE.PointsMaterial({
      size: 0.2, vertexColors: true, transparent: true, opacity: 0.6, sizeAttenuation: true
    })));
  }());

  /* ═══════════════════════════════════════════
     ANCIENT EGYPT SANDSTORM SYSTEM
     ═══════════════════════════════════════════ */
  var sandstormGeo, sandstormPoints;
  var SANDSTORM_N = 8000;
  var sandstormData = [];

  (function () {
    var positions = new Float32Array(SANDSTORM_N * 3);
    var colors = new Float32Array(SANDSTORM_N * 3);
    
    var sandColors = [
      new THREE.Color(C.amber),
      new THREE.Color(C.gold),
      new THREE.Color(C.sand),
      new THREE.Color(C.sandDark)
    ];

    for (var i = 0; i < SANDSTORM_N; i++) {
      var px = (Math.random() - 0.5) * 240;
      var py = Math.random() * 32;
      var pz = Math.random() * 100 - 50;
      
      positions[i * 3]     = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      var col = sandColors[Math.floor(Math.random() * sandColors.length)];
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sandstormData.push({
        windSpeed: 25 + Math.random() * 35,
        swirlSpeed: 1 + Math.random() * 4,
        swirlRadius: 0.1 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }

    sandstormGeo = new THREE.BufferGeometry();
    sandstormGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sandstormGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    sandstormPoints = new THREE.Points(sandstormGeo, new THREE.PointsMaterial({
      size: 0.28, vertexColors: true, transparent: true, opacity: 0.0, sizeAttenuation: true
    }));
    scene.add(sandstormPoints);
  }());

  /* ═══════════════════════════════════════════
     LIGHTS
     ═══════════════════════════════════════════ */
  scene.add(new THREE.AmbientLight(0x100804, 1.1));

  var sceneLights = [];
  [
    [C.amber,     4.5,   0,  30,   10],
    [0xffcc60,    2.0, -28,  18,  -18],
    [0xff8c00,    1.8,  22,  14,  -32],
    [0xfff0c0,    2.2,   0,  18,  -88],
    [C.cobalt,    3.0,   0,  22, -140],
    [C.tileGold,  1.8, -32,  26, -130],
    [C.glassBlue, 2.5, -22,  16, -195],
    [0xffa000,    1.5,  22,  12, -188],
    [C.neonCyan,  4.2,   0,  28, -248],
    [C.neonViolet,3.0, -28,  22, -255],
    [C.neonGold,  2.5,  28,  22, -262],
    [C.neonPink,  2.0,   0,  15, -275]
  ].forEach(function (ld) {
    var l = new THREE.PointLight(ld[0], ld[1], 110);
    l.position.set(ld[2], ld[3], ld[4]);
    l.userData.base = ld[1];
    scene.add(l);
    sceneLights.push(l);
  });

  var sunLight = new THREE.DirectionalLight(0xfff5d0, 1.4);
  sunLight.position.set(60, 90, 60);
  scene.add(sunLight);

  /* ═══════════════════════════════════════════
     HUD + SCROLL
     ═══════════════════════════════════════════ */
  var scrollProgress = 0;
  var hudProgress = document.getElementById('hudProgress');
  var hudEra      = document.getElementById('hudEra');
  var hudLabel    = document.getElementById('hudLabel');

  var eraYears  = ['4000 BCE', '2560 BCE', '500 BCE', '969 CE', '2024 CE', '2150 CE', '∞ ETERNAL'];
  var eraLabels = ['DAWN OF CIVILIZATION', 'AGE OF THE PHARAOHS', 'CLASSICAL TEMPLES',
                   'FATIMID CAIRO', 'MODERN EGYPT', 'THE NEW KINGDOM', 'EGYPT ETERNAL'];
  var sectionIDs = ['s0','s1','s2','s3','s4','s5','s6'];

  function updateHUD() {
    if (hudProgress) hudProgress.style.width = (scrollProgress * 100) + '%';
    var idx = Math.min(Math.floor(scrollProgress * (eraYears.length - 1)), eraYears.length - 1);
    if (hudEra)   hudEra.textContent   = eraYears[idx];
    if (hudLabel) hudLabel.textContent = eraLabels[idx];

    sectionIDs.forEach(function (id, i) {
      var tb = document.getElementById('tb' + i);
      var el = document.getElementById(id);
      if (!tb || !el) return;
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.78 && r.bottom > 0) {
        tb.classList.add('visible');
      } else {
        tb.classList.remove('visible');
      }
    });
  }

  window.addEventListener('scroll', updateHUD, { passive: true });

  /* ═══════════════════════════════════════════
     CAMERA INTERPOLATION
     ═══════════════════════════════════════════ */
  var camLookSmooth = new THREE.Vector3(0, 5, -10);
  var tmpPos        = new THREE.Vector3();
  var tmpLook       = new THREE.Vector3();

  function getCamState(t) {
    var total  = CAM.length - 1;
    var scaled = t * total;
    var idx    = Math.min(Math.floor(scaled), total - 1);
    var frac   = scaled - idx;
    var ease   = frac < 0.5
      ? 4 * frac * frac * frac
      : 1 - Math.pow(-2 * frac + 2, 3) / 2;
    var a = CAM[idx], b = CAM[Math.min(idx + 1, total)];
    tmpPos.lerpVectors(a.p, b.p, ease);
    tmpLook.lerpVectors(a.l, b.l, ease);
    return { pos: tmpPos, look: tmpLook };
  }

  /* ═══════════════════════════════════════════
     ANIMATION LOOP
     ═══════════════════════════════════════════ */
  var clock      = new THREE.Clock();
  var frameCount = 0;
  var tmpBg      = new THREE.Color();
  var tmpFog     = new THREE.Color();
  var camTarget  = new THREE.Vector3();

  // Read scroll every frame — never misses an update
  function readScroll() {
    var maxSc = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
    scrollProgress = maxSc > 0 ? Math.min(window.scrollY / maxSc, 1) : 0;
  }

  function animate() {
    requestAnimationFrame(animate);

    readScroll();
    updateHUD();

    var delta   = clock.getDelta();
    var elapsed = clock.getElapsedTime();
    frameCount++;

    // ── Camera ─────────────────────────────────────────────────────
    var cs = getCamState(scrollProgress);
    camTarget.set(cs.pos.x + mouse.nx * 2.5, cs.pos.y + mouse.ny * 1.5, cs.pos.z);
    camera.position.lerp(camTarget, 0.10);
    camLookSmooth.lerp(cs.look, 0.10);
    camera.lookAt(camLookSmooth);

    // ── Background / fog ────────────────────────────────────────────
    var bgTotal  = BG.length - 1;
    var bgScaled = scrollProgress * bgTotal;
    var bgIdx    = Math.min(Math.floor(bgScaled), bgTotal - 1);
    var bgFrac   = bgScaled - bgIdx;
    var bgA = BG[bgIdx], bgB = BG[Math.min(bgIdx + 1, bgTotal)];
    tmpBg.copy(bgA.bg).lerp(bgB.bg, bgFrac);
    tmpFog.copy(bgA.fog).lerp(bgB.fog, bgFrac);
    scene.background.copy(tmpBg);
    scene.fog.color.copy(tmpFog);

    // ── Obelisk tips ───────────────────────────────────────────────
    obeliskTips.forEach(function (tip, i) {
      tip.material.emissiveIntensity = 0.8 + Math.sin(elapsed * 2.2 + i * 1.2) * 0.5;
    });

    // ── Lotus centers ──────────────────────────────────────────────
    lotusCenters.forEach(function (lc, i) {
      lc.material.emissiveIntensity = 0.7 + Math.sin(elapsed * 1.8 + i * 0.9) * 0.4;
    });

    // ── Bazaar stars ───────────────────────────────────────────────
    bazaarStars.forEach(function (star, i) {
      star.rotation.y += delta * (0.5 + i * 0.1);
      star.rotation.x += delta * 0.3;
      star.material.emissiveIntensity = 0.8 + Math.sin(elapsed * 2 + i) * 0.4;
    });

    // ── Cairo tower blink ──────────────────────────────────────────
    if (cairoTowerBlink) {
      cairoTowerBlink.material.emissiveIntensity = Math.sin(elapsed * 3.5) > 0 ? 2.5 : 0.1;
    }

    // ── Torus knots ────────────────────────────────────────────────
    torusKnots.forEach(function (tk, i) {
      tk.mesh.rotation.y += delta * (0.35 + i * 0.12);
      tk.mesh.rotation.x += delta * 0.2;
      tk.el.rotation.y    = tk.mesh.rotation.y;
      tk.el.rotation.x    = tk.mesh.rotation.x;
    });

    // ── Floating pyramids ──────────────────────────────────────────
    floatingPyramids.forEach(function (fp, i) {
      var hover = Math.sin(elapsed * 1.2 + i * 1.1) * 1.6;
      fp.mesh.position.y = fp.baseAlt + hover;
      fp.el.position.y   = fp.mesh.position.y;
      fp.g.rotation.y   += delta * 0.08 * (i % 2 === 0 ? 1 : -1);
    });

    // ── Eye of Ra ──────────────────────────────────────────────────
    eyeOfRa.rotation.z += delta * 0.28;
    eyeOfRa.children[1].material.emissiveIntensity = 2.2 + Math.sin(elapsed * 2.4) * 0.8;

    // ── Segmented floating obelisks ────────────────────────────────
    segmentedObelisks.forEach(function (sob) {
      sob.segments.forEach(function (seg) {
        var hover = Math.sin(elapsed * 2.0 + seg.phase) * 0.45;
        seg.mesh.position.y = seg.baseOffset + hover;
        seg.el.position.y = seg.mesh.position.y;
        seg.mesh.rotation.y += delta * 0.25;
        seg.el.rotation.y = seg.mesh.rotation.y;
      });
      sob.beam.material.opacity = 0.5 + Math.sin(elapsed * 8.0) * 0.15;
    });

    // ── Aerial traffic streams ─────────────────────────────────────
    trafficStreams.forEach(function (stream) {
      stream.vehicles.forEach(function (v) {
        v.progress += delta * v.speed;
        if (v.progress > 1) {
          v.progress = 0;
        }
        v.mesh.position.lerpVectors(v.start, v.end, v.progress);
        v.mesh.position.y += Math.sin(elapsed * 3.5 + v.progress * 15) * 0.08;
        v.mesh.lookAt(v.end);
      });
    });

    // ── Holographic Quantum Core ───────────────────────────────────
    if (quantumCore) {
      quantumCore.core1.rotation.y += delta * 0.35;
      quantumCore.core1.rotation.x += delta * 0.20;
      quantumCore.core2.rotation.y -= delta * 0.55;
      quantumCore.core2.rotation.z += delta * 0.30;
      quantumCore.ring.rotation.z += delta * 0.15;
      quantumCore.ring.material.emissiveIntensity = 2.0 + Math.sin(elapsed * 3.0) * 0.6;
    }

    // ── Helical towers ─────────────────────────────────────────────
    helicalTowers.forEach(function (ht, i) {
      ht.rotation.y += delta * 0.12 * (i === 0 ? 1 : -1);
    });

    // ── Honeycomb citadels ─────────────────────────────────────────
    honeycombCitadels.forEach(function (citadel) {
      citadel.cells.forEach(function (cell) {
        var hover = Math.sin(elapsed * 1.5 + cell.phase) * 1.4;
        cell.mesh.position.y = cell.baseH / 2 + hover;
        cell.el.position.y = cell.mesh.position.y;
        cell.ring.position.y = cell.baseH + 1.2 + hover + Math.sin(elapsed * 2.8 + cell.phase) * 0.25;
        cell.ring.rotation.z += delta * 0.8;
      });
    });

    // ── Helical pyramid ────────────────────────────────────────────
    if (helicalPyramid) {
      helicalPyramid.nodes.forEach(function (node, i) {
        node.material.emissiveIntensity = 2.0 + Math.sin(elapsed * 4.0 + i * 0.5) * 1.2;
        var scale = 1.0 + Math.sin(elapsed * 3.0 + i * 0.2) * 0.18;
        node.scale.setScalar(scale);
      });
      helicalPyramid.g.rotation.y += delta * 0.05;
    }

    // ── Nile waves ─────────────────────────────────────────────────
    if (frameCount % 3 === 0) {
      var nPos = nile.geometry.attributes.position;
      for (var ni = 0; ni < nPos.count; ni++) {
        var nx2 = nPos.getX(ni), nz2 = nPos.getZ(ni);
        nPos.setZ(ni, Math.sin(nx2 * 0.45 + elapsed * 1.6) * 0.3 + Math.cos(nz2 * 0.3 + elapsed * 1.1) * 0.15);
      }
      nPos.needsUpdate = true;
      nile.geometry.computeVertexNormals();
    }

    // ── Lights pulse ───────────────────────────────────────────────
    sceneLights.forEach(function (l, i) {
      l.intensity = l.userData.base + Math.sin(elapsed * 1.4 + i * 0.65) * 0.4;
    });

    // ── Particle drift ─────────────────────────────────────────────
    if (frameCount % 2 === 0) {
      for (var pi = 0; pi < PARTICLE_N; pi++) {
        particleArr[pi * 3 + 1] += Math.sin(elapsed * 0.4 + pi * 0.15) * 0.003;
      }
      particleGeo.attributes.position.needsUpdate = true;
    }

    // ── Sandstorm update ───────────────────────────────────────────
    if (sandstormPoints) {
      var camZ = camera.position.z;
      var targetOpacity = 0;
      if (camZ > -60) {
        if (camZ > 30) {
          targetOpacity = Math.min((110 - camZ) / 40, 0.72);
        } else {
          targetOpacity = Math.min((camZ + 60) / 90 * 0.72, 0.72);
        }
      }
      sandstormPoints.material.opacity = sandstormPoints.material.opacity + (targetOpacity - sandstormPoints.material.opacity) * 0.08;

      var positions = sandstormGeo.attributes.position.array;
      for (var i = 0; i < SANDSTORM_N; i++) {
        var data = sandstormData[i];
        positions[i * 3] -= data.windSpeed * delta;
        data.phase += delta * data.swirlSpeed;
        positions[i * 3 + 1] += Math.sin(data.phase) * data.swirlRadius * 0.15;
        positions[i * 3 + 2] += Math.cos(data.phase) * data.swirlRadius * 0.15;

        if (positions[i * 3] < -120) {
          positions[i * 3] = 120;
          positions[i * 3 + 1] = Math.random() * 32;
        }
      }
      sandstormGeo.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  animate();

  /* ═══════════════════════════════════════════
     RESIZE + RESTART
     ═══════════════════════════════════════════ */
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  var btnRestart = document.getElementById('btnRestart');
  if (btnRestart) {
    btnRestart.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
