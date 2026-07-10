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

const STRAND_COLORS = [0x6bf0c2, 0xffb25e, 0x9d8cff];

const strandVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const strandFragment = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uSpeed;
  uniform float uOffset;
  uniform float uBase;

  float packet(float x, float center, float width) {
    float d = abs(x - center);
    d = min(d, 1.0 - d);
    return exp(-(d * d) / (width * width));
  }

  void main() {
    float t = fract(uTime * uSpeed + uOffset);
    float p1 = packet(vUv.x, t, 0.016) * 2.2;
    float p2 = packet(vUv.x, fract(t + 0.42), 0.05) * 0.55;
    float rim = smoothstep(1.0, 0.15, abs(vUv.y - 0.5) * 2.0);
    float i = (uBase + p1 + p2) * rim;
    vec3 col = uColor * i + vec3(1.0) * p1 * 0.28 * rim;
    gl_FragColor = vec4(col, clamp(i, 0.0, 1.0));
  }
`;

function makeCurve(index, total, spread) {
  const pts = [];
  const yBase = THREE.MathUtils.lerp(-2.4, 2.6, total <= 1 ? 0.5 : index / (total - 1));
  const segs = 6;
  for (let s = 0; s <= segs; s += 1) {
    const x = THREE.MathUtils.lerp(-spread, spread, s / segs);
    const y = yBase + Math.sin(s * 1.7 + index * 2.3) * 0.85 + (Math.random() - 0.5) * 0.5;
    const z = Math.cos(s * 1.3 + index * 1.9) * 1.4 - 0.6;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function buildScene() {
  const isSmall = window.innerWidth < 760;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmall, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0714, 0.045);

  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 60);
  camera.position.set(0, 0, 6.2);

  const strandGroup = new THREE.Group();
  const materials = [];
  const strandCount = isSmall ? 5 : 8;
  const spread = isSmall ? 7 : 10;

  for (let i = 0; i < strandCount; i += 1) {
    const curve = makeCurve(i, strandCount, spread);
    const geometry = new THREE.TubeGeometry(curve, isSmall ? 120 : 220, 0.018, isSmall ? 5 : 7, false);
    const material = new THREE.ShaderMaterial({
      vertexShader: strandVertex,
      fragmentShader: strandFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(STRAND_COLORS[i % STRAND_COLORS.length]) },
        uSpeed: { value: 0.05 + Math.random() * 0.06 },
        uOffset: { value: Math.random() },
        uBase: { value: 0.12 + Math.random() * 0.08 }
      }
    });
    materials.push(material);
    strandGroup.add(new THREE.Mesh(geometry, material));

    const haloGeometry = new THREE.TubeGeometry(curve, isSmall ? 60 : 110, 0.085, isSmall ? 4 : 6, false);
    const haloMaterial = new THREE.ShaderMaterial({
      vertexShader: strandVertex,
      fragmentShader: strandFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(STRAND_COLORS[i % STRAND_COLORS.length]) },
        uSpeed: { value: material.uniforms.uSpeed.value },
        uOffset: { value: material.uniforms.uOffset.value },
        uBase: { value: 0.015 }
      }
    });
    materials.push(haloMaterial);
    strandGroup.add(new THREE.Mesh(haloGeometry, haloMaterial));
  }
  scene.add(strandGroup);

  const dustCount = isSmall ? 260 : 800;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 22;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    color: 0x9d8cff,
    size: 0.028,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  return { renderer, scene, camera, strandGroup, dust, materials };
}

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

  const { renderer, scene, camera, strandGroup, dust, materials } = ctx;
  const clock = new THREE.Clock();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let rafId = 0;
  let running = false;

  function renderFrame() {
    const t = clock.getElapsedTime();
    materials.forEach(function (m) {
      m.uniforms.uTime.value = t;
    });
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    strandGroup.rotation.y = pointer.x * 0.08;
    strandGroup.rotation.x = pointer.y * 0.05;
    strandGroup.position.y = Math.sin(t * 0.18) * 0.14;
    dust.rotation.y = t * 0.012;
    camera.position.x = pointer.x * 0.35;
    camera.position.y = -pointer.y * 0.22;
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

  window.addEventListener("resize", resize);
  resize();

  if (prefersReduced) {
    materials.forEach(function (m) {
      m.uniforms.uTime.value = 7.3;
    });
    renderer.render(scene, camera);
    return;
  }

  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  if (!isCoarse) {
    window.addEventListener("pointermove", function (e) {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

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
