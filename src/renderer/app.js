let apps = [];
let filteredApps = [];
let selectedApp = null;
const checkedApps = new Set();

const elements = {
  table: document.getElementById('appsTable'),
  details: document.getElementById('details'),
  leftoversTree: document.getElementById('leftoversTree'),
  search: document.getElementById('search'),
  sortBy: document.getElementById('sortBy'),
  selectAll: document.getElementById('selectAll'),
  progressModal: document.getElementById('progressModal'),
  progressText: document.getElementById('progressText')
};

window.ztApi.onProgress((data) => {
  elements.progressModal.classList.remove('hidden');
  elements.progressText.textContent = `${data.step}: ${data.details}`;
  if (data.step === 'Cleaning') {
    setTimeout(() => elements.progressModal.classList.add('hidden'), 700);
  }
});

function formatDate(raw) {
  if (!raw) return 'N/A';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toISOString().slice(0, 10);
}

function renderTable(list) {
  elements.table.innerHTML = '';
  list.forEach((app) => {
    const tr = document.createElement('tr');
    tr.className = selectedApp && selectedApp.name === app.name ? 'selected' : '';

    tr.innerHTML = `
      <td><input type="checkbox" ${checkedApps.has(app.name) ? 'checked' : ''} data-name="${app.name}" /></td>
      <td>${app.name || ''}</td>
      <td>${app.size || 'N/A'}</td>
      <td>${formatDate(app.installDate)}</td>
      <td>${app.publisher || 'Unknown'}</td>
      <td><button data-action="pick" data-name="${app.name}">Details</button></td>
    `;

    tr.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      selectedApp = app;
      renderDetails();
      renderTable(filteredApps);
    });

    tr.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) checkedApps.add(app.name);
      else checkedApps.delete(app.name);
    });

    elements.table.appendChild(tr);
  });
}

function renderDetails() {
  if (!selectedApp) {
    elements.details.innerHTML = '<p>Select an application.</p>';
    return;
  }

  elements.details.innerHTML = `
    <p><b>Name:</b> ${selectedApp.name || ''}</p>
    <p><b>Version:</b> ${selectedApp.version || 'N/A'}</p>
    <p><b>Publisher:</b> ${selectedApp.publisher || 'N/A'}</p>
    <p><b>Install Location:</b> ${selectedApp.installLocation || 'N/A'}</p>
    <p><b>Uninstall String:</b> ${selectedApp.uninstallString || 'N/A'}</p>
  `;
}

function renderLeftovers(items) {
  elements.leftoversTree.innerHTML = '';
  items.forEach((item, i) => {
    const row = document.createElement('label');
    row.className = 'leftover-item';
    row.innerHTML = `
      <input checked type="checkbox" data-idx="${i}" />
      <span>[${item.type}] ${item.path} (confidence: ${item.confidence})</span>
    `;
    elements.leftoversTree.appendChild(row);
  });
}

function applySearchAndSort() {
  const term = elements.search.value.trim();
  const sortBy = elements.sortBy.value;

  if (term) {
    const fuse = new Fuse(apps, { keys: ['name', 'publisher'], threshold: 0.3 });
    filteredApps = fuse.search(term).map((x) => x.item);
  } else {
    filteredApps = [...apps];
  }

  filteredApps.sort((a, b) => {
    if (sortBy === 'size') return Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0);
    if (sortBy === 'installDate') return new Date(b.installDate || 0) - new Date(a.installDate || 0);
    return (a.name || '').localeCompare(b.name || '');
  });

  renderTable(filteredApps);
}

async function refreshApps() {
  apps = await window.ztApi.discoverApps();
  applySearchAndSort();
}

document.getElementById('refreshBtn').addEventListener('click', refreshApps);
document.getElementById('snapshotBtn').addEventListener('click', async () => {
  const label = prompt('Snapshot label:', 'manual');
  if (!label) return;
  const result = await window.ztApi.takeSnapshot(label);
  alert(`Snapshot saved: ${result.path || 'OK'}`);
});

document.getElementById('bloatwareBtn').addEventListener('click', async () => {
  const detected = await window.ztApi.runBloatwareScan(apps);
  alert(detected.length ? `${detected.length} potential bloatware apps detected.` : 'No potential bloatware detected.');
});

document.getElementById('batchUninstallBtn').addEventListener('click', async () => {
  const selected = apps.filter((app) => checkedApps.has(app.name));
  if (!selected.length) return alert('Select apps first.');
  if (!confirm(`Uninstall ${selected.length} selected apps?`)) return;
  await window.ztApi.runBatchUninstall(selected, { silent: true });
  await refreshApps();
});

document.getElementById('uninstallBtn').addEventListener('click', async () => {
  if (!selectedApp) return;
  if (!confirm(`Uninstall ${selectedApp.name}?`)) return;
  const result = await window.ztApi.uninstallApp(selectedApp, { silent: true });
  renderLeftovers(result.leftovers || []);
  await refreshApps();
});

document.getElementById('forceUninstallBtn').addEventListener('click', async () => {
  if (!selectedApp) return;
  if (!confirm(`Force uninstall ${selectedApp.name}? This can be destructive.`)) return;
  await window.ztApi.forceUninstall(selectedApp);
  await refreshApps();
});

document.getElementById('scanBtn').addEventListener('click', async () => {
  if (!selectedApp) return;
  const items = await window.ztApi.scanLeftovers(selectedApp);
  renderLeftovers(items);
});

elements.search.addEventListener('input', applySearchAndSort);
elements.sortBy.addEventListener('change', applySearchAndSort);
elements.selectAll.addEventListener('change', (e) => {
  if (e.target.checked) filteredApps.forEach((app) => checkedApps.add(app.name));
  else filteredApps.forEach((app) => checkedApps.delete(app.name));
  renderTable(filteredApps);
});

refreshApps();
