// Offline only: tapered dendrite distance fields, a lobed soma, and restrained
// directional lighting are flattened to the same 288px Canvas2D sprite at bake.
struct Params { variant: f32, count: u32, size: f32, padding: f32 }
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> branchEnds: array<vec4f>;
@group(0) @binding(2) var<storage, read> branchShape: array<vec4f>;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = (uv - 0.5) * params.size;
  let angle = atan2(p.y / 1.12, p.x);
  let bodyRadius = 17.0 + cos(angle * 5.0 + params.variant) * 2.5 + sin(angle * 3.0) * 1.8;
  let bodyPoint = vec2f(p.x, p.y / 1.12);
  let bodyDistance = length(bodyPoint) - bodyRadius;
  var distance = bodyDistance;
  var normalXY = bodyPoint / bodyRadius;
  var opacity = 0.88;
  var material = 1.0;

  for (var index = 0u; index < params.count; index++) {
    let ends = branchEnds[index];
    let shape = branchShape[index];
    let vector = ends.zw - ends.xy;
    let fraction = clamp(dot(p - ends.xy, vector) / max(dot(vector, vector), 0.0001), 0.0, 1.0);
    let radius = mix(shape.x, shape.y, fraction);
    let offset = p - mix(ends.xy, ends.zw, fraction);
    let branchDistance = length(offset) - radius;
    if (branchDistance < distance) {
      distance = branchDistance;
      normalXY = offset / radius;
      opacity = shape.z;
      material = shape.w;
    }
  }

  let tone = select(vec3f(0.365, 0.812, 0.918), vec3f(0.616, 0.486, 0.851), u32(params.variant) % 2u == 1u);
  let nxy = normalXY * 0.94;
  let normal = normalize(vec3f(nxy, sqrt(max(0.005, 1.0 - dot(nxy, nxy)))));
  let light = normalize(vec3f(-0.55, -0.65, 1.25));
  let diffuse = max(dot(normal, light), 0.0);
  let rim = pow(1.0 - normal.z, 2.5);
  let specular = pow(max(dot(normal, normalize(light + vec3f(0.0, 0.0, 1.0))), 0.0), 30.0);
  var color = tone * (0.16 + diffuse * 0.48 + rim * 0.75) + vec3f(0.8, 0.94, 1.0) * specular * 0.38;
  color *= material;

  // A translucent nucleus and quiet internal membrane texture give the soma
  // depth without introducing another layer or draw in the mobile renderer.
  if (bodyDistance < 0.0) {
    let nucleus = length((p - vec2f(-2.0, -1.5)) / vec2f(7.2, 8.0));
    let nucleusMask = 1.0 - smoothstep(0.84, 1.0, nucleus);
    let nucleusRim = exp(-pow((nucleus - 0.94) * 10.0, 2.0));
    color = mix(color, tone * (0.16 + diffuse * 0.24), nucleusMask * 0.55);
    color += tone * nucleusRim * 0.11;
    let membrane = sin(p.x * 1.8 + sin(p.y * 0.8)) * sin(p.y * 1.45 + cos(p.x));
    color += tone * membrane * 0.018;
  }

  let coverage = 1.0 - smoothstep(-0.3, 0.55, distance);
  let surfaceAlpha = coverage * opacity;
  let halo = exp(-max(distance, 0.0) * 0.8) * 0.07 * (1.0 - coverage);
  let alpha = surfaceAlpha + halo * (1.0 - surfaceAlpha);
  // Completely transparent bounds keep filtering and the alpha footprint tame.
  let edge = 1.0 - smoothstep(134.0, 141.0, max(abs(p.x), abs(p.y)));
  return vec4f(clamp(mix(tone * 0.65, color, coverage), vec3f(0.0), vec3f(1.0)), alpha * edge);
}
