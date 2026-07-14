import * as THREE from "https://esm.sh/three@0.160.0";

const canvas = document.getElementById("hero-canvas");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglAvailable() {
  try {
    const test = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (test.getContext("webgl2") || test.getContext("webgl")));
  } catch (err) {
    return false;
  }
}

function removeCanvas() {
  if (canvas && canvas.parentNode) {
    canvas.remove();
  }
}

function revealCanvas() {
  if (canvas) canvas.classList.add("is-ready");
}

const STRAND_COLORS = [0x6bf0c2, 0xffb25e, 0x9d8cff];

// Subtle cursor interaction (world units).
const CURSOR_RADIUS = 1.7;

// ---------------------------------------------------------------------------
// Strands (fiber tubes with travelling light packets) — gentle cursor glow.
// ---------------------------------------------------------------------------

const strandVertex = `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const strandFragment = `
  varying vec2 vUv;
  varying vec3 vWorld;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uSpeed;
  uniform float uOffset;
  uniform float uBase;
  uniform vec3 uCursor;
  uniform float uCursorRadius;
  uniform float uCursorStrength;

  float packet(float x, float center, float width) {
    float d = abs(x - center);
    d = min(d, 1.0 - d);
    return exp(-(d * d) / (width * width));
  }

  void main() {
    float t = fract(uTime * uSpeed + uOffset);
    float p1 = packet(vUv.x, t, 0.016) * 2.0;
    float p2 = packet(vUv.x, fract(t + 0.42), 0.05) * 0.5;
    float rim = smoothstep(1.0, 0.15, abs(vUv.y - 0.5) * 2.0);

    // World-space cursor proximity glow (survives parallax rotation).
    float cd = distance(vWorld.xy, uCursor.xy);
    float cursorGlow = exp(-(cd * cd) / (uCursorRadius * uCursorRadius)) * uCursorStrength;

    float i = (uBase + p1 + p2 + cursorGlow) * rim;
    vec3 col = uColor * i + vec3(1.0) * (p1 * 0.24 + cursorGlow * 0.25) * rim;
    gl_FragColor = vec4(col, clamp(i, 0.0, 1.0));
  }
`;

function makeCurve(index, total, spread) {
  const pts = [];
  const yBase = THREE.MathUtils.lerp(-2.4, 2.6, total <= 1 ? 0.5 : index / (total - 1));
  const segs = 6;
  // Gentle z-spread so a few strands sit nearer and others recede into fog.
  const zBias = THREE.MathUtils.lerp(-2.4, 0.2, index / Math.max(1, total - 1));
  for (let s = 0; s <= segs; s += 1) {
    const x = THREE.MathUtils.lerp(-spread, spread, s / segs);
    const y = yBase + Math.sin(s * 1.7 + index * 2.3) * 0.85 + (Math.random() - 0.5) * 0.5;
    const z = zBias + Math.cos(s * 1.3 + index * 1.9) * 1.4 - 0.6;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

// ---------------------------------------------------------------------------
// Parallax depth layers (faint star/dust fields) — soft, non-glowy.
// ---------------------------------------------------------------------------

const layerVertex = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec3 uCursor;
  uniform float uCursorRadius;
  uniform float uCursorPush;
  attribute float aScale;
  attribute float aTwinkle;
  varying float vGlow;
  varying float vTwinkle;

  void main() {
    vec3 p = position;
    vec2 toCursor = p.xy - uCursor.xy;
    float d = length(toCursor);
    float infl = exp(-(d * d) / (uCursorRadius * uCursorRadius));
    p.xy += normalize(toCursor + vec2(1e-4)) * infl * uCursorPush;
    vGlow = infl;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float twk = 0.55 + 0.45 * sin(uTime * 1.4 + aTwinkle * 6.2831);
    vTwinkle = twk;
    gl_PointSize = uSize * aScale * twk * uPixelRatio * (300.0 / max(0.1, -mv.z));
  }
`;

const layerFragment = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vGlow;
  varying float vTwinkle;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    float a = smoothstep(0.5, 0.0, r);
    a *= a;
    vec3 col = uColor + vec3(0.5, 0.5, 0.7) * vGlow * 0.6;
    gl_FragColor = vec4(col, a * uOpacity * (0.5 + 0.5 * vTwinkle) + a * vGlow * 0.4);
  }
