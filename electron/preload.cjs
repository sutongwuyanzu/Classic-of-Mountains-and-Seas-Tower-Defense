const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('steamShell', {
  platform: 'steam',
  loadSave: () => ipcRenderer.sendSync('save:load'),
  writeSave: (payload) => ipcRenderer.invoke('save:write', payload),
  unlockAchievement: (achievementId) => ipcRenderer.send('achievement:unlock', achievementId),
});
