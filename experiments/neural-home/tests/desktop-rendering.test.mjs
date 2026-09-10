import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import * as THREE from 'three';

const source = (await readFile(new URL('../src/scene.js', import.meta.url), 'utf8'))
  .replace(/^import[^\n]+;$/gm, '')
  .replace('export async function createNeuralScene', 'async function createNeuralScene');
const sides = Array.from({ length: 19 }, (_, index) => index % 3 ? 'left' : 'right');

// Use real Three geometry, route sampling, and frustum math. Only the GPU and
// browser boundaries are replaced, so the tests exercise the shipped renderer.
function harness({ onYield = () => {}, sceneSource = source } = {}) {
  const frames = new Map(), timers = new Map(), resources = [], renders = [];
  let handle = 0, cpuTime = 0, renderer;
  const document = new EventTarget();
  document.hidden = false;
  const canvas = new EventTarget();
  Object.assign(canvas, { dataset: {}, clientWidth: 1440, clientHeight: 900,
    getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 900, right: 1440 }) });
  const tracked = Base => class extends Base {
    constructor(...args) {
      super(...args);
      const record = { resource: this, disposed: 0, kind: Base.name };
      resources.push(record);
      this.addEventListener('dispose', () => record.disposed++);
    }
  };
  class Renderer {
    info = { render: { calls: 0, triangles: 0 } };
    disposed = 0;
    constructor() { renderer = this; }
    setClearColor() {}
    setPixelRatio(value) { this.dpr = value; }
    setSize() {}
    compile(_object, _camera, scene) { this.scene = scene; }
    render(scene, camera) {
      scene.updateMatrixWorld();
      camera.updateMatrixWorld();
      const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      const frustum = new THREE.Frustum().setFromProjectionMatrix(matrix);
      const visible = scene.children.filter(object => object.geometry && (!object.frustumCulled || frustum.intersectsObject(object)));
      this.info.render.calls = visible.length;
      this.info.render.triangles = visible.filter(object => object.isMesh)
        .reduce((sum, object) => sum + (object.geometry.index?.count || object.geometry.attributes.position.count) / 3, 0);
      renders.push({ camera: camera.clone(), visible, triangles: this.info.render.triangles });
    }
    dispose() { this.disposed++; }
  }
  const fakeThree = { ...THREE, WebGLRenderer: Renderer };
  for (const name of ['BufferGeometry', 'SphereGeometry', 'TubeGeometry', 'PlaneGeometry',
    'ShaderMaterial', 'PointsMaterial', 'LineBasicMaterial', 'MeshBasicMaterial']) fakeThree[name] = tracked(THREE[name]);
  const sandbox = { THREE: fakeThree, document, DOMException,
    performance: { now: () => cpuTime += .05 },
    scheduler: { yield: async () => onYield({ resources, renderer }) },
    requestAnimationFrame(callback) { const id = ++handle; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    setTimeout(callback) { const id = ++handle; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); },
  };
  sandbox.window = { devicePixelRatio: 2, innerWidth: 1440, innerHeight: 900, setTimeout: sandbox.setTimeout };
  vm.runInNewContext(`${sceneSource}\nglobalThis.createScene = createNeuralScene;`, sandbox);
  return { canvas, frames, timers, resources, renders,
    create: options => sandbox.createScene({ canvas, cardSides: sides, ...options }),
    get renderer() { return renderer; },
    frame(now) {
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(now);
    },
    timer() {
      const pending = [...timers.values()];
      timers.clear();
      for (const callback of pending) callback();
    },
  };
}

// Chunk ordering is deliberately independent of the original merge ordering.
// Hash all position triplets as a sorted multiset to protect the seeded network.
// Expected signatures were independently measured against baseline commit 29f9d3d.
function positionSignature(meshes) {
  const vertices = [];
  for (const mesh of meshes) {
    const attribute = mesh.geometry.attributes.position;
    const bytes = Buffer.from(attribute.array.buffer, attribute.array.byteOffset, attribute.array.byteLength);
    for (let offset = 0; offset < bytes.length; offset += 12) vertices.push(bytes.subarray(offset, offset + 12).toString('hex'));
  }
  return createHash('sha256').update(vertices.sort().join('')).digest('hex');
}

let loaded;
test.before(async () => {
  loaded = harness();
  loaded.controller = await loaded.create();
});
test.after(() => loaded?.controller?.dispose());

