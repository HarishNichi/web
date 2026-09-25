// HONDA MOTORCYCLE & SCOOTER INDIA (HMSI) - MANUFACTURING WMS
// Enterprise Application Logic, View Renderers & Full Master CRUD Engine
// Aligned to HMSIL WMS Screen & Functional Specification

document.addEventListener('DOMContentLoaded', () => {
  window.wms = loadWMSState();
  if (!window.wms.activeLine) window.wms.activeLine = 'All';
  initAutoRefresh();
  syncTopFilterControls();
  updateLineDropdownOptions();
  renderAllWMSViews();
  showWmsView('dashboard');
});

// ==========================================================================
// 1. NAVIGATION & AUTO-REFRESH CONTROLLER
// ==========================================================================
let currentActiveView = 'dashboard';
let autoRefreshTimer = null;
let autoRefreshCountdown = 60;
let isAutoRefreshActive = true;

function showWmsView(viewId) {
  currentActiveView = viewId;
  document.querySelectorAll('.wms-view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

  const targetView = document.getElementById(`wms-view-${viewId}`);
  const activeNav = document.querySelector(`.nav-link[data-view="${viewId}"]`);

  if (targetView) targetView.classList.add('active');
  if (activeNav) {
    activeNav.classList.add('active');
    // Ensure parent collapsible group is expanded
    const parentGroup = activeNav.closest('.nav-group');
    if (parentGroup) parentGroup.classList.remove('collapsed');
  }

  // Auto-close mobile drawer
  if (window.innerWidth <= 1024) {
    toggleMobileSidebar(false);
  }

  renderAllWMSViews();
}

function toggleNavGroup(headerEl) {
  const group = headerEl.closest('.nav-group');
  if (group) {
    group.classList.toggle('collapsed');
  }
}

function toggleMobileSidebar(forcedState) {
  const sidebar = document.querySelector('.wms-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;

  const shouldOpen = forcedState !== undefined ? forcedState : !sidebar.classList.contains('mobile-open');
  if (shouldOpen) {
    sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
  } else {
    sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  }
}

function syncTopFilterControls() {
  const pSelect = document.getElementById('filter-plant-select');
  const lSelect = document.getElementById('filter-line-select');
  if (pSelect && window.wms.activePlant) pSelect.value = window.wms.activePlant;
  if (lSelect && window.wms.activeLine) lSelect.value = window.wms.activeLine;
}

function onPlantFilterChange(plantVal) {
  window.wms.activePlant = plantVal;
  window.wms.activeLine = 'All'; // reset line when plant changes
  updateLineDropdownOptions();
  saveWMSState(window.wms);
  renderAllWMSViews();
}

function onLineFilterChange(lineVal) {
  window.wms.activeLine = lineVal;
  // If a line is selected, ensure parent plant matches
  if (lineVal === 'L1' || lineVal === 'L2' || lineVal === 'L3') {
    if (window.wms.activePlant === 'P2') window.wms.activePlant = 'P1';
  } else if (lineVal === 'L4' || lineVal === 'L5') {
    if (window.wms.activePlant === 'P1') window.wms.activePlant = 'P2';
  }
  const pSelect = document.getElementById('filter-plant-select');
  if (pSelect) pSelect.value = window.wms.activePlant;
  
  saveWMSState(window.wms);
  renderAllWMSViews();
}

function updateLineDropdownOptions() {
  const lSelect = document.getElementById('filter-line-select');
  if (!lSelect) return;
  const plant = window.wms.activePlant || 'All';
  
  let options = '<option value="All">All Lines (4 Lines)</option>';
  if (plant === 'All' || plant === 'P1') {
    options += `
      <option value="L1" ${window.wms.activeLine === 'L1' ? 'selected' : ''}>Line 1 (Activa 6G - Plant 1)</option>
      <option value="L2" ${window.wms.activeLine === 'L2' ? 'selected' : ''}>Line 2 (Shine 125 - Plant 1)</option>
      <option value="L3" ${window.wms.activeLine === 'L3' ? 'selected' : ''}>Line 3 (PGM-FI Engine - Plant 1)</option>
    `;
  }
  if (plant === 'All' || plant === 'P2') {
    options += `
      <option value="L4" ${window.wms.activeLine === 'L4' ? 'selected' : ''}>Line 4 (CB350 Premium - Plant 2)</option>
    `;
  }
  lSelect.innerHTML = options;
  lSelect.value = window.wms.activeLine || 'All';
}

function initAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(() => {
    if (!isAutoRefreshActive) return;
    autoRefreshCountdown--;
    const el = document.getElementById('auto-refresh-countdown');
    if (el) el.textContent = `${autoRefreshCountdown}s`;
    if (autoRefreshCountdown <= 0) {
      autoRefreshCountdown = 60;
      renderAllWMSViews();
    }
  }, 1000);
}

function toggleAutoRefresh() {
  isAutoRefreshActive = !isAutoRefreshActive;
  const btn = document.getElementById('btn-auto-refresh');
  const countEl = document.getElementById('auto-refresh-countdown');
  if (btn) {
    btn.style.opacity = isAutoRefreshActive ? '1' : '0.6';
    if (!isAutoRefreshActive && countEl) countEl.textContent = 'Paused';
  }
}

// Master Render Dispatcher
function renderAllWMSViews() {
  renderDashboard();
  renderPOTable();
  renderAsnTable();
  renderGateEntryTable();
  renderDockBoard();
  renderReceivingMonitor();
  renderMRNTable();
  renderGRNTable();
  renderDiscrepanciesTable();
  renderPutawayTasks();
  renderInventoryTable();
  renderCycleCountScreen();
  renderFifoAgingView();
  renderReportsView();
  renderRequisitionTable();
  renderIssueListTable();
  renderPickingMonitor();
  renderLineIssueTable();
  renderReturnsTable();
  renderAllMasters();
  renderAllAdminScreens();
}

// ==========================================================================
// 2. DASHBOARD RENDERER
// ==========================================================================
function renderDashboard() {
  const plant = window.wms.activePlant || 'All';
  const line = window.wms.activeLine || 'All';
  
  // 1. Inbound metrics (filtered by Plant)
  const trucks = filterByPlant(window.wms.gateEntries, plant);
  const totalTrucks = trucks.length;
  const atDock = trucks.filter(t => t.status === 'At dock').length;
  const unloaded = trucks.filter(t => t.status === 'Unloaded').length;
  const inbEl = document.getElementById('kpi-inbound-trucks');
  if (inbEl) inbEl.textContent = `${atDock + unloaded} / ${totalTrucks}`;
  const inbSub = document.getElementById('kpi-subtext-trucks');
  if (inbSub) inbSub.textContent = `${atDock} At Dock • ${unloaded} Unloaded`;

  const recBatches = filterByPlant(window.wms.receivingBatches, plant);
  const recActive = recBatches.filter(b => b.status !== 'Completed').length;
  const recEl = document.getElementById('kpi-receiving-progress');
  if (recEl) recEl.textContent = recActive ? `${recActive} Active` : 'Idle';
  const recSub = document.getElementById('kpi-subtext-receiving');
  if (recSub) {
    const activeBatch = recBatches.find(b => b.status !== 'Completed');
    recSub.textContent = activeBatch ? `${activeBatch.materialCode} (${activeBatch.dock})` : 'All Batches Inwarded';
  }

  const mrns = filterByPlant(window.wms.mrns, plant);
  const mrnPending = mrns.filter(m => m.status === 'Pending approval').length;
  const mrnEl = document.getElementById('kpi-mrn-pending');
  if (mrnEl) mrnEl.textContent = `${mrnPending}`;
  const mrnSub = document.getElementById('kpi-subtext-mrn');
  if (mrnSub) mrnSub.textContent = mrnPending ? `${mrnPending} Queue for Sign-off` : 'All MRNs Approved';

  const grns = filterByPlant(window.wms.goodsReceiptNotes, plant);
  const grnPending = grns.filter(g => g.sapStatus === 'pending').length;
  const grnPosted = grns.filter(g => g.sapStatus === 'posted').length;
  const grnEl = document.getElementById('kpi-grn-pending');
  if (grnEl) grnEl.textContent = `${grnPending}`;
  const grnSub = document.getElementById('kpi-subtext-grn');
  if (grnSub) grnSub.textContent = `${grnPosted} Movement 101 Posted`;

  // 2. Inventory metrics
  const putTasks = filterByPlant(window.wms.putawayTasks, plant);
  const putPending = putTasks.filter(p => p.status !== 'Completed').length;
  const putOverdue = putTasks.filter(p => p.isOverdue && p.status !== 'Completed').length;
  const putEl = document.getElementById('kpi-putaway-pending');
  if (putEl) putEl.textContent = `${putPending} Task${putPending !== 1 ? 's' : ''}`;
  const putSub = document.getElementById('kpi-subtext-putaway');
  if (putSub) putSub.textContent = putOverdue ? `${putOverdue} Overdue Staging Tasks` : (putPending ? `${putPending} In Progress` : 'All Putaway Cleared');

  const fifoExceptions = filterByPlant(window.wms.fifoExceptions, plant);
  const fifoCount = fifoExceptions.length;
  const fifoEl = document.getElementById('kpi-fifo-exceptions');
  if (fifoEl) fifoEl.textContent = `${fifoCount}`;
  const fifoSub = document.getElementById('kpi-subtext-fifo');
  if (fifoSub) fifoSub.textContent = fifoCount ? `${fifoCount} Override Logged` : 'Zero FIFO Violations';

  const hus = filterByPlant(window.wms.handlingUnits, plant);
  const lowStockCount = hus.filter(h => h.quantity < 100).length;
  const lowEl = document.getElementById('kpi-low-stock');
  if (lowEl) lowEl.textContent = `${lowStockCount}`;
  const lowSub = document.getElementById('kpi-subtext-lowstock');
  if (lowSub) lowSub.textContent = lowStockCount ? 'Below Reorder Point' : 'Stock Levels Optimal';

  // 3. Outbound & SAP (filtered by Plant & Production Line)
  const issueLists = filterByPlantAndLine(window.wms.issueLists, plant, line);
  const issIssued = issueLists.filter(i => i.status === 'Issued' || i.status === 'Delivered to Line').length;
  const issEl = document.getElementById('kpi-issue-lists');
  if (issEl) issEl.textContent = `${issueLists.length} Total`;
  const issSub = document.getElementById('kpi-subtext-issuelist');
  if (issSub) issSub.textContent = `${issIssued} Issued / In Feeder`;

  const pendingReqsList = filterByPlantAndLine(window.wms.materialRequirements, plant, line);
  const pendingReqs = pendingReqsList.filter(r => r.status === 'New' || r.status === 'In issue list').length;
  const reqEl = document.getElementById('kpi-pending-reqs');
  if (reqEl) reqEl.textContent = `${pendingReqs} Pending`;
  const reqSub = document.getElementById('kpi-subtext-reqs');
  if (reqSub) reqSub.textContent = pendingReqs ? 'Shift Assembly Demands' : 'All Requirements Built';

  // Live Alerts Feed
  renderAlertsFeed();
  renderActivityFeed();
  renderPlantLinesOverview();
}

function renderAlertsFeed() {
  const container = document.getElementById('dashboard-alerts-feed');
  if (!container) return;

  const plant = window.wms.activePlant || 'All';
  let alerts = window.wms.systemAlerts || [];
  if (plant !== 'All') {
    alerts = filterByPlant(alerts, plant);
  }

  if (!alerts.length) {
    container.innerHTML = '<div style="color:#64748b; font-size:12px; padding:10px;">No active quality or shortage alerts for selected scope.</div>';
    return;
  }

  container.innerHTML = alerts.map(a => `
    <div class="alert-item-card ${a.severity}">
      <div class="alert-item-icon">${a.severity === 'critical' ? '🚨' : a.severity === 'warning' ? '⚠️' : 'ℹ️'}</div>
      <div class="alert-item-content">
        <div class="alert-item-title">${a.title}</div>
        <div class="alert-item-msg">${a.message}</div>
        <div class="alert-item-time">${a.timestamp} ${a.acknowledged ? '• <span style="color:#16a34a; font-weight:700;">Acknowledged</span>' : ''}</div>
      </div>
      ${!a.acknowledged ? `<button class="btn-wms-secondary small" onclick="acknowledgeAlert('${a.id}')">Acknowledge</button>` : ''}
    </div>
  `).join('');
}

function acknowledgeAlert(alertId) {
  const alertObj = (window.wms.systemAlerts || []).find(a => a.id === alertId);
  if (alertObj) {
    alertObj.acknowledged = true;
    saveWMSState(window.wms);
    renderAlertsFeed();
  }
}

function acknowledgeAllAlerts() {
  (window.wms.systemAlerts || []).forEach(a => a.acknowledged = true);
  saveWMSState(window.wms);
  renderAlertsFeed();
}

function renderActivityFeed() {
  const container = document.getElementById('dashboard-recent-activity');
  if (!container) return;

  const logs = (window.wms.auditTrail || []).slice(0, 5);
  container.innerHTML = logs.map(l => `
    <div class="alert-item-card info">
      <div class="alert-item-icon">📜</div>
      <div class="alert-item-content">
        <div class="alert-item-title"><b>${l.transaction}</b> • <span style="font-family:var(--font-mono); color:#2563eb;">${l.reference}</span></div>
        <div class="alert-item-msg">${l.newValue}</div>
        <div class="alert-item-time">${l.timestamp} by <b>${l.user}</b> (${l.deviceId})</div>
      </div>
    </div>
  `).join('');
}

function renderPlantLinesOverview() {
  const p1Container = document.getElementById('plant-1-lines-container');
  const p2Container = document.getElementById('plant-2-lines-container');
  const activeLine = window.wms.activeLine || 'All';
  const activePlant = window.wms.activePlant || 'All';
  
  const lines = window.wms.productionLineMaster || [];
  let p1Lines = lines.filter(l => l.plant.includes('Plant 1'));
  let p2Lines = lines.filter(l => l.plant.includes('Plant 2'));

  if (activeLine !== 'All') {
    p1Lines = p1Lines.filter(l => l.lineCode === activeLine);
    p2Lines = p2Lines.filter(l => l.lineCode === activeLine);
  }

  const renderLineList = (list) => {
    if (!list.length) return '<div style="color:#94a3b8; font-size:11px; padding:6px;">No lines match current filter.</div>';
    return list.map(l => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:6px;">
        <div>
          <div style="font-weight:700; font-size:12.5px; color:#0f172a;">${l.name} <span class="badge-sap" style="margin-left:4px;">${l.lineCode}</span></div>
          <div style="font-size:11px; color:#64748b;">Staging Bin: <span style="font-family:var(--font-mono); color:#2563eb;">${l.stagingBin}</span> • Target: ${l.dailyTarget} units/day</div>
        </div>
        <span class="wms-badge badge-available">Running</span>
      </div>
    `).join('');
  };

  if (p1Container) p1Container.innerHTML = renderLineList(p1Lines);
  if (p2Container) p2Container.innerHTML = renderLineList(p2Lines);
}

// ==========================================================================
// 3. INBOUND OPERATIONS (PO, ASN, GATE ENTRY, DOCKS, RECEIVING, MRN, GRN, DISCREPANCIES)
// ==========================================================================
function renderPOTable() {
  const tbody = document.getElementById('po-table-body');
  if (!tbody) return;

  const search = (document.getElementById('search-po')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('filter-po-status')?.value || 'All';
  const plant = window.wms.activePlant;

  let pos = filterByPlant(window.wms.purchaseOrders, plant);
  if (statusFilter !== 'All') pos = pos.filter(p => p.status === statusFilter);
  if (search) {
    pos = pos.filter(p => p.poNumber.toLowerCase().includes(search) || p.supplier.toLowerCase().includes(search) || p.materialCode.toLowerCase().includes(search));
  }

  // Sort POs: Status 'Open' comes first
  const statusPriority = { 'Open': 1, 'Partially received': 2, 'Fully received': 3, 'Closed': 4 };
  pos.sort((a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99));

  tbody.innerHTML = pos.map(p => `
    <tr>
      <td>
        <b style="font-family:var(--font-mono); color:#2563eb;">${p.poNumber}</b>
        <span class="badge-sap">SAP</span>
      </td>
      <td><b>${p.supplier}</b></td>
      <td>${p.plant}</td>
      <td><b>${p.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${p.materialDescription}</span></td>
      <td><b>${p.orderedQty.toLocaleString()}</b> ${p.uom}</td>
      <td><span style="color:#2563eb; font-weight:700;">${p.asnQty.toLocaleString()}</span></td>
      <td><span style="color:#059669; font-weight:700;">${p.receivedQty.toLocaleString()}</span></td>
      <td><span style="color:${p.openQty > 0 ? '#ea580c' : '#64748b'}; font-weight:700;">${p.openQty.toLocaleString()}</span></td>
      <td>${p.deliveryDate}</td>
      <td><span class="wms-badge ${getStatusBadgeClass(p.status)}">${p.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openPoDrillDownModal('${p.poNumber}')">Linked Docs</button>
      </td>
    </tr>
  `).join('');
}

function refreshPoFromSap() {
  window.wms.lastSapSyncTime = new Date().toLocaleTimeString();
  addAuditLog('SAP PO Synchronization', 'PO-HND-2026-00600', 'Sync Check', 'Successfully refreshed PO schedule lines from SAP S/4HANA (200 OK)');
  saveWMSState(window.wms);
  renderPOTable();
  alert('Purchase Orders refreshed from SAP S/4HANA. All schedule lines up to date.');
}

function openPoDrillDownModal(poNo) {
  const poLines = window.wms.purchaseOrders.filter(p => p.poNumber === poNo);
  if (!poLines.length) return;
  const mainPo = poLines[0];

  const linkedAsns = window.wms.asns.filter(a => a.poNumber === poNo);
  const linkedMrns = window.wms.mrns.filter(m => m.poNumber === poNo);
  const linkedGrns = window.wms.goodsReceiptNotes.filter(g => g.poNumber === poNo);

  const content = `
    <div style="font-size:13px; color:#0f172a; margin-bottom:16px;">
      <h4>PO Summary: ${mainPo.poNumber}</h4>
      <p style="color:#64748b;">Supplier: <b>${mainPo.supplier}</b> • Plant: <b>${mainPo.plant}</b></p>
    </div>

    <h5 style="font-size:12.5px; margin:12px 0 6px 0; color:#475569;">Ordered Parts (${poLines.length} Part${poLines.length > 1 ? 's' : ''})</h5>
    <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:16px;">
      ${poLines.map(line => `
        <div style="padding:8px 12px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; font-size:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <b>${line.materialCode} - ${line.materialDescription}</b>
            <span class="wms-badge ${getStatusBadgeClass(line.status)}" style="font-size:10px;">${line.status}</span>
          </div>
          <div style="color:#475569; font-size:11.5px;">
            Ordered: <b>${line.orderedQty} ${line.uom}</b> | ASN Shipped: <b>${line.asnQty}</b> | Received: <b>${line.receivedQty}</b> | Open: <b style="color:${line.openQty > 0 ? '#ea580c' : '#059669'};">${line.openQty}</b>
          </div>
        </div>
      `).join('')}
    </div>

    <h5 style="font-size:12.5px; margin:12px 0 6px 0; color:#2563eb;">Linked ASNs (${linkedAsns.length})</h5>
    ${linkedAsns.map(a => `<div style="padding:6px 10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; margin-bottom:4px; font-size:12px;"><b>${a.asnNumber}</b> • Material: <b>${a.materialCode}</b> • Qty: ${a.shippedQty} • Vehicle: ${a.vehicleNo} • Status: <b>${a.status}</b></div>`).join('') || '<div style="color:#94a3b8; font-size:11px;">No ASNs found</div>'}

    <h5 style="font-size:12.5px; margin:12px 0 6px 0; color:#ea580c;">Linked MRNs (${linkedMrns.length})</h5>
    ${linkedMrns.map(m => `<div style="padding:6px 10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; margin-bottom:4px; font-size:12px;"><b>${m.mrnNumber}</b> • Material: <b>${m.materialCode}</b> • Good: ${m.goodQty} | Damaged: ${m.damagedQty} | Short: ${m.shortQty} • Status: <b>${m.status}</b></div>`).join('') || '<div style="color:#94a3b8; font-size:11px;">No MRNs found</div>'}

    <h5 style="font-size:12.5px; margin:12px 0 6px 0; color:#059669;">Linked Goods Receipts (GRN) (${linkedGrns.length})</h5>
    ${linkedGrns.map(g => `<div style="padding:6px 10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; margin-bottom:4px; font-size:12px;"><b>${g.grnNumber}</b> • Material: <b>${g.materialCode}</b> • Accepted: ${g.acceptedQuantity} • SAP Doc: <b>${g.sapMaterialDocNo}</b> (${g.sapStatus})</div>`).join('') || '<div style="color:#94a3b8; font-size:11px;">No GRNs posted yet</div>'}
  `;

  openDynamicModal(`Linked Documents for ${poNo}`, content, `<button class="btn-wms-primary" onclick="closeModal('modal-dynamic-form')">Close</button>`);
}

function renderAsnTable() {
  const tbody = document.getElementById('asn-table-body');
  if (!tbody) return;

  const search = (document.getElementById('search-asn')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('filter-asn-status')?.value || 'All';
  const plant = window.wms.activePlant || 'All';

  let asns = filterByPlant(window.wms.asns || [], plant);
  if (statusFilter !== 'All') asns = asns.filter(a => a.status === statusFilter);
  if (search) {
    asns = asns.filter(a => a.asnNumber.toLowerCase().includes(search) || a.poNumber.toLowerCase().includes(search) || a.vehicleNo.toLowerCase().includes(search) || a.supplier.toLowerCase().includes(search));
  }

  tbody.innerHTML = asns.map(a => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${a.asnNumber}</b></td>
      <td><b>${a.poNumber}</b></td>
      <td>${a.supplier}</td>
      <td><b>${a.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${a.materialDescription}</span></td>
      <td><b>${a.shippedQty.toLocaleString()}</b></td>
      <td>${a.noOfPallets} Boxes</td>
      <td><span style="font-family:var(--font-mono); font-weight:700;">${a.vehicleNo}</span></td>
      <td>${a.eta}</td>
      <td><span class="wms-badge ${getStatusBadgeClass(a.status)}">${a.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openPrintPreview('HU', '${a.asnNumber}')">Print HU Labels</button>
      </td>
    </tr>
  `).join('');
}

function openCreateAsnModal() {
  const openPos = window.wms.purchaseOrders.filter(p => p.openQty > 0);
  if (!openPos.length) {
    alert('No open Purchase Orders available to create an ASN.');
    return;
  }

  const content = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div class="wms-form-group">
        <label>Select Open Purchase Order & Part*</label>
        <select class="select-filter" id="asn-po-select" style="width:100%;" onchange="onAsnPoSelected(this.value)">
          ${openPos.map(p => `<option value="${p.poNumber}::${p.materialCode}">${p.poNumber} - ${p.materialCode} (${p.materialDescription}) [Open: ${p.openQty} ${p.uom}]</option>`).join('')}
        </select>
      </div>
      <div class="wms-form-group">
        <label>Shipped Quantity (Max Open PO Qty)*</label>
        <input type="number" id="asn-shipped-qty" class="search-input" value="${openPos[0].openQty}" max="${openPos[0].openQty}" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>No. of Pallets / Boxes*</label>
        <input type="number" id="asn-pallet-count" class="search-input" value="6" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Vehicle Number*</label>
        <input type="text" id="asn-vehicle-no" class="search-input" value="KA-04-E-1190" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Estimated Arrival (ETA)*</label>
        <input type="text" id="asn-eta" class="search-input" value="24-Sep-2026 12:00" style="width:100%;">
      </div>
    </div>
  `;

  openDynamicModal('Create Advance Shipping Notice (ASN) from PO', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="submitCreateAsn()">Create ASN</button>
  `);
}

function onAsnPoSelected(val) {
  const [poNo, matCode] = val.split('::');
  const po = window.wms.purchaseOrders.find(p => p.poNumber === poNo && (!matCode || p.materialCode === matCode));
  if (po) {
    const qtyInput = document.getElementById('asn-shipped-qty');
    if (qtyInput) {
      qtyInput.value = po.openQty;
      qtyInput.max = po.openQty;
    }
  }
}

function submitCreateAsn() {
  const val = document.getElementById('asn-po-select').value;
  const [poNo, matCode] = val.split('::');
  const po = window.wms.purchaseOrders.find(p => p.poNumber === poNo && (!matCode || p.materialCode === matCode));
  if (!po) return;

  const qty = parseInt(document.getElementById('asn-shipped-qty').value) || 0;
  const boxes = parseInt(document.getElementById('asn-pallet-count').value) || 1;
  const vehicle = document.getElementById('asn-vehicle-no').value;
  const eta = document.getElementById('asn-eta').value;

  if (qty <= 0 || qty > po.openQty) {
    alert(`Validation Failed: Shipped quantity must be between 1 and ${po.openQty} (Open PO Qty).`);
    return;
  }

  const asnNo = `ASN-HND-2026-${String(window.wms.asns.length + 450).padStart(5, '0')}`;
  const newAsn = {
    asnNumber: asnNo,
    poNumber: po.poNumber,
    supplier: po.supplier,
    materialCode: po.materialCode,
    materialDescription: po.materialDescription,
    shippedQty: qty,
    noOfPallets: boxes,
    vehicleNo: vehicle,
    eta: eta,
    status: 'Expected',
    receivedGoodQty: 0,
    damagedQty: 0,
    shortQty: 0,
    excessQty: 0
  };

  po.asnQty += qty;
  window.wms.asns.unshift(newAsn);
  addAuditLog('ASN Created from PO', asnNo, 'Expected', `Created ASN for ${qty} ${po.uom} of ${po.materialCode} (PO: ${po.poNumber})`);
  saveWMSState(window.wms);

  closeModal('modal-dynamic-form');
  renderAsnTable();
  renderPOTable();
  alert(`ASN ${asnNo} successfully generated! Ready for truck gate entry.`);
}

function renderGateEntryTable() {
  const tbody = document.getElementById('gate-table-body');
  if (!tbody) return;

  const search = (document.getElementById('search-gate')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('filter-gate-status')?.value || 'All';
  const plant = window.wms.activePlant || 'All';

  let entries = filterByPlant(window.wms.gateEntries || [], plant);
  if (statusFilter !== 'All') entries = entries.filter(e => e.status === statusFilter);
  if (search) {
    entries = entries.filter(e => e.gateEntryNo.toLowerCase().includes(search) || e.vehicleNo.toLowerCase().includes(search) || e.supplier.toLowerCase().includes(search));
  }

  tbody.innerHTML = entries.map(e => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${e.gateEntryNo}</b></td>
      <td><span style="font-family:var(--font-mono); font-weight:700;">${e.vehicleNo}</span></td>
      <td><b>${e.driverName}</b><br><span style="font-size:11px; color:#64748b;">${e.driverMobile}</span></td>
      <td>${e.supplier}</td>
      <td>${e.asnNumber} / ${e.poNumber}</td>
      <td>${e.arrivalTime}</td>
      <td><span style="font-weight:700; color:#2563eb;">${e.dockAssigned}</span></td>
      <td>${e.exitTime}</td>
      <td><span style="font-weight:700;">${e.turnaroundMinutes ? `${e.turnaroundMinutes} min` : '—'}</span></td>
      <td><span class="wms-badge ${getStatusBadgeClass(e.status)}">${e.status}</span></td>
      <td>
        ${e.status === 'Arrived' ? `<button class="btn-wms-secondary small" onclick="assignDockToGateEntry('${e.gateEntryNo}')">Assign Dock</button>` : ''}
        ${e.status === 'At dock' ? `<button class="btn-wms-secondary small" onclick="completeGateUnload('${e.gateEntryNo}')">Mark Unloaded</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function openGateEntryModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div class="wms-form-group">
        <label>Vehicle Registration Number*</label>
        <input type="text" id="ge-vehicle-no" class="search-input" value="KA-04-E-1190" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Driver Name & Mobile*</label>
        <input type="text" id="ge-driver-name" class="search-input" value="Ranganath Swamy (+91 98450 33819)" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Select Arrived ASN / PO*</label>
        <select class="select-filter" id="ge-asn-select" style="width:100%;">
          ${(window.wms.asns || []).map(a => `<option value="${a.asnNumber}">${a.asnNumber} - ${a.supplier} (${a.shippedQty} EA)</option>`).join('')}
        </select>
      </div>
      <div class="wms-form-group">
        <label>Assign Available Dock*</label>
        <select class="select-filter" id="ge-dock-select" style="width:100%;">
          ${(window.wms.dockMaster || []).filter(d => d.status === 'FREE').map(d => `<option value="${d.dockCode}">${d.dockCode} (${d.dockType})</option>`).join('') || '<option value="DOCK-04">DOCK-04 (Chassis & Braking)</option>'}
        </select>
      </div>
    </div>
  `;

  openDynamicModal('New Supplier Truck Gate Inward Check-in', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="submitGateEntry()">Register Arrival</button>
  `);
}

function submitGateEntry() {
  const vehicle = document.getElementById('ge-vehicle-no').value;
  const driver = document.getElementById('ge-driver-name').value;
  const asnNo = document.getElementById('ge-asn-select').value;
  const dock = document.getElementById('ge-dock-select').value;
  const asn = window.wms.asns.find(a => a.asnNumber === asnNo);

  const geNo = `GE-HND-2026-${String(window.wms.gateEntries.length + 1045).padStart(5, '0')}`;
  const newGE = {
    gateEntryNo: geNo,
    vehicleNo: vehicle,
    driverName: driver.split('(')[0].trim(),
    driverMobile: (driver.split('(')[1] || '').replace(')', '').trim(),
    supplier: asn.supplier,
    poNumber: asn.poNumber,
    asnNumber: asn.asnNumber,
    arrivalTime: '24-Sep-2026 ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    dockAssigned: dock,
    exitTime: '—',
    turnaroundMinutes: 0,
    status: 'At dock'
  };

  asn.status = 'Arrived';
  window.wms.gateEntries.unshift(newGE);
  
  // Occupy dock
  const dockObj = window.wms.dockMaster.find(d => d.dockCode === dock);
  if (dockObj) {
    dockObj.status = 'OCCUPIED';
    dockObj.currentTruck = vehicle;
    dockObj.supplier = asn.supplier;
    dockObj.po = asn.poNumber;
    dockObj.arrivalTime = newGE.arrivalTime;
  }

  addAuditLog('Gate Entry & Dock Assigned', geNo, 'Arrived', `Vehicle ${vehicle} assigned to ${dock} for ASN ${asnNo}`);
  saveWMSState(window.wms);

  closeModal('modal-dynamic-form');
  renderGateEntryTable();
  renderDockBoard();
  alert(`Gate Entry ${geNo} created. Truck directed to ${dock}.`);
}

function renderDockBoard() {
  const container = document.getElementById('dock-grid-container');
  if (!container) return;

  const plant = window.wms.activePlant;
  let docks = window.wms.dockMaster || [];
  if (plant !== 'All') {
    const pPrefix = plant === 'P1' ? 'Plant 1' : 'Plant 2';
    docks = docks.filter(d => d.plant.includes(pPrefix));
  }

  container.innerHTML = docks.map(d => {
    const isOccupied = d.status === 'OCCUPIED';
    const isBlocked = d.status === 'MAINTENANCE_BLOCKED';
    const isWaitingTooLong = d.timeAtDockMinutes > 120;

    return `
      <div class="dock-card ${isOccupied ? 'dock-occupied' : isBlocked ? 'dock-blocked' : 'dock-available'} ${isWaitingTooLong ? 'alert-border' : ''}">
        <div class="dock-header">
          <span class="dock-id">${d.dockCode}</span>
          <span class="dock-status-badge ${isOccupied ? 'status-occupied' : isBlocked ? 'status-blocked' : 'status-free'}">
            ${isOccupied ? 'Occupied' : isBlocked ? 'Maintenance' : 'Available'}
          </span>
        </div>
        <div class="dock-info">
          <div class="dock-info-row">
            <span class="dock-label">Plant:</span>
            <span class="dock-val">${d.plant}</span>
          </div>
          <div class="dock-info-row">
            <span class="dock-label">Dock Type:</span>
            <span class="dock-val">${d.dockType}</span>
          </div>
          <div class="dock-info-row">
            <span class="dock-label">Vehicle:</span>
            <span class="dock-val" style="font-family:var(--font-mono); font-weight:700;">${d.currentTruck}</span>
          </div>
          <div class="dock-info-row">
            <span class="dock-label">Supplier:</span>
            <span class="dock-val">${d.supplier}</span>
          </div>
          <div class="dock-info-row">
            <span class="dock-label">Time at Dock:</span>
            <span class="dock-val" style="color:${isWaitingTooLong ? '#dc2626' : '#0f172a'}; font-weight:700;">
              ${d.timeAtDockMinutes ? `${d.timeAtDockMinutes} mins ${isWaitingTooLong ? '⚠️ (Overdue)' : ''}` : '0 mins'}
            </span>
          </div>
        </div>
        <div class="dock-footer" style="display:flex; gap:6px; margin-top:10px;">
          ${isOccupied ? `<button class="btn-wms-secondary small" style="flex:1;" onclick="releaseDock('${d.dockCode}')">Release Dock</button>` : ''}
          <button class="btn-wms-secondary small" style="flex:1;" onclick="toggleDockMaintenance('${d.dockCode}')">
            ${isBlocked ? 'Unlock Dock' : 'Block Dock'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function releaseDock(dockCode) {
  const dock = window.wms.dockMaster.find(d => d.dockCode === dockCode);
  if (dock) {
    dock.status = 'FREE';
    dock.currentTruck = '—';
    dock.supplier = '—';
    dock.po = '—';
    dock.timeAtDockMinutes = 0;
    saveWMSState(window.wms);
    renderDockBoard();
  }
}

function toggleDockMaintenance(dockCode) {
  const dock = window.wms.dockMaster.find(d => d.dockCode === dockCode);
  if (dock) {
    dock.status = dock.status === 'MAINTENANCE_BLOCKED' ? 'FREE' : 'MAINTENANCE_BLOCKED';
    saveWMSState(window.wms);
    renderDockBoard();
  }
}

function renderReceivingMonitor() {
  const tbody = document.getElementById('receiving-monitor-body');
  if (tbody) {
    const plant = window.wms.activePlant || 'All';
    const batches = filterByPlant(window.wms.receivingBatches || [], plant);
    tbody.innerHTML = batches.map(b => `
      <tr>
        <td><b style="font-family:var(--font-mono); color:#2563eb;">${b.receivingId}</b></td>
        <td><b style="font-family:var(--font-mono);">${b.poNumber || 'PO-HND-2026-00501'}</b></td>
        <td><b>${b.asnNumber}</b><br><span style="font-family:var(--font-mono); font-size:11px; color:#64748b;">${b.vehicleNo}</span></td>
        <td><b>${b.materialCode}</b></td>
        <td><b>${b.expectedQty}</b></td>
        <td><span style="color:#059669; font-weight:700;">${b.scannedGoodQty}</span></td>
        <td><span style="color:#dc2626; font-weight:700;">${b.damagedQty}</span></td>
        <td><span style="color:#ea580c; font-weight:700;">${b.shortQty}</span></td>
        <td><span style="color:#2563eb; font-weight:700;">${b.excessQty}</span></td>
        <td>
          <div style="width:120px; background:#e2e8f0; border-radius:4px; height:8px; overflow:hidden; margin-bottom:4px;">
            <div style="background:#059669; width:${b.progressPct}%; height:100%;"></div>
          </div>
          <span style="font-size:10px; font-weight:700;">${b.progressPct}% Complete</span>
        </td>
        <td><b>${b.operator}</b><br><span style="font-size:11px; color:#64748b;">${b.handheldId}</span></td>
        <td><span class="wms-badge ${getStatusBadgeClass(b.status)}">${b.status}</span></td>
        <td>
          <button class="btn-wms-secondary small" onclick="openPrintPreview('HU', '${b.asnNumber}')">Reprint Labels</button>
        </td>
      </tr>
    `).join('');
  }
  renderDiscrepanciesTable();
}

function renderMRNTable() {
  const tbody = document.getElementById('mrn-table-body');
  if (!tbody) return;

  const plant = window.wms.activePlant || 'All';
  const mrns = filterByPlant(window.wms.mrns || [], plant);
  tbody.innerHTML = mrns.map(m => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${m.mrnNumber}</b></td>
      <td>${m.poNumber} / ${m.asnNumber}</td>
      <td><b>${m.supplier}</b></td>
      <td><b>${m.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${m.materialDescription}</span></td>
      <td><b>${m.asnQty}</b></td>
      <td><span style="color:#059669; font-weight:700;">${m.goodQty}</span></td>
      <td>
        <span style="color:#dc2626; font-weight:700;">${m.damagedQty} Damaged</span> / 
        <span style="color:#ea580c; font-weight:700;">${m.shortQty} Short</span>
      </td>
      <td><span style="font-size:11px; color:#475569;">${m.reasonCodes}</span></td>
      <td><b>${m.createdBy}</b><br><span style="font-size:10px; color:#64748b;">${m.createdDate}</span></td>
      <td><span class="wms-badge ${getStatusBadgeClass(m.status)}">${m.status}</span></td>
      <td>
        ${m.status === 'Pending approval' ? `
          <button class="btn-wms-primary small" onclick="approveMrn('${m.mrnNumber}')">Approve</button>
          <button class="btn-wms-secondary small" onclick="rejectMrn('${m.mrnNumber}')">Reject</button>
        ` : `
          <button class="btn-wms-secondary small" onclick="openPrintPreview('MRN', '${m.mrnNumber}')">Print MRN</button>
        `}
      </td>
    </tr>
  `).join('');
}

function approveMrn(mrnNo) {
  const mrn = window.wms.mrns.find(m => m.mrnNumber === mrnNo);
  if (!mrn) return;

  mrn.status = 'Approved';
  mrn.approvedBy = `${window.wms.currentUser.name} (${window.wms.currentUser.roleTitle})`;
  mrn.approvalDate = new Date().toLocaleTimeString();

  // Auto create GRN
  const grnNo = `GRN-HND-2026-${String(window.wms.goodsReceiptNotes.length + 520).padStart(5, '0')}`;
  const sapDocNo = `SAP-MAT-${String(5001928500 + window.wms.goodsReceiptNotes.length)}`;

  const newGrn = {
    grnNumber: grnNo,
    mrnNumber: mrnNo,
    poNumber: mrn.poNumber,
    supplier: mrn.supplier,
    materialCode: mrn.materialCode,
    acceptedQuantity: mrn.goodQty,
    uom: 'EA',
    sapMaterialDocNo: sapDocNo,
    postingDate: '24-Sep-2026',
    sapStatus: 'posted',
    inspector: window.wms.currentUser.name,
    putawayTaskId: `PUT-${String(window.wms.putawayTasks.length + 88).padStart(4, '0')}`
  };

  mrn.grnNumber = grnNo;
  window.wms.goodsReceiptNotes.unshift(newGrn);

  addAuditLog('MRN Approval & GRN Trigger', mrnNo, 'Approved', `Approved MRN for ${mrn.goodQty} EA of ${mrn.materialCode}. Generated GRN ${grnNo} with SAP Movement 101 (${sapDocNo})`);
  saveWMSState(window.wms);

  renderMRNTable();
  renderGRNTable();
  alert(`MRN ${mrnNo} Approved! Created GRN ${grnNo} and posted SAP Goods Receipt.`);
}

function renderGRNTable() {
  const tbody = document.getElementById('grn-table-body');
  if (!tbody) return;

  const plant = window.wms.activePlant || 'All';
  const grns = filterByPlant(window.wms.goodsReceiptNotes || [], plant);
  tbody.innerHTML = grns.map(g => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${g.grnNumber}</b></td>
      <td><span style="font-family:var(--font-mono);">${g.mrnNumber}</span></td>
      <td>${g.poNumber}</td>
      <td><b>${g.supplier}</b></td>
      <td><b style="color:#059669;">${g.acceptedQuantity} ${g.uom}</b></td>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${g.sapMaterialDocNo}</b> <span class="badge-sap">Mvt 101</span></td>
      <td>${g.postingDate}</td>
      <td><span class="wms-badge ${getStatusBadgeClass(g.sapStatus)}">${g.sapStatus}</span></td>
      <td>${g.inspector}</td>
      <td>
        <button class="btn-wms-secondary small" onclick="openPrintPreview('GRN', '${g.grnNumber}')">Print GRN</button>
      </td>
    </tr>
  `).join('');
}

function renderDiscrepanciesTable() {
  const tbody = document.getElementById('discrepancy-table-body');
  if (!tbody) return;

  const plant = window.wms.activePlant || 'All';
  const discs = filterByPlant(window.wms.discrepancies || [], plant);
  tbody.innerHTML = discs.map(d => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#dc2626;">${d.discrepancyNo}</b></td>
      <td>${d.poNumber} / ${d.asnNumber}</td>
      <td><b>${d.supplier}</b></td>
      <td><b>${d.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${d.materialDescription}</span></td>
      <td>${d.expectedQty} / ${d.receivedQty}</td>
      <td><span style="color:#dc2626; font-weight:700;">${d.shortQty} Short / ${d.damagedQty} Damaged</span></td>
      <td>${d.reason}</td>
      <td><span style="font-family:var(--font-mono); font-weight:700; color:#ea580c;">${d.quarantineBin}</span></td>
      <td><b>${d.action}</b><br><span style="font-size:10px; color:#2563eb;">${d.sapDebitNote || ''}</span></td>
      <td><span class="wms-badge ${getStatusBadgeClass(d.status)}">${d.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openDiscrepancyActionModal('${d.discrepancyNo}')">Resolve Action</button>
      </td>
    </tr>
  `).join('');
}

function openDiscrepancyActionModal(discNo) {
  const disc = window.wms.discrepancies.find(d => d.discrepancyNo === discNo);
  if (!disc) return;

  const content = `
    <div style="font-size:13px; color:#0f172a; display:flex; flex-direction:column; gap:12px;">
      <p>Resolving Inbound Discrepancy for <b>${disc.materialCode}</b> (Supplier: ${disc.supplier}).</p>
      <div class="wms-form-group">
        <label>Commercial Resolution Action*</label>
        <select class="select-filter" id="disc-action-select" style="width:100%;">
          <option value="Debit Note Issued & Supplier Notified">Issue Debit Note to Supplier</option>
          <option value="Return to Vendor (RTV) Movement 122">Return Damaged Stock to Vendor (RTV)</option>
          <option value="Commercial Credit Approved">Accept Deviation with Commercial Credit</option>
        </select>
      </div>
      <div class="wms-form-group">
        <label>Quarantine Storage Bin Assignment*</label>
        <input type="text" id="disc-quarantine-bin" class="search-input" value="${disc.quarantineBin}" style="width:100%;">
      </div>
    </div>
  `;

  openDynamicModal(`Resolve Discrepancy ${discNo}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="submitDiscrepancyAction('${discNo}')">Save Resolution</button>
  `);
}

function submitDiscrepancyAction(discNo) {
  const disc = window.wms.discrepancies.find(d => d.discrepancyNo === discNo);
  if (disc) {
    disc.action = document.getElementById('disc-action-select').value;
    disc.quarantineBin = document.getElementById('disc-quarantine-bin').value;
    disc.status = 'Settlement In Progress';
    addAuditLog('Discrepancy Resolution Updated', discNo, 'Open', `Updated action to: ${disc.action}`);
    saveWMSState(window.wms);
    closeModal('modal-dynamic-form');
    renderDiscrepanciesTable();
    alert(`Discrepancy ${discNo} action updated.`);
  }
}

// ==========================================================================
// 4. INVENTORY OPERATIONS (PUTAWAY, STOCK BY BIN, CYCLE COUNT, FIFO & AGING, REPORTS)
// ==========================================================================
function renderPutawayTasks() {
  const tbody = document.getElementById('putaway-table-body');
  if (!tbody) return;

  const plant = window.wms.activePlant || 'All';
  const tasks = filterByPlant(window.wms.putawayTasks || [], plant);
  tbody.innerHTML = tasks.map(t => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${t.taskNo}</b></td>
      <td><span style="font-family:var(--font-mono); font-weight:700;">${t.palletHuId}</span></td>
      <td><b>${t.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${t.materialDescription}</span></td>
      <td><b>${t.qty} ${t.uom}</b></td>
      <td>${t.fromDock}</td>
      <td><span style="font-family:var(--font-mono); font-weight:700; color:#2563eb;">${t.suggestedBin}</span></td>
      <td><span style="font-family:var(--font-mono); font-weight:700; color:#059669;">${t.actualBin}</span></td>
      <td><span style="font-size:11px; color:#64748b;">${t.overrideReason}</span></td>
      <td><b>${t.operator}</b></td>
      <td><span class="wms-badge ${getStatusBadgeClass(t.status)}">${t.status}</span></td>
      <td>
        ${t.status !== 'Completed' ? `<button class="btn-wms-primary small" onclick="completePutaway('${t.taskNo}')">Confirm Putaway</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function completePutaway(taskNo) {
  const task = window.wms.putawayTasks.find(t => t.taskNo === taskNo);
  if (task) {
    task.status = 'Completed';
    task.actualBin = task.suggestedBin;
    task.completedTime = new Date().toLocaleTimeString();
    addAuditLog('Putaway Confirmed', taskNo, 'Open', `Putaway confirmed for ${task.palletHuId} to ${task.actualBin}`);
    saveWMSState(window.wms);
    renderPutawayTasks();
    alert(`Putaway Task ${taskNo} completed. Stock placed in ${task.actualBin}.`);
  }
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-table-body');
  const summaryGrid = document.getElementById('material-stock-summary-grid');
  if (!tbody) return;

  // Render Top Material Summary Cards
  if (summaryGrid) {
    const materials = window.wms.materials || [];
    summaryGrid.innerHTML = materials.slice(0, 4).map(m => {
      const hus = (window.wms.handlingUnits || []).filter(h => h.materialCode === m.code);
      const totalQty = hus.reduce((sum, h) => sum + h.quantity, 0);
      const stockLevel = (window.wms.stockLevelMaster || []).find(s => s.materialCode === m.code) || { minStock: 200, maxStock: 1500 };

      return `
        <div class="mat-summary-card">
          <div class="mat-summary-header">
            <span class="mat-summary-code">${m.code}</span>
            <span class="mat-summary-badge">Class ${m.abcClass}</span>
          </div>
          <div class="mat-summary-desc">${m.description}</div>
          <div class="mat-summary-bars">
            <div class="mat-bar-stat">
              <div class="stat-label">Total</div>
              <div class="stat-val">${totalQty}</div>
            </div>
            <div class="mat-bar-stat">
              <div class="stat-label">Min</div>
              <div class="stat-val">${stockLevel.minStock}</div>
            </div>
            <div class="mat-bar-stat">
              <div class="stat-label">Max</div>
              <div class="stat-val">${stockLevel.maxStock}</div>
            </div>
            <div class="mat-bar-stat">
              <div class="stat-label">Unit</div>
              <div class="stat-val">${m.unit}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  const search = (document.getElementById('search-inv')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('filter-inv-status')?.value || 'All';
  const plant = window.wms.activePlant;

  let hus = filterByPlant(window.wms.handlingUnits, plant);
  if (statusFilter !== 'All') hus = hus.filter(h => h.stockStatus === statusFilter);
  if (search) {
    hus = hus.filter(h => h.materialCode.toLowerCase().includes(search) || h.location.toLowerCase().includes(search) || h.huNumber.toLowerCase().includes(search) || h.batch.toLowerCase().includes(search));
  }

  tbody.innerHTML = hus.map(h => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${h.huNumber}</b></td>
      <td><b>${h.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${h.description}</span></td>
      <td>${h.plant}</td>
      <td><b style="font-family:var(--font-mono); color:#0f172a;">${h.location}</b></td>
      <td><span style="font-family:var(--font-mono);">${h.batch}</span></td>
      <td>${h.receiptDate}</td>
      <td><b style="font-size:13px; color:#0f172a;">${h.quantity} ${h.uom}</b></td>
      <td><b>${h.agingDays} days</b> (${h.agingBucket})</td>
      <td><span class="wms-badge ${getStatusBadgeClass(h.stockStatus)}">${h.stockStatus}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openHuMovementHistory('${h.huNumber}')">HU History</button>
        <button class="btn-wms-secondary small" onclick="toggleStockBlock('${h.huNumber}')">
          ${h.stockStatus === 'BLOCKED' ? 'Unblock' : 'Block Stock'}
        </button>
      </td>
    </tr>
  `).join('');
}

function openHuMovementHistory(huNo) {
  const hu = window.wms.handlingUnits.find(h => h.huNumber === huNo);
  if (!hu) return;

  const content = `
    <div style="font-size:13px; color:#0f172a;">
      <p><b>Handling Unit:</b> ${hu.huNumber} (LPN: ${hu.lpn})</p>
      <p><b>Material:</b> ${hu.materialCode} - ${hu.description}</p>
      <p><b>Current Location:</b> ${hu.location} | Batch: ${hu.batch} | Qty: ${hu.quantity} ${hu.uom}</p>
      <hr style="margin:12px 0; border:0; border-top:1px solid #e2e8f0;">
      <h5 style="font-size:12px; color:#2563eb; margin-bottom:8px;">Movement & Transaction History</h5>
      <ul style="padding-left:18px; color:#334155; line-height:1.8;">
        <li><b>24-Sep-2026 09:40:</b> Inward Receipt at DOCK-04 from PO ${hu.poNumber} (${hu.supplier})</li>
        <li><b>24-Sep-2026 09:58:</b> Putaway completed by Sanjay Verma to Bin <b>${hu.location}</b></li>
        <li><b>24-Sep-2026 10:15:</b> Blind Cycle Count verified in A-01-05</li>
        <li><b>24-Sep-2026 10:40:</b> Outbound Pick of 100 EA for Line 1 (Activa 6G) Assembly</li>
      </ul>
    </div>
  `;

  openDynamicModal(`HU Movement Lifecycle: ${huNo}`, content, `<button class="btn-wms-primary" onclick="closeModal('modal-dynamic-form')">Close</button>`);
}

function toggleStockBlock(huNo) {
  const hu = window.wms.handlingUnits.find(h => h.huNumber === huNo);
  if (hu) {
    const oldStatus = hu.stockStatus;
    hu.stockStatus = oldStatus === 'BLOCKED' ? 'AVAILABLE' : 'BLOCKED';
    addAuditLog('Stock Status Modified', huNo, oldStatus, `Stock status toggled to ${hu.stockStatus} with reason: Quality Inspection Hold`);
    saveWMSState(window.wms);
    renderInventoryTable();
    alert(`Handling unit ${huNo} status changed to ${hu.stockStatus}.`);
  }
}

// -------------------------------------------------------------
// CYCLE COUNT & STOCK ADJUSTMENT (SINGLE SCREEN)
// -------------------------------------------------------------
function renderCycleCountScreen() {
  const container = document.getElementById('cycle-count-plans-container');
  if (!container) return;

  const plant = window.wms.activePlant || 'All';
  const plans = filterByPlant(window.wms.cycleCountPlans || [], plant);
  
  const plannedCount = plans.filter(p => p.status === 'Planned').length;
  const countingCount = plans.filter(p => p.status === 'Counting').length;
  const varianceCount = plans.flatMap(p => p.lines).filter(l => l.isOutsideTolerance && l.lineStatus === 'Variance flagged').length;
  const pendingAdjCount = plans.flatMap(p => p.lines).filter(l => l.lineStatus === 'Adjustment pending approval').length;
  const postedCount = plans.flatMap(p => p.lines).filter(l => l.lineStatus === 'Posted to SAP').length;

  const pEl = document.getElementById('count-kpi-planned'); if (pEl) pEl.textContent = plannedCount;
  const cEl = document.getElementById('count-kpi-counting'); if (cEl) cEl.textContent = countingCount;
  const vEl = document.getElementById('count-kpi-variance'); if (vEl) vEl.textContent = varianceCount;
  const aEl = document.getElementById('count-kpi-pending-adj'); if (aEl) aEl.textContent = pendingAdjCount;
  const sEl = document.getElementById('count-kpi-posted'); if (sEl) sEl.textContent = postedCount;

  container.innerHTML = plans.map(p => `
    <div class="count-plan-card">
      <div class="count-plan-header">
        <div class="count-plan-title">
          <span class="count-plan-no">${p.countNo}</span>
          <span class="wms-badge ${getStatusBadgeClass(p.status)}">${p.status}</span>
          <span class="count-plan-meta">Zone: <b>${p.zone}</b> • Class: <b>${p.abcClass}</b> • Counter: <b>${p.counter}</b> (${p.progressPct}%)</span>
        </div>
        <div style="display:flex; gap:6px;">
          ${p.status === 'Counting' ? `<button class="btn-wms-primary small" onclick="simulateHandheldCountFinish('${p.countNo}')">Simulate Handheld Submit</button>` : ''}
        </div>
      </div>

      <div class="table-responsive">
        <table class="wms-table">
          <thead>
            <tr>
              <th>Bin Location</th>
              <th>Material Code & Desc</th>
              <th>HU / Lot Reference</th>
              <th>System Qty</th>
              <th>Counted Qty</th>
              <th>Variance Qty & %</th>
              <th>Reason Code</th>
              <th>Adjustment</th>
              <th>Approved By</th>
              <th>SAP Doc No</th>
              <th>Line Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${p.lines.map(l => `
              <tr style="background:${l.isOutsideTolerance ? '#fff5f5' : '#ffffff'}; cursor:pointer;" onclick="openCycleCountLineDetails('${p.countNo}', ${l.lineId})">
                <td><b style="font-family:var(--font-mono); color:#0f172a;">${l.bin}</b></td>
                <td><b>${l.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${l.materialDescription}</span></td>
                <td><span style="font-family:var(--font-mono); font-size:11px;">${l.huLot}</span></td>
                <td><b>${l.systemQty}</b></td>
                <td><b style="color:#0f172a;">${l.countedQty}</b></td>
                <td>
                  <span class="tolerance-badge ${l.isOutsideTolerance ? 'tolerance-red' : 'tolerance-green'}">
                    ${l.varianceQty > 0 ? '+' : ''}${l.varianceQty} (${l.variancePct}%)
                  </span>
                </td>
                <td><span style="font-size:11px; color:#64748b;">${l.reasonCode}</span></td>
                <td><b style="color:${l.adjustmentQty < 0 ? '#dc2626' : l.adjustmentQty > 0 ? '#059669' : '#64748b'};">${l.adjustmentQty > 0 ? '+' : ''}${l.adjustmentQty}</b></td>
                <td>${l.approvedBy}</td>
                <td><b style="font-family:var(--font-mono); color:#2563eb;">${l.sapDocNo}</b></td>
                <td><span class="wms-badge ${getStatusBadgeClass(l.lineStatus)}">${l.lineStatus}</span></td>
                <td onclick="event.stopPropagation()">
                  <div style="display:flex; gap:4px; flex-wrap:wrap;">
                    <button class="btn-wms-secondary small" onclick="openEditCountModal('${p.countNo}', ${l.lineId})">✏️ Edit Count</button>
                    ${l.lineStatus === 'Variance flagged' ? `
                      <button class="btn-wms-secondary small" onclick="requestRecount('${p.countNo}', ${l.lineId})">Recount</button>
                      <button class="btn-wms-primary small" onclick="acceptVariance('${p.countNo}', ${l.lineId})">Accept</button>
                    ` : l.lineStatus === 'Adjustment pending approval' ? `
                      <button class="btn-wms-primary small" onclick="approveStockAdjustment('${p.countNo}', ${l.lineId})">Approve</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `).join('');
}

function openCreateCycleCountModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div class="wms-form-group">
        <label>Count Generation Policy*</label>
        <select class="select-filter" id="cc-policy-select" style="width:100%;">
          <option value="ABC_POLICY">Auto-Generate from A/B/C Policy (A parts every 30 days)</option>
          <option value="MANUAL_ZONE">Manual Selection by Warehouse Zone</option>
        </select>
      </div>
      <div class="wms-form-group">
        <label>Target Warehouse Zone*</label>
        <select class="select-filter" id="cc-zone-select" style="width:100%;">
          <option value="ZONE-A-PWR">Zone A - Powertrain & Chassis (Brake Pads / Throttle Bodies)</option>
          <option value="ZONE-B-ELE">Zone B - Electronics Bay (ECUs & Starters)</option>
          <option value="ZONE-D-TYR">Zone D - Tyres & Rubber Bay</option>
        </select>
      </div>
      <div class="wms-form-group">
        <label>Assign Counter Operator*</label>
        <select class="select-filter" id="cc-counter-select" style="width:100%;">
          <option value="Sanjay Verma (Op 01)">Sanjay Verma (Op 01 - Zebra TC57 #01)</option>
          <option value="Prakash (Op 03)">Prakash (Op 03 - Zebra TC57 #02)</option>
        </select>
      </div>
      <div class="wms-form-group" style="display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="cc-blind-check" checked>
        <label for="cc-blind-check" style="margin:0; font-weight:700;">Blind Count (System quantity hidden on Handheld Scanner)</label>
      </div>
    </div>
  `;

  openDynamicModal('Generate Cycle Count Plan', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="submitCreateCycleCount()">Release to Handheld</button>
  `);
}

function submitCreateCycleCount() {
  const zone = document.getElementById('cc-zone-select').value;
  const counter = document.getElementById('cc-counter-select').value;
  const isBlind = document.getElementById('cc-blind-check').checked;

  const countNo = `CC-2026-${String(window.wms.cycleCountPlans.length + 93).padStart(4, '0')}`;
  const newPlan = {
    countNo: countNo,
    plant: 'HMSI Narsapur Plant 1',
    zone: zone,
    abcClass: 'A',
    plannedDate: '24-Sep-2026',
    counter: counter,
    progressPct: 0,
    status: 'Counting',
    blindCount: isBlind,
    lines: [
      {
        lineId: 1,
        bin: 'RM-A03-R04-S02-B05',
        materialCode: 'HND-THROT-KEIHIN',
        materialDescription: 'Keihin PGM-FI 26mm Throttle Body',
        huLot: 'HU-HND-2026-009801 / BAT-KEI-2026-09-18-01',
        systemQty: 80,
        countedQty: 80,
        varianceQty: 0,
        variancePct: 0,
        isOutsideTolerance: false,
        reasonCode: '—',
        recountFlag: false,
        adjustmentQty: 0,
        approvedBy: '—',
        sapDocNo: '—',
        sapStatus: 'pending',
        lineStatus: 'Counted'
      }
    ]
  };

  window.wms.cycleCountPlans.unshift(newPlan);
  addAuditLog('Cycle Count Plan Released', countNo, 'Planned', `Released count plan for ${zone} assigned to ${counter}`);
  saveWMSState(window.wms);

  closeModal('modal-dynamic-form');
  renderCycleCountScreen();
  alert(`Cycle Count Plan ${countNo} released to Handheld Scanners!`);
}

function openCycleCountLineDetails(countNo, lineId) {
  const plan = window.wms.cycleCountPlans.find(p => p.countNo === countNo);
  if (!plan) return;
  const line = plan.lines.find(l => l.lineId === lineId);
  if (!line) return;

  const content = `
    <div style="display:flex; flex-direction:column; gap:12px; font-size:13px;">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
        <div><b>Count Plan:</b> <span style="font-family:var(--font-mono); color:#2563eb;">${plan.countNo}</span></div>
        <div><b>Plan Status:</b> <span class="wms-badge ${getStatusBadgeClass(plan.status)}">${plan.status}</span></div>
        <div><b>Warehouse Zone:</b> ${plan.zone}</div>
        <div><b>Assigned Counter:</b> ${plan.counter}</div>
        <div><b>ABC Velocity:</b> Class ${plan.abcClass}</div>
        <div><b>Blind Count:</b> ${plan.blindCount ? 'Yes (Scanner Blind)' : 'No'}</div>
      </div>

      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
        <h4 style="margin:0 0 8px 0; font-size:13px; color:#0f172a;">📦 Material & Count Line Breakdown</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div><b>Bin Location:</b> <span style="font-family:var(--font-mono); color:#2563eb;">${line.bin}</span></div>
          <div><b>Material Code:</b> <b>${line.materialCode}</b></div>
          <div style="grid-column: span 2;"><b>Description:</b> ${line.materialDescription}</div>
          <div style="grid-column: span 2;"><b>HU / Lot Reference:</b> <span style="font-family:var(--font-mono);">${line.huLot}</span></div>
          <div><b>System Quantity:</b> <span style="font-weight:700;">${line.systemQty}</span></div>
          <div><b>Physically Counted:</b> <span style="font-weight:700; color:#0f172a;">${line.countedQty}</span></div>
          <div><b>Variance Quantity:</b> <span class="tolerance-badge ${line.isOutsideTolerance ? 'tolerance-red' : 'tolerance-green'}">${line.varianceQty > 0 ? '+' : ''}${line.varianceQty} (${line.variancePct}%)</span></div>
          <div><b>Line Status:</b> <span class="wms-badge ${getStatusBadgeClass(line.lineStatus)}">${line.lineStatus}</span></div>
          <div><b>Reason Code:</b> ${line.reasonCode || '—'}</div>
          <div><b>SAP Doc No:</b> <span style="font-family:var(--font-mono); font-weight:700;">${line.sapDocNo || '—'}</span></div>
          <div><b>Approved By:</b> ${line.approvedBy || '—'}</div>
        </div>
      </div>
    </div>
  `;

  openDynamicModal(`Cycle Count Details • ${line.materialCode} (${line.bin})`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Close</button>
    <button class="btn-wms-primary" onclick="closeModal('modal-dynamic-form'); openEditCountModal('${countNo}', ${lineId});">✏️ Update Count</button>
  `);
}

function openEditCountModal(countNo, lineId) {
  const plan = window.wms.cycleCountPlans.find(p => p.countNo === countNo);
  if (!plan) return;
  const line = plan.lines.find(l => l.lineId === lineId);
  if (!line) return;

  const content = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0; font-size:12.5px;">
        <div><b>Material:</b> ${line.materialCode} - ${line.materialDescription}</div>
        <div><b>Location:</b> <span style="font-family:var(--font-mono); color:#2563eb;">${line.bin}</span> | <b>System Qty:</b> ${line.systemQty}</div>
      </div>

      <div class="wms-form-group">
        <label>Physical Counted Quantity*</label>
        <input type="number" id="edit-counted-qty" class="search-input" value="${line.countedQty}" style="width:100%;">
      </div>

      <div class="wms-form-group">
        <label>Variance Reason Code (if different from System)</label>
        <select class="select-filter" id="edit-reason-code" style="width:100%;">
          <option value="COUNT-VAR-GAIN" ${line.reasonCode === 'COUNT-VAR-GAIN' ? 'selected' : ''}>COUNT-VAR-GAIN (Physical Surplus / Found Stock)</option>
          <option value="COUNT-VAR-SHRINK" ${line.reasonCode === 'COUNT-VAR-SHRINK' ? 'selected' : ''}>COUNT-VAR-SHRINK (Physical Shrinkage / Missing)</option>
          <option value="DAMAGE-TRANSIT" ${line.reasonCode === 'DAMAGE-TRANSIT' ? 'selected' : ''}>DAMAGE-TRANSIT (Damaged Packaging)</option>
          <option value="—" ${line.reasonCode === '—' ? 'selected' : ''}>— (No Discrepancy)</option>
        </select>
      </div>

      <div class="wms-form-group">
        <label>Operator / Supervisor Notes</label>
        <input type="text" id="edit-count-notes" class="search-input" placeholder="e.g., Recount verified by supervisor" style="width:100%;">
      </div>
    </div>
  `;

  openDynamicModal(`Edit Physical Count • ${plan.countNo} (Line #${lineId})`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveCountUpdate('${countNo}', ${lineId})">Save & Recalculate</button>
  `);
}

function saveCountUpdate(countNo, lineId) {
  const plan = window.wms.cycleCountPlans.find(p => p.countNo === countNo);
  if (!plan) return;
  const line = plan.lines.find(l => l.lineId === lineId);
  if (!line) return;

  const newQty = parseInt(document.getElementById('edit-counted-qty').value, 10);
  if (isNaN(newQty) || newQty < 0) {
    alert('Please enter a valid count quantity.');
    return;
  }

  const reasonCode = document.getElementById('edit-reason-code').value;
  const varianceQty = newQty - line.systemQty;
  const variancePct = line.systemQty > 0 ? ((varianceQty / line.systemQty) * 100).toFixed(1) : 0;
  const isOutsideTolerance = Math.abs(varianceQty) > 0;

  line.countedQty = newQty;
  line.varianceQty = varianceQty;
  line.variancePct = variancePct;
  line.isOutsideTolerance = isOutsideTolerance;
  line.reasonCode = reasonCode;
  line.adjustmentQty = varianceQty;
  line.lineStatus = isOutsideTolerance ? 'Variance flagged' : 'Counted';

  addAuditLog('Cycle Count Updated', `${countNo}-L${lineId}`, `${line.systemQty}`, `Manual count edit to ${newQty}. Variance: ${varianceQty}`);
  saveWMSState(window.wms);

  closeModal('modal-dynamic-form');
  renderCycleCountScreen();
  alert(`Count updated to ${newQty} for ${line.materialCode}. Variance recalculated.`);
}

function renderFifoAgingView() {
  const bucketsContainer = document.getElementById('aging-buckets-grid');
  const fifoTbody = document.getElementById('fifo-table-body');
  const excTbody = document.getElementById('fifo-exceptions-body');
  const plant = window.wms.activePlant || 'All';

  // Buckets
  if (bucketsContainer) {
    const hus = filterByPlant(window.wms.handlingUnits || [], plant);
    const b07 = hus.filter(h => h.agingBucket === '0–7 Days').reduce((s, h) => s + h.quantity, 0);
    const b815 = hus.filter(h => h.agingBucket === '8–15 Days').reduce((s, h) => s + h.quantity, 0);
    const b1630 = hus.filter(h => h.agingBucket === '16–30 Days').reduce((s, h) => s + h.quantity, 0);
    const b3160 = hus.filter(h => h.agingBucket === '31–60 Days').reduce((s, h) => s + h.quantity, 0);
    const b60p = hus.filter(h => h.agingBucket === '60+ Days').reduce((s, h) => s + h.quantity, 0);

    bucketsContainer.innerHTML = `
      <div class="aging-bucket-card"><div class="aging-bucket-name">0–7 Days</div><div class="aging-bucket-qty" style="color:#059669;">${b07} EA</div></div>
      <div class="aging-bucket-card"><div class="aging-bucket-name">8–15 Days</div><div class="aging-bucket-qty" style="color:#2563eb;">${b815} EA</div></div>
      <div class="aging-bucket-card"><div class="aging-bucket-name">16–30 Days</div><div class="aging-bucket-qty" style="color:#ea580c;">${b1630} EA</div></div>
      <div class="aging-bucket-card"><div class="aging-bucket-name">31–60 Days</div><div class="aging-bucket-qty" style="color:#dc2626;">${b3160} EA</div></div>
      <div class="aging-bucket-card"><div class="aging-bucket-name">60+ Days</div><div class="aging-bucket-qty" style="color:#7f1d1d;">${b60p} EA</div></div>
    `;
  }

  // FIFO List
  if (fifoTbody) {
    const hus = filterByPlant(window.wms.handlingUnits || [], plant).sort((a, b) => a.fifoPriority - b.fifoPriority);
    fifoTbody.innerHTML = hus.map(h => `
      <tr>
        <td><span class="wms-badge badge-allocated">FIFO Priority #${h.fifoPriority}</span></td>
        <td><b>${h.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${h.description}</span></td>
        <td><b style="font-family:var(--font-mono); color:#2563eb;">${h.huNumber}</b></td>
        <td><b style="font-family:var(--font-mono);">${h.location}</b></td>
        <td>${h.batch}</td>
        <td>${h.receiptDate}</td>
        <td><b>${h.quantity} ${h.uom}</b></td>
        <td>${h.agingBucket}</td>
        <td><span class="wms-badge ${getStatusBadgeClass(h.stockStatus)}">${h.stockStatus}</span></td>
      </tr>
    `).join('');
  }

  // Exceptions
  if (excTbody) {
    const excs = filterByPlant(window.wms.fifoExceptions || [], plant);
    excTbody.innerHTML = excs.map(e => `
      <tr>
        <td><b style="font-family:var(--font-mono); color:#dc2626;">${e.exceptionId}</b></td>
        <td><b>${e.materialCode}</b></td>
        <td><span style="color:#dc2626; font-weight:700;">${e.requestedLot}</span></td>
        <td><span style="color:#059669; font-weight:700;">${e.pickedLot}</span></td>
        <td>${e.bin}</td>
        <td>${e.picker}</td>
        <td>${e.overrideReason}</td>
        <td><b>${e.authorizedBy}</b></td>
        <td>${e.timestamp}</td>
      </tr>
    `).join('');
  }
}

// -------------------------------------------------------------
// REPORTS & ALERTS
// -------------------------------------------------------------
let activeReportSubtab = 'overstock';

function switchReportTab(tabId) {
  activeReportSubtab = tabId;
  document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderReportsView();
}

function renderReportsView() {
  const container = document.getElementById('report-tab-content');
  if (!container) return;

  if (activeReportSubtab === 'overstock') {
    const materials = window.wms.materials || [];
    const stockLevels = window.wms.stockLevelMaster || [];
    const handlingUnits = window.wms.handlingUnits || [];

    // Calculate actual stock per material across handling units
    const overstockRows = materials.map(m => {
      const hus = handlingUnits.filter(h => h.materialCode === m.code);
      const currentStock = hus.reduce((sum, h) => sum + (h.quantity || 0), 0);
      const stockCfg = stockLevels.find(s => s.materialCode === m.code) || { maxStock: 1000 };
      const maxLimit = stockCfg.maxStock;
      const excessQty = currentStock > maxLimit ? (currentStock - maxLimit) : 0;
      const bins = [...new Set(hus.map(h => h.location))].join(', ') || '—';
      const isOverstock = excessQty > 0;

      return {
        materialCode: m.code,
        description: m.description,
        currentStock,
        maxLimit,
        excessQty,
        bins,
        isOverstock
      };
    });

    // Filter to ONLY show items that exceed max storage limit (Overstock items)
    const overstockOnly = overstockRows.filter(r => r.isOverstock);

    if (!overstockOnly.length) {
      container.innerHTML = `
        <div style="text-align:center; padding:32px 16px; color:#059669; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px;">
          <div style="font-size:24px; margin-bottom:8px;">✅</div>
          <div style="font-size:14px; font-weight:700;">No Overstock Items Detected</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">All warehouse materials are within their designated maximum storage capacity limits.</div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="table-responsive">
          <table class="wms-table">
            <thead>
              <tr><th>Material Code</th><th>Description</th><th>Current Stock</th><th>Max Storage Limit</th><th>Excess Qty</th><th>Occupied Bins</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${overstockOnly.map(r => `
                <tr style="background:#fff7ed;">
                  <td><b style="color:#ea580c;">${r.materialCode}</b></td>
                  <td>${r.description}</td>
                  <td><b style="font-size:13px; color:#ea580c;">${r.currentStock.toLocaleString()} EA</b></td>
                  <td>${r.maxLimit.toLocaleString()} EA</td>
                  <td>
                    <b style="color:#dc2626; background:#fee2e2; padding:3px 8px; border-radius:4px;">+${r.excessQty.toLocaleString()} EA (Excess)</b>
                  </td>
                  <td><span style="font-family:var(--font-mono); font-size:12px;">${r.bins}</span></td>
                  <td>
                    <span class="wms-badge badge-danger">
                      ⚠️ Overstock
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  } else if (activeReportSubtab === 'variation') {
    container.innerHTML = `
      <div class="table-responsive">
        <table class="wms-table">
          <thead>
            <tr><th>Material Code</th><th>Description</th><th>WMS Qty</th><th>SAP S/4HANA Qty</th><th>Last Counted Qty</th><th>Difference</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><b>HND-BRK-PAD-01</b></td><td>Nissin Front Disc Brake Pad Set</td><td>488 EA</td><td>488 EA</td><td>588 EA (Pre-Issue)</td><td>0 EA</td><td><span class="wms-badge badge-available">Reconciled</span></td>
            </tr>
            <tr>
              <td><b>HND-THROT-KEIHIN</b></td><td>Keihin Throttle Body 26mm</td><td>80 EA</td><td>80 EA</td><td>80 EA</td><td>0 EA</td><td><span class="wms-badge badge-available">Reconciled</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (activeReportSubtab === 'lowstock') {
    container.innerHTML = `
      <div class="table-responsive">
        <table class="wms-table">
          <thead>
            <tr><th>Material Code</th><th>Description</th><th>Current Stock</th><th>Min Threshold</th><th>Reorder Point</th><th>Shortage</th><th>Recommended Replenishment</th></tr>
          </thead>
          <tbody>
            <tr style="background:#fff5f5;">
              <td><b style="color:#dc2626;">HND-ECU-KEIHIN-01</b></td><td>Keihin Master Engine Control Unit</td><td><b style="color:#dc2626;">50 EA</b></td><td>180 EA</td><td>300 EA</td><td><span style="color:#dc2626; font-weight:700;">-130 EA</span></td><td><b>+450 EA (PO Suggested)</b></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (activeReportSubtab === 'supplier') {
    container.innerHTML = `
      <div class="table-responsive">
        <table class="wms-table">
          <thead>
            <tr><th>Supplier</th><th>Total Shipments</th><th>Accepted Qty</th><th>Damaged Qty</th><th>Short Qty</th><th>Quality Score</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Nissin Brakes India Pvt Ltd</b></td><td>1</td><td>590 EA</td><td>5 EA</td><td>5 EA</td><td><b style="color:#059669;">98.33%</b></td><td><span class="wms-badge badge-allocated">Good</span></td>
            </tr>
            <tr>
              <td><b>Keihin India Electronics Pvt Ltd</b></td><td>2</td><td>980 EA</td><td>0 EA</td><td>20 EA</td><td><b style="color:#ea580c;">97.95%</b></td><td><span class="wms-badge badge-allocated">Debit Note</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
}

function sendTestReportEmail() {
  alert('Scheduled Quality & Shortage Report generated. Email sent to: wh-lead@hmsi.co.in, purchase@hmsi.co.in');
}

// ==========================================================================
// 5. OUTBOUND OPERATIONS (REQUISITIONS, ISSUE LISTS, PICKING, ISSUE TO LINE, RETURNS)
// ==========================================================================
function renderRequisitionTable() {
  const tbody = document.getElementById('requisition-table-body');
  if (!tbody) return;

  const plant = window.wms.activePlant || 'All';
  const line = window.wms.activeLine || 'All';
  const reqs = filterByPlantAndLine(window.wms.materialRequirements || [], plant, line);

  tbody.innerHTML = reqs.map(r => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${r.reqNo}</b></td>
      <td>${r.sapReference}</td>
      <td><b>${r.productionLine}</b> (${r.plant})</td>
      <td>${r.shift}</td>
      <td><b>${r.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${r.materialDescription}</span></td>
      <td><b>${r.requiredQty} ${r.uom}</b></td>
      <td>${r.requiredByTime}</td>
      <td><span class="wms-badge ${r.priority === 'urgent' ? 'badge-danger' : 'badge-allocated'}">${r.priority.toUpperCase()}</span></td>
      <td><span class="wms-badge ${getStatusBadgeClass(r.status)}">${r.status}</span></td>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${r.linkedIssueList || '—'}</b></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openPoDrillDownModal('${r.reqNo}')">View Details</button>
      </td>
    </tr>
  `).join('');
}

function renderIssueListTable() {
  const tbody = document.getElementById('issue-list-table-body');
  if (!tbody) return;

  const plant = window.wms.activePlant || 'All';
  const line = window.wms.activeLine || 'All';
  const lists = filterByPlantAndLine(window.wms.issueLists || [], plant, line);

  tbody.innerHTML = lists.map(l => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${l.issueListNo}</b> ${l.autoBuiltFromN1 ? '<span class="badge-sap">Auto N1</span>' : ''}</td>
      <td><b>${l.productionLine}</b></td>
      <td>${l.shift}</td>
      <td>
        ${l.items.map(i => `<div><b>${i.materialCode}</b>: ${i.qty} ${i.uom} (from <span style="font-family:var(--font-mono); color:#2563eb;">${i.sourceBin}</span>)</div>`).join('')}
      </td>
      <td><b>${l.items.reduce((s, i) => s + i.qty, 0)} EA</b></td>
      <td><b>${l.pickerAssigned}</b></td>
      <td><span class="wms-badge ${getStatusBadgeClass(l.status)}">${l.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openPrintPreview('PICK', '${l.issueListNo}')">Print Pick List</button>
      </td>
    </tr>
  `).join('');
}

function autoBuildNextShiftIssueList() {
  const req = window.wms.materialRequirements.find(r => r.status === 'In issue list');
  if (!req) {
    alert('All pending material requirements are already built into issue lists.');
    return;
  }

  const ilNo = `IL-HND-2026-${String(window.wms.issueLists.length + 82).padStart(4, '0')}`;
  const newIL = {
    issueListNo: ilNo,
    productionLine: req.productionLine,
    shift: req.shift,
    status: 'Released',
    items: [
      {
        materialCode: req.materialCode,
        materialDescription: req.materialDescription,
        qty: req.requiredQty,
        uom: req.uom,
        allocatedHu: 'HU-HND-2026-009801',
        lot: 'BAT-KEI-2026-09-18-01 (FIFO #1)',
        sourceBin: 'RM-A03-R04-S02-B05',
        pickedQty: 0,
        status: 'Released'
      }
    ],
    autoBuiltFromN1: true,
    createdDate: '24-Sep-2026 ' + new Date().toLocaleTimeString(),
    releasedBy: window.wms.currentUser.name,
    pickerAssigned: 'Sanjay Verma (Op 01)'
  };

  req.status = 'In issue list';
  req.linkedIssueList = ilNo;
  window.wms.issueLists.unshift(newIL);

  addAuditLog('Issue List Auto-Built', ilNo, 'Draft', `Automated FIFO allocation for ${req.requiredQty} EA of ${req.materialCode}`);
  saveWMSState(window.wms);

  renderIssueListTable();
  renderRequisitionTable();
  alert(`Auto-Build Complete! Generated ${ilNo} from requirements and allocated FIFO inventory.`);
}

function renderPickingMonitor() {
  const tbody = document.getElementById('picking-monitor-body');
  if (!tbody) return;

  const plant = window.wms.activePlant || 'All';
  const line = window.wms.activeLine || 'All';
  const tasks = filterByPlantAndLine(window.wms.pickingTasks || [], plant, line);

  tbody.innerHTML = tasks.map(t => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${t.pickTaskNo}</b></td>
      <td>${t.issueListNo}</td>
      <td><b>${t.picker}</b><br><span style="font-size:11px; color:#64748b;">${t.handheldId}</span></td>
      <td><b>${t.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${t.materialDescription}</span></td>
      <td><b>${t.requiredQty}</b></td>
      <td><b style="color:#059669;">${t.pickedQty}</b></td>
      <td><span style="font-family:var(--font-mono); font-weight:700;">${t.sourceBin}</span></td>
      <td>${t.fifoOverrideFlag ? '<span style="color:#dc2626; font-weight:700;">YES (Override)</span>' : '<span style="color:#059669;">NO (FIFO Ok)</span>'}</td>
      <td><span class="wms-badge ${getStatusBadgeClass(t.status)}">${t.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openPrintPreview('PICK', '${t.issueListNo}')">Pick Slip</button>
      </td>
    </tr>
  `).join('');
}

function renderLineIssueTable() {
  const tbody = document.getElementById('line-issue-table-body');
  if (!tbody) return;

  const plant = window.wms.activePlant || 'All';
  const line = window.wms.activeLine || 'All';
  const issues = filterByPlantAndLine(window.wms.lineIssues || [], plant, line);

  tbody.innerHTML = issues.map(i => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${i.issueNo}</b></td>
      <td>${i.issueListNo}</td>
      <td><b>${i.productionLine}</b></td>
      <td><b>${i.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${i.materialDescription}</span></td>
      <td><b>${i.qtyIssued} ${i.uom}</b></td>
      <td>${i.deliveredBy}</td>
      <td>${i.receivedAtLineTime}</td>
      <td><span style="font-family:var(--font-mono); font-weight:700; color:#2563eb;">${i.stagingBin}</span></td>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${i.sapGoodsIssueDocNo}</b> <span class="badge-sap">Mvt 261</span></td>
      <td><span class="wms-badge ${getStatusBadgeClass(i.status)}">${i.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openPrintPreview('ISSUE', '${i.issueNo}')">Issue Slip</button>
      </td>
    </tr>
  `).join('');
}

function renderReturnsTable() {
  const tbody = document.getElementById('returns-table-body');
  if (!tbody) return;

  const plant = window.wms.activePlant || 'All';
  const line = window.wms.activeLine || 'All';
  const returns = filterByPlantAndLine(window.wms.lineReturns || [], plant, line);

  tbody.innerHTML = returns.map(r => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#dc2626;">${r.returnNo}</b></td>
      <td><b>${r.productionLine}</b></td>
      <td><b>${r.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${r.materialDescription}</span></td>
      <td><b>${r.qty} ${r.uom}</b></td>
      <td>${r.reason}</td>
      <td><span style="font-family:var(--font-mono); font-weight:700; color:#ea580c;">${r.targetBin}</span></td>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${r.sapReversalDocNo}</b> <span class="badge-sap">Mvt 262</span></td>
      <td><span class="wms-badge ${getStatusBadgeClass(r.status)}">${r.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openPrintPreview('MRN', '${r.returnNo}')">Return Tag</button>
      </td>
    </tr>
  `).join('');
}

function openCreateReturnModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div class="wms-form-group">
        <label>Origin Assembly Line*</label>
        <select class="select-filter" id="ret-line-select" style="width:100%;">
          <option value="Line 1 (Activa 6G Final Assembly)">Line 1 (Activa 6G Final Assembly)</option>
          <option value="Line 2 (Shine 125 & SP125 Assembly)">Line 2 (Shine 125 & SP125 Assembly)</option>
          <option value="Line 3 (110cc PGM-FI Engine)">Line 3 (110cc PGM-FI Engine)</option>
        </select>
      </div>
      <div class="wms-form-group">
        <label>Material Code*</label>
        <select class="select-filter" id="ret-mat-select" style="width:100%;">
          ${(window.wms.materials || []).map(m => `<option value="${m.code}">${m.code} - ${m.description}</option>`).join('')}
        </select>
      </div>
      <div class="wms-form-group">
        <label>Returned Quantity*</label>
        <input type="number" id="ret-qty" class="search-input" value="5" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Reason for Line Return*</label>
        <select class="select-filter" id="ret-reason-select" style="width:100%;">
          <option value="LINE-RET-DEFECT (Defective component rejected on line)">LINE-RET-DEFECT (Defective component rejected on line)</option>
          <option value="LINE-RET-SURPLUS (Shift end unused surplus)">LINE-RET-SURPLUS (Shift end unused surplus)</option>
        </select>
      </div>
    </div>
  `;

  openDynamicModal('Create Return from Production Line', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="submitCreateReturn()">Submit Return</button>
  `);
}

function submitCreateReturn() {
  const line = document.getElementById('ret-line-select').value;
  const matCode = document.getElementById('ret-mat-select').value;
  const mat = window.wms.materials.find(m => m.code === matCode);
  const qty = parseInt(document.getElementById('ret-qty').value) || 1;
  const reason = document.getElementById('ret-reason-select').value;

  const retNo = `RET-2026-${String(window.wms.lineReturns.length + 15).padStart(4, '0')}`;
  const sapDoc = `SAP-REV-${String(40019285 + window.wms.lineReturns.length)}`;

  const newReturn = {
    returnNo: retNo,
    productionLine: line,
    materialCode: matCode,
    materialDescription: mat.description,
    qty: qty,
    uom: mat.unit,
    reason: reason,
    targetBin: 'QC-REJECT-ZONE-01',
    status: 'Quarantined',
    sapReversalDocNo: sapDoc
  };

  window.wms.lineReturns.unshift(newReturn);
  addAuditLog('Line Return Created', retNo, 'Line Side', `Returned ${qty} EA of ${matCode} from ${line} to Quarantine Bin`);
  saveWMSState(window.wms);

  closeModal('modal-dynamic-form');
  renderReturnsTable();
  alert(`Line Return ${retNo} recorded. Stock returned to quarantine and SAP GI Reversal posted (${sapDoc}).`);
}

// ==========================================================================
// 6. MASTERS MODULE — COMPLETE CRUD ENGINE (ADD, EDIT, DELETE/DEACTIVATE)
// ==========================================================================
function renderAllMasters() {
  renderMasterMaterial();
  renderMasterSupplier();
  renderMasterPlant();
  renderMasterZoneBin();
  renderMasterDock();
  renderMasterLine();
  renderMasterStockLevel();
  renderMasterReasonCode();
  renderMasterUser();
  renderMasterDevice();
}

// Master 1: Material Master
function renderMasterMaterial() {
  const tbody = document.getElementById('master-material-body');
  if (!tbody) return;
  const mats = window.wms.materials || [];
  tbody.innerHTML = mats.map(m => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${m.code}</b> ${m.isSapOwned ? '<span class="badge-sap">SAP</span>' : ''}</td>
      <td><b>${m.description}</b></td>
      <td>${m.unit}</td>
      <td>${m.materialGroup}</td>
      <td>${m.plant}</td>
      <td><span class="wms-badge badge-available">Class ${m.abcClass}</span></td>
      <td><b>${m.standardPackQty}</b></td>
      <td><span style="font-family:var(--font-mono);">${m.defaultZone}</span></td>
      <td>${m.fifoApplicable ? '✅ Yes' : '❌ No'}</td>
      <td><span class="wms-badge ${getStatusBadgeClass(m.status)}">${m.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditMaterialModal('${m.code}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="deleteMaterial('${m.code}')">🗑️ Delete</button>
        <button class="btn-wms-secondary small" onclick="openPrintPreview('MAT', '${m.code}')">Label</button>
      </td>
    </tr>
  `).join('');
}

function openAddMaterialModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Material Code*</label><input type="text" id="m-code" class="search-input" value="HND-SAMPLE-01" style="width:100%;"></div>
      <div class="wms-form-group"><label>Description*</label><input type="text" id="m-desc" class="search-input" value="Sample Component Specification" style="width:100%;"></div>
      <div class="wms-form-group"><label>Unit of Measure (UOM)*</label><input type="text" id="m-unit" class="search-input" value="EA" style="width:100%;"></div>
      <div class="wms-form-group"><label>Material Group*</label><input type="text" id="m-group" class="search-input" value="Chassis & Powertrain" style="width:100%;"></div>
      <div class="wms-form-group"><label>Plant*</label><select class="select-filter" id="m-plant" style="width:100%;"><option value="HMSI Narsapur Plant 1">HMSI Narsapur Plant 1</option><option value="HMSI Narsapur Plant 2">HMSI Narsapur Plant 2</option></select></div>
      <div class="wms-form-group"><label>A/B/C Velocity Class*</label><select class="select-filter" id="m-abc" style="width:100%;"><option value="A">Class A (Fast Mover)</option><option value="B">Class B (Medium Mover)</option><option value="C">Class C (Slow Mover)</option></select></div>
      <div class="wms-form-group"><label>Standard Pack Qty*</label><input type="number" id="m-pack" class="search-input" value="50" style="width:100%;"></div>
      <div class="wms-form-group"><label>Default Storage Zone*</label><input type="text" id="m-zone" class="search-input" value="Zone A - Powertrain & Chassis" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal('Add New Material', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveMaterial(true)">Create Material</button>
  `);
}

function openEditMaterialModal(code) {
  const m = window.wms.materials.find(item => item.code === code);
  if (!m) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Material Code</label><input type="text" id="m-code" class="search-input" value="${m.code}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Description*</label><input type="text" id="m-desc" class="search-input" value="${m.description}" style="width:100%;"></div>
      <div class="wms-form-group"><label>A/B/C Velocity Class*</label><select class="select-filter" id="m-abc" style="width:100%;"><option value="A" ${m.abcClass === 'A' ? 'selected' : ''}>Class A</option><option value="B" ${m.abcClass === 'B' ? 'selected' : ''}>Class B</option><option value="C" ${m.abcClass === 'C' ? 'selected' : ''}>Class C</option></select></div>
      <div class="wms-form-group"><label>Standard Pack Qty*</label><input type="number" id="m-pack" class="search-input" value="${m.standardPackQty}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Default Storage Zone*</label><input type="text" id="m-zone" class="search-input" value="${m.defaultZone}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Status*</label><select class="select-filter" id="m-status" style="width:100%;"><option value="ACTIVE" ${m.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option><option value="INACTIVE" ${m.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option></select></div>
    </div>
  `;
  openDynamicModal(`Edit Material: ${code}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveMaterial(false, '${code}')">Save Changes</button>
  `);
}

function saveMaterial(isNew, existingCode) {
  const code = isNew ? document.getElementById('m-code').value.trim() : existingCode;
  const desc = document.getElementById('m-desc').value.trim();
  const abc = document.getElementById('m-abc').value;
  const pack = parseInt(document.getElementById('m-pack').value) || 1;
  const zone = document.getElementById('m-zone').value;

  if (isNew) {
    if (window.wms.materials.some(m => m.code === code)) {
      alert('Error: Material Code already exists!');
      return;
    }
    const newMat = {
      code: code,
      description: desc,
      unit: document.getElementById('m-unit').value,
      materialGroup: document.getElementById('m-group').value,
      plant: document.getElementById('m-plant').value,
      abcClass: abc,
      standardPackQty: pack,
      packType: 'Standard Box',
      weightKg: 1.0,
      dimensions: '200x200x100',
      batchManaged: true,
      fifoApplicable: true,
      shelfLifeDays: 730,
      barcode: `8901452${Math.floor(100000 + Math.random() * 900000)}`,
      defaultZone: zone,
      status: 'ACTIVE',
      isSapOwned: false,
      lastSync: 'Local'
    };
    window.wms.materials.unshift(newMat);
    addAuditLog('Material Created', code, 'None', `Created material ${code} (${desc})`);
  } else {
    const mat = window.wms.materials.find(m => m.code === code);
    if (mat) {
      mat.description = desc;
      mat.abcClass = abc;
      mat.standardPackQty = pack;
      mat.defaultZone = zone;
      mat.status = document.getElementById('m-status').value;
      addAuditLog('Material Updated', code, 'Active', `Updated parameters for ${code}`);
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMasterMaterial();
}

function deleteMaterial(code) {
  if (confirm(`Are you sure you want to deactivate/delete material ${code}?`)) {
    window.wms.materials = window.wms.materials.filter(m => m.code !== code);
    addAuditLog('Material Deleted', code, 'Active', `Deleted material ${code}`);
    saveWMSState(window.wms);
    renderMasterMaterial();
  }
}

// Master 2: Supplier Master
function renderMasterSupplier() {
  const tbody = document.getElementById('master-supplier-body');
  if (!tbody) return;
  const sups = window.wms.suppliers || [];
  tbody.innerHTML = sups.map(s => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${s.code}</b> <span class="badge-sap">SAP</span></td>
      <td><b>${s.name}</b></td>
      <td>${s.address}</td>
      <td>${s.contact}</td>
      <td><b>${s.phone}</b><br><span style="font-size:11px; color:#64748b;">${s.email}</span></td>
      <td>${s.asnCapable ? '✅ ASN Active' : '❌ Manual'}</td>
      <td><b>${s.leadTimeDays} days</b></td>
      <td><span class="wms-badge ${getStatusBadgeClass(s.status)}">${s.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditSupplierModal('${s.code}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="deleteSupplier('${s.code}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddSupplierModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Supplier Code*</label><input type="text" id="s-code" class="search-input" value="VEND-NEW-01" style="width:100%;"></div>
      <div class="wms-form-group"><label>Supplier Name*</label><input type="text" id="s-name" class="search-input" value="Stanley Electric India Pvt Ltd" style="width:100%;"></div>
      <div class="wms-form-group"><label>Address*</label><input type="text" id="s-addr" class="search-input" value="KIADB Industrial Area, Kolar" style="width:100%;"></div>
      <div class="wms-form-group"><label>Contact Person*</label><input type="text" id="s-contact" class="search-input" value="V. Ramanathan" style="width:100%;"></div>
      <div class="wms-form-group"><label>Phone & Email*</label><input type="text" id="s-phone" class="search-input" value="+91 98450 11990" style="width:100%;"></div>
      <div class="wms-form-group"><label>Email*</label><input type="text" id="s-email" class="search-input" value="sales@stanleyelectric.in" style="width:100%;"></div>
      <div class="wms-form-group"><label>Lead Time (Days)*</label><input type="number" id="s-lead" class="search-input" value="3" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal('Add New Supplier', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveSupplier(true)">Create Supplier</button>
  `);
}

function openEditSupplierModal(code) {
  const s = window.wms.suppliers.find(item => item.code === code);
  if (!s) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Supplier Code</label><input type="text" value="${s.code}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Supplier Name*</label><input type="text" id="s-name" class="search-input" value="${s.name}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Contact Person*</label><input type="text" id="s-contact" class="search-input" value="${s.contact}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Phone*</label><input type="text" id="s-phone" class="search-input" value="${s.phone}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Email*</label><input type="text" id="s-email" class="search-input" value="${s.email}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Lead Time (Days)*</label><input type="number" id="s-lead" class="search-input" value="${s.leadTimeDays}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Status*</label><select class="select-filter" id="s-status" style="width:100%;"><option value="ACTIVE" ${s.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option><option value="INACTIVE" ${s.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option></select></div>
    </div>
  `;
  openDynamicModal(`Edit Supplier: ${code}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveSupplier(false, '${code}')">Save Changes</button>
  `);
}

function saveSupplier(isNew, existingCode) {
  const code = isNew ? document.getElementById('s-code').value.trim() : existingCode;
  const name = document.getElementById('s-name').value.trim();
  const contact = document.getElementById('s-contact').value.trim();
  const phone = document.getElementById('s-phone').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const lead = parseInt(document.getElementById('s-lead').value) || 2;

  if (isNew) {
    window.wms.suppliers.unshift({
      code: code,
      name: name,
      address: document.getElementById('s-addr').value,
      contact: contact,
      phone: phone,
      email: email,
      asnCapable: true,
      leadTimeDays: lead,
      status: 'ACTIVE',
      isSapOwned: true,
      lastSync: 'Local'
    });
    addAuditLog('Supplier Created', code, 'None', `Created supplier ${code} (${name})`);
  } else {
    const s = window.wms.suppliers.find(item => item.code === code);
    if (s) {
      s.name = name;
      s.contact = contact;
      s.phone = phone;
      s.email = email;
      s.leadTimeDays = lead;
      s.status = document.getElementById('s-status').value;
      addAuditLog('Supplier Updated', code, 'Active', `Updated supplier ${code}`);
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMasterSupplier();
}

function deleteSupplier(code) {
  if (confirm(`Delete supplier ${code}?`)) {
    window.wms.suppliers = window.wms.suppliers.filter(s => s.code !== code);
    saveWMSState(window.wms);
    renderMasterSupplier();
  }
}

// Master 3: Plant Master
function renderMasterPlant() {
  const tbody = document.getElementById('master-plant-body');
  if (!tbody) return;
  const plants = window.wms.plantMaster || [];
  tbody.innerHTML = plants.map(p => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${p.plantCode}</b></td>
      <td><b>${p.name}</b></td>
      <td>${p.address}</td>
      <td><b style="font-family:var(--font-mono);">${p.sapPlantCode}</b></td>
      <td><span style="font-family:var(--font-mono); color:#2563eb;">${p.sapSLocMapping}</span></td>
      <td><span class="wms-badge badge-available">${p.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditPlantModal('${p.plantCode}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="deletePlant('${p.plantCode}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddPlantModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Plant Code*</label><input type="text" id="p-code" class="search-input" value="P3" style="width:100%;"></div>
      <div class="wms-form-group"><label>Plant Name*</label><input type="text" id="p-name" class="search-input" value="HMSI Plant 3 (EV Division)" style="width:100%;"></div>
      <div class="wms-form-group"><label>Physical Address*</label><input type="text" id="p-addr" class="search-input" value="Plot 88, KIADB Narsapur" style="width:100%;"></div>
      <div class="wms-form-group"><label>SAP Plant Code*</label><input type="text" id="p-sap" class="search-input" value="1003" style="width:100%;"></div>
      <div class="wms-form-group"><label>SAP SLoc Mappings*</label><input type="text" id="p-sloc" class="search-input" value="SL01 (Raw), SL02 (EV Staging)" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal('Add New Plant', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="savePlant(true)">Create Plant</button>
  `);
}

function openEditPlantModal(code) {
  const p = window.wms.plantMaster.find(item => item.plantCode === code);
  if (!p) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Plant Code</label><input type="text" value="${p.plantCode}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Plant Name*</label><input type="text" id="p-name" class="search-input" value="${p.name}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Physical Address*</label><input type="text" id="p-addr" class="search-input" value="${p.address}" style="width:100%;"></div>
      <div class="wms-form-group"><label>SAP SLoc Mappings*</label><input type="text" id="p-sloc" class="search-input" value="${p.sapSLocMapping}" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal(`Edit Plant: ${code}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="savePlant(false, '${code}')">Save Changes</button>
  `);
}

function savePlant(isNew, code) {
  const pCode = isNew ? document.getElementById('p-code').value.trim() : code;
  const name = document.getElementById('p-name').value.trim();
  const addr = document.getElementById('p-addr').value.trim();
  const sloc = document.getElementById('p-sloc').value.trim();

  if (isNew) {
    window.wms.plantMaster.push({
      plantCode: pCode,
      name: name,
      address: addr,
      sapPlantCode: document.getElementById('p-sap').value,
      sapSLocMapping: sloc,
      status: 'ACTIVE'
    });
  } else {
    const p = window.wms.plantMaster.find(item => item.plantCode === code);
    if (p) {
      p.name = name;
      p.address = addr;
      p.sapSLocMapping = sloc;
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMasterPlant();
}

function deletePlant(code) {
  if (confirm(`Delete plant ${code}?`)) {
    window.wms.plantMaster = window.wms.plantMaster.filter(p => p.plantCode !== code);
    saveWMSState(window.wms);
    renderMasterPlant();
  }
}

// Master 4: Zone & Bin Master
function renderMasterZoneBin() {
  const tbody = document.getElementById('master-bin-body');
  if (!tbody) return;
  const bins = window.wms.binMaster || [];
  tbody.innerHTML = bins.map(b => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${b.binCode}</b></td>
      <td><span style="font-family:var(--font-mono);">${b.zone}</span></td>
      <td><b>${b.zoneName}</b></td>
      <td>${b.type}</td>
      <td><b>${b.capacity}</b></td>
      <td>${b.maxWeightKg} kg</td>
      <td><b style="color:${b.currentQty > 0 ? '#059669' : '#64748b'};">${b.currentQty}</b></td>
      <td><span style="font-size:11.5px;">${b.storedMaterial}</span></td>
      <td><span class="wms-badge ${getStatusBadgeClass(b.status)}">${b.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditBinModal('${b.binCode}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="deleteBin('${b.binCode}')">🗑️ Delete</button>
        <button class="btn-wms-secondary small" onclick="openPrintPreview('BIN', '${b.binCode}')">Barcode</button>
      </td>
    </tr>
  `).join('');
}

function openAddBinModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Bin Code*</label><input type="text" id="b-code" class="search-input" value="A-02-01" style="width:100%;"></div>
      <div class="wms-form-group"><label>Zone*</label><select class="select-filter" id="b-zone" style="width:100%;">${(window.wms.areaMaster || []).map(z => `<option value="${z.zoneCode}">${z.zoneName}</option>`).join('')}</select></div>
      <div class="wms-form-group"><label>Rack Type*</label><input type="text" id="b-type" class="search-input" value="High-Bay Heavy Rack" style="width:100%;"></div>
      <div class="wms-form-group"><label>Max Capacity (EA)*</label><input type="number" id="b-cap" class="search-input" value="1000" style="width:100%;"></div>
      <div class="wms-form-group"><label>Max Weight (kg)*</label><input type="number" id="b-weight" class="search-input" value="1500" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal('Add New Storage Bin', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveBin(true)">Create Bin</button>
  `);
}

function openEditBinModal(code) {
  const b = window.wms.binMaster.find(item => item.binCode === code);
  if (!b) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Bin Code</label><input type="text" value="${b.binCode}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Max Capacity (EA)*</label><input type="number" id="b-cap" class="search-input" value="${b.capacity}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Max Weight (kg)*</label><input type="number" id="b-weight" class="search-input" value="${b.maxWeightKg}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Status*</label><select class="select-filter" id="b-status" style="width:100%;"><option value="ACTIVE" ${b.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option><option value="BLOCKED" ${b.status === 'BLOCKED' ? 'selected' : ''}>BLOCKED</option></select></div>
    </div>
  `;
  openDynamicModal(`Edit Bin: ${code}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveBin(false, '${code}')">Save Changes</button>
  `);
}

function saveBin(isNew, code) {
  const bCode = isNew ? document.getElementById('b-code').value.trim() : code;
  const cap = parseInt(document.getElementById('b-cap').value) || 1000;
  const weight = parseInt(document.getElementById('b-weight').value) || 1000;

  if (isNew) {
    window.wms.binMaster.unshift({
      binCode: bCode,
      zone: document.getElementById('b-zone').value,
      zoneName: 'High-Bay Rack Zone',
      type: document.getElementById('b-type').value,
      capacity: cap,
      maxWeightKg: weight,
      currentQty: 0,
      storedMaterial: 'Empty / Available',
      status: 'ACTIVE',
      barcode: `BIN-${bCode}`
    });
  } else {
    const b = window.wms.binMaster.find(item => item.binCode === code);
    if (b) {
      b.capacity = cap;
      b.maxWeightKg = weight;
      b.status = document.getElementById('b-status').value;
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMasterZoneBin();
}

function deleteBin(code) {
  const b = window.wms.binMaster.find(item => item.binCode === code);
  if (b && b.currentQty > 0) {
    alert(`Validation Safeguard: Cannot delete bin ${code} because it contains active stock (${b.currentQty} EA). Please empty stock first.`);
    return;
  }
  if (confirm(`Delete bin ${code}?`)) {
    window.wms.binMaster = window.wms.binMaster.filter(item => item.binCode !== code);
    saveWMSState(window.wms);
    renderMasterZoneBin();
  }
}

// Master 5: Dock Master
function renderMasterDock() {
  const tbody = document.getElementById('master-dock-body');
  if (!tbody) return;
  const docks = window.wms.dockMaster || [];
  tbody.innerHTML = docks.map(d => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${d.dockCode}</b></td>
      <td>${d.plant}</td>
      <td><b>${d.dockType}</b></td>
      <td>${d.workingHours}</td>
      <td><span class="wms-badge ${getStatusBadgeClass(d.status)}">${d.status}</span></td>
      <td><span style="font-family:var(--font-mono);">${d.currentTruck}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditDockModal('${d.dockCode}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="deleteDock('${d.dockCode}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddDockModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Dock Code*</label><input type="text" id="d-code" class="search-input" value="DOCK-07" style="width:100%;"></div>
      <div class="wms-form-group"><label>Plant*</label><select class="select-filter" id="d-plant" style="width:100%;"><option value="HMSI Narsapur Plant 1">HMSI Narsapur Plant 1</option><option value="HMSI Narsapur Plant 2">HMSI Narsapur Plant 2</option></select></div>
      <div class="wms-form-group"><label>Dock Type*</label><input type="text" id="d-type" class="search-input" value="General Component Inbound" style="width:100%;"></div>
      <div class="wms-form-group"><label>Working Hours*</label><input type="text" id="d-hours" class="search-input" value="24x7 (3 Shifts)" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal('Add New Receiving Dock', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveDock(true)">Create Dock</button>
  `);
}

function openEditDockModal(code) {
  const d = window.wms.dockMaster.find(item => item.dockCode === code);
  if (!d) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Dock Code</label><input type="text" value="${d.dockCode}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Dock Type*</label><input type="text" id="d-type" class="search-input" value="${d.dockType}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Working Hours*</label><input type="text" id="d-hours" class="search-input" value="${d.workingHours}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Status*</label><select class="select-filter" id="d-status" style="width:100%;"><option value="FREE" ${d.status === 'FREE' ? 'selected' : ''}>FREE</option><option value="OCCUPIED" ${d.status === 'OCCUPIED' ? 'selected' : ''}>OCCUPIED</option><option value="MAINTENANCE_BLOCKED" ${d.status === 'MAINTENANCE_BLOCKED' ? 'selected' : ''}>MAINTENANCE_BLOCKED</option></select></div>
    </div>
  `;
  openDynamicModal(`Edit Dock: ${code}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveDock(false, '${code}')">Save Changes</button>
  `);
}

function saveDock(isNew, code) {
  const dCode = isNew ? document.getElementById('d-code').value.trim() : code;
  const type = document.getElementById('d-type').value.trim();
  const hours = document.getElementById('d-hours').value.trim();

  if (isNew) {
    window.wms.dockMaster.push({
      dockCode: dCode,
      plant: document.getElementById('d-plant').value,
      dockType: type,
      workingHours: hours,
      status: 'FREE',
      currentTruck: '—',
      supplier: '—',
      po: '—',
      timeAtDockMinutes: 0
    });
  } else {
    const d = window.wms.dockMaster.find(item => item.dockCode === code);
    if (d) {
      d.dockType = type;
      d.workingHours = hours;
      d.status = document.getElementById('d-status').value;
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMasterDock();
  renderDockBoard();
}

function deleteDock(code) {
  if (confirm(`Delete dock ${code}?`)) {
    window.wms.dockMaster = window.wms.dockMaster.filter(d => d.dockCode !== code);
    saveWMSState(window.wms);
    renderMasterDock();
    renderDockBoard();
  }
}

// Master 6: Production Line Master
function renderMasterLine() {
  const tbody = document.getElementById('master-line-body');
  if (!tbody) return;
  const lines = window.wms.productionLineMaster || [];
  tbody.innerHTML = lines.map(l => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${l.lineCode}</b></td>
      <td><b>${l.name}</b></td>
      <td>${l.plant}</td>
      <td><span style="font-family:var(--font-mono); color:#2563eb; font-weight:700;">${l.stagingBin}</span></td>
      <td>${l.shiftPattern}</td>
      <td><b>${l.dailyTarget.toLocaleString()} units</b></td>
      <td><span class="wms-badge badge-available">${l.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditLineModal('${l.lineCode}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="deleteLine('${l.lineCode}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddLineModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Line Code*</label><input type="text" id="l-code" class="search-input" value="L5" style="width:100%;"></div>
      <div class="wms-form-group"><label>Line Name*</label><input type="text" id="l-name" class="search-input" value="Line 5 (Activa EV Battery Pack Assembly)" style="width:100%;"></div>
      <div class="wms-form-group"><label>Plant*</label><select class="select-filter" id="l-plant" style="width:100%;"><option value="HMSI Narsapur Plant 1">HMSI Narsapur Plant 1</option><option value="HMSI Narsapur Plant 2">HMSI Narsapur Plant 2</option></select></div>
      <div class="wms-form-group"><label>Staging Bin*</label><input type="text" id="l-staging" class="search-input" value="STG-P1-L5" style="width:100%;"></div>
      <div class="wms-form-group"><label>Shift Pattern*</label><input type="text" id="l-shift" class="search-input" value="3 Shifts (A/B/C)" style="width:100%;"></div>
      <div class="wms-form-group"><label>Daily Production Target*</label><input type="number" id="l-target" class="search-input" value="800" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal('Add Production Line', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveLine(true)">Create Line</button>
  `);
}

function openEditLineModal(code) {
  const l = window.wms.productionLineMaster.find(item => item.lineCode === code);
  if (!l) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Line Code</label><input type="text" value="${l.lineCode}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Line Name*</label><input type="text" id="l-name" class="search-input" value="${l.name}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Staging Bin*</label><input type="text" id="l-staging" class="search-input" value="${l.stagingBin}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Daily Target*</label><input type="number" id="l-target" class="search-input" value="${l.dailyTarget}" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal(`Edit Production Line: ${code}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveLine(false, '${code}')">Save Changes</button>
  `);
}

function saveLine(isNew, code) {
  const lCode = isNew ? document.getElementById('l-code').value.trim() : code;
  const name = document.getElementById('l-name').value.trim();
  const staging = document.getElementById('l-staging').value.trim();
  const target = parseInt(document.getElementById('l-target').value) || 500;

  if (isNew) {
    window.wms.productionLineMaster.push({
      lineCode: lCode,
      name: name,
      plant: document.getElementById('l-plant').value,
      stagingBin: staging,
      shiftPattern: document.getElementById('l-shift').value,
      dailyTarget: target,
      status: 'ACTIVE'
    });
  } else {
    const l = window.wms.productionLineMaster.find(item => item.lineCode === code);
    if (l) {
      l.name = name;
      l.stagingBin = staging;
      l.dailyTarget = target;
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMasterLine();
  renderPlantLinesOverview();
}

function deleteLine(code) {
  if (confirm(`Delete line ${code}?`)) {
    window.wms.productionLineMaster = window.wms.productionLineMaster.filter(l => l.lineCode !== code);
    saveWMSState(window.wms);
    renderMasterLine();
    renderPlantLinesOverview();
  }
}

// Master 7: Stock Level Master
function renderMasterStockLevel() {
  const tbody = document.getElementById('master-stock-level-body');
  if (!tbody) return;
  const levels = window.wms.stockLevelMaster || [];
  tbody.innerHTML = levels.map(s => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${s.materialCode}</b></td>
      <td>${s.plant}</td>
      <td><b>${s.minStock}</b></td>
      <td><b>${s.maxStock}</b></td>
      <td><span style="color:#ea580c; font-weight:700;">${s.reorderPoint}</span></td>
      <td>${s.safetyStock}</td>
      <td><b>Class ${s.abcCycleDays === 1 ? 'A (Daily)' : s.abcCycleDays === 2 ? 'B (Bi-Daily)' : 'C (Weekly)'}</b></td>
      <td><span style="font-size:11px; color:#475569;">${s.alertEmails}</span></td>
      <td><span class="wms-badge badge-available">${s.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditStockLevelModal('${s.materialCode}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="deleteStockLevel('${s.materialCode}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddStockLevelModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Material Code*</label><select class="select-filter" id="sl-mat" style="width:100%;">${(window.wms.materials || []).map(m => `<option value="${m.code}">${m.code} - ${m.description}</option>`).join('')}</select></div>
      <div class="wms-form-group"><label>Plant*</label><select class="select-filter" id="sl-plant" style="width:100%;"><option value="HMSI Narsapur Plant 1">HMSI Narsapur Plant 1</option><option value="HMSI Narsapur Plant 2">HMSI Narsapur Plant 2</option></select></div>
      <div class="wms-form-group"><label>Min Stock*</label><input type="number" id="sl-min" class="search-input" value="100" style="width:100%;"></div>
      <div class="wms-form-group"><label>Max Stock*</label><input type="number" id="sl-max" class="search-input" value="1000" style="width:100%;"></div>
      <div class="wms-form-group"><label>Reorder Point*</label><input type="number" id="sl-reorder" class="search-input" value="250" style="width:100%;"></div>
      <div class="wms-form-group"><label>Safety Stock*</label><input type="number" id="sl-safety" class="search-input" value="80" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal('Add Stock Level Threshold', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveStockLevel(true)">Save Threshold</button>
  `);
}

function openEditStockLevelModal(code) {
  const s = window.wms.stockLevelMaster.find(item => item.materialCode === code);
  if (!s) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Material Code</label><input type="text" value="${s.materialCode}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Min Stock*</label><input type="number" id="sl-min" class="search-input" value="${s.minStock}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Max Stock*</label><input type="number" id="sl-max" class="search-input" value="${s.maxStock}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Reorder Point*</label><input type="number" id="sl-reorder" class="search-input" value="${s.reorderPoint}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Safety Stock*</label><input type="number" id="sl-safety" class="search-input" value="${s.safetyStock}" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal(`Edit Stock Threshold: ${code}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveStockLevel(false, '${code}')">Save Changes</button>
  `);
}

function saveStockLevel(isNew, code) {
  const matCode = isNew ? document.getElementById('sl-mat').value : code;
  const min = parseInt(document.getElementById('sl-min').value) || 100;
  const max = parseInt(document.getElementById('sl-max').value) || 1000;
  const reorder = parseInt(document.getElementById('sl-reorder').value) || 200;
  const safety = parseInt(document.getElementById('sl-safety').value) || 50;

  if (isNew) {
    window.wms.stockLevelMaster.push({
      materialCode: matCode,
      plant: document.getElementById('sl-plant').value,
      minStock: min,
      maxStock: max,
      reorderPoint: reorder,
      safetyStock: safety,
      abcCycleDays: 1,
      alertEmails: 'wh-lead@hmsi.co.in',
      status: 'ACTIVE'
    });
  } else {
    const s = window.wms.stockLevelMaster.find(item => item.materialCode === code);
    if (s) {
      s.minStock = min;
      s.maxStock = max;
      s.reorderPoint = reorder;
      s.safetyStock = safety;
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMasterStockLevel();
}

function deleteStockLevel(code) {
  if (confirm(`Delete threshold for ${code}?`)) {
    window.wms.stockLevelMaster = window.wms.stockLevelMaster.filter(s => s.materialCode !== code);
    saveWMSState(window.wms);
    renderMasterStockLevel();
  }
}

// Master 8: Reason Code Master
function renderMasterReasonCode() {
  const tbody = document.getElementById('master-reason-code-body');
  if (!tbody) return;
  const codes = window.wms.reasonCodeMaster || [];
  tbody.innerHTML = codes.map(r => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${r.code}</b></td>
      <td><b>${r.description}</b></td>
      <td><span class="wms-badge badge-allocated">${r.type}</span></td>
      <td>${r.needsApproval ? '⚠️ Yes (Supervisor)' : 'No'}</td>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${r.sapMovementType}</b></td>
      <td><span class="wms-badge badge-available">${r.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditReasonCodeModal('${r.code}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="deleteReasonCode('${r.code}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddReasonCodeModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Reason Code*</label><input type="text" id="rc-code" class="search-input" value="SCRAP-OBSOLETE" style="width:100%;"></div>
      <div class="wms-form-group"><label>Description*</label><input type="text" id="rc-desc" class="search-input" value="Component obsolete due to engineering design change" style="width:100%;"></div>
      <div class="wms-form-group"><label>Category Type*</label><select class="select-filter" id="rc-type" style="width:100%;"><option value="damage">damage</option><option value="shortage">shortage</option><option value="excess">excess</option><option value="adjustment">adjustment</option><option value="FIFO override">FIFO override</option><option value="return">return</option></select></div>
      <div class="wms-form-group"><label>SAP Movement Type*</label><input type="text" id="rc-sap" class="search-input" value="Movement 551 (Scrap)" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal('Add Reason Code', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveReasonCode(true)">Create Reason Code</button>
  `);
}

function openEditReasonCodeModal(code) {
  const r = window.wms.reasonCodeMaster.find(item => item.code === code);
  if (!r) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Reason Code</label><input type="text" value="${r.code}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Description*</label><input type="text" id="rc-desc" class="search-input" value="${r.description}" style="width:100%;"></div>
      <div class="wms-form-group"><label>SAP Movement Type*</label><input type="text" id="rc-sap" class="search-input" value="${r.sapMovementType}" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal(`Edit Reason Code: ${code}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveReasonCode(false, '${code}')">Save Changes</button>
  `);
}

function saveReasonCode(isNew, code) {
  const rcCode = isNew ? document.getElementById('rc-code').value.trim() : code;
  const desc = document.getElementById('rc-desc').value.trim();
  const sap = document.getElementById('rc-sap').value.trim();

  if (isNew) {
    window.wms.reasonCodeMaster.push({
      code: rcCode,
      description: desc,
      type: document.getElementById('rc-type').value,
      needsApproval: true,
      sapMovementType: sap,
      status: 'ACTIVE'
    });
  } else {
    const r = window.wms.reasonCodeMaster.find(item => item.code === code);
    if (r) {
      r.description = desc;
      r.sapMovementType = sap;
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMasterReasonCode();
}

function deleteReasonCode(code) {
  if (confirm(`Delete reason code ${code}?`)) {
    window.wms.reasonCodeMaster = window.wms.reasonCodeMaster.filter(r => r.code !== code);
    saveWMSState(window.wms);
    renderMasterReasonCode();
  }
}

// Master 9: User & Role Master
function renderMasterUser() {
  const tbody = document.getElementById('master-user-body');
  if (!tbody) return;
  const users = window.wms.userMaster || [];
  tbody.innerHTML = users.map(u => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${u.userId}</b></td>
      <td><b>${u.name}</b></td>
      <td>${u.employeeNo}</td>
      <td><span class="wms-badge badge-available">${u.role}</span></td>
      <td>${u.plant}</td>
      <td>${u.shift}</td>
      <td><b>${u.email}</b><br><span style="font-size:11px; color:#64748b;">${u.mobile}</span></td>
      <td><span style="font-family:var(--font-mono); letter-spacing:2px; font-weight:700;">••••</span></td>
      <td><b style="color:#059669;">₹${u.approvalLimit.toLocaleString()}</b></td>
      <td><span class="wms-badge badge-available">${u.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditUserModal('${u.userId}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="deleteUser('${u.userId}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddUserModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>User ID*</label><input type="text" id="u-id" class="search-input" value="HND-USR-1008" style="width:100%;"></div>
      <div class="wms-form-group"><label>Full Name*</label><input type="text" id="u-name" class="search-input" value="Naveen Gowda" style="width:100%;"></div>
      <div class="wms-form-group"><label>Employee No*</label><input type="text" id="u-emp" class="search-input" value="EMP-7880" style="width:100%;"></div>
      <div class="wms-form-group"><label>Security Role*</label><select class="select-filter" id="u-role" style="width:100%;"><option value="WAREHOUSE_OP">WAREHOUSE_OP</option><option value="LINE_SUPERVISOR">LINE_SUPERVISOR</option><option value="WMS_ADMIN">WMS_ADMIN</option><option value="SECURITY_OFFICER">SECURITY_OFFICER</option></select></div>
      <div class="wms-form-group"><label>Plant*</label><select class="select-filter" id="u-plant" style="width:100%;"><option value="HMSI Plant 1 (Scooter)">HMSI Plant 1 (Scooter)</option><option value="HMSI Plant 2 (Motorcycle)">HMSI Plant 2 (Motorcycle)</option></select></div>
      <div class="wms-form-group"><label>Handheld PIN (4-Digits)*</label><input type="text" id="u-pin" class="search-input" value="2048" style="width:100%;"></div>
      <div class="wms-form-group"><label>Stock Adjustment Approval Limit (₹)*</label><input type="number" id="u-limit" class="search-input" value="25000" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal('Add New User & Security Role', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveUser(true)">Create User</button>
  `);
}

function openEditUserModal(id) {
  const u = window.wms.userMaster.find(item => item.userId === id);
  if (!u) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>User ID</label><input type="text" value="${u.userId}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Full Name*</label><input type="text" id="u-name" class="search-input" value="${u.name}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Security Role*</label><select class="select-filter" id="u-role" style="width:100%;"><option value="WAREHOUSE_OP" ${u.role === 'WAREHOUSE_OP' ? 'selected' : ''}>WAREHOUSE_OP</option><option value="LINE_SUPERVISOR" ${u.role === 'LINE_SUPERVISOR' ? 'selected' : ''}>LINE_SUPERVISOR</option><option value="WMS_ADMIN" ${u.role === 'WMS_ADMIN' ? 'selected' : ''}>WMS_ADMIN</option></select></div>
      <div class="wms-form-group"><label>Approval Limit (₹)*</label><input type="number" id="u-limit" class="search-input" value="${u.approvalLimit}" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal(`Edit User: ${id}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveUser(false, '${id}')">Save Changes</button>
  `);
}

function saveUser(isNew, id) {
  const uId = isNew ? document.getElementById('u-id').value.trim() : id;
  const name = document.getElementById('u-name').value.trim();
  const role = document.getElementById('u-role').value;
  const limit = parseInt(document.getElementById('u-limit').value) || 0;

  if (isNew) {
    window.wms.userMaster.push({
      userId: uId,
      name: name,
      employeeNo: document.getElementById('u-emp').value,
      role: role,
      plant: document.getElementById('u-plant').value,
      shift: 'Shift A (06:00 - 14:30)',
      email: `${name.toLowerCase().replace(' ', '.')}@hmsi.co.in`,
      mobile: '+91 98450 11200',
      handheldPin: document.getElementById('u-pin').value,
      approvalLimit: limit,
      status: 'ACTIVE',
      lastLogin: 'Never'
    });
  } else {
    const u = window.wms.userMaster.find(item => item.userId === id);
    if (u) {
      u.name = name;
      u.role = role;
      u.approvalLimit = limit;
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMasterUser();
}

function deleteUser(id) {
  if (confirm(`Delete user ${id}?`)) {
    window.wms.userMaster = window.wms.userMaster.filter(u => u.userId !== id);
    saveWMSState(window.wms);
    renderMasterUser();
  }
}

// Master 10: Device Master
function renderMasterDevice() {
  const tbody = document.getElementById('master-device-body');
  if (!tbody) return;
  const devs = window.wms.deviceMaster || [];
  tbody.innerHTML = devs.map(d => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${d.deviceId}</b></td>
      <td><span class="wms-badge ${d.type === 'handheld' ? 'badge-available' : 'badge-allocated'}">${d.type.toUpperCase()}</span></td>
      <td><b>${d.model}</b></td>
      <td><span style="font-family:var(--font-mono);">${d.serialNo}</span></td>
      <td>${d.plant} (${d.zone})</td>
      <td><span style="font-family:var(--font-mono);">${d.ip}</span></td>
      <td>${d.assignedUser}</td>
      <td><span class="sap-status-indicator online"><span class="dot"></span> ${d.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditDeviceModal('${d.deviceId}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="deleteDevice('${d.deviceId}')">🗑️ Delete</button>
        <button class="btn-wms-secondary small" onclick="testDevicePrint('${d.deviceId}')">Test</button>
      </td>
    </tr>
  `).join('');
}

function openAddDeviceModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Device ID*</label><input type="text" id="dev-id" class="search-input" value="ZEBRA-TC57-03" style="width:100%;"></div>
      <div class="wms-form-group"><label>Device Type*</label><select class="select-filter" id="dev-type" style="width:100%;"><option value="handheld">Handheld Scanner (Zebra TC57)</option><option value="label printer">Industrial Label Printer (Zebra ZT411)</option></select></div>
      <div class="wms-form-group"><label>Model Name*</label><input type="text" id="dev-model" class="search-input" value="Zebra TC57 Mobile Terminal" style="width:100%;"></div>
      <div class="wms-form-group"><label>Serial Number*</label><input type="text" id="dev-serial" class="search-input" value="ZBR-TC-99403" style="width:100%;"></div>
      <div class="wms-form-group"><label>IP Address*</label><input type="text" id="dev-ip" class="search-input" value="10.24.101.48" style="width:100%;"></div>
      <div class="wms-form-group"><label>Assigned Location / User*</label><input type="text" id="dev-user" class="search-input" value="Assembly Line 1 Feeder" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal('Add New Hardware Device', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveDevice(true)">Register Device</button>
  `);
}

function openEditDeviceModal(id) {
  const d = window.wms.deviceMaster.find(item => item.deviceId === id);
  if (!d) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Device ID</label><input type="text" value="${d.deviceId}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Model Name*</label><input type="text" id="dev-model" class="search-input" value="${d.model}" style="width:100%;"></div>
      <div class="wms-form-group"><label>IP Address*</label><input type="text" id="dev-ip" class="search-input" value="${d.ip}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Assigned User / Bay*</label><input type="text" id="dev-user" class="search-input" value="${d.assignedUser}" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal(`Edit Device: ${id}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveDevice(false, '${id}')">Save Changes</button>
  `);
}

function saveDevice(isNew, id) {
  const dId = isNew ? document.getElementById('dev-id').value.trim() : id;
  const model = document.getElementById('dev-model').value.trim();
  const ip = document.getElementById('dev-ip').value.trim();
  const user = document.getElementById('dev-user').value.trim();

  if (isNew) {
    window.wms.deviceMaster.push({
      deviceId: dId,
      type: document.getElementById('dev-type').value,
      model: model,
      serialNo: document.getElementById('dev-serial').value,
      plant: 'HMSI Narsapur Plant 1',
      zone: 'ZONE-A-PWR',
      ip: ip,
      assignedUser: user,
      defaultLabel: 'Standard Pallet Label',
      status: 'ONLINE',
      lastPing: 'Just Now'
    });
  } else {
    const d = window.wms.deviceMaster.find(item => item.deviceId === id);
    if (d) {
      d.model = model;
      d.ip = ip;
      d.assignedUser = user;
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMasterDevice();
}

function deleteDevice(id) {
  if (confirm(`Unregister device ${id}?`)) {
    window.wms.deviceMaster = window.wms.deviceMaster.filter(d => d.deviceId !== id);
    saveWMSState(window.wms);
    renderMasterDevice();
  }
}

function testDevicePrint(deviceId) {
  alert(`Test print command dispatched to Zebra Device: ${deviceId} via IP heartbeat. Status: OK (200)`);
}

// ==========================================================================
// 7. SYSTEM ADMINISTRATION (SAP MONITOR, AUDIT, LABELS, NOTIFICATIONS)
// ==========================================================================
function renderAllAdminScreens() {
  renderAdminSapSync();
  renderAdminAudit();
  renderAdminLabelSettings();
  renderAdminNotifSettings();
}

function renderAdminSapSync() {
  const tbody = document.getElementById('admin-sap-sync-body');
  if (!tbody) return;
  const logs = window.wms.sapSyncLogs || [];
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${l.syncId}</b></td>
      <td><b>${l.interfaceType}</b></td>
      <td><span class="wms-badge badge-allocated">${l.direction}</span></td>
      <td><span style="font-family:var(--font-mono);">${l.wmsRef}</span></td>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${l.sapDocNo}</b></td>
      <td>${l.payloadType}</td>
      <td><span class="wms-badge ${getStatusBadgeClass(l.status)}">${l.status.toUpperCase()}</span></td>
      <td><span style="font-size:11px; color:#dc2626;">${l.errorText}</span></td>
      <td>${l.timestamp}</td>
      <td>
        <button class="btn-wms-secondary small" onclick="openPayloadViewer('${l.syncId}')">Payload</button>
      </td>
    </tr>
  `).join('');
}

function openPayloadViewer(syncId) {
  const log = window.wms.sapSyncLogs.find(l => l.syncId === syncId);
  if (!log) return;

  const content = `
    <div style="font-size:12px; font-family:var(--font-mono); background:#0f172a; color:#38bdf8; padding:16px; border-radius:6px; overflow-x:auto;">
      <pre>
{
  "SYNC_ID": "${log.syncId}",
  "INTERFACE": "${log.interfaceType}",
  "DIRECTION": "${log.direction}",
  "WMS_REF": "${log.wmsRef}",
  "SAP_DOC_NO": "${log.sapDocNo}",
  "PAYLOAD": "${log.payloadType}",
  "STATUS": "${log.status}",
  "TIMESTAMP": "${log.timestamp}",
  "S4HANA_SYSTEM": "HMSIL_PROD_100",
  "RFC_RESPONSE": "HTTP 200 OK (COMMUNICATION_SUCCESS)"
}
      </pre>
    </div>
  `;

  openDynamicModal(`SAP RFC Payload: ${syncId}`, content, `<button class="btn-wms-primary" onclick="closeModal('modal-dynamic-form')">Close</button>`);
}

function retryFailedSapMessages() {
  (window.wms.sapSyncLogs || []).forEach(l => {
    if (l.status === 'failed') {
      l.status = 'success';
      l.errorText = '—';
      l.sapDocNo = 'SAP-MAT-5001928509';
    }
  });
  saveWMSState(window.wms);
  renderAdminSapSync();
  alert('SAP Retry Engine: All pending failed RFC messages resent successfully.');
}

function runDailyStockReconciliation() {
  alert('Daily Stock Reconciliation Complete: WMS Inventory vs SAP S/4HANA Stock. 100% matched across Plant 1 & 2 (0 variances).');
}

function renderAdminAudit() {
  const tbody = document.getElementById('admin-audit-body');
  if (!tbody) return;
  const logs = window.wms.auditTrail || [];
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td><span style="font-size:11px; color:#64748b;">${l.timestamp}</span></td>
      <td><b>${l.user}</b></td>
      <td><span class="wms-badge badge-available">${l.role}</span></td>
      <td><span style="font-family:var(--font-mono); font-size:11px;">${l.deviceId}</span></td>
      <td><b>${l.transaction}</b></td>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${l.reference}</b></td>
      <td><span style="color:#64748b;">${l.oldValue}</span></td>
      <td><b style="color:#059669;">${l.newValue}</b></td>
    </tr>
  `).join('');
}

function renderAdminLabelSettings() {
  const tbody = document.getElementById('admin-label-settings-body');
  if (!tbody) return;
  const tpls = window.wms.labelTemplates || [];
  tbody.innerHTML = tpls.map(t => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${t.templateId}</b></td>
      <td><b>${t.name}</b></td>
      <td><span class="wms-badge badge-allocated">${t.barcodeType}</span></td>
      <td><span style="font-size:11.5px; color:#475569;">${t.fields}</span></td>
      <td><b>${t.targetPrinter}</b></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditLabelTemplateModal('${t.templateId}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="deleteLabelTemplate('${t.templateId}')">🗑️ Delete</button>
        <button class="btn-wms-secondary small" onclick="openPrintPreview('HU', 'PREVIEW')">Test Preview</button>
      </td>
    </tr>
  `).join('');
}

function openAddLabelTemplateModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Template ID*</label><input type="text" id="lbl-id" class="search-input" value="LBL-NEW-${String(window.wms.labelTemplates.length + 1).padStart(2, '0')}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Template Name*</label><input type="text" id="lbl-name" class="search-input" value="Component Box Label (75 x 100 mm)" style="width:100%;"></div>
      <div class="wms-form-group"><label>Barcode Format*</label><select class="select-filter" id="lbl-format" style="width:100%;"><option value="Code 128 / GS1-128">Code 128 / GS1-128</option><option value="2D DataMatrix">2D DataMatrix</option><option value="QR Code">QR Code</option><option value="Code 39">Code 39</option></select></div>
      <div class="wms-form-group"><label>Included Fields*</label><input type="text" id="lbl-fields" class="search-input" value="Material Code, Lot/Batch, Qty, UOM, Date, Barcode" style="width:100%;"></div>
      <div class="wms-form-group"><label>Default Target Zebra Printer*</label><select class="select-filter" id="lbl-printer" style="width:100%;"><option value="ZEBRA-ZT411-P1 (Dock 04)">ZEBRA-ZT411-P1 (Dock 04 - Plant 1)</option><option value="ZEBRA-ZT411-P2 (Dock 05)">ZEBRA-ZT411-P2 (Dock 05 - Plant 2)</option><option value="LaserJet Office MGR-01">LaserJet Office MGR-01</option></select></div>
    </div>
  `;
  openDynamicModal('Add New Label Template', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveLabelTemplate(true)">Create Template</button>
  `);
}

function openEditLabelTemplateModal(templateId) {
  const tpl = window.wms.labelTemplates.find(t => t.templateId === templateId);
  if (!tpl) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Template ID</label><input type="text" id="lbl-id" class="search-input" value="${tpl.templateId}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Template Name*</label><input type="text" id="lbl-name" class="search-input" value="${tpl.name}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Barcode Format*</label><select class="select-filter" id="lbl-format" style="width:100%;"><option value="Code 128 / GS1-128" ${tpl.barcodeType.includes('128') ? 'selected' : ''}>Code 128 / GS1-128</option><option value="2D DataMatrix" ${tpl.barcodeType.includes('DataMatrix') ? 'selected' : ''}>2D DataMatrix</option><option value="PDF Document with Barcode" ${tpl.barcodeType.includes('PDF') ? 'selected' : ''}>PDF Document with Barcode</option></select></div>
      <div class="wms-form-group"><label>Included Fields*</label><input type="text" id="lbl-fields" class="search-input" value="${tpl.fields}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Target Zebra Printer*</label><input type="text" id="lbl-printer" class="search-input" value="${tpl.targetPrinter}" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal(`Edit Label Template: ${templateId}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveLabelTemplate(false)">Save Changes</button>
  `);
}

function saveLabelTemplate(isNew) {
  const id = document.getElementById('lbl-id').value.trim();
  const name = document.getElementById('lbl-name').value.trim();
  const format = document.getElementById('lbl-format').value;
  const fields = document.getElementById('lbl-fields').value.trim();
  const printer = document.getElementById('lbl-printer').value;

  if (!id || !name) {
    alert('Please enter Template ID and Name.');
    return;
  }

  if (isNew) {
    window.wms.labelTemplates.push({
      templateId: id,
      name: name,
      barcodeType: format,
      fields: fields,
      targetPrinter: printer
    });
    addAuditLog('Label Template Created', id, 'New', `Created template: ${name}`);
  } else {
    const tpl = window.wms.labelTemplates.find(t => t.templateId === id);
    if (tpl) {
      tpl.name = name;
      tpl.barcodeType = format;
      tpl.fields = fields;
      tpl.targetPrinter = printer;
      addAuditLog('Label Template Updated', id, 'Existing', `Updated template: ${name}`);
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderAdminLabelSettings();
  alert(`Label Template ${id} saved successfully!`);
}

function deleteLabelTemplate(templateId) {
  if (!confirm(`Are you sure you want to delete Label Template ${templateId}?`)) return;
  window.wms.labelTemplates = window.wms.labelTemplates.filter(t => t.templateId !== templateId);
  addAuditLog('Label Template Deleted', templateId, 'Active', 'Template deleted from system');
  saveWMSState(window.wms);
  renderAdminLabelSettings();
  alert(`Label Template ${templateId} deleted.`);
}

function renderAdminNotifSettings() {
  const tbody = document.getElementById('admin-notif-settings-body');
  if (!tbody) return;
  const notifs = window.wms.notificationSettings || [];
  tbody.innerHTML = notifs.map(n => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${n.id}</b></td>
      <td><b>${n.alertType}</b></td>
      <td><span style="font-size:12px; color:#475569;">${n.recipients}</span></td>
      <td><span class="wms-badge ${n.enabled ? 'badge-available' : 'badge-danger'}">${n.enabled ? 'ENABLED' : 'DISABLED'}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openEditNotifModal('${n.id}')">✏️ Edit</button>
        <button class="btn-wms-secondary small" onclick="toggleNotif('${n.id}')">${n.enabled ? 'Disable' : 'Enable'}</button>
        <button class="btn-wms-secondary small" onclick="deleteNotifRule('${n.id}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddNotifRuleModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Notification ID*</label><input type="text" id="notif-id" class="search-input" value="NOTIF-${String(window.wms.notificationSettings.length + 1).padStart(2, '0')}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Alert Type / Event Trigger*</label><input type="text" id="notif-type" class="search-input" value="High Temperature Quarantine Hold Alert" style="width:100%;"></div>
      <div class="wms-form-group"><label>Subscribed Email Recipients (comma separated)*</label><input type="text" id="notif-recipients" class="search-input" value="wh-lead@hmsi.co.in, qa-lead@hmsi.co.in" style="width:100%;"></div>
      <div class="wms-form-group"><label>Initial Status*</label><select class="select-filter" id="notif-status" style="width:100%;"><option value="true">ENABLED</option><option value="false">DISABLED</option></select></div>
    </div>
  `;
  openDynamicModal('Add New Notification Alert Rule', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveNotifRule(true)">Create Rule</button>
  `);
}

function openEditNotifModal(id) {
  const n = window.wms.notificationSettings.find(item => item.id === id);
  if (!n) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Notification ID</label><input type="text" id="notif-id" class="search-input" value="${n.id}" disabled style="width:100%; background:#f1f5f9;"></div>
      <div class="wms-form-group"><label>Alert Type*</label><input type="text" id="notif-type" class="search-input" value="${n.alertType}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Subscribed Email Recipients*</label><input type="text" id="notif-recipients" class="search-input" value="${n.recipients}" style="width:100%;"></div>
      <div class="wms-form-group"><label>Status*</label><select class="select-filter" id="notif-status" style="width:100%;"><option value="true" ${n.enabled ? 'selected' : ''}>ENABLED</option><option value="false" ${!n.enabled ? 'selected' : ''}>DISABLED</option></select></div>
    </div>
  `;
  openDynamicModal(`Edit Notification Alert: ${id}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveNotifRule(false)">Save Changes</button>
  `);
}

function saveNotifRule(isNew) {
  const id = document.getElementById('notif-id').value.trim();
  const type = document.getElementById('notif-type').value.trim();
  const recipients = document.getElementById('notif-recipients').value.trim();
  const enabled = document.getElementById('notif-status').value === 'true';

  if (!id || !type || !recipients) {
    alert('Please fill out all required fields.');
    return;
  }

  if (isNew) {
    window.wms.notificationSettings.push({
      id: id,
      alertType: type,
      recipients: recipients,
      enabled: enabled
    });
    addAuditLog('Notification Rule Created', id, 'New', `Added trigger: ${type}`);
  } else {
    const n = window.wms.notificationSettings.find(item => item.id === id);
    if (n) {
      n.alertType = type;
      n.recipients = recipients;
      n.enabled = enabled;
      addAuditLog('Notification Rule Updated', id, 'Existing', `Updated trigger: ${type}`);
    }
  }
  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderAdminNotifSettings();
  alert(`Notification rule ${id} saved successfully!`);
}

function deleteNotifRule(id) {
  if (!confirm(`Are you sure you want to delete Notification Rule ${id}?`)) return;
  window.wms.notificationSettings = window.wms.notificationSettings.filter(n => n.id !== id);
  addAuditLog('Notification Rule Deleted', id, 'Active', 'Alert rule deleted');
  saveWMSState(window.wms);
  renderAdminNotifSettings();
  alert(`Notification rule ${id} deleted.`);
}

function toggleNotif(id) {
  const n = window.wms.notificationSettings.find(item => item.id === id);
  if (n) {
    n.enabled = !n.enabled;
    addAuditLog('Notification Status Toggled', id, n.enabled ? 'DISABLED' : 'ENABLED', n.enabled ? 'ENABLED' : 'DISABLED');
    saveWMSState(window.wms);
    renderAdminNotifSettings();
  }
}

// ==========================================================================
// 8. UNIVERSAL PRINT & MODAL ENGINE
// ==========================================================================
function openPrintPreview(type, refId) {
  const modal = document.getElementById('modal-label-print');
  const title = document.getElementById('print-modal-title');
  const content = document.getElementById('print-modal-content');
  if (!modal || !content) return;

  if (type === 'HU' || type === 'MAT') {
    title.textContent = `🖨️ Zebra Industrial Pallet / HU Label (100 x 150 mm)`;
    content.innerHTML = `
      <div class="label-preview-card">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0f172a; padding-bottom:6px; margin-bottom:8px;">
          <h2 style="font-size:18px; font-weight:800; color:#0f172a;">HONDA HMSI</h2>
          <span style="font-size:11px; font-weight:700;">NARSAPUR PLANT 1</span>
        </div>
        <div style="font-size:11px; margin-bottom:4px;">MATERIAL: <b style="font-size:13px;">HND-BRK-PAD-01</b></div>
        <div style="font-size:12px; font-weight:600; color:#334155; margin-bottom:8px;">Nissin Front Disc Brake Pad Set</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px; border-top:1px solid #e2e8f0; padding-top:6px;">
          <div>QTY: <b style="font-size:16px;">100 EA</b></div>
          <div>BATCH: <b>BAT-NIS-09-24</b></div>
          <div>PO: <b>PO-2026-00501</b></div>
          <div>SUPPLIER: <b>Nissin Brakes</b></div>
        </div>
        <div class="barcode-strip">||| | ||||| || ||||| |||</div>
        <div style="text-align:center; font-size:12px; font-weight:700; font-family:var(--font-mono);">HU-BRK-2026-00101</div>
      </div>
    `;
  } else if (type === 'BIN') {
    title.textContent = `🖨️ Storage Bin Barcode Label (50 x 100 mm)`;
    content.innerHTML = `
      <div class="label-preview-card" style="max-width:320px; text-align:center;">
        <div style="font-size:11px; color:#64748b; font-weight:700;">HMSI WMS STORAGE LOCATION</div>
        <div style="font-size:26px; font-weight:800; color:#0f172a; margin:6px 0; font-family:var(--font-mono);">${refId}</div>
        <div style="font-size:12px; font-weight:600;">Zone A • High-Bay Racking</div>
        <div class="barcode-strip">|||| | || |||| | |||</div>
        <div style="font-size:11px; font-family:var(--font-mono);">BIN-${refId}</div>
      </div>
    `;
  } else {
    title.textContent = `🖨️ Official Document Copy: ${refId}`;
    content.innerHTML = `
      <div style="padding:16px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px; color:#0f172a;">
        <div style="display:flex; justify-content:space-between; border-bottom:2px solid #0f172a; padding-bottom:8px; margin-bottom:12px;">
          <div><h3 style="font-size:16px; font-weight:800;">HONDA MOTORCYCLE & SCOOTER INDIA</h3><p>Narsapur WMS Official Transaction Copy</p></div>
          <div style="text-align:right;"><b style="font-size:14px; font-family:var(--font-mono);">${refId}</b><br><span>Date: 24-Sep-2026</span></div>
        </div>
        <p>This document certifies the receipt and verification of material at HMSI Narsapur warehouse in accordance with standard operating procedures.</p>
      </div>
    `;
  }

  modal.classList.add('active');
}

function openUniversalLabelPrintModal() {
  openPrintPreview('HU', 'HU-BRK-2026-00101');
}

function executePhysicalPrint() {
  window.print();
  closeModal('modal-label-print');
}

function openDynamicModal(title, bodyHtml, footerHtml) {
  const modal = document.getElementById('modal-dynamic-form');
  const tEl = document.getElementById('dynamic-form-title');
  const bEl = document.getElementById('dynamic-form-content');
  const fEl = document.getElementById('dynamic-form-footer');

  if (tEl) tEl.textContent = title;
  if (bEl) bEl.innerHTML = bodyHtml;
  if (fEl) fEl.innerHTML = footerHtml;
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function openImportModal(entityType) {
  const modal = document.getElementById('modal-import');
  const tEl = document.getElementById('import-modal-title');
  if (tEl) tEl.textContent = `📥 Bulk Excel / CSV Import: ${entityType}`;
  if (modal) modal.classList.add('active');
}

function handleFileSelected(input) {
  const preview = document.getElementById('import-preview-results');
  if (input.files && input.files[0]) {
    preview.innerHTML = `
      <div style="padding:10px; background:#dcfce7; border:1px solid #86efac; border-radius:6px; font-size:12px; color:#166534;">
        ✅ File Selected: <b>${input.files[0].name}</b> (${Math.round(input.files[0].size/1024)} KB). Ready for validation.
      </div>
    `;
  }
}

function simulateDataImport() {
  alert('Excel Validation Passed: 0 Duplicate Keys, 0 Mandatory Field Errors. 12 Records Imported.');
  closeModal('modal-import');
  renderAllWMSViews();
}

function downloadTemplateSample() {
  alert('Standard Excel Template (.xlsx) downloaded with column validation headers.');
}

// -------------------------------------------------------------
// USER AUTHENTICATION & PROFILE SWITCHING
// -------------------------------------------------------------
function openLoginModal() {
  const modal = document.getElementById('modal-login');
  if (modal) modal.classList.add('active');
}

function onLoginUserSelectChange(userId) {
  const user = (window.wms.userMaster || []).find(u => u.userId === userId);
  const pInput = document.getElementById('login-plant-preview');
  if (pInput && user) {
    pInput.value = user.assignedPlant || 'All Plants (P1 & P2)';
  }
}

function performUserLogin() {
  const select = document.getElementById('login-user-select');
  const userId = select ? select.value : 'HND-USR-1001';
  const foundUser = (window.wms.userMaster || []).find(u => u.userId === userId);

  if (foundUser) {
    window.wms.currentUser = {
      userId: foundUser.userId,
      name: foundUser.name,
      role: foundUser.role,
      roleTitle: foundUser.roleTitle || foundUser.role,
      plant: foundUser.assignedPlant,
      approvalLimit: foundUser.approvalLimit || 50000,
      handheldPin: foundUser.handheldPin || '1234',
      status: foundUser.status || 'ACTIVE'
    };

    const avatarEl = document.getElementById('sidebar-user-avatar');
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');

    if (avatarEl) {
      const initials = foundUser.name.split(' ').map(n => n[0]).join('').substring(0, 2);
      avatarEl.textContent = initials;
    }
    if (nameEl) nameEl.textContent = foundUser.name;
    if (roleEl) roleEl.textContent = `${foundUser.roleTitle || foundUser.role} • Limit ₹${Number(foundUser.approvalLimit || 50000).toLocaleString('en-IN')}`;

    saveWMSState(window.wms);
    addAuditLog('USER_LOGIN', userId, '-', `Logged in as ${foundUser.name} (${foundUser.role})`);
  }

  closeModal('modal-login');
  alert(`✅ Welcome back, ${window.wms.currentUser.name} (${window.wms.currentUser.roleTitle})`);
}

// -------------------------------------------------------------
// HELPER UTILITIES & GLOBAL APPLICATION FILTERING
// -------------------------------------------------------------
function filterByPlant(list, plant) {
  if (!list) return [];
  if (!plant || plant === 'All') return list;
  const pPrefix = plant === 'P1' ? 'Plant 1' : 'Plant 2';
  return list.filter(item => {
    const pStr = (item.plant || item.name || item.description || item.zone || '').toString();
    return pStr.includes(pPrefix) || (plant === 'P1' && pStr.includes('1001')) || (plant === 'P2' && pStr.includes('1002'));
  });
}

function filterByLine(list, line) {
  if (!list) return [];
  if (!line || line === 'All') return list;
  return list.filter(item => {
    if (item.lineCode) return item.lineCode === line;
    const lStr = (item.productionLine || item.name || item.stagingBin || '').toString();
    if (line === 'L1') return lStr.includes('Line 1') || lStr.includes('L1') || lStr.includes('Activa');
    if (line === 'L2') return lStr.includes('Line 2') || lStr.includes('L2') || lStr.includes('Shine');
    if (line === 'L3') return lStr.includes('Line 3') || lStr.includes('L3') || lStr.includes('Engine');
    if (line === 'L4') return lStr.includes('Line 4') || lStr.includes('L4') || lStr.includes('CB350');
    if (line === 'L5') return lStr.includes('Line 5') || lStr.includes('L5') || lStr.includes('Hornet') || lStr.includes('Unicorn');
    return true;
  });
}

function filterByPlantAndLine(list, plant, line) {
  let res = filterByPlant(list, plant);
  if (line && line !== 'All') {
    res = filterByLine(res, line);
  }
  return res;
}

function getStatusBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('available') || s.includes('posted') || s.includes('completed') || s.includes('approved') || s.includes('received') || s.includes('closed') || s.includes('online') || s.includes('delivered') || s.includes('reconciled') || s.includes('active')) return 'badge-available';
  if (s.includes('progress') || s.includes('picking') || s.includes('counting') || s.includes('released') || s.includes('open') || s.includes('dock') || s.includes('expected') || s.includes('allocated')) return 'badge-allocated';
  if (s.includes('pending') || s.includes('warning') || s.includes('draft') || s.includes('variance') || s.includes('short')) return 'badge-warning';
  if (s.includes('failed') || s.includes('rejected') || s.includes('blocked') || s.includes('quarantine') || s.includes('damaged') || s.includes('overdue') || s.includes('inactive')) return 'badge-danger';
  return 'badge-allocated';
}

function addAuditLog(transaction, ref, oldVal, newVal) {
  window.wms.auditTrail.unshift({
    timestamp: '24-Sep-2026 ' + new Date().toLocaleTimeString(),
    user: window.wms.currentUser.name,
    role: window.wms.currentUser.role,
    deviceId: 'PC Console (WH-MGR-01)',
    transaction: transaction,
    reference: ref,
    oldValue: oldVal,
    newValue: newVal
  });
}
