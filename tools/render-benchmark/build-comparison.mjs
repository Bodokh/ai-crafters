import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(toolDirectory, '../..');
const appPath = 'experiments/neural-home';
const app = join(root, appPath);
// Snapshot includes the then-untracked homepage and the concurrent SEO foundation.
const baselineRef = '29f9d3d';
const temporary = await mkdtemp(join(tmpdir(), 'ai-crafters-render-comparison-'));
const baselineRoot = join(temporary, 'baseline');
const baselineDist = join(temporary, 'dist');
const files = execFileSync('git', ['ls-tree', '-r', '--name-only', baselineRef,
  '--', appPath, 'src/styles'], { cwd: root, encoding: 'utf8' }).trim().split('\n');

for (const file of files) {
  if (!file) continue;
  const destination = join(baselineRoot, file);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, execFileSync('git', ['show', `${baselineRef}:${file}`],
    { cwd: root, maxBuffer: 16 * 1024 * 1024 }));
}
await symlink(join(app, 'node_modules'), join(baselineRoot, appPath, 'node_modules'), 'dir');
execFileSync('rtk', ['npm', 'run', 'build', '--', '--outDir', baselineDist],
  { cwd: join(baselineRoot, appPath), stdio: 'inherit' });
execFileSync('rtk', ['npm', 'run', 'build'], { cwd: app, stdio: 'inherit' });

const destination = join(app, 'dist');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
async function mergeFiles(source, target) {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const input = join(source, entry.name), output = join(target, entry.name);
    if (entry.isDirectory()) await mergeFiles(input, output);
    else {
      const bytes = await readFile(input);
      let existing;
      try { existing = await readFile(output); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (existing && digest(existing) !== digest(bytes)) {
        throw new Error(`Baseline asset would overwrite candidate asset: ${output}`);
      }
      if (!existing) await writeFile(output, bytes);
    }
  }
}
await mergeFiles(join(baselineDist, 'assets'), join(destination, 'assets'));
await cp(join(baselineDist, 'index.html'), join(destination, 'baseline.html'));
await cp(join(baselineDist, 'he/index.html'), join(destination, 'he/baseline.html'));
await cp(join(toolDirectory, 'comparison.html'), join(destination, 'comparison.html'));
await writeFile(join(destination, 'comparison-build.json'), JSON.stringify({
  baselineRef: execFileSync('git', ['rev-parse', baselineRef], { cwd: root, encoding: 'utf8' }).trim(),
  builtAt: new Date().toISOString(),
  candidate: '/', baseline: '/baseline.html', comparison: '/comparison.html',
}, null, 2));
console.log('Comparison built. Preview /comparison.html; only one version renders at a time.');
console.log(`Frozen build retained for inspection: ${temporary}`);
