const { spawn } = require('child_process');
const path = require('path');
const { logger } = require('./logger');

function runPowerShellScript(scriptName, args = [], options = {}) {
  const scriptPath = path.resolve(__dirname, `../../scripts/${scriptName}`);
  const psArgs = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, ...args];

  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', psArgs, {
      windowsHide: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (stderr.trim()) logger.warn(stderr.trim());
      if (code !== 0) {
        logger.error(`PowerShell script failed: ${scriptName} (${code})`);
        return reject(new Error(stderr || `PowerShell failed with code ${code}`));
      }

      const cleaned = stdout.trim();
      if (!cleaned) return resolve({});

      try {
        resolve(JSON.parse(cleaned));
      } catch {
        resolve({ raw: cleaned });
      }
    });
  });
}

module.exports = { runPowerShellScript };
