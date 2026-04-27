const { runPowerShellScript } = require('../utils/powershell');
const { logger } = require('../utils/logger');

async function uninstallApp(appInfo, options = {}) {
  const args = [
    '-UninstallString', appInfo.uninstallString || '',
    '-AppName', appInfo.name || '',
    '-Silent', String(Boolean(options.silent))
  ];

  const result = await runPowerShellScript('uninstallApp.ps1', args);
  logger.info(`Uninstall result for ${appInfo.name}: ${JSON.stringify(result)}`);
  return result;
}

async function forceUninstall(appInfo) {
  const args = [
    '-AppName', appInfo.name || '',
    '-InstallLocation', appInfo.installLocation || '',
    '-Publisher', appInfo.publisher || ''
  ];

  const result = await runPowerShellScript('forceUninstall.ps1', args);
  logger.info(`Force uninstall result for ${appInfo.name}: ${JSON.stringify(result)}`);
  return result;
}

module.exports = { uninstallApp, forceUninstall };
