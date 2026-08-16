const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('steamShell', {
  platform: 'steam',
  build: '0.1.0',
  loadSave: () => ipcRenderer.sendSync('save:load'),
  writeSave: (payload) => ipcRenderer.send('save:write', payload),
  unlockAchievement: (achievementId) => ipcRenderer.send('achievement:unlock', achievementId),
});
