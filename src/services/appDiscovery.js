const { runPowerShellScript } = require('../utils/powershell');
const { logger } = require('../utils/logger');

async function discoverApps() {
  const result = await runPowerShellScript('discoverApps.ps1');
  const apps = Array.isArray(result) ? result : [];
  logger.info(`Discovered ${apps.length} applications.`);
  return apps;
}

module.exports = { discoverApps };
