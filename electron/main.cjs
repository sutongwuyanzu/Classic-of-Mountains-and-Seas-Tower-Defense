const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('node:path');
const { readJsonText, writeJsonText } = require('./save-store.cjs');

ipcMain.on('save:load', (event) => { event.returnValue = readJsonText(app.getPath('userData'), 'save-v2.json', ''); });
ipcMain.handle('save:write', (_event, payload) => {
  try {
    writeJsonText(app.getPath('userData'), 'save-v2.json', payload);
    return { ok: true };
  } catch (error) {
    console.error('Failed to write save:', error.message);
    return { ok: false, message: error.message };
  }
});
ipcMain.on('achievement:unlock', (_event, achievementId) => {
  let current = [];
  try {
    const saved = JSON.parse(readJsonText(app.getPath('userData'), 'achievements.json', '[]'));
    current = Array.isArray(saved) ? saved : [];
  } catch {}
  if (typeof achievementId === 'string' && !current.includes(achievementId)) {
    try { writeJsonText(app.getPath('userData'), 'achievements.json', JSON.stringify([...current, achievementId])); } catch (error) { console.error('Failed to write achievement:', error.message); }
  }
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
