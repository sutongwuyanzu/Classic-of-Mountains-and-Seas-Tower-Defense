const { contextBridge, ipcRenderer } = require('electron');
const { buildId } = require('../package.json');

contextBridge.exposeInMainWorld('steamShell', {
  platform: 'steam',
  build: buildId,
  loadSave: () => ipcRenderer.sendSync('save:load'),
  writeSave: (payload) => ipcRenderer.invoke('save:write', payload),
  unlockAchievement: (achievementId) => ipcRenderer.send('achievement:unlock', achievementId),
});
