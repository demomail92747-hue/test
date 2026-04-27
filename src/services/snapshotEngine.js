const path = require('path');
const { runPowerShellScript } = require('../utils/powershell');
const { SNAPSHOT_DIR } = require('../utils/helpers');

async function takeSnapshot(label = '') {
  const sanitizedLabel = (label || 'snapshot').replace(/[^a-zA-Z0-9-_]/g, '_');
  const file = `${Date.now()}_${sanitizedLabel}.json`;
  const outputPath = path.join(SNAPSHOT_DIR, file);
  return runPowerShellScript('snapshotTake.ps1', ['-OutputPath', outputPath]);
}

async function compareSnapshots(before, after) {
  return runPowerShellScript('snapshotCompare.ps1', ['-BeforePath', before, '-AfterPath', after]);
}

module.exports = { takeSnapshot, compareSnapshots };
