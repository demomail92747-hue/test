const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ztApi', {
  discoverApps: () => ipcRenderer.invoke('apps:discover'),
  runBloatwareScan: (apps) => ipcRenderer.invoke('apps:bloatware', apps),
  takeSnapshot: (label) => ipcRenderer.invoke('snapshot:take', label),
  compareSnapshots: (before, after) => ipcRenderer.invoke('snapshot:compare', { before, after }),
  uninstallApp: (appInfo, options) => ipcRenderer.invoke('app:uninstall', { appInfo, options }),
  forceUninstall: (appInfo) => ipcRenderer.invoke('app:forceUninstall', appInfo),
  scanLeftovers: (appInfo) => ipcRenderer.invoke('app:scanLeftovers', appInfo),
  runBatchUninstall: (apps, options) => ipcRenderer.invoke('app:batchUninstall', { apps, options }),
  onProgress: (callback) => {
    const wrapped = (_event, data) => callback(data);
    ipcRenderer.on('progress:update', wrapped);
    return () => ipcRenderer.removeListener('progress:update', wrapped);
  }
});
