// HONDA MOTORCYCLE & SCOOTER INDIA (HMSI) - WMS CONTROL TOWER & WORKFLOW ENGINE
// Narsapur Two-Wheeler Plants 1 & 2 Execution Logic

window.wms = loadWMSState();

// Plant Filter Handler
function onPlantFilterChange(plantValue) {
  window.wms.activePlant = plantValue;
  saveWMSState(window.wms);
  renderAllWMSViews();
}

// Helper to filter datasets by active plant
function isPlantMatch(plantString = '', locationString = '') {
  const active = window.wms.activePlant || 'All';
  if (active === 'All' || active.includes('All')) return true;
  
  const targetP1 = active === 'P1' || active.includes('Plant 1');
  const targetP2 = active === 'P2' || active.includes('Plant 2');

  const str = (plantString || '') + ' ' + (locationString || '');
  if (targetP1) {
    if (str.includes('Plant 2') || str.includes('P2-') || str.includes('STG-P2') || str.includes('Dock 05') || str.includes('Dock 06') || str.includes('RM-B02')) {
      return false;
    }
    return true;
  }
  if (targetP2) {
    return str.includes('Plant 2') || str.includes('P2') || str.includes('P2-RM-01') || str.includes('STG-P2') || str.includes('Dock 05') || str.includes('Dock 06') || str.includes('RM-B02');
  }
  return true;
}

