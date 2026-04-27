const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const DATA_DIR = path.join(ROOT, 'data');
const LOG_DIR = path.join(ROOT, 'logs');
const SNAPSHOT_DIR = path.join(DATA_DIR, 'snapshots');

function ensurePortableDirs() {
  [DATA_DIR, LOG_DIR, SNAPSHOT_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

function normalizeSize(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return 'N/A';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = Number(bytes);
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i += 1;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

module.exports = {
  ROOT,
  DATA_DIR,
  LOG_DIR,
  SNAPSHOT_DIR,
  ensurePortableDirs,
  normalizeSize
};
