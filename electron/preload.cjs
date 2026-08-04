const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('steamShell', {
  platform: 'steam',
  build: '0.1.0',
});
