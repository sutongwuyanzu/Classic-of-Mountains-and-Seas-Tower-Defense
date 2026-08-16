const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

function dataPath(name) {
  return path.join(app.getPath('userData'), name);
}

function readText(name, fallback = '') {
  try { return fs.readFileSync(dataPath(name), 'utf8'); } catch { return fallback; }
}

function readJsonText(name, fallback = '') {
  for (const candidate of [dataPath(name), `${dataPath(name)}.bak`]) {
    try { const value = fs.readFileSync(candidate, 'utf8'); JSON.parse(value); return value; } catch {}
  }
  return fallback;
}

function writeText(name, value) {
  const target = dataPath(name);
  const temporary = `${target}.tmp`;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(temporary, String(value), 'utf8');
  if (fs.existsSync(target)) fs.copyFileSync(target, `${target}.bak`);
  fs.rmSync(target, { force: true });
  fs.renameSync(temporary, target);
}

ipcMain.on('save:load', (event) => { event.returnValue = readJsonText('save-v2.json', ''); });
ipcMain.on('save:write', (_event, payload) => { try { JSON.parse(payload); writeText('save-v2.json', payload); } catch (error) { console.error('Failed to write save:', error.message); } });
ipcMain.on('achievement:unlock', (_event, achievementId) => {
  let current = [];
  try { current = JSON.parse(readText('achievements.json', '[]')); } catch {}
  if (!current.includes(achievementId)) { try { writeText('achievements.json', JSON.stringify([...current, achievementId])); } catch (error) { console.error('Failed to write achievement:', error.message); } }
});

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#101719',
    icon: path.join(__dirname, '..', 'assets', 'fx', 'summon-ritual.png'),
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  window.loadFile(path.join(__dirname, '..', 'index.html'));
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (url !== window.webContents.getURL()) event.preventDefault();
  });
  window.once('ready-to-show', () => window.show());
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
