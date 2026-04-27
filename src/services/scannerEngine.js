const { runPowerShellScript } = require('../utils/powershell');

async function scanLeftovers(appInfo) {
  const args = [
    '-AppName', appInfo.name || '',
    '-InstallLocation', appInfo.installLocation || '',
    '-Publisher', appInfo.publisher || ''
  ];

  const result = await runPowerShellScript('scanLeftovers.ps1', args);
  return Array.isArray(result) ? result : [];
}

module.exports = { scanLeftovers };
