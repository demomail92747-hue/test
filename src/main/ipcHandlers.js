const { ipcMain, BrowserWindow } = require('electron');
const { discoverApps } = require('../services/appDiscovery');
const { uninstallApp, forceUninstall } = require('../services/uninstallEngine');
const { scanLeftovers } = require('../services/scannerEngine');
const { takeSnapshot, compareSnapshots } = require('../services/snapshotEngine');
const { detectBloatware } = require('../services/bloatwareEngine');
const { logger } = require('../utils/logger');

function progress(step, details = '') {
  const payload = { step, details, timestamp: Date.now() };
  BrowserWindow.getAllWindows().forEach((w) => w.webContents.send('progress:update', payload));
}

function registerIpcHandlers() {
  ipcMain.handle('apps:discover', async () => {
    logger.info('Discovering installed apps.');
    return discoverApps();
  });

  ipcMain.handle('apps:bloatware', async (_event, apps) => {
    logger.info('Running bloatware detector.');
    return detectBloatware(apps || []);
  });

  ipcMain.handle('snapshot:take', async (_event, label) => takeSnapshot(label));

  ipcMain.handle('snapshot:compare', async (_event, { before, after }) => compareSnapshots(before, after));

  ipcMain.handle('app:scanLeftovers', async (_event, appInfo) => {
    progress('Scanning leftovers', appInfo.name);
    return scanLeftovers(appInfo);
  });

  ipcMain.handle('app:uninstall', async (_event, { appInfo, options }) => {
    progress('Uninstalling', appInfo.name);
    const uninstallResult = await uninstallApp(appInfo, options);
    progress('Scanning leftovers', appInfo.name);
    const leftovers = await scanLeftovers(appInfo);
    progress('Cleaning', appInfo.name);
    return { uninstallResult, leftovers };
  });

  ipcMain.handle('app:forceUninstall', async (_event, appInfo) => {
    progress('Uninstalling', `${appInfo.name} (force mode)`);
    const result = await forceUninstall(appInfo);
    progress('Cleaning', appInfo.name);
    return result;
  });

  ipcMain.handle('app:batchUninstall', async (_event, { apps, options }) => {
    const results = [];
    for (const appInfo of apps) {
      progress('Uninstalling', appInfo.name);
      const uninstallResult = await uninstallApp(appInfo, options);
      progress('Scanning leftovers', appInfo.name);
      const leftovers = await scanLeftovers(appInfo);
      progress('Cleaning', appInfo.name);
      results.push({ app: appInfo.name, uninstallResult, leftovers });
    }
    return results;
  });
}

module.exports = { registerIpcHandlers };