// Active View Routing
function showWmsView(viewId) {
  document.querySelectorAll('.wms-view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

  const targetView = document.getElementById(`wms-view-${viewId}`);
  const activeNav = document.querySelector(`.nav-link[data-view="${viewId}"]`);

  if (targetView) targetView.classList.add('active');
  if (activeNav) activeNav.classList.add('active');

  const titleMap = {
    dashboard: 'Dashboard',
    gateEntry: 'Inbound Vehicle Gate Entry',
    docks: 'Receiving Dock Management',
    areaMaster: 'Area Master',
    sapSync: 'SAP S/4HANA Sync Hub',
    userMaster: 'Users & Security Roles',
    grn: 'Goods Receipt Note (GRN)',
    hu: 'Handling Units (HU / LPN)',
    putaway: 'Putaway Task Queue',
    discrepancies: 'Inbound Discrepancies & Truck Shortage Log',
    inventory: 'Inventory Master',
    map: 'Warehouse Map & Bay Layout',
    fifo: 'FIFO Allocation Queue',
    aging: 'Stock Aging Analysis',
    requisition: 'Assembly Line Requisitions',
    picking: 'Pick Lists & Task Board',
    staging: 'Line Staging Buffers',
    linesupply: 'Line Supply Delivery',
    transfers: 'Inter-Plant Stock Transfers',
    replenishment: 'Replenishment & Shortages',
    po: 'Purchase Orders (PO Master)',
    cyclecount: 'Cycle Count Plans & Audits',
    audit: 'WMS Audit Trail'
  };

  const pageTitleEl = document.getElementById('wms-page-title');
  if (titleMap[viewId] && pageTitleEl) {
    pageTitleEl.textContent = titleMap[viewId];
  }

  renderAllWMSViews();
}

function renderAllWMSViews() {
  renderKPICards();
  renderPlantLines();
  renderGateEntryTable();
  renderDockBoard();
  renderAreaBinMaster();
  renderSAPSyncHub();
  renderUserSecurityMaster();
  renderGRNTable();
  renderHUTable();
  renderPutawayTasks();
  renderDiscrepanciesTable();
  renderInventoryTable();
  renderWarehouseMap();
  renderFIFOQueue();
  renderStockAging();
  renderRequisitions();
  renderPickLists();
  renderStagingTable();
  renderLineSupplyTable();
  renderTransfersTable();
  renderReplenishmentTable();
  renderPOTable();
  renderCycleCountTable();
  renderAuditTrailTable();
}

// 1. KPI Cards Render (Plant-Filtered)
function renderKPICards() {
  const filteredHUs = window.wms.handlingUnits.filter(h => isPlantMatch(h.plant, h.location));
  const filteredGEs = window.wms.gateEntries.filter(g => isPlantMatch(g.plant, g.dock));
  const filteredDocks = window.wms.docks.filter(d => isPlantMatch(d.plant));
  const filteredPutaways = window.wms.putawayTasks.filter(p => isPlantMatch(p.suggestedLocation, p.sourceLocation));

  const available = filteredHUs.filter(h => h.status === 'AVAILABLE').reduce((sum, h) => sum + h.quantity, 0);
  const allocated = filteredHUs.filter(h => h.status === 'ALLOCATED').reduce((sum, h) => sum + h.quantity, 0);
  const pendingQC = filteredHUs.filter(h => h.status === 'QUALITY HOLD' || h.status === 'QUARANTINE').length;
  const pendingPutaway = filteredPutaways.filter(p => p.status === 'Open').length;

  const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

  setEl('kpi-today-inbound', filteredGEs.length.toString());
  setEl('kpi-pending-receiving', (filteredDocks.filter(d => d.status.includes('Receiving')).length || filteredDocks.length || 1).toString());
  setEl('kpi-pending-qc', pendingQC.toString());
  setEl('kpi-pending-putaway', pendingPutaway.toString());
  setEl('kpi-available-inv', available.toLocaleString());
  setEl('kpi-allocated-inv', allocated.toLocaleString());
  setEl('kpi-low-stock', (window.wms.activePlant === 'P1' || (window.wms.activePlant && window.wms.activePlant.includes('Plant 1')) ? '0' : '1'));
  setEl('kpi-fifo-exceptions', '7');
}

// 2. Plant Overview Lines (Plant-Filtered)
function renderPlantLines() {
  const p1Card = document.getElementById('plant-1-lines-container')?.closest('.plant-card');
  const p2Card = document.getElementById('plant-2-lines-container')?.closest('.plant-card');
  const p1Container = document.getElementById('plant-1-lines-container');
  const p2Container = document.getElementById('plant-2-lines-container');

  const active = window.wms.activePlant || 'All';

  if (p1Card && p2Card) {
    if (active === 'P1' || active.includes('Plant 1')) {
      p1Card.style.display = 'block';
      p2Card.style.display = 'none';
    } else if (active === 'P2' || active.includes('Plant 2')) {
      p1Card.style.display = 'none';
      p2Card.style.display = 'block';
    } else {
      p1Card.style.display = 'block';
      p2Card.style.display = 'block';
    }
  }

  if (p1Container && window.wms.plants[0]) {
    p1Container.innerHTML = window.wms.plants[0].lines.map(line => `
      <div class="line-status-item">
        <div class="line-name-row">
          <span><strong>${line.name}</strong></span>
          <span class="wms-badge ${line.materialAvailability > 90 ? 'badge-available' : 'badge-reserved'}">${line.materialAvailability}% Avail</span>
        </div>
        <div class="line-meta">
          <span>Output: ${line.status}</span>
          <span>Staged HUs: <strong>${line.stagedHUs}</strong></span>
        </div>
      </div>
    `).join('');
  }

  if (p2Container && window.wms.plants[1]) {
    p2Container.innerHTML = window.wms.plants[1].lines.map(line => `
      <div class="line-status-item">
        <div class="line-name-row">
          <span><strong>${line.name}</strong></span>
          <span class="wms-badge ${line.materialAvailability > 85 ? 'badge-available' : 'badge-damaged'}">${line.materialAvailability}% Avail</span>
        </div>
        <div class="line-meta">
          <span>Status: ${line.status}</span>
          <span>Staged HUs: <strong>${line.stagedHUs}</strong></span>
        </div>
      </div>
    `).join('');
  }
}

// 3. Gate Entry Table (Plant-Filtered + Search)
function renderGateEntryTable() {
  const tbody = document.getElementById('gate-entry-table-body');
  if (!tbody) return;

  const search = (document.getElementById('search-gate-entry')?.value || '').toLowerCase();
  const list = window.wms.gateEntries
    .filter(ge => isPlantMatch(ge.plant, ge.dock))
    .filter(ge => 
      ge.gateEntryNo.toLowerCase().includes(search) || 
      ge.vehicleNo.toLowerCase().includes(search) || 
      ge.supplier.toLowerCase().includes(search) || 
      ge.poNumber.toLowerCase().includes(search)
    );

  tbody.innerHTML = list.map(ge => `
    <tr>
      <td><strong>${ge.gateEntryNo}</strong></td>
      <td><span class="wms-badge" style="background:#f1f5f9; color:#0f172a; font-weight:700;">${ge.vehicleNo}</span></td>
      <td>${ge.supplier}</td>
      <td><strong>${ge.poNumber}</strong></td>
      <td>${ge.asnNumber}</td>
      <td>${ge.plant}</td>
      <td><strong>${ge.dock}</strong></td>
      <td>${ge.expectedHUs} HUs (${ge.expectedQty} EA)</td>
      <td><span class="wms-badge ${ge.status === 'Arrived' ? 'badge-available' : (ge.status.includes('Receiving') ? 'badge-allocated' : 'badge-reserved')}">${ge.status}</span></td>
      <td>
        <button class="btn-wms btn-wms-danger" style="padding:2px 6px; font-size:11px;" onclick="deleteGateEntry('${ge.gateEntryNo}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openAddGateEntryModal() {
  document.getElementById('modal-add-gate-entry').classList.add('active');
}

function closeAddGateEntryModal() {
  document.getElementById('modal-add-gate-entry').classList.remove('active');
}

function submitNewGateEntry() {
  const vehicle = document.getElementById('ge-form-vehicle').value;
  const supplier = document.getElementById('ge-form-supplier').value;
  const po = document.getElementById('ge-form-po').value;
  const dock = document.getElementById('ge-form-dock').value;
  const qty = parseInt(document.getElementById('ge-form-qty').value, 10);
  const plant = (window.wms.activePlant === 'P2' || window.wms.activePlant.includes('Plant 2')) ? 'HMSI Narsapur Plant 2' : 'HMSI Narsapur Plant 1';

  if (!vehicle) { alert('Please enter vehicle registration number.'); return; }

  const newGE = {
    gateEntryNo: `GE-HND-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    vehicleNo: vehicle,
    supplier,
    poNumber: po,
    asnNumber: `ASN-HND-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    driverName: 'Assigned Driver',
    driverContact: '+91 98450 00000',
    arrivalTimestamp: new Date().toLocaleString(),
    plant,
    gate: 'Security Gate 02 (North)',
    dock,
    expectedHUs: Math.ceil(qty / 100),
    expectedQty: qty,
    receivedHUs: 0,
    receivedQty: 0,
    status: 'Arrived'
  };

  window.wms.gateEntries.unshift(newGE);
  saveWMSState(window.wms);
  closeAddGateEntryModal();
  renderAllWMSViews();
  alert(`✅ Registered Inbound Gate Entry ${newGE.gateEntryNo} for Vehicle ${vehicle}!`);
}

function deleteGateEntry(geNo) {
  if (!confirm(`Are you sure you want to delete Gate Entry ${geNo}?`)) return;
  window.wms.gateEntries = window.wms.gateEntries.filter(g => g.gateEntryNo !== geNo);
  saveWMSState(window.wms);
  renderAllWMSViews();
}

// 3b. Area & Storage Bin Master
function renderAreaBinMaster() {
  const tbody = document.getElementById('area-master-table-body');
  if (!tbody) return;

  const search = (document.getElementById('search-bin-master')?.value || '').toLowerCase();
  const list = (window.wms.binMaster || []).filter(b => 
    b.binCode.toLowerCase().includes(search) ||
    b.zone.toLowerCase().includes(search) ||
    (b.storedMaterial || '').toLowerCase().includes(search)
  );

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#94a3b8; padding:20px;">No storage bins found matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(bin => {
    const utilPct = Math.round((bin.currentQty / bin.maxCapacity) * 100);
    const color = utilPct > 80 ? '#dc2626' : (utilPct > 40 ? '#2563eb' : '#10b981');
    return `
      <tr>
        <td><strong>${bin.binCode}</strong></td>
        <td>${bin.zone}</td>
        <td><span class="wms-badge" style="background:#f1f5f9; color:#0f172a;">${bin.binType}</span></td>
        <td><strong>${bin.maxCapacity} EA</strong></td>
        <td>${bin.currentQty} EA</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="flex:1; background:#e2e8f0; border-radius:4px; height:8px; overflow:hidden;">
              <div style="width:${utilPct}%; background:${color}; height:100%;"></div>
            </div>
            <span style="font-size:11px; font-weight:700; color:${color}; width:35px;">${utilPct}%</span>
          </div>
        </td>
        <td><span style="font-family:monospace; font-weight:600;">${bin.storedMaterial || 'Empty / Available'}</span></td>
        <td><span class="wms-badge ${bin.status === 'Full' ? 'badge-reserved' : (bin.status === 'Occupied' ? 'badge-available' : 'badge-allocated')}">${bin.status}</span></td>
      </tr>
    `;
  }).join('');
}

function openAddBinModal() {
  document.getElementById('modal-add-bin')?.classList.add('active');
}

function closeAddBinModal() {
  document.getElementById('modal-add-bin')?.classList.remove('active');
}

function submitNewBin() {
  const code = document.getElementById('bin-form-code')?.value.trim();
  const zone = document.getElementById('bin-form-zone')?.value;
  const type = document.getElementById('bin-form-type')?.value;
  const cap = parseInt(document.getElementById('bin-form-cap')?.value || '1000', 10);

  if (!code) { alert('Please enter bin code.'); return; }

  const newBin = {
    binCode: code,
    zone,
    binType: type,
    maxCapacity: cap,
    currentQty: 0,
    storedMaterial: 'Empty',
    status: 'Empty'
  };

  if (!window.wms.binMaster) window.wms.binMaster = [];
  window.wms.binMaster.unshift(newBin);
  saveWMSState(window.wms);
  closeAddBinModal();
  renderAreaBinMaster();
  alert(`✅ Storage Bin ${code} registered successfully!`);
}

// 3c. SAP S/4HANA Sync Hub
function renderSAPSyncHub() {
  const tbody = document.getElementById('sap-sync-table-body');
  if (!tbody) return;

  const list = window.wms.sapSyncLogs || [];
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:20px;">No SAP sync transactions recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(log => `
    <tr>
      <td><strong>${log.interfaceId}</strong></td>
      <td><span class="wms-badge" style="background:${log.direction === 'OUTBOUND' ? '#dbeafe' : '#fef3c7'}; color:${log.direction === 'OUTBOUND' ? '#1e40af' : '#92400e'};">${log.direction}</span></td>
      <td><strong style="color:#0f172a;">${log.sapDocNo}</strong></td>
      <td><span style="font-family:monospace; font-weight:600;">${log.wmsRef}</span></td>
      <td><span class="wms-badge" style="background:#f1f5f9; color:#334155;">${log.payloadType}</span></td>
      <td><span class="wms-badge badge-available">${log.status}</span></td>
      <td><span style="font-size:11px; color:#64748b;">${log.timestamp}</span></td>
    </tr>
  `).join('');
}

function triggerForceSAPSync() {
  const newLog = {
    syncId: `SYNC-DELTA-${Date.now()}`,
    interfaceId: 'RFC_DELTA_PULL_ALL',
    direction: 'INBOUND',
    sapDocNo: `DELTA-PACK-${Math.floor(1000 + Math.random() * 9000)}`,
    wmsRef: 'ALL_PLANTS',
    payloadType: 'BAPI_MATERIAL_INVENTORY_GETLIST',
    status: 'SUCCESS (200 OK)',
    timestamp: new Date().toLocaleTimeString()
  };

  if (!window.wms.sapSyncLogs) window.wms.sapSyncLogs = [];
  window.wms.sapSyncLogs.unshift(newLog);
  saveWMSState(window.wms);
  renderSAPSyncHub();
  alert('⚡ Force Delta Sync with SAP S/4HANA ERP Completed Successfully!\nLatency: 14ms • All Purchase Orders, Stock & Goods Movements in sync.');
}

// 3d. Users & Security Roles Master
function renderUserSecurityMaster() {
  const tbody = document.getElementById('user-master-table-body');
  if (!tbody) return;

  const search = (document.getElementById('search-user-master')?.value || '').toLowerCase();
  const list = (window.wms.userMaster || []).filter(u =>
    u.name.toLowerCase().includes(search) ||
    u.role.toLowerCase().includes(search) ||
    u.plant.toLowerCase().includes(search)
  );

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:20px;">No users found matching query.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(u => `
    <tr>
      <td><strong>${u.userId}</strong></td>
      <td><strong>${u.name}</strong></td>
      <td><span class="wms-badge" style="background:#1e293b; color:#ffffff; font-weight:700;">${u.role}</span></td>
      <td>${u.plant}</td>
      <td>${u.shift}</td>
      <td><span class="wms-badge badge-available">${u.status}</span></td>
      <td><span style="font-family:monospace; color:#2563eb;">${u.assignedDevice}</span></td>
    </tr>
  `).join('');
}

function openAddUserModal() {
  document.getElementById('modal-add-user')?.classList.add('active');
}

function closeAddUserModal() {
  document.getElementById('modal-add-user')?.classList.remove('active');
}

function submitNewUser() {
  const name = document.getElementById('user-form-name')?.value.trim();
  const role = document.getElementById('user-form-role')?.value;
  const plant = document.getElementById('user-form-plant')?.value;
  const shift = document.getElementById('user-form-shift')?.value;

  if (!name) { alert('Please enter user full name.'); return; }

  const newUser = {
    userId: `USR-${Math.floor(100 + Math.random() * 900)}`,
    name,
    role,
    plant,
    shift,
    status: 'ACTIVE',
    assignedDevice: `TC57-DEV-${Math.floor(10 + Math.random() * 90)}`
  };

  if (!window.wms.userMaster) window.wms.userMaster = [];
  window.wms.userMaster.unshift(newUser);
  saveWMSState(window.wms);
  closeAddUserModal();
  renderUserSecurityMaster();
  alert(`✅ Staff member ${name} registered with role ${role}!`);
}

// 4. Handling Units (Plant-Filtered + Search + CRUD)
function renderHUTable() {
  const tbody = document.getElementById('hu-table-body');
  if (!tbody) return;

  const search = (document.getElementById('search-hu')?.value || '').toLowerCase();
  const list = window.wms.handlingUnits
    .filter(hu => isPlantMatch(hu.plant, hu.location))
    .filter(hu => 
      hu.huNumber.toLowerCase().includes(search) || 
      hu.materialCode.toLowerCase().includes(search) || 
      hu.location.toLowerCase().includes(search)
    );

  tbody.innerHTML = list.map(hu => `
    <tr>
      <td><strong>${hu.huNumber}</strong></td>
      <td><span class="wms-badge badge-fifo-p${hu.fifoPriority || 3}">${hu.fifoPriority ? `P${hu.fifoPriority}` : 'P-'}</span></td>
      <td><strong>${hu.materialCode}</strong></td>
      <td>${hu.description}</td>
      <td><strong>${hu.quantity} ${hu.uom}</strong></td>
      <td><span class="wms-badge" style="background:#f1f5f9; color:#0f172a; font-family:monospace;">${hu.location}</span></td>
      <td>${hu.batch}</td>
      <td>${hu.receiptDate}</td>
      <td><span class="wms-badge badge-${hu.status.toLowerCase().replace(/\s+/g, '')}">${hu.status}</span></td>
      <td>
        <button class="btn-wms btn-wms-secondary" style="padding:2px 6px; font-size:11px;" onclick="openLabelPreview('${hu.huNumber}')">🏷️ Label</button>
        <button class="btn-wms btn-wms-danger" style="padding:2px 6px; font-size:11px;" onclick="deleteHandlingUnit('${hu.huNumber}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openAddHUModal() {
  document.getElementById('modal-add-hu').classList.add('active');
}

function closeAddHUModal() {
  document.getElementById('modal-add-hu').classList.remove('active');
}

function submitNewHU() {
  const matCode = document.getElementById('hu-form-mat').value;
  const qty = parseInt(document.getElementById('hu-form-qty').value, 10);
  const location = document.getElementById('hu-form-loc').value;
  const batch = document.getElementById('hu-form-batch').value;
  const mat = window.wms.materials.find(m => m.code === matCode);
  const plant = (window.wms.activePlant === 'P2' || window.wms.activePlant.includes('Plant 2')) ? 'HMSI Narsapur Plant 2' : 'HMSI Narsapur Plant 1';

  const newHU = {
    huNumber: `HU-HND-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    lpn: `LPN-HND-${Math.floor(100000 + Math.random() * 900000)}`,
    materialCode: matCode,
    description: mat ? mat.description : matCode,
    quantity: qty,
    uom: mat ? mat.uom : 'EA',
    location: location || 'RM-A01-R01-S01-B01',
    batch: batch || 'BAT-HND-2026-09-23-01',
    plant,
    receiptDate: '23-Sep-2026',
    fifoDate: '23-Sep-2026',
    fifoPriority: 3,
    status: 'AVAILABLE',
    supplier: 'Honda OEM Certified Supplier',
    poNumber: 'PO-HND-MANUAL',
    condition: 'Good',
    agingBucket: '0–7 Days'
  };

  window.wms.handlingUnits.unshift(newHU);
  saveWMSState(window.wms);
  closeAddHUModal();
  renderAllWMSViews();
  alert(`✅ Created Honda Handling Unit ${newHU.huNumber} (${qty} EA)!`);
}

function deleteHandlingUnit(huNo) {
  if (!confirm(`Delete Handling Unit ${huNo}?`)) return;
  window.wms.handlingUnits = window.wms.handlingUnits.filter(h => h.huNumber !== huNo);
  saveWMSState(window.wms);
  renderAllWMSViews();
}

// 4B. Inbound Discrepancies & Truck Shortages
function renderDiscrepanciesTable() {
  const tbody = document.getElementById('discrepancies-table-body');
  if (!tbody) return;

  const search = (document.getElementById('search-discrepancies')?.value || '').toLowerCase();
  const list = (window.wms.discrepancies || [])
    .filter(d => 
      (d.issueId && d.issueId.toLowerCase().includes(search)) ||
      (d.vehicleNo && d.vehicleNo.toLowerCase().includes(search)) ||
      (d.poNumber && d.poNumber.toLowerCase().includes(search)) ||
      (d.supplier && d.supplier.toLowerCase().includes(search)) ||
      (d.materialCode && d.materialCode.toLowerCase().includes(search))
    );

  const badgeEl = document.getElementById('sidebar-disc-count');
  if (badgeEl) badgeEl.textContent = (window.wms.discrepancies || []).length.toString();

  tbody.innerHTML = list.map(d => `
    <tr>
      <td><strong style="color:#dc2626;">${d.issueId}</strong><div style="font-size:10px; color:#64748b;">${d.timestamp || ''}</div></td>
      <td><strong>${d.vehicleNo}</strong><div style="font-size:10px; color:#64748b;">${d.reportedBy || 'Dock Scanner'}</div></td>
      <td><strong>${d.poNumber}</strong><div style="font-size:10px; color:#64748b;">ASN: ${d.asnNumber}</div></td>
      <td>${d.supplier}</td>
      <td><strong>${d.materialCode}</strong><div style="font-size:10px; color:#64748b;">${d.materialDescription}</div></td>
      <td>${d.expectedQty} ${d.uom}</td>
      <td><strong style="color:#16a34a;">${d.receivedGoodQty} ${d.uom}</strong></td>
      <td><span class="wms-badge badge-fifo-p1" style="font-weight:700;">-${d.shortageDamagedQty} ${d.uom}</span></td>
      <td><span class="wms-badge" style="background:#fee2e2; color:#b91c1c;">${d.discrepancyType}</span></td>
      <td><span class="wms-badge" style="background:#fef3c7; color:#92400e; font-family:monospace;">${d.quarantineBin || 'QC-REJECT-ZONE-01'}</span></td>
      <td>
        <span class="wms-badge badge-allocated">${d.status}</span>
        <div style="font-size:10px; color:#2563eb; font-weight:600; margin-top:2px;">${d.sapDebitNote || 'Pending Debit Note'}</div>
      </td>
    </tr>
  `).join('');
}

// 5. Material Requisitions (Plant-Filtered + Search + CRUD)
function renderRequisitions() {
  const tbody = document.getElementById('requisition-table-body');
  if (!tbody) return;

  const search = (document.getElementById('search-mr')?.value || '').toLowerCase();
  const list = window.wms.materialRequisitions
    .filter(mr => isPlantMatch(mr.plant))
    .filter(mr => 
      mr.mrNumber.toLowerCase().includes(search) || 
      mr.materialCode.toLowerCase().includes(search) || 
      mr.productionLine.toLowerCase().includes(search)
    );

  tbody.innerHTML = list.map(mr => `
    <tr>
      <td><strong>${mr.mrNumber}</strong></td>
      <td>${mr.plant} • <strong>${mr.productionLine}</strong></td>
      <td><strong>${mr.materialCode}</strong></td>
      <td>${mr.materialDescription}</td>
      <td><strong>${mr.requiredQuantity} ${mr.uom}</strong></td>
      <td><span class="wms-badge ${mr.priority === 'Urgent' ? 'badge-fifo-p1' : 'badge-reserved'}">${mr.priority}</span></td>
      <td><span class="wms-badge badge-allocated">${mr.status}</span></td>
      <td>
        ${mr.status === 'Submitted' ? `<button class="btn-wms btn-wms-primary" style="padding:2px 6px; font-size:11px;" onclick="executeFIFOAllocation('${mr.mrNumber}')">⚡ FIFO Allocate</button>` : ''}
        ${mr.status === 'FIFO Allocated' ? `<button class="btn-wms btn-wms-success" style="padding:2px 6px; font-size:11px;" onclick="generatePickListFromMR('${mr.mrNumber}')">📋 Gen Pick List</button>` : ''}
        <button class="btn-wms btn-wms-danger" style="padding:2px 6px; font-size:11px;" onclick="deleteMaterialRequisition('${mr.mrNumber}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openAddMRModal() {
  document.getElementById('modal-add-mr').classList.add('active');
}

function closeAddMRModal() {
  document.getElementById('modal-add-mr').classList.remove('active');
}

function submitNewMaterialRequisition() {
  const plant = document.getElementById('mr-form-plant').value;
  const line = document.getElementById('mr-form-line').value;
  const matCode = document.getElementById('mr-form-mat').value;
  const qty = parseInt(document.getElementById('mr-form-qty').value, 10);
  const priority = document.getElementById('mr-form-priority').value;
  const mat = window.wms.materials.find(m => m.code === matCode);

  const newMR = {
    mrNumber: `MR-HND-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    plant,
    productionLine: line,
    materialCode: matCode,
    materialDescription: mat ? mat.description : matCode,
    requiredQuantity: qty,
    uom: mat ? mat.uom : 'EA',
    requiredDate: '23-Sep-2026 16:00',
    priority,
    requestedBy: `${line} Assembly Supervisor`,
    reason: 'Honda assembly shift production schedule',
    status: 'Submitted',
    allocations: []
  };

  window.wms.materialRequisitions.unshift(newMR);
  saveWMSState(window.wms);
  closeAddMRModal();
  renderAllWMSViews();
  alert(`✅ Submitted Requisition ${newMR.mrNumber} for ${line}!`);
}

function deleteMaterialRequisition(mrNo) {
  if (!confirm(`Cancel & Delete Material Requisition ${mrNo}?`)) return;
  window.wms.materialRequisitions = window.wms.materialRequisitions.filter(m => m.mrNumber !== mrNo);
  saveWMSState(window.wms);
  renderAllWMSViews();
}

// 6. Purchase Orders (Plant-Filtered + Search + CRUD)
function renderPOTable() {
  const tbody = document.getElementById('po-table-body');
  if (!tbody) return;

  const search = (document.getElementById('search-po')?.value || '').toLowerCase();
  const list = window.wms.purchaseOrders
    .filter(po => isPlantMatch(po.plant))
    .filter(po => 
      po.poNumber.toLowerCase().includes(search) || 
      po.supplier.toLowerCase().includes(search) || 
      po.materialCode.toLowerCase().includes(search)
    );

  tbody.innerHTML = list.map(po => `
    <tr>
      <td><strong>${po.poNumber}</strong></td>
      <td>${po.supplier}</td>
      <td>${po.plant}</td>
      <td><strong>${po.materialCode}</strong> (${po.materialDescription})</td>
      <td><strong>${po.orderedQty} ${po.uom}</strong></td>
      <td>${po.receivedQty} ${po.uom}</td>
      <td>${po.openQty} ${po.uom}</td>
      <td>${po.expectedReceiptDate}</td>
      <td><span class="wms-badge badge-available">${po.status}</span></td>
      <td>
        <button class="btn-wms btn-wms-danger" style="padding:2px 6px; font-size:11px;" onclick="deletePurchaseOrder('${po.poNumber}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openAddPOModal() {
  document.getElementById('modal-add-po').classList.add('active');
}

function closeAddPOModal() {
  document.getElementById('modal-add-po').classList.remove('active');
}

function submitNewPurchaseOrder() {
  const supplier = document.getElementById('po-form-supplier').value;
  const matCode = document.getElementById('po-form-mat').value;
  const qty = parseInt(document.getElementById('po-form-qty').value, 10);
  const mat = window.wms.materials.find(m => m.code === matCode);
  const plant = (window.wms.activePlant === 'P2' || window.wms.activePlant.includes('Plant 2')) ? 'HMSI Narsapur Plant 2' : 'HMSI Narsapur Plant 1';

  const newPO = {
    poNumber: `PO-HND-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    supplier,
    plant,
    orderDate: '23-Sep-2026',
    expectedReceiptDate: '28-Sep-2026',
    status: 'Approved',
    materialCode: matCode,
    materialDescription: mat ? mat.description : matCode,
    orderedQty: qty,
    receivedQty: 0,
    openQty: qty,
    uom: mat ? mat.uom : 'EA',
    unitPrice: mat ? mat.unitPrice : 1500.00
  };

  window.wms.purchaseOrders.unshift(newPO);
  saveWMSState(window.wms);
  closeAddPOModal();
  renderAllWMSViews();
  alert(`✅ Created Honda Purchase Order ${newPO.poNumber} with ${supplier}!`);
}

function deletePurchaseOrder(poNo) {
  if (!confirm(`Delete Purchase Order ${poNo}?`)) return;
  window.wms.purchaseOrders = window.wms.purchaseOrders.filter(p => p.poNumber !== poNo);
  saveWMSState(window.wms);
  renderAllWMSViews();
}

// 7. Dock Board (Plant-Filtered)
function renderDockBoard() {
  const container = document.getElementById('dock-board-container');
  if (!container) return;

  const list = window.wms.docks.filter(d => isPlantMatch(d.plant));

  container.innerHTML = list.map(d => {
    const isFree = d.status === 'Available';
    const isQC = d.status === 'QC Inspection';

    return `
      <div class="dock-card ${isFree ? 'free' : (isQC ? 'qc' : 'occupied')}">
        <div class="dock-number">
          <span>${d.name}</span>
          <span class="wms-badge ${isFree ? 'badge-available' : (isQC ? 'badge-qchold' : 'badge-allocated')}">${d.status}</span>
        </div>
        <div style="font-size:12px; color:#334155; margin-bottom:4px;"><strong>Vehicle:</strong> ${d.vehicle}</div>
        <div style="font-size:12px; color:#64748b; margin-bottom:4px;"><strong>Supplier:</strong> ${d.supplier}</div>
        <div style="font-size:12px; color:#64748b;"><strong>PO:</strong> ${d.po}</div>
      </div>
    `;
  }).join('');
}

function renderReceivingWorkstation() {
  const ge = window.wms.gateEntries.find(g => isPlantMatch(g.plant, g.dock)) || window.wms.gateEntries[0];
  const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  if (ge) {
    setEl('recv-ge-no', ge.gateEntryNo);
    setEl('recv-po-no', ge.poNumber);
    setEl('recv-asn-no', ge.asnNumber);
    setEl('recv-supplier', ge.supplier);
    setEl('recv-vehicle', ge.vehicleNo);
    setEl('recv-dock', ge.dock);
  }
}

function renderPutawayTasks() {
  const tbody = document.getElementById('putaway-table-body');
  if (!tbody) return;

  const list = window.wms.putawayTasks.filter(t => isPlantMatch(t.suggestedLocation, t.sourceLocation));

  tbody.innerHTML = list.map(t => `
    <tr>
      <td><strong>${t.taskId}</strong></td>
      <td><strong>${t.huNumber}</strong></td>
      <td>${t.materialCode}</td>
      <td><strong>${t.quantity} ${t.uom}</strong></td>
      <td>${t.sourceLocation}</td>
      <td><strong style="color:#2563eb;">${t.suggestedLocation}</strong></td>
      <td><span class="wms-badge badge-${t.status === 'Completed' ? 'available' : 'allocated'}">${t.status}</span></td>
      <td>
        ${t.status !== 'Completed' ? `<button class="btn-wms btn-wms-success" style="padding:4px 8px; font-size:11px;" onclick="confirmPutawayTask('${t.taskId}')">Confirm Putaway</button>` : '✓ Stored'}
      </td>
    </tr>
  `).join('');
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-table-body');
  if (!tbody) return;

  const search = (document.getElementById('search-inventory')?.value || '').toLowerCase();
  const list = window.wms.materials.filter(m => 
    m.code.toLowerCase().includes(search) || 
    m.description.toLowerCase().includes(search) || 
    m.category.toLowerCase().includes(search)
  );

  tbody.innerHTML = list.map(m => {
    const isShort = m.availableStock < m.minStock;
    return `
      <tr style="${isShort ? 'background: #fef2f2;' : ''}">
        <td><strong>${m.code}</strong></td>
        <td>${m.description}</td>
        <td>${m.category}</td>
        <td><strong style="color:#15803d;">${m.availableStock} ${m.uom}</strong></td>
        <td><span style="color:#7e22ce; font-weight:bold;">${m.allocatedStock}</span></td>
        <td>${m.reservedStock}</td>
        <td>${m.blockedStock + m.quarantineStock}</td>
        <td>${m.minStock} / ${m.reorderPoint}</td>
        <td><span class="wms-badge ${isShort ? 'badge-damaged' : 'badge-available'}">${isShort ? 'SHORTAGE' : 'HEALTHY'}</span></td>
        <td>
          <button class="btn-wms btn-wms-primary" style="padding:3px 8px; font-size:11px;" onclick="showMaterialFIFO('${m.code}')">FIFO Queue</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderWarehouseMap() {
  const container = document.getElementById('warehouse-map-container');
  if (!container) return;

  const bays = [
    { code: 'A01 (Keihin Powertrain)', util: '85%', status: 'util-high', tag: 'High Activity' },
    { code: 'A02 (Mitsuba Starters)', util: '65%', status: 'util-norm', tag: 'Normal' },
    { code: 'A03 (Throttle Bodies)', util: '92%', status: 'util-high', tag: 'Critical 92%' },
    { code: 'A04 (Bando V-Belts)', util: '70%', status: 'util-norm', tag: 'Available' },
    { code: 'B01 (Nissin Brakes)', util: '75%', status: 'util-norm', tag: 'Normal' },
    { code: 'B02 (Keihin ECU Lab)', util: '88%', status: 'util-high', tag: 'ESD Area' },
    { code: 'C01 (Showa Forks)', util: '58%', status: 'util-norm', tag: 'Normal' },
    { code: 'D01 (MRF Tyres & Enkei)', util: '81%', status: 'util-med', tag: 'Normal' }
  ];

  container.innerHTML = bays.map(b => `
    <div class="map-bay ${b.status}" onclick="alert('HMSI Storage Bay: ${b.code}\\nUtilization: ${b.util}\\nCapacity: 150 HUs')">
      <div class="bay-code">${b.code}</div>
      <div class="bay-util">${b.util}</div>
      <div class="bay-tag">${b.tag}</div>
    </div>
  `).join('');
}

function renderFIFOQueue() {
  const tbody = document.getElementById('fifo-table-body');
  if (!tbody) return;

  const keihinHUs = window.wms.handlingUnits
    .filter(h => isPlantMatch(h.plant, h.location))
    .filter(h => h.materialCode === 'HND-THROT-KEIHIN')
    .sort((a,b) => (a.fifoPriority || 99) - (b.fifoPriority || 99));

  tbody.innerHTML = keihinHUs.map(hu => `
    <tr>
      <td><span class="wms-badge badge-fifo-p${hu.fifoPriority || 3}">PRIORITY ${hu.fifoPriority || 3}</span></td>
      <td><strong>${hu.huNumber}</strong></td>
      <td>${hu.materialCode} - ${hu.description}</td>
      <td>${hu.receiptDate}</td>
      <td><strong>${hu.quantity} ${hu.uom}</strong></td>
      <td><code>${hu.location}</code></td>
      <td>${hu.fifoPriority === 1 ? '<strong style="color:#dc2626;">★ PICK FIRST</strong>' : 'Secondary'}</td>
    </tr>
  `).join('');
}

function renderStockAging() {
  const tbody = document.getElementById('stock-aging-table-body');
  if (!tbody) return;

  const list = window.wms.handlingUnits.filter(hu => isPlantMatch(hu.plant, hu.location));

  tbody.innerHTML = list.map(hu => `
    <tr>
      <td><strong>${hu.materialCode}</strong></td>
      <td>${hu.description}</td>
      <td>${hu.huNumber}</td>
      <td>${hu.receiptDate}</td>
      <td><span class="wms-badge" style="background:#f8fafc; border:1px solid #cbd5e1;">${hu.agingBucket || '0–7 Days'}</span></td>
      <td><strong>${hu.quantity} ${hu.uom}</strong></td>
      <td><code>${hu.location}</code></td>
      <td><span class="wms-badge badge-available">${hu.status}</span></td>
    </tr>
  `).join('');
}

function renderPickLists() {
  const tbody = document.getElementById('pick-list-table-body');
  if (!tbody) return;

  const list = window.wms.pickLists.filter(pl => isPlantMatch(pl.plant, pl.stagingLocation));

  tbody.innerHTML = list.map(pl => `
    <tr>
      <td><strong>${pl.pickListNo}</strong></td>
      <td>${pl.mrNumber}</td>
      <td>${pl.plant} - ${pl.line}</td>
      <td>${pl.picker}</td>
      <td><code>${pl.stagingLocation}</code></td>
      <td><span class="wms-badge badge-${pl.status === 'Completed' ? 'available' : 'allocated'}">${pl.status}</span></td>
      <td>
        ${pl.status !== 'Completed' ? `<button class="btn-wms btn-wms-success" style="padding:4px 8px; font-size:11px;" onclick="confirmPickListExecution('${pl.pickListNo}')">Confirm Pick & Stage</button>` : '✓ Staged'}
      </td>
    </tr>
  `).join('');
}

function renderStagingTable() {
  const tbody = document.getElementById('staging-table-body');
  if (!tbody) return;

  const stagedHUs = window.wms.handlingUnits
    .filter(h => isPlantMatch(h.plant, h.location))
    .filter(h => h.location.startsWith('STG-') || h.status === 'ALLOCATED');

  tbody.innerHTML = stagedHUs.map(hu => `
    <tr>
      <td><code>${hu.location}</code></td>
      <td><strong>${hu.huNumber}</strong></td>
      <td><strong>${hu.materialCode}</strong></td>
      <td>${hu.description}</td>
      <td><strong>${hu.quantity} ${hu.uom}</strong></td>
      <td><span class="wms-badge badge-allocated">Staged for Line</span></td>
      <td>
        <button class="btn-wms btn-wms-primary" style="padding:4px 8px; font-size:11px;" onclick="dispatchToProductionLine('${hu.huNumber}')">🚚 Deliver to Line</button>
      </td>
    </tr>
  `).join('');
}

function renderLineSupplyTable() {
  const tbody = document.getElementById('line-supply-table-body');
  if (!tbody) return;

  const list = window.wms.lineSupplyRequests.filter(ls => isPlantMatch(ls.plant, ls.stagingLocation));

  tbody.innerHTML = list.map(ls => `
    <tr>
      <td><strong>${ls.lsrNumber}</strong></td>
      <td>${ls.plant} • <strong>${ls.productionLine}</strong></td>
      <td><strong>${ls.materialCode}</strong></td>
      <td><strong>${ls.quantity} EA</strong></td>
      <td><code>${ls.stagingLocation}</code></td>
      <td><span class="wms-badge badge-available">${ls.status}</span></td>
      <td>
        ${ls.status !== 'Acknowledged' ? `<button class="btn-wms btn-wms-success" style="padding:4px 8px; font-size:11px;" onclick="confirmLineReceipt('${ls.lsrNumber}')">Confirm Line Receipt</button>` : '✓ Received by Line'}
      </td>
    </tr>
  `).join('');
}

function renderTransfersTable() {
  const tbody = document.getElementById('transfers-table-body');
  if (!tbody) return;

  tbody.innerHTML = window.wms.stockTransfers.map(t => `
    <tr>
      <td><strong>${t.transferOrderNo}</strong></td>
      <td>${t.sourcePlant} (<code>${t.sourceLocation}</code>)</td>
      <td><strong>${t.destinationPlant}</strong> (<code>${t.destinationLocation}</code>)</td>
      <td><strong>${t.materialCode}</strong></td>
      <td><strong>${t.quantity} ${t.uom}</strong></td>
      <td><span class="wms-badge badge-intransit">${t.status}</span></td>
      <td>${t.approvedBy}</td>
    </tr>
  `).join('');
}

function renderReplenishmentTable() {
  const tbody = document.getElementById('replenishment-table-body');
  if (!tbody) return;

  const lowStock = window.wms.materials.filter(m => m.availableStock < m.minStock);

  tbody.innerHTML = lowStock.map(m => {
    const shortage = m.minStock - m.availableStock;
    return `
      <tr>
        <td><strong>${m.code}</strong></td>
        <td>${m.description}</td>
        <td>${m.minStock} EA</td>
        <td><strong style="color:#dc2626;">${m.availableStock} EA</strong></td>
        <td><strong>${shortage} EA</strong></td>
        <td><strong style="color:#2563eb;">${m.suggestedReplenishment} EA</strong></td>
        <td><span class="wms-badge badge-damaged">SHORTAGE DETECTED</span></td>
        <td>
          <button class="btn-wms btn-wms-primary" style="padding:4px 8px; font-size:11px;" onclick="createPRFromReplenishment('${m.code}', ${m.suggestedReplenishment})">⚡ Create PO</button>
        </td>
      </tr>
    `;
  }).join('');
}

function createPRFromReplenishment(matCode, qty) {
  const newPO = {
    poNumber: `PO-HND-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    supplier: 'Keihin India Electronics Pvt Ltd',
    plant: 'HMSI Narsapur Plant 1',
    orderDate: '23-Sep-2026',
    expectedReceiptDate: '26-Sep-2026',
    status: 'Approved',
    materialCode: matCode,
    materialDescription: 'Keihin Master ECU with OBD2 & eSP Logic',
    orderedQty: qty,
    receivedQty: 0,
    openQty: qty,
    uom: 'EA',
    unitPrice: 4200.00
  };
  window.wms.purchaseOrders.unshift(newPO);
  saveWMSState(window.wms);
  renderAllWMSViews();
  alert(`⚡ Reorder PO ${newPO.poNumber} generated for ${qty} EA of ${matCode}!`);
  showWmsView('po');
}

function renderGRNTable() {
  const tbody = document.getElementById('grn-table-body');
  if (!tbody) return;

  tbody.innerHTML = window.wms.goodsReceiptNotes.map(g => `
    <tr>
      <td><strong>${g.grnNumber}</strong></td>
      <td>${g.poNumber}</td>
      <td>${g.supplier}</td>
      <td>${g.receivedHUs} HUs</td>
      <td><strong>${g.acceptedQuantity} ${g.uom}</strong></td>
      <td><span class="wms-badge badge-available">${g.status}</span></td>
      <td>${g.receiptTimestamp}</td>
      <td>
        <button class="btn-wms btn-wms-secondary" style="padding:2px 6px; font-size:11px;" onclick="alert('GRN: ${g.grnNumber}\\nAccepted: ${g.acceptedQuantity}\\nInspector: ${g.inspector}')">📄 View</button>
      </td>
    </tr>
  `).join('');
}

function renderCycleCountTable() {
  const tbody = document.getElementById('cycle-count-table-body');
  if (!tbody) return;

  tbody.innerHTML = window.wms.cycleCounts.map(cc => `
    <tr>
      <td><strong>${cc.countId}</strong></td>
      <td><code>${cc.binLocation}</code></td>
      <td><strong>${cc.material}</strong></td>
      <td>${cc.systemQty} EA</td>
      <td><strong>${cc.physicalQty} EA</strong></td>
      <td><strong style="color:${cc.variance === 0 ? '#15803d' : '#dc2626'};">${cc.variance} EA</strong></td>
      <td>${cc.counter}</td>
      <td><span class="wms-badge badge-available">${cc.status}</span></td>
    </tr>
  `).join('');
}

function renderAuditTrailTable() {
  const tbody = document.getElementById('audit-trail-table-body');
  if (!tbody) return;

  tbody.innerHTML = window.wms.auditTrail.map(a => `
    <tr>
      <td>${a.timestamp}</td>
      <td><strong>${a.user}</strong></td>
      <td>${a.role}</td>
      <td><span class="wms-badge" style="background:#0f172a; color:#fff;">${a.transaction}</span></td>
      <td>${a.entity}</td>
      <td>${a.reference}</td>
      <td>${a.change}</td>
      <td><small style="color:#64748b;">${a.device}</small></td>
    </tr>
  `).join('');
}

// Guided Demo Steppers
function runDemoScenario1() {
  alert('🚀 Starting Honda HMSI End-to-End WMS Scenario:\nPO-HND-2026-00421 (500 EA Keihin Throttle Bodies for Activa 6G)\nFollow the guided steps through Gate Entry, Inbound Receiving, Putaway, FIFO Allocation, Picking, Staging, and Line 1 Delivery!');
  showWmsView('gateEntry');
}

function demoStepReceivePO() {
  const ge = window.wms.gateEntries.find(g => g.gateEntryNo === 'GE-HND-2026-009821');
  if (ge) {
    ge.status = 'Receiving In Progress';
    ge.receivedHUs = 5;
    ge.receivedQty = 498;
  }

  const newHUs = [
    { huNumber: 'HU-HND-2026-009841', lpn: 'LPN-HND-009841', materialCode: 'HND-THROT-KEIHIN', description: 'Keihin PGM-FI Throttle Body', quantity: 100, uom: 'EA', location: 'Dock 04', plant: 'HMSI Narsapur Plant 1', warehouse: 'RM-WH-01', batch: 'BAT-KEI-2026-09-23-01', receiptDate: '23-Sep-2026', fifoDate: '23-Sep-2026', fifoPriority: 4, status: 'QUALITY HOLD', supplier: 'Keihin India Electronics Pvt Ltd', poNumber: 'PO-HND-2026-00421', condition: 'Good' },
    { huNumber: 'HU-HND-2026-009842', lpn: 'LPN-HND-009842', materialCode: 'HND-THROT-KEIHIN', description: 'Keihin PGM-FI Throttle Body', quantity: 98, uom: 'EA', location: 'Dock 04', plant: 'HMSI Narsapur Plant 1', warehouse: 'RM-WH-01', batch: 'BAT-KEI-2026-09-23-01', receiptDate: '23-Sep-2026', fifoDate: '23-Sep-2026', fifoPriority: 4, status: 'QUALITY HOLD', supplier: 'Keihin India Electronics Pvt Ltd', poNumber: 'PO-HND-2026-00421', condition: 'Good (2 Short)' }
  ];

  window.wms.handlingUnits.push(...newHUs);

  window.wms.goodsReceiptNotes.unshift({
    grnNumber: 'GRN-HND-2026-006821',
    poNumber: 'PO-HND-2026-00421',
    supplier: 'Keihin India Electronics Pvt Ltd',
    receivedHUs: 5,
    acceptedQuantity: 498,
    uom: 'EA',
    status: 'Posted to SAP ERP',
    receiptTimestamp: '23-Sep-2026 09:35',
    inspector: 'Rajesh Quality Lead'
  });

  window.wms.putawayTasks.unshift(
    { taskId: 'PUT-HND-004', huNumber: 'HU-HND-2026-009841', materialCode: 'HND-THROT-KEIHIN', quantity: 100, uom: 'EA', sourceLocation: 'Dock 04', suggestedLocation: 'RM-A03-R04-S02-B05', status: 'Open' }
  );

  saveWMSState(window.wms);
  renderAllWMSViews();
  alert('✅ Inbound Received (498 EA Keihin Throttle Bodies, GRN-HND-2026-006821 created, Putaway Task generated)!');
  showWmsView('putaway');
}

function confirmPutawayTask(taskId) {
  const task = window.wms.putawayTasks.find(t => t.taskId === taskId);
  if (!task) return;

  task.status = 'Completed';
  const hu = window.wms.handlingUnits.find(h => h.huNumber === task.huNumber);
  if (hu) {
    hu.location = task.suggestedLocation;
    hu.status = 'AVAILABLE';
  }

  saveWMSState(window.wms);
  renderAllWMSViews();
  alert(`✅ Putaway Task ${taskId} Confirmed! Stored at ${task.suggestedLocation}.`);
}

function executeFIFOAllocation(mrNumber) {
  const mr = window.wms.materialRequisitions.find(m => m.mrNumber === mrNumber);
  if (!mr) return;

  mr.status = 'FIFO Allocated';
  const p1HU = window.wms.handlingUnits.find(h => h.materialCode === mr.materialCode && h.status === 'AVAILABLE' && h.fifoPriority === 1);
  if (p1HU) p1HU.status = 'ALLOCATED';

  const mat = window.wms.materials.find(m => m.code === mr.materialCode);
  if (mat) {
    mat.availableStock -= mr.requiredQuantity;
    mat.allocatedStock += mr.requiredQuantity;
  }

  saveWMSState(window.wms);
  renderAllWMSViews();
  alert(`⚡ Strict FIFO Allocation Complete for ${mrNumber}! Allocated ${mr.requiredQuantity} EA from oldest Batch P1.`);
}

function generatePickListFromMR(mrNumber) {
  const mr = window.wms.materialRequisitions.find(m => m.mrNumber === mrNumber);
  const newPL = {
    pickListNo: `PL-HND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    mrNumber,
    plant: mr ? mr.plant : 'HMSI Narsapur Plant 1',
    line: mr ? mr.productionLine : 'Line 1 (Activa 6G)',
    picker: 'Sanjay Verma (Op 01)',
    stagingLocation: 'STG-P1-L1',
    status: 'Ready for Picking'
  };

  window.wms.pickLists.unshift(newPL);
  if (mr) mr.status = 'Pick List Created';

  saveWMSState(window.wms);
  renderAllWMSViews();
  alert(`📋 Generated Pick List ${newPL.pickListNo} for ${newPL.line}!`);
  showWmsView('picking');
}

function confirmPickListExecution(plNo) {
  const pl = window.wms.pickLists.find(p => p.pickListNo === plNo);
  if (!pl) return;

  pl.status = 'Completed';
  window.wms.lineSupplyRequests.unshift({
    lsrNumber: `LSR-HND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    plant: pl.plant,
    productionLine: pl.line,
    materialCode: 'HND-THROT-KEIHIN',
    quantity: 80,
    stagingLocation: pl.stagingLocation,
    status: 'Ready for Delivery'
  });

  saveWMSState(window.wms);
  renderAllWMSViews();
  alert(`✅ Picking completed & Material Staged at ${pl.stagingLocation}! Line Delivery Request created.`);
  showWmsView('staging');
}

function dispatchToProductionLine(huNumber) {
  alert(`🚚 Dispatched Handling Unit ${huNumber} to Activa 6G Assembly Line buffer!`);
  showWmsView('linesupply');
}

function confirmLineReceipt(lsrNo) {
  const ls = window.wms.lineSupplyRequests.find(l => l.lsrNumber === lsrNo);
  if (ls) ls.status = 'Acknowledged';

  saveWMSState(window.wms);
  renderAllWMSViews();
  alert(`🎉 Line Supply Confirmed by Activa 6G Line Supervisor!\nMaterials consumed into assembly.`);
}

function openLabelPreview(huNumber) {
  const hu = window.wms.handlingUnits.find(h => h.huNumber === huNumber) || window.wms.handlingUnits[0];
  const container = document.getElementById('hu-label-content');
  if (!container) return;

  container.innerHTML = `
    <div class="hu-thermal-label">
      <div class="hu-label-header">
        <div style="font-size:10px; text-transform:uppercase;">HONDA MOTORCYCLE & SCOOTER INDIA • NARSAPUR PLANT</div>
        <div class="hu-label-title">OEM HANDLING UNIT / LPN</div>
        <div style="font-size:18px; font-weight:800;">${hu.huNumber}</div>
      </div>
      <div class="hu-barcode-box">
        [ QR CODE SIMULATION ]<br>
        *${hu.huNumber}*<br>
        <span style="font-size:9px;">SCAN WITH ZEBRA TC57 HANDHELD</span>
      </div>
      <div style="font-size:12px; line-height:1.6;">
        <strong>HONDA PART:</strong> ${hu.materialCode}<br>
        <strong>DESCRIPTION:</strong> ${hu.description}<br>
        <strong>QUANTITY:</strong> ${hu.quantity} ${hu.uom}<br>
        <strong>SUPPLIER:</strong> ${hu.supplier}<br>
        <strong>BATCH:</strong> ${hu.batch}<br>
        <strong>BIN LOCATION:</strong> ${hu.location}<br>
        <strong>FIFO DATE:</strong> ${hu.fifoDate} (PRIORITY: ${hu.fifoPriority || 'N/A'})<br>
        <strong>STATUS:</strong> <span style="background:#000; color:#fff; padding:1px 4px;">${hu.status}</span>
      </div>
    </div>
  `;

  document.getElementById('modal-label-preview').classList.add('active');
}

function closeLabelPreview() {
  document.getElementById('modal-label-preview').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('filter-plant-select');
  if (select && window.wms.activePlant) {
    select.value = window.wms.activePlant;
  }
  showWmsView('dashboard');
});
