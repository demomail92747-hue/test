const path = require('path');
const fs = require('fs');

function detectBloatware(apps = []) {
  const rulesPath = path.resolve(__dirname, '../../data/bloatware-list.json');
  const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

  const knownJunk = new Set(rules.knownJunk.map((x) => x.toLowerCase()));
  return apps
    .map((app) => {
      const lower = (app.name || '').toLowerCase();
      const isKnownJunk = [...knownJunk].some((rule) => lower.includes(rule));
      const sizeBytes = Number(app.sizeBytes || 0);
      const isLargeUnused = sizeBytes > rules.largeAppThresholdBytes && !app.lastUsed;

      if (!isKnownJunk && !isLargeUnused) return null;
      return {
        ...app,
        reason: isKnownJunk ? 'Known junk app list match' : 'Large app with unknown usage',
        recommendation: 'Review for removal'
      };
    })
    .filter(Boolean);
}

module.exports = { detectBloatware };
