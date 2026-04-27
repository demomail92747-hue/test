const fs = require('fs');
const path = require('path');
const { LOG_DIR, ensurePortableDirs } = require('./helpers');

ensurePortableDirs();

const logPath = path.join(LOG_DIR, 'zerotrace.log');

function write(level, message) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}`;
  fs.appendFileSync(logPath, `${line}\n`, 'utf8');
}

const logger = {
  info: (msg) => write('INFO', msg),
  warn: (msg) => write('WARN', msg),
  error: (msg) => write('ERROR', msg)
};

module.exports = { logger };
