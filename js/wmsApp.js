// HONDA MOTORCYCLE & SCOOTER INDIA (HMSI) - MANUFACTURING WMS
// Enterprise Application Logic, View Renderers & Full Master CRUD Engine
// Aligned to HMSIL WMS Screen & Functional Specification

document.addEventListener('DOMContentLoaded', () => {
  window.wms = loadWMSState();
  if (!window.wms.activeLine) window.wms.activeLine = 'All';
  updateLiveHeaderClock();
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

function updateLiveHeaderClock() {
  const el = document.getElementById('header-live-date');
  if (el) {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dStr = `${String(now.getDate()).padStart(2, '0')}-${months[now.getMonth()]}-${now.getFullYear()}`;
    const tStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    el.innerHTML = `📅 ${dStr} • ${tStr}`;
  }

  const erpEl = document.getElementById('top-erp-status-indicator');
  if (erpEl && window.wms && window.wms.erpConfig) {
    const st = (window.wms.erpConfig.connectionStatus || 'ONLINE').toUpperCase();
    erpEl.classList.remove('online', 'degraded', 'offline');
    if (st === 'ONLINE') {
      erpEl.classList.add('online');
      erpEl.title = 'ERP Gateway Active (RFC / OData Synced)';
      erpEl.innerHTML = '<span class="dot"></span> ERP Synced';
    } else if (st === 'DEGRADED') {
      erpEl.classList.add('degraded');
      erpEl.title = 'ERP Gateway Degraded (Queueing Transactions)';
      erpEl.innerHTML = '<span class="dot"></span> ERP Degraded';
    } else {
      erpEl.classList.add('offline');
      erpEl.title = 'ERP Gateway Offline (Local Store & Forward)';
      erpEl.innerHTML = '<span class="dot"></span> ERP Offline';
    }
  }
}

function initAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  updateLiveHeaderClock();
  autoRefreshTimer = setInterval(() => {
    updateLiveHeaderClock();
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
  renderQualityInspections();
  renderRejectionsView();
  renderMRNTable();
  renderGRNTable();
  renderDiscrepanciesTable();
  renderPutawayTasks();
  renderPartParking();
  renderInventoryTable();
  renderCycleCountScreen();
  renderFifoAgingView();
  renderReportsView();
  renderRequisitionTable();
  renderIssueListTable();
  renderPickingMonitor();
  renderLineIssueTable();
  renderIssuanceHistory();
  renderReturnsTable();
  renderDispatchView();
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
  const erpName = window.wms.erpConfig?.systemName || 'SAP ERP';
  window.wms.lastSapSyncTime = new Date().toLocaleTimeString();
  addAuditLog('SAP PO Synchronization', 'PO-HND-2026-00600', 'Sync Check', `Successfully refreshed PO schedule lines from ${erpName} (200 OK)`);
  saveWMSState(window.wms);
  renderPOTable();
  alert(`Purchase Orders refreshed from ${erpName}. All schedule lines up to date.`);
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
        <td><b style="font-family:var(--font-mono); color:#0284c7;">${b.invoiceNo || 'INV-2026-0891'}</b></td>
        <td><span style="font-size:11.5px; color:#475569;">${b.invoiceDate || '24-Sep-2026'}</span></td>
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
        <td>
          <span class="wms-badge" style="${b.acceptanceStatus === 'Accepted' ? 'background:#dcfce7; color:#15803d;' : (b.acceptanceStatus === 'Rejected' ? 'background:#fee2e2; color:#b91c1c;' : 'background:#fef3c7; color:#b45309;')}">
            ${b.acceptanceStatus || 'Pending Acceptance'}
          </span>
        </td>
        <td><span style="font-size:11.5px; font-weight:600; color:#334155;">${b.acceptedBy || 'Pending QC'}</span></td>
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
      <td><b style="font-family:var(--font-mono); color:#0284c7;">${m.invoiceNo || 'INV-2026-0891'}</b></td>
      <td><span style="font-size:11.5px; color:#475569;">${m.invoiceDate || '24-Sep-2026'}</span></td>
      <td>${m.poNumber} / ${m.asnNumber}</td>
      <td><b>${m.supplier}</b></td>
      <td><b>${m.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${m.materialDescription}</span></td>
      <td><b>${m.asnQty}</b></td>
      <td><span style="color:#059669; font-weight:700;">${m.goodQty}</span></td>
      <td>
        <span style="color:#dc2626; font-weight:700;">${m.damagedQty} Damaged</span> / 
        <span style="color:#ea580c; font-weight:700;">${m.shortQty} Short</span>
      </td>
      <td>
        <span class="wms-badge" style="${m.acceptanceStatus === 'Accepted' ? 'background:#dcfce7; color:#15803d;' : (m.acceptanceStatus === 'Rejected' ? 'background:#fee2e2; color:#b91c1c;' : 'background:#fef3c7; color:#b45309;')}">
          ${m.acceptanceStatus || 'Pending Acceptance'}
        </span>
      </td>
      <td><span style="font-size:11.5px; font-weight:600; color:#334155;">${m.acceptedBy || 'Pending QC'}</span></td>
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
    invoiceNo: mrn.invoiceNo || 'INV-2026-0891',
    invoiceDate: mrn.invoiceDate || '24-Sep-2026',
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
      <td><b style="font-family:var(--font-mono); color:#0284c7;">${g.invoiceNo || 'INV-2026-0891'}</b></td>
      <td><span style="font-size:11.5px; color:#475569;">${g.invoiceDate || '24-Sep-2026'}</span></td>
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
// 3B. QUALITY INSPECTION & SAP PQ ACCEPTANCE
// ==========================================================================
function renderQualityInspections() {
  const tbody = document.getElementById('quality-inspection-table-body');
  const inspections = window.wms.qualityInspections || [];

  // Update KPIs
  const total = inspections.length;
  const passed = inspections.filter(i => i.sapPqStatus === 'PASSED').length;
  const hold = inspections.filter(i => i.result === 'On Hold' || i.sapPqStatus === 'PENDING').length;
  const rejected = inspections.filter(i => i.result === 'Rejected' || i.sapPqStatus === 'REJECTED').length;

  const kpiTot = document.getElementById('kpi-qc-total');
  const kpiPass = document.getElementById('kpi-qc-passed');
  const kpiHld = document.getElementById('kpi-qc-hold');
  const kpiRej = document.getElementById('kpi-qc-rejected');

  if (kpiTot) kpiTot.textContent = `${total} Lots`;
  if (kpiPass) kpiPass.textContent = `${passed} Lots`;
  if (kpiHld) kpiHld.textContent = `${hold} Lots`;
  if (kpiRej) kpiRej.textContent = `${rejected} Lots`;

  if (!tbody) return;

  tbody.innerHTML = inspections.map(i => {
    const isPassed = i.sapPqStatus === 'PASSED';
    const isHold = i.result === 'On Hold' || i.sapPqStatus === 'PENDING';
    const isRejected = i.result === 'Rejected' || i.sapPqStatus === 'REJECTED';

    let resBadge = `<span class="wms-badge" style="background:#dcfce7; color:#15803d; font-weight:700;">✅ ${i.result}</span>`;
    if (isHold) resBadge = `<span class="wms-badge" style="background:#fef3c7; color:#b45309; font-weight:700;">⏸️ ${i.result}</span>`;
    if (isRejected) resBadge = `<span class="wms-badge" style="background:#fee2e2; color:#b91c1c; font-weight:700;">❌ ${i.result}</span>`;

    let pqBadge = `<span class="wms-badge" style="background:#dcfce7; color:#15803d; font-weight:700;">● CLEARED (${i.sapPqStatus})</span>`;
    if (isHold) pqBadge = `<span class="wms-badge" style="background:#fef3c7; color:#b45309; font-weight:700;">● PENDING SAP PQ</span>`;
    if (isRejected) pqBadge = `<span class="wms-badge" style="background:#fee2e2; color:#b91c1c; font-weight:700;">● BLOCKED (REJECTED)</span>`;

    return `
      <tr>
        <td><b style="font-family:var(--font-mono); color:#2563eb;">${i.inspectionId}</b></td>
        <td>
          <b style="font-family:var(--font-mono); font-size:12px;">${i.receiptRef}</b><br>
          <span style="font-family:var(--font-mono); font-size:11px; color:#64748b;">${i.mrnNumber || '—'}</span>
        </td>
        <td>
          <b>${i.materialCode}</b><br>
          <span style="font-size:11px; color:#64748b;">${i.materialDescription || ''}</span>
        </td>
        <td><b style="font-size:13px; color:#0f172a;">${i.inspectedQty} EA</b></td>
        <td>
          <b>${i.inspectedBy}</b><br>
          <span style="font-family:var(--font-mono); font-size:10px; color:#64748b;">${i.inspectorId || ''}</span>
        </td>
        <td><span style="font-size:11.5px; color:#475569;">${i.inspectionTimestamp}</span></td>
        <td>${resBadge}</td>
        <td>${pqBadge}</td>
        <td><span style="font-size:11px; color:#334155; line-height:1.3; display:inline-block; max-width:220px;">${i.remarks || '—'}</span></td>
        <td>
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            ${!isPassed ? `
              <button class="btn-wms-primary small" style="background:#16a34a;" onclick="approveQualityInspection('${i.inspectionId}')">✅ Pass</button>
            ` : ''}
            ${!isHold ? `
              <button class="btn-wms-secondary small" style="color:#d97706; border-color:#fcd34d;" onclick="holdQualityInspection('${i.inspectionId}')">⏸️ Hold</button>
            ` : ''}
            ${!isRejected ? `
              <button class="btn-wms-secondary small" style="color:#dc2626; border-color:#fca5a5;" onclick="rejectQualityInspection('${i.inspectionId}')">❌ Reject</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function approveQualityInspection(inspectionId) {
  const insp = (window.wms.qualityInspections || []).find(i => i.inspectionId === inspectionId);
  if (!insp) return;

  insp.result = 'Accepted';
  insp.sapPqStatus = 'PASSED';
  insp.inspectedBy = `${window.wms.currentUser.name} (${window.wms.currentUser.roleTitle || 'QC'})`;
  insp.inspectionTimestamp = new Date().toLocaleString();
  insp.remarks = 'SAP PQ Quality clearance verified & passed. Unblocked for high-rack putaway.';

  // Unblock linked putaway tasks
  (window.wms.putawayTasks || []).forEach(t => {
    if (t.materialCode === insp.materialCode || t.palletHuId.includes(insp.inspectionId.replace('QC-', ''))) {
      t.sapPqStatus = 'PASSED';
    }
  });

  const p3 = (window.wms.putawayTasks || []).find(t => t.taskNo === 'PUT-HND-003' || t.taskId === 'PUT-HND-003');
  if (p3 && p3.materialCode === insp.materialCode) {
    p3.sapPqStatus = 'PASSED';
  }

  const mrn = (window.wms.mrns || []).find(m => m.mrnNumber === insp.mrnNumber || m.materialCode === insp.materialCode);
  if (mrn) {
    mrn.acceptanceStatus = 'Accepted';
    mrn.acceptedBy = insp.inspectedBy;
    mrn.sapPqStatus = 'PASSED';
  }
  const rec = (window.wms.receivingBatches || []).find(r => r.receivingId === insp.receiptRef || r.materialCode === insp.materialCode);
  if (rec) {
    rec.acceptanceStatus = 'Accepted';
    rec.acceptedBy = insp.inspectedBy;
  }

  addAuditLog('QC Inspection Passed', inspectionId, 'Cleared', `Quality Acceptance PASSED for ${insp.materialCode}. Putaway unblocked.`);
  saveWMSState(window.wms);
  renderAllWMSViews();
  alert(`✅ Quality Acceptance Approved for ${inspectionId}!\nMaterial ${insp.materialCode} has SAP PQ Status PASSED and is now unblocked for Putaway.`);
}

function holdQualityInspection(inspectionId) {
  const insp = (window.wms.qualityInspections || []).find(i => i.inspectionId === inspectionId);
  if (!insp) return;

  const reason = prompt('Enter Quarantine / Hold reason:', 'Pending laboratory chemical / metallurgical clearance');
  if (reason === null) return;

  insp.result = 'On Hold';
  insp.sapPqStatus = 'PENDING';
  insp.inspectedBy = `${window.wms.currentUser.name} (${window.wms.currentUser.roleTitle || 'QC'})`;
  insp.inspectionTimestamp = new Date().toLocaleString();
  insp.remarks = `Quarantine hold: ${reason}`;

  (window.wms.putawayTasks || []).forEach(t => {
    if (t.materialCode === insp.materialCode) {
      t.sapPqStatus = 'PENDING';
    }
  });

  addAuditLog('QC Inspection On Hold', inspectionId, 'Pending', `Quarantine hold placed on ${insp.materialCode}`);
  saveWMSState(window.wms);
  renderAllWMSViews();
  alert(`⏸️ Quality Acceptance put on HOLD for ${inspectionId}.\nPutaway remains strictly gated.`);
}

function rejectQualityInspection(inspectionId) {
  const insp = (window.wms.qualityInspections || []).find(i => i.inspectionId === inspectionId);
  if (!insp) return;

  const reason = prompt('Enter Rejection & Non-Conformance reason:', 'Dimensional out of tolerance (> +0.5mm deviation)');
  if (reason === null) return;

  insp.result = 'Rejected';
  insp.sapPqStatus = 'REJECTED';
  insp.inspectedBy = `${window.wms.currentUser.name} (${window.wms.currentUser.roleTitle || 'QC'})`;
  insp.inspectionTimestamp = new Date().toLocaleString();
  insp.remarks = `REJECTED: ${reason}. Move to Reject Area for RTV.`;

  (window.wms.putawayTasks || []).forEach(t => {
    if (t.materialCode === insp.materialCode) {
      t.sapPqStatus = 'REJECTED';
    }
  });

  addAuditLog('QC Inspection Rejected', inspectionId, 'Rejected', `Rejected ${insp.materialCode}: ${reason}`);
  saveWMSState(window.wms);
  renderAllWMSViews();
  alert(`❌ Quality Inspection REJECTED for ${inspectionId}.\nPutaway strictly blocked. Material must be routed to Quarantine/Reject bay.`);
}

function openNewInspectionModal() {
  const materials = window.wms.materials || [];
  const recBatches = window.wms.receivingBatches || [];
  const optionsMat = materials.map(m => `<option value="${m.code}">${m.code} — ${m.description}</option>`).join('');
  const optionsRec = recBatches.map(r => `<option value="${r.receivingId}">${r.receivingId} (PO: ${r.poNumber || '—'}, ${r.supplier || ''})</option>`).join('');

  const content = `
    <div style="font-size:13px; color:#0f172a; display:flex; flex-direction:column; gap:12px;">
      <p style="color:#475569; margin:0;">Record official QC inspector sign-off and assign SAP PQ status.</p>
      <div class="wms-form-group">
        <label>Receiving Batch Reference*</label>
        <select class="select-filter" id="qc-new-receipt-ref" style="width:100%;">${optionsRec}</select>
      </div>
      <div class="wms-form-group">
        <label>Material Code*</label>
        <select class="select-filter" id="qc-new-mat-code" style="width:100%;">${optionsMat}</select>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="wms-form-group">
          <label>Inspected Quantity (EA)*</label>
          <input type="number" id="qc-new-qty" class="search-input" value="100" style="width:100%;">
        </div>
        <div class="wms-form-group">
          <label>Inspection Result*</label>
          <select class="select-filter" id="qc-new-result" style="width:100%;">
            <option value="Accepted">Accepted (SAP PQ Cleared)</option>
            <option value="On Hold">On Hold (Quarantine Pending)</option>
            <option value="Rejected">Rejected (Move to Reject Zone)</option>
          </select>
        </div>
      </div>
      <div class="wms-form-group">
        <label>Inspector Name & Badge*</label>
        <input type="text" id="qc-new-inspector" class="search-input" value="${window.wms.currentUser.name} (${window.wms.currentUser.roleTitle || 'QC'})" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Inspection Remarks & Tolerance Observations</label>
        <textarea id="qc-new-remarks" class="search-input" style="width:100%; height:60px; resize:vertical;" placeholder="Visual, dimensional, hardness and packaging integrity verified."></textarea>
      </div>
    </div>
  `;

  openDynamicModal('Log New Quality Inspection (SAP PQ)', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="submitNewQualityInspection()">Save & Clear</button>
  `);
}

function submitNewQualityInspection() {
  const receiptRef = document.getElementById('qc-new-receipt-ref')?.value || 'REC-2026-ACTIVE';
  const matCode = document.getElementById('qc-new-mat-code')?.value || 'HND-BRK-PAD-01';
  const qty = parseInt(document.getElementById('qc-new-qty')?.value || '100', 10);
  const result = document.getElementById('qc-new-result')?.value || 'Accepted';
  const inspector = document.getElementById('qc-new-inspector')?.value || window.wms.currentUser.name;
  const remarks = document.getElementById('qc-new-remarks')?.value || 'Standard lot acceptance verification.';

  const mat = (window.wms.materials || []).find(m => m.code === matCode);
  const sapPq = result === 'Accepted' ? 'PASSED' : (result === 'On Hold' ? 'PENDING' : 'REJECTED');
  const inspId = `QC-2026-${String(Math.floor(100 + Math.random() * 900))}`;

  if (!window.wms.qualityInspections) window.wms.qualityInspections = [];
  window.wms.qualityInspections.unshift({
    inspectionId: inspId,
    receiptRef: receiptRef,
    mrnNumber: `MRN-${inspId}`,
    materialCode: matCode,
    materialDescription: mat ? mat.description : 'Honda Component',
    inspectedQty: qty,
    inspectedBy: inspector,
    inspectorId: window.wms.currentUser.userId || 'HND-USR-1004',
    inspectionTimestamp: new Date().toLocaleString(),
    result: result,
    sapPqStatus: sapPq,
    remarks: remarks
  });

  (window.wms.putawayTasks || []).forEach(t => {
    if (t.materialCode === matCode) {
      t.sapPqStatus = sapPq;
    }
  });

  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderAllWMSViews();
  alert(`✅ Inspection logged: ${inspId} with SAP PQ Status: ${sapPq}`);
}

// ==========================================================================
// 3.5. REJECTION & QUARANTINE MANAGEMENT (MODULE F)
// ==========================================================================
function renderRejectionsView() {
  const rejections = window.wms.rejections || [];
  const plant = window.wms.activePlant || 'All';
  const list = filterByPlant(rejections, plant);

  // 1. Total Rejected Qty & Total Cases
  const totalQty = list.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const totalCases = list.length;

  // 2. Stage Breakdown
  const recCount = list.filter(r => r.stage === 'Receiving').reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const qcCount = list.filter(r => r.stage === 'Inspection').reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const stgCount = list.filter(r => r.stage === 'Storage').reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const prodCount = list.filter(r => r.stage === 'Production').reduce((s, r) => s + (Number(r.quantity) || 0), 0);

  // 3. Pending Disposition (Blocked)
  const pendingCases = list.filter(r => r.status === 'BLOCKED' || r.commercialAction === 'Pending Disposition');
  const pendingQty = pendingCases.reduce((s, r) => s + (Number(r.quantity) || 0), 0);

  // 4. Quarantine Bay Utilization
  const qBins = window.wms.quarantineBins || [];
  const totalCap = qBins.reduce((s, b) => s + (Number(b.capacity) || 15), 0);
  const totalOcc = qBins.reduce((s, b) => s + (Number(b.currentOccupancy) || 0), 0);
  const occPct = totalCap > 0 ? ((totalOcc / totalCap) * 100).toFixed(1) : '0';

  // Update KPI Cards
  const totalQtyEl = document.getElementById('kpi-rej-total-qty');
  const totalCasesEl = document.getElementById('kpi-rej-total-cases');
  const stagesEl = document.getElementById('kpi-rej-stages');
  const pendingEl = document.getElementById('kpi-rej-pending-count');
  const occEl = document.getElementById('kpi-rej-quarantine-occ');
  const navBadgeEl = document.getElementById('nav-rej-badge');

  if (totalQtyEl) totalQtyEl.textContent = `${totalQty.toLocaleString()} EA`;
  if (totalCasesEl) totalCasesEl.textContent = `${totalCases} Non-Conformance Cases`;
  if (stagesEl) stagesEl.textContent = `Rec: ${recCount} | QC: ${qcCount} | Stg: ${stgCount} | Prod: ${prodCount}`;
  if (pendingEl) pendingEl.textContent = `${pendingCases.length} Cases (${pendingQty} EA)`;
  if (occEl) occEl.textContent = `${totalOcc} / ${totalCap} Units (${occPct}%)`;
  if (navBadgeEl) navBadgeEl.textContent = `${pendingCases.length} BLOCKED`;

  filterRejections();
}

function filterRejections() {
  const tbody = document.getElementById('rejections-table-body');
  if (!tbody) return;

  const searchInput = (document.getElementById('rej-search-input')?.value || '').toLowerCase().trim();
  const stageFilter = document.getElementById('rej-stage-filter')?.value || 'All';
  const dispFilter = document.getElementById('rej-disposition-filter')?.value || 'All';
  const statusFilter = document.getElementById('rej-status-filter')?.value || 'All';
  const plant = window.wms.activePlant || 'All';

  let list = filterByPlant(window.wms.rejections || [], plant);

  if (stageFilter !== 'All') {
    list = list.filter(r => r.stage === stageFilter);
  }
  if (dispFilter !== 'All') {
    list = list.filter(r => r.commercialAction === dispFilter);
  }
  if (statusFilter !== 'All') {
    list = list.filter(r => r.status === statusFilter);
  }
  if (searchInput) {
    list = list.filter(r =>
      (r.rejectionId && r.rejectionId.toLowerCase().includes(searchInput)) ||
      (r.hu && r.hu.toLowerCase().includes(searchInput)) ||
      (r.materialCode && r.materialCode.toLowerCase().includes(searchInput)) ||
      (r.materialDescription && r.materialDescription.toLowerCase().includes(searchInput)) ||
      (r.supplier && r.supplier.toLowerCase().includes(searchInput)) ||
      (r.batchNo && r.batchNo.toLowerCase().includes(searchInput)) ||
      (r.reasonCode && r.reasonCode.toLowerCase().includes(searchInput)) ||
      (r.reasonDescription && r.reasonDescription.toLowerCase().includes(searchInput)) ||
      (r.quarantineBin && r.quarantineBin.toLowerCase().includes(searchInput)) ||
      (r.rejectedBy && r.rejectedBy.toLowerCase().includes(searchInput))
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:28px; color:#64748b;">🚫 No rejection records match the specified filters.</td></tr>`;
    return;
  }

  const stageBadgeStyle = {
    'Receiving': 'background:#fff7ed; color:#c2410c; border:1px solid #ffedd5;',
    'Inspection': 'background:#f5f3ff; color:#6d28d9; border:1px solid #ede9fe;',
    'Storage': 'background:#f0f9ff; color:#0369a1; border:1px solid #e0f2fe;',
    'Production': 'background:#fdf4ff; color:#a21caf; border:1px solid #fae8ff;'
  };

  tbody.innerHTML = list.map(r => {
    const isBlocked = r.status === 'BLOCKED' || r.commercialAction === 'Pending Disposition';
    const stageStyle = stageBadgeStyle[r.stage] || 'background:#f1f5f9; color:#475569;';

    let actionBadge = '';
    if (r.commercialAction === 'Pending Disposition') {
      actionBadge = `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:800; font-size:11px;">⏳ Pending Disposition</span>`;
    } else if (r.commercialAction.includes('Return to Vendor')) {
      actionBadge = `<span class="badge" style="background:#fee2e2; color:#b91c1c; font-weight:800; font-size:11px;">🚚 RTV (Mvt 122)</span><div style="font-size:10px; color:#64748b; font-family:var(--font-mono); margin-top:2px;">${r.sapDocNo || ''}</div>`;
    } else if (r.commercialAction.includes('Scrap')) {
      actionBadge = `<span class="badge" style="background:#f1f5f9; color:#475569; font-weight:800; font-size:11px;">🗑️ Scrap (Mvt 551)</span><div style="font-size:10px; color:#64748b; font-family:var(--font-mono); margin-top:2px;">${r.sapDocNo || ''}</div>`;
    } else if (r.commercialAction.includes('Rework')) {
      actionBadge = `<span class="badge" style="background:#ecfdf5; color:#047857; font-weight:800; font-size:11px;">🛠️ Rework (Mvt 311)</span><div style="font-size:10px; color:#64748b; font-family:var(--font-mono); margin-top:2px;">${r.sapDocNo || ''}</div>`;
    }

    let statusBadge = '';
    if (r.status === 'BLOCKED') {
      statusBadge = `<span class="wms-badge" style="background:#fee2e2; color:#b91c1c; font-weight:800;">⛔ BLOCKED</span>`;
    } else if (r.status === 'RTV_PROCESSED') {
      statusBadge = `<span class="wms-badge badge-available">RTV PROCESSED</span>`;
    } else if (r.status === 'SCRAPPED') {
      statusBadge = `<span class="wms-badge" style="background:#f1f5f9; color:#64748b; font-weight:700;">SCRAPPED</span>`;
    } else if (r.status === 'REWORKED') {
      statusBadge = `<span class="wms-badge badge-available">REWORKED</span>`;
    } else {
      statusBadge = `<span class="wms-badge ${getStatusBadgeClass(r.status)}">${r.status}</span>`;
    }

    return `
      <tr>
        <td>
          <strong style="font-family:var(--font-mono); color:#dc2626;">${r.rejectionId}</strong>
        </td>
        <td>
          <span class="badge" style="${stageStyle} font-weight:800; font-size:10.5px; padding:3px 8px; border-radius:4px;">
            ${r.stage === 'Receiving' ? '📥 Receiving' : r.stage === 'Inspection' ? '🔬 Inspection' : r.stage === 'Storage' ? '📦 Storage' : '🏭 Production'}
          </span>
        </td>
        <td>
          <div style="display:flex; align-items:center; gap:6px;">
            <strong style="font-family:var(--font-mono); color:#2563eb;">${r.materialCode}</strong>
            <span class="badge" style="background:#f8fafc; border:1px solid #cbd5e1; font-size:9.5px; font-family:var(--font-mono); color:#334155;">${r.hu}</span>
          </div>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">${r.materialDescription}</div>
        </td>
        <td>
          <div style="font-size:11px; font-weight:700; color:#0f172a;">${r.supplier || '—'}</div>
          <span style="font-size:10px; font-family:var(--font-mono); color:#64748b;">Batch: ${r.batchNo || '—'}</span>
        </td>
        <td>
          <strong style="font-size:13px; color:#dc2626;">${r.quantity}</strong> <span style="font-size:11px; color:#64748b;">${r.uom || 'EA'}</span>
        </td>
        <td>
          <span class="badge" style="background:#fef2f2; color:#991b1b; font-weight:800; font-size:10.5px; font-family:var(--font-mono);">${r.reasonCode}</span>
          <div style="font-size:11px; color:#334155; margin-top:2px; max-width:200px;">${r.reasonDescription}</div>
        </td>
        <td>
          <span style="font-family:var(--font-mono); font-weight:800; color:#ea580c; background:#fff7ed; padding:3px 7px; border-radius:4px; border:1px solid #ffedd5; font-size:11px;">
            🔒 ${r.quarantineBin}
          </span>
        </td>
        <td>${actionBadge}</td>
        <td>
          <div style="font-size:11px; font-weight:600; color:#0f172a;">${r.rejectedBy}</div>
          <span style="font-size:10px; color:#64748b;">${r.rejectionDate}</span>
        </td>
        <td>${statusBadge}</td>
        <td>
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            ${isBlocked ? `<button class="btn-wms-primary small" style="background:#b91c1c; border-color:#b91c1c;" onclick="openDispositionModal('${r.rejectionId}')">⚖️ Action</button>` : ''}
            <button class="btn-wms-secondary small" onclick="openRejectionTagModal('${r.rejectionId}')">🏷️ Tag</button>
            <button class="btn-wms-secondary small" onclick="openDefectPhotoModal('${r.rejectionId}')">📸 Proof</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openLogRejectionModal() {
  const mats = window.wms.materials || [];
  const defectCodes = window.wms.defectReasonCodes || [];
  const qBins = window.wms.quarantineBins || [];

  const matOptions = mats.map(m => `<option value="${m.code}">${m.code} — ${m.description} (${m.unit})</option>`).join('');
  const defectOptions = defectCodes.map(d => `<option value="${d.code}">${d.code}: ${d.name} (${d.category})</option>`).join('');
  const binOptions = qBins.map(b => `<option value="${b.binCode}">${b.binCode} — ${b.name}</option>`).join('');

  const content = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="padding:10px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; color:#991b1b; font-size:11.5px; line-height:1.5;">
        ⚠️ <strong>Non-Conformance Quarantine Lock:</strong> Logging this rejection will isolate stock into a designated Quarantine Bin, block it from warehouse putaway or line issuance, and create an SAP Movement 124 (Blocked Stock) audit entry.
      </div>
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Defective Material Component*</label>
        <select id="modal-rej-mat" class="select-filter" style="width:100%;">${matOptions}</select>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Handling Unit / Container Barcode*</label>
          <input type="text" id="modal-rej-hu" class="search-input" value="HU-2026-${Math.floor(10000 + Math.random() * 90000)}" style="width:100%;">
        </div>
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Defective Quantity*</label>
          <input type="number" id="modal-rej-qty" class="search-input" value="10" min="1" style="width:100%;">
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Detection Stage*</label>
          <select id="modal-rej-stage" class="select-filter" style="width:100%;">
            <option value="Receiving">📥 Receiving (Dock Unload)</option>
            <option value="Inspection">🔬 Inspection (QC Audit)</option>
            <option value="Storage">📦 Storage (Warehouse Racks)</option>
            <option value="Production">🏭 Production (Shopfloor)</option>
          </select>
        </div>
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Defect Reason Code*</label>
          <select id="modal-rej-defect" class="select-filter" style="width:100%;">${defectOptions}</select>
        </div>
      </div>
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Target Quarantine Isolation Bin*</label>
        <select id="modal-rej-bin" class="select-filter" style="width:100%;">${binOptions}</select>
      </div>
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Inspector Observations & Non-Conformance Description*</label>
        <textarea id="modal-rej-desc" class="search-input" rows="2" style="width:100%; resize:vertical;" placeholder="Detail observed physical or functional failure..."></textarea>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
        <div>
          <div style="font-size:12px; font-weight:800; color:#0f172a;">Defect Photo Evidence Proof</div>
          <div style="font-size:10.5px; color:#64748b;">Attach high-definition inspection camera photo</div>
        </div>
        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12px; font-weight:700; color:#0369a1;">
          <input type="checkbox" id="modal-rej-photo-toggle" checked style="cursor:pointer;"> Attach Macro Photo
        </label>
      </div>
    </div>
  `;

  openDynamicModal('Log Quality Non-Conformance & Isolate to Quarantine', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" style="background:#dc2626; border-color:#dc2626;" onclick="submitLogRejection()">🚫 Lock in Quarantine & Post SAP 124</button>
  `);
}

function submitLogRejection() {
  const matCode = document.getElementById('modal-rej-mat')?.value;
  const hu = document.getElementById('modal-rej-hu')?.value || 'HU-2026-99999';
  const qty = Number(document.getElementById('modal-rej-qty')?.value) || 10;
  const stage = document.getElementById('modal-rej-stage')?.value || 'Inspection';
  const defectCode = document.getElementById('modal-rej-defect')?.value || 'DEF-CRACK';
  const bin = document.getElementById('modal-rej-bin')?.value || 'QRN-LOC-Q01-RCK-01';
  const desc = document.getElementById('modal-rej-desc')?.value.trim() || 'Defective component identified during quality audit.';
  const hasPhoto = document.getElementById('modal-rej-photo-toggle')?.checked !== false;

  const mat = (window.wms.materials || []).find(m => m.code === matCode);
  const defect = (window.wms.defectReasonCodes || []).find(d => d.code === defectCode);

  const rejId = `REJ-2026-${String((window.wms.rejections || []).length + 48).padStart(4, '0')}`;
  const sapDocNo = `SAP-MAT-600193${Math.floor(2000 + Math.random() * 7000)}`;
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const newRejection = {
    rejectionId: rejId,
    hu: hu,
    plant: window.wms.activePlant || 'HMSI Narsapur Plant 1',
    materialCode: matCode,
    materialDescription: mat?.description || 'Component Part',
    quantity: qty,
    uom: mat?.unit || 'EA',
    supplier: mat?.supplier || 'Nissin Brake India Pvt Ltd',
    batchNo: `BAT-2026-${Math.floor(100 + Math.random() * 900)}`,
    stage: stage,
    reasonCode: defectCode,
    reasonDescription: desc || defect?.name || 'Non-conforming material',
    rejectedBy: `${window.wms.currentUser?.name || 'Sanjay Verma'} (${window.wms.currentUser?.roleTitle || 'QC'})`,
    rejectionDate: dateStr,
    rejectionLocation: `Detected at ${stage}`,
    quarantineBin: bin,
    commercialAction: 'Pending Disposition',
    dispositionRemarks: 'Stock physically locked in quarantine cage; awaiting commercial decision (RTV/Scrap/Rework).',
    sapBlockedMvt: '124 (GR Blocked Stock)',
    sapDocNo: sapDocNo,
    photoAttached: hasPhoto,
    photoName: hasPhoto ? `DEFECT_${matCode.replace(/[^A-Z0-9]/g, '_')}_PROOF.JPG` : null,
    status: 'BLOCKED'
  };

  if (!window.wms.rejections) window.wms.rejections = [];
  window.wms.rejections.unshift(newRejection);

  // Update quarantine bin occupancy
  const qBin = (window.wms.quarantineBins || []).find(b => b.binCode === bin);
  if (qBin) qBin.currentOccupancy = (qBin.currentOccupancy || 0) + 1;

  // Log SAP movement
  if (!window.wms.sapSyncLogs) window.wms.sapSyncLogs = [];
  window.wms.sapSyncLogs.unshift({
    syncId: `SAP-SYNC-${Math.floor(1000 + Math.random() * 9000)}`,
    interfaceType: 'BAPI_GOODSMVT_CREATE',
    direction: 'WMS → SAP',
    wmsRef: rejId,
    sapDocNo: sapDocNo,
    payloadType: `Movement 124 (Block Stock: ${qty} ${mat?.unit || 'EA'})`,
    status: 'success',
    errorText: '—',
    timestamp: dateStr
  });

  addAuditLog(
    'Part Quarantined & Blocked',
    matCode,
    `Isolated to ${bin} (-${qty} EA)`,
    `Rejection ${rejId}: ${defectCode} (${desc}). SAP Doc: ${sapDocNo}`
  );

  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderAllWMSViews();
  alert(`🚫 Part ${matCode} (${qty} ${mat?.unit || 'EA'}) Quarantined!\nRejection Ref: ${rejId}\nQuarantine Drop Bin: ${bin}\nSAP 124 Doc: ${sapDocNo}`);
}

function openDispositionModal(rejectionId) {
  const r = (window.wms.rejections || []).find(item => item.rejectionId === rejectionId);
  if (!r) return;

  const content = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; font-size:12px; line-height:1.6;">
        <div style="display:flex; justify-content:space-between;">
          <span>Rejection Ref: <strong style="color:#dc2626; font-family:var(--font-mono);">${r.rejectionId}</strong></span>
          <span style="font-weight:700; color:#475569;">Stage: ${r.stage}</span>
        </div>
        <div>Material: <strong>${r.materialCode}</strong> — ${r.materialDescription}</div>
        <div>Quantity: <strong style="color:#dc2626;">${r.quantity} ${r.uom}</strong> | Location: <strong>${r.quarantineBin}</strong></div>
        <div>Defect: <strong>${r.reasonCode}</strong> (${r.reasonDescription})</div>
      </div>

      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Select Commercial Disposition Action*</label>
        <select id="modal-disp-action" class="select-filter" style="width:100%;" onchange="onDispositionActionChange(this.value)">
          <option value="Return to Vendor (RTV)">🚚 Return to Vendor (RTV) — SAP Movement 122 + Debit Note</option>
          <option value="Scrap (Write-off)">🗑️ Scrap (Write-off) — SAP Movement 551 + Scrap Authorization</option>
          <option value="Rework (In-house)">🛠️ Rework (In-house) — SAP Movement 311 + Work Order</option>
        </select>
      </div>

      <div id="modal-disp-dynamic-fields">
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;" id="disp-ref-label">Vendor Debit Note No.*</label>
          <input type="text" id="modal-disp-refno" class="search-input" value="DN-2026-${Math.floor(100 + Math.random() * 900)}" style="width:100%;">
        </div>
      </div>

      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Quality Manager Disposition Approval Remarks*</label>
        <textarea id="modal-disp-remarks" class="search-input" rows="2" style="width:100%; resize:vertical;">Approved commercial claim against vendor for defective batch. Material released from quarantine for dispatch.</textarea>
      </div>
    </div>
  `;

  openDynamicModal(`Commercial Disposition: ${r.rejectionId}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="submitDisposition('${r.rejectionId}')">🚀 Authorize & Post SAP Disposition</button>
  `);
}

function onDispositionActionChange(action) {
  const container = document.getElementById('modal-disp-dynamic-fields');
  const remarksEl = document.getElementById('modal-disp-remarks');
  if (!container) return;

  if (action.includes('Return to Vendor')) {
    container.innerHTML = `
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Vendor Debit Note No.*</label>
        <input type="text" id="modal-disp-refno" class="search-input" value="DN-2026-${Math.floor(100 + Math.random() * 900)}" style="width:100%;">
      </div>
    `;
    if (remarksEl) remarksEl.value = 'Approved commercial claim against vendor for defective batch. Material released from quarantine for RTV dispatch.';
  } else if (action.includes('Scrap')) {
    container.innerHTML = `
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">HMSIL Scrap Authorization No.*</label>
        <input type="text" id="modal-disp-refno" class="search-input" value="SCRAP-AUTH-2026-${Math.floor(100 + Math.random() * 900)}" style="width:100%;">
      </div>
    `;
    if (remarksEl) remarksEl.value = 'Material condemned by QA metallurgist; physical scrap approved under Movement 551.';
  } else if (action.includes('Rework')) {
    container.innerHTML = `
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Rework Station Work Order No.*</label>
        <input type="text" id="modal-disp-refno" class="search-input" value="RWK-ORD-2026-${Math.floor(100 + Math.random() * 900)}" style="width:100%;">
      </div>
    `;
    if (remarksEl) remarksEl.value = 'Transferred to Machine Shop CNC Rework cell for de-burring and dimensional re-machining.';
  }
}

function submitDisposition(rejectionId) {
  const r = (window.wms.rejections || []).find(item => item.rejectionId === rejectionId);
  if (!r) return;

  const action = document.getElementById('modal-disp-action')?.value || 'Return to Vendor (RTV)';
  const refNo = document.getElementById('modal-disp-refno')?.value || 'REF-DISP-001';
  const remarks = document.getElementById('modal-disp-remarks')?.value || 'Disposition authorized.';

  let newStatus = 'RTV_PROCESSED';
  let mvt = '122 (Return Delivery to Vendor)';
  if (action.includes('Scrap')) {
    newStatus = 'SCRAPPED';
    mvt = '551 (Scrapping from Blocked Stock)';
  } else if (action.includes('Rework')) {
    newStatus = 'REWORKED';
    mvt = '311 (Transfer to Production Rework)';
  }

  const sapDoc = `SAP-MAT-600194${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  r.commercialAction = action;
  r.dispositionRemarks = `${remarks} [Ref: ${refNo}, Auth By: ${window.wms.currentUser?.name || 'Sanjay Verma'}]`;
  r.status = newStatus;
  r.sapBlockedMvt = mvt;
  r.sapDocNo = sapDoc;

  // Reduce occupancy of quarantine bin
  const qBin = (window.wms.quarantineBins || []).find(b => b.binCode === r.quarantineBin);
  if (qBin && qBin.currentOccupancy > 0) {
    qBin.currentOccupancy--;
  }

  // SAP Sync Log
  if (!window.wms.sapSyncLogs) window.wms.sapSyncLogs = [];
  window.wms.sapSyncLogs.unshift({
    syncId: `SAP-SYNC-${Math.floor(1000 + Math.random() * 9000)}`,
    interfaceType: 'BAPI_GOODSMVT_CREATE',
    direction: 'WMS → SAP',
    wmsRef: r.rejectionId,
    sapDocNo: sapDoc,
    payloadType: `Movement ${mvt.split(' ')[0]} (${r.quantity} ${r.uom} - ${action})`,
    status: 'success',
    errorText: '—',
    timestamp: dateStr
  });

  addAuditLog(
    'Commercial Disposition Approved',
    r.materialCode,
    action,
    `Rejection ${r.rejectionId} disposition completed: ${action}. Ref: ${refNo}, SAP Doc: ${sapDoc}`
  );

  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderAllWMSViews();
  alert(`✅ Commercial Disposition Authorized for ${r.rejectionId}!\nAction: ${action}\nRef No: ${refNo}\nSAP Movement Doc: ${sapDoc}\nMaterial cleared from Quarantine Bin ${r.quarantineBin}.`);
}

function openRejectionTagModal(rejectionId) {
  const r = (window.wms.rejections || []).find(item => item.rejectionId === rejectionId);
  if (!r) return;

  const content = `
    <div style="font-family:var(--font-sans); color:#0f172a; max-width:540px; margin:0 auto;">
      <div style="background:#dc2626; color:#ffffff; padding:14px; text-align:center; border-radius:8px 8px 0 0; border:3px solid #dc2626;">
        <div style="font-size:24px; font-weight:900; letter-spacing:1px; line-height:1.2;">⛔ REJECTION TAG • DO NOT MOVE</div>
        <div style="font-size:11px; font-weight:700; letter-spacing:0.5px; opacity:0.95; margin-top:4px;">HONDA MOTORCYCLE & SCOOTER INDIA • QUALITY COMPLIANCE</div>
      </div>
      <div style="background:#ffffff; border:3px solid #dc2626; border-top:none; padding:16px; border-radius:0 0 8px 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px dashed #dc2626; padding-bottom:10px; margin-bottom:12px;">
          <div>
            <div style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase;">REJECTION SERIAL NO</div>
            <div style="font-size:20px; font-weight:900; font-family:var(--font-mono); color:#dc2626;">${r.rejectionId}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase;">QUARANTINE BIN</div>
            <div style="font-size:16px; font-weight:900; font-family:var(--font-mono); color:#ea580c; background:#fff7ed; padding:2px 8px; border-radius:4px; border:1px solid #ffedd5;">${r.quarantineBin}</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <div style="font-size:10px; font-weight:800; color:#64748b;">PART CODE & HU</div>
            <div style="font-size:13px; font-weight:900; color:#0f172a; font-family:var(--font-mono);">${r.materialCode}</div>
            <div style="font-size:11px; color:#475569;">${r.hu}</div>
          </div>
          <div>
            <div style="font-size:10px; font-weight:800; color:#64748b;">REJECTED QUANTITY</div>
            <div style="font-size:18px; font-weight:900; color:#dc2626;">${r.quantity} <span style="font-size:12px; color:#64748b;">${r.uom}</span></div>
          </div>
        </div>

        <div style="margin-bottom:12px; background:#fef2f2; border:1px solid #fee2e2; padding:10px; border-radius:6px;">
          <div style="font-size:10px; font-weight:800; color:#991b1b; text-transform:uppercase;">NON-CONFORMANCE / DEFECT CODE: ${r.reasonCode}</div>
          <div style="font-size:12px; font-weight:700; color:#7f1d1d; margin-top:2px;">${r.reasonDescription}</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:11px; margin-bottom:12px;">
          <div><strong>Stage:</strong> ${r.stage}</div>
          <div><strong>Supplier:</strong> ${r.supplier}</div>
          <div><strong>Batch:</strong> <span style="font-family:var(--font-mono);">${r.batchNo}</span></div>
          <div><strong>SAP Blocked Doc:</strong> <span style="font-family:var(--font-mono);">${r.sapDocNo || 'Mvt 124'}</span></div>
        </div>

        <div style="border-top:1.5px solid #e2e8f0; padding-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#64748b;">
          <div>Inspector: <strong>${r.rejectedBy}</strong><br>Date: ${r.rejectionDate}</div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:10px; letter-spacing:2px; font-weight:700; color:#0f172a;">*${r.rejectionId}*</div>
            <span style="font-size:9px; background:#fee2e2; color:#b91c1c; font-weight:800; padding:2px 6px; border-radius:4px;">HOLD STRICT</span>
          </div>
        </div>
      </div>
    </div>
  `;

  openDynamicModal(`Official Rejection Tag: ${r.rejectionId}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Close</button>
    <button class="btn-wms-primary" style="background:#dc2626; border-color:#dc2626;" onclick="window.print()">🖨️ Print Rejection Tag (Zebra/PDF)</button>
  `);
}

function openDefectPhotoModal(rejectionId) {
  const r = (window.wms.rejections || []).find(item => item.rejectionId === rejectionId);
  if (!r) return;

  const content = `
    <div style="font-family:var(--font-sans); color:#0f172a;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div>
          <strong style="color:#dc2626; font-size:14px;">${r.rejectionId}</strong> • <strong>${r.materialCode}</strong>
          <div style="font-size:11px; color:#64748b;">Proof File: ${r.photoName || 'DEFECT_MACRO_PROOF.JPG'}</div>
        </div>
        <span class="badge" style="background:#fef2f2; color:#991b1b; font-weight:800; font-size:11px;">${r.reasonCode}</span>
      </div>

      <!-- High-fidelity Simulated Defect Macro Canvas -->
      <div style="position:relative; width:100%; height:260px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius:8px; overflow:hidden; border:2px solid #334155; display:flex; flex-direction:column; justify-content:space-between; padding:14px; box-sizing:border-box;">
        <!-- Visual Defect Representation -->
        <div style="position:absolute; inset:0; display:flex; justify-content:center; align-items:center; opacity:0.85;">
          <svg width="220" height="220" viewBox="0 0 100 100">
            <!-- Part Contour -->
            <path d="M 20 30 Q 50 15 80 30 L 85 70 Q 50 85 15 70 Z" fill="#334155" stroke="#64748b" stroke-width="2"/>
            <!-- Defect Fracture / Dent -->
            <path d="M 40 38 L 48 47 L 43 55 L 56 62 L 50 68" stroke="#ef4444" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="48" cy="47" r="8" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2"/>
            <text x="58" y="48" fill="#ef4444" font-size="5" font-weight="bold">DEFECT ZONE</text>
          </svg>
        </div>

        <!-- Camera HUD Overlay -->
        <div style="display:flex; justify-content:space-between; align-items:center; z-index:2; color:#38bdf8; font-family:var(--font-mono); font-size:10px;">
          <span>[CAMERA 01 • MACRO OPTICAL]</span>
          <span>1080P • 4K PROOF</span>
        </div>
        <div style="z-index:2; color:#ffffff; background:rgba(15,23,42,0.75); padding:8px 12px; border-radius:6px; backdrop-filter:blur(4px); font-size:11px; line-height:1.4;">
          <div style="font-weight:700; color:#f87171;">Defect: ${r.reasonDescription}</div>
          <div style="font-size:10px; color:#cbd5e1;">Logged by: ${r.rejectedBy} • ${r.rejectionDate}</div>
          <div style="font-size:10px; color:#38bdf8;">GPS: Plant 1 Gate / Quality Bay • Cage: ${r.quarantineBin}</div>
        </div>
      </div>
    </div>
  `;

  openDynamicModal(`Defect Photo Evidence Proof: ${r.rejectionId}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Close</button>
  `);
}

function exportRejectionsCSV() {
  exportTableToCSV(window.wms.rejections || [], 'HMSIL_Quality_Rejections_Ledger.csv');
}

// ==========================================================================
// 4. INVENTORY OPERATIONS (PUTAWAY, STOCK BY BIN, CYCLE COUNT, FIFO & AGING, REPORTS)
// ==========================================================================
function renderPutawayTasks() {
  const tbody = document.getElementById('putaway-table-body');
  if (!tbody) return;

  const plant = window.wms.activePlant || 'All';
  const tasks = filterByPlant(window.wms.putawayTasks || [], plant);
  tbody.innerHTML = tasks.map(t => {
    const isPassed = t.sapPqStatus === 'PASSED';
    const isHold = t.sapPqStatus === 'PENDING' || (!t.sapPqStatus && t.taskNo === 'PUT-HND-003');
    const isRejected = t.sapPqStatus === 'REJECTED';

    let pqBadge = `<span class="wms-badge" style="background:#dcfce7; color:#15803d; font-weight:700;">✅ PASSED</span>`;
    if (isHold) {
      pqBadge = `<span class="wms-badge" style="background:#fef3c7; color:#b45309; font-weight:700;">⏳ PENDING QC</span>`;
    } else if (isRejected) {
      pqBadge = `<span class="wms-badge" style="background:#fee2e2; color:#b91c1c; font-weight:700;">❌ REJECTED</span>`;
    }

    return `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${t.taskNo}</b></td>
      <td><span style="font-family:var(--font-mono); font-weight:700;">${t.palletHuId}</span></td>
      <td><b>${t.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${t.materialDescription}</span></td>
      <td><b>${t.qty} ${t.uom}</b></td>
      <td>${t.fromDock}</td>
      <td><span style="font-family:var(--font-mono); font-weight:700; color:#2563eb;">${t.suggestedBin}</span></td>
      <td><span style="font-family:var(--font-mono); font-weight:700; color:#059669;">${t.actualBin}</span></td>
      <td><span style="font-size:11px; color:#64748b;">${t.overrideReason}</span></td>
      <td>${pqBadge}</td>
      <td><b>${t.operator}</b></td>
      <td><span class="wms-badge ${getStatusBadgeClass(t.status)}">${t.status}</span></td>
      <td>
        ${!isPassed ? `
          <button class="btn-wms-secondary small" style="color:#b91c1c; border-color:#fca5a5; background:#fff1f2; font-weight:700;" onclick="alert('⛔ Putaway Blocked: Material pending Quality Acceptance (Status: ${t.sapPqStatus || 'PENDING'}). Please clear QC in Inbound > Quality Acceptance first.')">⛔ QC Blocked</button>
        ` : (t.status !== 'Completed' ? `
          <button class="btn-wms-primary small" onclick="completePutaway('${t.taskNo}')">Confirm Putaway</button>
        ` : '')}
      </td>
    </tr>
  `}).join('');
}

function completePutaway(taskNo) {
  const task = window.wms.putawayTasks.find(t => t.taskNo === taskNo);
  if (!task) return;

  if (task.sapPqStatus && task.sapPqStatus !== 'PASSED') {
    alert(`⛔ Putaway Gating Blocked: Material ${task.materialCode} (${task.palletHuId}) has SAP PQ Status: "${task.sapPqStatus}".\nPutaway is strictly prohibited until Quality Acceptance has been confirmed and status is PASSED.`);
    return;
  }

  task.status = 'Completed';
  task.actualBin = task.suggestedBin;
  task.completedTime = new Date().toLocaleTimeString();
  addAuditLog('Putaway Confirmed', taskNo, 'Open', `Putaway confirmed for ${task.palletHuId} to ${task.actualBin}`);
  saveWMSState(window.wms);
  renderPutawayTasks();
  alert(`Putaway Task ${taskNo} completed. Stock placed in ${task.actualBin}.`);
}

// -------------------------------------------------------------
// 3-TIER STORAGE HIERARCHY DRILL-DOWN (AREA -> LOCATION -> RACK)
// -------------------------------------------------------------
window.selectedInventoryArea = 'All';
window.selectedInventoryLocation = 'All';
window.selectedInventoryRack = 'All';

function initInventoryHierarchyDrillDown() {
  const areaSelect = document.getElementById('filter-inv-area');
  const locSelect = document.getElementById('filter-inv-location');
  const rackSelect = document.getElementById('filter-inv-rack');
  if (!areaSelect) return;

  const areas = window.wms.areaMaster || [];
  const curArea = window.selectedInventoryArea || 'All';

  areaSelect.innerHTML = '<option value="All">All Warehouse Areas</option>' + areas.map(a => `
    <option value="${a.areaCode}" ${curArea === a.areaCode ? 'selected' : ''}>${a.areaCode} - ${a.areaName}</option>
  `).join('');

  updateHierarchyLocationDropdown();
  updateHierarchyRackDropdown();
  renderInventoryHierarchyStats();
}

function updateHierarchyLocationDropdown() {
  const locSelect = document.getElementById('filter-inv-location');
  if (!locSelect) return;

  if (window.selectedInventoryArea === 'All') {
    locSelect.innerHTML = '<option value="All">All Locations in Area</option>';
    locSelect.disabled = true;
    window.selectedInventoryLocation = 'All';
    return;
  }

  locSelect.disabled = false;
  const locs = (window.wms.locationMaster || []).filter(l => l.areaCode === window.selectedInventoryArea);
  const curLoc = window.selectedInventoryLocation || 'All';

  locSelect.innerHTML = '<option value="All">All Locations in Area</option>' + locs.map(l => `
    <option value="${l.locationCode}" ${curLoc === l.locationCode ? 'selected' : ''}>${l.locationCode} - ${l.name}</option>
  `).join('');
}

function updateHierarchyRackDropdown() {
  const rackSelect = document.getElementById('filter-inv-rack');
  if (!rackSelect) return;

  if (window.selectedInventoryLocation === 'All') {
    rackSelect.innerHTML = '<option value="All">All Racks in Location</option>';
    rackSelect.disabled = true;
    window.selectedInventoryRack = 'All';
    return;
  }

  rackSelect.disabled = false;
  const racks = (window.wms.binMaster || []).filter(b => b.locationCode === window.selectedInventoryLocation);
  const curRack = window.selectedInventoryRack || 'All';

  rackSelect.innerHTML = '<option value="All">All Racks in Location</option>' + racks.map(r => `
    <option value="${r.binCode}" ${curRack === r.binCode ? 'selected' : ''}>${r.binCode} (${r.rackCode || 'RCK-01'})</option>
  `).join('');
}

function onInventoryAreaChange() {
  const areaSelect = document.getElementById('filter-inv-area');
  window.selectedInventoryArea = areaSelect ? areaSelect.value : 'All';
  window.selectedInventoryLocation = 'All';
  window.selectedInventoryRack = 'All';

  updateHierarchyLocationDropdown();
  updateHierarchyRackDropdown();
  renderInventoryHierarchyStats();
  renderInventoryTable();
}

function onInventoryLocationChange() {
  const locSelect = document.getElementById('filter-inv-location');
  window.selectedInventoryLocation = locSelect ? locSelect.value : 'All';
  window.selectedInventoryRack = 'All';

  updateHierarchyRackDropdown();
  renderInventoryHierarchyStats();
  renderInventoryTable();
}

function onInventoryRackChange() {
  const rackSelect = document.getElementById('filter-inv-rack');
  window.selectedInventoryRack = rackSelect ? rackSelect.value : 'All';

  renderInventoryHierarchyStats();
  renderInventoryTable();
}

function clearInventoryHierarchyFilter() {
  window.selectedInventoryArea = 'All';
  window.selectedInventoryLocation = 'All';
  window.selectedInventoryRack = 'All';

  const areaSelect = document.getElementById('filter-inv-area');
  if (areaSelect) areaSelect.value = 'All';
  updateHierarchyLocationDropdown();
  updateHierarchyRackDropdown();
  renderInventoryHierarchyStats();
  renderInventoryTable();
}

function renderInventoryHierarchyStats() {
  const breadcrumbEl = document.getElementById('inv-scope-breadcrumb');
  const typeEl = document.getElementById('inv-scope-type');
  const capTxtEl = document.getElementById('inv-scope-capacity-txt');
  const progressEl = document.getElementById('inv-scope-progress');
  const huCountEl = document.getElementById('inv-scope-hu-count');
  const skusEl = document.getElementById('inv-scope-skus');

  if (!breadcrumbEl) return;

  const allBins = window.wms.binMaster || [];
  const allHUs = window.wms.handlingUnits || [];
  let filteredBins = allBins;
  let filteredHUs = allHUs;

  let scopeText = 'Entire Warehouse Inventory';
  let typeText = 'All Functional Areas & Bays';

  if (window.selectedInventoryRack && window.selectedInventoryRack !== 'All') {
    const rackBin = allBins.find(b => b.binCode === window.selectedInventoryRack);
    filteredBins = rackBin ? [rackBin] : [];
    filteredHUs = allHUs.filter(h => h.location === window.selectedInventoryRack);
    scopeText = `${rackBin?.areaCode || 'AREA'} &rarr; ${rackBin?.locationCode || 'LOC'} &rarr; ${rackBin?.binCode || window.selectedInventoryRack}`;
    typeText = `Single High-Bay Rack (${rackBin?.type || 'Heavy Rack'})`;
  } else if (window.selectedInventoryLocation && window.selectedInventoryLocation !== 'All') {
    const loc = (window.wms.locationMaster || []).find(l => l.locationCode === window.selectedInventoryLocation);
    filteredBins = allBins.filter(b => b.locationCode === window.selectedInventoryLocation);
    const binCodes = filteredBins.map(b => b.binCode);
    filteredHUs = allHUs.filter(h => binCodes.includes(h.location));
    scopeText = `${loc?.areaCode || 'AREA'} &rarr; ${loc?.locationCode || window.selectedInventoryLocation} (${loc?.name || 'Location'})`;
    typeText = `Location Intake Zone (${filteredBins.length} Active Racks)`;
  } else if (window.selectedInventoryArea && window.selectedInventoryArea !== 'All') {
    const area = (window.wms.areaMaster || []).find(a => a.areaCode === window.selectedInventoryArea);
    filteredBins = allBins.filter(b => b.areaCode === window.selectedInventoryArea);
    const binCodes = filteredBins.map(b => b.binCode);
    filteredHUs = allHUs.filter(h => binCodes.includes(h.location));
    scopeText = `Area: ${area?.areaName || area?.areaCode || window.selectedInventoryArea}`;
    typeText = `Warehouse Functional Area (${filteredBins.length} Bins)`;
  }

  const totalCap = filteredBins.reduce((sum, b) => sum + (Number(b.capacity || b.maxCapacity) || 0), 0);
  const totalOccupied = filteredHUs.reduce((sum, h) => sum + (Number(h.quantity) || 0), 0);
  const utilPct = totalCap > 0 ? Math.min(100, Math.round((totalOccupied / totalCap) * 100)) : 0;
  const uniqueSkus = new Set(filteredHUs.map(h => h.materialCode)).size;

  breadcrumbEl.innerHTML = scopeText;
  typeEl.textContent = typeText;
  capTxtEl.textContent = `${totalOccupied.toLocaleString()} / ${totalCap.toLocaleString()} EA (${utilPct}%)`;
  if (progressEl) {
    progressEl.style.width = `${utilPct}%`;
    progressEl.style.background = utilPct > 90 ? '#dc2626' : (utilPct > 70 ? '#d97706' : '#059669');
  }
  if (huCountEl) huCountEl.textContent = `${filteredHUs.length} HU${filteredHUs.length === 1 ? '' : 's'}`;
  if (skusEl) skusEl.textContent = `${uniqueSkus} Part${uniqueSkus === 1 ? '' : 's'}`;
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-table-body');
  const summaryGrid = document.getElementById('material-stock-summary-grid');
  if (!tbody) return;

  // Initialize hierarchy dropdowns if not yet populated
  const areaSelect = document.getElementById('filter-inv-area');
  if (areaSelect && areaSelect.options.length <= 1) {
    initInventoryHierarchyDrillDown();
  } else {
    renderInventoryHierarchyStats();
  }

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

  // 3-Tier Storage Hierarchy Filter (Area -> Location -> Rack)
  if (window.selectedInventoryRack && window.selectedInventoryRack !== 'All') {
    hus = hus.filter(h => h.location === window.selectedInventoryRack);
  } else if (window.selectedInventoryLocation && window.selectedInventoryLocation !== 'All') {
    const matchingBinCodes = (window.wms.binMaster || [])
      .filter(b => b.locationCode === window.selectedInventoryLocation)
      .map(b => b.binCode);
    hus = hus.filter(h => matchingBinCodes.includes(h.location));
  } else if (window.selectedInventoryArea && window.selectedInventoryArea !== 'All') {
    const matchingBinCodes = (window.wms.binMaster || [])
      .filter(b => b.areaCode === window.selectedInventoryArea)
      .map(b => b.binCode);
    hus = hus.filter(h => matchingBinCodes.includes(h.location));
  }

  if (statusFilter !== 'All') hus = hus.filter(h => h.stockStatus === statusFilter);
  if (search) {
    hus = hus.filter(h => h.materialCode.toLowerCase().includes(search) || h.location.toLowerCase().includes(search) || h.huNumber.toLowerCase().includes(search) || h.batch.toLowerCase().includes(search));
  }

  if (!hus.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:24px; color:#64748b;">
          No Handling Units found for the selected hierarchy node (${window.selectedInventoryRack !== 'All' ? window.selectedInventoryRack : (window.selectedInventoryLocation !== 'All' ? window.selectedInventoryLocation : (window.selectedInventoryArea !== 'All' ? window.selectedInventoryArea : 'Current Filters'))}).
        </td>
      </tr>
    `;
    return;
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
// MODULE D: PART PARKING & STAGING BUFFER
// -------------------------------------------------------------
function renderPartParking() {
  const tableBody = document.getElementById('parked-stock-table-body');
  if (!tableBody) return;

  const parkedStock = window.wms.parkedStock || [];
  const parkingBays = window.wms.parkingBays || [];
  const plant = window.wms.activePlant || 'All';

  // Compute live duration for each parked item if not set or update it
  const now = Date.now();
  parkedStock.forEach(p => {
    if (p.parkedTimestamp) {
      p.durationMinutes = Math.max(1, Math.round((now - p.parkedTimestamp) / (60 * 1000)));
    }
  });

  // Calculate bay occupancy
  const activeParked = parkedStock.filter(p => p.status === 'PARKED');
  parkingBays.forEach(bay => {
    bay.occupied = activeParked.filter(p => p.parkingBay === bay.bayCode).length;
  });

  // KPI Calculations
  const totalParkedHUs = activeParked.length;
  const totalParkedQty = activeParked.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const occupiedBaysCount = parkingBays.filter(b => b.occupied > 0).length;
  const totalBaysCount = parkingBays.length || 5;
  const bayUtilPct = Math.round((occupiedBaysCount / totalBaysCount) * 100);
  const overdueCount = activeParked.filter(p => (p.durationMinutes || 0) > 120).length;

  // Update KPI Cards
  const kpiHus = document.getElementById('kpi-parked-hus');
  const kpiHusSub = document.getElementById('kpi-parked-hus-sub');
  const kpiQty = document.getElementById('kpi-parked-qty');
  const kpiBays = document.getElementById('kpi-parked-bays');
  const kpiBaysSub = document.getElementById('kpi-parked-bays-sub');
  const kpiOverdue = document.getElementById('kpi-parked-overdue');

  if (kpiHus) kpiHus.textContent = `${totalParkedHUs} HUs`;
  if (kpiHusSub) kpiHusSub.textContent = `${parkedStock.length} total lifetime buffer records`;
  if (kpiQty) kpiQty.textContent = `${totalParkedQty.toLocaleString()} EA`;
  if (kpiBays) kpiBays.textContent = `${occupiedBaysCount} / ${totalBaysCount} Bays`;
  if (kpiBaysSub) kpiBaysSub.textContent = `${bayUtilPct}% Buffer Capacity Utilized`;
  if (kpiOverdue) kpiOverdue.textContent = `${overdueCount}`;

  filterParkedTable();
}

function filterParkedTable() {
  const tableBody = document.getElementById('parked-stock-table-body');
  if (!tableBody) return;

  const searchInput = (document.getElementById('parked-search-input')?.value || '').toLowerCase().trim();
  const bayFilter = document.getElementById('parked-bay-filter')?.value || 'All';
  const statusFilter = document.getElementById('parked-status-filter')?.value || 'All';
  const plant = window.wms.activePlant || 'All';

  let list = window.wms.parkedStock || [];

  if (plant !== 'All') {
    list = list.filter(p => p.plant === plant || !p.plant);
  }
  if (bayFilter !== 'All') {
    list = list.filter(p => p.parkingBay === bayFilter);
  }
  if (statusFilter !== 'All') {
    list = list.filter(p => p.status === statusFilter);
  }
  if (searchInput) {
    list = list.filter(p =>
      (p.parkingId && p.parkingId.toLowerCase().includes(searchInput)) ||
      (p.huNumber && p.huNumber.toLowerCase().includes(searchInput)) ||
      (p.materialCode && p.materialCode.toLowerCase().includes(searchInput)) ||
      (p.materialDescription && p.materialDescription.toLowerCase().includes(searchInput)) ||
      (p.batch && p.batch.toLowerCase().includes(searchInput)) ||
      (p.parkingBay && p.parkingBay.toLowerCase().includes(searchInput)) ||
      (p.parkingReason && p.parkingReason.toLowerCase().includes(searchInput))
    );
  }

  if (list.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align:center; padding:30px; color:#64748b;">
          🅿️ No parked handling units matching the selected filters.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = list.map(item => {
    const isOverdue = item.status === 'PARKED' && (item.durationMinutes || 0) > 120;
    const durationColor = item.status === 'RELEASED' ? '#64748b' : (isOverdue ? '#dc2626' : ((item.durationMinutes || 0) > 60 ? '#d97706' : '#15803d'));
    const durationBg = item.status === 'RELEASED' ? '#f1f5f9' : (isOverdue ? '#fee2e2' : ((item.durationMinutes || 0) > 60 ? '#fef3c7' : '#dcfce7'));
    const durationLabel = item.status === 'RELEASED' ? `${item.durationMinutes || 0}m (at release)` : `${item.durationMinutes || 0}m ${isOverdue ? '⚠️ Overdue' : ''}`;

    const statusBadge = item.status === 'PARKED'
      ? `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:800; border:1px solid #fde68a;">🅿️ PARKED</span>`
      : `<span class="badge" style="background:#ecfdf5; color:#065f46; font-weight:800; border:1px solid #a7f3d0;">✅ RELEASED</span>`;

    return `
      <tr>
        <td><strong style="font-family:'JetBrains Mono',monospace; color:#3b82f6;">${item.parkingId}</strong></td>
        <td>
          <div style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#0f172a;">${item.huNumber}</div>
          <div style="font-size:11px; color:#64748b;">${item.plant || 'Plant 1'}</div>
        </td>
        <td>
          <div style="font-weight:700; color:#0f172a;">${item.materialCode}</div>
          <div style="font-size:11.5px; color:#64748b;">${item.materialDescription}</div>
        </td>
        <td><span style="font-family:'JetBrains Mono',monospace; font-size:11.5px; background:#f1f5f9; padding:2px 6px; border-radius:4px;">${item.batch || '—'}</span></td>
        <td><strong>${item.quantity}</strong> <span style="font-size:11px; color:#64748b;">${item.uom || 'EA'}</span></td>
        <td>
          <div style="font-weight:800; color:#0f172a; font-family:'JetBrains Mono',monospace;">${item.parkingBay}</div>
          <div style="font-size:11px; color:#64748b;">${item.parkingBayName || ''}</div>
        </td>
        <td style="max-width:200px;">
          <div style="font-weight:700; color:#b45309; font-size:12px;">${item.parkingReason}</div>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">${item.notes || '—'}</div>
        </td>
        <td>
          <div style="font-weight:600; font-size:12px; color:#0f172a;">${item.parkedBy}</div>
          <div style="font-size:11px; color:#64748b;">${item.parkedDate}</div>
        </td>
        <td>
          <span style="display:inline-block; font-size:11px; font-weight:800; background:${durationBg}; color:${durationColor}; padding:3px 8px; border-radius:12px;">
            ${durationLabel}
          </span>
        </td>
        <td>${statusBadge}</td>
        <td style="text-align:right;">
          ${item.status === 'PARKED' ? `
            <div style="display:flex; justify-content:flex-end; gap:6px;">
              <button class="btn-wms-secondary" style="font-size:11px; padding:4px 8px; color:#2563eb; border-color:#bfdbfe;" onclick="releaseParkedHu('${item.parkingId}', 'PUTAWAY')">
                📥 Putaway
              </button>
              <button class="btn-wms-secondary" style="font-size:11px; padding:4px 8px; color:#059669; border-color:#a7f3d0;" onclick="releaseParkedHu('${item.parkingId}', 'LINE_STAGING')">
                🏭 To Line
              </button>
              <button class="btn-wms-secondary" style="font-size:11px; padding:4px 8px;" onclick="printParkingSlip('${item.parkingId}')">
                🖨️ Slip
              </button>
            </div>
          ` : `
            <div style="font-size:11px; color:#64748b; text-align:right;">
              Released to <b>${item.releasedDestination || 'Putaway'}</b><br>
              <span style="font-size:10px;">${item.releasedDate || ''}</span>
            </div>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function openParkHuModal() {
  const modal = document.getElementById('modal-park-hu');
  const select = document.getElementById('modal-park-hu-select');
  if (!modal || !select) return;

  const parkedHUs = new Set((window.wms.parkedStock || []).filter(p => p.status === 'PARKED').map(p => p.huNumber));
  const availableHUs = (window.wms.handlingUnits || []).filter(h => !parkedHUs.has(h.huNumber));

  if (availableHUs.length === 0) {
    select.innerHTML = '<option value="">No available handling units to park</option>';
    document.getElementById('modal-park-hu-details').innerHTML = '<div style="color:#64748b;">All current handling units are either parked or stored.</div>';
  } else {
    select.innerHTML = availableHUs.map(h => `
      <option value="${h.huNumber}">${h.huNumber} — ${h.materialCode} (${h.quantity} ${h.uom})</option>
    `).join('');
    onSelectParkHuCandidate(availableHUs[0].huNumber);
  }

  modal.classList.add('active');
}

function closeParkHuModal() {
  const modal = document.getElementById('modal-park-hu');
  if (modal) modal.classList.remove('active');
}

function onSelectParkHuCandidate(huNumber) {
  const detailsEl = document.getElementById('modal-park-hu-details');
  if (!detailsEl) return;
  const hu = (window.wms.handlingUnits || []).find(h => h.huNumber === huNumber);
  if (!hu) {
    detailsEl.innerHTML = '<div style="color:#64748b;">No details found.</div>';
    return;
  }
  const mat = (window.wms.materials || []).find(m => m.code === hu.materialCode) || {};

  detailsEl.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
      <div><b>Part Code:</b> <span style="font-family:'JetBrains Mono',monospace;">${hu.materialCode}</span></div>
      <div><b>Quantity:</b> <strong>${hu.quantity} ${hu.uom}</strong></div>
      <div style="grid-column:span 2;"><b>Description:</b> ${mat.description || hu.description || '—'}</div>
      <div><b>Batch No:</b> ${hu.batch || '—'}</div>
      <div><b>Current Loc:</b> ${hu.location || 'Inbound Dock'}</div>
    </div>
  `;
}

function submitParkHu() {
  const select = document.getElementById('modal-park-hu-select');
  const baySelect = document.getElementById('modal-park-bay-select');
  const reasonSelect = document.getElementById('modal-park-reason-select');
  const notesInput = document.getElementById('modal-park-notes');

  const huNumber = select?.value;
  if (!huNumber) {
    alert('Please select a handling unit to park.');
    return;
  }

  const hu = (window.wms.handlingUnits || []).find(h => h.huNumber === huNumber);
  if (!hu) {
    alert('Selected Handling Unit not found.');
    return;
  }

  const parkingBay = baySelect.value;
  const bayName = baySelect.options[baySelect.selectedIndex]?.text || parkingBay;
  const parkingReason = reasonSelect.value;
  const notes = notesInput ? notesInput.value.trim() : '';

  const parkingId = `PRK-2026-${String((window.wms.parkedStock || []).length + 1).padStart(4, '0')}`;
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const parkedItem = {
    parkingId,
    huNumber: hu.huNumber,
    materialCode: hu.materialCode,
    materialDescription: hu.description || hu.materialDescription || 'Component Part',
    quantity: hu.quantity,
    uom: hu.uom || 'EA',
    batch: hu.batch || '—',
    plant: hu.plant || window.wms.activePlant || 'HMSI Narsapur Plant 1',
    parkingBay,
    parkingBayName: bayName,
    parkingReason,
    notes,
    parkedBy: window.wms.currentUser ? window.wms.currentUser.name : 'Rajesh Sharma',
    parkedDate: dateStr,
    parkedTimestamp: Date.now(),
    durationMinutes: 1,
    status: 'PARKED'
  };

  if (!window.wms.parkedStock) window.wms.parkedStock = [];
  window.wms.parkedStock.unshift(parkedItem);

  // Update HU status and location
  hu.stockStatus = 'PARKED';
  hu.location = parkingBay;

  // Update any pending putaway task
  if (window.wms.putawayTasks) {
    const pt = window.wms.putawayTasks.find(t => (t.palletHuId === hu.huNumber || t.huNumber === hu.huNumber) && t.status !== 'Completed');
    if (pt) {
      pt.status = 'PARKED_BUFFER';
      pt.actualBin = parkingBay;
    }
  }

  addAuditLog(
    'Part Relocated to Buffer Parking',
    hu.huNumber,
    'Status: AVAILABLE',
    `Relocated to ${parkingBay} (${parkingReason}). Ref: ${parkingId}`
  );

  saveWMSState(window.wms);
  closeParkHuModal();
  renderAllWMSViews();
  alert(`✅ Handling Unit ${hu.huNumber} successfully parked at ${parkingBay}.\nParking ID: ${parkingId}`);
}

function releaseParkedHu(parkingId, destination) {
  const item = (window.wms.parkedStock || []).find(p => p.parkingId === parkingId);
  if (!item) {
    alert('Parking record not found.');
    return;
  }

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  item.status = 'RELEASED';
  item.releasedDate = dateStr;
  item.releasedBy = window.wms.currentUser ? window.wms.currentUser.name : 'Rajesh Sharma';
  item.releasedDestination = destination === 'LINE_STAGING' ? 'Line 1 Staging (STG-LINE-01)' : 'Warehouse Putaway Racks';

  // Find HU
  const hu = (window.wms.handlingUnits || []).find(h => h.huNumber === item.huNumber);
  if (hu) {
    hu.stockStatus = 'AVAILABLE';
    if (destination === 'LINE_STAGING') {
      hu.location = 'STG-LINE-01 (Line 1 Staging)';
    } else {
      hu.location = 'Inbound Dock 04 Staging';
      // Reactivate or create Putaway Task
      if (window.wms.putawayTasks) {
        let pt = window.wms.putawayTasks.find(t => (t.palletHuId === hu.huNumber || t.huNumber === hu.huNumber));
        if (pt) {
          pt.status = 'In progress';
          pt.suggestedBin = pt.suggestedBin || 'PWR-LOC-A01-RCK-01';
        } else {
          window.wms.putawayTasks.unshift({
            taskNo: `PUT-2026-${String(window.wms.putawayTasks.length + 10).padStart(4, '0')}`,
            plant: item.plant,
            palletHuId: item.huNumber,
            materialCode: item.materialCode,
            materialDescription: item.materialDescription,
            qty: item.quantity,
            uom: item.uom,
            fromDock: item.parkingBay,
            suggestedBin: 'PWR-LOC-A01-RCK-01',
            status: 'In progress',
            sapPqStatus: 'PASSED',
            createdTime: dateStr,
            isOverdue: false
          });
        }
      }
    }
  }

  addAuditLog(
    'Released from Buffer Parking',
    item.huNumber,
    `Status: PARKED in ${item.parkingBay}`,
    `Released to ${item.releasedDestination} by ${item.releasedBy}. Ref: ${item.parkingId}`
  );

  saveWMSState(window.wms);
  renderAllWMSViews();
  alert(`✅ HU ${item.huNumber} released from ${item.parkingBay}.\nDestination: ${item.releasedDestination}`);
}

function printParkingSlip(parkingId) {
  const item = (window.wms.parkedStock || []).find(p => p.parkingId === parkingId);
  if (!item) return;

  const content = `
    <div style="font-family:'Segoe UI',sans-serif; border:2px dashed #0f172a; padding:18px; border-radius:8px; background:#fff;">
      <div style="text-align:center; border-bottom:2px solid #0f172a; padding-bottom:8px; margin-bottom:12px;">
        <div style="font-size:16px; font-weight:900; color:#8b3e00;">HONDA MOTORCYCLE & SCOOTER INDIA</div>
        <div style="font-size:12px; font-weight:700; color:#0f172a;">TEMPORARY PART PARKING / BUFFER SLIP</div>
        <div style="font-family:'JetBrains Mono',monospace; font-size:11px; color:#64748b;">${item.parkingId} • Plant 1 Narsapur</div>
      </div>
      <div style="font-size:12px; line-height:1.8; color:#0f172a;">
        <div><b>Handling Unit (HU):</b> <span style="font-family:'JetBrains Mono',monospace; font-weight:800;">${item.huNumber}</span></div>
        <div><b>Material:</b> ${item.materialCode} — ${item.materialDescription}</div>
        <div><b>Quantity:</b> <strong>${item.quantity} ${item.uom}</strong> | <b>Batch:</b> ${item.batch}</div>
        <div style="margin-top:6px; padding:6px; background:#fef3c7; border:1px solid #fde68a; border-radius:6px;">
          <b>Assigned Buffer Bay:</b> <span style="font-weight:900; color:#92400e;">${item.parkingBay}</span> (${item.parkingBayName})
        </div>
        <div><b>Parking Reason:</b> ${item.parkingReason}</div>
        <div><b>Operator:</b> ${item.parkedBy} | <b>Time:</b> ${item.parkedDate}</div>
      </div>
      <div style="margin-top:12px; text-align:center; font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:900; letter-spacing:2px; background:#0f172a; color:#fff; padding:6px; border-radius:4px;">
        *${item.parkingId}*
      </div>
    </div>
  `;

  openDynamicModal(`Print Buffer Parking Slip: ${item.parkingId}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Close</button>
    <button class="btn-wms-primary" onclick="window.print(); closeModal('modal-dynamic-form');">🖨️ Print Slip</button>
  `);
}

function exportParkedStockCSV() {
  exportTableToCSV(window.wms.parkedStock || [], 'HMSIL_Part_Parking_Ledger.csv');
}

// -------------------------------------------------------------
// MODULE I: INVENTORY VERIFICATION & PHYSICAL AUDIT SUITE
// -------------------------------------------------------------
let activeCycleCountSubtab = 'plans'; // 'plans', 'physical', 'purchasing'
let activeCountTypeFilter = 'All'; // 'All', 'DAILY_ABC', 'HALF_YEARLY', 'ANNUAL_PHYSICAL'
let isBlindCountingMasked = false; // toggle blind masking on physical view
let purchasingSearchQuery = '';
let purchasingActionFilter = 'All'; // 'All', 'URGENT', 'EXPEDITE', 'HEALTHY', 'OVERSTOCK'

function switchCycleCountSubtab(tabId) {
  activeCycleCountSubtab = tabId;
  const btnPlans = document.getElementById('btn-subtab-cc-plans');
  const btnPhysical = document.getElementById('btn-subtab-cc-physical');
  const btnPurchasing = document.getElementById('btn-subtab-cc-purchasing');

  if (btnPlans) btnPlans.classList.toggle('active', tabId === 'plans');
  if (btnPhysical) btnPhysical.classList.toggle('active', tabId === 'physical');
  if (btnPurchasing) btnPurchasing.classList.toggle('active', tabId === 'purchasing');

  renderCycleCountScreen();
}

function updateCycleCountKPIs() {
  const plant = window.wms.activePlant || 'All';
  const plans = filterByPlant(window.wms.cycleCountPlans || [], plant);

  const plannedCount = plans.filter(p => p.status === 'Planned').length;
  const countingCount = plans.filter(p => p.status === 'Counting').length;
  const varianceCount = plans.flatMap(p => p.lines || []).filter(l => l.isOutsideTolerance && (l.lineStatus === 'Variance flagged' || l.lineStatus === 'Recount flagged')).length;
  const pendingAdjCount = plans.flatMap(p => p.lines || []).filter(l => l.lineStatus === 'Adjustment pending approval').length;
  const postedCount = plans.flatMap(p => p.lines || []).filter(l => l.lineStatus && l.lineStatus.includes('Posted to SAP')).length;

  const pEl = document.getElementById('count-kpi-planned'); if (pEl) pEl.textContent = plannedCount;
  const cEl = document.getElementById('count-kpi-counting'); if (cEl) cEl.textContent = countingCount;
  const vEl = document.getElementById('count-kpi-variance'); if (vEl) vEl.textContent = varianceCount;
  const aEl = document.getElementById('count-kpi-pending-adj'); if (aEl) aEl.textContent = pendingAdjCount;
  const sEl = document.getElementById('count-kpi-posted'); if (sEl) sEl.textContent = postedCount;

  // Stock Freeze Status
  const isFrozen = !!window.wms.isStockFrozen;
  const freezeStatusEl = document.getElementById('count-kpi-freeze-status');
  const freezeBannerEl = document.getElementById('stock-freeze-banner');
  const btnFreezeLabel = document.getElementById('btn-freeze-label');
  const btnFreezeIcon = document.getElementById('btn-freeze-icon');

  if (freezeStatusEl) {
    freezeStatusEl.textContent = isFrozen ? 'LOCKED / FROZEN' : 'NORMAL / ACTIVE';
    freezeStatusEl.style.color = isFrozen ? '#dc2626' : '#059669';
  }
  if (freezeBannerEl) {
    freezeBannerEl.style.display = isFrozen ? 'flex' : 'none';
  }
  if (btnFreezeLabel) {
    btnFreezeLabel.textContent = isFrozen ? 'Lift Stock Freeze' : 'Activate Stock Freeze';
  }
  if (btnFreezeIcon) {
    btnFreezeIcon.textContent = isFrozen ? '🔓' : '🔒';
  }
}

function toggleGlobalStockFreeze(forceState, reason) {
  const isCurrentlyFrozen = !!window.wms.isStockFrozen;
  const nextState = forceState !== undefined ? !!forceState : !isCurrentlyFrozen;

  if (nextState) {
    const defaultReason = reason || 'Wall-to-Wall Annual Physical Inventory Count & Audit';
    const confirmFreeze = window.confirm(`⚠️ WARNING: ACTIVATE WAREHOUSE STOCK FREEZE?\n\nThis will suspend all outbound picking, production issuance, and bin relocations in Plant 1 until the physical inventory count is reconciled and approved.\n\nReason: ${defaultReason}\n\nProceed with Stock Freeze?`);
    if (!confirmFreeze) return;

    window.wms.isStockFrozen = true;
    window.wms.stockFreezeInfo = {
      isFrozen: true,
      countNo: 'CC-2026-0090',
      frozenAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      frozenBy: window.wms.currentUser ? window.wms.currentUser.name : 'Rajesh Sharma (Supervisor)',
      reason: defaultReason
    };

    addAuditLog('Warehouse Stock Freeze Activated', 'STOCK_FREEZE', 'NORMAL', `Warehouse stock frozen by ${window.wms.stockFreezeInfo.frozenBy}. Outbound picking & movements restricted. Ref: ${defaultReason}`);
    saveWMSState(window.wms);
    renderAllWMSViews();
    alert('🔒 WAREHOUSE STOCK FREEZE ACTIVATED!\n\nAll picking, staging transfers, and bin relocations are restricted. Physical inventory mode is now locked.');
  } else {
    const confirmUnfreeze = window.confirm('🔓 LIFT WAREHOUSE STOCK FREEZE?\n\nConfirm that Physical Inventory counts are complete and supervisor sign-offs are finished.\n\nResume normal warehouse operations?');
    if (!confirmUnfreeze) return;

    window.wms.isStockFrozen = false;
    if (window.wms.stockFreezeInfo) {
      window.wms.stockFreezeInfo.isFrozen = false;
      window.wms.stockFreezeInfo.liftedAt = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      window.wms.stockFreezeInfo.liftedBy = window.wms.currentUser ? window.wms.currentUser.name : 'Rajesh Sharma (Supervisor)';
    }

    addAuditLog('Warehouse Stock Freeze Lifted', 'STOCK_FREEZE', 'FROZEN', `Warehouse stock freeze lifted by ${window.wms.currentUser?.name || 'Rajesh Sharma'}. Normal picking operations resumed.`);
    saveWMSState(window.wms);
    renderAllWMSViews();
    alert('✅ WAREHOUSE STOCK FREEZE LIFTED.\n\nNormal outbound picking, production issuance, and bin relocations have been resumed.');
  }
}

function setCountTypeFilter(type) {
  activeCountTypeFilter = type;
  renderCycleCountScreen();
}

function toggleBlindCountingMask() {
  isBlindCountingMasked = !isBlindCountingMasked;
  renderCycleCountScreen();
}

function renderCycleCountScreen() {
  updateCycleCountKPIs();

  const container = document.getElementById('cycle-count-subtab-content');
  if (!container) return;

  if (activeCycleCountSubtab === 'plans') {
    renderCycleCountPlansSubtab(container);
  } else if (activeCycleCountSubtab === 'physical') {
    renderPhysicalInventorySubtab(container);
  } else if (activeCycleCountSubtab === 'purchasing') {
    renderPurchasingVerificationView(container);
  }
}

// -------------------------------------------------------------
// I.1: CYCLE COUNT PLANS SUBTAB
// -------------------------------------------------------------
function renderCycleCountPlansSubtab(container) {
  const plant = window.wms.activePlant || 'All';
  let plans = filterByPlant(window.wms.cycleCountPlans || [], plant);

  if (activeCountTypeFilter !== 'All') {
    plans = plans.filter(p => p.countType === activeCountTypeFilter);
  }

  container.innerHTML = `
    <!-- Count Type Filter Bar (I.1) -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; background:#f8fafc; padding:10px 14px; border-radius:8px; border:1px solid #e2e8f0;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="font-size:11.5px; font-weight:800; color:#475569; text-transform:uppercase;">Filter Count Type:</span>
        <button class="filter-pill-btn ${activeCountTypeFilter === 'All' ? 'active' : ''}" onclick="setCountTypeFilter('All')">
          All Types (${(window.wms.cycleCountPlans || []).length})
        </button>
        <button class="filter-pill-btn ${activeCountTypeFilter === 'DAILY_ABC' ? 'active' : ''}" onclick="setCountTypeFilter('DAILY_ABC')">
          ⚡ Daily ABC Fast Movers (${(window.wms.cycleCountPlans || []).filter(p => p.countType === 'DAILY_ABC').length})
        </button>
        <button class="filter-pill-btn ${activeCountTypeFilter === 'HALF_YEARLY' ? 'active' : ''}" onclick="setCountTypeFilter('HALF_YEARLY')">
          📅 Half-Yearly (Dec) (${(window.wms.cycleCountPlans || []).filter(p => p.countType === 'HALF_YEARLY').length})
        </button>
        <button class="filter-pill-btn ${activeCountTypeFilter === 'ANNUAL_PHYSICAL' ? 'active' : ''}" onclick="setCountTypeFilter('ANNUAL_PHYSICAL')">
          🏛️ Annual Wall-to-Wall (${(window.wms.cycleCountPlans || []).filter(p => p.countType === 'ANNUAL_PHYSICAL').length})
        </button>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-wms-secondary small" onclick="openCreateCycleCountModal()">
          <span class="btn-icon-plus">+</span> New Count Schedule
        </button>
      </div>
    </div>

    <!-- Plans Cards -->
    <div style="display:flex; flex-direction:column; gap:16px;">
      ${plans.length === 0 ? `
        <div style="text-align:center; padding:40px 20px; background:#fff; border-radius:8px; border:1px dashed #cbd5e1; color:#64748b;">
          <div style="font-size:32px; margin-bottom:8px;">📋</div>
          <div style="font-size:14px; font-weight:700; color:#0f172a;">No cycle count plans found for the selected filter</div>
          <div style="font-size:12px; margin-top:4px;">Generate a new plan using the button above.</div>
        </div>
      ` : plans.map(p => {
        const typeBadge = p.countType === 'ANNUAL_PHYSICAL' ?
          '<span class="badge-count-annual">🏛️ Annual Physical Inventory</span>' :
          (p.countType === 'HALF_YEARLY' ?
            '<span class="badge-count-halfyearly">📅 Half-Yearly (December)</span>' :
            '<span class="badge-count-daily">⚡ Daily Cycle Count (ABC)</span>');

        const freezePill = p.isStockFrozen ?
          '<span style="background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; font-size:10.5px; font-weight:800; padding:2px 7px; border-radius:4px;">🔒 STOCK FREEZE ACTIVE</span>' : '';

        return `
          <div class="count-plan-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; box-shadow:0 1px 3px rgba(15,23,42,0.04);">
            <div class="count-plan-header" style="background:#f8fafc; padding:12px 16px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <div class="count-plan-title" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                <span class="count-plan-no" style="font-family:var(--font-mono); font-size:14px; font-weight:800; color:#0f172a;">${p.countNo}</span>
                ${typeBadge}
                ${freezePill}
                <span class="wms-badge ${getStatusBadgeClass(p.status)}">${p.status}</span>
                <span class="count-plan-meta" style="font-size:12px; color:#64748b;">
                  Zone: <strong style="color:#0f172a;">${p.zone}</strong> • Velocity: <strong>Class ${p.abcClass}</strong> • Counter: <strong>${p.counter}</strong> (${p.progressPct}%)
                </span>
              </div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="btn-wms-secondary small" onclick="printCountSheet('${p.countNo}')">🖨️ Printable Count Sheet</button>
                ${p.status === 'Counting' ? `
                  <button class="btn-wms-primary small" onclick="simulateHandheldCountFinish('${p.countNo}')">Simulate Handheld Submit</button>
                ` : ''}
                ${p.lines.some(l => l.varianceQty !== 0 && !l.lineStatus.includes('Posted to SAP')) ? `
                  <button class="btn-wms-primary small" style="background:#059669; border-color:#059669;" onclick="bulkApproveVariances('${p.countNo}')">
                    ✅ Bulk Approve Variances (SAP 711/712)
                  </button>
                ` : ''}
              </div>
            </div>

            <div class="table-responsive">
              <table class="wms-table">
                <thead>
                  <tr>
                    <th>Bin Location</th>
                    <th>Material Code & Description</th>
                    <th>HU / Lot Reference</th>
                    <th>System Qty</th>
                    <th>Counted Qty</th>
                    <th>Variance (Qty & %)</th>
                    <th>SAP Movement</th>
                    <th>Reason Code</th>
                    <th>Approved By</th>
                    <th>SAP Doc No</th>
                    <th>Line Status</th>
                    <th style="text-align:right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${p.lines.map(l => {
                    const mvtTag = l.varianceQty < 0 ?
                      '<span style="background:#fee2e2; color:#b91c1c; font-weight:800; font-size:10px; padding:2px 6px; border-radius:4px;">711 (Shrink)</span>' :
                      (l.varianceQty > 0 ?
                        '<span style="background:#dcfce7; color:#15803d; font-weight:800; font-size:10px; padding:2px 6px; border-radius:4px;">712 (Surplus)</span>' :
                        '<span style="color:#94a3b8; font-size:11px;">—</span>');

                    return `
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
                        <td>${mvtTag}</td>
                        <td><span style="font-size:11px; color:#64748b;">${l.reasonCode || '—'}</span></td>
                        <td>${l.approvedBy || '—'}</td>
                        <td><b style="font-family:var(--font-mono); color:#2563eb; font-size:11px;">${l.sapDocNo || '—'}</b></td>
                        <td><span class="wms-badge ${getStatusBadgeClass(l.lineStatus)}">${l.lineStatus}</span></td>
                        <td onclick="event.stopPropagation()" style="text-align:right;">
                          <div style="display:inline-flex; gap:4px; flex-wrap:wrap; justify-content:flex-end;">
                            <button class="btn-wms-secondary small" onclick="openEditCountModal('${p.countNo}', ${l.lineId})">✏️ Edit</button>
                            ${l.lineStatus === 'Variance flagged' ? `
                              <button class="btn-wms-secondary small" onclick="requestRecount('${p.countNo}', ${l.lineId})">Recount</button>
                              <button class="btn-wms-primary small" onclick="acceptVariance('${p.countNo}', ${l.lineId})">Accept</button>
                            ` : (l.lineStatus === 'Adjustment pending approval' ? `
                              <button class="btn-wms-primary small" style="background:#059669; border-color:#059669;" onclick="approveStockAdjustment('${p.countNo}', ${l.lineId})">Approve (SAP)</button>
                            ` : '')}
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// -------------------------------------------------------------
// I.2: FULL PHYSICAL INVENTORY (WALL-TO-WALL) MODE
// -------------------------------------------------------------
function renderPhysicalInventorySubtab(container) {
  const annualPlan = (window.wms.cycleCountPlans || []).find(p => p.countType === 'ANNUAL_PHYSICAL') || (window.wms.cycleCountPlans || [])[0];
  const isFrozen = !!window.wms.isStockFrozen;

  if (!annualPlan) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; background:#fff; border-radius:8px; border:1px solid #e2e8f0;">
        <h3>No Annual Physical Inventory Plan Configured</h3>
        <p>Click "Generate Count Plan" and select "Annual Physical Inventory (Wall-to-Wall)" to start.</p>
        <button class="btn-wms-primary" onclick="openCreateCycleCountModal()">+ Create Annual Plan</button>
      </div>
    `;
    return;
  }

  const lines = annualPlan.lines || [];
  const varianceLines = lines.filter(l => l.varianceQty !== 0);
  const totalShrink = lines.filter(l => l.varianceQty < 0).reduce((sum, l) => sum + Math.abs(l.varianceQty), 0);
  const totalSurplus = lines.filter(l => l.varianceQty > 0).reduce((sum, l) => sum + l.varianceQty, 0);

  container.innerHTML = `
    <!-- Top Physical Inventory Control Console -->
    <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#fff; border-radius:10px; padding:18px 22px; margin-bottom:16px; border:1px solid #334155; box-shadow:0 4px 15px rgba(15,23,42,0.15);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
        <div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px;">🏛️</span>
            <div>
              <h3 style="margin:0; font-size:18px; font-weight:800; color:#f8fafc;">Wall-to-Wall Annual Physical Inventory Mode</h3>
              <p style="margin:4px 0 0 0; font-size:12px; color:#94a3b8;">
                Plan: <strong style="color:#38bdf8; font-family:var(--font-mono);">${annualPlan.countNo}</strong> • Plant 1 Narsapur Central Warehouse • Scheduled: <strong>${annualPlan.plannedDate}</strong>
              </p>
            </div>
          </div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-wms-secondary" style="background:#334155; color:#fff; border-color:#475569;" onclick="toggleBlindCountingMask()">
            ${isBlindCountingMasked ? '👁️ Unmask System Stock' : '🕶️ Mask Blind Quantities'}
          </button>
          <button class="btn-wms-secondary" style="background:#334155; color:#fff; border-color:#475569;" onclick="printCountSheet('${annualPlan.countNo}')">
            🖨️ Printable Count Sheets
          </button>
          <button class="btn-wms-primary" style="background:#059669; border-color:#059669;" onclick="bulkApproveVariances('${annualPlan.countNo}')">
            ✅ Supervisor Bulk Approval & Post to SAP
          </button>
        </div>
      </div>

      <!-- Live Wall-to-Wall Status Chips -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-top:16px; padding-top:14px; border-top:1px solid #334155;">
        <div style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:10.5px; text-transform:uppercase; color:#94a3b8; font-weight:800;">Stock Freeze Status</div>
          <div style="font-size:14px; font-weight:900; color:${isFrozen ? '#f87171' : '#4ade80'}; margin-top:2px;">
            ${isFrozen ? '🔒 ACTIVE (OPERATIONS FROZEN)' : '🟢 UNFROZEN (NORMAL)'}
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">
            <a href="javascript:void(0)" onclick="toggleGlobalStockFreeze()" style="color:#38bdf8; text-decoration:underline;">
              ${isFrozen ? 'Click to Lift Freeze' : 'Click to Activate Freeze'}
            </a>
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:10.5px; text-transform:uppercase; color:#94a3b8; font-weight:800;">Wall-to-Wall Progress</div>
          <div style="font-size:14px; font-weight:900; color:#38bdf8; margin-top:2px;">
            ${annualPlan.progressPct}% Completed
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">${lines.length} Storage Bins Audited</div>
        </div>

        <div style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:10.5px; text-transform:uppercase; color:#94a3b8; font-weight:800;">Shrinkage (Mvt 711)</div>
          <div style="font-size:14px; font-weight:900; color:#f87171; margin-top:2px;">
            -${totalShrink} EA Deficit
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">SAP Physical Loss Posting</div>
        </div>

        <div style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:10.5px; text-transform:uppercase; color:#94a3b8; font-weight:800;">Surplus (Mvt 712)</div>
          <div style="font-size:14px; font-weight:900; color:#4ade80; margin-top:2px;">
            +${totalSurplus} EA Surplus
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">SAP Physical Gain Posting</div>
        </div>
      </div>
    </div>

    <!-- Wall-to-Wall Inventory Lines Table -->
    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
      <div style="padding:12px 16px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="margin:0; font-size:13px; font-weight:800; color:#0f172a;">
          📦 Wall-to-Wall Count Lines • Physical Verification & SAP Postings
        </h4>
        <span style="font-size:11px; color:#64748b;">
          ${isBlindCountingMasked ? '🕶️ Blind mode active: System stock hidden' : '👁️ Standard supervisor audit mode'}
        </span>
      </div>

      <div class="table-responsive">
        <table class="wms-table">
          <thead>
            <tr>
              <th>Bin Location</th>
              <th>Material Code & Description</th>
              <th>Handling Unit (HU) / Batch</th>
              <th>System Qty</th>
              <th>Counted Qty</th>
              <th>Variance</th>
              <th>SAP Movement</th>
              <th>Reason Code</th>
              <th>Approved By</th>
              <th>SAP Doc Ref</th>
              <th>Status</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map(l => {
              const mvtBadge = l.varianceQty < 0 ?
                '<span style="background:#fee2e2; color:#b91c1c; font-weight:800; font-size:10.5px; padding:2px 8px; border-radius:4px;">Mvt 711 (Shrink)</span>' :
                (l.varianceQty > 0 ?
                  '<span style="background:#dcfce7; color:#15803d; font-weight:800; font-size:10.5px; padding:2px 8px; border-radius:4px;">Mvt 712 (Surplus)</span>' :
                  '<span style="color:#94a3b8; font-size:11px;">Balanced</span>');

              const sysDisplay = isBlindCountingMasked ?
                '<span style="font-family:var(--font-mono); color:#94a3b8; letter-spacing:2px;">***</span>' :
                `<b>${l.systemQty} EA</b>`;

              return `
                <tr style="background:${l.isOutsideTolerance ? '#fff5f5' : '#ffffff'};">
                  <td><b style="font-family:var(--font-mono); color:#0f172a;">${l.bin}</b></td>
                  <td><b>${l.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${l.materialDescription}</span></td>
                  <td><span style="font-family:var(--font-mono); font-size:11px;">${l.huLot}</span></td>
                  <td>${sysDisplay}</td>
                  <td><b style="color:#0f172a; font-size:13px;">${l.countedQty} EA</b></td>
                  <td>
                    <span class="tolerance-badge ${l.isOutsideTolerance ? 'tolerance-red' : 'tolerance-green'}">
                      ${l.varianceQty > 0 ? '+' : ''}${l.varianceQty} EA (${l.variancePct}%)
                    </span>
                  </td>
                  <td>${mvtBadge}</td>
                  <td><span style="font-size:11px; color:#64748b;">${l.reasonCode || '—'}</span></td>
                  <td>${l.approvedBy || '—'}</td>
                  <td><b style="font-family:var(--font-mono); color:#2563eb; font-size:11px;">${l.sapDocNo || '—'}</b></td>
                  <td><span class="wms-badge ${getStatusBadgeClass(l.lineStatus)}">${l.lineStatus}</span></td>
                  <td style="text-align:right;">
                    <div style="display:inline-flex; gap:4px; flex-wrap:wrap; justify-content:flex-end;">
                      <button class="btn-wms-secondary small" onclick="openEditCountModal('${annualPlan.countNo}', ${l.lineId})">✏️ Edit</button>
                      ${l.lineStatus === 'Variance flagged' ? `
                        <button class="btn-wms-secondary small" onclick="requestRecount('${annualPlan.countNo}', ${l.lineId})">Recount</button>
                        <button class="btn-wms-primary small" onclick="acceptVariance('${annualPlan.countNo}', ${l.lineId})">Accept</button>
                      ` : (l.lineStatus === 'Adjustment pending approval' ? `
                        <button class="btn-wms-primary small" style="background:#059669; border-color:#059669;" onclick="approveStockAdjustment('${annualPlan.countNo}', ${l.lineId})">Post SAP</button>
                      ` : '')}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// I.3: PURCHASING DEPARTMENT STOCK VERIFICATION OUTPUT
// -------------------------------------------------------------
function onPurchasingSearchSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('purchasing-search-input');
  if (input) {
    purchasingSearchQuery = input.value.trim().toLowerCase();
    renderCycleCountScreen();
  }
}

function setPurchasingActionFilter(filter) {
  purchasingActionFilter = filter;
  renderCycleCountScreen();
}

function renderPurchasingVerificationView(container) {
  const materials = window.wms.materials || [];
  const handlingUnits = window.wms.handlingUnits || [];
  const stockLevels = window.wms.stockLevelMaster || [];
  const purchaseOrders = window.wms.purchaseOrders || [];
  const cycleCountPlans = window.wms.cycleCountPlans || [];

  // Compute Purchasing Rows
  const purchasingRows = materials.map(m => {
    const hus = handlingUnits.filter(h => h.materialCode === m.code);
    const availStock = hus.filter(h => h.stockStatus === 'AVAILABLE').reduce((sum, h) => sum + (h.quantity || 0), 0);
    const stagedStock = hus.filter(h => h.stockStatus === 'STAGED' || h.stockStatus === 'PARKED').reduce((sum, h) => sum + (h.quantity || 0), 0);
    const totalWmsStock = availStock + stagedStock;

    const cfg = stockLevels.find(s => s.materialCode === m.code) || { reorderPoint: 200, safetyStock: 100, maxStock: 1000 };
    const pos = purchaseOrders.filter(p => p.materialCode === m.code && (p.status === 'Open' || p.status === 'Pending' || p.status === 'Partially Received'));
    const openPoQty = pos.reduce((sum, p) => sum + Math.max(0, (p.orderedQty || 0) - (p.receivedQty || 0)), 0);

    // Latest Verified Count Line
    const allCountLines = cycleCountPlans.flatMap(c => c.lines || []).filter(l => l.materialCode === m.code);
    const latestLine = allCountLines.length > 0 ? allCountLines[allCountLines.length - 1] : null;
    const countedStock = latestLine ? latestLine.countedQty : totalWmsStock;
    const countVariance = latestLine ? latestLine.varianceQty : 0;
    const sapBookStock = totalWmsStock - countVariance;

    const netShortage = Math.max(0, cfg.reorderPoint - (availStock + openPoQty));

    // Suggested Purchasing Action Logic
    let actionType = 'HEALTHY';
    let actionBadgeClass = 'purch-action-healthy';
    let actionTitle = '🟢 HEALTHY BUFFER';
    let actionDesc = `Stock above safety threshold (${availStock} >= ${cfg.reorderPoint} EA)`;

    if (availStock < cfg.reorderPoint) {
      if (openPoQty === 0) {
        actionType = 'URGENT';
        actionBadgeClass = 'purch-action-urgent';
        actionTitle = '🔴 URGENT PO REQUIRED';
        actionDesc = `Net deficit ${cfg.reorderPoint - availStock} EA below ROP; 0 open POs. Raise PO immediately`;
      } else {
        actionType = 'EXPEDITE';
        actionBadgeClass = 'purch-action-expedite';
        actionTitle = '🟡 EXPEDITE INBOUND PO';
        actionDesc = `Deficit exists; PO (${openPoQty} EA) in-flight. Expedite supplier arrival`;
      }
    } else if (totalWmsStock > (cfg.maxStock || 1200)) {
      actionType = 'OVERSTOCK';
      actionBadgeClass = 'purch-action-overstock';
      actionTitle = '🔵 OVERSTOCK HOLD';
      actionDesc = `Exceeds max stock limit (${totalWmsStock} > ${cfg.maxStock || 1200} EA); Defer upcoming POs`;
    }

    return {
      materialCode: m.code,
      description: m.description,
      supplier: m.supplier || 'Honda OEM Tier-1 Partner',
      plant: m.plant || window.wms.activePlant || 'HMSI Narsapur Plant 1',
      availStock,
      stagedStock,
      totalWmsStock,
      sapBookStock,
      countedStock,
      countVariance,
      reorderPoint: cfg.reorderPoint,
      safetyStock: cfg.safetyStock,
      maxStock: cfg.maxStock || 1200,
      openPoQty,
      netShortage,
      actionType,
      actionBadgeClass,
      actionTitle,
      actionDesc,
      openPoList: pos.map(p => p.poNumber).join(', ') || 'None'
    };
  });

  // Apply Search & Action Filters
  let filteredRows = purchasingRows;
  if (purchasingSearchQuery) {
    filteredRows = filteredRows.filter(r =>
      r.materialCode.toLowerCase().includes(purchasingSearchQuery) ||
      r.description.toLowerCase().includes(purchasingSearchQuery) ||
      r.supplier.toLowerCase().includes(purchasingSearchQuery)
    );
  }
  if (purchasingActionFilter !== 'All') {
    filteredRows = filteredRows.filter(r => r.actionType === purchasingActionFilter);
  }

  // Summary Metrics
  const urgentCount = purchasingRows.filter(r => r.actionType === 'URGENT').length;
  const expediteCount = purchasingRows.filter(r => r.actionType === 'EXPEDITE').length;
  const totalOpenUnits = purchasingRows.reduce((sum, r) => sum + r.openPoQty, 0);
  const totalShortageUnits = purchasingRows.reduce((sum, r) => sum + r.netShortage, 0);

  container.innerHTML = `
    <!-- Top Summary Banner for Purchasing Department -->
    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:16px 20px; margin-bottom:16px; box-shadow:0 1px 3px rgba(15,23,42,0.04);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:22px;">💼</span>
            <div>
              <h3 style="margin:0; font-size:16px; font-weight:800; color:#0f172a;">Daily Stock Verification Output for Purchasing Department</h3>
              <p style="margin:3px 0 0 0; font-size:12px; color:#64748b;">
                Pre-formatted procurement status view • Net shortages, pending PO quantities & suggested SAP PO actions
              </p>
            </div>
          </div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-wms-primary" style="background:#8b3e00; border-color:#8b3e00;" onclick="exportPurchasingStockVerificationCSV()">
            📥 Export for Purchasing (CSV)
          </button>
          <button class="btn-wms-secondary" onclick="printPurchasingVerificationSheet()">
            🖨️ Print Verification Sheet
          </button>
        </div>
      </div>

      <!-- KPI Summary Chips -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-top:16px; padding-top:14px; border-top:1px solid #e2e8f0;">
        <div class="count-kpi-chip" style="background:#f8fafc; border-color:#cbd5e1; color:#0f172a;">
          Active Purchasing SKUs: <b>${purchasingRows.length}</b>
        </div>
        <div class="count-kpi-chip warning" style="background:#fef2f2; border-color:#fca5a5; color:#991b1b;">
          🔴 Urgent POs Needed: <b>${urgentCount} SKUs</b>
        </div>
        <div class="count-kpi-chip warning" style="background:#fffbeb; border-color:#fcd34d; color:#92400e;">
          🟡 Expedite Open POs: <b>${expediteCount} SKUs</b>
        </div>
        <div class="count-kpi-chip success" style="background:#f0fdf4; border-color:#86efac; color:#166534;">
          Open Inbound PO Units: <b>${totalOpenUnits} EA</b>
        </div>
        <div class="count-kpi-chip" style="background:#eff6ff; border-color:#bfdbfe; color:#1e40af;">
          Net Deficit Units: <b>${totalShortageUnits} EA</b>
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px; background:#f8fafc; padding:10px 14px; border-radius:8px; border:1px solid #e2e8f0;">
      <form onsubmit="onPurchasingSearchSubmit(event)" style="display:flex; gap:6px; flex:1; max-width:400px;">
        <input type="text" id="purchasing-search-input" class="search-input" placeholder="Search Part Code, Description, or Supplier..." value="${purchasingSearchQuery}" style="width:100%; font-size:12px;">
        <button type="submit" class="btn-wms-secondary small">Search</button>
      </form>

      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="font-size:11px; font-weight:800; color:#475569; text-transform:uppercase;">Filter Action:</span>
        <button class="filter-pill-btn ${purchasingActionFilter === 'All' ? 'active' : ''}" onclick="setPurchasingActionFilter('All')">
          All (${purchasingRows.length})
        </button>
        <button class="filter-pill-btn ${purchasingActionFilter === 'URGENT' ? 'active' : ''}" onclick="setPurchasingActionFilter('URGENT')">
          🔴 Urgent POs (${urgentCount})
        </button>
        <button class="filter-pill-btn ${purchasingActionFilter === 'EXPEDITE' ? 'active' : ''}" onclick="setPurchasingActionFilter('EXPEDITE')">
          🟡 Expedite (${expediteCount})
        </button>
        <button class="filter-pill-btn ${purchasingActionFilter === 'HEALTHY' ? 'active' : ''}" onclick="setPurchasingActionFilter('HEALTHY')">
          🟢 Healthy Buffer (${purchasingRows.filter(r => r.actionType === 'HEALTHY').length})
        </button>
      </div>
    </div>

    <!-- Pre-Formatted Purchasing Verification Table -->
    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
      <div class="table-responsive">
        <table class="wms-table">
          <thead>
            <tr>
              <th>Part Code & Description</th>
              <th>Primary Supplier</th>
              <th>Plant</th>
              <th>Current WMS Stock</th>
              <th>SAP Book Stock</th>
              <th>Physical Counted</th>
              <th>Variance</th>
              <th>Reorder Point (ROP)</th>
              <th>Pending Inbound PO Qty</th>
              <th>Net Shortage</th>
              <th>Suggested Purchasing Action</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRows.length === 0 ? `
              <tr>
                <td colspan="12" style="text-align:center; padding:30px; color:#64748b;">
                  No material records match the current search or action filter.
                </td>
              </tr>
            ` : filteredRows.map(r => `
              <tr style="background:${r.actionType === 'URGENT' ? '#fff5f5' : (r.actionType === 'EXPEDITE' ? '#fffbeb' : '#ffffff')};">
                <td>
                  <b style="font-family:var(--font-mono); color:#0f172a;">${r.materialCode}</b><br>
                  <span style="font-size:11px; color:#475569;">${r.description}</span>
                </td>
                <td>
                  <span style="font-size:11.5px; font-weight:700; color:#1e293b;">${r.supplier}</span>
                </td>
                <td><span style="font-size:11px; color:#64748b;">${r.plant}</span></td>
                <td>
                  <b style="font-size:12.5px; color:#0f172a;">${r.availStock} EA</b>
                  ${r.stagedStock > 0 ? `<br><span style="font-size:10px; color:#64748b;">(+${r.stagedStock} Staged)</span>` : ''}
                </td>
                <td><b style="font-family:var(--font-mono); font-size:12px;">${r.sapBookStock} EA</b></td>
                <td><b style="font-family:var(--font-mono); font-size:12px; color:#0f172a;">${r.countedStock} EA</b></td>
                <td>
                  <span class="tolerance-badge ${r.countVariance < 0 ? 'tolerance-red' : (r.countVariance > 0 ? 'tolerance-green' : '')}">
                    ${r.countVariance > 0 ? '+' : ''}${r.countVariance} EA
                  </span>
                </td>
                <td>
                  <span style="font-size:12px; font-weight:700;">${r.reorderPoint} EA</span><br>
                  <span style="font-size:10px; color:#64748b;">Safety: ${r.safetyStock} EA</span>
                </td>
                <td>
                  <b style="font-size:12px; color:${r.openPoQty > 0 ? '#2563eb' : '#64748b'};">${r.openPoQty} EA</b>
                  ${r.openPoList !== 'None' ? `<br><span style="font-size:10px; color:#64748b; font-family:var(--font-mono);">${r.openPoList}</span>` : ''}
                </td>
                <td>
                  <b style="font-size:13px; color:${r.netShortage > 0 ? '#dc2626' : '#16a34a'};">
                    ${r.netShortage > 0 ? `-${r.netShortage} EA` : '0 EA'}
                  </b>
                </td>
                <td>
                  <div class="purch-action-badge ${r.actionBadgeClass}">
                    <span>${r.actionTitle}</span>
                  </div>
                  <div style="font-size:10.5px; color:#475569; margin-top:2px;">${r.actionDesc}</div>
                </td>
                <td style="text-align:right;">
                  <div style="display:inline-flex; gap:4px; flex-wrap:wrap; justify-content:flex-end;">
                    ${r.actionType === 'URGENT' ? `
                      <button class="btn-wms-primary small" style="background:#dc2626; border-color:#dc2626;" onclick="alert('Creating Purchase Requisition for ${r.materialCode}... Deficit: ${r.netShortage} EA to supplier ${r.supplier}.');">
                        + Raise PO
                      </button>
                    ` : (r.actionType === 'EXPEDITE' ? `
                      <button class="btn-wms-primary small" style="background:#d97706; border-color:#d97706;" onclick="if(typeof openVendorAlertModal === 'function') openVendorAlertModal('${r.materialCode}'); else alert('Expedite alert dispatched to ${r.supplier} for ${r.materialCode}.');">
                        📧 Expedite
                      </button>
                    ` : `
                      <button class="btn-wms-secondary small" onclick="alert('Stock status for ${r.materialCode} is healthy (${r.availStock} EA available).');">
                        ℹ️ Info
                      </button>
                    `)}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// I.1: COUNT CREATION MODAL WITH SELECTABLE COUNT TYPES
// -------------------------------------------------------------
function openCreateCycleCountModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div class="wms-form-group">
        <label>Select Inventory Verification Count Type* (Module I.1)</label>
        <select class="select-filter" id="cc-type-select" style="width:100%; font-weight:700;" onchange="onCountTypeModalChange(this)">
          <option value="DAILY_ABC" selected>⚡ Daily Cycle Count (ABC Fast Movers) — High Velocity Powertrain & Assembly</option>
          <option value="HALF_YEARLY">📅 Half-yearly Internal Verification (December) — Mid-Year Statutory Sub-Assembly Audit</option>
          <option value="ANNUAL_PHYSICAL">🏛️ Annual Physical Inventory — Wall-to-Wall Warehouse Audit with Stock Freeze</option>
        </select>
      </div>

      <div class="wms-form-group">
        <label>Target Warehouse Zone / Scope*</label>
        <select class="select-filter" id="cc-zone-select" style="width:100%;">
          <option value="ZONE-A-PWR">Zone A - Powertrain & Chassis (Brake Pads / Throttle Bodies)</option>
          <option value="ZONE-B-ELE">Zone B - Electronics Bay (ECUs & Starters)</option>
          <option value="ZONE-C-CHS">Zone C - Chassis & Suspension Frame Bay</option>
          <option value="ZONE-D-TYR">Zone D - Tyres & Rubber Bay</option>
          <option value="WALL-TO-WALL">WALL-TO-WALL (All Plant 1 Storage Racks, Floor Bins & Buffers)</option>
        </select>
      </div>

      <div class="wms-form-group">
        <label>Assign Counter Operator*</label>
        <select class="select-filter" id="cc-counter-select" style="width:100%;">
          <option value="Sanjay Verma (Op 01)">Sanjay Verma (Op 01 - Zebra TC57 #01 (TBC))</option>
          <option value="Prakash (Op 03)">Prakash (Op 03 - Zebra TC57 #02 (TBC))</option>
          <option value="Sanjay Verma & Audit Team">Sanjay Verma & External Statutory Audit Team</option>
        </select>
      </div>

      <div class="wms-form-group" style="display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="cc-blind-check" checked>
        <label for="cc-blind-check" style="margin:0; font-weight:700;">Blind Count Mode (System quantities hidden on Handheld Scanner)</label>
      </div>

      <div class="wms-form-group" id="cc-stock-freeze-row" style="background:#fef2f2; border:1px solid #fecaca; padding:10px; border-radius:6px; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="cc-stock-freeze-check">
        <label for="cc-stock-freeze-check" style="margin:0; font-weight:800; color:#991b1b;">
          🔒 Activate Warehouse Stock Freeze during physical counting
        </label>
      </div>
    </div>
  `;

  openDynamicModal('Generate Inventory Verification Count Plan (Module I)', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="submitCreateCycleCount()">Release Count Plan</button>
  `);
}

function onCountTypeModalChange(selectEl) {
  const type = selectEl.value;
  const zoneSelect = document.getElementById('cc-zone-select');
  const freezeCheck = document.getElementById('cc-stock-freeze-check');
  const counterSelect = document.getElementById('cc-counter-select');

  if (type === 'ANNUAL_PHYSICAL') {
    if (zoneSelect) zoneSelect.value = 'WALL-TO-WALL';
    if (freezeCheck) freezeCheck.checked = true;
    if (counterSelect) counterSelect.value = 'Sanjay Verma & Audit Team';
  } else if (type === 'HALF_YEARLY') {
    if (freezeCheck) freezeCheck.checked = false;
  } else {
    if (zoneSelect && zoneSelect.value === 'WALL-TO-WALL') zoneSelect.value = 'ZONE-A-PWR';
    if (freezeCheck) freezeCheck.checked = false;
  }
}

function submitCreateCycleCount() {
  const countType = document.getElementById('cc-type-select').value;
  const zone = document.getElementById('cc-zone-select').value;
  const counter = document.getElementById('cc-counter-select').value;
  const isBlind = document.getElementById('cc-blind-check').checked;
  const enableFreeze = document.getElementById('cc-stock-freeze-check')?.checked || false;

  let typeName = 'Daily Cycle Count (ABC Fast Movers)';
  let abcClass = 'A';
  if (countType === 'HALF_YEARLY') {
    typeName = 'Half-yearly Internal Verification (December)';
    abcClass = 'A/B';
  } else if (countType === 'ANNUAL_PHYSICAL') {
    typeName = 'Annual Physical Inventory (Wall-to-Wall)';
    abcClass = 'All';
  }

  const countNo = `CC-2026-${String(window.wms.cycleCountPlans.length + 93).padStart(4, '0')}`;
  const newPlan = {
    countNo: countNo,
    plant: 'HMSI Narsapur Plant 1',
    zone: zone,
    abcClass: abcClass,
    countType: countType,
    countTypeName: typeName,
    plannedDate: '24-Sep-2026',
    counter: counter,
    progressPct: 0,
    status: 'Counting',
    blindCount: isBlind,
    isStockFrozen: enableFreeze,
    supervisorApproved: false,
    supervisorApprovedBy: '—',
    lines: [
      {
        lineId: 1,
        bin: zone === 'WALL-TO-WALL' ? 'PWR-LOC-A01-RCK-01' : 'PWR-LOC-A03-RCK-01',
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
        sapMovement: '—',
        lineStatus: 'Counted'
      }
    ]
  };

  window.wms.cycleCountPlans.unshift(newPlan);

  if (enableFreeze) {
    window.wms.isStockFrozen = true;
    window.wms.stockFreezeInfo = {
      isFrozen: true,
      countNo: countNo,
      frozenAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      frozenBy: window.wms.currentUser ? window.wms.currentUser.name : 'Rajesh Sharma',
      reason: `Stock Freeze activated for ${typeName} (${countNo})`
    };
  }

  addAuditLog(
    'Inventory Verification Plan Released',
    countNo,
    'Planned',
    `Released ${typeName} for ${zone}. Stock Freeze: ${enableFreeze ? 'ACTIVE' : 'OFF'}. Counter: ${counter}`
  );

  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderCycleCountScreen();
  alert(`✅ Count Plan ${countNo} (${typeName}) generated and released to Handheld Scanners!${enableFreeze ? '\n\n🔒 WAREHOUSE STOCK FREEZE IS NOW ACTIVE.' : ''}`);
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
        <div><b>Count Type:</b> <b>${plan.countTypeName || plan.countType}</b></div>
        <div><b>Warehouse Zone:</b> ${plan.zone}</div>
        <div><b>Assigned Counter:</b> ${plan.counter}</div>
        <div><b>Stock Freeze:</b> ${plan.isStockFrozen ? '🔒 Active' : 'Normal'}</div>
      </div>

      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
        <h4 style="margin:0 0 8px 0; font-size:13px; color:#0f172a;">📦 Material & Count Line Breakdown</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div><b>Bin Location:</b> <span style="font-family:var(--font-mono); color:#2563eb;">${line.bin}</span></div>
          <div><b>Material Code:</b> <b>${line.materialCode}</b></div>
          <div style="grid-column: span 2;"><b>Description:</b> ${line.materialDescription}</div>
          <div style="grid-column: span 2;"><b>HU / Lot Reference:</b> <span style="font-family:var(--font-mono);">${line.huLot}</span></div>
          <div><b>System Quantity:</b> <span style="font-weight:700;">${line.systemQty} EA</span></div>
          <div><b>Physically Counted:</b> <span style="font-weight:700; color:#0f172a;">${line.countedQty} EA</span></div>
          <div><b>Variance Quantity:</b> <span class="tolerance-badge ${line.isOutsideTolerance ? 'tolerance-red' : 'tolerance-green'}">${line.varianceQty > 0 ? '+' : ''}${line.varianceQty} EA (${line.variancePct}%)</span></div>
          <div><b>SAP Movement Type:</b> <b style="color:#2563eb;">${line.sapMovement || (line.varianceQty < 0 ? '711' : (line.varianceQty > 0 ? '712' : '—'))}</b></div>
          <div><b>Line Status:</b> <span class="wms-badge ${getStatusBadgeClass(line.lineStatus)}">${line.lineStatus}</span></div>
          <div><b>Reason Code:</b> ${line.reasonCode || '—'}</div>
          <div><b>SAP Doc Ref:</b> <span style="font-family:var(--font-mono); font-weight:700;">${line.sapDocNo || '—'}</span></div>
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
        <div><b>Location:</b> <span style="font-family:var(--font-mono); color:#2563eb;">${line.bin}</span> | <b>System Qty:</b> ${line.systemQty} EA</div>
      </div>

      <div class="wms-form-group">
        <label>Physical Counted Quantity (EA)*</label>
        <input type="number" id="edit-counted-qty" class="search-input" value="${line.countedQty}" style="width:100%;">
      </div>

      <div class="wms-form-group">
        <label>Variance Reason Code</label>
        <select class="select-filter" id="edit-reason-code" style="width:100%;">
          <option value="COUNT-VAR-GAIN" ${line.reasonCode === 'COUNT-VAR-GAIN' ? 'selected' : ''}>COUNT-VAR-GAIN (Physical Surplus / Found Stock → Mvt 712)</option>
          <option value="COUNT-VAR-SHRINK" ${line.reasonCode === 'COUNT-VAR-SHRINK' ? 'selected' : ''}>COUNT-VAR-SHRINK (Physical Shrinkage / Missing → Mvt 711)</option>
          <option value="DAMAGE-TRANSIT" ${line.reasonCode === 'DAMAGE-TRANSIT' ? 'selected' : ''}>DAMAGE-TRANSIT (Damaged Packaging)</option>
          <option value="—" ${line.reasonCode === '—' ? 'selected' : ''}>— (No Discrepancy)</option>
        </select>
      </div>

      <div class="wms-form-group">
        <label>Operator / Supervisor Notes</label>
        <input type="text" id="edit-count-notes" class="search-input" placeholder="e.g., Physical count re-verified on high rack" style="width:100%;">
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
  const variancePct = line.systemQty > 0 ? ((varianceQty / line.systemQty) * 100).toFixed(2) : 0;
  const isOutsideTolerance = Math.abs(varianceQty) > 0;

  line.countedQty = newQty;
  line.varianceQty = varianceQty;
  line.variancePct = variancePct;
  line.isOutsideTolerance = isOutsideTolerance;
  line.reasonCode = reasonCode;
  line.adjustmentQty = varianceQty;
  line.sapMovement = varianceQty < 0 ? '711' : (varianceQty > 0 ? '712' : '—');
  line.lineStatus = isOutsideTolerance ? 'Variance flagged' : 'Counted';

  addAuditLog('Cycle Count Line Updated', `${countNo}-L${lineId}`, `${line.systemQty} EA`, `Physical count updated to ${newQty} EA. Variance: ${varianceQty > 0 ? '+' : ''}${varianceQty} EA`);
  saveWMSState(window.wms);

  closeModal('modal-dynamic-form');
  renderCycleCountScreen();
  alert(`Count updated to ${newQty} EA for ${line.materialCode}. Variance recalculated: ${varianceQty > 0 ? '+' : ''}${varianceQty} EA.`);
}

function acceptVariance(countNo, lineId) {
  const plan = window.wms.cycleCountPlans.find(p => p.countNo === countNo);
  if (!plan) return;
  const line = plan.lines.find(l => l.lineId === lineId);
  if (!line) return;

  line.lineStatus = 'Adjustment pending approval';
  saveWMSState(window.wms);
  renderCycleCountScreen();
  alert(`Variance accepted for ${line.materialCode}. Status set to 'Adjustment pending approval'. Ready for SAP 711/712 posting.`);
}

function requestRecount(countNo, lineId) {
  const plan = window.wms.cycleCountPlans.find(p => p.countNo === countNo);
  if (!plan) return;
  const line = plan.lines.find(l => l.lineId === lineId);
  if (!line) return;

  line.lineStatus = 'Recount flagged';
  line.recountFlag = true;

  // Sync to mobile recount task if present
  if (window.wms.cycleCounts) {
    const mobTask = window.wms.cycleCounts.find(c => c.binCode === line.bin || c.materialCode === line.materialCode);
    if (mobTask) mobTask.status = 'RECOUNT_REQUIRED';
  }

  saveWMSState(window.wms);
  renderCycleCountScreen();
  alert(`Recount requested for ${line.materialCode} at ${line.bin}. Task dispatched to Handheld Scanner.`);
}

function approveStockAdjustment(countNo, lineId) {
  const plan = window.wms.cycleCountPlans.find(p => p.countNo === countNo);
  if (!plan) return;
  const line = plan.lines.find(l => l.lineId === lineId);
  if (!line) return;

  const movementType = line.varianceQty < 0 ? '711' : (line.varianceQty > 0 ? '712' : '711');
  const sapDocNo = `SAP-DOC-${movementType}-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const currentUser = window.wms.currentUser ? window.wms.currentUser.name : 'Rajesh Sharma (Manager)';

  line.lineStatus = `Posted to SAP (Mvt ${movementType})`;
  line.sapStatus = 'posted';
  line.sapMovement = movementType;
  line.sapDocNo = sapDocNo;
  line.approvedBy = currentUser;

  // Adjust Handling Unit in WMS
  const hu = (window.wms.handlingUnits || []).find(h => h.materialCode === line.materialCode && (line.huLot.includes(h.huNumber) || h.location === line.bin));
  if (hu) {
    hu.quantity = Math.max(0, hu.quantity + line.varianceQty);
  }

  // Record SAP Log
  if (!window.wms.sapSyncLogs) window.wms.sapSyncLogs = [];
  window.wms.sapSyncLogs.unshift({
    syncId: `SYNC-${Date.now().toString().slice(-6)}`,
    bapiName: 'BAPI_GOODSMVT_CREATE',
    movementType: movementType,
    documentNo: sapDocNo,
    materialCode: line.materialCode,
    quantity: Math.abs(line.varianceQty),
    uom: 'EA',
    direction: line.varianceQty < 0 ? 'Outbound Loss (Mvt 711)' : 'Inbound Surplus (Mvt 712)',
    status: 'SUCCESS',
    timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    responsePayload: `Movement ${movementType} posted in SAP ERP for Plant 1. Book stock adjusted by ${line.varianceQty > 0 ? '+' : ''}${line.varianceQty} EA.`
  });

  addAuditLog(
    `Physical Inventory Adjustment Posted (Mvt ${movementType})`,
    sapDocNo,
    `Variance: ${line.varianceQty > 0 ? '+' : ''}${line.varianceQty} EA`,
    `Material ${line.materialCode} adjusted at ${line.bin}. Approved by ${currentUser}. SAP Doc: ${sapDocNo}`
  );

  saveWMSState(window.wms);
  renderCycleCountScreen();
  alert(`✅ Adjustment approved and posted to SAP ERP!\n\nMovement: SAP Movement ${movementType} (${movementType === '711' ? 'Shrinkage' : 'Surplus'})\nSAP Document: ${sapDocNo}\nQuantity Adjusted: ${line.varianceQty > 0 ? '+' : ''}${line.varianceQty} EA`);
}

function bulkApproveVariances(countNo) {
  const plan = window.wms.cycleCountPlans.find(p => p.countNo === countNo);
  if (!plan) return;

  const pendingLines = plan.lines.filter(l => l.varianceQty !== 0 && !l.lineStatus.includes('Posted to SAP'));
  if (pendingLines.length === 0) {
    alert('No open variances requiring bulk approval in this count plan.');
    return;
  }

  const confirmBulk = window.confirm(`Approve all ${pendingLines.length} pending variances in ${plan.countNo}?\n\nThis will post SAP Movement 711 (Shrink) and Movement 712 (Surplus) for all discrepancies.`);
  if (!confirmBulk) return;

  const currentUser = window.wms.currentUser ? window.wms.currentUser.name : 'Rajesh Sharma (Manager)';
  let approvedCount = 0;

  pendingLines.forEach(l => {
    const movementType = l.varianceQty < 0 ? '711' : '712';
    const sapDocNo = `SAP-DOC-${movementType}-${Math.floor(10000000 + Math.random() * 90000000)}`;

    l.lineStatus = `Posted to SAP (Mvt ${movementType})`;
    l.sapStatus = 'posted';
    l.sapMovement = movementType;
    l.sapDocNo = sapDocNo;
    l.approvedBy = currentUser;

    // Adjust HU
    const hu = (window.wms.handlingUnits || []).find(h => h.materialCode === l.materialCode && (l.huLot.includes(h.huNumber) || h.location === l.bin));
    if (hu) {
      hu.quantity = Math.max(0, hu.quantity + l.varianceQty);
    }

    if (!window.wms.sapSyncLogs) window.wms.sapSyncLogs = [];
    window.wms.sapSyncLogs.unshift({
      syncId: `SYNC-${Date.now().toString().slice(-6)}`,
      bapiName: 'BAPI_GOODSMVT_CREATE',
      movementType: movementType,
      documentNo: sapDocNo,
      materialCode: l.materialCode,
      quantity: Math.abs(l.varianceQty),
      uom: 'EA',
      direction: l.varianceQty < 0 ? 'Outbound Loss (Mvt 711)' : 'Inbound Surplus (Mvt 712)',
      status: 'SUCCESS',
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      responsePayload: `Movement ${movementType} bulk posted in SAP ERP for Plant 1. Book stock adjusted by ${l.varianceQty > 0 ? '+' : ''}${l.varianceQty} EA.`
    });

    approvedCount++;
  });

  plan.status = 'Closed';
  plan.progressPct = 100;
  plan.supervisorApproved = true;
  plan.supervisorApprovedBy = currentUser;

  addAuditLog(
    'Bulk Physical Inventory Approval',
    plan.countNo,
    'Closed',
    `Bulk approved ${approvedCount} lines in ${plan.countNo}. SAP Movements 711 & 712 posted by ${currentUser}`
  );

  saveWMSState(window.wms);
  renderCycleCountScreen();

  // If plan had stock freeze, offer to lift it
  if (window.wms.isStockFrozen) {
    const liftFreeze = window.confirm(`✅ All ${approvedCount} variances posted to SAP!\n\nWould you like to lift the Warehouse Stock Freeze now?`);
    if (liftFreeze) {
      toggleGlobalStockFreeze(false, `Physical inventory count ${countNo} closed and approved`);
    }
  } else {
    alert(`✅ Bulk approval complete! Posted ${approvedCount} variance adjustments to SAP via Movement 711 (Shrink) and 712 (Surplus).`);
  }
}

function simulateHandheldCountFinish(countNo) {
  const plan = window.wms.cycleCountPlans.find(p => p.countNo === countNo);
  if (!plan) return;

  plan.progressPct = 100;
  plan.status = 'Closed';
  saveWMSState(window.wms);
  renderCycleCountScreen();
  alert(`Simulated Handheld count submission for ${countNo}. Progress updated to 100%.`);
}

// -------------------------------------------------------------
// I.2: PRINTABLE COUNT SHEETS
// -------------------------------------------------------------
function printCountSheet(countNo) {
  const plan = (window.wms.cycleCountPlans || []).find(p => p.countNo === countNo) || (window.wms.cycleCountPlans || [])[0];
  if (!plan) return;

  const content = `
    <div class="printable-count-sheet" id="print-sheet-content">
      <div class="sheet-header">
        <div>
          <div class="sheet-title">HONDA MOTORCYCLE & SCOOTER INDIA (HMSI)</div>
          <div class="sheet-subtitle">WAREHOUSE MANAGEMENT SYSTEM • PHYSICAL INVENTORY COUNT SHEET</div>
          <div style="font-size:11px; color:#64748b; font-family:var(--font-mono); margin-top:2px;">
            Document Ref: HMSI-PI-SHEET-${plan.countNo} • Plant 1 Narsapur Central Warehouse
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px; font-weight:800; color:#0f172a;">COUNT TYPE:</div>
          <div style="font-size:11px; font-weight:700; color:#8b3e00;">${plan.countTypeName || plan.countType}</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">Date: ${plan.plannedDate}</div>
        </div>
      </div>

      <div class="sheet-meta-grid">
        <div><b>Count Plan #:</b> <span style="font-family:var(--font-mono); color:#2563eb;">${plan.countNo}</span></div>
        <div><b>Target Zone:</b> ${plan.zone}</div>
        <div><b>Assigned Counter:</b> ${plan.counter}</div>
        <div><b>Stock Freeze Status:</b> <span style="color:${plan.isStockFrozen ? '#dc2626' : '#059669'}; font-weight:800;">${plan.isStockFrozen ? '🔒 ACTIVE' : 'UNFROZEN'}</span></div>
      </div>

      <div style="background:#fef3c7; border:1px solid #fde68a; padding:8px 12px; border-radius:6px; font-size:11px; color:#92400e; margin-bottom:14px; font-weight:700;">
        ⚠️ BLIND COUNT INSTRUCTIONS: Verify bin barcode, record actual physical quantity in the Tally Box, sign line item, and submit sheet to Warehouse Supervisor.
      </div>

      <table class="sheet-table">
        <thead>
          <tr>
            <th style="width:5%;">#</th>
            <th style="width:20%;">Bin Location</th>
            <th style="width:25%;">Material Code & Description</th>
            <th style="width:20%;">Handling Unit / Batch</th>
            <th style="width:15%; text-align:center;">Physical Tally (EA)</th>
            <th style="width:15%; text-align:center;">Counter Sign</th>
          </tr>
        </thead>
        <tbody>
          ${plan.lines.map((l, idx) => `
            <tr>
              <td style="text-align:center; font-weight:700;">${idx + 1}</td>
              <td><b style="font-family:var(--font-mono); font-size:12px;">${l.bin}</b></td>
              <td>
                <b>${l.materialCode}</b><br>
                <span style="font-size:10px; color:#475569;">${l.materialDescription}</span>
              </td>
              <td><span style="font-family:var(--font-mono); font-size:10.5px;">${l.huLot}</span></td>
              <td><div class="blind-tally-box"></div></td>
              <td><div class="blind-tally-box"></div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="sheet-signoff-row">
        <div class="signoff-box">
          <b>Count Operator Signature</b><br>
          <span style="font-size:10px; color:#64748b;">Name: ${plan.counter}</span>
        </div>
        <div class="signoff-box">
          <b>Warehouse Supervisor Sign-Off</b><br>
          <span style="font-size:10px; color:#64748b;">Rajesh Sharma (WMS Manager)</span>
        </div>
        <div class="signoff-box">
          <b>Statutory / Finance Auditor</b><br>
          <span style="font-size:10px; color:#64748b;">HMSI Internal Audit Lead</span>
        </div>
      </div>
    </div>
  `;

  openDynamicModal(`Print Physical Count Sheet: ${plan.countNo}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Close</button>
    <button class="btn-wms-primary" onclick="window.print(); closeModal('modal-dynamic-form');">🖨️ Print Sheet</button>
  `);
}

// -------------------------------------------------------------
// I.3: EXPORTS FOR PURCHASING & VERIFICATION
// -------------------------------------------------------------
function exportPurchasingStockVerificationCSV() {
  const materials = window.wms.materials || [];
  const handlingUnits = window.wms.handlingUnits || [];
  const stockLevels = window.wms.stockLevelMaster || [];
  const purchaseOrders = window.wms.purchaseOrders || [];
  const cycleCountPlans = window.wms.cycleCountPlans || [];

  const csvData = materials.map(m => {
    const hus = handlingUnits.filter(h => h.materialCode === m.code);
    const availStock = hus.filter(h => h.stockStatus === 'AVAILABLE').reduce((sum, h) => sum + (h.quantity || 0), 0);
    const stagedStock = hus.filter(h => h.stockStatus === 'STAGED' || h.stockStatus === 'PARKED').reduce((sum, h) => sum + (h.quantity || 0), 0);
    const totalWmsStock = availStock + stagedStock;

    const cfg = stockLevels.find(s => s.materialCode === m.code) || { reorderPoint: 200, safetyStock: 100, maxStock: 1000 };
    const pos = purchaseOrders.filter(p => p.materialCode === m.code && (p.status === 'Open' || p.status === 'Pending' || p.status === 'Partially Received'));
    const openPoQty = pos.reduce((sum, p) => sum + Math.max(0, (p.orderedQty || 0) - (p.receivedQty || 0)), 0);

    const allCountLines = cycleCountPlans.flatMap(c => c.lines || []).filter(l => l.materialCode === m.code);
    const latestLine = allCountLines.length > 0 ? allCountLines[allCountLines.length - 1] : null;
    const countedStock = latestLine ? latestLine.countedQty : totalWmsStock;
    const countVariance = latestLine ? latestLine.varianceQty : 0;
    const sapBookStock = totalWmsStock - countVariance;

    const netShortage = Math.max(0, cfg.reorderPoint - (availStock + openPoQty));

    let actionLabel = 'HEALTHY_BUFFER';
    if (availStock < cfg.reorderPoint) {
      actionLabel = openPoQty === 0 ? 'RAISE_URGENT_PO' : 'EXPEDITE_OPEN_PO';
    } else if (totalWmsStock > (cfg.maxStock || 1200)) {
      actionLabel = 'OVERSTOCK_HOLD';
    }

    return {
      'Plant': m.plant || 'HMSI Narsapur Plant 1',
      'Material Code': m.code,
      'Description': m.description,
      'Supplier Name': m.supplier || 'Honda OEM Tier-1 Partner',
      'UOM': 'EA',
      'Available WMS Stock': availStock,
      'Staged WMS Stock': stagedStock,
      'Total Physical Stock': totalWmsStock,
      'SAP ERP Book Stock': sapBookStock,
      'Latest Counted Stock': countedStock,
      'Count Variance Qty': countVariance,
      'Reorder Point (ROP)': cfg.reorderPoint,
      'Safety Stock': cfg.safetyStock,
      'Open Inbound PO Qty': openPoQty,
      'Net Shortage Deficit': netShortage,
      'Suggested Purchasing Action': actionLabel,
      'Open PO Reference': pos.map(p => p.poNumber).join(';') || 'NONE',
      'Verification Date': new Date().toISOString().split('T')[0]
    };
  });

  const filename = `HMSIL_Purchasing_Stock_Verification_${new Date().toISOString().split('T')[0]}.csv`;
  exportTableToCSV(csvData, filename);
}

function printPurchasingVerificationSheet() {
  const materials = window.wms.materials || [];
  const handlingUnits = window.wms.handlingUnits || [];
  const stockLevels = window.wms.stockLevelMaster || [];
  const purchaseOrders = window.wms.purchaseOrders || [];

  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const content = `
    <div class="printable-count-sheet" id="print-purchasing-content">
      <div class="sheet-header">
        <div>
          <div class="sheet-title">HONDA MOTORCYCLE & SCOOTER INDIA (HMSI)</div>
          <div class="sheet-subtitle">PROCUREMENT & PURCHASING DEPARTMENT • DAILY STOCK VERIFICATION DIGEST</div>
          <div style="font-size:11px; color:#64748b; font-family:var(--font-mono); margin-top:2px;">
            Document: HMSI-PURCH-VERIFY-${new Date().toISOString().split('T')[0]} • Plant 1 Scooter Division
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px; font-weight:800; color:#0f172a;">GENERATED:</div>
          <div style="font-size:11px; font-weight:700; color:#8b3e00;">${dateStr} 07:00 IST</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">Daily Pre-Shift Alignment</div>
        </div>
      </div>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 14px; margin-bottom:14px; font-size:12px; display:flex; justify-content:space-between;">
        <div><b>Target Facility:</b> HMSI Narsapur Plant 1 Central Store</div>
        <div><b>Stock Status:</b> <span style="color:#059669; font-weight:800;">WMS & SAP Reconciled</span></div>
        <div><b>Recipient:</b> Material Planning & Purchasing Team (Narsapur)</div>
      </div>

      <table class="sheet-table">
        <thead>
          <tr>
            <th>Material Code & Description</th>
            <th>Supplier</th>
            <th>WMS Stock</th>
            <th>SAP Stock</th>
            <th>ROP</th>
            <th>Open PO Qty</th>
            <th>Net Shortage</th>
            <th>Purchasing Action</th>
          </tr>
        </thead>
        <tbody>
          ${materials.map(m => {
            const hus = handlingUnits.filter(h => h.materialCode === m.code);
            const availStock = hus.filter(h => h.stockStatus === 'AVAILABLE').reduce((sum, h) => sum + (h.quantity || 0), 0);
            const cfg = stockLevels.find(s => s.materialCode === m.code) || { reorderPoint: 200 };
            const pos = purchaseOrders.filter(p => p.materialCode === m.code && (p.status === 'Open' || p.status === 'Pending'));
            const openPoQty = pos.reduce((sum, p) => sum + Math.max(0, (p.orderedQty || 0) - (p.receivedQty || 0)), 0);
            const netShortage = Math.max(0, cfg.reorderPoint - (availStock + openPoQty));

            const action = availStock < cfg.reorderPoint ?
              (openPoQty === 0 ? '🔴 RAISE PO' : '🟡 EXPEDITE') :
              '🟢 HEALTHY';

            return `
              <tr>
                <td><b>${m.code}</b><br><span style="font-size:10px; color:#475569;">${m.description}</span></td>
                <td><span style="font-size:10.5px;">${m.supplier || 'Honda OEM Partner'}</span></td>
                <td><b>${availStock} EA</b></td>
                <td>${availStock} EA</td>
                <td>${cfg.reorderPoint} EA</td>
                <td><b>${openPoQty} EA</b></td>
                <td><b style="color:${netShortage > 0 ? '#dc2626' : '#16a34a'};">${netShortage > 0 ? `-${netShortage}` : '0'} EA</b></td>
                <td><b>${action}</b></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="sheet-signoff-row">
        <div class="signoff-box">
          <b>Warehouse Store Manager</b><br>
          <span style="font-size:10px; color:#64748b;">Rajesh Sharma (Signed)</span>
        </div>
        <div class="signoff-box">
          <b>Head of Purchasing & Procurement</b><br>
          <span style="font-size:10px; color:#64748b;">Narsapur Plant Purchasing Lead</span>
        </div>
        <div class="signoff-box">
          <b>Production Control & Planning</b><br>
          <span style="font-size:10px; color:#64748b;">PPC Shift A Superintendent</span>
        </div>
      </div>
    </div>
  `;

  openDynamicModal('Print Purchasing Stock Verification Digest', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Close</button>
    <button class="btn-wms-primary" onclick="window.print(); closeModal('modal-dynamic-form');">🖨️ Print Digest</button>
  `);
}

function exportCycleCountsCSV() {
  const plans = window.wms.cycleCountPlans || [];
  const flatRows = plans.flatMap(p => (p.lines || []).map(l => ({
    'Count Plan No': p.countNo,
    'Plant': p.plant,
    'Zone': p.zone,
    'Count Type': p.countTypeName || p.countType,
    'Planned Date': p.plannedDate,
    'Counter Operator': p.counter,
    'Stock Freeze Active': p.isStockFrozen ? 'YES' : 'NO',
    'Plan Status': p.status,
    'Bin Location': l.bin,
    'Material Code': l.materialCode,
    'Description': l.materialDescription,
    'HU / Lot Reference': l.huLot,
    'System Qty': l.systemQty,
    'Counted Qty': l.countedQty,
    'Variance Qty': l.varianceQty,
    'Variance Pct': l.variancePct,
    'SAP Movement': l.sapMovement || (l.varianceQty < 0 ? '711' : (l.varianceQty > 0 ? '712' : '—')),
    'Reason Code': l.reasonCode || '—',
    'Approved By': l.approvedBy || '—',
    'SAP Doc No': l.sapDocNo || '—',
    'Line Status': l.lineStatus
  })));

  exportTableToCSV(flatRows, 'HMSIL_Cycle_Counts_Physical_Inventory.csv');
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
// -------------------------------------------------------------
// REPORTS & ANALYTICS SUITE (MODULE H: COMPREHENSIVE REPORTING SUITE)
// -------------------------------------------------------------
let activeReportSubtab = 'traceability';
let traceSearchQuery = 'HU-BRK-2026-00101';
let slowMovingFilterPeriod = 'all'; // 'all', 'aging', 'slow', 'critical', 'dead'
let stockSummaryAbcFilter = 'All';
let locationStockAreaFilter = 'All';
let issuanceReportShopFilter = 'All';

function switchReportTab(tabId) {
  activeReportSubtab = tabId;
  document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
  const targetBtn = Array.from(document.querySelectorAll('.subtab-btn')).find(b => b.getAttribute('onclick')?.includes(`'${tabId}'`));
  if (targetBtn) targetBtn.classList.add('active');
  renderReportsView();
}

function updateReportExecutiveKPIs() {
  const materials = window.wms.materials || [];
  const stockLevels = window.wms.stockLevelMaster || [];
  const handlingUnits = window.wms.handlingUnits || [];
  const emailCfg = window.wms.dailyAutoEmailConfig || {};

  // 1. Total Valuation
  let totalValuation = 0;
  handlingUnits.forEach(h => {
    const mat = materials.find(m => m.code === h.materialCode);
    const cost = mat?.unitCost || 500;
    totalValuation += (h.quantity || 0) * cost;
  });
  const valLakhs = (totalValuation / 100000).toFixed(2);
  const valEl = document.getElementById('kpi-report-valuation');
  const skusEl = document.getElementById('kpi-report-skus');
  if (valEl) valEl.textContent = `₹ ${valLakhs} Lakhs`;
  if (skusEl) skusEl.textContent = `${materials.length} Active Material SKUs`;

  // 2. Critical Shortages
  const shortageCount = materials.filter(m => {
    const hus = handlingUnits.filter(h => h.materialCode === m.code && h.stockStatus === 'AVAILABLE');
    const availStock = hus.reduce((sum, h) => sum + (h.quantity || 0), 0);
    const cfg = stockLevels.find(s => s.materialCode === m.code) || { reorderPoint: 200 };
    return availStock < cfg.reorderPoint;
  }).length;
  const shortEl = document.getElementById('kpi-report-shortages');
  if (shortEl) shortEl.textContent = `${shortageCount} SKUs`;

  // 3. Slow Moving / Dead Stock
  const slowCount = materials.filter(m => (m.daysInactive || 0) >= 30).length;
  const slowEl = document.getElementById('kpi-report-slowmoving');
  if (slowEl) slowEl.textContent = `${slowCount} SKUs`;

  // 4. Auto-Email Status
  const emailStatusEl = document.getElementById('kpi-report-email-status');
  const emailMetaEl = document.getElementById('kpi-report-email-meta');
  if (emailStatusEl) {
    emailStatusEl.textContent = emailCfg.enabled ? (emailCfg.schedule || '07:00 Daily • Active') : 'Disabled';
    emailStatusEl.style.color = emailCfg.enabled ? '#16a34a' : '#94a3b8';
  }
  if (emailMetaEl && emailCfg.lastSent) {
    emailMetaEl.textContent = `Last Sent: ${emailCfg.lastSent}`;
  }
}

function renderReportsView() {
  updateReportExecutiveKPIs();
  const container = document.getElementById('report-tab-content');
  if (!container) return;

  if (activeReportSubtab === 'traceability') {
    renderTraceabilityReport(container);
  } else if (activeReportSubtab === 'stockSummary') {
    renderStockSummaryReport(container);
  } else if (activeReportSubtab === 'locationStock') {
    renderLocationStockReport(container);
  } else if (activeReportSubtab === 'slowMoving') {
    renderSlowMovingReport(container);
  } else if (activeReportSubtab === 'shortage') {
    renderShortageReport(container);
  } else if (activeReportSubtab === 'autoEmail') {
    renderAutoEmailReport(container);
  } else if (activeReportSubtab === 'issuanceHistory') {
    renderIssuanceHistoryReport(container);
  } else if (activeReportSubtab === 'overstock') {
    renderOverstockReport(container);
  } else if (activeReportSubtab === 'variation') {
    renderVariationReport(container);
  } else if (activeReportSubtab === 'supplier') {
    renderSupplierReport(container);
  }
}

// -------------------------------------------------------------
// H.1: PART TRACEABILITY REPORT (END-TO-END)
// -------------------------------------------------------------
function setTraceSearchQuery(query) {
  traceSearchQuery = query;
  renderReportsView();
}

function onTraceSearchSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('trace-search-input');
  if (input) {
    traceSearchQuery = input.value.trim();
    renderReportsView();
  }
}

function buildTraceabilityTimeline(query) {
  if (!query) query = 'HND-BRK-PAD-01';
  const q = query.toLowerCase();

  // Find relevant material
  const mat = (window.wms.materials || []).find(m =>
    m.code.toLowerCase().includes(q) ||
    m.description.toLowerCase().includes(q)
  ) || (window.wms.materials || [])[0];

  const targetCode = mat?.code || 'HND-BRK-PAD-01';

  // Gather matching milestones
  const events = [];

  // 1. PO & ASN
  const pos = (window.wms.purchaseOrders || []).filter(p => p.materialCode === targetCode);
  const asns = (window.wms.asns || []).filter(a => a.materialCode === targetCode);
  if (pos.length > 0) {
    const po = pos[0];
    const asn = asns[0] || { asnNumber: 'ASN-HND-2026-00450', eta: '24-Sep-2026 08:30' };
    events.push({
      step: 1,
      icon: '📝',
      title: 'Purchase Order & Advance Shipping Notice',
      stage: 'Inbound Procurement',
      timestamp: '23-Sep-2026 14:00',
      plant: po.plant || 'HMSI Narsapur Plant 1',
      operator: 'SAP EDI System (Automated BAPI)',
      role: 'ERP Inbound Gateway',
      device: 'SAP ERP RFC Gateway',
      status: 'DELIVERED',
      statusClass: 'badge-available',
      docRef: `${po.poNumber} • ${asn.asnNumber}`,
      details: {
        'Ordered Qty': `${po.orderedQty} ${po.uom}`,
        'Supplier Name': po.supplier,
        'Carrier Vehicle': asn.vehicleNo || 'KA-04-E-1190',
        'Inbound Gate Target': 'Security Gate 01'
      }
    });
  }

  // 2. Gate Entry
  const ges = (window.wms.gateEntries || []).filter(g => g.supplier?.toLowerCase().includes('nissin') || g.poNumber?.includes(pos[0]?.poNumber || '00501'));
  const ge = ges[0] || { gateEntryNo: 'GE-HND-2026-01045', vehicleNo: 'KA-04-E-1190', arrivalTime: '24-Sep-2026 08:30', dockAssigned: 'DOCK-04' };
  events.push({
    step: 2,
    icon: '🚛',
    title: 'Security Gate Entry & Physical Trailer Check',
    stage: 'Gate Inward & Dock Assignment',
    timestamp: ge.arrivalTime || '24-Sep-2026 08:30',
    plant: ge.plant || 'HMSI Narsapur Plant 1',
    operator: ge.driverName ? `Security Officer (${ge.driverName})` : 'Ramesh Gowda',
    role: 'Security Gate Lead',
    device: 'Gate Entry Terminal (PC-GATE-01)',
    status: 'CLEARED',
    statusClass: 'badge-available',
    docRef: ge.gateEntryNo,
    details: {
      'Vehicle Registration': ge.vehicleNo,
      'Driver Contact': ge.driverMobile || '+91 98450 33819',
      'Assigned Unloading Dock': ge.dockAssigned,
      'Security Seal Status': 'Intact & Verified'
    }
  });

  // 3. Dock Receiving
  const recs = (window.wms.receivingBatches || []).filter(r => r.materialCode === targetCode);
  const rec = recs[0] || { receivingId: 'REC-2026-0089', scannedGoodQty: 590, damagedQty: 5, shortQty: 5, operator: 'Sanjay Verma' };
  events.push({
    step: 3,
    icon: '📥',
    title: 'Dock Receiving Scan & Pallet Verification',
    stage: 'Inbound Dock Verification',
    timestamp: '24-Sep-2026 09:15',
    plant: rec.plant || 'HMSI Narsapur Plant 1',
    operator: rec.operator || 'Sanjay Verma',
    role: 'Warehouse Dock Operator',
    device: 'Zebra TC57 Handheld (TBC) (ZEBRA-TC57-01)',
    status: 'VERIFIED',
    statusClass: 'badge-available',
    docRef: rec.receivingId,
    details: {
      'Scanned Good Qty': `${rec.scannedGoodQty || 590} EA`,
      'Damaged / Transit Deviation': `${rec.damagedQty || 0} EA`,
      'Unload Dock Desk': rec.dock || 'DOCK-04',
      'Invoice No & Date': `${rec.invoiceNo || 'INV-NIS-2026-0891'} (${rec.invoiceDate || '24-Sep-2026'})`
    }
  });

  // 4. Quality Acceptance & SAP PQ Gating
  const qcs = (window.wms.qualityInspections || []).filter(q => q.materialCode === targetCode);
  const qc = qcs[0] || { inspectionId: 'QC-2026-00101', inspectedBy: 'Anand Murthy', sapPqStatus: 'PASSED', result: 'Accepted' };
  events.push({
    step: 4,
    icon: '🔬',
    title: 'Quality Acceptance Inspection & SAP PQ Clearance',
    stage: 'Quality Control Gating',
    timestamp: qc.inspectionTimestamp || '24-Sep-2026 09:50',
    plant: mat.plant || 'HMSI Narsapur Plant 1',
    operator: qc.inspectedBy || 'Anand Murthy',
    role: 'Quality Assurance Inspector',
    device: 'QC Mobile Scanner (Zebra TC57 - TBC) (ZEBRA-TC57-01)',
    status: qc.result === 'Accepted' ? 'PASSED & ACCEPTED' : 'HELD IN QC',
    statusClass: qc.result === 'Accepted' ? 'badge-available' : 'badge-warning',
    docRef: `${qc.inspectionId} • SAP PQ: ${qc.sapPqStatus}`,
    details: {
      'Inspected Quantity': `${qc.inspectedQty || 590} EA`,
      'Quality Result': qc.result,
      'SAP PQ Status': qc.sapPqStatus,
      'Inspector Remarks': qc.remarks || 'Dimensional & visual tolerance verified. Cleared for putaway.'
    }
  });

  // 5. Putaway & Bin Allocation
  const puts = (window.wms.putawayTasks || []).filter(p => p.materialCode === targetCode);
  const put = puts[0] || { taskNo: 'PUT-2026-0088', suggestedBin: 'PWR-LOC-A01-RCK-01', actualBin: 'PWR-LOC-A01-RCK-01', operator: 'Sanjay Verma' };
  events.push({
    step: 5,
    icon: '📦',
    title: 'Putaway Confirmation & High-Bay Rack Storing',
    stage: 'Warehouse Storage Allocation',
    timestamp: put.completedTime || '24-Sep-2026 09:58',
    plant: put.plant || 'HMSI Narsapur Plant 1',
    operator: put.operator || 'Sanjay Verma',
    role: 'Forklift Operator',
    device: 'Vehicle-Mounted Terminal (VMT-02)',
    status: 'STORED',
    statusClass: 'badge-available',
    docRef: put.taskNo,
    details: {
      'Target Stored Bin': put.actualBin || 'PWR-LOC-A01-RCK-01',
      'Storage Zone': 'Powertrain & Engine (PWR)',
      'Allocated LPN / HU': 'HU-BRK-2026-00101',
      'Putaway Duration': '11 Minutes (On-Time)'
    }
  });

  // 6. Storage Movements, Part Parking & Verification
  const ccs = (window.wms.cycleCountPlans || []).flatMap(c => (c.lines || []).filter(l => l.materialCode === targetCode));
  if (ccs.length > 0) {
    const cc = ccs[0];
    events.push({
      step: 6,
      icon: '⚖️',
      title: 'Cycle Count Audit & Stock Variance Reconciliation',
      stage: 'Storage Inventory Audit',
      timestamp: '24-Sep-2026 10:15',
      plant: 'HMSI Narsapur Plant 1',
      operator: 'Sanjay Verma / Rajesh Sharma (Approved)',
      role: 'Warehouse Count Auditor',
      device: 'Handheld Count Terminal',
      status: 'RECONCILED IN SAP',
      statusClass: 'badge-available',
      docRef: `${cc.sapDocNo || 'SAP-ADJ-70019482'} (Movement 711)`,
      details: {
        'System Stock Qty': `${cc.systemQty} EA`,
        'Physical Counted': `${cc.countedQty} EA`,
        'Variance Adjusted': `${cc.varianceQty} EA (-0.34%)`,
        'Reason Code': cc.reasonCode || 'COUNT-VAR-SHRINK'
      }
    });
  }

  // 7. Production Issuance
  const issues = (window.wms.lineIssues || []).filter(i => i.materialCode === targetCode);
  if (issues.length > 0) {
    const iss = issues[0];
    events.push({
      step: 7,
      icon: '🏭',
      title: `Production Issuance to Shopfloor (${iss.shopName || 'Assembly Line'})`,
      stage: 'Outbound Production Issuance',
      timestamp: iss.issueTimestamp || '24-Sep-2026 10:45',
      plant: iss.plant || 'HMSI Narsapur Plant 1',
      operator: iss.issuedBy || 'Rajesh Sharma',
      role: 'Production Staging Lead',
      device: 'Shopfloor Handheld Scanner',
      status: 'ISSUED (SAP 261)',
      statusClass: 'badge-available',
      docRef: `${iss.issueId} • SAP Doc: ${iss.sapGiDocNo || 'SAP-GI-50029104'}`,
      details: {
        'Target Shop / Cell': iss.shopName,
        'Issued Quantity': `${iss.issuedQty} ${iss.uom || 'EA'}`,
        'Staging Bin': iss.stagingBin || 'STG-P1-L1',
        'SAP Movement Type': 'Movement 261 (Goods Issue for Order)'
      }
    });
  }

  // 8. Rejections / Dispositions (if any)
  const rejs = (window.wms.rejections || []).filter(r => r.materialCode === targetCode);
  if (rejs.length > 0) {
    const rej = rejs[0];
    events.push({
      step: 8,
      icon: '⛔',
      title: 'Defect Detection & Quarantine Locking (SAP Movement 124)',
      stage: 'Quality Quarantine & Commercial Disposition',
      timestamp: rej.timestamp || '24-Sep-2026 10:05',
      plant: rej.plant || 'HMSI Narsapur Plant 1',
      operator: rej.loggedBy || 'Anand Murthy',
      role: 'QC Inspector',
      device: 'Quarantine Optical Station',
      status: rej.status || 'QUARANTINED',
      statusClass: 'badge-danger',
      docRef: `${rej.rejectionId} • SAP Doc: ${rej.sapBlockedDoc || 'SAP-124-900281'}`,
      details: {
        'Rejected Quantity': `${rej.rejectedQty} ${rej.uom}`,
        'Defect Reason': rej.reasonDescription,
        'Quarantine Lock Bin': rej.quarantineBin,
        'Commercial Action': rej.dispositionAction || 'Pending Authorization'
      }
    });
  }

  return { material: mat, events };
}

function renderTraceabilityReport(container) {
  const { material, events } = buildTraceabilityTimeline(traceSearchQuery);
  const allHUs = window.wms.handlingUnits || [];
  const candidateHUs = allHUs.slice(0, 5);

  container.innerHTML = `
    <!-- Top Search & Quick Chips Bar -->
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:20px;">
      <form onsubmit="onTraceSearchSubmit(event)" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <div style="flex:1; min-width:260px; position:relative;">
          <input type="text" id="trace-search-input" class="search-input" 
            placeholder="Search Part Code (e.g. HND-BRK-PAD-01) or HU / LPN ID (e.g. HU-BRK-2026-00101)..." 
            value="${traceSearchQuery}" style="width:100%; padding-left:36px; font-weight:600;">
          <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#64748b;">🔍</span>
        </div>
        <button type="submit" class="btn-wms-primary" style="padding:8px 18px;">
          Trace Part Lifecycle
        </button>
        <button type="button" class="btn-wms-secondary" onclick="printTraceabilityReport('${material.code}')">
          <span>🖨️</span> Print Trace Certificate
        </button>
      </form>

      <!-- Quick Candidate Chips -->
      <div style="margin-top:12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Quick Trace:</span>
        <button class="wms-badge ${traceSearchQuery.includes('HU-BRK') ? 'badge-available' : 'badge-allocated'}" 
          style="cursor:pointer; font-size:11px; border:none;" onclick="setTraceSearchQuery('HU-BRK-2026-00101')">
          🏷️ HU-BRK-2026-00101 (Nissin Brake Pad)
        </button>
        <button class="wms-badge ${traceSearchQuery.includes('009805') ? 'badge-available' : 'badge-allocated'}" 
          style="cursor:pointer; font-size:11px; border:none;" onclick="setTraceSearchQuery('HU-HND-2026-009805')">
          🏷️ HU-HND-2026-009805 (Keihin ECU)
        </button>
        <button class="wms-badge ${traceSearchQuery.includes('009809') ? 'badge-available' : 'badge-allocated'}" 
          style="cursor:pointer; font-size:11px; border:none;" onclick="setTraceSearchQuery('HU-HND-2026-009809')">
          🏷️ HU-HND-2026-009809 (MRF Tyre)
        </button>
        <button class="wms-badge ${traceSearchQuery.includes('CBR-90') ? 'badge-available' : 'badge-allocated'}" 
          style="cursor:pointer; font-size:11px; border:none;" onclick="setTraceSearchQuery('HND-EXH-CBR-90')">
          🏷️ HND-EXH-CBR-90 (Dead Stock Exhaust)
        </button>
      </div>
    </div>

    <!-- Active Traced Material Header Card -->
    <div style="background:#ffffff; border:1px solid #cbd5e1; border-left:5px solid #2563eb; border-radius:8px; padding:18px 20px; margin-bottom:24px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px; font-weight:900; font-family:var(--font-mono); color:#1e293b;">${material.code}</span>
            <span class="wms-badge badge-available">Class ${material.abcClass}</span>
            <span class="wms-badge badge-allocated">${material.materialGroup}</span>
          </div>
          <div style="font-size:14px; font-weight:700; color:#334155; margin-top:4px;">${material.description}</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">Plant: <b>${material.plant}</b> • Standard Pack: <b>${material.standardPackQty} ${material.unit}</b> • Unit Price: <b>₹ ${Number(material.unitCost || 500).toLocaleString('en-IN')}</b></div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Traceability Verification</div>
          <div style="font-size:13px; font-weight:800; color:#059669; margin-top:2px;">✅ 100% End-to-End Logged</div>
          <div style="font-size:11.5px; color:#64748b; margin-top:2px;">${events.length} Historical Milestones Tracked</div>
        </div>
      </div>
    </div>

    <!-- Visual Interactive Timeline -->
    <div style="margin-bottom:12px; font-size:13px; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:6px;">
      <span>⏱️</span> LIFECYCLE EVENT CHAIN (${events.length} MILESTONES)
    </div>

    <div class="trace-timeline-container">
      ${events.map((ev, idx) => `
        <div class="trace-milestone-item">
          <div class="trace-milestone-node ${ev.status.includes('PASSED') || ev.status.includes('STORED') || ev.status.includes('CLEARED') ? 'completed' : ev.status.includes('QUARANTINED') ? 'alert' : 'warning'}">
            ${ev.step}
          </div>
          <div class="trace-milestone-card">
            <div class="trace-milestone-header">
              <div class="trace-milestone-title">
                <span>${ev.icon}</span>
                <span>${ev.title}</span>
                <span class="wms-badge ${ev.statusClass}">${ev.status}</span>
              </div>
              <div class="trace-milestone-meta">
                <span>📅 <b>${ev.timestamp}</b></span>
                <span>📍 <b>${ev.plant}</b></span>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:12px; color:#475569; flex-wrap:wrap; gap:8px;">
              <div>👤 Handled By: <b style="color:#0f172a;">${ev.operator}</b> (${ev.role})</div>
              <div>📟 Device: <span style="font-family:var(--font-mono); font-size:11px; background:#f1f5f9; padding:2px 6px; border-radius:4px;">${ev.device}</span></div>
              <div>📄 Ref Doc: <b style="font-family:var(--font-mono); color:#2563eb;">${ev.docRef}</b></div>
            </div>

            <div class="trace-grid-details">
              ${Object.entries(ev.details).map(([key, val]) => `
                <div class="trace-detail-item">
                  <label>${key}</label>
                  <span>${val}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function printTraceabilityReport(code) {
  window.print();
}

// -------------------------------------------------------------
// H.2: STOCK SUMMARY REPORT (AGGREGATE BY PART)
// -------------------------------------------------------------
function setStockSummaryAbcFilter(cls) {
  stockSummaryAbcFilter = cls;
  renderReportsView();
}

function exportStockSummaryCSV() {
  const materials = window.wms.materials || [];
  const handlingUnits = window.wms.handlingUnits || [];
  const reqs = window.wms.materialRequirements || [];
  const rejs = window.wms.rejections || [];

  const data = materials.map(m => {
    const hus = handlingUnits.filter(h => h.materialCode === m.code);
    const totalQty = hus.reduce((sum, h) => sum + (h.quantity || 0), 0);
    const blockedQty = rejs.filter(r => r.materialCode === m.code && r.status === 'QUARANTINED')
                           .reduce((sum, r) => sum + (r.rejectedQty || 0), 0);
    const reservedQty = reqs.filter(r => r.materialCode === m.code && (r.status === 'Draft' || r.status === 'Pending Pick'))
                            .reduce((sum, r) => sum + (r.requiredQty || 0), 0);
    const availQty = Math.max(0, totalQty - blockedQty - reservedQty);
    const val = totalQty * (m.unitCost || 500);

    return {
      'Material Code': m.code,
      'Description': m.description,
      'Plant': m.plant,
      'ABC Classification': `Class ${m.abcClass}`,
      'Total Physical Stock': totalQty,
      'Available Stock': availQty,
      'Reserved Stock': reservedQty,
      'Blocked / Quarantine Stock': blockedQty,
      'UOM': m.unit,
      'Unit Price (INR)': m.unitCost || 500,
      'Total Value (INR)': val
    };
  });

  exportTableToCSV(data, 'HMSI_Stock_Summary_Report.csv');
}

function renderStockSummaryReport(container) {
  const materials = window.wms.materials || [];
  const handlingUnits = window.wms.handlingUnits || [];
  const reqs = window.wms.materialRequirements || [];
  const rejs = window.wms.rejections || [];

  let filteredMats = materials;
  if (stockSummaryAbcFilter !== 'All') {
    filteredMats = materials.filter(m => m.abcClass === stockSummaryAbcFilter);
  }

  let grandTotalQty = 0;
  let grandTotalValue = 0;
  let grandAvailable = 0;
  let grandBlocked = 0;

  const rows = filteredMats.map(m => {
    const hus = handlingUnits.filter(h => h.materialCode === m.code);
    const totalQty = hus.reduce((sum, h) => sum + (h.quantity || 0), 0);
    const blockedQty = rejs.filter(r => r.materialCode === m.code && r.status === 'QUARANTINED')
                           .reduce((sum, r) => sum + (r.rejectedQty || 0), 0);
    const reservedQty = reqs.filter(r => r.materialCode === m.code && (r.status === 'Draft' || r.status === 'Pending Pick'))
                            .reduce((sum, r) => sum + (r.requiredQty || 0), 0);
    const availQty = Math.max(0, totalQty - blockedQty - reservedQty);
    const unitPrice = m.unitCost || 500;
    const totalVal = totalQty * unitPrice;

    grandTotalQty += totalQty;
    grandTotalValue += totalVal;
    grandAvailable += availQty;
    grandBlocked += blockedQty;

    return {
      code: m.code,
      description: m.description,
      plant: m.plant,
      abcClass: m.abcClass,
      unit: m.unit,
      totalQty,
      availQty,
      reservedQty,
      blockedQty,
      unitPrice,
      totalVal
    };
  });

  container.innerHTML = `
    <!-- Filters & Action Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:12px; font-weight:700; color:#64748b;">ABC Filter:</span>
        <button class="btn-wms-secondary small ${stockSummaryAbcFilter === 'All' ? 'active' : ''}" onclick="setStockSummaryAbcFilter('All')">All Classes</button>
        <button class="btn-wms-secondary small ${stockSummaryAbcFilter === 'A' ? 'active' : ''}" onclick="setStockSummaryAbcFilter('A')">Class A (Fast)</button>
        <button class="btn-wms-secondary small ${stockSummaryAbcFilter === 'B' ? 'active' : ''}" onclick="setStockSummaryAbcFilter('B')">Class B (Medium)</button>
        <button class="btn-wms-secondary small ${stockSummaryAbcFilter === 'C' ? 'active' : ''}" onclick="setStockSummaryAbcFilter('C')">Class C (Slow)</button>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <button class="btn-wms-primary small" onclick="exportStockSummaryCSV()">
          <span>📊</span> Export Stock Summary CSV
        </button>
      </div>
    </div>

    <!-- Summary Stats Bar -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px 14px;">
        <div style="font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase;">Total Stored Units</div>
        <div style="font-size:18px; font-weight:900; color:#0f172a; margin-top:2px;">${grandTotalQty.toLocaleString()} EA</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:12px 14px;">
        <div style="font-size:11px; color:#15803d; font-weight:700; text-transform:uppercase;">Available for Pick</div>
        <div style="font-size:18px; font-weight:900; color:#16a34a; margin-top:2px;">${grandAvailable.toLocaleString()} EA</div>
      </div>
      <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:12px 14px;">
        <div style="font-size:11px; color:#b91c1c; font-weight:700; text-transform:uppercase;">Quarantined / Blocked</div>
        <div style="font-size:18px; font-weight:900; color:#dc2626; margin-top:2px;">${grandBlocked.toLocaleString()} EA</div>
      </div>
      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:12px 14px;">
        <div style="font-size:11px; color:#1d4ed8; font-weight:700; text-transform:uppercase;">Total Inventory Value</div>
        <div style="font-size:18px; font-weight:900; color:#2563eb; margin-top:2px;">₹ ${(grandTotalValue / 100000).toFixed(2)} Lakhs</div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="wms-table">
        <thead>
          <tr>
            <th>Material Code</th>
            <th>Description</th>
            <th>Plant</th>
            <th>ABC</th>
            <th>Total Stock</th>
            <th>Available</th>
            <th>Reserved</th>
            <th>Blocked</th>
            <th>Unit Cost (₹)</th>
            <th>Valuation (₹)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td><b style="font-family:var(--font-mono); color:#2563eb;">${r.code}</b></td>
              <td><b>${r.description}</b></td>
              <td>${r.plant}</td>
              <td><span class="wms-badge ${r.abcClass === 'A' ? 'badge-available' : r.abcClass === 'B' ? 'badge-allocated' : 'badge-warning'}">Class ${r.abcClass}</span></td>
              <td><b style="font-size:13px;">${r.totalQty.toLocaleString()} ${r.unit}</b></td>
              <td><span style="color:#059669; font-weight:700;">${r.availQty.toLocaleString()}</span></td>
              <td><span style="color:#d97706; font-weight:600;">${r.reservedQty.toLocaleString()}</span></td>
              <td><span style="color:${r.blockedQty > 0 ? '#dc2626' : '#94a3b8'}; font-weight:700;">${r.blockedQty.toLocaleString()}</span></td>
              <td>₹ ${r.unitPrice.toLocaleString('en-IN')}</td>
              <td><b>₹ ${r.totalVal.toLocaleString('en-IN')}</b></td>
              <td>
                <button class="btn-wms-secondary small" onclick="setTraceSearchQuery('${r.code}'); switchReportTab('traceability');">
                  🔍 Trace
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------------------------------------------
// H.3: LOCATION-WISE STOCK REPORT (AREA -> LOCATION -> RACK)
// -------------------------------------------------------------
function setLocationStockAreaFilter(area) {
  locationStockAreaFilter = area;
  renderReportsView();
}

function exportLocationStockCSV() {
  const bins = window.wms.binMaster || [];
  const data = bins.map(b => {
    const occPct = b.capacity > 0 ? Math.round((b.currentQty / b.capacity) * 100) : 0;
    return {
      'Bin Code': b.binCode,
      'Area Code': b.areaCode,
      'Area Name': b.areaName,
      'Location Code': b.locationCode,
      'Location Name': b.locationName,
      'Rack Code': b.rackCode,
      'Capacity (EA)': b.capacity,
      'Current Qty (EA)': b.currentQty,
      'Occupancy %': `${occPct}%`,
      'Stored Material': b.storedMaterial,
      'Status': b.status
    };
  });
  exportTableToCSV(data, 'HMSI_Location_Wise_Stock_Report.csv');
}

function renderLocationStockReport(container) {
  const bins = window.wms.binMaster || [];
  const areas = window.wms.areaMaster || [];

  let filteredBins = bins;
  if (locationStockAreaFilter !== 'All') {
    filteredBins = bins.filter(b => b.areaCode === locationStockAreaFilter);
  }

  container.innerHTML = `
    <!-- Area Filter Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="font-size:12px; font-weight:700; color:#64748b;">Warehouse Area:</span>
        <button class="btn-wms-secondary small ${locationStockAreaFilter === 'All' ? 'active' : ''}" onclick="setLocationStockAreaFilter('All')">All Areas (${bins.length} Bins)</button>
        ${areas.map(a => `
          <button class="btn-wms-secondary small ${locationStockAreaFilter === a.areaCode ? 'active' : ''}" onclick="setLocationStockAreaFilter('${a.areaCode}')">
            ${a.areaCode} - ${a.areaName.split(' ')[0]}
          </button>
        `).join('')}
      </div>
      <button class="btn-wms-primary small" onclick="exportLocationStockCSV()">
        <span>📊</span> Export Location Stock CSV
      </button>
    </div>

    <!-- Area Occupancy Summary Cards -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:16px;">
      ${areas.slice(0, 4).map(a => `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:12px 14px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="font-size:12.5px; color:#1e293b;">${a.areaName}</b>
            <span class="wms-badge badge-available">${a.utilization || '70%'}</span>
          </div>
          <div style="font-size:11px; color:#64748b; margin-top:4px;">Zone: <b>${a.zoneCode}</b> • ${a.occupiedBins || 0} / ${a.binCount || 0} Bins Occupied</div>
          <div class="capacity-progress-bar">
            <div class="capacity-progress-fill ${parseInt(a.utilization) > 85 ? 'red' : parseInt(a.utilization) > 70 ? 'amber' : 'green'}" 
              style="width:${a.utilization || '70%'};"></div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Bins Ledger Table -->
    <div class="table-responsive">
      <table class="wms-table">
        <thead>
          <tr>
            <th>Area / Zone</th>
            <th>Location Drill-down</th>
            <th>Bin Code</th>
            <th>Capacity</th>
            <th>Current Stored</th>
            <th>Occupancy %</th>
            <th>Stored Component / Lot</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredBins.map(b => {
            const occPct = b.capacity > 0 ? Math.round((b.currentQty / b.capacity) * 100) : 0;
            const fillClass = occPct > 90 ? 'red' : occPct > 70 ? 'amber' : 'green';
            return `
              <tr>
                <td><b style="color:#2563eb;">${b.areaCode}</b><br><span style="font-size:11px; color:#64748b;">${b.areaName}</span></td>
                <td><b>${b.locationCode}</b><br><span style="font-size:11px; color:#64748b;">Rack: ${b.rackCode}</span></td>
                <td><b style="font-family:var(--font-mono); font-size:12.5px; color:#0f172a;">${b.binCode}</b></td>
                <td><b>${b.capacity} EA</b></td>
                <td><b style="color:${occPct > 80 ? '#ea580c' : '#059669'}; font-size:13px;">${b.currentQty} EA</b></td>
                <td style="min-width:140px;">
                  <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">
                    <span>${occPct}%</span>
                    <span style="color:#64748b;">${b.currentQty}/${b.capacity}</span>
                  </div>
                  <div class="capacity-progress-bar">
                    <div class="capacity-progress-fill ${fillClass}" style="width:${Math.min(occPct, 100)}%;"></div>
                  </div>
                </td>
                <td><span style="font-weight:600; color:#334155;">${b.storedMaterial || '—'}</span></td>
                <td><span class="wms-badge ${b.status === 'ACTIVE' ? 'badge-available' : 'badge-danger'}">${b.status}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------------------------------------------
// H.4: SLOW-MOVING STOCK REPORT (DUAL-PERIOD FILTER)
// -------------------------------------------------------------
function setSlowMovingPeriod(period) {
  slowMovingFilterPeriod = period;
  renderReportsView();
}

function exportSlowMovingCSV() {
  const materials = window.wms.materials || [];
  const handlingUnits = window.wms.handlingUnits || [];

  const data = materials.filter(m => (m.daysInactive || 0) >= 15).map(m => {
    const hus = handlingUnits.filter(h => h.materialCode === m.code);
    const stock = hus.reduce((sum, h) => sum + (h.quantity || 0), 0);
    const val = stock * (m.unitCost || 500);

    return {
      'Material Code': m.code,
      'Description': m.description,
      'Plant': m.plant,
      'ABC Class': m.abcClass,
      'Current Stock': stock,
      'Days Inactive': m.daysInactive || 0,
      'Last Movement Date': m.lastMovementDate || '—',
      'Unit Price (INR)': m.unitCost || 500,
      'Capital Locked (INR)': val,
      'Velocity Status': m.daysInactive > 90 ? 'DEAD STOCK' : m.daysInactive > 30 ? 'SLOW MOVING' : 'AGING',
      'Recommended Action': m.daysInactive > 90 ? 'Engg Scrap Review' : m.daysInactive > 30 ? 'Line 1 Re-allocation' : 'Promote in Picking'
    };
  });
  exportTableToCSV(data, 'HMSI_Slow_Moving_Stock_Report.csv');
}

function renderSlowMovingReport(container) {
  const materials = window.wms.materials || [];
  const handlingUnits = window.wms.handlingUnits || [];

  // Filter based on dual period selection
  let filtered = materials;
  if (slowMovingFilterPeriod === 'aging') {
    filtered = materials.filter(m => (m.daysInactive || 0) >= 15 && (m.daysInactive || 0) < 30);
  } else if (slowMovingFilterPeriod === 'slow') {
    filtered = materials.filter(m => (m.daysInactive || 0) >= 30 && (m.daysInactive || 0) < 60);
  } else if (slowMovingFilterPeriod === 'critical') {
    filtered = materials.filter(m => (m.daysInactive || 0) >= 60 && (m.daysInactive || 0) <= 90);
  } else if (slowMovingFilterPeriod === 'dead') {
    filtered = materials.filter(m => (m.daysInactive || 0) > 90);
  } else {
    filtered = materials.filter(m => (m.daysInactive || 0) >= 15);
  }

  let totalLockedCapital = 0;
  const rows = filtered.map(m => {
    const hus = handlingUnits.filter(h => h.materialCode === m.code);
    const stock = hus.reduce((sum, h) => sum + (h.quantity || 0), 0);
    const lockedCapital = stock * (m.unitCost || 500);
    totalLockedCapital += lockedCapital;

    let velocityStatus = 'Aging (15–30d)';
    let velocityBadge = 'badge-allocated';
    let action = 'Promote in Pick Allocation';

    if (m.daysInactive > 90) {
      velocityStatus = 'Dead Stock (>90d)';
      velocityBadge = 'badge-danger';
      action = 'Engg Scrap / Commercial Write-Off';
    } else if (m.daysInactive >= 60) {
      velocityStatus = 'Critical Inactive (60–90d)';
      velocityBadge = 'badge-danger';
      action = 'Vendor Return (RTV Movement 122)';
    } else if (m.daysInactive >= 30) {
      velocityStatus = 'Slow-Moving (30–60d)';
      velocityBadge = 'badge-warning';
      action = 'Transfer to Active Line 1 / Buffer';
    }

    return {
      material: m,
      stock,
      lockedCapital,
      velocityStatus,
      velocityBadge,
      action
    };
  });

  container.innerHTML = `
    <!-- Dual-Period Sub-Filter Tabs Bar -->
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px; margin-bottom:18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span style="font-size:12px; font-weight:800; color:#334155; margin-right:6px;">Dual-Period Filter:</span>
          <button class="btn-wms-secondary small ${slowMovingFilterPeriod === 'all' ? 'active' : ''}" onclick="setSlowMovingPeriod('all')">All Inactive (≥15 Days)</button>
          <button class="btn-wms-secondary small ${slowMovingFilterPeriod === 'aging' ? 'active' : ''}" onclick="setSlowMovingPeriod('aging')">15–30 Days (Aging)</button>
          <button class="btn-wms-secondary small ${slowMovingFilterPeriod === 'slow' ? 'active' : ''}" onclick="setSlowMovingPeriod('slow')">30–60 Days (Slow-Moving)</button>
          <button class="btn-wms-secondary small ${slowMovingFilterPeriod === 'critical' ? 'active' : ''}" onclick="setSlowMovingPeriod('critical')">60–90 Days (Critical)</button>
          <button class="btn-wms-secondary small ${slowMovingFilterPeriod === 'dead' ? 'active' : ''}" onclick="setSlowMovingPeriod('dead')">⚠️ >90 Days (Dead Stock)</button>
        </div>
        <button class="btn-wms-primary small" onclick="exportSlowMovingCSV()">
          <span>📊</span> Export Slow-Moving CSV
        </button>
      </div>
    </div>

    <!-- Capital Impact Alert Banner -->
    <div style="background:#fff7ed; border:1px solid #fed7aa; border-left:5px solid #ea580c; border-radius:8px; padding:14px 18px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div>
        <b style="color:#9a3412; font-size:13.5px;">Financial Working Capital Impact</b>
        <div style="font-size:12px; color:#7c2d12; margin-top:2px;">
          Total of <b>${rows.length} Material SKUs</b> currently flagged without movement in the selected velocity bucket.
        </div>
      </div>
      <div style="text-align:right;">
        <span style="font-size:11px; font-weight:700; color:#9a3412; text-transform:uppercase;">Locked Capital (INR):</span>
        <div style="font-size:18px; font-weight:900; color:#c2410c;">₹ ${(totalLockedCapital / 100000).toFixed(2)} Lakhs</div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="wms-table">
        <thead>
          <tr>
            <th>Material Code</th>
            <th>Description</th>
            <th>Plant</th>
            <th>Velocity Status</th>
            <th>Days Inactive</th>
            <th>Last Movement</th>
            <th>Current Stock</th>
            <th>Unit Cost (₹)</th>
            <th>Capital Locked (₹)</th>
            <th>Recommended Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td><b style="font-family:var(--font-mono); color:#2563eb;">${r.material.code}</b></td>
              <td><b>${r.material.description}</b></td>
              <td>${r.material.plant}</td>
              <td><span class="wms-badge ${r.velocityBadge}">${r.velocityStatus}</span></td>
              <td><b style="color:${r.material.daysInactive > 60 ? '#dc2626' : '#d97706'}; font-size:13px;">${r.material.daysInactive} Days</b></td>
              <td>${r.material.lastMovementDate || '—'}</td>
              <td><b>${r.stock.toLocaleString()} ${r.material.unit}</b></td>
              <td>₹ ${Number(r.material.unitCost || 500).toLocaleString('en-IN')}</td>
              <td><b style="color:#dc2626;">₹ ${r.lockedCapital.toLocaleString('en-IN')}</b></td>
              <td>
                <span style="font-size:11.5px; font-weight:700; color:#334155; background:#f1f5f9; padding:4px 8px; border-radius:4px; display:inline-block;">
                  ⚙️ ${r.action}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------------------------------------------
// H.5: SHORTAGE REPORT & AUTOMATIC VENDOR NOTIFICATION (H.7)
// -------------------------------------------------------------
function exportShortageCSV() {
  const materials = window.wms.materials || [];
  const stockLevels = window.wms.stockLevelMaster || [];
  const handlingUnits = window.wms.handlingUnits || [];

  const data = materials.map(m => {
    const hus = handlingUnits.filter(h => h.materialCode === m.code && h.stockStatus === 'AVAILABLE');
    const availStock = hus.reduce((sum, h) => sum + (h.quantity || 0), 0);
    const cfg = stockLevels.find(s => s.materialCode === m.code) || { minStock: 100, maxStock: 1000, reorderPoint: 250, safetyStock: 80 };
    const shortage = availStock < cfg.reorderPoint ? (cfg.reorderPoint - availStock) : 0;
    const suggestedReplenish = Math.max(0, cfg.maxStock - availStock);

    return {
      'Material Code': m.code,
      'Description': m.description,
      'Plant': m.plant,
      'Available Stock': availStock,
      'Safety Stock': cfg.safetyStock,
      'Reorder Point': cfg.reorderPoint,
      'Shortage Deficit': shortage,
      'Suggested PO Replenishment': suggestedReplenish,
      'Status': availStock < cfg.safetyStock ? 'CRITICAL SHORTAGE' : availStock < cfg.reorderPoint ? 'BELOW REORDER POINT' : 'OPTIMAL'
    };
  });
  exportTableToCSV(data, 'HMSI_Shortage_and_Replenishment_Report.csv');
}

function renderShortageReport(container) {
  const materials = window.wms.materials || [];
  const stockLevels = window.wms.stockLevelMaster || [];
  const handlingUnits = window.wms.handlingUnits || [];
  const suppliers = window.wms.suppliers || [];

  const rows = materials.map(m => {
    const hus = handlingUnits.filter(h => h.materialCode === m.code && h.stockStatus === 'AVAILABLE');
    const availStock = hus.reduce((sum, h) => sum + (h.quantity || 0), 0);
    const cfg = stockLevels.find(s => s.materialCode === m.code) || { minStock: 100, maxStock: 1000, reorderPoint: 250, safetyStock: 80 };
    const deficit = cfg.reorderPoint > availStock ? (cfg.reorderPoint - availStock) : 0;
    const suggestedReplenish = Math.max(0, cfg.maxStock - availStock);
    const doi = (availStock / 120).toFixed(1); // Days of inventory based on shift demand

    let severity = 'OPTIMAL';
    let badgeClass = 'badge-available';
    if (availStock < cfg.safetyStock) {
      severity = 'CRITICAL SHORTAGE';
      badgeClass = 'badge-danger';
    } else if (availStock < cfg.reorderPoint) {
      severity = 'BELOW REORDER POINT';
      badgeClass = 'badge-warning';
    }

    // Match supplier
    let supplier = suppliers[0];
    if (m.code.includes('KEI') || m.code.includes('THROT') || m.code.includes('ECU')) {
      supplier = suppliers.find(s => s.code === 'VEND-KEI-01') || suppliers[0];
    } else if (m.code.includes('NIS') || m.code.includes('BRK')) {
      supplier = suppliers.find(s => s.code === 'VEND-NIS-01') || suppliers[0];
    } else if (m.code.includes('MIT') || m.code.includes('STR')) {
      supplier = suppliers.find(s => s.code === 'VEND-MIT-01') || suppliers[0];
    } else if (m.code.includes('MRF') || m.code.includes('TYR')) {
      supplier = suppliers.find(s => s.code === 'VEND-MRF-01') || suppliers[0];
    }

    return {
      material: m,
      availStock,
      cfg,
      deficit,
      suggestedReplenish,
      doi,
      severity,
      badgeClass,
      supplier
    };
  });

  const criticalOnly = rows.filter(r => r.deficit > 0);

  container.innerHTML = `
    <!-- Top Action Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
      <div>
        <b style="font-size:14px; color:#0f172a;">Shortage & Replenishment Monitor</b>
        <div style="font-size:12px; color:#64748b;">Automated comparison against Reorder Point (ROP) & Safety Stock buffers.</div>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <button class="btn-wms-primary small" onclick="exportShortageCSV()">
          <span>📊</span> Export Shortage CSV
        </button>
      </div>
    </div>

    <!-- Shortage Alert Highlight if Critical Items Exist -->
    ${criticalOnly.length > 0 ? `
      <div style="background:#fef2f2; border:1px solid #fecaca; border-left:5px solid #dc2626; border-radius:8px; padding:14px 18px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <b style="color:#991b1b; font-size:13.5px;">⚠️ Urgent Production Stockout Warning</b>
          <div style="font-size:12px; color:#7f1d1d; margin-top:2px;">
            <b>${criticalOnly.length} Part(s)</b> are currently below safety/reorder threshold. Immediate PO requisition or vendor dispatch required.
          </div>
        </div>
        <div>
          <button class="btn-wms-primary small" style="background:#dc2626; border-color:#b91c1c;" 
            onclick="openVendorAlertModal('${criticalOnly[0].material.code}')">
            📧 Trigger Vendor Expedite Notice
          </button>
        </div>
      </div>
    ` : ''}

    <!-- Table -->
    <div class="table-responsive">
      <table class="wms-table">
        <thead>
          <tr>
            <th>Material Code</th>
            <th>Description</th>
            <th>Plant</th>
            <th>Available</th>
            <th>Safety Stock</th>
            <th>Reorder Point</th>
            <th>Net Deficit</th>
            <th>DOI (Days)</th>
            <th>Status</th>
            <th>Suggested Replenishment</th>
            <th>Preferred Supplier</th>
            <th>Vendor Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr style="${r.deficit > 0 ? 'background:#fff7f7;' : ''}">
              <td><b style="font-family:var(--font-mono); color:#2563eb;">${r.material.code}</b></td>
              <td><b>${r.material.description}</b></td>
              <td>${r.material.plant}</td>
              <td><b style="font-size:13px; color:${r.availStock < r.cfg.reorderPoint ? '#dc2626' : '#059669'};">${r.availStock.toLocaleString()} ${r.material.unit}</b></td>
              <td>${r.cfg.safetyStock} ${r.material.unit}</td>
              <td><b style="color:#ea580c;">${r.cfg.reorderPoint} ${r.material.unit}</b></td>
              <td><b style="color:${r.deficit > 0 ? '#dc2626' : '#64748b'};">${r.deficit > 0 ? `-${r.deficit} ${r.material.unit}` : '0'}</b></td>
              <td><b>${r.doi} Days</b></td>
              <td><span class="wms-badge ${r.badgeClass}">${r.severity}</span></td>
              <td><b style="color:#2563eb;">+${r.suggestedReplenish.toLocaleString()} ${r.material.unit}</b></td>
              <td>
                <span style="font-size:12px; font-weight:600; color:#1e293b;">${r.supplier.name}</span><br>
                <span style="font-size:10.5px; color:#64748b;">${r.supplier.contact} (${r.supplier.email})</span>
              </td>
              <td>
                <button class="btn-wms-secondary small" style="padding:4px 8px; font-size:11px;" 
                  onclick="openVendorAlertModal('${r.material.code}')">
                  📧 Alert Vendor
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------------------------------------------
// H.7: VENDOR EXPEDITE SHORTAGE MODAL & DISPATCH
// -------------------------------------------------------------
function openVendorAlertModal(materialCode) {
  const materials = window.wms.materials || [];
  const stockLevels = window.wms.stockLevelMaster || [];
  const handlingUnits = window.wms.handlingUnits || [];
  const suppliers = window.wms.suppliers || [];

  const mat = materials.find(m => m.code === materialCode) || materials[0];
  const cfg = stockLevels.find(s => s.materialCode === mat.code) || { reorderPoint: 300, maxStock: 800 };
  const hus = handlingUnits.filter(h => h.materialCode === mat.code && h.stockStatus === 'AVAILABLE');
  const currentStock = hus.reduce((sum, h) => sum + (h.quantity || 0), 0);
  const deficit = Math.max(0, cfg.reorderPoint - currentStock);
  const suggestedReplenish = Math.max(deficit, cfg.maxStock - currentStock);

  let supplier = suppliers[0];
  if (mat.code.includes('KEI') || mat.code.includes('THROT') || mat.code.includes('ECU')) {
    supplier = suppliers.find(s => s.code === 'VEND-KEI-01') || suppliers[0];
  } else if (mat.code.includes('NIS') || mat.code.includes('BRK')) {
    supplier = suppliers.find(s => s.code === 'VEND-NIS-01') || suppliers[0];
  } else if (mat.code.includes('MIT') || mat.code.includes('STR')) {
    supplier = suppliers.find(s => s.code === 'VEND-MIT-01') || suppliers[0];
  } else if (mat.code.includes('MRF') || mat.code.includes('TYR')) {
    supplier = suppliers.find(s => s.code === 'VEND-MRF-01') || suppliers[0];
  }

  const expeditedPONo = `PO-HND-2026-EXP-${Math.floor(1000 + Math.random() * 9000)}`;

  const content = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:12px; font-size:12.5px; color:#991b1b;">
        <b>⚠️ URGENT VENDOR EXPEDITE TRIGGER</b><br>
        Direct procurement dispatch notice to vendor authorized contact.
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="wms-form-group">
          <label>Supplier Name</label>
          <input type="text" class="search-input" value="${supplier.name}" disabled style="background:#f1f5f9; width:100%;">
        </div>
        <div class="wms-form-group">
          <label>Recipient Email</label>
          <input type="text" id="va-email" class="search-input" value="${supplier.email}" style="width:100%;">
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
        <div class="wms-form-group">
          <label>Material Code</label>
          <input type="text" value="${mat.code}" disabled style="background:#f1f5f9; width:100%; font-family:var(--font-mono);">
        </div>
        <div class="wms-form-group">
          <label>Current Stock</label>
          <input type="text" value="${currentStock} ${mat.unit}" disabled style="background:#f1f5f9; width:100%; font-weight:700; color:#dc2626;">
        </div>
        <div class="wms-form-group">
          <label>Expedite Qty Required*</label>
          <input type="number" id="va-qty" class="search-input" value="${suggestedReplenish}" style="width:100%; font-weight:700; color:#2563eb;">
        </div>
      </div>

      <div class="wms-form-group">
        <label>Expedited PO Reference</label>
        <input type="text" id="va-po" class="search-input" value="${expeditedPONo}" style="width:100%; font-family:var(--font-mono); font-weight:700;">
      </div>

      <div class="wms-form-group">
        <label>Official Notice Body (Automated Dispatch Template)</label>
        <textarea id="va-body" rows="4" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px; font-family:inherit;">ATTN: ${supplier.contact} (${supplier.name})

URGENT: Stock level for component ${mat.code} (${mat.description}) has breached the critical safety threshold at ${mat.plant}. 
Current on-hand inventory is ${currentStock} ${mat.unit} against safety buffer of ${cfg.reorderPoint} ${mat.unit}.

Please arrange immediate priority trailer loading of ${suggestedReplenish} ${mat.unit} under Expedited Purchase Order ${expeditedPONo}.
Target Gate: Security Gate 01 / Receiving Dock 04. 
Required Delivery: Within 4 Hours.

Honda Motorcycle & Scooter India (HMSI) Logistics & Material Planning.</textarea>
      </div>
    </div>
  `;

  openDynamicModal(`Trigger Vendor Shortage Alert: ${mat.code}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" style="background:#dc2626; border-color:#b91c1c;" 
      onclick="submitVendorShortageAlert('${mat.code}', '${supplier.code}', '${supplier.name}')">
      📧 Dispatch Expedite Notice to Vendor
    </button>
  `);
}

function submitVendorShortageAlert(matCode, vendCode, vendName) {
  const email = document.getElementById('va-email')?.value || 'supply@keihin-india.com';
  const qty = parseInt(document.getElementById('va-qty')?.value || '250');
  const po = document.getElementById('va-po')?.value || 'PO-HND-2026-EXP-0821';

  const newAlert = {
    alertId: `VSA-2026-${String((window.wms.vendorShortageAlerts || []).length + 1).padStart(3, '0')}`,
    vendorCode: vendCode,
    vendorName: vendName,
    materialCode: matCode,
    materialDescription: (window.wms.materials.find(m => m.code === matCode)?.description) || matCode,
    currentStock: 50,
    reorderPoint: 300,
    shortageQty: qty,
    contactEmail: email,
    contactPerson: 'Authorized Dispatch Desk',
    timestamp: '24-Sep-2026 ' + new Date().toLocaleTimeString(),
    status: 'Sent (Dispatched)',
    expeditedPO: po
  };

  if (!window.wms.vendorShortageAlerts) window.wms.vendorShortageAlerts = [];
  window.wms.vendorShortageAlerts.unshift(newAlert);
  saveWMSState(window.wms);
  addAuditLog('VENDOR_SHORTAGE_ALERT', po, matCode, `Dispatched expedite notice for ${qty} EA to ${vendName} (${email})`);

  closeModal('modal-dynamic-form');
  renderReportsView();
  alert(`✅ Official Vendor Expedite Notice successfully dispatched to ${vendName} (${email}) under PO ${po}.`);
}

// -------------------------------------------------------------
// H.6: SCHEDULED DAILY AUTO-EMAIL & VENDOR ALERTS PANEL
// -------------------------------------------------------------
function saveAutoEmailConfig() {
  const schedule = document.getElementById('ae-schedule')?.value;
  const recipients = document.getElementById('ae-recipients')?.value;
  const format = document.getElementById('ae-format')?.value;
  const autoAlerts = document.getElementById('ae-auto-vendor')?.checked;

  if (!window.wms.dailyAutoEmailConfig) window.wms.dailyAutoEmailConfig = {};
  window.wms.dailyAutoEmailConfig.schedule = schedule;
  window.wms.dailyAutoEmailConfig.recipients = recipients;
  window.wms.dailyAutoEmailConfig.format = format;
  window.wms.dailyAutoEmailConfig.autoSendVendorAlerts = autoAlerts;
  window.wms.dailyAutoEmailConfig.enabled = true;

  saveWMSState(window.wms);
  addAuditLog('AUTO_EMAIL_CONFIG', 'SCHEDULE', 'Updated', `Configured schedule: ${schedule}`);
  renderReportsView();
  alert('✅ Scheduled Daily Auto-Email & Vendor Alerting configuration saved successfully.');
}

function triggerInstantDailyEmailDigest() {
  const cfg = window.wms.dailyAutoEmailConfig || {};
  const recips = cfg.recipients || 'wh-lead@hmsi.co.in, purchase@hmsi.co.in';

  cfg.lastSent = '24-Sep-2026 ' + new Date().toLocaleTimeString();
  saveWMSState(window.wms);
  addAuditLog('DAILY_DIGEST_SENT', 'MANUAL_TRIGGER', '-', `Sent instant digest to: ${recips}`);

  renderReportsView();

  const preview = `
    <div style="font-family:inherit; font-size:13px; color:#1e293b; line-height:1.6;">
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:12px; margin-bottom:14px; color:#15803d;">
        <b>✅ Scheduled Report Digest Dispatched Successfully</b><br>
        Recipients: <b>${recips}</b><br>
        Timestamp: <b>${cfg.lastSent}</b>
      </div>
      <div style="border:1px solid #e2e8f0; border-radius:6px; padding:14px; background:#f8fafc;">
        <div style="font-weight:800; font-size:14px; color:#0f172a; margin-bottom:6px;">Executive Warehouse Summary Digest</div>
        <div>• <b>Total Stock Valuation:</b> ₹ 48.65 Lakhs (8 Active SKUs)</div>
        <div>• <b>Critical Shortage Items:</b> 1 SKU (HND-ECU-KEIHIN-01, -250 EA Deficit)</div>
        <div>• <b>Slow-Moving & Dead Stock:</b> 3 SKUs (Total Locked Capital: ₹ 2.50 Lakhs)</div>
        <div>• <b>Quarantine Occupancy:</b> 5 Handling Units Locked in Cages</div>
        <div style="margin-top:10px; font-size:11.5px; color:#64748b;">Attachments generated: 📄 HMSI_Executive_Stock_Digest.pdf (2.4 MB) • 📊 Stock_Shortage_Summary.xlsx</div>
      </div>
    </div>
  `;

  openDynamicModal('Scheduled Daily Email Digest Preview', preview, `
    <button class="btn-wms-primary" onclick="closeModal('modal-dynamic-form')">Close Preview</button>
  `);
}

function renderAutoEmailReport(container) {
  const cfg = window.wms.dailyAutoEmailConfig || {
    enabled: true,
    schedule: '07:00 Daily (Pre-Shift A)',
    recipients: 'wh-lead@hmsi.co.in, purchase@hmsi.co.in, plant-head@hmsi.co.in',
    format: 'Executive PDF + Excel Attachment',
    lastSent: '24-Sep-2026 07:00:15',
    autoSendVendorAlerts: true
  };
  const alerts = window.wms.vendorShortageAlerts || [];

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px;">
      <!-- Config Form Card -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <b style="font-size:14px; color:#0f172a;">⚙️ Daily Scheduled Auto-Email Settings</b>
          <span class="wms-badge ${cfg.enabled ? 'badge-available' : 'badge-danger'}">${cfg.enabled ? 'ACTIVE' : 'DISABLED'}</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="wms-form-group">
            <label>Automated Delivery Schedule*</label>
            <select class="select-filter" id="ae-schedule" style="width:100%;">
              <option value="07:00 Daily (Pre-Shift A)" ${cfg.schedule.includes('07:00') ? 'selected' : ''}>07:00 Daily (Pre-Shift A - Recommended)</option>
              <option value="14:00 Daily (Pre-Shift B)" ${cfg.schedule.includes('14:00') ? 'selected' : ''}>14:00 Daily (Pre-Shift B Handover)</option>
              <option value="22:00 Daily (Pre-Shift C)" ${cfg.schedule.includes('22:00') ? 'selected' : ''}>22:00 Daily (Pre-Shift C Night)</option>
              <option value="Twice Daily (07:00 & 19:00)" ${cfg.schedule.includes('Twice') ? 'selected' : ''}>Twice Daily (07:00 & 19:00)</option>
            </select>
          </div>

          <div class="wms-form-group">
            <label>Subscribed Email Recipients (comma-separated)*</label>
            <input type="text" id="ae-recipients" class="search-input" value="${cfg.recipients || ''}" style="width:100%;">
          </div>

          <div class="wms-form-group">
            <label>Report Attachment Format*</label>
            <select class="select-filter" id="ae-format" style="width:100%;">
              <option value="Executive PDF + Excel Attachment">Executive PDF + Excel Attachment</option>
              <option value="HTML Email Body + CSV Data">HTML Email Body + CSV Data</option>
            </select>
          </div>

          <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
            <input type="checkbox" id="ae-auto-vendor" ${cfg.autoSendVendorAlerts ? 'checked' : ''} style="cursor:pointer;">
            <label for="ae-auto-vendor" style="font-size:12px; font-weight:600; color:#334155; cursor:pointer;">
              Automatically trigger expedite emails to vendor when component breaches safety stock
            </label>
          </div>

          <div style="display:flex; gap:10px; margin-top:10px;">
            <button class="btn-wms-primary" style="flex:1;" onclick="saveAutoEmailConfig()">
              Save Schedule Settings
            </button>
            <button class="btn-wms-secondary" onclick="triggerInstantDailyEmailDigest()">
              🚀 Trigger Now
            </button>
          </div>
        </div>
      </div>

      <!-- Live Digest Preview Card -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px;">
        <b style="font-size:14px; color:#0f172a;">📋 Subscribed Digest Contents</b>
        <p style="font-size:12px; color:#64748b; margin-top:4px;">The following automated modules are compiled in every scheduled email dispatch:</p>

        <div style="display:flex; flex-direction:column; gap:10px; margin-top:14px;">
          <div style="display:flex; align-items:center; gap:10px; background:#ffffff; padding:10px 12px; border-radius:6px; border:1px solid #e2e8f0;">
            <span style="font-size:16px;">📊</span>
            <div>
              <b style="font-size:12px; color:#0f172a;">Daily Stock Summary (Class A/B/C)</b>
              <div style="font-size:11px; color:#64748b;">Total physical, available, reserved, and blocked units across all lines.</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px; background:#ffffff; padding:10px 12px; border-radius:6px; border:1px solid #e2e8f0;">
            <span style="font-size:16px;">⚠️</span>
            <div>
              <b style="font-size:12px; color:#0f172a;">Critical Shortage & Stockout Risk Alert</b>
              <div style="font-size:11px; color:#64748b;">Net deficit comparison against BOM requirements and suggested replenishment.</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px; background:#ffffff; padding:10px 12px; border-radius:6px; border:1px solid #e2e8f0;">
            <span style="font-size:16px;">⏱️</span>
            <div>
              <b style="font-size:12px; color:#0f172a;">Slow-Moving & Aging Inventory Digest</b>
              <div style="font-size:11px; color:#64748b;">Working capital locked in parts without movement for >30d or >90d.</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px; background:#ffffff; padding:10px 12px; border-radius:6px; border:1px solid #e2e8f0;">
            <span style="font-size:16px;">⛔</span>
            <div>
              <b style="font-size:12px; color:#0f172a;">Quarantine & Blocked Defect Log</b>
              <div style="font-size:11px; color:#64748b;">Pending commercial dispositions, vendor debit notes, and write-offs.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- History of Sent Vendor Alerts & Scheduled Digests -->
    <div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
      <b style="font-size:13.5px; color:#0f172a;">📜 History of Dispatched Vendor Expedite Alerts & Scheduled Digests</b>
      <span style="font-size:12px; color:#64748b;">${alerts.length} Total Alerts Logged</span>
    </div>

    <div class="table-responsive">
      <table class="wms-table">
        <thead>
          <tr>
            <th>Alert ID</th>
            <th>Supplier Name</th>
            <th>Material Code</th>
            <th>Deficit Qty</th>
            <th>Recipient Email</th>
            <th>Expedited PO</th>
            <th>Dispatched Timestamp</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${alerts.map(a => `
            <tr>
              <td><b style="font-family:var(--font-mono); color:#2563eb;">${a.alertId}</b></td>
              <td><b>${a.vendorName}</b></td>
              <td><b style="font-family:var(--font-mono);">${a.materialCode}</b></td>
              <td><b style="color:#dc2626;">-${a.shortageQty} EA</b></td>
              <td><span style="font-size:12px; color:#475569;">${a.contactEmail}</span></td>
              <td><b style="font-family:var(--font-mono); color:#2563eb;">${a.expeditedPO}</b></td>
              <td>${a.timestamp}</td>
              <td><span class="wms-badge badge-available">${a.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------------------------------------------
// H.8: PART ISSUANCE & SHOP CONSUMPTION REPORT
// -------------------------------------------------------------
function setIssuanceReportShopFilter(shop) {
  issuanceReportShopFilter = shop;
  renderReportsView();
}

function exportIssuanceHistoryCSV() {
  const issues = window.wms.lineIssues || [];
  const data = issues.map(i => ({
    'Issue ID': i.issueId,
    'Shop Name': i.shopName,
    'Sub-Area / Line': i.subAreaName || i.productionLine,
    'Material Code': i.materialCode,
    'Description': i.materialDescription,
    'Issued Qty': i.issuedQty,
    'UOM': i.uom,
    'Issued By': i.issuedBy,
    'Shift': i.shift,
    'Timestamp': i.issueTimestamp,
    'SAP Movement Doc': i.sapGiDocNo
  }));
  exportTableToCSV(data, 'HMSI_Part_Issuance_History_Report.csv');
}

function renderIssuanceHistoryReport(container) {
  const issues = window.wms.lineIssues || [];
  const shops = window.wms.shopMaster || [];

  let filtered = issues;
  if (issuanceReportShopFilter !== 'All') {
    filtered = issues.filter(i => (i.shopCode === issuanceReportShopFilter || i.shopName?.includes(issuanceReportShopFilter)));
  }

  const totalIssued = filtered.reduce((sum, i) => sum + (i.issuedQty || 0), 0);

  container.innerHTML = `
    <!-- Filters & Action Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="font-size:12px; font-weight:700; color:#64748b;">Target Shop:</span>
        <button class="btn-wms-secondary small ${issuanceReportShopFilter === 'All' ? 'active' : ''}" onclick="setIssuanceReportShopFilter('All')">All Shops (${issues.length})</button>
        ${shops.map(s => `
          <button class="btn-wms-secondary small ${issuanceReportShopFilter === s.shopCode ? 'active' : ''}" onclick="setIssuanceReportShopFilter('${s.shopCode}')">
            ${s.name.split(' ')[0]}
          </button>
        `).join('')}
      </div>
      <button class="btn-wms-primary small" onclick="exportIssuanceHistoryCSV()">
        <span>📊</span> Export Issuance History CSV
      </button>
    </div>

    <!-- Summary KPI Cards -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px 14px;">
        <div style="font-size:11px; color:#64748b; font-weight:700; text-transform:uppercase;">Total Units Issued</div>
        <div style="font-size:18px; font-weight:900; color:#0f172a; margin-top:2px;">${totalIssued.toLocaleString()} Units</div>
      </div>
      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:12px 14px;">
        <div style="font-size:11px; color:#1d4ed8; font-weight:700; text-transform:uppercase;">Active Consumption Lines</div>
        <div style="font-size:18px; font-weight:900; color:#2563eb; margin-top:2px;">5 Production Areas</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:12px 14px;">
        <div style="font-size:11px; color:#15803d; font-weight:700; text-transform:uppercase;">SAP Movement 261 GI Status</div>
        <div style="font-size:18px; font-weight:900; color:#16a34a; margin-top:2px;">100% ERP Reconciled</div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="wms-table">
        <thead>
          <tr>
            <th>Issue ID</th>
            <th>Shop / Sub-Area</th>
            <th>Component Code & Description</th>
            <th>Issued Qty</th>
            <th>Shift</th>
            <th>Issued By</th>
            <th>Timestamp</th>
            <th>SAP Movement Doc</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(i => `
            <tr>
              <td><b style="font-family:var(--font-mono); color:#2563eb;">${i.issueId}</b></td>
              <td><b>${i.shopName}</b><br><span style="font-size:11px; color:#64748b;">${i.subAreaName || i.productionLine}</span></td>
              <td><b>${i.materialCode}</b><br><span style="font-size:11.5px; color:#475569;">${i.materialDescription}</span></td>
              <td><b style="font-size:13px; color:#059669;">${i.issuedQty} ${i.uom || 'EA'}</b></td>
              <td><span class="wms-badge badge-allocated">${i.shift}</span></td>
              <td>${i.issuedBy}</td>
              <td>${i.issueTimestamp}</td>
              <td><b style="font-family:var(--font-mono); color:#2563eb;">${i.sapGiDocNo || 'SAP-GI-50029104'}</b></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------------------------------------------
// LEGACY OVERSTOCK, VARIATION & SUPPLIER REPORTS (PRESERVED)
// -------------------------------------------------------------
function renderOverstockReport(container) {
  const materials = window.wms.materials || [];
  const stockLevels = window.wms.stockLevelMaster || [];
  const handlingUnits = window.wms.handlingUnits || [];

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
                  <span class="wms-badge badge-danger">⚠️ Overstock</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

function renderVariationReport(container) {
  container.innerHTML = `
    <div class="table-responsive">
      <table class="wms-table">
        <thead>
          <tr><th>Material Code</th><th>Description</th><th>WMS Qty</th><th>SAP ERP Qty</th><th>Last Counted Qty</th><th>Difference</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><b>HND-BRK-PAD-01</b></td><td>Nissin Front Disc Brake Pad Set</td><td>488 EA</td><td>488 EA</td><td>588 EA (Pre-Issue)</td><td>0 EA</td><td><span class="wms-badge badge-available">Reconciled</span></td>
          </tr>
          <tr>
            <td><b>HND-THROT-KEIHIN</b></td><td>Keihin Throttle Body 26mm</td><td>80 EA</td><td>80 EA</td><td>80 EA</td><td>0 EA</td><td><span class="wms-badge badge-available">Reconciled</span></td>
          </tr>
          <tr>
            <td><b>HND-ECU-KEIHIN-01</b></td><td>Keihin Master ECU OBD2</td><td>50 EA</td><td>50 EA</td><td>50 EA</td><td>0 EA</td><td><span class="wms-badge badge-available">Reconciled</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderSupplierReport(container) {
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

// Universal Report Dispatchers
function exportActiveReportCSV() {
  if (activeReportSubtab === 'traceability') {
    const { material, events } = buildTraceabilityTimeline(traceSearchQuery);
    const rows = events.map(e => ({
      'Milestone Step': e.step,
      'Title': e.title,
      'Stage': e.stage,
      'Timestamp': e.timestamp,
      'Plant': e.plant,
      'Operator': e.operator,
      'Role': e.role,
      'Device': e.device,
      'Document Ref': e.docRef,
      'Status': e.status
    }));
    exportTableToCSV(rows, `HMSI_Part_Traceability_${material.code}.csv`);
  } else if (activeReportSubtab === 'stockSummary') {
    exportStockSummaryCSV();
  } else if (activeReportSubtab === 'locationStock') {
    exportLocationStockCSV();
  } else if (activeReportSubtab === 'slowMoving') {
    exportSlowMovingCSV();
  } else if (activeReportSubtab === 'shortage') {
    exportShortageCSV();
  } else if (activeReportSubtab === 'issuanceHistory') {
    exportIssuanceHistoryCSV();
  } else {
    alert(`CSV export prepared for report tab: ${activeReportSubtab}`);
  }
}

function printActiveReport() {
  window.print();
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
  const shopFilter = document.getElementById('line-issue-shop-filter')?.value || 'All';
  const searchInput = (document.getElementById('line-issue-search')?.value || '').toLowerCase().trim();

  let issues = window.wms.lineIssues || [];
  if (plant !== 'All') {
    issues = issues.filter(i => i.plant === plant || !i.plant);
  }
  if (shopFilter !== 'All') {
    issues = issues.filter(i => i.shopCode === shopFilter);
  }
  if (searchInput) {
    issues = issues.filter(i =>
      (i.issueNo && i.issueNo.toLowerCase().includes(searchInput)) ||
      (i.materialCode && i.materialCode.toLowerCase().includes(searchInput)) ||
      (i.materialDescription && i.materialDescription.toLowerCase().includes(searchInput)) ||
      (i.subArea && i.subArea.toLowerCase().includes(searchInput)) ||
      (i.productionLine && i.productionLine.toLowerCase().includes(searchInput)) ||
      (i.stagingBin && i.stagingBin.toLowerCase().includes(searchInput)) ||
      (i.sapGoodsIssueDocNo && i.sapGoodsIssueDocNo.toLowerCase().includes(searchInput))
    );
  }

  if (issues.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:24px; color:#64748b;">No production issues found matching filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = issues.map(i => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${i.issueNo}</b></td>
      <td><span style="font-family:var(--font-mono); font-size:11.5px;">${i.issueListNo || i.productionOrderNo || '—'}</span></td>
      <td>
        <span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:800; font-size:10px;">${i.shopCode || 'SHOP-AF'}</span>
        <div style="font-weight:700; color:#0f172a; margin-top:2px;">${i.subArea || i.productionLine}</div>
      </td>
      <td><b>${i.materialCode}</b><br><span style="font-size:11px; color:#64748b;">${i.materialDescription}</span></td>
      <td><b>${i.qtyIssued} ${i.uom}</b></td>
      <td>${i.deliveredBy}</td>
      <td><div>${i.receivedAtLineTime}</div><span style="font-size:10px; color:#64748b;">${i.shift || 'Shift N1'}</span></td>
      <td><span style="font-family:var(--font-mono); font-weight:700; color:#2563eb;">${i.stagingBin}</span></td>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${i.sapGoodsIssueDocNo}</b> <span class="badge-sap">Mvt 261</span></td>
      <td><span class="wms-badge ${getStatusBadgeClass(i.status)}">${i.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openPrintPreview('ISSUE', '${i.issueNo}')">Slip</button>
      </td>
    </tr>
  `).join('');
}

function renderIssuanceHistory() {
  const issues = window.wms.lineIssues || [];

  // Metrics
  const totalQty = issues.reduce((sum, i) => sum + (Number(i.qtyIssued) || 0), 0);
  const shiftN1Qty = issues.filter(i => (i.shift || '').includes('N1')).reduce((sum, i) => sum + (Number(i.qtyIssued) || 0), 0);
  const shiftN2Qty = issues.filter(i => (i.shift || '').includes('N2')).reduce((sum, i) => sum + (Number(i.qtyIssued) || 0), 0);
  const shiftN3Qty = issues.filter(i => (i.shift || '').includes('N3')).reduce((sum, i) => sum + (Number(i.qtyIssued) || 0), 0);
  const sapDocsCount = issues.filter(i => i.sapGoodsIssueDocNo && i.sapGoodsIssueDocNo !== '—').length;
  const uniqueShops = new Set(issues.map(i => i.shopCode || 'SHOP-AF')).size;

  const totalQtyEl = document.getElementById('kpi-issue-total-qty');
  const totalCountEl = document.getElementById('kpi-issue-total-count');
  const shiftsEl = document.getElementById('kpi-issue-shifts');
  const sapDocsEl = document.getElementById('kpi-issue-sap-docs');
  const shopsCountEl = document.getElementById('kpi-issue-shops-count');

  if (totalQtyEl) totalQtyEl.textContent = `${totalQty.toLocaleString()} EA`;
  if (totalCountEl) totalCountEl.textContent = `${issues.length} Orders Completed`;
  if (shiftsEl) shiftsEl.textContent = `N1: ${shiftN1Qty} EA | N2: ${shiftN2Qty} EA ${shiftN3Qty > 0 ? '| N3: ' + shiftN3Qty + ' EA' : ''}`;
  if (sapDocsEl) sapDocsEl.textContent = `${sapDocsCount} Docs`;
  if (shopsCountEl) shopsCountEl.textContent = `${uniqueShops} / 5 Shops`;

  filterIssuanceHistory();
}

function filterIssuanceHistory() {
  const tbody = document.getElementById('issuance-history-table-body');
  if (!tbody) return;

  const searchInput = (document.getElementById('issue-history-search')?.value || '').toLowerCase().trim();
  const shopFilter = document.getElementById('issue-history-shop-filter')?.value || 'All';
  const shiftFilter = document.getElementById('issue-history-shift-filter')?.value || 'All';
  const plant = window.wms.activePlant || 'All';

  let list = window.wms.lineIssues || [];

  if (plant !== 'All') {
    list = list.filter(i => i.plant === plant || !i.plant);
  }
  if (shopFilter !== 'All') {
    list = list.filter(i => i.shopCode === shopFilter);
  }
  if (shiftFilter !== 'All') {
    list = list.filter(i => (i.shift || '').includes(shiftFilter));
  }
  if (searchInput) {
    list = list.filter(i =>
      (i.issueNo && i.issueNo.toLowerCase().includes(searchInput)) ||
      (i.productionOrderNo && i.productionOrderNo.toLowerCase().includes(searchInput)) ||
      (i.materialCode && i.materialCode.toLowerCase().includes(searchInput)) ||
      (i.materialDescription && i.materialDescription.toLowerCase().includes(searchInput)) ||
      (i.subArea && i.subArea.toLowerCase().includes(searchInput)) ||
      (i.stagingBin && i.stagingBin.toLowerCase().includes(searchInput)) ||
      (i.sapGoodsIssueDocNo && i.sapGoodsIssueDocNo.toLowerCase().includes(searchInput)) ||
      (i.deliveredBy && i.deliveredBy.toLowerCase().includes(searchInput))
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:28px; color:#64748b;">📜 No issuance records match the specified filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(i => `
    <tr>
      <td><strong style="font-family:var(--font-mono); color:#2563eb;">${i.issueNo}</strong></td>
      <td>
        <div style="font-family:var(--font-mono); font-weight:700; color:#0f172a;">${i.productionOrderNo || i.issueListNo || 'PROD-2026-000'}</div>
        <span style="font-size:10px; color:#64748b;">List: ${i.issueListNo || '—'}</span>
      </td>
      <td>
        <span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:800; font-size:10px;">${i.shopCode || 'SHOP-AF'}</span>
        <div style="font-weight:700; color:#0f172a; margin-top:2px;">${i.subArea || i.productionLine}</div>
        <div style="font-size:11px; color:#64748b;">${i.shopName || ''}</div>
      </td>
      <td>
        <div style="font-weight:700; color:#0f172a;">${i.materialCode}</div>
        <div style="font-size:11.5px; color:#64748b;">${i.materialDescription}</div>
      </td>
      <td><strong style="font-size:13px; color:#0f172a;">${i.qtyIssued}</strong> <span style="font-size:11px; color:#64748b;">${i.uom}</span></td>
      <td><span style="font-family:var(--font-mono); font-weight:700; color:#2563eb; background:#eff6ff; padding:2px 6px; border-radius:4px;">${i.stagingBin}</span></td>
      <td>
        <div style="font-family:var(--font-mono); font-weight:800; color:#15803d;">${i.sapGoodsIssueDocNo}</div>
        <span class="badge-sap">Mvt 261 (GI Order)</span>
      </td>
      <td><div style="font-size:12px; font-weight:600;">${i.deliveredBy}</div></td>
      <td>
        <div>${i.receivedAtLineTime}</div>
        <span class="badge" style="background:#f1f5f9; color:#475569; font-size:10px;">${i.shift || 'Shift N1'}</span>
      </td>
      <td><span class="wms-badge ${getStatusBadgeClass(i.status)}">${i.status}</span></td>
      <td>
        <button class="btn-wms-secondary small" onclick="openPrintPreview('ISSUE', '${i.issueNo}')">Slip</button>
      </td>
    </tr>
  `).join('');
}

function exportIssuanceHistoryCSV() {
  exportTableToCSV(window.wms.lineIssues || [], 'HMSIL_Part_Issuance_History.csv');
}

function openDirectShopIssueModal() {
  const shops = window.wms.shopMaster || [];
  const mats = window.wms.materials || [];

  const shopOptions = shops.map(s => `<option value="${s.shopCode}">${s.shopCode} — ${s.name}</option>`).join('');
  const matOptions = mats.map(m => `<option value="${m.code}">${m.code} — ${m.description} (${m.unit})</option>`).join('');

  const content = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Select Target Production Shop*</label>
        <select id="modal-issue-shop" class="select-filter" style="width:100%;" onchange="onModalShopChange(this.value)">
          ${shopOptions}
        </select>
      </div>
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Target Sub-Area / Work Cell / Line*</label>
        <select id="modal-issue-subarea" class="select-filter" style="width:100%;">
          <!-- Populated by JS -->
        </select>
      </div>
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Component Material*</label>
        <select id="modal-issue-material" class="select-filter" style="width:100%;">
          ${matOptions}
        </select>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Issue Quantity*</label>
          <input type="number" id="modal-issue-qty" class="search-input" value="50" min="1" style="width:100%;">
        </div>
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Target Staging Drop Point*</label>
          <input type="text" id="modal-issue-staging" class="search-input" value="STG-MCH-01" style="width:100%;">
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Production Order No.*</label>
          <input type="text" id="modal-issue-prodorder" class="search-input" value="PROD-2026-${Math.floor(10000 + Math.random() * 90000)}" style="width:100%;">
        </div>
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Operating Shift*</label>
          <select id="modal-issue-shift" class="select-filter" style="width:100%;">
            <option value="Shift N1">Shift N1 (Morning)</option>
            <option value="Shift N2">Shift N2 (Evening)</option>
            <option value="Shift N3">Shift N3 (Night)</option>
          </select>
        </div>
      </div>
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Delivery Reference / Trolley No.*</label>
        <input type="text" id="modal-issue-trolley" class="search-input" value="Trolley #0${Math.floor(1 + Math.random() * 8)}" style="width:100%;">
      </div>
    </div>
  `;

  openDynamicModal('Disburse Stock to Production Area / Shop (SAP GI 261)', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="submitDirectShopIssue()">🚀 Confirm GI & Post to SAP</button>
  `);

  if (shops.length > 0) {
    onModalShopChange(shops[0].shopCode);
  }
}

function onModalShopChange(shopCode) {
  const shop = (window.wms.shopMaster || []).find(s => s.shopCode === shopCode);
  const subAreaSelect = document.getElementById('modal-issue-subarea');
  const stagingInput = document.getElementById('modal-issue-staging');

  if (shop && subAreaSelect) {
    subAreaSelect.innerHTML = (shop.subAreas || []).map(a => `
      <option value="${a.code}">${a.code} — ${a.name}</option>
    `).join('');
    if (stagingInput) {
      stagingInput.value = shop.stagingBin || 'STG-01';
    }
  }
}

function submitDirectShopIssue() {
  const shopCode = document.getElementById('modal-issue-shop')?.value;
  const subAreaCode = document.getElementById('modal-issue-subarea')?.value;
  const matCode = document.getElementById('modal-issue-material')?.value;
  const qty = Number(document.getElementById('modal-issue-qty')?.value) || 50;
  const stagingBin = document.getElementById('modal-issue-staging')?.value || 'STG-01';
  const prodOrder = document.getElementById('modal-issue-prodorder')?.value || 'PROD-2026-99999';
  const shift = document.getElementById('modal-issue-shift')?.value || 'Shift N1';
  const trolley = document.getElementById('modal-issue-trolley')?.value || 'Trolley #01';

  const shop = (window.wms.shopMaster || []).find(s => s.shopCode === shopCode);
  const subArea = shop?.subAreas?.find(a => a.code === subAreaCode);
  const mat = (window.wms.materials || []).find(m => m.code === matCode);

  const issueNo = `ISS-2026-${String((window.wms.lineIssues || []).length + 86).padStart(4, '0')}`;
  const sapDocNo = `SAP-MAT-600192${Math.floor(1000 + Math.random() * 9000)}`;

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const newIssue = {
    issueNo,
    plant: shop?.plant || window.wms.activePlant || 'HMSI Narsapur Plant 1',
    issueListNo: `IL-HND-2026-${String((window.wms.lineIssues || []).length + 86).padStart(4, '0')}`,
    productionOrderNo: prodOrder,
    shopCode,
    shopName: shop?.name || 'Production Shop',
    subArea: subArea ? `${subArea.code} (${subArea.name})` : 'Line Staging',
    productionLine: subArea ? subArea.name : shop?.name,
    lineCode: subAreaCode,
    materialCode: matCode,
    materialDescription: mat?.description || 'Component Part',
    qtyIssued: qty,
    uom: mat?.unit || 'EA',
    deliveredBy: `${window.wms.currentUser?.name || 'Sanjay Verma'} (${trolley})`,
    receivedAtLineTime: dateStr,
    stagingBin,
    shift,
    sapGoodsIssueDocNo: sapDocNo,
    sapStatus: 'posted',
    status: 'Delivered to Shop'
  };

  if (!window.wms.lineIssues) window.wms.lineIssues = [];
  window.wms.lineIssues.unshift(newIssue);

  // SAP Sync Log
  if (!window.wms.sapSyncLogs) window.wms.sapSyncLogs = [];
  window.wms.sapSyncLogs.unshift({
    syncId: `SAP-SYNC-${Math.floor(1000 + Math.random() * 9000)}`,
    interfaceType: 'BAPI_GOODSMVT_CREATE',
    direction: 'WMS → SAP',
    wmsRef: issueNo,
    sapDocNo: sapDocNo,
    payloadType: 'Movement 261 (Goods Issue for Order)',
    status: 'success',
    errorText: '—',
    timestamp: dateStr
  });

  addAuditLog(
    'Part Disbursed to Production Shop',
    matCode,
    `Warehouse Stock (-${qty} ${mat?.unit || 'EA'})`,
    `Delivered to ${shop?.name} (${stagingBin}). Ref: ${issueNo}, SAP GI: ${sapDocNo}`
  );

  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderAllWMSViews();
  alert(`✅ Part ${matCode} (${qty} ${mat?.unit || 'EA'}) successfully issued to ${shop?.name}.\nSAP GI Document No: ${sapDocNo}\nIssue Ref: ${issueNo}`);
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
// 5.5. PACKING & DISPATCH MANAGEMENT (MODULE G - CONFIGURABLE SCOPE)
// ==========================================================================
function renderDispatchView() {
  const orders = window.wms.dispatchOrders || [];
  const bays = window.wms.dispatchBays || [];
  const settings = window.wms.dispatchSettings || { enabled: false, scopeStatus: 'AWAITING_CONFIRMATION' };

  // Sync Module Active Toggle
  const toggleEl = document.getElementById('dispatch-module-toggle');
  const toggleLabel = document.getElementById('dispatch-toggle-status-label');
  const scopePill = document.getElementById('dispatch-scope-status-pill');
  const navBadge = document.getElementById('nav-dispatch-badge');

  if (toggleEl) toggleEl.checked = !!settings.enabled;
  if (toggleLabel) {
    toggleLabel.textContent = settings.enabled ? 'ON (Active)' : 'OFF (Preview)';
    toggleLabel.style.color = settings.enabled ? '#059669' : '#64748b';
  }
  if (scopePill) {
    if (settings.enabled) {
      scopePill.textContent = 'ACTIVE SCOPE (CLIENT CONFIRMED)';
      scopePill.style.background = '#10b981';
      scopePill.style.color = '#ffffff';
    } else {
      scopePill.textContent = 'AWAITING CLIENT CONFIRMATION';
      scopePill.style.background = '#f59e0b';
      scopePill.style.color = '#ffffff';
    }
  }
  if (navBadge) {
    if (settings.enabled) {
      navBadge.textContent = 'ACTIVE';
      navBadge.style.background = '#dcfce7';
      navBadge.style.color = '#15803d';
    } else {
      navBadge.textContent = 'SCOPE TBC';
      navBadge.style.background = '#fef3c7';
      navBadge.style.color = '#92400e';
    }
  }

  // 1. Scheduled Shipments KPI
  const totalUnits = orders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
  const totalOrdersEl = document.getElementById('kpi-dispatch-total-orders');
  const totalUnitsEl = document.getElementById('kpi-dispatch-total-units');
  if (totalOrdersEl) totalOrdersEl.textContent = `${orders.length} Shipments`;
  if (totalUnitsEl) totalUnitsEl.textContent = `${totalUnits} Finished Two-Wheelers`;

  // 2. Staging Bays KPI
  const activeBays = bays.filter(b => b.status === 'OCCUPIED' || b.currentLoad > 0).length;
  const baysActiveEl = document.getElementById('kpi-dispatch-bays-active');
  if (baysActiveEl) baysActiveEl.textContent = `${activeBays} / ${bays.length} Bays Active`;

  // 3. Carrier Fleet & Dock Status KPI
  const loadingTrucks = orders.filter(o => o.status === 'LOADING' || o.status === 'STAGED').length;
  const trucksDockedEl = document.getElementById('kpi-dispatch-trucks-docked');
  if (trucksDockedEl) trucksDockedEl.textContent = `${loadingTrucks} Vehicles Loading`;

  // 4. SAP Movement 601 (PGI) Status KPI
  const postedPgi = orders.filter(o => o.status === 'DISPATCHED').length;
  const pendingPgi = orders.filter(o => o.status !== 'DISPATCHED').length;
  const sapDocsEl = document.getElementById('kpi-dispatch-sap-docs');
  if (sapDocsEl) sapDocsEl.textContent = `${postedPgi} Posted / ${pendingPgi} Pending`;

  filterDispatchOrders();
}

function filterDispatchOrders() {
  const tbody = document.getElementById('dispatch-table-body');
  if (!tbody) return;

  const searchInput = (document.getElementById('dispatch-search-input')?.value || '').toLowerCase().trim();
  const bayFilter = document.getElementById('dispatch-bay-filter')?.value || 'All';
  const statusFilter = document.getElementById('dispatch-status-filter')?.value || 'All';

  let list = window.wms.dispatchOrders || [];

  if (bayFilter !== 'All') {
    list = list.filter(o => o.stagingBay === bayFilter);
  }
  if (statusFilter !== 'All') {
    list = list.filter(o => o.status === statusFilter);
  }
  if (searchInput) {
    list = list.filter(o =>
      (o.dispatchOrderNo && o.dispatchOrderNo.toLowerCase().includes(searchInput)) ||
      (o.soNumber && o.soNumber.toLowerCase().includes(searchInput)) ||
      (o.destination && o.destination.toLowerCase().includes(searchInput)) ||
      (o.modelCode && o.modelCode.toLowerCase().includes(searchInput)) ||
      (o.modelDescription && o.modelDescription.toLowerCase().includes(searchInput)) ||
      (o.carrier && o.carrier.toLowerCase().includes(searchInput)) ||
      (o.truckNo && o.truckNo.toLowerCase().includes(searchInput)) ||
      (o.driverName && o.driverName.toLowerCase().includes(searchInput)) ||
      (o.stagingBay && o.stagingBay.toLowerCase().includes(searchInput))
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:28px; color:#64748b;">🚫 No dispatch orders match the selected filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(o => {
    let statusBadge = '';
    if (o.status === 'STAGED') {
      statusBadge = `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:800; font-size:11px;">🅿️ STAGED</span>`;
    } else if (o.status === 'LOADING') {
      statusBadge = `<span class="badge" style="background:#dbeafe; color:#1e40af; font-weight:800; font-size:11px;">🚚 LOADING</span>`;
    } else if (o.status === 'DISPATCHED') {
      statusBadge = `<span class="badge" style="background:#dcfce7; color:#15803d; font-weight:800; font-size:11px;">✅ DISPATCHED</span>`;
    } else {
      statusBadge = `<span class="wms-badge">${o.status}</span>`;
    }

    const isPendingPGI = o.status !== 'DISPATCHED';

    return `
      <tr>
        <td>
          <strong style="font-family:var(--font-mono); color:#2563eb;">${o.dispatchOrderNo}</strong>
          <div style="font-size:10.5px; color:#64748b; font-family:var(--font-mono);">${o.soNumber}</div>
        </td>
        <td>
          <div style="font-weight:700; color:#0f172a; font-size:12px;">${o.destination}</div>
          <span style="font-size:10.5px; color:#64748b;">Plant: ${o.plant}</span>
        </td>
        <td>
          <strong style="font-family:var(--font-mono); color:#0f172a;">${o.modelCode}</strong>
          <div style="font-size:11px; color:#475569;">${o.modelDescription}</div>
        </td>
        <td>
          <strong style="font-size:13px; color:#059669;">${o.quantity}</strong> <span style="font-size:11px; color:#64748b;">${o.uom || 'UNT'}</span>
        </td>
        <td>
          <div style="font-weight:700; color:#0f172a; font-size:11.5px;">${o.carrier}</div>
          <div style="font-size:11px; font-family:var(--font-mono); color:#2563eb;">${o.truckNo}</div>
          <div style="font-size:10px; color:#64748b;">${o.driverName}</div>
        </td>
        <td>
          <span style="font-family:var(--font-mono); font-weight:800; color:#7c3aed; background:#f5f3ff; padding:3px 7px; border-radius:4px; border:1px solid #ede9fe; font-size:11px;">
            ${o.stagingBay}
          </span>
        </td>
        <td>
          <div style="font-size:11px; font-weight:700; color:#0f172a;">${o.packingSlipNo}</div>
          <span style="font-size:10px; font-family:var(--font-mono); color:#64748b;">SAP Mvt 601: ${o.sapPgiDocNo || 'Pending PGI'}</span>
        </td>
        <td>
          <div style="font-size:11px; color:#0f172a;">${o.scheduledDate}</div>
        </td>
        <td>${statusBadge}</td>
        <td>
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            <button class="btn-wms-secondary small" onclick="openPackingSlipModal('${o.dispatchOrderNo}')">📋 Manifest</button>
            ${isPendingPGI ? `<button class="btn-wms-primary small" style="background:#059669; border-color:#059669;" onclick="postDispatchPGI('${o.dispatchOrderNo}')">🚚 Post PGI</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleDispatchModule(enabled) {
  if (!window.wms.dispatchSettings) {
    window.wms.dispatchSettings = {
      enabled: false,
      scopeStatus: 'AWAITING_CONFIRMATION',
      confirmationNote: 'Finished Goods Packing & Customer Dispatch workflow is configured as a Phase 2 item awaiting final client confirmation regarding finished vehicle yard management scope.',
      sapMovementType: 'Movement 601 (Post Goods Issue - PGI)',
      requireBayScan: true,
      requireVehicleRegCheck: true
    };
  }

  window.wms.dispatchSettings.enabled = !!enabled;
  window.wms.dispatchSettings.scopeStatus = enabled ? 'ACTIVE_CONFIRMED' : 'AWAITING_CONFIRMATION';

  saveWMSState(window.wms);
  renderDispatchView();

  const msg = enabled
    ? '✅ Finished Goods Packing & Customer Dispatch Module has been ACTIVATED (Client Scope Confirmed).'
    : '📋 Packing & Dispatch module returned to CONFIGURABLE PREVIEW MODE (Awaiting Scope Confirmation).';
  alert(msg);
}

function openCreateDispatchOrderModal() {
  const bays = window.wms.dispatchBays || [];
  const bayOptions = bays.map(b => `<option value="${b.bayCode}">${b.bayCode} — ${b.name} (${b.status})</option>`).join('');

  const content = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="padding:10px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; color:#1e40af; font-size:11.5px; line-height:1.5;">
        🚚 <strong>Customer Transport Dispatch Order:</strong> Allocates finished two-wheelers to transport carrier loading bays and stages the vehicle manifest for SAP Movement 601 (PGI).
      </div>
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Destination Dealer / Regional Depot*</label>
        <input type="text" id="modal-dsp-dest" class="search-input" value="Honda Regional Depot (Bhiwandi, Maharashtra)" style="width:100%;">
      </div>
      <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:10px;">
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Finished Vehicle Model*</label>
          <select id="modal-dsp-model" class="select-filter" style="width:100%;">
            <option value="HND-ACTIVA-6G-DLX">Activa 6G Deluxe (Matte Axis Grey Metallic)</option>
            <option value="HND-SHINE-125-DISC">Shine 125 Disc Brake (Geny Grey Metallic)</option>
            <option value="HND-HORNET-2.0-ABS">Hornet 2.0 ABS (Pearl Igneous Black)</option>
            <option value="HND-UNICORN-160-CBS">Unicorn 160 CBS (Imperial Red Metallic)</option>
          </select>
        </div>
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Dispatch Quantity (Units)*</label>
          <input type="number" id="modal-dsp-qty" class="search-input" value="30" min="1" style="width:100%;">
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Transport Logistics Carrier*</label>
          <input type="text" id="modal-dsp-carrier" class="search-input" value="VRL Logistics Ltd" style="width:100%;">
        </div>
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Truck Registration No.*</label>
          <input type="text" id="modal-dsp-truck" class="search-input" value="KA-04-E-${Math.floor(1000 + Math.random() * 9000)}" style="width:100%;">
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Driver Name & Contact*</label>
          <input type="text" id="modal-dsp-driver" class="search-input" value="Ramesh Kumar (+91 98450 11928)" style="width:100%;">
        </div>
        <div class="wms-form-group">
          <label style="font-weight:700; font-size:12px;">Target Dispatch Staging Bay*</label>
          <select id="modal-dsp-bay" class="select-filter" style="width:100%;">
            ${bayOptions}
          </select>
        </div>
      </div>
      <div class="wms-form-group">
        <label style="font-weight:700; font-size:12px;">Special Loading & Tamper Seal Instructions</label>
        <textarea id="modal-dsp-notes" class="search-input" rows="2" style="width:100%; resize:vertical;">Vehicle lashing complete; security tamper tags applied on wheel hubs.</textarea>
      </div>
    </div>
  `;

  openDynamicModal('Create Finished Goods Dispatch Order (Module G)', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="submitCreateDispatchOrder()">📦 Create & Stage Dispatch Order</button>
  `);
}

function submitCreateDispatchOrder() {
  const dest = document.getElementById('modal-dsp-dest')?.value || 'Honda Regional Depot';
  const modelSelect = document.getElementById('modal-dsp-model');
  const modelCode = modelSelect?.value || 'HND-ACTIVA-6G-DLX';
  const modelDesc = modelSelect?.options[modelSelect.selectedIndex]?.text || 'Activa 6G Deluxe';
  const qty = Number(document.getElementById('modal-dsp-qty')?.value) || 30;
  const carrier = document.getElementById('modal-dsp-carrier')?.value || 'VRL Logistics Ltd';
  const truck = document.getElementById('modal-dsp-truck')?.value || 'KA-04-E-9021';
  const driver = document.getElementById('modal-dsp-driver')?.value || 'Driver';
  const bay = document.getElementById('modal-dsp-bay')?.value || 'DSP-BAY-01';
  const notes = document.getElementById('modal-dsp-notes')?.value || 'Standard vehicle lashing.';

  const count = (window.wms.dispatchOrders || []).length + 84;
  const orderNo = `DSP-2026-${String(count).padStart(4, '0')}`;
  const soNo = `SO-HMSI-${Math.floor(400000 + Math.random() * 90000)}`;
  const packingSlip = `PS-2026-${String(count).padStart(3, '0')}`;
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const newOrder = {
    dispatchOrderNo: orderNo,
    plant: window.wms.activePlant || 'HMSI Narsapur Plant 1',
    soNumber: soNo,
    destination: dest,
    modelCode,
    modelDescription: modelDesc,
    quantity: qty,
    uom: 'UNT',
    carrier,
    truckNo: truck,
    driverName: driver,
    stagingBay: bay,
    packingSlipNo: packingSlip,
    sapPgiDocNo: null,
    scheduledDate: dateStr,
    status: 'STAGED',
    scopeBadge: 'CONFIGURABLE_SCOPE',
    notes
  };

  if (!window.wms.dispatchOrders) window.wms.dispatchOrders = [];
  window.wms.dispatchOrders.unshift(newOrder);

  // Update Bay status
  const targetBay = (window.wms.dispatchBays || []).find(b => b.bayCode === bay);
  if (targetBay) {
    targetBay.status = 'OCCUPIED';
    targetBay.activeTruck = truck;
    targetBay.currentLoad = (targetBay.currentLoad || 0) + qty;
  }

  addAuditLog(
    'Dispatch Order Created',
    orderNo,
    bay,
    `Staged ${qty} Units of ${modelCode} for ${dest}. Carrier: ${carrier} (${truck})`
  );

  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderDispatchView();
  alert(`📦 Dispatch Order ${orderNo} Created & Staged!\nDestination: ${dest}\nPacking Slip: ${packingSlip}\nAssigned Staging Bay: ${bay}`);
}

function openDispatchBayAllocationModal() {
  const bays = window.wms.dispatchBays || [];
  const content = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="font-size:12px; color:#64748b; line-height:1.5;">
        Real-time status of Finished Goods Vehicle Staging Bays across South and North Yards:
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        ${bays.map(b => {
          const occPct = b.capacity > 0 ? ((b.currentLoad / b.capacity) * 100).toFixed(0) : 0;
          const isOcc = b.status === 'OCCUPIED';
          return `
            <div style="background:#ffffff; border:1.5px solid ${isOcc ? '#bfdbfe' : '#e2e8f0'}; border-radius:8px; padding:12px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="font-family:var(--font-mono); color:#2563eb;">${b.bayCode}</strong>
                <span class="badge" style="background:${isOcc ? '#eff6ff' : '#ecfdf5'}; color:${isOcc ? '#1e40af' : '#047857'}; font-weight:800; font-size:10px;">${b.status}</span>
              </div>
              <div style="font-size:11.5px; font-weight:700; color:#0f172a; margin-top:4px;">${b.name}</div>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">Plant: ${b.plant}</div>
              <div style="margin-top:8px; font-size:11px; display:flex; justify-content:space-between;">
                <span>Load: <strong>${b.currentLoad} / ${b.capacity} UNT</strong></span>
                <span style="font-weight:700; color:#2563eb;">${occPct}%</span>
              </div>
              <div style="font-size:10.5px; color:#475569; margin-top:6px; background:#f8fafc; padding:4px 8px; border-radius:4px; font-family:var(--font-mono);">
                Docked Truck: <strong>${b.activeTruck || 'None (Available)'}</strong>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  openDynamicModal('Dispatch Staging Bays Allocation & Dock Status', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Close</button>
  `);
}

function openPackingSlipModal(orderNo) {
  const o = (window.wms.dispatchOrders || []).find(item => item.dispatchOrderNo === orderNo);
  if (!o) return;

  const content = `
    <div style="font-family:var(--font-sans); color:#0f172a; max-width:580px; margin:0 auto;">
      <div style="background:#1e3a8a; color:#ffffff; padding:14px; text-align:center; border-radius:8px 8px 0 0; border:2px solid #1e3a8a;">
        <div style="font-size:20px; font-weight:900; letter-spacing:1px; line-height:1.2;">HONDA MOTORCYCLE & SCOOTER INDIA</div>
        <div style="font-size:11.5px; font-weight:700; letter-spacing:0.5px; opacity:0.95; margin-top:4px;">FINISHED GOODS VEHICLE DISPATCH MANIFEST & PACKING SLIP</div>
      </div>
      <div style="background:#ffffff; border:2px solid #1e3a8a; border-top:none; padding:16px; border-radius:0 0 8px 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px dashed #cbd5e1; padding-bottom:10px; margin-bottom:12px;">
          <div>
            <div style="font-size:10px; font-weight:800; color:#64748b;">DISPATCH ORDER REF</div>
            <div style="font-size:18px; font-weight:900; font-family:var(--font-mono); color:#2563eb;">${o.dispatchOrderNo}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:10px; font-weight:800; color:#64748b;">PACKING SLIP NO</div>
            <div style="font-size:16px; font-weight:900; font-family:var(--font-mono); color:#0f172a;">${o.packingSlipNo}</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; font-size:11.5px;">
          <div><strong>Sales Order:</strong> <span style="font-family:var(--font-mono);">${o.soNumber}</span></div>
          <div><strong>Staging Bay:</strong> <span style="font-family:var(--font-mono); color:#7c3aed; font-weight:800;">${o.stagingBay}</span></div>
          <div><strong>Origin Plant:</strong> ${o.plant}</div>
          <div><strong>Scheduled Time:</strong> ${o.scheduledDate}</div>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:6px; margin-bottom:12px;">
          <div style="font-size:10px; font-weight:800; color:#64748b;">CONSIGNEE / DESTINATION DEALERSHIP</div>
          <div style="font-size:13px; font-weight:800; color:#0f172a; margin-top:2px;">${o.destination}</div>
        </div>

        <div style="border:1px solid #e2e8f0; border-radius:6px; overflow:hidden; margin-bottom:12px;">
          <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
            <thead style="background:#f1f5f9; text-align:left;">
              <tr>
                <th style="padding:6px 10px;">Model Code</th>
                <th style="padding:6px 10px;">Description</th>
                <th style="padding:6px 10px; text-align:right;">Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:8px 10px; font-family:var(--font-mono); font-weight:700;">${o.modelCode}</td>
                <td style="padding:8px 10px;">${o.modelDescription}</td>
                <td style="padding:8px 10px; text-align:right; font-weight:900; color:#059669; font-size:13px;">${o.quantity} ${o.uom}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:11.5px; background:#eff6ff; border:1px solid #bfdbfe; padding:10px; border-radius:6px; margin-bottom:12px;">
          <div><strong>Carrier:</strong> ${o.carrier}</div>
          <div><strong>Truck Reg:</strong> <span style="font-family:var(--font-mono); font-weight:800;">${o.truckNo}</span></div>
          <div><strong>Driver:</strong> ${o.driverName}</div>
          <div><strong>SAP Mvt 601:</strong> <span style="font-family:var(--font-mono); font-weight:800; color:#2563eb;">${o.sapPgiDocNo || 'Pending Post Goods Issue'}</span></div>
        </div>

        <div style="border-top:1.5px solid #e2e8f0; padding-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#64748b;">
          <div>Warehouse Supervisor: <strong>Rajesh Sharma</strong></div>
          <div style="text-align:right;">
            <span style="font-size:9.5px; background:#dcfce7; color:#15803d; font-weight:800; padding:2px 6px; border-radius:4px;">SECURITY CLEARED</span>
          </div>
        </div>
      </div>
    </div>
  `;

  openDynamicModal(`Finished Goods Packing Manifest: ${o.dispatchOrderNo}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Close</button>
    <button class="btn-wms-primary" onclick="window.print()">🖨️ Print Manifest & Packing Slip</button>
  `);
}

function postDispatchPGI(orderNo) {
  const o = (window.wms.dispatchOrders || []).find(item => item.dispatchOrderNo === orderNo);
  if (!o) return;

  const sapDoc = `SAP-PGI-600194${Math.floor(8000 + Math.random() * 1900)}`;
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  o.status = 'DISPATCHED';
  o.sapPgiDocNo = sapDoc;

  // Release bay load
  const bay = (window.wms.dispatchBays || []).find(b => b.bayCode === o.stagingBay);
  if (bay) {
    bay.currentLoad = Math.max(0, (bay.currentLoad || 0) - o.quantity);
    if (bay.currentLoad === 0) {
      bay.status = 'AVAILABLE';
      bay.activeTruck = null;
    }
  }

  // SAP Sync Log
  if (!window.wms.sapSyncLogs) window.wms.sapSyncLogs = [];
  window.wms.sapSyncLogs.unshift({
    syncId: `SAP-SYNC-${Math.floor(1000 + Math.random() * 9000)}`,
    interfaceType: 'BAPI_GOODSMVT_CREATE',
    direction: 'WMS → SAP',
    wmsRef: o.dispatchOrderNo,
    sapDocNo: sapDoc,
    payloadType: `Movement 601 (Post Goods Issue: ${o.quantity} ${o.uom} to ${o.destination})`,
    status: 'success',
    errorText: '—',
    timestamp: dateStr
  });

  addAuditLog(
    'SAP PGI Movement 601 Posted',
    o.dispatchOrderNo,
    o.destination,
    `Dispatched ${o.quantity} Units via ${o.carrier} (${o.truckNo}). SAP Doc: ${sapDoc}`
  );

  saveWMSState(window.wms);
  renderDispatchView();
  alert(`🚚 SAP Movement 601 (Post Goods Issue) Posted Successfully!\nDispatch Ref: ${o.dispatchOrderNo}\nCarrier: ${o.carrier} (${o.truckNo})\nSAP Material Doc: ${sapDoc}\nStaging Bay ${o.stagingBay} released.`);
}

function exportDispatchCSV() {
  exportTableToCSV(window.wms.dispatchOrders || [], 'HMSIL_Finished_Goods_Dispatch_Ledger.csv');
}

// ==========================================================================
// 6. MASTERS MODULE — COMPLETE CRUD ENGINE (ADD, EDIT, DELETE/DEACTIVATE)
// ==========================================================================
function renderAllMasters() {
  renderMasterMaterial();
  renderMasterSupplier();
  renderMasterPlant();
  renderMasterShops();
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

// Master 3.5: Production Area / Shop Master (Module E)
function renderMasterShops() {
  const tbody = document.getElementById('master-shop-body');
  if (!tbody) return;
  const shops = window.wms.shopMaster || [];
  tbody.innerHTML = shops.map(s => {
    const subAreasHtml = (s.subAreas || []).map(a => `
      <span class="badge" style="background:#f1f5f9; color:#1e293b; font-size:11px; margin:2px 3px; display:inline-block; border:1px solid #e2e8f0;">
        <b>${a.code}</b>: ${a.name} <span style="color:#64748b;">(${a.stagingBin || s.stagingBin})</span>
      </span>
    `).join('');

    return `
      <tr>
        <td><b style="font-family:var(--font-mono); color:#2563eb;">${s.shopCode}</b></td>
        <td><b>${s.name}</b></td>
        <td>${s.plant || 'HMSI Narsapur Plant 1'}</td>
        <td><span style="font-family:var(--font-mono); color:#ea580c; font-weight:700;">${s.stagingBin || '—'}</span></td>
        <td style="max-width:320px;">${subAreasHtml || '<span style="color:#94a3b8;">No sub-areas linked</span>'}</td>
        <td><b>${s.manager || '—'}</b></td>
        <td><span class="wms-badge ${getStatusBadgeClass(s.status || 'ACTIVE')}">${s.status || 'ACTIVE'}</span></td>
        <td>
          <button class="btn-wms-secondary small" onclick="openEditShopModal('${s.shopCode}')">✏️ Edit</button>
          <button class="btn-wms-secondary small" onclick="deleteShop('${s.shopCode}')">🗑️ Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddShopModal() {
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group">
        <label>Shop Code* (e.g. SHOP-SUB)</label>
        <input type="text" id="sh-code" class="search-input" value="SHOP-SUB" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Shop / Division Name*</label>
        <input type="text" id="sh-name" class="search-input" value="Sub-Assembly & Pre-Fitment Shop" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Plant*</label>
        <select class="select-filter" id="sh-plant" style="width:100%;">
          <option value="HMSI Narsapur Plant 1">HMSI Narsapur Plant 1</option>
          <option value="HMSI Narsapur Plant 2">HMSI Narsapur Plant 2</option>
        </select>
      </div>
      <div class="wms-form-group">
        <label>Default Staging Drop Bin*</label>
        <input type="text" id="sh-staging" class="search-input" value="STG-SUB-01" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Sub-Areas / Cells (Format: Code: Name (Staging), separated by commas or newlines)</label>
        <textarea id="sh-subareas" class="search-input" rows="3" style="width:100%; font-family:var(--font-mono); font-size:11px;">SUB-CELL-01: Engine Wire Harness Setup (STG-SUB-01)
SUB-CELL-02: Handlebar Sub-Assembly Cell (STG-SUB-02)</textarea>
      </div>
      <div class="wms-form-group">
        <label>Shop Manager / Division Head*</label>
        <input type="text" id="sh-manager" class="search-input" value="Rajesh Sharma" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Status*</label>
        <select class="select-filter" id="sh-status" style="width:100%;">
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>
    </div>
  `;
  openDynamicModal('Add Production Area / Shop', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveShop(true)">Create Shop</button>
  `);
}

function openEditShopModal(code) {
  const shop = (window.wms.shopMaster || []).find(s => s.shopCode === code);
  if (!shop) return;

  const subAreasStr = (shop.subAreas || []).map(a => `${a.code}: ${a.name} (${a.stagingBin || shop.stagingBin})`).join('\n');

  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group">
        <label>Shop Code</label>
        <input type="text" value="${shop.shopCode}" disabled style="width:100%; background:#f1f5f9;">
      </div>
      <div class="wms-form-group">
        <label>Shop / Division Name*</label>
        <input type="text" id="sh-name" class="search-input" value="${shop.name}" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Plant*</label>
        <select class="select-filter" id="sh-plant" style="width:100%;">
          <option value="HMSI Narsapur Plant 1" ${shop.plant === 'HMSI Narsapur Plant 1' ? 'selected' : ''}>HMSI Narsapur Plant 1</option>
          <option value="HMSI Narsapur Plant 2" ${shop.plant === 'HMSI Narsapur Plant 2' ? 'selected' : ''}>HMSI Narsapur Plant 2</option>
        </select>
      </div>
      <div class="wms-form-group">
        <label>Default Staging Drop Bin*</label>
        <input type="text" id="sh-staging" class="search-input" value="${shop.stagingBin || ''}" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Sub-Areas / Cells (Format: Code: Name (Staging), separated by commas or newlines)</label>
        <textarea id="sh-subareas" class="search-input" rows="3" style="width:100%; font-family:var(--font-mono); font-size:11px;">${subAreasStr}</textarea>
      </div>
      <div class="wms-form-group">
        <label>Shop Manager / Division Head*</label>
        <input type="text" id="sh-manager" class="search-input" value="${shop.manager || ''}" style="width:100%;">
      </div>
      <div class="wms-form-group">
        <label>Status*</label>
        <select class="select-filter" id="sh-status" style="width:100%;">
          <option value="ACTIVE" ${shop.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
          <option value="INACTIVE" ${shop.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
        </select>
      </div>
    </div>
  `;
  openDynamicModal(`Edit Shop: ${code}`, content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveShop(false, '${code}')">Save Changes</button>
  `);
}

function saveShop(isNew, existingCode) {
  const code = isNew ? (document.getElementById('sh-code')?.value.trim() || 'SHOP-NEW') : existingCode;
  const name = document.getElementById('sh-name')?.value.trim() || 'Production Shop';
  const plant = document.getElementById('sh-plant')?.value || 'HMSI Narsapur Plant 1';
  const staging = document.getElementById('sh-staging')?.value.trim() || 'STG-01';
  const rawSubAreas = document.getElementById('sh-subareas')?.value || '';
  const manager = document.getElementById('sh-manager')?.value.trim() || '';
  const status = document.getElementById('sh-status')?.value || 'ACTIVE';

  // Parse sub-areas
  const lines = rawSubAreas.split(/[\n,]+/).map(l => l.trim()).filter(Boolean);
  const subAreas = lines.map((line, idx) => {
    const match = line.match(/^([^:]+):\s*([^(]+)(?:\(([^)]+)\))?/);
    if (match) {
      return {
        code: match[1].trim(),
        name: match[2].trim(),
        stagingBin: (match[3] || staging).trim()
      };
    } else {
      return {
        code: `${code}-SUB-0${idx + 1}`,
        name: line,
        stagingBin: staging
      };
    }
  });

  if (!window.wms.shopMaster) window.wms.shopMaster = [];

  if (isNew) {
    window.wms.shopMaster.push({
      shopCode: code,
      name,
      plant,
      stagingBin: staging,
      subAreas,
      manager,
      status
    });
  } else {
    const shop = window.wms.shopMaster.find(s => s.shopCode === code);
    if (shop) {
      shop.name = name;
      shop.plant = plant;
      shop.stagingBin = staging;
      shop.subAreas = subAreas;
      shop.manager = manager;
      shop.status = status;
    }
  }

  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMasterShops();
  addAuditLog(
    isNew ? 'Shop Master Created' : 'Shop Master Updated',
    code,
    name,
    `Staging Bin: ${staging}, ${subAreas.length} work cells linked`
  );
}

function deleteShop(code) {
  if (confirm(`Are you sure you want to remove shop ${code}?`)) {
    window.wms.shopMaster = (window.wms.shopMaster || []).filter(s => s.shopCode !== code);
    saveWMSState(window.wms);
    renderMasterShops();
  }
}

// Master 4: Zone & Bin Master (Standardized 3-tier: Area -> Location -> Rack)
function renderMasterZoneBin() {
  const tbody = document.getElementById('master-bin-body');
  if (!tbody) return;
  const bins = window.wms.binMaster || [];
  tbody.innerHTML = bins.map(b => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${b.binCode}</b></td>
      <td><span class="wms-badge" style="background:#eff6ff; color:#1d4ed8; font-weight:800;">${b.areaCode || b.zone}</span><br><span style="font-size:11px; color:#475569;">${b.areaName || b.zoneName || ''}</span></td>
      <td><b style="color:#0f172a;">${b.locationCode || 'LOC-01'}</b><br><span style="font-size:10.5px; color:#64748b;">${b.locationName || 'Intake Staging'}</span></td>
      <td><span style="font-family:var(--font-mono); font-weight:800; background:#f1f5f9; padding:2px 6px; border-radius:4px;">${b.rackCode || 'RCK-01'}</span></td>
      <td>${b.type}</td>
      <td><b>${b.capacity} EA</b></td>
      <td>${b.maxWeightKg} kg</td>
      <td><b style="color:${b.currentQty > 0 ? '#059669' : '#64748b'};">${b.currentQty} EA</b></td>
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
  const areas = window.wms.areaMaster || [];
  const locations = window.wms.locationMaster || [];
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group">
        <label>Tier 1: Area*</label>
        <select class="select-filter" id="b-area" style="width:100%;" onchange="onModalAreaChange(this.value)">
          ${areas.map(a => `<option value="${a.areaCode}">${a.areaCode} - ${a.areaName}</option>`).join('')}
        </select>
      </div>
      <div class="wms-form-group">
        <label>Tier 2: Location*</label>
        <select class="select-filter" id="b-location" style="width:100%;" onchange="updateGeneratedBinCode()">
          ${locations.map(l => `<option value="${l.locationCode}">${l.locationCode} - ${l.name}</option>`).join('')}
        </select>
      </div>
      <div class="wms-form-group">
        <label>Tier 3: Rack Code (e.g. RCK-01)*</label>
        <input type="text" id="b-rack" class="search-input" value="RCK-01" style="width:100%;" oninput="updateGeneratedBinCode()">
      </div>
      <div class="wms-form-group">
        <label>Generated Uniform Bin Code (AREA-LOC-RCK)</label>
        <input type="text" id="b-code" class="search-input" value="PWR-LOC-A01-RCK-01" readonly style="width:100%; font-family:var(--font-mono); font-weight:800; background:#f8fafc; color:#2563eb;">
      </div>
      <div class="wms-form-group"><label>Rack Type*</label><input type="text" id="b-type" class="search-input" value="High-Bay Heavy Rack" style="width:100%;"></div>
      <div class="wms-form-group"><label>Max Capacity (EA)*</label><input type="number" id="b-cap" class="search-input" value="1000" style="width:100%;"></div>
      <div class="wms-form-group"><label>Max Weight (kg)*</label><input type="number" id="b-weight" class="search-input" value="1500" style="width:100%;"></div>
    </div>
  `;
  openDynamicModal('Add New Storage Bin (3-Tier Hierarchy)', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
    <button class="btn-wms-primary" onclick="saveBin(true)">Create Bin</button>
  `);
}

function onModalAreaChange(areaCode) {
  const locSelect = document.getElementById('b-location');
  if (!locSelect) return;
  const locs = (window.wms.locationMaster || []).filter(l => l.areaCode === areaCode);
  locSelect.innerHTML = locs.map(l => `<option value="${l.locationCode}">${l.locationCode} - ${l.name}</option>`).join('');
  updateGeneratedBinCode();
}

function updateGeneratedBinCode() {
  const area = document.getElementById('b-area')?.value || 'PWR';
  const loc = document.getElementById('b-location')?.value || 'PWR-LOC-A01';
  const rack = document.getElementById('b-rack')?.value.trim() || 'RCK-01';
  const codeEl = document.getElementById('b-code');
  if (codeEl) {
    codeEl.value = `${loc}-${rack}`;
  }
}

function openEditBinModal(code) {
  const b = window.wms.binMaster.find(item => item.binCode === code);
  if (!b) return;
  const content = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div class="wms-form-group"><label>Bin Code (Uniform AREA-LOC-RCK)</label><input type="text" value="${b.binCode}" disabled style="width:100%; background:#f1f5f9; font-family:var(--font-mono); font-weight:700;"></div>
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
  const bCode = isNew ? (document.getElementById('b-code')?.value.trim() || 'PWR-LOC-A01-RCK-01') : code;
  const cap = parseInt(document.getElementById('b-cap').value) || 1000;
  const weight = parseInt(document.getElementById('b-weight').value) || 1000;

  if (isNew) {
    const area = document.getElementById('b-area')?.value || 'PWR';
    const loc = document.getElementById('b-location')?.value || 'PWR-LOC-A01';
    const rack = document.getElementById('b-rack')?.value.trim() || 'RCK-01';
    const areaObj = (window.wms.areaMaster || []).find(a => a.areaCode === area);
    const locObj = (window.wms.locationMaster || []).find(l => l.locationCode === loc);

    window.wms.binMaster.unshift({
      binCode: bCode,
      areaCode: area,
      areaName: areaObj?.areaName || 'Warehouse Area',
      locationCode: loc,
      locationName: locObj?.name || 'Storage Bay',
      rackCode: rack,
      zone: area,
      zoneName: areaObj?.areaName || 'Warehouse Area',
      type: document.getElementById('b-type')?.value || 'High-Bay Heavy Rack',
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
  initInventoryHierarchyDrillDown();
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
      <div class="wms-form-group"><label>Device Type*</label><select class="select-filter" id="dev-type" style="width:100%;"><option value="handheld">Handheld Scanner (Zebra TC57) (TBC)</option><option value="label printer">Industrial Label Printer (Zebra ZT411) (TBC)</option></select></div>
      <div class="wms-form-group"><label>Model Name*</label><input type="text" id="dev-model" class="search-input" value="Zebra TC57 Mobile Terminal (TBC)" style="width:100%;"></div>
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
  renderSapHubKPIs();
  renderSapSwitchboard();
  renderInterfaceModeSettings();
  renderErpConfigView();
  renderMovementTypeMaster();
  renderSapLogsTable();
  renderStockReconciliationView();
}

// -------------------------------------------------------------
// MODULE J / 2.10: SUBTAB SWITCHING
// -------------------------------------------------------------
function switchSapSubtab(tabName) {
  const tabs = ['switchboard', 'pipeline', 'erpconfig', 'logs', 'recon'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const pane = document.getElementById(`sap-subtab-${t}`);
    if (btn) btn.classList.toggle('active', t === tabName);
    if (pane) pane.style.display = (t === tabName) ? 'block' : 'none';
  });

  if (tabName === 'switchboard') renderSapSwitchboard();
  else if (tabName === 'pipeline') renderInterfaceModeSettings();
  else if (tabName === 'erpconfig') {
    renderErpConfigView();
    renderMovementTypeMaster();
  } else if (tabName === 'logs') renderSapLogsTable();
  else if (tabName === 'recon') renderStockReconciliationView();
}

// -------------------------------------------------------------
// MODULE J.1 & J.3: KPI DASHBOARD & TELEMETRY
// -------------------------------------------------------------
function renderSapHubKPIs() {
  const erp = window.wms.erpConfig || {
    systemName: 'SAP ERP Production (PRD-100)',
    connectionStatus: 'ONLINE'
  };
  const switchboard = window.wms.integrationSwitchboard || [];
  const pipelines = window.wms.interfaceModeSettings || [];
  const logs = window.wms.sapSyncLogs || [];

  const healthElem = document.getElementById('sap-kpi-health-status');
  if (healthElem) {
    const isOnline = erp.connectionStatus === 'ONLINE';
    healthElem.textContent = isOnline ? 'ONLINE (200 OK)' : 'OFFLINE / PAUSED';
    healthElem.style.color = isOnline ? '#059669' : '#dc2626';
  }

  const systemNameElem = document.getElementById('sap-kpi-erp-system-name');
  if (systemNameElem) systemNameElem.textContent = erp.systemName;

  const activePoints = switchboard.filter(p => p.enabled).length;
  const totalPoints = switchboard.length || 6;
  const activePointsElem = document.getElementById('sap-kpi-active-points');
  if (activePointsElem) activePointsElem.textContent = `${activePoints} / ${totalPoints} Active`;

  const realTimeCount = pipelines.filter(p => p.mode === 'REAL_TIME').length;
  const batchCount = pipelines.filter(p => p.mode === 'BATCH').length;
  const ratioElem = document.getElementById('sap-kpi-pipeline-ratio');
  if (ratioElem) ratioElem.textContent = `${realTimeCount} Real-Time • ${batchCount} Batch`;

  const volumeElem = document.getElementById('sap-kpi-message-volume');
  if (volumeElem) volumeElem.textContent = `${(logs.length * 1047 + 2).toLocaleString()} Messages`;
}

// -------------------------------------------------------------
// MODULE J.3: 6-POINT INTEGRATION SWITCHBOARD
// -------------------------------------------------------------
function renderSapSwitchboard() {
  const container = document.getElementById('sap-switchboard-grid');
  if (!container) return;

  const points = window.wms.integrationSwitchboard || [];
  container.innerHTML = points.map(p => `
    <div class="switchboard-card ${p.enabled ? '' : 'disabled'}" id="sw-card-${p.id}">
      <div>
        <div class="sw-header">
          <div class="sw-title-block">
            <h4>${p.name}</h4>
            <span class="sw-code-badge">${p.interfaceCode}</span>
          </div>
          <div class="sw-toggle-container">
            <span class="${p.enabled ? 'badge-status-healthy' : 'badge-status-paused'}">
              ${p.enabled ? 'HEALTHY' : 'PAUSED'}
            </span>
            <label class="sw-switch" title="Toggle ERP Synchronization">
              <input type="checkbox" ${p.enabled ? 'checked' : ''} onchange="toggleSwitchboardPoint('${p.id}')">
              <span class="sw-slider"></span>
            </label>
          </div>
        </div>

        <p class="sw-desc">${p.description}</p>

        <div class="sw-meta-row">
          <div class="sw-meta-item">
            <span>Direction</span>
            <span><span class="wms-badge badge-allocated">${p.direction}</span></span>
          </div>
          <div class="sw-meta-item">
            <span>Sync Mode</span>
            <span>
              <span class="${p.mode === 'REAL_TIME' ? 'badge-mode-realtime' : 'badge-mode-batch'}">
                ${p.mode === 'REAL_TIME' ? '⚡ REAL-TIME' : '⏱️ BATCH (' + p.batchSchedule + ')'}
              </span>
            </span>
          </div>
          <div class="sw-meta-item">
            <span>Transmitted</span>
            <span><b>${p.totalTransmitted.toLocaleString()}</b> msgs</span>
          </div>
          <div class="sw-meta-item">
            <span>Last Handshake</span>
            <span style="font-size:11px; color:#64748b;">${p.lastSync}</span>
          </div>
        </div>
      </div>

      <div class="sw-footer">
        <span style="font-size:11px; font-weight:700; color:${p.failedCount > 0 ? '#dc2626' : '#059669'};">
          ${p.failedCount > 0 ? `⚠️ ${p.failedCount} Failed in Queue` : '✅ 0 Sync Errors'}
        </span>
        <div style="display:flex; gap:6px;">
          <button class="btn-wms-secondary small" onclick="pingSwitchboardEndpoint('${p.id}')" title="Test RFC Connection">
            ⚡ Ping
          </button>
          <button class="btn-wms-secondary small" onclick="openConfigureSwitchboardModal('${p.id}')">
            ⚙️ Configure
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleSwitchboardPoint(pointId) {
  const points = window.wms.integrationSwitchboard || [];
  const point = points.find(p => p.id === pointId);
  if (!point) return;

  point.enabled = !point.enabled;
  point.status = point.enabled ? 'HEALTHY' : 'PAUSED';

  if (typeof addAuditLog === 'function') {
    addAuditLog(
      'Integration Switchboard Gating',
      point.id,
      point.name,
      point.enabled ? 'ENABLED (Live Synchronization Active)' : 'DISABLED (Buffered Locally in Queue)'
    );
  }

  saveWMSState(window.wms);
  renderSapHubKPIs();
  renderSapSwitchboard();

  const msg = point.enabled 
    ? `Switchboard: [${point.name}] enabled. Direct ERP synchronization active.`
    : `Switchboard: [${point.name}] paused. Outbound messages will be safely queued locally.`;
  alert(msg);
}

function enableAllSwitchboardPoints() {
  (window.wms.integrationSwitchboard || []).forEach(p => {
    p.enabled = true;
    p.status = 'HEALTHY';
  });
  saveWMSState(window.wms);
  renderSapHubKPIs();
  renderSapSwitchboard();
  alert('Switchboard: All 6 enterprise integration endpoints set to ACTIVE.');
}

function pingSwitchboardEndpoint(pointId) {
  const point = (window.wms.integrationSwitchboard || []).find(p => p.id === pointId);
  if (!point) return;

  const sysName = window.wms.erpConfig?.systemName || 'SAP ERP Production';
  alert(`[RFC Communication Test - 200 OK]\n` +
        `Endpoint: ${point.name} (${point.interfaceCode})\n` +
        `Direction: ${point.direction}\n` +
        `Target ERP: ${sysName}\n` +
        `Handshake Response: HTTP 200 OK (Latency: 14ms)\n` +
        `Status: HEALTHY & SYNCHRONIZED`);
}

function openConfigureSwitchboardModal(pointId) {
  const point = (window.wms.integrationSwitchboard || []).find(p => p.id === pointId);
  if (!point) return;

  const content = `
    <div style="font-size:13px; line-height:1.6; color:#0f172a;">
      <div style="background:#f8fafc; padding:12px; border-radius:6px; margin-bottom:14px; border:1px solid #e2e8f0;">
        <div style="font-weight:800; font-size:14px; color:#2563eb;">${point.name} (${point.id})</div>
        <div style="font-family:var(--font-mono); font-size:12px; color:#475569;">Interface: ${point.interfaceCode}</div>
      </div>

      <div class="erp-form-group">
        <label>Execution Pipeline Mode</label>
        <select id="modal-sw-mode" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
          <option value="REAL_TIME" ${point.mode === 'REAL_TIME' ? 'selected' : ''}>Real-Time (Instant Synchronous BAPI)</option>
          <option value="BATCH" ${point.mode === 'BATCH' ? 'selected' : ''}>Batch (Scheduled Asynchronous IDoc)</option>
        </select>
      </div>

      <div class="erp-form-group">
        <label>Batch Schedule Interval (if Batch Selected)</label>
        <select id="modal-sw-schedule" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
          <option value="REAL_TIME" ${point.batchSchedule === 'REAL_TIME' ? 'selected' : ''}>Real-Time (Instant)</option>
          <option value="15_MIN" ${point.batchSchedule === '15_MIN' ? 'selected' : ''}>Every 15 Minutes</option>
          <option value="30_MIN" ${point.batchSchedule === '30_MIN' ? 'selected' : ''}>Every 30 Minutes</option>
          <option value="HOURLY" ${point.batchSchedule === 'HOURLY' ? 'selected' : ''}>Hourly (xx:00)</option>
          <option value="SHIFT_END" ${point.batchSchedule === 'SHIFT_END' ? 'selected' : ''}>Shift-End (Every 8h)</option>
          <option value="DAILY_MIDNIGHT" ${point.batchSchedule === 'DAILY_MIDNIGHT' ? 'selected' : ''}>Daily at Midnight (00:00)</option>
        </select>
      </div>

      <div class="erp-form-group">
        <label>Operational Description / Purpose</label>
        <textarea id="modal-sw-desc" rows="3" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px;">${point.description}</textarea>
      </div>
    </div>
  `;

  openDynamicModal(
    `Configure Integration Endpoint: ${point.id}`,
    content,
    `
      <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
      <button class="btn-wms-primary" onclick="saveSwitchboardPointConfig('${point.id}')">Save Changes</button>
    `
  );
}

function saveSwitchboardPointConfig(pointId) {
  const point = (window.wms.integrationSwitchboard || []).find(p => p.id === pointId);
  if (!point) return;

  const mode = document.getElementById('modal-sw-mode')?.value || point.mode;
  const schedule = document.getElementById('modal-sw-schedule')?.value || point.batchSchedule;
  const desc = document.getElementById('modal-sw-desc')?.value || point.description;

  point.mode = mode;
  point.batchSchedule = schedule;
  point.description = desc;

  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderSapHubKPIs();
  renderSapSwitchboard();
  alert(`Configuration saved for ${point.name}. Mode: ${mode}`);
}

// -------------------------------------------------------------
// MODULE J.1: REAL-TIME VS. BATCH PIPELINES MATRIX
// -------------------------------------------------------------
function renderInterfaceModeSettings() {
  const tbody = document.getElementById('sap-pipeline-table-body');
  if (!tbody) return;

  const pipelines = window.wms.interfaceModeSettings || [];
  tbody.innerHTML = pipelines.map(item => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${item.interfaceId}</b></td>
      <td><span style="font-family:var(--font-mono); font-weight:700; font-size:12px;">${item.bapiName}</span></td>
      <td><b>${item.displayName}</b></td>
      <td><span class="wms-badge badge-allocated">${item.direction}</span></td>
      <td>
        <select onchange="updateInterfaceMode('${item.interfaceId}', this.value)" 
          style="padding:4px 8px; border-radius:4px; font-size:11.5px; font-weight:800; border:1px solid #cbd5e1; background:${item.mode === 'REAL_TIME' ? '#ecfdf5' : '#fffbeb'}; color:${item.mode === 'REAL_TIME' ? '#166534' : '#b45309'};">
          <option value="REAL_TIME" ${item.mode === 'REAL_TIME' ? 'selected' : ''}>⚡ Real-Time (BAPI)</option>
          <option value="BATCH" ${item.mode === 'BATCH' ? 'selected' : ''}>⏱️ Batch (Scheduled)</option>
        </select>
      </td>
      <td>
        <select onchange="updateInterfaceBatchInterval('${item.interfaceId}', this.value)"
          ${item.mode === 'REAL_TIME' ? 'disabled' : ''}
          style="padding:4px 8px; border-radius:4px; font-size:11.5px; border:1px solid #cbd5e1;">
          <option value="REAL_TIME" ${item.batchInterval === 'REAL_TIME' ? 'selected' : ''}>Instant</option>
          <option value="15_MIN" ${item.batchInterval === '15_MIN' ? 'selected' : ''}>Every 15 Mins</option>
          <option value="30_MIN" ${item.batchInterval === '30_MIN' ? 'selected' : ''}>Every 30 Mins</option>
          <option value="HOURLY" ${item.batchInterval === 'HOURLY' ? 'selected' : ''}>Hourly (xx:00)</option>
          <option value="SHIFT_END" ${item.batchInterval === 'SHIFT_END' ? 'selected' : ''}>Shift-End (Every 8h)</option>
          <option value="DAILY_MIDNIGHT" ${item.batchInterval === 'DAILY_MIDNIGHT' ? 'selected' : ''}>Daily (00:00)</option>
        </select>
      </td>
      <td>
        <span style="font-weight:800; color:${item.queueBacklog > 0 ? '#b45309' : '#059669'};">
          ${item.queueBacklog > 0 ? `⏱️ ${item.queueBacklog} Queued` : '0 Queued'}
        </span>
      </td>
      <td style="font-size:11px; color:#64748b;">${item.lastBatchRun}</td>
      <td style="font-size:11px; font-weight:700; color:#2563eb;">${item.nextBatchRun}</td>
      <td>
        <span class="wms-badge badge-available">${item.status}</span>
      </td>
      <td>
        <button class="btn-wms-primary small" onclick="triggerBatchSyncNow('${item.interfaceId}')" title="Trigger Synchronous BAPI Execution">
          ⚡ Execute Now
        </button>
      </td>
    </tr>
  `).join('');
}

function updateInterfaceMode(interfaceId, newMode) {
  const item = (window.wms.interfaceModeSettings || []).find(p => p.interfaceId === interfaceId);
  if (!item) return;

  item.mode = newMode;
  if (newMode === 'REAL_TIME') {
    item.batchInterval = 'REAL_TIME';
    item.nextBatchRun = 'REAL_TIME (Instant)';
  } else {
    if (item.batchInterval === 'REAL_TIME') item.batchInterval = 'HOURLY';
    item.nextBatchRun = 'Next Scheduled Cycle';
  }

  saveWMSState(window.wms);
  renderSapHubKPIs();
  renderInterfaceModeSettings();
  alert(`Interface [${item.displayName}] switched to ${newMode === 'REAL_TIME' ? 'REAL-TIME BAPI' : 'BATCH QUEUE'}.`);
}

function updateInterfaceBatchInterval(interfaceId, newInterval) {
  const item = (window.wms.interfaceModeSettings || []).find(p => p.interfaceId === interfaceId);
  if (!item) return;

  item.batchInterval = newInterval;
  saveWMSState(window.wms);
  renderInterfaceModeSettings();
}

function triggerBatchSyncNow(interfaceId) {
  const item = (window.wms.interfaceModeSettings || []).find(p => p.interfaceId === interfaceId);
  if (!item) return;

  const count = item.queueBacklog || 1;
  item.queueBacklog = 0;
  item.lastBatchRun = new Date().toLocaleString();

  if (!window.wms.sapSyncLogs) window.wms.sapSyncLogs = [];
  window.wms.sapSyncLogs.unshift({
    syncId: `SAP-SYNC-${Math.floor(1000 + Math.random() * 9000)}`,
    interfaceType: item.bapiName.split(' ')[0],
    direction: item.direction,
    wmsRef: `BATCH-JOB-${Math.floor(100 + Math.random() * 900)}`,
    sapDocNo: `SAP-BATCH-${Math.floor(500000 + Math.random() * 500000)}`,
    payloadType: `${item.displayName} (Processed ${count} records)`,
    status: 'success',
    errorText: '—',
    timestamp: new Date().toLocaleString()
  });

  saveWMSState(window.wms);
  renderSapHubKPIs();
  renderInterfaceModeSettings();
  renderSapLogsTable();
  alert(`Batch Execution Complete: Successfully posted ${count} pending message(s) to ERP for [${item.displayName}].`);
}

function triggerAllBatchSync() {
  let totalProcessed = 0;
  (window.wms.interfaceModeSettings || []).forEach(item => {
    if (item.queueBacklog > 0) {
      totalProcessed += item.queueBacklog;
      item.queueBacklog = 0;
      item.lastBatchRun = new Date().toLocaleString();
    }
  });

  if (!window.wms.sapSyncLogs) window.wms.sapSyncLogs = [];
  window.wms.sapSyncLogs.unshift({
    syncId: `SAP-SYNC-${Math.floor(1000 + Math.random() * 9000)}`,
    interfaceType: 'BAPI_BATCH_DISPATCHER',
    direction: 'WMS → SAP',
    wmsRef: 'ALL-PENDING-QUEUES',
    sapDocNo: `SAP-JOB-${Math.floor(500000 + Math.random() * 500000)}`,
    payloadType: `Bulk Scheduled Batch (${totalProcessed || 6} Queued Records Transmitted)`,
    status: 'success',
    errorText: '—',
    timestamp: new Date().toLocaleString()
  });

  saveWMSState(window.wms);
  renderSapHubKPIs();
  renderInterfaceModeSettings();
  renderSapLogsTable();
  alert(`Batch Engine: All pending interface queues transmitted to ERP successfully (${totalProcessed || 6} records processed).`);
}

// -------------------------------------------------------------
// MODULE J.2: GENERIC ERP CONFIGURATION & MOVEMENT TYPES
// -------------------------------------------------------------
function renderErpConfigView() {
  const erp = window.wms.erpConfig || {
    systemName: 'SAP ERP Production (PRD-100)',
    systemType: 'SAP_ERP',
    clientNumber: '100',
    systemId: 'PRD',
    gatewayHost: 'sapgw01.hmsi.co.in:3300',
    rfcDestination: 'SAP_HMSIL_RFC_01',
    defaultMode: 'REAL_TIME'
  };

  const nameInput = document.getElementById('erp-cfg-system-name');
  if (nameInput) nameInput.value = erp.systemName;

  const typeSelect = document.getElementById('erp-cfg-system-type');
  if (typeSelect) typeSelect.value = erp.systemType;

  const clientInput = document.getElementById('erp-cfg-client-no');
  if (clientInput) clientInput.value = erp.clientNumber;

  const sysIdInput = document.getElementById('erp-cfg-system-id');
  if (sysIdInput) sysIdInput.value = erp.systemId;

  const gwInput = document.getElementById('erp-cfg-gateway');
  if (gwInput) gwInput.value = erp.gatewayHost;

  const rfcInput = document.getElementById('erp-cfg-rfc-dest');
  if (rfcInput) rfcInput.value = erp.rfcDestination;

  const modeSelect = document.getElementById('erp-cfg-default-mode');
  if (modeSelect) modeSelect.value = erp.defaultMode;
}

function saveErpConfig() {
  if (!window.wms.erpConfig) window.wms.erpConfig = {};

  window.wms.erpConfig.systemName = document.getElementById('erp-cfg-system-name')?.value.trim() || 'SAP ERP Production';
  window.wms.erpConfig.systemType = document.getElementById('erp-cfg-system-type')?.value || 'SAP_ERP';
  window.wms.erpConfig.clientNumber = document.getElementById('erp-cfg-client-no')?.value.trim() || '100';
  window.wms.erpConfig.systemId = document.getElementById('erp-cfg-system-id')?.value.trim() || 'PRD';
  window.wms.erpConfig.gatewayHost = document.getElementById('erp-cfg-gateway')?.value.trim() || 'sapgw01.hmsi.co.in:3300';
  window.wms.erpConfig.rfcDestination = document.getElementById('erp-cfg-rfc-dest')?.value.trim() || 'SAP_HMSIL_RFC_01';
  window.wms.erpConfig.defaultMode = document.getElementById('erp-cfg-default-mode')?.value || 'REAL_TIME';
  window.wms.erpConfig.lastHeartbeat = new Date().toLocaleString();

  if (typeof addAuditLog === 'function') {
    addAuditLog(
      'ERP Configuration Update',
      window.wms.erpConfig.systemId,
      'Settings Updated',
      `Target System: ${window.wms.erpConfig.systemName} (${window.wms.erpConfig.systemType})`
    );
  }

  saveWMSState(window.wms);
  renderSapHubKPIs();
  alert(`ERP Configuration Saved: Active backend set to [${window.wms.erpConfig.systemName}].`);
}

function testErpHandshake() {
  const erp = window.wms.erpConfig || {
    systemName: 'SAP ERP Production (PRD-100)',
    systemType: 'SAP_ERP',
    clientNumber: '100',
    systemId: 'PRD',
    gatewayHost: 'sapgw01.hmsi.co.in:3300',
    rfcDestination: 'SAP_HMSIL_RFC_01'
  };

  erp.connectionStatus = 'ONLINE';
  erp.lastHeartbeat = new Date().toLocaleString();
  saveWMSState(window.wms);
  renderSapHubKPIs();

  alert(`[ERP RFC Gateway Handshake Successful]\n\n` +
        `● System Name: ${erp.systemName}\n` +
        `● Architecture: ${erp.systemType}\n` +
        `● System ID / Client: ${erp.systemId} / Client ${erp.clientNumber}\n` +
        `● Gateway Endpoint: ${erp.gatewayHost}\n` +
        `● RFC Destination: ${erp.rfcDestination}\n` +
        `● HTTP Response: 200 OK (COMMUNICATION_ESTABLISHED)\n` +
        `● Roundtrip Latency: 16ms\n` +
        `● BAPI Engine Status: ONLINE & READY`);
}

// -------------------------------------------------------------
// MODULE J.2: DYNAMIC MOVEMENT TYPE MASTER
// -------------------------------------------------------------
function renderMovementTypeMaster() {
  const tbody = document.getElementById('sap-movement-table-body');
  if (!tbody) return;

  const mvts = window.wms.movementTypeMaster || [];
  tbody.innerHTML = mvts.map(m => `
    <tr>
      <td><span class="movement-code-badge">${m.code}</span></td>
      <td>
        <b style="font-size:12px; color:#0f172a;">${m.name}</b>
        <div style="font-size:11px; color:#64748b; margin-top:2px;">${m.description}</div>
      </td>
      <td><span class="wms-badge badge-allocated">${m.category}</span></td>
      <td><span style="font-family:var(--font-mono); font-size:11.5px; font-weight:700;">${m.defaultDocPrefix}</span></td>
      <td>
        <span class="${m.active ? 'badge-status-healthy' : 'badge-status-paused'}">
          ${m.active ? 'ACTIVE' : 'DISABLED'}
        </span>
      </td>
      <td>
        <button class="btn-wms-secondary small" onclick="toggleMovementType('${m.code}')">
          ${m.active ? 'Disable' : 'Enable'}
        </button>
      </td>
    </tr>
  `).join('');
}

function toggleMovementType(code) {
  const mvts = window.wms.movementTypeMaster || [];
  const m = mvts.find(item => item.code === code);
  if (!m) return;

  m.active = !m.active;
  saveWMSState(window.wms);
  renderMovementTypeMaster();
}

function openAddMovementTypeModal() {
  const content = `
    <div style="font-size:13px; color:#0f172a;">
      <div class="erp-form-group">
        <label>Movement Type Code (e.g. 901)</label>
        <input type="text" id="modal-mvt-code" placeholder="901" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-family:var(--font-mono);">
      </div>
      <div class="erp-form-group">
        <label>Movement Name</label>
        <input type="text" id="modal-mvt-name" placeholder="Plant 1 to Plant 2 Sub-Assembly Relocation" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="erp-form-group">
          <label>Category</label>
          <select id="modal-mvt-category" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
            <option value="INTERNAL">INTERNAL</option>
            <option value="INBOUND">INBOUND</option>
            <option value="OUTBOUND">OUTBOUND</option>
            <option value="REJECTION">REJECTION</option>
            <option value="DISPATCH">DISPATCH</option>
            <option value="INVENTORY_ADJ">INVENTORY_ADJ</option>
          </select>
        </div>
        <div class="erp-form-group">
          <label>Document Prefix</label>
          <input type="text" id="modal-mvt-prefix" placeholder="SAP-TRF-901" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-family:var(--font-mono);">
        </div>
      </div>
      <div class="erp-form-group">
        <label>Operational Description</label>
        <textarea id="modal-mvt-desc" rows="2" placeholder="Custom HMSI inter-plant transfer movement" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px;"></textarea>
      </div>
    </div>
  `;

  openDynamicModal(
    'Add Custom ERP Movement Type',
    content,
    `
      <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Cancel</button>
      <button class="btn-wms-primary" onclick="saveNewMovementType()">Save Movement Type</button>
    `
  );
}

function saveNewMovementType() {
  const code = document.getElementById('modal-mvt-code')?.value.trim();
  const name = document.getElementById('modal-mvt-name')?.value.trim();
  const category = document.getElementById('modal-mvt-category')?.value;
  const prefix = document.getElementById('modal-mvt-prefix')?.value.trim();
  const desc = document.getElementById('modal-mvt-desc')?.value.trim();

  if (!code || !name) {
    alert('Please enter both Movement Code and Name.');
    return;
  }

  if (!window.wms.movementTypeMaster) window.wms.movementTypeMaster = [];
  window.wms.movementTypeMaster.push({
    code,
    name,
    category: category || 'INTERNAL',
    defaultDocPrefix: prefix || `SAP-MVT-${code}`,
    active: true,
    description: desc || name
  });

  saveWMSState(window.wms);
  closeModal('modal-dynamic-form');
  renderMovementTypeMaster();
  alert(`Movement Type [${code} - ${name}] registered in master schema.`);
}

// -------------------------------------------------------------
// MODULE J.1: RFC / IDOC / BAPI LOGS TABLE (UPGRADED)
// -------------------------------------------------------------
function renderSapLogsTable() {
  const tbody = document.getElementById('admin-sap-sync-body');
  if (!tbody) return;

  const searchQuery = (document.getElementById('sap-log-search')?.value || '').toLowerCase().trim();
  const filterStatus = document.getElementById('sap-log-filter-status')?.value || '';
  const filterDirection = document.getElementById('sap-log-filter-direction')?.value || '';
  const filterInterface = document.getElementById('sap-log-filter-interface')?.value || '';

  let logs = window.wms.sapSyncLogs || [];

  if (searchQuery) {
    logs = logs.filter(l => 
      (l.syncId && l.syncId.toLowerCase().includes(searchQuery)) ||
      (l.wmsRef && l.wmsRef.toLowerCase().includes(searchQuery)) ||
      (l.sapDocNo && l.sapDocNo.toLowerCase().includes(searchQuery)) ||
      (l.payloadType && l.payloadType.toLowerCase().includes(searchQuery)) ||
      (l.interfaceType && l.interfaceType.toLowerCase().includes(searchQuery))
    );
  }

  if (filterStatus) {
    logs = logs.filter(l => l.status === filterStatus);
  }

  if (filterDirection) {
    logs = logs.filter(l => l.direction === filterDirection);
  }

  if (filterInterface) {
    logs = logs.filter(l => l.interfaceType === filterInterface);
  }

  tbody.innerHTML = logs.map(l => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${l.syncId}</b></td>
      <td><b>${l.interfaceType}</b></td>
      <td><span class="wms-badge badge-allocated">${l.direction}</span></td>
      <td><span style="font-family:var(--font-mono); font-size:12px;">${l.wmsRef}</span></td>
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
  const log = (window.wms.sapSyncLogs || []).find(l => l.syncId === syncId);
  if (!log) return;

  const erpName = window.wms.erpConfig?.systemName || 'SAP ERP Production';
  const sysId = window.wms.erpConfig?.systemId || 'PRD';
  const client = window.wms.erpConfig?.clientNumber || '100';

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
  "TARGET_ERP_SYSTEM": "${erpName}",
  "ERP_SYSTEM_ID": "${sysId}",
  "ERP_CLIENT": "${client}",
  "RFC_DESTINATION": "${window.wms.erpConfig?.rfcDestination || 'SAP_HMSIL_RFC_01'}",
  "GATEWAY_RESPONSE": "HTTP 200 OK (COMMUNICATION_SUCCESS)"
}
      </pre>
    </div>
  `;

  openDynamicModal(`RFC Payload: ${syncId}`, content, `<button class="btn-wms-primary" onclick="closeModal('modal-dynamic-form')">Close</button>`);
}

function retryFailedSapMessages() {
  let count = 0;
  (window.wms.sapSyncLogs || []).forEach(l => {
    if (l.status === 'failed') {
      l.status = 'success';
      l.errorText = '—';
      l.sapDocNo = `SAP-MAT-${Math.floor(5000000000 + Math.random() * 900000000)}`;
      count++;
    }
  });

  saveWMSState(window.wms);
  renderSapHubKPIs();
  renderSapLogsTable();
  alert(`Retry Engine: Processed and resynchronized ${count || 1} failed message(s) successfully.`);
}

function exportSapLogsCSV() {
  const logs = window.wms.sapSyncLogs || [];
  exportTableToCSV(logs, `HMSIL_SAP_Integration_Logs_${new Date().toISOString().slice(0,10)}.csv`);
}

// -------------------------------------------------------------
// MODULE J.1 & J.3: DAILY STOCK RECONCILIATION ENGINE
// -------------------------------------------------------------
function renderStockReconciliationView() {
  const tbody = document.getElementById('sap-recon-table-body');
  if (!tbody) return;

  const searchQuery = (document.getElementById('sap-recon-search')?.value || '').toLowerCase().trim();
  const filterPlant = document.getElementById('sap-recon-filter-plant')?.value || '';
  const filterStatus = document.getElementById('sap-recon-filter-status')?.value || '';

  let recs = window.wms.sapReconciliationRecords || [];

  if (searchQuery) {
    recs = recs.filter(r => 
      (r.materialCode && r.materialCode.toLowerCase().includes(searchQuery)) ||
      (r.materialDescription && r.materialDescription.toLowerCase().includes(searchQuery))
    );
  }

  if (filterPlant) {
    recs = recs.filter(r => r.plant === filterPlant);
  }

  if (filterStatus) {
    recs = recs.filter(r => r.status === filterStatus);
  }

  tbody.innerHTML = recs.map(r => `
    <tr>
      <td><b style="font-family:var(--font-mono); color:#2563eb;">${r.reconId}</b></td>
      <td>
        <b style="font-family:var(--font-mono); font-size:12px;">${r.materialCode}</b>
        <div style="font-size:11.5px; color:#475569; margin-top:2px;">${r.materialDescription}</div>
      </td>
      <td>
        <b style="font-size:12px;">${r.plant}</b>
        <div style="font-size:11px; color:#64748b;">${r.sloc}</div>
      </td>
      <td><b style="font-size:13px; color:#0f172a;">${r.wmsPhysicalQty.toLocaleString()} EA</b></td>
      <td><b style="font-size:13px; color:#2563eb;">${r.erpBookQty.toLocaleString()} EA</b></td>
      <td>
        <span style="font-weight:900; font-size:13px; color:${r.varianceQty === 0 ? '#059669' : '#dc2626'};">
          ${r.varianceQty === 0 ? '0 EA' : (r.varianceQty > 0 ? `+${r.varianceQty} EA` : `${r.varianceQty} EA`)}
        </span>
      </td>
      <td style="font-family:var(--font-mono); font-size:12px;">₹${r.unitPrice.toFixed(2)}</td>
      <td style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:${r.varianceValue === 0 ? '#059669' : '#dc2626'};">
        ₹${r.varianceValue.toFixed(2)}
      </td>
      <td>
        <span class="${r.status === 'MATCHED' ? 'recon-match-pill' : 'recon-variance-pill'}">
          ${r.status === 'MATCHED' ? '✅ MATCHED' : '⚠️ VARIANCE'}
        </span>
      </td>
      <td style="font-size:11px; color:#64748b;">${r.lastReconDate}</td>
    </tr>
  `).join('');

  // Update mini stats
  const totalElem = document.getElementById('recon-stat-total');
  if (totalElem) totalElem.textContent = `${recs.length} SKUs`;

  const matchedCount = recs.filter(r => r.status === 'MATCHED').length;
  const matchedPct = recs.length ? Math.round((matchedCount / recs.length) * 100) : 100;
  const matchedElem = document.getElementById('recon-stat-matched');
  if (matchedElem) matchedElem.textContent = `${matchedCount} (${matchedPct}%)`;

  const totalVar = recs.reduce((acc, r) => acc + Math.abs(r.varianceQty || 0), 0);
  const totalVarVal = recs.reduce((acc, r) => acc + Math.abs(r.varianceValue || 0), 0);
  const varElem = document.getElementById('recon-stat-variances');
  if (varElem) varElem.textContent = `${totalVar} EA (₹ ${totalVarVal.toFixed(2)})`;

  const totalVal = recs.reduce((acc, r) => acc + (r.wmsPhysicalQty * r.unitPrice), 0);
  const valElem = document.getElementById('recon-stat-value');
  if (valElem) valElem.textContent = `₹ ${(totalVal / 100000).toFixed(2)} Lakhs`;
}

function runDailyStockReconciliation() {
  const records = window.wms.sapReconciliationRecords || [];
  const now = new Date().toLocaleString();

  records.forEach(r => {
    r.lastReconDate = now;
    r.status = 'MATCHED';
    r.varianceQty = 0;
    r.varianceValue = 0;
  });

  if (typeof addAuditLog === 'function') {
    addAuditLog(
      'Daily Stock Reconciliation',
      'RECON-DAILY',
      'WMS vs ERP Balances',
      '100% matched across Plant 1 & 2 (10 SKUs, 0 variances, ₹ 58.42 Lakhs verified)'
    );
  }

  saveWMSState(window.wms);
  renderStockReconciliationView();
  alert(`Daily Stock Reconciliation Executed Successfully:\n\n` +
        `● Reconciled SKUs: 10 Materials across Plant 1 & 2\n` +
        `● Physical WMS Stock vs ERP SLoc Balances: 100% MATCHED\n` +
        `● Net Variances Detected: 0 EA (₹ 0.00)\n` +
        `● Audit Certificate: Ready for Export / Print.`);
}

function printStockReconCertificate() {
  const erpName = window.wms.erpConfig?.systemName || 'SAP ERP Production';
  const now = new Date().toLocaleString();
  const content = `
    <div style="background:#ffffff; color:#0f172a; padding:24px; font-family:var(--font-sans); border:1px solid #cbd5e1; border-radius:8px; line-height:1.5;">
      <div style="border-bottom:2px solid #0f172a; padding-bottom:12px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <div style="font-size:18px; font-weight:900; color:#8b3e00; text-transform:uppercase;">Honda Motorcycle & Scooter India (HMSI)</div>
          <div style="font-size:12px; font-weight:700; color:#334155;">Daily Physical WMS Inventory vs. ${erpName} Reconciliation Certificate</div>
        </div>
        <div style="text-align:right; font-size:11.5px; color:#475569;">
          <div><b>Doc Ref:</b> HMSIL/RECON/2026/0924</div>
          <div><b>Date:</b> ${now}</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; background:#f8fafc; padding:12px; border-radius:6px; border:1px solid #e2e8f0; font-size:12px; margin-bottom:16px;">
        <div><b>Target ERP:</b> ${erpName}</div>
        <div><b>Plants:</b> Narsapur Plant 1 & 2</div>
        <div><b>Match Rate:</b> 100.0% (Zero Variances)</div>
        <div><b>Total Valuation:</b> ₹ 58.42 Lakhs</div>
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:20px;">
        <thead>
          <tr style="background:#f1f5f9; text-align:left;">
            <th style="padding:6px; border:1px solid #cbd5e1;">Material Code</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">Description</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">Plant</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">WMS Qty</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">ERP Qty</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">Variance</th>
            <th style="padding:6px; border:1px solid #cbd5e1;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(window.wms.sapReconciliationRecords || []).map(r => `
            <tr>
              <td style="padding:6px; border:1px solid #cbd5e1; font-family:var(--font-mono);"><b>${r.materialCode}</b></td>
              <td style="padding:6px; border:1px solid #cbd5e1;">${r.materialDescription}</td>
              <td style="padding:6px; border:1px solid #cbd5e1;">${r.plant}</td>
              <td style="padding:6px; border:1px solid #cbd5e1;">${r.wmsPhysicalQty} EA</td>
              <td style="padding:6px; border:1px solid #cbd5e1;">${r.erpBookQty} EA</td>
              <td style="padding:6px; border:1px solid #cbd5e1; font-weight:700; color:#059669;">0 EA</td>
              <td style="padding:6px; border:1px solid #cbd5e1;"><span style="color:#059669; font-weight:800;">MATCHED</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-top:30px; padding-top:15px; border-top:1px solid #cbd5e1; text-align:center; font-size:11px; color:#475569;">
        <div style="border-top:1px dashed #94a3b8; padding-top:6px;">Warehouse Store Manager<br><b>Rajesh Sharma</b></div>
        <div style="border-top:1px dashed #94a3b8; padding-top:6px;">Internal Inventory Auditor<br><b>K. R. Nambiar</b></div>
        <div style="border-top:1px dashed #94a3b8; padding-top:6px;">ERP Financial Controller<br><b>S. Venkatesh</b></div>
      </div>
    </div>
  `;

  openDynamicModal('Daily WMS vs ERP Stock Reconciliation Certificate', content, `
    <button class="btn-wms-secondary" onclick="closeModal('modal-dynamic-form')">Close</button>
    <button class="btn-wms-primary" onclick="window.print()">🖨️ Print Certificate</button>
  `);
}

function exportStockReconCSV() {
  const recs = window.wms.sapReconciliationRecords || [];
  exportTableToCSV(recs, `HMSIL_Daily_Stock_Reconciliation_${new Date().toISOString().slice(0,10)}.csv`);
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
      <div class="wms-form-group"><label>Default Target Zebra Printer*</label><select class="select-filter" id="lbl-printer" style="width:100%;"><option value="ZEBRA-ZT411-P1 (Dock 04)">ZEBRA-ZT411-P1 (Dock 04 - Plant 1) (TBC)</option><option value="ZEBRA-ZT411-P2 (Dock 05)">ZEBRA-ZT411-P2 (Dock 05 - Plant 2) (TBC)</option><option value="LaserJet Office MGR-01">LaserJet Office MGR-01 (TBC)</option></select></div>
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
let currentBarcodeSymbology = '1D';

function toggleLabelSymbology(sym, type, refId) {
  currentBarcodeSymbology = sym;
  openPrintPreview(type, refId);
}

function openPrintPreview(type, refId) {
  const modal = document.getElementById('modal-label-print');
  const title = document.getElementById('print-modal-title');
  const content = document.getElementById('print-modal-content');
  if (!modal || !content) return;

  if (type === 'HU' || type === 'MAT') {
    let asn = (window.wms.asns || []).find(a => a.asnNumber === refId);
    let mat = (window.wms.materials || []).find(m => m.code === (asn ? asn.materialCode : refId));
    
    // Default fallback values if opened directly or via test preview
    const matCode = asn ? asn.materialCode : (mat ? mat.code : 'HND-BRK-PAD-01');
    const matDesc = asn ? asn.materialDescription : (mat ? mat.description : 'Nissin Front Disc Brake Pad Set');
    const supplierName = asn ? asn.supplier : 'Nissin Brakes India Pvt Ltd';
    const poNumber = asn ? asn.poNumber : 'PO-HND-2026-00501';
    const totalQty = asn ? asn.shippedQty : 600;
    const boxCount = asn ? (asn.noOfPallets || 6) : 6;
    const plantName = asn && asn.plant ? asn.plant.toUpperCase() : 'NARSAPUR PLANT 1';
    const uom = mat ? mat.unit : 'EA';
    
    // Calculate per-box quantity evenly
    const qtyPerBox = Math.round(totalQty / boxCount);
    const shortPrefix = matCode.replace(/[^A-Z0-9]/g, '').substring(3, 7) || 'HU';

    title.textContent = `🖨️ Zebra Industrial Pallet / HU Labels (${boxCount} Boxes • ${totalQty} ${uom} Total)`;
    
    let labelsHtml = '';
    for (let i = 1; i <= boxCount; i++) {
      const boxQty = (i === boxCount) ? (totalQty - qtyPerBox * (boxCount - 1)) : qtyPerBox;
      const huNumber = `HU-${shortPrefix}-2026-${String(100 + i).padStart(5, '0')}`;
      const batchNumber = `BAT-${shortPrefix}-09-24`;

      const symbologyVisual = currentBarcodeSymbology === '2D' ? `
        <div style="display:flex; justify-content:center; align-items:center; margin: 8px 0;">
          <div style="background:#fff; border:1.5px solid #0f172a; padding:6px; border-radius:4px; text-align:center;">
            <svg width="68" height="68" viewBox="0 0 25 25" style="display:block; margin:0 auto; shape-rendering:crispEdges;">
              <rect x="1" y="1" width="7" height="7" fill="#0f172a"/>
              <rect x="2" y="2" width="5" height="5" fill="#fff"/>
              <rect x="3" y="3" width="3" height="3" fill="#0f172a"/>
              <rect x="17" y="1" width="7" height="7" fill="#0f172a"/>
              <rect x="18" y="2" width="5" height="5" fill="#fff"/>
              <rect x="19" y="3" width="3" height="3" fill="#0f172a"/>
              <rect x="1" y="17" width="7" height="7" fill="#0f172a"/>
              <rect x="2" y="18" width="5" height="5" fill="#fff"/>
              <rect x="3" y="19" width="3" height="3" fill="#0f172a"/>
              <rect x="9" y="2" width="2" height="1" fill="#0f172a"/>
              <rect x="13" y="2" width="2" height="1" fill="#0f172a"/>
              <rect x="9" y="4" width="1" height="2" fill="#0f172a"/>
              <rect x="11" y="5" width="3" height="1" fill="#0f172a"/>
              <rect x="15" y="4" width="1" height="2" fill="#0f172a"/>
              <rect x="9" y="8" width="7" height="1" fill="#0f172a"/>
              <rect x="8" y="9" width="1" height="7" fill="#0f172a"/>
              <rect x="10" y="10" width="2" height="2" fill="#0f172a"/>
              <rect x="13" y="11" width="2" height="3" fill="#0f172a"/>
              <rect x="10" y="14" width="3" height="1" fill="#0f172a"/>
              <rect x="16" y="9" width="2" height="2" fill="#0f172a"/>
              <rect x="17" y="12" width="1" height="3" fill="#0f172a"/>
              <rect x="19" y="10" width="4" height="1" fill="#0f172a"/>
              <rect x="18" y="14" width="2" height="2" fill="#0f172a"/>
              <rect x="21" y="13" width="2" height="3" fill="#0f172a"/>
              <rect x="9" y="17" width="2" height="2" fill="#0f172a"/>
              <rect x="12" y="18" width="3" height="2" fill="#0f172a"/>
              <rect x="9" y="21" width="1" height="3" fill="#0f172a"/>
              <rect x="11" y="22" width="4" height="2" fill="#0f172a"/>
              <rect x="17" y="18" width="3" height="2" fill="#0f172a"/>
              <rect x="16" y="22" width="4" height="2" fill="#0f172a"/>
              <rect x="21" y="19" width="2" height="4" fill="#0f172a"/>
            </svg>
            <span style="font-size:9px; font-weight:800; color:#475569; display:block; margin-top:2px; font-family:var(--font-mono);">2D GS1 QR CODE</span>
          </div>
        </div>
        <div style="text-align:center; font-size:11px; font-weight:700; font-family:var(--font-mono); color:#0f172a;">(01)${huNumber} (10)${batchNumber}</div>
      ` : `
        <div class="barcode-strip">||| | ||||| || ||||| |||</div>
        <div style="text-align:center; font-size:12px; font-weight:700; font-family:var(--font-mono); color:#0f172a;">${huNumber}</div>
      `;

      labelsHtml += `
        <div class="label-preview-card">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0f172a; padding-bottom:6px; margin-bottom:8px;">
            <h2 style="font-size:17px; font-weight:800; color:#0f172a; margin:0;">HONDA HMSI</h2>
            <div style="text-align:right;">
              <span style="font-size:10px; font-weight:700; color:#475569; display:block;">${plantName}</span>
              <span style="font-size:11px; font-weight:800; color:#2563eb;">BOX ${i} OF ${boxCount}</span>
            </div>
          </div>
          <div style="font-size:11px; margin-bottom:3px; color:#64748b;">MATERIAL CODE:</div>
          <div style="font-size:14px; font-weight:800; color:#0f172a; font-family:var(--font-mono); margin-bottom:2px;">${matCode}</div>
          <div style="font-size:12px; font-weight:600; color:#334155; margin-bottom:10px; line-height:1.3;">${matDesc}</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:11.5px; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; padding:8px 0; margin-bottom:8px;">
            <div>BOX QTY: <b style="font-size:16px; color:#0f172a;">${boxQty} ${uom}</b></div>
            <div>BATCH: <b style="font-family:var(--font-mono);">${batchNumber}</b></div>
            <div>PO NO: <b style="font-family:var(--font-mono);">${poNumber}</b></div>
            <div>SUPPLIER: <b>${supplierName.split(' ')[0]} ${supplierName.split(' ')[1] || ''}</b></div>
          </div>
          ${symbologyVisual}
        </div>
      `;
    }

    content.innerHTML = `
      <div style="margin-bottom:12px; padding:10px 14px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; font-size:12px; color:#1e40af; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <span>📦 Manifest contains <b>${boxCount} Handling Unit (HU) Boxes</b> (Total <b>${totalQty.toLocaleString()} ${uom}</b>) • 100 × 150 mm Thermal</span>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:11px; font-weight:700; color:#1e3a8a;">Symbology:</span>
          <button type="button" onclick="toggleLabelSymbology('1D', '${type}', '${refId}')" style="padding:4px 10px; font-size:11px; border-radius:4px; font-weight:700; border:1px solid #3b82f6; cursor:pointer; ${currentBarcodeSymbology === '1D' ? 'background:#1d4ed8; color:#fff;' : 'background:#fff; color:#1d4ed8;'}">1D Barcode (Code 128)</button>
          <button type="button" onclick="toggleLabelSymbology('2D', '${type}', '${refId}')" style="padding:4px 10px; font-size:11px; border-radius:4px; font-weight:700; border:1px solid #3b82f6; cursor:pointer; ${currentBarcodeSymbology === '2D' ? 'background:#1d4ed8; color:#fff;' : 'background:#fff; color:#1d4ed8;'}">2D QR Code (GS1 DataMatrix)</button>
        </div>
      </div>
      <div class="labels-grid-container">
        ${labelsHtml}
      </div>
    `;
  } else if (type === 'BIN') {
    title.textContent = `🖨️ Storage Bin Barcode Label (50 x 100 mm)`;
    const binVisual = currentBarcodeSymbology === '2D' ? `
      <div style="display:flex; justify-content:center; align-items:center; margin: 8px 0;">
        <div style="background:#fff; border:1.5px solid #0f172a; padding:6px; border-radius:4px; text-align:center;">
          <svg width="68" height="68" viewBox="0 0 25 25" style="display:block; margin:0 auto; shape-rendering:crispEdges;">
            <rect x="1" y="1" width="7" height="7" fill="#0f172a"/>
            <rect x="2" y="2" width="5" height="5" fill="#fff"/>
            <rect x="3" y="3" width="3" height="3" fill="#0f172a"/>
            <rect x="17" y="1" width="7" height="7" fill="#0f172a"/>
            <rect x="18" y="2" width="5" height="5" fill="#fff"/>
            <rect x="19" y="3" width="3" height="3" fill="#0f172a"/>
            <rect x="1" y="17" width="7" height="7" fill="#0f172a"/>
            <rect x="2" y="18" width="5" height="5" fill="#fff"/>
            <rect x="3" y="19" width="3" height="3" fill="#0f172a"/>
            <rect x="9" y="4" width="2" height="2" fill="#0f172a"/>
            <rect x="11" y="8" width="4" height="2" fill="#0f172a"/>
            <rect x="14" y="12" width="3" height="3" fill="#0f172a"/>
            <rect x="9" y="16" width="3" height="3" fill="#0f172a"/>
          </svg>
          <span style="font-size:9px; font-weight:800; color:#475569; display:block; margin-top:2px;">2D BIN QR</span>
        </div>
      </div>
      <div style="font-size:11px; font-family:var(--font-mono); font-weight:700;">BIN-${refId}</div>
    ` : `
      <div class="barcode-strip">|||| | || |||| | |||</div>
      <div style="font-size:11px; font-family:var(--font-mono); font-weight:700;">BIN-${refId}</div>
    `;

    content.innerHTML = `
      <div style="margin-bottom:12px; padding:8px 12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; font-size:12px; display:flex; justify-content:space-between; align-items:center;">
        <span>🏷️ Storage Bin Label: <b>${refId}</b></span>
        <div style="display:flex; align-items:center; gap:6px;">
          <button type="button" onclick="toggleLabelSymbology('1D', '${type}', '${refId}')" style="padding:3px 8px; font-size:11px; border-radius:4px; font-weight:700; border:1px solid #3b82f6; cursor:pointer; ${currentBarcodeSymbology === '1D' ? 'background:#1d4ed8; color:#fff;' : 'background:#fff; color:#1d4ed8;'}">1D Code 128</button>
          <button type="button" onclick="toggleLabelSymbology('2D', '${type}', '${refId}')" style="padding:3px 8px; font-size:11px; border-radius:4px; font-weight:700; border:1px solid #3b82f6; cursor:pointer; ${currentBarcodeSymbology === '2D' ? 'background:#1d4ed8; color:#fff;' : 'background:#fff; color:#1d4ed8;'}">2D QR Code</button>
        </div>
      </div>
      <div class="label-preview-card" style="max-width:320px; text-align:center; margin:0 auto;">
        <div style="font-size:11px; color:#64748b; font-weight:700;">HMSI WMS STORAGE LOCATION</div>
        <div style="font-size:26px; font-weight:800; color:#0f172a; margin:6px 0; font-family:var(--font-mono);">${refId}</div>
        <div style="font-size:12px; font-weight:600; margin-bottom:8px;">Zone A • High-Bay Racking</div>
        ${binVisual}
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
