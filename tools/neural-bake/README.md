# Mobile neuron sprites with vGPU

This isolated build tool uses **Vercel Labs vGPU 0.4.1**, its native Node adapter,
and a WGSL fragment effect to bake dimensional neuron sprites. It is not part of
the homepage's runtime dependencies. The checked-in WebP files are the output;
phones keep using the existing Canvas2D renderer.

```sh
rtk npm ci --prefix tools/neural-bake
rtk npm run bake --prefix tools/neural-bake
rtk proxy node --test experiments/neural-home/src/mobile-scene.test.js
```

Run from the worktree root. The bake requests a hardware adapter. The verified
run used Metal on macOS; `manifest.json` records the actual adapter, shader hash,
per-variant seeds, asset sizes, and asset hashes. A different driver can produce
small pixel differences. The source is deterministic: there is no clock, network
image, generative model, browser, or mock adapter involved in the bake.

The WGSL effect shades nine curved, tapered primary dendrites and their forks,
an irregular soma, a translucent nucleus, and a restrained directional highlight.
Each variant renders to a 576×576 offscreen vGPU target. `target.read()` returns
real GPU RGBA pixels; Sharp downsamples to **288×288**, quantizes alpha, and
encodes WebP. Validation checks actual transparency, visible surface opacity,
and the transparent footprint. All four shipped sprites total **30,436 bytes**.

The mobile scene first renders its existing procedural sprites and announces
readiness normally. On the following animation frame, an optional loader starts
four asynchronous image requests. Successful decodes copy into the four existing
canvases. Failed loads, failed decodes, invalid dimensions, and disposal preserve
the fallback or stop the upgrade. No decode is awaited by the renderer; no frame
is requested when pixels are replaced.

The original route, screen bounds, sprite sizes, global opacity, glow passes,
draw count, 30fps travel / 18fps idle scheduling, and resolution adaptation remain
unchanged. There is still a one-time transfer and decode cost; this tool does
not by itself prove equal end-to-end performance or physical-phone smoothness.
Browser comparison and real-device acceptance are separate checks.

The vGPU MCP `docs` tool was queried through its public endpoint using protocol
`2026-07-28`. The implementation follows these official references:

- Native Node GPU rendering and readback: MCP document `createNodeDevice`.
- [Effect API](https://vgpu.sh/docs/reference/vgpu/effect)
- [Fullscreen effects](https://vgpu.sh/docs/concepts/effects)

The corresponding MCP document paths are
`/@vgpu/adapter-node/create-node-device.docs.md`, `/vgpu/effect.docs.md`, and
`/guides/concepts-effects.docs.md`.
