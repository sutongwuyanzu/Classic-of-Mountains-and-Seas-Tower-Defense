const fs = require('node:fs');
const path = require('node:path');

function filePath(dataDirectory, name) {
  if (!name || path.basename(name) !== name) throw new Error(`Invalid save file name: ${name}`);
  return path.join(dataDirectory, name);
}

function isValidJsonFile(file) {
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'));
    return true;
  } catch {
    return false;
  }
}

function readJsonText(dataDirectory, name, fallback = '') {
  const target = filePath(dataDirectory, name);
  for (const candidate of [target, `${target}.bak`]) {
    try {
      const value = fs.readFileSync(candidate, 'utf8');
      JSON.parse(value);
      return value;
    } catch {}
  }
  return fallback;
}

function writeJsonText(dataDirectory, name, value) {
  const serialized = String(value);
  JSON.parse(serialized);
  const target = filePath(dataDirectory, name);
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  let descriptor;
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    descriptor = fs.openSync(temporary, 'w', 0o600);
    fs.writeFileSync(descriptor, serialized, 'utf8');
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    if (isValidJsonFile(target)) fs.copyFileSync(target, `${target}.bak`);
    fs.renameSync(temporary, target);
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    try { fs.rmSync(temporary, { force: true }); } catch {}
  }
}

module.exports = { readJsonText, writeJsonText };
