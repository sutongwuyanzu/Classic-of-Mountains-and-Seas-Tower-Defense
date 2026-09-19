const crypto = require('crypto');
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const dist = path.join(root, 'dist');

function git(args) {
  return childProcess.execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function installedVersion(name) {
  const file = path.join(root, 'node_modules', name, 'package.json');
  if (!fs.existsSync(file)) throw new Error(`Missing installed build dependency: ${name}`);
  return JSON.parse(fs.readFileSync(file, 'utf8')).version;
}

const source = {
  commit: git(['rev-parse', 'HEAD']),
  dirty: Boolean(git(['status', '--porcelain=v1'])),
};
const names = [
  `山海异兽志-Setup-${pkg.version}-x64.exe`,
  `山海异兽志-Portable-${pkg.version}-x64.exe`,
].filter((name) => fs.existsSync(path.join(dist, name)));

if (!names.length) {
  throw new Error('No current Steam release artifacts found. Run npm run dist:steam or npm run dist:portable first.');
}

const artifacts = names.map((name) => {
  const file = path.join(dist, name);
  return {
    name,
    bytes: fs.statSync(file).size,
    sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  };
});

const manifest = {
  productName: '山海异兽志',
  version: pkg.version,
  buildId: pkg.buildId,
  generatedAt: new Date().toISOString(),
  source,
  buildDependencies: {
    electron: installedVersion('electron'),
    electronBuilder: installedVersion('electron-builder'),
  },
  artifacts,
};
const output = path.join(dist, `steam-release-manifest-${pkg.version}.json`);
fs.writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Steam release manifest written: ${output}`);