test('route chunks retain the complete seeded tissue and tight, conservative bounds', () => {
  const meshes = loaded.renderer.scene.children.filter(object => object.name.startsWith('neural-tissue-'));
  const primary = meshes.filter(object => object.name.includes('-primary-'));
  const distant = meshes.filter(object => object.name.includes('-distant-'));
  assert.ok(primary.length > 4 && distant.length > 4, 'tissue is independently culled along the journey');
  assert.equal(new Set(primary.map(mesh => mesh.material)).size, 1, 'primary chunks share their material');
  assert.equal(new Set(distant.map(mesh => mesh.material)).size, 1, 'distant chunks share their material');
  assert.equal(primary.reduce((count, mesh) => count + mesh.geometry.index.count / 3, 0), 190912);
  assert.equal(distant.reduce((count, mesh) => count + mesh.geometry.index.count / 3, 0), 148992);
  assert.equal(positionSignature(primary), 'caa1dd4fef528c6c852416751f21cc695fb0642d721a16655c50d43abea3c4f1');
  assert.equal(positionSignature(distant), 'e5b7ae6f602f45493a52da564d51fef3a407e4eb8f1983e42de4b3e5fce73cb8');
  const point = new THREE.Vector3();
  for (const mesh of meshes) {
    const { geometry } = mesh;
    assert.ok(geometry.boundingSphere && geometry.boundingBox);
    assert.ok(geometry.boundingBox.max.z - geometry.boundingBox.min.z < 40, 'chunk bounds must stay local along the route');
    assert.ok(geometry.index.array.constructor.name === 'Uint16Array', 'local chunks avoid wide indices');
    for (let index = 0; index < geometry.attributes.position.count; index++) {
      point.fromBufferAttribute(geometry.attributes.position, index);
      assert.ok(geometry.boundingBox.containsPoint(point));
      assert.ok(point.distanceTo(geometry.boundingSphere.center) <= geometry.boundingSphere.radius + 1e-6);
    }
    for (const index of geometry.index.array) assert.ok(index < geometry.attributes.position.count, 'indices stay inside their chunk');
  }
});

test('native frustum culling reduces submitted geometry at hero and along the unchanged route', () => {
  loaded.frame(16);
  assert.ok(loaded.renders.at(-1).triangles < 366288 * .85, `hero submits ${loaded.renders.at(-1).triangles} triangles`);
  loaded.controller.setProgress(1);
  for (let index = 1; index <= 130; index++) {
    if (!loaded.frames.size) loaded.timer();
    loaded.frame(16 + index * 16);
  }
  assert.equal(loaded.canvas.dataset.station, '18');
  assert.ok(loaded.renders.at(-1).triangles < 366288 * .35, `end submits ${loaded.renders.at(-1).triangles} triangles`);
  assert.equal(loaded.renderer.dpr, 1.5, 'desktop pixel ratio remains unchanged');
});

test('disposing a completed scene releases shared materials and every source/chunk exactly once', async () => {
  const testHarness = harness();
  const controller = await testHarness.create({ initiallyPaused: true });
  assert.equal(testHarness.frames.size, 0);
  controller.dispose();
  controller.dispose();
  assert.equal(testHarness.renderer.disposed, 1);
  assert.equal(testHarness.renderer.scene.children.length, 0);
  assert.ok(testHarness.resources.length > 800);
  assert.ok(testHarness.resources.every(record => record.disposed === 1), 'every owned GPU/source resource is released once');
  assert.equal(testHarness.frames.size, 0);
  assert.equal(testHarness.timers.size, 0);
});

test('cancellation during chunk merging releases partially assembled and remaining source geometry', async () => {
  const aborter = new AbortController();
  let abortedDuringMerge = false;
  const testHarness = harness({ onYield({ resources }) {
    const chunks = resources.filter(record => record.kind === 'BufferGeometry');
    if (chunks.length > 1 && chunks[0].resource.boundingSphere) {
      abortedDuringMerge = true;
      aborter.abort();
    }
  } });
  await assert.rejects(testHarness.create({ signal: aborter.signal }), { name: 'AbortError' });
  assert.ok(abortedDuringMerge);
  assert.ok(testHarness.resources.every(record => record.disposed === 1), 'aborts leave no partial chunks or source parts behind');
  assert.equal(testHarness.renderer.disposed, 1);
  assert.equal(testHarness.frames.size, 0);
});
