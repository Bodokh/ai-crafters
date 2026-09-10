import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { effect, init, storage, target } from 'vgpu/node';

const SIZE = 288;
const SCALE = 2;
const TAU = Math.PI * 2;
const output = new URL('../../experiments/neural-home/src/assets/neurons/', import.meta.url);
const shader = await readFile(new URL('./neuron.wgsl', import.meta.url), 'utf8');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function seededRandom(seed) {
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function branches(variant) {
  const random = seededRandom(87391 + variant * 173);
  const ends = [], shapes = [];
  function segment(a, b, radiusA, radiusB, opacity, brightness) {
    ends.push(a.x, a.y, b.x, b.y);
    shapes.push(radiusA, radiusB, opacity, brightness);
  }
  function fork(start, angle, length, bend, radius, opacity) {
    let previous = start;
    for (let step = 1; step <= 10; step++) {
      const t = step / 10;
      const direction = angle + bend * t;
      const next = { x: start.x + Math.cos(direction) * length * t,
        y: start.y + Math.sin(direction) * length * t };
      segment(previous, next, radius * (1 - (step - 1) / 10) ** 1.2 + .15,
        radius * (1 - t) ** 1.2 + .15, opacity * (1 - t * .22), .85);
      previous = next;
    }
  }
  for (let branch = 0; branch < 9; branch++) {
    const angle = branch / 9 * TAU + (random() - .5) * .35;
    const length = 90 + random() * 46;
    const bend = (random() - .5) * .62;
    let previous = { x: Math.cos(angle) * 10, y: Math.sin(angle) * 10 };
    for (let step = 1; step <= 24; step++) {
      const t = step / 24;
      const direction = angle + bend * t + Math.sin(t * 9 + branch) * .015;
      const next = { x: Math.cos(direction) * length * t,
        y: Math.sin(direction) * length * t };
      segment(previous, next, 5.2 * (1 - (step - 1) / 24) ** 2 + .23,
        5.2 * (1 - t) ** 2 + .23, .74 - t * .36, 1.0);
      if (step === 12 || step === 16) {
        const side = step === 12 ? 1 : -1;
        fork(next, direction + side * (.4 + random() * .35), 21 + random() * 28,
          side * .2, 1.1 - t * .65, .44);
      }
      previous = next;
    }
  }
  return { branchEnds: new Float32Array(ends), branchShape: new Float32Array(shapes), count: ends.length / 4 };
}

await mkdir(output, { recursive: true });
const gpu = await init({ adapter: 'hardware' });
const manifest = {
  generator: 'tools/neural-bake/bake.mjs',
  vgpu: '0.4.1',
  adapter: gpu.adapter,
  shaderSha256: hash(shader),
  size: SIZE,
  supersampling: SCALE,
  frames: [],
};

try {
  for (let variant = 0; variant < 4; variant++) {
    const data = branches(variant);
    const ends = storage(gpu, data.branchEnds.byteLength, 'read');
    const shapes = storage(gpu, data.branchShape.byteLength, 'read');
    ends.write(data.branchEnds);
    shapes.write(data.branchShape);
    const image = target(gpu, { label: `neuron-${variant}.target`, size: [SIZE * SCALE, SIZE * SCALE], format: 'rgba8unorm' });
    try {
      const render = effect(gpu, shader, { label: `neuron-${variant}.bake`, set: {
        params: { variant, count: data.count, size: SIZE, padding: 0 },
        branchEnds: ends,
        branchShape: shapes,
      } });
      render.draw(image);
      await gpu.settled();
      const rgba = await image.read();
      const raster = await sharp(rgba, { raw: { width: SIZE * SCALE, height: SIZE * SCALE, channels: 4 } })
        .resize(SIZE, SIZE, { kernel: 'lanczos3' }).raw().toBuffer();
      // Sixteen alpha levels preserve subpixel branches while keeping all four
      // optional mobile upgrades around 30kB rather than shipping noisy masks.
      for (let index = 3; index < raster.length; index += 4) {
        raster[index] = Math.min(255, Math.round(raster[index] / 16) * 16);
      }
      const asset = await sharp(raster, { raw: { width: SIZE, height: SIZE, channels: 4 } })
        .webp({ quality: 70, alphaQuality: 70, effort: 6 }).toBuffer();
      const pixels = await sharp(asset).ensureAlpha().raw().toBuffer();
      const alphas = pixels.filter((_, index) => index % 4 === 3);
      assert.equal(Math.min(...alphas), 0, 'Sprites must retain real alpha transparency');
      assert.ok(Math.max(...alphas) > 160, 'The shaded soma must have a visible surface');
      assert.ok(alphas.filter(value => value > 0).length < SIZE * SIZE * .55, 'Keep the transparent footprint bounded');
      const filename = `neuron-${variant}.webp`;
      await writeFile(new URL(filename, output), asset);
      manifest.frames.push({ filename, seed: 87391 + variant * 173, bytes: asset.length,
        sha256: hash(asset), branches: data.count });
      console.log(`${filename}: ${asset.length} bytes, native ${gpu.adapter.type} render, ${SIZE}x${SIZE} RGBA`);
    } finally {
      image.destroy();
      ends.destroy();
      shapes.destroy();
    }
  }
  await writeFile(new URL('./manifest.json', import.meta.url), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Assets: ${fileURLToPath(output)}`);
} finally {
  gpu.dispose();
}
