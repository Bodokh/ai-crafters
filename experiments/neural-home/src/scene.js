import * as THREE from 'three';

const clamp = (n, low, high) => Math.min(high, Math.max(low, n));
const smooth = (n) => { const t = clamp(n, 0, 1); return t * t * (3 - 2 * t); };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// All visual variation is seeded: reverse scrolling retraces the same network.
function randomSource() {
  let seed = 48172;
  return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
}

function taperedFiber(points, radius, segments = 36) {
  const curve = new THREE.CatmullRomCurve3(points);
  const radialSegments = 10;
  const geometry = new THREE.TubeGeometry(curve, segments, 1, radialSegments, false);
  const positions = geometry.attributes.position;
  const center = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    curve.getPointAt(t, center);
    const width = radius * (0.07 + 0.93 * Math.exp(-t * 5.5));
    for (let j = 0; j <= radialSegments; j++) {
      const index = i * (radialSegments + 1) + j;
      positions.setXYZ(index,
        center.x + (positions.getX(index) - center.x) * width,
        center.y + (positions.getY(index) - center.y) * width,
        center.z + (positions.getZ(index) - center.z) * width);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

// Match Three's open TubeGeometry buffers, yielding between the larger route's
// rings. Small dendrites still use TubeGeometry directly inside bounded batches.
async function routeTube(path, segments, radius, radialSegments, checkpoint) {
  await checkpoint(true);
  const frames = path.computeFrenetFrames(segments, false);
  await checkpoint(true);
  const count = (segments + 1) * (radialSegments + 1);
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const indices = new (count > 65535 ? Uint32Array : Uint16Array)(segments * radialSegments * 6);
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();
  let index = 0;
  for (let i = 0; i <= segments; i++) {
    path.getPointAt(i / segments, point);
    const n = frames.normals[i], b = frames.binormals[i];
    for (let j = 0; j <= radialSegments; j++) {
      const angle = j / radialSegments * Math.PI * 2;
      const sin = Math.sin(angle), cos = -Math.cos(angle);
      normal.set(cos * n.x + sin * b.x, cos * n.y + sin * b.y, cos * n.z + sin * b.z).normalize();
      const vertex = i * (radialSegments + 1) + j;
      normals.set([normal.x, normal.y, normal.z], vertex * 3);
      positions.set([point.x + radius * normal.x, point.y + radius * normal.y, point.z + radius * normal.z], vertex * 3);
      uvs.set([i / segments, j / radialSegments], vertex * 2);
      if (i > 0 && j > 0) {
        const a = (radialSegments + 1) * (i - 1) + (j - 1);
        const next = (radialSegments + 1) * i + (j - 1);
        const c = (radialSegments + 1) * i + j;
        const d = (radialSegments + 1) * (i - 1) + j;
        indices.set([a, next, d, next, c, d], index);
        index += 6;
      }
    }
    await checkpoint();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

async function prepareBounds(geometry, checkpoint) {
  const positions = geometry.attributes.position;
  const box = new THREE.Box3();
  const point = new THREE.Vector3();
  for (let i = 0; i < positions.count; i++) {
    box.expandByPoint(point.fromBufferAttribute(positions, i));
    if (i % 512 === 0) await checkpoint();
  }
  const sphere = new THREE.Sphere();
  box.getCenter(sphere.center);
  let radiusSquared = 0;
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i);
    radiusSquared = Math.max(radiusSquared, sphere.center.distanceToSquared(point));
    if (i % 512 === 0) await checkpoint();
  }
  sphere.radius = Math.sqrt(radiusSquared);
  geometry.boundingBox = box;
  geometry.boundingSphere = sphere;
}

const tissueVertex = `
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const tissueFragment = `
  uniform vec3 tint;
  uniform float strength;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 eye = cameraPosition-vWorld;
    vec3 view = normalize(eye);
    float facing = abs(dot(normal,view));
    float edge = 1.0-facing;
    float rim = edge*edge*edge;
    // A broad cool key and violet fill give the tissue a readable, translucent
    // volume. Analytical studio reflections replace sixteen 3D-noise hashes.
    vec3 reflected = reflect(-view,normal);
    float key = max(0.0,dot(normal,vec3(-0.298,0.596,0.745)));
    float fill = max(0.0,dot(normal,vec3(0.842,-0.421,0.337)));
    float softbox = max(0.0,dot(reflected,vec3(-0.349,0.698,0.628)));
    float softbox2 = softbox*softbox;
    float sheen = softbox2*softbox2;
    float glint = sheen*sheen*sheen;
    float violet = max(0.0,dot(reflected,vec3(0.873,0.218,-0.436)));
    violet *= violet;
    violet *= violet;
    // Low-contrast, spatially stable striations retain organic detail without
    // animated noise or the sparkling cells of the previous procedural web.
    float grain = sin(dot(vWorld,vec3(17.0,23.0,13.0)))*.5+.5;
    vec3 color = tint*(.021+key*.115+fill*.035+rim*.48+grain*.009)
      + vec3(.34,.67,.88)*sheen*.14
      + vec3(.72,.91,1.0)*glint*.34
      + vec3(.36,.22,.62)*violet*edge*.15
      + vec3(.10,.48,.60)*rim*key*.18;
    float fog = exp(-max(0.0,length(eye)-6.0)*0.047);
    gl_FragColor = vec4(mix(vec3(0.027,0.071,0.122),color*strength,fog),1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Scroll-driven camera journey with a capped, independently paused ambient layer. */
export async function createNeuralScene({ canvas, cardSides, signal, initiallyPaused = false, onReady = () => {}, onError = () => {} }) {
  let renderer;
  let frame = 0;
  let ambientTimer = 0;
  let ambientTime = 0;
  let disposed = false;
  let failed = false;
  let paused = initiallyPaused;
  let assembled = false;
  let ready = false;
  let lastTime = 0;
  let renderCount = 0;
  let mobile = false;
  let stillNeedsRedraw = false;
  const resources = new Set();
  const own = (resource) => { resources.add(resource); return resource; };
  const state = { progress: 0, activity: 0 };
  const target = { ...state };
  const timeUniform = { value: 0 };
  const energyUniform = { value: 0 };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.08, 100);
  const rand = randomSource();
  const primaryParts = [];
  const distantParts = [];
  const lateralStops = [.2,2.2,-2,4,3,-3,-4,3,3.8,-2.8,-4,2.5,4,-2,3,4,-2.7,-3,2];
  const stationCount = lateralStops.length;
  if (cardSides.length !== stationCount) throw new Error('The scene route must match the story checkpoints.');
  const cardSide = i => cardSides[i];
  const cameraStations = Array.from({length:stationCount},(_,i) => {
    const x = lateralStops[i];
    const z = i===0 ? 10 : i===1 ? 7 : -(i-2)*6.5;
    return V(x,i===0 ? .9 : .9+Math.sin(i*1.17)*.9,z);
  });
  const cameraRoute = new THREE.CatmullRomCurve3(cameraStations);
  const primaryCenters = cameraStations.map((position,i) => i===0 ? V(2.8,.65,0) :
    V(position.x+(cardSide(i)==='left' ? 2.05 : -2.05),position.y-.15,position.z-7.5));
  let signalStations;
  let ambientPositions;
  const ambientEdges = [];
  const ambientPoint = new THREE.Vector3();

  let batchStarted = performance.now();
  async function checkpoint(force = false) {
    if (disposed || signal?.aborted) throw new DOMException('Neural scene loading was cancelled.', 'AbortError');
    if (failed) throw new Error('The neural scene stopped loading.');
    if (!force && performance.now() - batchStarted < 4) return;
    // scheduler.yield gives input and rendering a turn without the nested timer
    // delay on supporting browsers. The fallback also releases the main thread.
    if (globalThis.scheduler?.yield) await globalThis.scheduler.yield();
    else await new Promise(resolve => setTimeout(resolve, 0));
    batchStarted = performance.now();
    if (disposed || signal?.aborted) throw new DOMException('Neural scene loading was cancelled.', 'AbortError');
    if (failed) throw new Error('The neural scene stopped loading.');
  }

  function fail(error) {
    if (disposed || failed) return;
    failed = true;
    cancelAnimationFrame(frame);
    clearTimeout(ambientTimer);
    frame = 0;
    onError(error);
  }
  function contextLost(event) { event.preventDefault(); fail(new Error('The neural scene WebGL context was lost.')); }

  async function neuron(center, scale, parts, phase) {
    const soma = new THREE.SphereGeometry(1, 32, 18);
    const positions = soma.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      const angle = Math.atan2(y, x);
      const lobes = 1 + 0.08 * Math.cos(angle * 5 + phase) * (1-z*z);
      const irregular = 1 + 0.07 * Math.sin(angle * 3 + z * 5);
      positions.setXYZ(i, center.x + x*0.48*scale*lobes*irregular,
        center.y + y*0.60*scale*lobes, center.z + z*0.25*scale);
    }
    soma.computeVertexNormals();
    parts.push(soma);
    await checkpoint();
    for (let branch = 0; branch < 8; branch++) {
      const a = branch / 8 * Math.PI * 2 + phase * 0.07 + (rand()-.5)*.43;
      const direction = V(Math.cos(a), Math.sin(a), (rand()-.5)*.65);
      const length = (3.3+rand()*3.5)*scale;
      const tangent = V(-Math.sin(a), Math.cos(a), 0);
      const start = center.clone().addScaledVector(direction, .30*scale);
      const base = center.clone().addScaledVector(direction, .72*scale);
      const middle = center.clone().addScaledVector(direction, length*.5).addScaledVector(tangent,(rand()-.5)*1.7*scale);
      const end = center.clone().addScaledVector(direction, length).addScaledVector(tangent,(rand()-.5)*2*scale);
      parts.push(taperedFiber([start,base,middle,end], (.16+rand()*.035)*scale,28));
      await checkpoint();
      for (let fork = 0; fork < 2; fork++) {
        const joint = fork ? middle.clone().lerp(end,.30) : base.clone().lerp(middle,.65);
        const tip = joint.clone().addScaledVector(direction,length*.34).addScaledVector(tangent,(fork ? -1 : 1)*scale*(.9+rand()));
        tip.z += (rand()-.5)*2*scale;
        parts.push(taperedFiber([joint,joint.clone().lerp(tip,.48).addScaledVector(direction,.3*scale),tip],.032*scale,14));
        await checkpoint();
      }
    }
  }

  async function addMerged(parts, strength, tint) {
    const material = own(new THREE.ShaderMaterial({ vertexShader: tissueVertex, fragmentShader: tissueFragment,
      uniforms: { tint: { value: new THREE.Color(tint) }, strength: { value: strength } } }));
    // Keep complete source surfaces in short route slabs. Attachment depth is
    // enough to choose a slab; bounds below include every vertex, even when a
    // long framing fiber crosses several slabs. No geometry or RNG changes.
    const chunks = new Map();
    for (const part of parts) {
      const slab = Math.floor(part.attributes.position.getZ(0) / 16);
      if (!chunks.has(slab)) chunks.set(slab, []);
      chunks.get(slab).push(part);
    }
    for (const [slab, chunk] of chunks) {
      // Copy matching indexed position/normal/uv buffers a source part at a time
      // so preparation continues yielding within the existing startup budget.
      const vertexCount = chunk.reduce((count, part) => count + part.attributes.position.count, 0);
      const indexCount = chunk.reduce((count, part) => count + part.index.count, 0);
      const geometry = own(new THREE.BufferGeometry());
      const indices = new (vertexCount > 65535 ? Uint32Array : Uint16Array)(indexCount);
      for (const [name, size] of [['position', 3], ['normal', 3], ['uv', 2]]) {
        const values = new Float32Array(vertexCount * size);
        let offset = 0;
        for (const part of chunk) {
          values.set(part.attributes[name].array, offset);
          offset += part.attributes[name].array.length;
          await checkpoint();
        }
        geometry.setAttribute(name, new THREE.BufferAttribute(values, size));
      }
      let indexOffset = 0, vertexOffset = 0;
      for (const part of chunk) {
        const source = part.index.array;
        for (let i = 0; i < source.length; i++) indices[indexOffset + i] = source[i] + vertexOffset;
        indexOffset += source.length;
        vertexOffset += part.attributes.position.count;
        await checkpoint();
      }
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      await prepareBounds(geometry, checkpoint);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `neural-tissue-${strength === 1 ? 'primary' : 'distant'}-${slab}`;
      scene.add(mesh);
    }
    // The source arrays retain ownership until every chunk succeeds so aborts
    // at any checkpoint still release both partial chunks and unmerged parts.
    for (const part of parts) part.dispose();
    parts.length = 0;
  }

  let signalCurve, signalLengths, signalMaterial, pulse, pulseHalo;
  const signalPoint = new THREE.Vector3();
  const lookPoint = new THREE.Vector3();

  function pose() {
    timeUniform.value = ambientTime;
    energyUniform.value = state.activity;
    // Main owns the reading hold and easing; use its entire transit for movement.
    const stationFloat = state.progress*(stationCount-1);
    const from = Math.min(stationCount-2,Math.floor(stationFloat));
    const to = from+1;
    const mix = clamp(stationFloat-from,0,1);
    const journey = from+mix;
    cameraRoute.getPoint(journey/(stationCount-1),camera.position);
    const hubX = THREE.MathUtils.lerp(primaryCenters[from].x,primaryCenters[to].x,mix);
    const hubY = THREE.MathUtils.lerp(primaryCenters[from].y,primaryCenters[to].y,mix);
    if (mobile) {
      camera.position.x = hubX-.65;
      camera.position.y = hubY+1.4;
    }
    const turn = Math.sin(mix*Math.PI)*(cameraStations[to].x-cameraStations[from].x)*.14;
    lookPoint.set(camera.position.x+turn,mobile ? hubY-1.4 : camera.position.y-.4+Math.sin(journey*.9)*.10,camera.position.z-12);
    camera.lookAt(lookPoint);
    camera.rotateZ(clamp(Math.sin(journey*1.27)*.009+Math.sin(mix*Math.PI)*turn*.012,-.025,.025));
    canvas.dataset.station = String(Math.round(journey));
    canvas.dataset.cardSide = cardSide(Math.round(journey));
    const signalT = THREE.MathUtils.lerp(signalStations[from],signalStations[to],mix);
    // Tube UVs are arc-length based; the path's checkpoint parameters are not.
    const arcIndex = signalT * (signalLengths.length - 1);
    const lower = Math.floor(arcIndex);
    const upper = Math.min(signalLengths.length - 1, lower + 1);
    signalMaterial.uniforms.head.value = THREE.MathUtils.lerp(signalLengths[lower], signalLengths[upper], arcIndex-lower) / signalLengths.at(-1);
    signalCurve.getPoint(signalT, signalPoint);
    pulse.position.copy(signalPoint);
    pulseHalo.position.copy(signalPoint);
    const breathing = 1 + Math.sin(ambientTime*.95)*.12 + state.activity*.14;
    pulse.scale.setScalar(breathing);
    for (let i=0;i<ambientEdges.length;i++) {
      const edge = ambientEdges[i];
      const t = (ambientTime*.055+i*.173)%1;
      ambientPoint.lerpVectors(edge[0],edge[1],t);
      ambientPositions.setXYZ(i,ambientPoint.x,ambientPoint.y,ambientPoint.z);
    }
    ambientPositions.needsUpdate = true;
  }

  function tick(now) {
    frame = 0;
    if (!assembled || disposed || failed || paused || document.hidden) return;
    const rawFrameMs = lastTime ? now-lastTime : 16;
    const elapsed = Math.min(rawFrameMs,64);
    lastTime = now;
    ambientTime += elapsed/1000;
    target.activity *= Math.exp(-elapsed/600);
    const blend = 1 - Math.exp(-elapsed/88);
    let moving = false;
    for (const key of ['progress','activity']) {
      const delta = target[key]-state[key];
      if (Math.abs(delta) > .00015) { state[key] += delta*blend; if (key==='progress') moving = true; }
      else state[key] = target[key];
    }
    try {
      pose();
      renderer.render(scene,camera);
      stillNeedsRedraw = false;
      canvas.dataset.renderCount = String(++renderCount);
      canvas.dataset.drawCalls = String(renderer.info.render.calls);
      canvas.dataset.triangles = String(renderer.info.render.triangles);
      canvas.dataset.frameMs = elapsed.toFixed(2);
      canvas.dataset.rawFrameMs = rawFrameMs.toFixed(2);
      canvas.dataset.journeyProgress = state.progress.toFixed(4);
      canvas.dataset.renderMode = moving ? 'travel' : 'ambient';
      if (!ready) { ready = true; onReady(); }
    } catch (error) { fail(error); return; }
    if (moving) invalidate();
    else if (!paused && !disposed && !failed && !document.hidden) {
      // Timer + one rAF keeps quiet reading views near 20 fps without a 60 fps loop.
      ambientTimer = window.setTimeout(() => { ambientTimer=0; invalidate(); },45);
    }
  }

  function invalidate() {
    clearTimeout(ambientTimer);
    ambientTimer = 0;
    if (assembled && !frame && !disposed && !failed && !paused && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function resize() {
    if (disposed || failed || !renderer) return;
    const parent = canvas.parentElement;
    const width = Math.max(1,parent?.clientWidth || canvas.clientWidth || 1);
    const height = Math.max(1,parent?.clientHeight || canvas.clientHeight || 1);
    mobile = width < 720;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,mobile ? 1.25 : 1.5));
    renderer.setSize(width,height,false);
    stillNeedsRedraw = true;
    camera.aspect = width/height;
    camera.fov = mobile ? 65 : 48;
    camera.updateProjectionMatrix();
    if (paused) redrawPausedStill();
    else invalidate();
  }
  function redrawPausedStill() {
    if (!paused || !ready || !stillNeedsRedraw || disposed || failed || document.hidden) return;
    const bounds = canvas.getBoundingClientRect();
    if (bounds.bottom<=0 || bounds.right<=0 || bounds.top>=window.innerHeight || bounds.left>=window.innerWidth) return;
    try {
      // setSize clears the drawing buffer. Restore the frozen pose without
      // advancing interpolation, ambient time, or scheduling another frame.
      pose();
      renderer.render(scene,camera);
      stillNeedsRedraw = false;
      canvas.dataset.renderCount = String(++renderCount);
      canvas.dataset.drawCalls = String(renderer.info.render.calls);
      canvas.dataset.triangles = String(renderer.info.render.triangles);
      canvas.dataset.renderMode = 'paused';
    } catch (error) { fail(error); }
  }
  function visibility() {
    if (document.hidden) { cancelAnimationFrame(frame); clearTimeout(ambientTimer); ambientTimer=0; frame = 0; lastTime = 0; }
    else if (paused) redrawPausedStill();
    else invalidate();
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    clearTimeout(ambientTimer);
    canvas.removeEventListener('webglcontextlost',contextLost);
    document.removeEventListener('visibilitychange',visibility);
    signal?.removeEventListener('abort',dispose);
    for (const part of [...primaryParts,...distantParts]) part.dispose();
    primaryParts.length = 0;
    distantParts.length = 0;
    for (const resource of resources) resource.dispose();
    resources.clear();
    renderer?.dispose();
    scene.clear();
  }

  try {
    signal?.addEventListener('abort',dispose, { once: true });
    await checkpoint(true);
    renderer = new THREE.WebGLRenderer({ canvas,alpha:true,antialias:true,powerPreference:'high-performance' });
    renderer.setClearColor(0x07121f,0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    canvas.addEventListener('webglcontextlost',contextLost);
    document.addEventListener('visibilitychange',visibility);

    for (const [i, center] of primaryCenters.entries()) {
      await neuron(center,i===0 ? 1.08 : .80+Math.sin(i)*.08,primaryParts,i*2.4);
    }
    await addMerged(primaryParts,1.0,'#91c5e9');
    // Peripheral neurons leave the left reading column comparatively quiet.
    const farCenters = Array.from({length:14},(_,i) => V(i%2 ? 7+rand()*3 : -4-rand()*4,(rand()-.5)*11,-5-i*10));
    for (const [i, center] of farCenters.entries()) await neuron(center,.55+rand()*.55,distantParts,i);
    // Broad, near fibers frame the environment without becoming a flat overlay.
    distantParts.push(taperedFiber([V(-13,-5,6),V(-6,-4,5),V(1,-5,2),V(8,-4,-7)],.36,64));
    await checkpoint();
    distantParts.push(taperedFiber([V(9,10,5),V(7,5,3),V(8,0,-4),V(5,-5,-12)],.31,64));
    await checkpoint();
    for (let i=3;i<stationCount;i+=3) {
      const p=cameraStations[i];
      const sign=cardSide(i)==='left' ? 1 : -1;
      distantParts.push(taperedFiber([V(p.x+sign*6,p.y+5,p.z+3),V(p.x+sign*4,p.y+2,p.z),V(p.x+sign*5,p.y-3,p.z-5),V(p.x+sign*7,p.y-5,p.z-10)],.23,48));
      await checkpoint();
    }
    await addMerged(distantParts,.66,'#8d84b8');

    // Thin, distant links and tiny nodes form a quiet star-like neural field.
    const stars = Array.from({length:280},() => V((rand()-.5)*38,(rand()-.5)*23,5-rand()*160));
    const starCoordinates = new Float32Array(stars.length*3);
    stars.forEach((star,i) => star.toArray(starCoordinates,i*3));
    const starGeometry = own(new THREE.BufferGeometry());
    starGeometry.setAttribute('position',new THREE.BufferAttribute(starCoordinates,3));
    const starMaterial = own(new THREE.PointsMaterial({color:0xb3a3dc,size:.065,sizeAttenuation:true,transparent:true,opacity:.40,depthWrite:false}));
    scene.add(new THREE.Points(starGeometry,starMaterial));
    const links = [];
    const allEdges = [];
    for (let i=0;i<stars.length;i++) {
      let connected=0;
      for (let j=i+1;j<stars.length && connected<3;j++) {
        const distance=stars[i].distanceTo(stars[j]);
        if (distance>2 && distance<9) {
          links.push(...stars[i].toArray(),...stars[j].toArray());
          allEdges.push([stars[i],stars[j]]);
          connected++;
        }
      }
      await checkpoint();
    }
    const linksGeometry = own(new THREE.BufferGeometry());
    linksGeometry.setAttribute('position',new THREE.Float32BufferAttribute(links,3));
    scene.add(new THREE.LineSegments(linksGeometry,own(new THREE.LineBasicMaterial({color:0x8879af,transparent:true,opacity:.10,depthWrite:false}))));
    for (let i=0;i<Math.min(18,allEdges.length);i++) ambientEdges.push(allEdges[Math.floor(i*allEdges.length/18)]);
    const ambientGeometry = own(new THREE.BufferGeometry());
    ambientPositions = new THREE.BufferAttribute(new Float32Array(ambientEdges.length*3),3);
    ambientPositions.setUsage(THREE.DynamicDrawUsage);
    ambientGeometry.setAttribute('position',ambientPositions);
    const ambientSignals = new THREE.Points(ambientGeometry,own(new THREE.PointsMaterial({color:0x80d9f3,size:.095,transparent:true,opacity:.60,depthWrite:false})));
    ambientSignals.frustumCulled=false;
    scene.add(ambientSignals);

    const route = [V(1.5,-.8,1),V(2.0,-.4,.65),primaryCenters[0]];
    for (let i=1;i<primaryCenters.length;i++) {
      const a=primaryCenters[i-1],b=primaryCenters[i];
      route.push(a.clone().lerp(b,.34).add(V(Math.sin(i)*.8,-.9,.2)),a.clone().lerp(b,.72).add(V(-Math.sin(i)*.5,-.65,.1)),b);
    }
    signalStations = primaryCenters.map((_,i) => i===0 ? .001 : (2+i*3)/(route.length-1));
    signalCurve = new THREE.CatmullRomCurve3(route);
    signalCurve.arcLengthDivisions = 2600;
    signalLengths = signalCurve.getLengths();
    const signalGeometry = own(await routeTube(signalCurve,1300,.022,10,checkpoint));
    await prepareBounds(signalGeometry, checkpoint);
    signalMaterial = own(new THREE.ShaderMaterial({
      uniforms: { head: { value: .03 }, time: timeUniform, energy: energyUniform },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `uniform float head; uniform float time; uniform float energy; varying vec2 vUv;
        void main(){float lit=1.0-smoothstep(head-.005,head+.005,vUv.x);
          float pulse=exp(-pow((vUv.x-head)*120.0,2.0));
          float band=exp(-pow((fract(vUv.x*18.0-time*.30)-.5)*13.0,2.0));
          float breath=.88+.12*sin(time*.95);
          float nearHead=exp(-abs(vUv.x-head)*18.0);
          vec3 color=mix(vec3(.07,.25,.36),vec3(.08,.85,1.45),lit)
            +vec3(.6,.96,1.0)*pulse*(2.5+.6*breath+energy*.8)
            +vec3(.14,.85,1.05)*band*(.45+energy*.8)*(.24+lit*.48+nearHead*.7);
          gl_FragColor=vec4(color,1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    scene.add(new THREE.Mesh(signalGeometry,signalMaterial));
    pulse = new THREE.Mesh(own(new THREE.SphereGeometry(.075,16,12)),own(new THREE.MeshBasicMaterial({color:0xddfaff,toneMapped:false,depthTest:false,depthWrite:false})));
    pulse.renderOrder = 10;
    scene.add(pulse);
    // Procedural billboard glow, with no image texture or post-processing pass.
    const glowMaterial = own(new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,
      uniforms:{time:timeUniform,energy:energyUniform,tint:{value:new THREE.Vector3(.19,.82,1.)}},
      vertexShader:`uniform float time;uniform float energy;varying vec2 vUv;varying float vPhase;
        void main(){vUv=uv;vPhase=modelMatrix[3].z*.37;vec4 p=modelViewMatrix*vec4(0.,0.,0.,1.);
          p.xy+=position.xy*(1.0+.11*sin(time*.95+vPhase)+energy*.16);gl_Position=projectionMatrix*p;}`,
      fragmentShader:`uniform float time;uniform float energy;uniform vec3 tint;varying vec2 vUv;varying float vPhase;
        void main(){float r=length(vUv-.5)*2.;float a=exp(-r*r*7.0)*(1.-smoothstep(.65,1.,r));
          float breath=.82+.18*sin(time*.95+vPhase);
          gl_FragColor=vec4(tint,a*(breath+energy*.24));}`,
    }));
    const glowGeometry = own(new THREE.PlaneGeometry(.95,.95));
    pulseHalo = new THREE.Mesh(glowGeometry,glowMaterial);
    pulseHalo.renderOrder = 11;
    pulseHalo.frustumCulled = false;
    scene.add(pulseHalo);
    const violetGlowMaterial = own(glowMaterial.clone());
    violetGlowMaterial.uniforms = {time:timeUniform,energy:energyUniform,tint:{value:new THREE.Vector3(.655,.545,.98)}};
    for (const [index, center] of primaryCenters.entries()) {
      const glow = new THREE.Mesh(glowGeometry,index % 4 === 2 ? violetGlowMaterial : glowMaterial);
      glow.position.copy(center).add(V(-.22,.12,.38));
      scene.add(glow);
    }
    // Start each shader program before the first visible frame. Keeping these
    // batches separate allows parallel GPU compilation without a background
    // polling loop that could outlive an aborted scene.
    const preparedMaterials = new Set();
    for (const object of scene.children) {
      if (!object.material || preparedMaterials.has(object.material)) continue;
      await checkpoint(true);
      renderer.compile(object, camera, scene);
      preparedMaterials.add(object.material);
    }
    await checkpoint(true);
    assembled = true;
    resize();
  } catch (error) {
    try {
      if (error?.name !== 'AbortError') fail(error);
    } finally { dispose(); }
    throw error;
  }

  return {
    setProgress(value) {
      if (!Number.isFinite(value)) return;
      const next = clamp(value,0,1);
      if (!ready) state.progress = next;
      if (next !== target.progress) { target.progress = next; invalidate(); }
    },
    // Retained for API compatibility; checkpoint reading views stay fixed.
    setPointer() {},
    setActivity(value) {
      if (!Number.isFinite(value)) return;
      const next=clamp(value,0,1);
      if (next!==target.activity) { target.activity=next; invalidate(); }
    },
    setPaused(value) {
      const next=Boolean(value);
      if (next===paused) return;
      paused=next;
      lastTime=0;
      if (paused) { cancelAnimationFrame(frame); clearTimeout(ambientTimer); ambientTimer=0; frame=0; }
      else invalidate();
    },
    resize,
    dispose,
  };
}