`;

function createLayer(opts) {
  const { count, xSpread, ySpread, zMin, zMax, size, color, opacity, cursorPush, pixelRatio } = opts;
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const twinkles = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * xSpread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * ySpread;
    positions[i * 3 + 2] = THREE.MathUtils.lerp(zMin, zMax, Math.random());
    scales[i] = 0.6 + Math.random() * 0.9;
    twinkles[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute("aTwinkle", new THREE.BufferAttribute(twinkles, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: layerVertex,
    fragmentShader: layerFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uSize: { value: size },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(color) },
      uCursor: { value: new THREE.Vector3(9999, 9999, 0) },
      uCursorRadius: { value: CURSOR_RADIUS },
      uCursorPush: { value: cursorPush }
    }
  });

  const points = new THREE.Points(geometry, material);
  return { points, material, zMin, ySpread, xSpread };
}

// ---------------------------------------------------------------------------
// Scene assembly.
// ---------------------------------------------------------------------------

function buildScene() {
  const isSmall = window.innerWidth < 760;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmall, alpha: true });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0714, 0.045);

  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 80);
  camera.position.set(0, 0, 6.2);

  // Fiber strands.
  const strandGroup = new THREE.Group();
  const strandMaterials = [];
  const strandCount = isSmall ? 5 : 8;
  const spread = isSmall ? 7 : 10;

  for (let i = 0; i < strandCount; i += 1) {
    const curve = makeCurve(i, strandCount, spread);
    const color = STRAND_COLORS[i % STRAND_COLORS.length];

    const coreUniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSpeed: { value: 0.05 + Math.random() * 0.06 },
      uOffset: { value: Math.random() },
      uBase: { value: 0.12 + Math.random() * 0.08 },
      uCursor: { value: new THREE.Vector3(9999, 9999, 0) },
      uCursorRadius: { value: CURSOR_RADIUS },
      uCursorStrength: { value: 0.0 }
    };
    const geometry = new THREE.TubeGeometry(curve, isSmall ? 120 : 220, 0.018, isSmall ? 5 : 7, false);
    const material = new THREE.ShaderMaterial({
      vertexShader: strandVertex,
      fragmentShader: strandFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: coreUniforms
    });
    strandMaterials.push(material);
    strandGroup.add(new THREE.Mesh(geometry, material));

    const haloGeometry = new THREE.TubeGeometry(curve, isSmall ? 60 : 110, 0.075, isSmall ? 4 : 6, false);
    const haloMaterial = new THREE.ShaderMaterial({
      vertexShader: strandVertex,
      fragmentShader: strandFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uSpeed: { value: coreUniforms.uSpeed.value },
        uOffset: { value: coreUniforms.uOffset.value },
        uBase: { value: 0.012 },
        uCursor: { value: coreUniforms.uCursor.value },
        uCursorRadius: { value: CURSOR_RADIUS },
        uCursorStrength: { value: 0.0 }
      }
    });
    strandMaterials.push(haloMaterial);
    strandGroup.add(new THREE.Mesh(haloGeometry, haloMaterial));
  }
  scene.add(strandGroup);

  // Parallax depth layers: far stars, mid stars, near dust. Kept faint.
  const layers = [];
  layers.push(Object.assign(createLayer({
    count: isSmall ? 160 : 280,
    xSpread: 44, ySpread: 26, zMin: -20, zMax: -11,
    size: 1.2, color: 0x8ea6e8, opacity: 0.35, cursorPush: 0.0, pixelRatio
  }), { parallax: 0.02 }));

  layers.push(Object.assign(createLayer({
    count: isSmall ? 110 : 200,
    xSpread: 34, ySpread: 20, zMin: -10, zMax: -4,
    size: 1.7, color: 0x9d8cff, opacity: 0.4, cursorPush: 0.18, pixelRatio
  }), { parallax: 0.06 }));

  layers.push(Object.assign(createLayer({
    count: isSmall ? 70 : 130,
    xSpread: 24, ySpread: 15, zMin: -2, zMax: 4.5,
    size: 3.0, color: 0x6bf0c2, opacity: 0.42, cursorPush: 0.5, pixelRatio
  }), { parallax: 0.14 }));

  layers.forEach(function (l) { scene.add(l.points); });

  return { renderer, scene, camera, strandGroup, strandMaterials, layers, isSmall, pixelRatio };
}

// ---------------------------------------------------------------------------
// Runtime.
// ---------------------------------------------------------------------------

function init() {
  if (!canvas) return;
  if (!webglAvailable()) {
    removeCanvas();
    return;
  }

  let ctx;
  try {
    ctx = buildScene();
  } catch (err) {
    removeCanvas();
    return;
  }

  const { renderer, scene, camera, strandGroup, strandMaterials, layers } = ctx;

  const heroEl = canvas.closest(".hero");
  const clock = new THREE.Clock();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const cursorWorld = new THREE.Vector3(9999, 9999, 0);
  const baseCamZ = camera.position.z;
  let scrollProgress = 0;
  let rafId = 0;
  let running = false;
  let lastTime = 0;
  let intro = 0; // 0..1 landing ease

  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const cursorActive = !isCoarse;
  const cursorStrength = 0.7;

  function updateCursorWorld() {
    const dist = camera.position.z;
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * dist;
    const halfW = halfH * camera.aspect;
    cursorWorld.set(pointer.x * halfW, -pointer.y * halfH, 0);
  }

  function renderFrame() {
    const t = clock.getElapsedTime();
    const dt = Math.min(0.05, t - lastTime);
    lastTime = t;

    // Landing ease: scene settles in over ~1.6s (camera pulls to rest).
    intro = Math.min(1, intro + dt / 1.6);
    const introEase = 1 - Math.pow(1 - intro, 3);

    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    if (cursorActive) updateCursorWorld();

    strandMaterials.forEach(function (m) {
      m.uniforms.uTime.value = t;
      m.uniforms.uCursor.value.copy(cursorWorld);
      m.uniforms.uCursorStrength.value = cursorActive ? cursorStrength * introEase : 0.0;
    });
    strandGroup.rotation.y = pointer.x * 0.08;
    strandGroup.rotation.x = pointer.y * 0.05;
    strandGroup.position.y = Math.sin(t * 0.18) * 0.14;

    layers.forEach(function (l) {
      const m = l.material;
      m.uniforms.uTime.value = t;
      m.uniforms.uCursor.value.copy(cursorWorld);
      l.points.position.x = pointer.x * l.parallax * 6;
      l.points.position.y = -pointer.y * l.parallax * 4;
      l.points.rotation.y = t * l.parallax * 0.12;
    });

    // Camera: pointer parallax + gentle bob + scroll dolly + landing pull-in.
    const introOffset = (1 - introEase) * 1.4;
    camera.position.x = pointer.x * 0.32;
    camera.position.y = -pointer.y * 0.2 + Math.sin(t * 0.13) * 0.07;
    camera.position.z = baseCamZ + introOffset - scrollProgress * 2.2 + Math.sin(t * 0.09) * 0.1;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function loop() {
    renderFrame();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || prefersReduced) return;
    running = true;
    clock.start();
    lastTime = clock.getElapsedTime();
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    clock.stop();
  }

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    if (prefersReduced) renderFrame();
  }

  function updateScroll() {
    if (!heroEl) return;
    const rect = heroEl.getBoundingClientRect();
    const denom = Math.max(1, rect.height * 0.85);
    scrollProgress = Math.min(1, Math.max(0, -rect.top / denom));
  }

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", updateScroll, { passive: true });
  resize();
  updateScroll();

  if (prefersReduced) {
    strandMaterials.forEach(function (m) { m.uniforms.uTime.value = 7.3; });
    layers.forEach(function (l) { l.material.uniforms.uTime.value = 7.3; });
    intro = 1;
    renderer.render(scene, camera);
    revealCanvas();
    return;
  }

  if (cursorActive) {
    window.addEventListener("pointermove", function (e) {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  // Fade the canvas in once the first frame is on screen (landing).
  requestAnimationFrame(revealCanvas);

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !document.hidden) start();
        else stop();
      });
    }, { threshold: 0.02 });
    io.observe(canvas);
  } else {
    start();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (canvas.getBoundingClientRect().bottom > 0) start();
  });
}

if ("requestIdleCallback" in window) {
  requestIdleCallback(init, { timeout: 900 });
} else {
  setTimeout(init, 250);
}
