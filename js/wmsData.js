// HONDA MOTORCYCLE & SCOOTER INDIA (HMSI) - MANUFACTURING WMS
// Enterprise Data Model, Master State & Demo Flow Engine
// Aligned to HMSIL WMS Screen & Functional Specification

const WMS_STORAGE_KEY = 'HONDA_HMSI_WMS_STATE_V5_PLANTS';

const WMS_DEFAULT_STATE = {
  activePlant: 'All',
  activeLine: 'All',
  activeWarehouse: 'All Warehouses',
  systemDate: '24-Sep-2026',
  lastSapSyncTime: '24-Sep-2026 10:45:00',
  currentUser: {
    userId: 'HND-USR-1001',
    name: 'Rajesh Sharma',
    role: 'WMS_ADMIN',
    roleTitle: 'Warehouse Manager / Supervisor',
    plant: 'HMSI Narsapur Plant 1',
    approvalLimit: 100000,
    handheldPin: '4821',
    status: 'ACTIVE'
  },

  // -------------------------------------------------------------
  // 1. DASHBOARD & SYSTEM ALERTS
  // -------------------------------------------------------------
  systemAlerts: [
    { id: 'ALT-101', type: 'FIFO_OVERRIDE', severity: 'warning', title: 'FIFO Override on Line 2 Pick', message: 'Operator Sanjay picked batch BAT-NIS-09-20 instead of older BAT-NIS-09-15. Reason: Urgent packaging defect.', timestamp: '24-Sep-2026 09:30', acknowledged: false },
    { id: 'ALT-102', type: 'LOW_STOCK', severity: 'critical', title: 'Low Stock Alert: Keihin Master ECU', message: 'Stock (50 EA) fell below Reorder Point (180 EA) in Plant 2. Suggested Replenishment: 450 EA.', timestamp: '24-Sep-2026 08:15', acknowledged: false },
    { id: 'ALT-103', type: 'SAP_RETRY', severity: 'warning', title: 'SAP Goods Receipt Retry Pending', message: 'GRN-HND-2026-00482 failed due to SAP RFC timeout. Ready for automatic retry.', timestamp: '24-Sep-2026 07:45', acknowledged: false },
    { id: 'ALT-104', type: 'VARIANCE', severity: 'info', title: 'Cycle Count Variance Flagged', message: 'Brake Pad A-01-05 count showed -2 EA variance. Pending supervisor review.', timestamp: '24-Sep-2026 10:15', acknowledged: true }
  ],

  // -------------------------------------------------------------
  // 2. MASTERS DATA (Section 7)
  // -------------------------------------------------------------
  plantMaster: [
    { plantCode: 'P1', name: 'HMSI Narsapur Plant 1 (Scooter Division)', address: 'Plot 42, KIADB Industrial Area, Narsapur, Kolar, Karnataka', sapPlantCode: '1001', sapSLocMapping: 'SL01 (Raw), SL02 (Staging), SL-REJ (Quarantine)', status: 'ACTIVE' },
    { plantCode: 'P2', name: 'HMSI Narsapur Plant 2 (Motorcycle Division)', address: 'Plot 55, KIADB Industrial Area, Narsapur, Kolar, Karnataka', sapPlantCode: '1002', sapSLocMapping: 'SL01 (Raw), SL03 (Premium RM), SL-REJ (Quarantine)', status: 'ACTIVE' }
  ],

  materials: [
    {
      code: 'HND-BRK-PAD-01',
      description: 'Nissin Front Disc Brake Pad Set (Activa 6G / Dio 125)',
      unit: 'EA',
      materialGroup: 'Chassis & Braking Parts',
      plant: 'HMSI Narsapur Plant 1',
      abcClass: 'A',
      standardPackQty: 100,
      packType: 'Standard Plastic Crate (100 EA)',
      weightKg: 0.45,
      dimensions: '180 x 120 x 85 mm',
      batchManaged: true,
      fifoApplicable: true,
      shelfLifeDays: 1460,
      barcode: '8901452098412',
      defaultZone: 'Zone A - Powertrain & Chassis',
      status: 'ACTIVE',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      code: 'HND-THROT-KEIHIN',
      description: 'Keihin PGM-FI 26mm Throttle Body Assembly (Activa 6G)',
      unit: 'EA',
      materialGroup: 'Fuel Injection & Powertrain',
      plant: 'HMSI Narsapur Plant 1',
      abcClass: 'A',
      standardPackQty: 20,
      packType: 'Anti-Static ESD Box (20 EA)',
      weightKg: 1.20,
      dimensions: '220 x 180 x 140 mm',
      batchManaged: true,
      fifoApplicable: true,
      shelfLifeDays: 730,
      barcode: '8901452098401',
      defaultZone: 'Zone A - Powertrain & Chassis',
      status: 'ACTIVE',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      code: 'HND-ECU-KEIHIN-01',
      description: 'Keihin Master Engine Control Unit (ECU) with OBD2',
      unit: 'EA',
      materialGroup: 'Electronics & Sensors',
      plant: 'HMSI Narsapur Plant 2',
      abcClass: 'A',
      standardPackQty: 10,
      packType: 'ESD Molded Tray (10 EA)',
      weightKg: 0.85,
      dimensions: '200 x 150 x 50 mm',
      batchManaged: true,
      fifoApplicable: true,
      shelfLifeDays: 1095,
      barcode: '8901452098402',
      defaultZone: 'Zone B - Electronics Bay',
      status: 'ACTIVE',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      code: 'HND-STR-MITSUBA',
      description: 'Mitsuba ACG Silent Starter & Generator Assembly 12V',
      unit: 'EA',
      materialGroup: 'Electrical Powertrain',
      plant: 'HMSI Narsapur Plant 1',
      abcClass: 'B',
      standardPackQty: 10,
      packType: 'Heavy Crate (10 EA)',
      weightKg: 3.40,
      dimensions: '260 x 240 x 180 mm',
      batchManaged: true,
      fifoApplicable: true,
      shelfLifeDays: 1095,
      barcode: '8901452098403',
      defaultZone: 'Zone A - Powertrain & Chassis',
      status: 'ACTIVE',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      code: 'HND-CVT-BELT-BND',
      description: 'Bando Double-Cog Reinforced V-Belt Drive (Activa 6G)',
      unit: 'EA',
      materialGroup: 'Transmission & Drive',
      plant: 'HMSI Narsapur Plant 1',
      abcClass: 'A',
      standardPackQty: 50,
      packType: 'Cardboard Pack (50 EA)',
      weightKg: 0.35,
      dimensions: '300 x 150 x 80 mm',
      batchManaged: true,
      fifoApplicable: true,
      shelfLifeDays: 540,
      barcode: '8901452098404',
      defaultZone: 'Zone A - Powertrain & Chassis',
      status: 'ACTIVE',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      code: 'HND-SHK-SHOWA',
      description: 'Showa Telescopic Hydraulic Front Suspension Fork Set',
      unit: 'SET',
      materialGroup: 'Suspension & Steering',
      plant: 'HMSI Narsapur Plant 1',
      abcClass: 'B',
      standardPackQty: 10,
      packType: 'Wooden Pallet (10 SET)',
      weightKg: 6.80,
      dimensions: '800 x 300 x 200 mm',
      batchManaged: true,
      fifoApplicable: true,
      shelfLifeDays: 1460,
      barcode: '8901452098405',
      defaultZone: 'Zone C - Chassis & Suspension',
      status: 'ACTIVE',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      code: 'HND-TYR-MRF-90',
      description: 'MRF Nylogrip Zapper 90/90-12 54J Tubeless OEM Tyre',
      unit: 'EA',
      materialGroup: 'Tyres & Wheels',
      plant: 'HMSI Narsapur Plant 1',
      abcClass: 'A',
      standardPackQty: 25,
      packType: 'Tyre Stack Bundle (25 EA)',
      weightKg: 3.10,
      dimensions: '450 x 450 x 200 mm',
      batchManaged: true,
      fifoApplicable: true,
      shelfLifeDays: 730,
      barcode: '8901452098406',
      defaultZone: 'Zone D - Tyres & Rubber Bay',
      status: 'ACTIVE',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    }
  ],

  suppliers: [
    { code: 'VEND-NIS-01', name: 'Nissin Brakes India Pvt Ltd', address: 'Plot 18, Industrial Estate, Bidadi, Ramanagara', contact: 'K. S. Narayanan', phone: '+91 98450 11200', email: 'dispatch@nissinbrakes.co.in', asnCapable: true, leadTimeDays: 2, status: 'ACTIVE', isSapOwned: true, lastSync: '24-Sep-2026 08:00' },
    { code: 'VEND-KEI-01', name: 'Keihin India Electronics Pvt Ltd', address: 'Plot 28, Industrial Park, Doddaballapur', contact: 'M. Anand', phone: '+91 98450 19284', email: 'supply@keihin-india.com', asnCapable: true, leadTimeDays: 2, status: 'ACTIVE', isSapOwned: true, lastSync: '24-Sep-2026 08:00' },
    { code: 'VEND-MIT-01', name: 'Mitsuba Sical India Pvt Ltd', address: 'Gummidipoondi Industrial Area, Chennai', contact: 'Suresh Kumar', phone: '+91 97410 44821', email: 'orders@mitsubasical.in', asnCapable: true, leadTimeDays: 3, status: 'ACTIVE', isSapOwned: true, lastSync: '24-Sep-2026 08:00' },
    { code: 'VEND-SHW-01', name: 'Showa India Pvt Ltd', address: 'Sector 3, IMT Manesar, Gurugram', contact: 'Anil Gowda', phone: '+91 99001 88412', email: 'dispatch@showaindia.com', asnCapable: true, leadTimeDays: 4, status: 'ACTIVE', isSapOwned: true, lastSync: '24-Sep-2026 08:00' },
    { code: 'VEND-MRF-01', name: 'MRF Limited OEM Division', address: 'Greams Road, Thousand Lights, Chennai', contact: 'Raghavan Pillai', phone: '+91 94440 22910', email: 'oem.sales@mrfmail.com', asnCapable: true, leadTimeDays: 2, status: 'ACTIVE', isSapOwned: true, lastSync: '24-Sep-2026 08:00' }
  ],

  areaMaster: [
    { zoneCode: 'ZONE-A-PWR', zoneName: 'Zone A - Powertrain & Chassis', plant: 'HMSI Narsapur Plant 1', type: 'high-bay MS', allowedAbc: 'A, B', binCount: 120, occupiedBins: 84, utilization: '70%', status: 'ACTIVE' },
    { zoneCode: 'ZONE-B-ELE', zoneName: 'Zone B - Electronics & Sensors Bay', plant: 'HMSI Narsapur Plant 1', type: 'small parts', allowedAbc: 'A', binCount: 80, occupiedBins: 58, utilization: '72%', status: 'ACTIVE' },
    { zoneCode: 'ZONE-C-SUS', zoneName: 'Zone C - Chassis & Suspension', plant: 'HMSI Narsapur Plant 1', type: 'high-bay MS', allowedAbc: 'B, C', binCount: 90, occupiedBins: 45, utilization: '50%', status: 'ACTIVE' },
    { zoneCode: 'ZONE-D-TYR', zoneName: 'Zone D - Tyres & Rubber Bay', plant: 'HMSI Narsapur Plant 1', type: 'staging', allowedAbc: 'A', binCount: 60, occupiedBins: 52, utilization: '86%', status: 'ACTIVE' },
    { zoneCode: 'ZONE-Q-REJ', zoneName: 'Zone Q - Quarantine & Defect Inspection', plant: 'HMSI Narsapur Plant 1', type: 'quarantine', allowedAbc: 'A, B, C', binCount: 30, occupiedBins: 6, utilization: '20%', status: 'ACTIVE' },
    { zoneCode: 'ZONE-P2-MC', zoneName: 'Zone P2 - Motorcycle Premium RM', plant: 'HMSI Narsapur Plant 2', type: 'high-bay MS', allowedAbc: 'A, B', binCount: 150, occupiedBins: 95, utilization: '63%', status: 'ACTIVE' }
  ],

  binMaster: [
    { binCode: 'A-01-05', zone: 'ZONE-A-PWR', zoneName: 'Zone A - Powertrain & Chassis', type: 'High-Bay Rack', capacity: 1000, maxWeightKg: 1200, currentQty: 488, storedMaterial: 'HND-BRK-PAD-01 (Brake Pad Set)', status: 'ACTIVE', barcode: 'BIN-A-01-05' },
    { binCode: 'RM-A03-R04-S02-B05', zone: 'ZONE-A-PWR', zoneName: 'Zone A - Powertrain & Chassis', type: 'High-Bay Rack', capacity: 1000, maxWeightKg: 1500, currentQty: 650, storedMaterial: 'HND-THROT-KEIHIN (Throttle Body)', status: 'ACTIVE', barcode: 'BIN-A03-B05' },
    { binCode: 'RM-A02-R02-S01-B02', zone: 'ZONE-A-PWR', zoneName: 'Zone A - Powertrain & Chassis', type: 'High-Bay Rack', capacity: 800, maxWeightKg: 1000, currentQty: 400, storedMaterial: 'HND-STR-MITSUBA (ACG Starter)', status: 'ACTIVE', barcode: 'BIN-A02-B02' },
    { binCode: 'RM-B02-R01-S01-B01', zone: 'ZONE-B-ELE', zoneName: 'Zone B - Electronics Bay', type: 'Small Parts Shelf', capacity: 500, maxWeightKg: 300, currentQty: 50, storedMaterial: 'HND-ECU-KEIHIN-01 (Master ECU)', status: 'ACTIVE', barcode: 'BIN-B02-B01' },
    { binCode: 'RM-C01-R01-S01-B01', zone: 'ZONE-C-SUS', zoneName: 'Zone C - Chassis & Suspension', type: 'High-Bay Rack', capacity: 1200, maxWeightKg: 2000, currentQty: 480, storedMaterial: 'HND-SHK-SHOWA (Fork Set)', status: 'ACTIVE', barcode: 'BIN-C01-B01' },
    { binCode: 'RM-D01-R01-S01-B01', zone: 'ZONE-D-TYR', zoneName: 'Zone D - Tyres & Rubber Bay', type: 'Floor Staging Pallet', capacity: 1500, maxWeightKg: 2500, currentQty: 950, storedMaterial: 'HND-TYR-MRF-90 (MRF Tyres)', status: 'ACTIVE', barcode: 'BIN-D01-B01' },
    { binCode: 'QC-REJECT-ZONE-01', zone: 'ZONE-Q-REJ', zoneName: 'Zone Q - Quarantine Inspection', type: 'Quarantine Lock-box', capacity: 200, maxWeightKg: 500, currentQty: 25, storedMaterial: 'Damaged / Shortage Inbound Lots', status: 'BLOCKED', barcode: 'BIN-QC-01' }
  ],

  dockMaster: [
    { dockCode: 'DOCK-01', plant: 'HMSI Narsapur Plant 1', dockType: 'Powertrain & Heavy Inbound', workingHours: '24x7 (3 Shifts)', status: 'OCCUPIED', currentTruck: 'KA-07-M-1829', supplier: 'Keihin India Electronics Pvt Ltd', po: 'PO-HND-2026-00421', arrivalTime: '24-Sep-2026 09:15', timeAtDockMinutes: 90 },
    { dockCode: 'DOCK-02', plant: 'HMSI Narsapur Plant 1', dockType: 'Electronics & Fasteners', workingHours: '06:00 - 22:00', status: 'FREE', currentTruck: '—', supplier: '—', po: '—', arrivalTime: '—', timeAtDockMinutes: 0 },
    { dockCode: 'DOCK-03', plant: 'HMSI Narsapur Plant 1', dockType: 'Tyres, Wheels & Rubber', workingHours: '24x7 (3 Shifts)', status: 'FREE', currentTruck: '—', supplier: '—', po: '—', arrivalTime: '—', timeAtDockMinutes: 0 },
    { dockCode: 'DOCK-04', plant: 'HMSI Narsapur Plant 1', dockType: 'Chassis & Braking Systems', workingHours: '24x7 (3 Shifts)', status: 'OCCUPIED', currentTruck: 'KA-04-E-1190', supplier: 'Nissin Brakes India Pvt Ltd', po: 'PO-HND-2026-00501', arrivalTime: '24-Sep-2026 08:30', timeAtDockMinutes: 135 },
    { dockCode: 'DOCK-05', plant: 'HMSI Narsapur Plant 2', dockType: 'Suspension & Exhaust Inbound', workingHours: '06:00 - 22:00', status: 'MAINTENANCE_BLOCKED', currentTruck: '—', supplier: '—', po: '—', arrivalTime: '—', timeAtDockMinutes: 0 },
    { dockCode: 'DOCK-06', plant: 'HMSI Narsapur Plant 2', dockType: 'Motorcycle Line Inbound', workingHours: '24x7 (3 Shifts)', status: 'FREE', currentTruck: '—', supplier: '—', po: '—', arrivalTime: '—', timeAtDockMinutes: 0 }
  ],

  productionLineMaster: [
    { lineCode: 'L1', name: 'Line 1 (Activa 6G Final Assembly)', plant: 'HMSI Narsapur Plant 1', stagingBin: 'STG-P1-L1', shiftPattern: '3 Shifts (A/B/C)', dailyTarget: 1200, status: 'ACTIVE' },
    { lineCode: 'L2', name: 'Line 2 (Shine 125 & SP125 Assembly)', plant: 'HMSI Narsapur Plant 1', stagingBin: 'STG-P1-L2', shiftPattern: '3 Shifts (A/B/C)', dailyTarget: 950, status: 'ACTIVE' },
    { lineCode: 'L3', name: 'Line 3 (110cc/125cc PGM-FI Engine Sub-Assembly)', plant: 'HMSI Narsapur Plant 1', stagingBin: 'STG-P1-L3', shiftPattern: '3 Shifts (A/B/C)', dailyTarget: 2200, status: 'ACTIVE' },
    { lineCode: 'L4', name: 'Line 4 (CB350 / H\'ness Premium Assembly)', plant: 'HMSI Narsapur Plant 2', stagingBin: 'STG-P2-L4', shiftPattern: '2 Shifts (A/B)', dailyTarget: 400, status: 'ACTIVE' },
    { lineCode: 'L5', name: 'Line 5 (Hornet 2.0 & Unicorn 160 Assembly)', plant: 'HMSI Narsapur Plant 2', stagingBin: 'STG-P2-L5', shiftPattern: '2 Shifts (A/B)', dailyTarget: 600, status: 'ACTIVE' }
  ],

  stockLevelMaster: [
    { materialCode: 'HND-BRK-PAD-01', plant: 'HMSI Narsapur Plant 1', minStock: 200, maxStock: 1500, reorderPoint: 450, safetyStock: 150, abcCycleDays: 1, alertEmails: 'wh-lead@hmsi.co.in, purchase@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-THROT-KEIHIN', plant: 'HMSI Narsapur Plant 1', minStock: 250, maxStock: 1200, reorderPoint: 400, safetyStock: 120, abcCycleDays: 1, alertEmails: 'wh-lead@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-ECU-KEIHIN-01', plant: 'HMSI Narsapur Plant 2', minStock: 180, maxStock: 800, reorderPoint: 300, safetyStock: 80, abcCycleDays: 1, alertEmails: 'wh-lead@hmsi.co.in, electronics-lead@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-STR-MITSUBA', plant: 'HMSI Narsapur Plant 1', minStock: 100, maxStock: 600, reorderPoint: 180, safetyStock: 50, abcCycleDays: 2, alertEmails: 'wh-lead@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-CVT-BELT-BND', plant: 'HMSI Narsapur Plant 1', minStock: 300, maxStock: 1500, reorderPoint: 500, safetyStock: 150, abcCycleDays: 1, alertEmails: 'wh-lead@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-SHK-SHOWA', plant: 'HMSI Narsapur Plant 1', minStock: 120, maxStock: 600, reorderPoint: 200, safetyStock: 60, abcCycleDays: 2, alertEmails: 'wh-lead@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-TYR-MRF-90', plant: 'HMSI Narsapur Plant 1', minStock: 400, maxStock: 2000, reorderPoint: 700, safetyStock: 200, abcCycleDays: 1, alertEmails: 'wh-lead@hmsi.co.in', status: 'ACTIVE' }
  ],

  reasonCodeMaster: [
    { code: 'DAMAGE-TRANSIT', description: 'Damaged in transit / broken carton', type: 'damage', needsApproval: true, sapMovementType: 'Movement 122 (Return to Vendor)', status: 'ACTIVE' },
    { code: 'SHORT-UNLOAD', description: 'Physical shortage observed during truck unloading', type: 'shortage', needsApproval: true, sapMovementType: 'Movement 101 Short Deviation', status: 'ACTIVE' },
    { code: 'EXCESS-VENDOR', description: 'Vendor shipped excess quantity over PO', type: 'excess', needsApproval: true, sapMovementType: 'Movement 101 Excess Hold', status: 'ACTIVE' },
    { code: 'COUNT-VAR-SHRINK', description: 'Cycle count physical shrinkage / adjustment (-)', type: 'adjustment', needsApproval: true, sapMovementType: 'Movement 711 (Inv Loss)', status: 'ACTIVE' },
    { code: 'COUNT-VAR-GAIN', description: 'Cycle count physical surplus / adjustment (+)', type: 'adjustment', needsApproval: true, sapMovementType: 'Movement 712 (Inv Gain)', status: 'ACTIVE' },
    { code: 'FIFO-OVERRIDE-PACK', description: 'Older lot packaging damaged, picked next fresh lot', type: 'FIFO override', needsApproval: true, sapMovementType: 'N/A (WMS Override Log)', status: 'ACTIVE' },
    { code: 'LINE-RET-DEFECT', description: 'Assembly line reject returned to warehouse quarantine', type: 'return', needsApproval: true, sapMovementType: 'Movement 262 (GI Reversal)', status: 'ACTIVE' },
    { code: 'LINE-RET-SURPLUS', description: 'Shift end surplus returned to staging stock', type: 'return', needsApproval: false, sapMovementType: 'Movement 262 (GI Reversal)', status: 'ACTIVE' }
  ],

  userMaster: [
    { userId: 'HND-USR-1001', name: 'Rajesh Sharma', employeeNo: 'EMP-7802', role: 'WMS_ADMIN', plant: 'HMSI Narsapur Plant 1', shift: 'General (08:00 - 17:00)', email: 'rajesh.sharma@hmsi.co.in', mobile: '+91 98450 78021', handheldPin: '4821', approvalLimit: 100000, status: 'ACTIVE', lastLogin: '24-Sep-2026 08:30' },
    { userId: 'HND-USR-1002', name: 'Sanjay Verma', employeeNo: 'EMP-7814', role: 'WAREHOUSE_OP', plant: 'HMSI Narsapur Plant 1', shift: 'Shift A (06:00 - 14:30)', email: 'sanjay.verma@hmsi.co.in', mobile: '+91 98450 78140', handheldPin: '1102', approvalLimit: 0, status: 'ACTIVE', lastLogin: '24-Sep-2026 06:00' },
    { userId: 'HND-USR-1003', name: 'Ramesh Gowda', employeeNo: 'EMP-7822', role: 'SECURITY_OFFICER', plant: 'HMSI Narsapur Plant 1', shift: 'Shift A (06:00 - 14:30)', email: 'ramesh.gowda@hmsi.co.in', mobile: '+91 97410 78220', handheldPin: '3391', approvalLimit: 0, status: 'ACTIVE', lastLogin: '24-Sep-2026 05:45' },
    { userId: 'HND-USR-1004', name: 'Anand Murthy', employeeNo: 'EMP-7835', role: 'LINE_SUPERVISOR', plant: 'HMSI Narsapur Plant 1', shift: 'Shift A (06:00 - 14:30)', email: 'anand.murthy@hmsi.co.in', mobile: '+91 96112 78350', handheldPin: '5520', approvalLimit: 50000, status: 'ACTIVE', lastLogin: '24-Sep-2026 06:15' },
    { userId: 'HND-USR-1005', name: 'Praveen Kumar', employeeNo: 'EMP-7848', role: 'WAREHOUSE_OP', plant: 'HMSI Narsapur Plant 2', shift: 'Shift A (06:00 - 14:30)', email: 'praveen.kumar@hmsi.co.in', mobile: '+91 99001 78480', handheldPin: '8810', approvalLimit: 0, status: 'ACTIVE', lastLogin: '24-Sep-2026 06:00' }
  ],

  deviceMaster: [
    { deviceId: 'ZEBRA-TC57-01', type: 'handheld', model: 'Zebra TC57 Touch Computer', serialNo: 'ZBR-57-99401', plant: 'HMSI Narsapur Plant 1', zone: 'ZONE-A-PWR', ip: '10.24.101.45', assignedUser: 'Sanjay Verma', defaultLabel: 'Standard Pallet Label', status: 'ONLINE', lastPing: '24-Sep-2026 10:44' },
    { deviceId: 'ZEBRA-TC57-02', type: 'handheld', model: 'Zebra TC57 Touch Computer', serialNo: 'ZBR-57-99402', plant: 'HMSI Narsapur Plant 2', zone: 'ZONE-P2-MC', ip: '10.24.102.12', assignedUser: 'Praveen Kumar', defaultLabel: 'Standard Pallet Label', status: 'ONLINE', lastPing: '24-Sep-2026 10:42' },
    { deviceId: 'ZEBRA-ZT411-P1', type: 'label printer', model: 'Zebra ZT411 Industrial Thermal 300dpi', serialNo: 'ZBR-ZT-88101', plant: 'HMSI Narsapur Plant 1', zone: 'DOCK-04 (Receiving)', ip: '10.24.101.80', assignedUser: 'Dock Receiving Desk', defaultLabel: 'Pallet / HU Label (100x150mm)', status: 'ONLINE', lastPing: '24-Sep-2026 10:45' },
    { deviceId: 'ZEBRA-ZT411-P2', type: 'label printer', model: 'Zebra ZT411 Industrial Thermal 300dpi', serialNo: 'ZBR-ZT-88102', plant: 'HMSI Narsapur Plant 2', zone: 'DOCK-05 (Receiving)', ip: '10.24.102.80', assignedUser: 'Dock Receiving Desk', defaultLabel: 'Pallet / HU Label (100x150mm)', status: 'ONLINE', lastPing: '24-Sep-2026 10:40' }
  ],

  // -------------------------------------------------------------
  // 3. INBOUND MODULE STATE & DEMO WALKTHROUGH (B1 - B8)
  // -------------------------------------------------------------
  purchaseOrders: [
    {
      poNumber: 'PO-HND-2026-00501',
      supplier: 'Nissin Brakes India Pvt Ltd',
      plant: 'HMSI Narsapur Plant 1',
      materialCode: 'HND-BRK-PAD-01',
      materialDescription: 'Nissin Front Disc Brake Pad Set',
      orderedQty: 1000,
      asnQty: 600,
      receivedQty: 590,
      openQty: 400,
      uom: 'EA',
      deliveryDate: '24-Sep-2026',
      status: 'Partially received',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      poNumber: 'PO-HND-2026-00421',
      supplier: 'Keihin India Electronics Pvt Ltd',
      plant: 'HMSI Narsapur Plant 1',
      materialCode: 'HND-THROT-KEIHIN',
      materialDescription: 'Keihin PGM-FI 26mm Throttle Body',
      orderedQty: 500,
      asnQty: 500,
      receivedQty: 500,
      openQty: 0,
      uom: 'EA',
      deliveryDate: '23-Sep-2026',
      status: 'Closed',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      poNumber: 'PO-HND-2026-00422',
      supplier: 'Mitsuba Sical India Pvt Ltd',
      plant: 'HMSI Narsapur Plant 1',
      materialCode: 'HND-STR-MITSUBA',
      materialDescription: 'Mitsuba ACG Silent Starter & Generator 12V',
      orderedQty: 400,
      asnQty: 400,
      receivedQty: 400,
      openQty: 0,
      uom: 'EA',
      deliveryDate: '23-Sep-2026',
      status: 'Closed',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      poNumber: 'PO-HND-2026-00425',
      supplier: 'Showa India Pvt Ltd',
      plant: 'HMSI Narsapur Plant 2',
      materialCode: 'HND-SHK-SHOWA',
      materialDescription: 'Showa Telescopic Front Fork Set',
      orderedQty: 400,
      asnQty: 400,
      receivedQty: 0,
      openQty: 400,
      uom: 'SET',
      deliveryDate: '24-Sep-2026',
      status: 'Open',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    }
  ],

  asns: [
    {
      asnNumber: 'ASN-HND-2026-00450',
      poNumber: 'PO-HND-2026-00501',
      plant: 'HMSI Narsapur Plant 1',
      supplier: 'Nissin Brakes India Pvt Ltd',
      materialCode: 'HND-BRK-PAD-01',
      materialDescription: 'Nissin Front Disc Brake Pad Set',
      shippedQty: 600,
      noOfPallets: 6,
      vehicleNo: 'KA-04-E-1190',
      eta: '24-Sep-2026 08:30',
      status: 'Received',
      receivedGoodQty: 590,
      damagedQty: 5,
      shortQty: 5,
      excessQty: 0
    },
    {
      asnNumber: 'ASN-HND-2026-00451',
      poNumber: 'PO-HND-2026-00425',
      plant: 'HMSI Narsapur Plant 2',
      supplier: 'Showa India Pvt Ltd',
      materialCode: 'HND-SHK-SHOWA',
      materialDescription: 'Showa Telescopic Front Fork Set',
      shippedQty: 400,
      noOfPallets: 8,
      vehicleNo: 'KA-53-Z-9912',
      eta: '24-Sep-2026 11:30',
      status: 'At dock',
      receivedGoodQty: 0,
      damagedQty: 0,
      shortQty: 0,
      excessQty: 0
    }
  ],

  gateEntries: [
    {
      gateEntryNo: 'GE-HND-2026-01045',
      plant: 'HMSI Narsapur Plant 1',
      vehicleNo: 'KA-04-E-1190',
      driverName: 'Ranganath Swamy',
      driverMobile: '+91 98450 33819',
      supplier: 'Nissin Brakes India Pvt Ltd',
      poNumber: 'PO-HND-2026-00501',
      asnNumber: 'ASN-HND-2026-00450',
      arrivalTime: '24-Sep-2026 08:30',
      dockAssigned: 'DOCK-04 (Chassis & Braking Systems)',
      exitTime: '24-Sep-2026 10:45',
      turnaroundMinutes: 135,
      status: 'Unloaded'
    },
    {
      gateEntryNo: 'GE-HND-2026-01046',
      plant: 'HMSI Narsapur Plant 2',
      vehicleNo: 'KA-53-Z-9912',
      driverName: 'Anil Kumar',
      driverMobile: '+91 96112 55901',
      supplier: 'Showa India Pvt Ltd',
      poNumber: 'PO-HND-2026-00425',
      asnNumber: 'ASN-HND-2026-00451',
      arrivalTime: '24-Sep-2026 09:15',
      dockAssigned: 'DOCK-06 (Motorcycle Inbound)',
      exitTime: '—',
      turnaroundMinutes: 90,
      status: 'At dock'
    }
  ],

  receivingBatches: [
    {
      receivingId: 'REC-2026-0089',
      plant: 'HMSI Narsapur Plant 1',
      asnNumber: 'ASN-HND-2026-00450',
      poNumber: 'PO-HND-2026-00501',
      vehicleNo: 'KA-04-E-1190',
      supplier: 'Nissin Brakes India Pvt Ltd',
      materialCode: 'HND-BRK-PAD-01',
      expectedQty: 600,
      scannedGoodQty: 590,
      damagedQty: 5,
      shortQty: 5,
      excessQty: 0,
      progressPct: 100,
      operator: 'Sanjay Verma (Op 01)',
      handheldId: 'ZEBRA-TC57-01',
      dock: 'DOCK-04',
      status: 'Completed',
      mrnGenerated: 'MRN-HND-2026-00088'
    },
    {
      receivingId: 'REC-2026-0090',
      plant: 'HMSI Narsapur Plant 2',
      asnNumber: 'ASN-HND-2026-00451',
      poNumber: 'PO-HND-2026-00425',
      vehicleNo: 'KA-53-Z-9912',
      supplier: 'Showa India Pvt Ltd',
      materialCode: 'HND-SHK-SHOWA',
      expectedQty: 400,
      scannedGoodQty: 180,
      damagedQty: 0,
      shortQty: 0,
      excessQty: 0,
      progressPct: 45,
      operator: 'Praveen Kumar (Op 04)',
      handheldId: 'ZEBRA-TC57-02',
      dock: 'DOCK-06',
      status: 'In progress',
      mrnGenerated: '—'
    }
  ],

  mrns: [
    {
      mrnNumber: 'MRN-HND-2026-00088',
      plant: 'HMSI Narsapur Plant 1',
      poNumber: 'PO-HND-2026-00501',
      asnNumber: 'ASN-HND-2026-00450',
      supplier: 'Nissin Brakes India Pvt Ltd',
      materialCode: 'HND-BRK-PAD-01',
      materialDescription: 'Nissin Front Disc Brake Pad Set',
      asnQty: 600,
      goodQty: 590,
      damagedQty: 5,
      shortQty: 5,
      excessQty: 0,
      reasonCodes: 'DAMAGE-TRANSIT (5 EA), SHORT-UNLOAD (5 EA)',
      createdBy: 'Sanjay Verma (Warehouse Operator)',
      createdDate: '24-Sep-2026 09:40',
      status: 'Approved',
      approvedBy: 'Rajesh Sharma (Warehouse Manager)',
      approvalDate: '24-Sep-2026 09:45',
      damagePhotoAttached: true,
      grnNumber: 'GRN-HND-2026-00520'
    },
    {
      mrnNumber: 'MRN-HND-2026-00089',
      plant: 'HMSI Narsapur Plant 2',
      poNumber: 'PO-HND-2026-00425',
      asnNumber: 'ASN-HND-2026-00451',
      supplier: 'Showa India Pvt Ltd',
      materialCode: 'HND-SHK-SHOWA',
      materialDescription: 'Showa Telescopic Front Fork Set',
      asnQty: 400,
      goodQty: 398,
      damagedQty: 2,
      shortQty: 0,
      excessQty: 0,
      reasonCodes: 'DAMAGE-TRANSIT (2 SET)',
      createdBy: 'Praveen Kumar (Warehouse Operator)',
      createdDate: '24-Sep-2026 10:15',
      status: 'Pending approval',
      approvedBy: '—',
      approvalDate: '—',
      damagePhotoAttached: true,
      grnNumber: '—'
    }
  ],

  goodsReceiptNotes: [
    {
      grnNumber: 'GRN-HND-2026-00520',
      plant: 'HMSI Narsapur Plant 1',
      mrnNumber: 'MRN-HND-2026-00088',
      poNumber: 'PO-HND-2026-00501',
      supplier: 'Nissin Brakes India Pvt Ltd',
      materialCode: 'HND-BRK-PAD-01',
      acceptedQuantity: 590,
      uom: 'EA',
      sapMaterialDocNo: 'SAP-MAT-5001928500',
      postingDate: '24-Sep-2026 09:46',
      sapStatus: 'posted',
      inspector: 'Rajesh Sharma',
      putawayTaskId: 'PUT-2026-0088'
    },
    {
      grnNumber: 'GRN-HND-2026-00481',
      plant: 'HMSI Narsapur Plant 1',
      mrnNumber: 'MRN-HND-2026-00081',
      poNumber: 'PO-HND-2026-00418',
      supplier: 'Keihin India Electronics Pvt Ltd',
      materialCode: 'HND-THROT-KEIHIN',
      acceptedQuantity: 500,
      uom: 'EA',
      sapMaterialDocNo: 'SAP-DOC-5001928491',
      postingDate: '18-Sep-2026 14:22',
      sapStatus: 'posted',
      inspector: 'Suresh Quality Lead',
      putawayTaskId: 'PUT-HND-001'
    },
    {
      grnNumber: 'GRN-HND-2026-00522',
      plant: 'HMSI Narsapur Plant 2',
      mrnNumber: 'MRN-HND-2026-00085',
      poNumber: 'PO-HND-2026-00388',
      supplier: 'Keihin India Electronics Pvt Ltd',
      materialCode: 'HND-ECU-KEIHIN-01',
      acceptedQuantity: 50,
      uom: 'EA',
      sapMaterialDocNo: 'SAP-MAT-5001928510',
      postingDate: '24-Sep-2026 08:15',
      sapStatus: 'pending',
      inspector: 'Rajesh Sharma',
      putawayTaskId: 'PUT-2026-0092'
    }
  ],

  discrepancies: [
    {
      discrepancyNo: 'DISC-2026-0088',
      plant: 'HMSI Narsapur Plant 1',
      poNumber: 'PO-HND-2026-00501',
      asnNumber: 'ASN-HND-2026-00450',
      supplier: 'Nissin Brakes India Pvt Ltd',
      materialCode: 'HND-BRK-PAD-01',
      materialDescription: 'Nissin Front Disc Brake Pad Set',
      expectedQty: 600,
      receivedQty: 590,
      shortQty: 5,
      damagedQty: 5,
      reason: 'Transit carton crushed & 5 EA shortage in Box #4',
      quarantineBin: 'QC-REJECT-ZONE-01',
      action: 'Debit Note Issued & Supplier Notified',
      status: 'Under Commercial Settlement',
      reportedBy: 'Sanjay Verma (Dock 04)',
      timestamp: '24-Sep-2026 09:42',
      sapDebitNote: 'SAP-DN-9002210'
    },
    {
      discrepancyNo: 'DISC-HND-2026-9041',
      plant: 'HMSI Narsapur Plant 1',
      poNumber: 'PO-HND-2026-00421',
      asnNumber: 'ASN-HND-2026-00391',
      supplier: 'Keihin India Electronics Pvt Ltd',
      materialCode: 'HND-THROT-KEIHIN',
      materialDescription: 'Keihin PGM-FI 26mm Throttle Body',
      expectedQty: 500,
      receivedQty: 480,
      shortQty: 20,
      damagedQty: 0,
      reason: '1 Carton missing from trailer seal count',
      quarantineBin: 'QC-REJECT-ZONE-01',
      action: 'Debit Note Issued',
      status: 'Closed',
      reportedBy: 'Sanjay Verma (Dock 04)',
      timestamp: '23-Sep-2026 09:12',
      sapDebitNote: 'SAP-DN-9002198'
    },
    {
      discrepancyNo: 'DISC-HND-2026-9045',
      plant: 'HMSI Narsapur Plant 2',
      poNumber: 'PO-HND-2026-00425',
      asnNumber: 'ASN-HND-2026-00451',
      supplier: 'Showa India Pvt Ltd',
      materialCode: 'HND-SHK-SHOWA',
      materialDescription: 'Showa Telescopic Front Fork Set',
      expectedQty: 400,
      receivedQty: 398,
      shortQty: 0,
      damagedQty: 2,
      reason: 'Chrome surface scratched during transit',
      quarantineBin: 'QC-REJECT-ZONE-01',
      action: 'Return to Vendor (RTV) Movement 122',
      status: 'Open',
      reportedBy: 'Praveen Kumar (Dock 06)',
      timestamp: '24-Sep-2026 10:20',
      sapDebitNote: 'SAP-DN-9002218'
    }
  ],

  // -------------------------------------------------------------
  // 4. INVENTORY MODULE STATE (C1 - C5)
  // -------------------------------------------------------------
  putawayTasks: [
    {
      taskNo: 'PUT-2026-0088',
      plant: 'HMSI Narsapur Plant 1',
      palletHuId: 'HU-BRK-2026-00101',
      materialCode: 'HND-BRK-PAD-01',
      materialDescription: 'Nissin Front Disc Brake Pad Set',
      qty: 590,
      uom: 'EA',
      fromDock: 'DOCK-04 (Chassis & Brakes)',
      suggestedBin: 'A-01-05',
      actualBin: 'A-01-05',
      overrideReason: '—',
      operator: 'Sanjay Verma (Op 01)',
      status: 'Completed',
      createdTime: '24-Sep-2026 09:47',
      completedTime: '24-Sep-2026 09:58',
      isOverdue: false
    },
    {
      taskNo: 'PUT-HND-003',
      plant: 'HMSI Narsapur Plant 1',
      palletHuId: 'HU-HND-2026-009809',
      materialCode: 'HND-TYR-MRF-90',
      materialDescription: 'MRF Nylogrip Zapper 90/90-12 Tubeless Tyre',
      qty: 130,
      uom: 'EA',
      fromDock: 'DOCK-03 (Tyres & Wheels)',
      suggestedBin: 'RM-D01-R01-S01-B01',
      actualBin: '—',
      overrideReason: '—',
      operator: 'Vikram Patil (Forklift)',
      status: 'In progress',
      createdTime: '24-Sep-2026 08:30',
      completedTime: '—',
      isOverdue: true
    },
    {
      taskNo: 'PUT-2026-0092',
      plant: 'HMSI Narsapur Plant 2',
      palletHuId: 'HU-HND-2026-009805',
      materialCode: 'HND-ECU-KEIHIN-01',
      materialDescription: 'Keihin Master ECU OBD2',
      qty: 50,
      uom: 'EA',
      fromDock: 'DOCK-05 (Electronics Inbound)',
      suggestedBin: 'RM-B02-R01-S01-B01',
      actualBin: '—',
      overrideReason: '—',
      operator: 'Praveen Kumar (Forklift)',
      status: 'In progress',
      createdTime: '24-Sep-2026 08:45',
      completedTime: '—',
      isOverdue: false
    }
  ],

  handlingUnits: [
    {
      huNumber: 'HU-BRK-2026-00101',
      lpn: 'LPN-BRK-00101',
      materialCode: 'HND-BRK-PAD-01',
      description: 'Nissin Front Disc Brake Pad Set',
      quantity: 488, // Remaining after count adj (-2) and issue (100)
      uom: 'EA',
      plant: 'HMSI Narsapur Plant 1',
      location: 'A-01-05',
      batch: 'BAT-NIS-2026-09-24-01',
      receiptDate: '24-Sep-2026',
      fifoDate: '24-Sep-2026',
      fifoPriority: 1,
      stockStatus: 'AVAILABLE',
      supplier: 'Nissin Brakes India Pvt Ltd',
      poNumber: 'PO-HND-2026-00501',
      agingDays: 1,
      agingBucket: '0–7 Days'
    },
    {
      huNumber: 'HU-HND-2026-009801',
      lpn: 'LPN-HND-009801',
      materialCode: 'HND-THROT-KEIHIN',
      description: 'Keihin PGM-FI 26mm Throttle Body (Activa 6G)',
      quantity: 80,
      uom: 'EA',
      plant: 'HMSI Narsapur Plant 1',
      location: 'RM-A03-R04-S02-B05',
      batch: 'BAT-KEI-2026-09-18-01',
      receiptDate: '18-Sep-2026',
      fifoDate: '18-Sep-2026',
      fifoPriority: 1,
      stockStatus: 'AVAILABLE',
      supplier: 'Keihin India Electronics Pvt Ltd',
      poNumber: 'PO-HND-2026-00418',
      agingDays: 6,
      agingBucket: '0–7 Days'
    },
    {
      huNumber: 'HU-HND-2026-009805',
      lpn: 'LPN-HND-009805',
      materialCode: 'HND-ECU-KEIHIN-01',
      description: 'Keihin Master Engine Control Unit (ECU)',
      quantity: 50,
      uom: 'EA',
      plant: 'HMSI Narsapur Plant 2',
      location: 'RM-B02-R01-S01-B01',
      batch: 'BAT-KEI-2026-08-25-01',
      receiptDate: '25-Aug-2026',
      fifoDate: '25-Aug-2026',
      fifoPriority: 1,
      stockStatus: 'AVAILABLE',
      supplier: 'Keihin India Electronics Pvt Ltd',
      poNumber: 'PO-HND-2026-00388',
      agingDays: 30,
      agingBucket: '16–30 Days'
    }
  ],

  // Integrated Cycle Count & Adjustment Single-Screen Data (C3)
  cycleCountPlans: [
    {
      countNo: 'CC-2026-0091',
      plant: 'HMSI Narsapur Plant 1',
      zone: 'ZONE-A-PWR',
      abcClass: 'A',
      plannedDate: '24-Sep-2026',
      counter: 'Sanjay Verma (Op 01)',
      progressPct: 100,
      status: 'Closed',
      blindCount: true,
      lines: [
        {
          lineId: 1,
          bin: 'A-01-05',
          materialCode: 'HND-BRK-PAD-01',
          materialDescription: 'Nissin Front Disc Brake Pad Set',
          huLot: 'HU-BRK-2026-00101 / BAT-NIS-2026-09-24-01',
          systemQty: 590,
          countedQty: 588,
          varianceQty: -2,
          variancePct: -0.34,
          isOutsideTolerance: true,
          reasonCode: 'COUNT-VAR-SHRINK',
          recountFlag: false,
          adjustmentQty: -2,
          approvedBy: 'Rajesh Sharma (Manager)',
          sapDocNo: 'SAP-ADJ-70019482',
          sapStatus: 'posted',
          lineStatus: 'Posted to SAP'
        }
      ]
    },
    {
      countNo: 'CC-2026-0092',
      plant: 'HMSI Narsapur Plant 1',
      zone: 'ZONE-B-ELE',
      abcClass: 'A',
      plannedDate: '24-Sep-2026',
      counter: 'Prakash (Op 03)',
      progressPct: 40,
      status: 'Counting',
      blindCount: true,
      lines: [
        {
          lineId: 1,
          bin: 'RM-B02-R01-S01-B01',
          materialCode: 'HND-ECU-KEIHIN-01',
          materialDescription: 'Keihin Master ECU OBD2',
          huLot: 'HU-HND-2026-009805 / BAT-KEI-2026-08-25-01',
          systemQty: 50,
          countedQty: 50,
          varianceQty: 0,
          variancePct: 0.0,
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
    }
  ],

  fifoExceptions: [
    {
      exceptionId: 'FIFO-EXC-001',
      materialCode: 'HND-THROT-KEIHIN',
      requestedLot: 'BAT-KEI-2026-09-18-01 (6 days old)',
      pickedLot: 'BAT-KEI-2026-09-20-02 (4 days old)',
      bin: 'RM-A03-R05-S02-B02',
      picker: 'Sanjay Verma',
      overrideReason: 'FIFO-OVERRIDE-PACK: Packaging torn on older crate, selected adjacent fresh crate',
      authorizedBy: 'Rajesh Sharma',
      timestamp: '24-Sep-2026 09:30',
      issueListRef: 'IL-HND-2026-0080'
    }
  ],

  // -------------------------------------------------------------
  // 5. OUTBOUND MODULE STATE (D1 - D5)
  // -------------------------------------------------------------
  materialRequirements: [
    {
      reqNo: 'REQ-2026-00189',
      sapReference: 'ORD-PROD-900281 (Production Plan Shift 2)',
      plant: 'HMSI Narsapur Plant 1',
      productionLine: 'Line 1 (Activa 6G Final Assembly)',
      lineCode: 'L1',
      shift: 'Shift B (14:30 - 23:00)',
      materialCode: 'HND-BRK-PAD-01',
      materialDescription: 'Nissin Front Disc Brake Pad Set',
      requiredQty: 100,
      uom: 'EA',
      requiredByTime: '24-Sep-2026 14:00',
      priority: 'urgent',
      status: 'Issued',
      linkedIssueList: 'IL-HND-2026-0081'
    },
    {
      reqNo: 'REQ-2026-00190',
      sapReference: 'ORD-PROD-900282 (Activa Engine Build)',
      plant: 'HMSI Narsapur Plant 1',
      productionLine: 'Line 3 (110cc/125cc PGM-FI Engine Sub-Assembly)',
      lineCode: 'L3',
      shift: 'Shift B (14:30 - 23:00)',
      materialCode: 'HND-THROT-KEIHIN',
      materialDescription: 'Keihin PGM-FI 26mm Throttle Body',
      requiredQty: 80,
      uom: 'EA',
      requiredByTime: '24-Sep-2026 14:30',
      priority: 'normal',
      status: 'In issue list',
      linkedIssueList: 'IL-HND-2026-0082'
    },
    {
      reqNo: 'REQ-2026-00191',
      sapReference: 'ORD-PROD-900285 (CB350 Premium Motorcycle Build)',
      plant: 'HMSI Narsapur Plant 2',
      productionLine: 'Line 4 (CB350 / H\'ness Premium Assembly)',
      lineCode: 'L4',
      shift: 'Shift A (06:00 - 14:30)',
      materialCode: 'HND-ECU-KEIHIN-01',
      materialDescription: 'Keihin Master Engine Control Unit (ECU)',
      requiredQty: 40,
      uom: 'EA',
      requiredByTime: '24-Sep-2026 11:30',
      priority: 'urgent',
      status: 'Issued',
      linkedIssueList: 'IL-HND-2026-0083'
    },
    {
      reqNo: 'REQ-2026-00192',
      sapReference: 'ORD-PROD-900288 (Hornet 2.0 Assembly Plan)',
      plant: 'HMSI Narsapur Plant 2',
      productionLine: 'Line 5 (Hornet 2.0 & Unicorn 160 Assembly)',
      lineCode: 'L5',
      shift: 'Shift B (14:30 - 23:00)',
      materialCode: 'HND-SHK-SHOWA',
      materialDescription: 'Showa Telescopic Hydraulic Front Suspension',
      requiredQty: 50,
      uom: 'SET',
      requiredByTime: '24-Sep-2026 15:00',
      priority: 'normal',
      status: 'New',
      linkedIssueList: '—'
    }
  ],

  issueLists: [
    {
      issueListNo: 'IL-HND-2026-0081',
      plant: 'HMSI Narsapur Plant 1',
      productionLine: 'Line 1 (Activa 6G Final Assembly)',
      lineCode: 'L1',
      shift: 'Shift B',
      status: 'Issued',
      items: [
        {
          materialCode: 'HND-BRK-PAD-01',
          materialDescription: 'Nissin Front Disc Brake Pad Set',
          qty: 100,
          uom: 'EA',
          allocatedHu: 'HU-BRK-2026-00101',
          lot: 'BAT-NIS-2026-09-24-01 (FIFO #1)',
          sourceBin: 'A-01-05',
          pickedQty: 100,
          status: 'Issued'
        }
      ],
      autoBuiltFromN1: true,
      createdDate: '24-Sep-2026 10:20',
      releasedBy: 'Rajesh Sharma',
      pickerAssigned: 'Sanjay Verma'
    },
    {
      issueListNo: 'IL-HND-2026-0083',
      plant: 'HMSI Narsapur Plant 2',
      productionLine: 'Line 4 (CB350 / H\'ness Premium Assembly)',
      lineCode: 'L4',
      shift: 'Shift A',
      status: 'Issued',
      items: [
        {
          materialCode: 'HND-ECU-KEIHIN-01',
          materialDescription: 'Keihin Master ECU OBD2',
          qty: 40,
          uom: 'EA',
          allocatedHu: 'HU-HND-2026-009805',
          lot: 'BAT-KEI-2026-08-25-01 (FIFO #1)',
          sourceBin: 'RM-B02-R01-S01-B01',
          pickedQty: 40,
          status: 'Issued'
        }
      ],
      autoBuiltFromN1: true,
      createdDate: '24-Sep-2026 08:45',
      releasedBy: 'Rajesh Sharma',
      pickerAssigned: 'Praveen Kumar'
    }
  ],

  pickingTasks: [
    {
      pickTaskNo: 'PICK-2026-0081-1',
      plant: 'HMSI Narsapur Plant 1',
      issueListNo: 'IL-HND-2026-0081',
      lineCode: 'L1',
      picker: 'Sanjay Verma (Op 01)',
      handheldId: 'ZEBRA-TC57-01',
      materialCode: 'HND-BRK-PAD-01',
      materialDescription: 'Nissin Front Disc Brake Pad Set',
      requiredQty: 100,
      pickedQty: 100,
      sourceBin: 'A-01-05',
      fifoOverrideFlag: false,
      status: 'Completed'
    },
    {
      pickTaskNo: 'PICK-2026-0083-1',
      plant: 'HMSI Narsapur Plant 2',
      issueListNo: 'IL-HND-2026-0083',
      lineCode: 'L4',
      picker: 'Praveen Kumar (Op 04)',
      handheldId: 'ZEBRA-TC57-02',
      materialCode: 'HND-ECU-KEIHIN-01',
      materialDescription: 'Keihin Master ECU OBD2',
      requiredQty: 40,
      pickedQty: 40,
      sourceBin: 'RM-B02-R01-S01-B01',
      fifoOverrideFlag: false,
      status: 'Completed'
    }
  ],

  lineIssues: [
    {
      issueNo: 'ISS-2026-0081',
      plant: 'HMSI Narsapur Plant 1',
      issueListNo: 'IL-HND-2026-0081',
      productionLine: 'Line 1 (Activa 6G Final Assembly)',
      lineCode: 'L1',
      materialCode: 'HND-BRK-PAD-01',
      materialDescription: 'Nissin Front Disc Brake Pad Set',
      qtyIssued: 100,
      uom: 'EA',
      deliveredBy: 'Sanjay Verma (Trolley #04)',
      receivedAtLineTime: '24-Sep-2026 10:40',
      stagingBin: 'STG-P1-L1',
      sapGoodsIssueDocNo: 'SAP-MAT-6001928410',
      sapStatus: 'posted',
      status: 'Delivered to Line'
    },
    {
      issueNo: 'ISS-2026-0083',
      plant: 'HMSI Narsapur Plant 2',
      issueListNo: 'IL-HND-2026-0083',
      productionLine: 'Line 4 (CB350 / H\'ness Premium Assembly)',
      lineCode: 'L4',
      materialCode: 'HND-ECU-KEIHIN-01',
      materialDescription: 'Keihin Master ECU OBD2',
      qtyIssued: 40,
      uom: 'EA',
      deliveredBy: 'Praveen Kumar (Trolley #02)',
      receivedAtLineTime: '24-Sep-2026 09:10',
      stagingBin: 'STG-P2-L4',
      sapGoodsIssueDocNo: 'SAP-MAT-6001928415',
      sapStatus: 'posted',
      status: 'Delivered to Line'
    }
  ],

  lineReturns: [
    {
      returnNo: 'RET-2026-0014',
      plant: 'HMSI Narsapur Plant 1',
      productionLine: 'Line 2 (Shine 125 & SP125 Assembly)',
      lineCode: 'L2',
      materialCode: 'HND-SHK-SHOWA',
      materialDescription: 'Showa Front Fork Set',
      qty: 2,
      uom: 'SET',
      reason: 'LINE-RET-DEFECT (Surface scratch on chrome stanchion)',
      targetBin: 'QC-REJECT-ZONE-01',
      status: 'Quarantined',
      sapReversalDocNo: 'SAP-REV-40019284'
    },
    {
      returnNo: 'RET-2026-0015',
      plant: 'HMSI Narsapur Plant 2',
      productionLine: 'Line 5 (Hornet 2.0 & Unicorn 160 Assembly)',
      lineCode: 'L5',
      materialCode: 'HND-ECU-KEIHIN-01',
      materialDescription: 'Keihin Master ECU OBD2',
      qty: 1,
      uom: 'EA',
      reason: 'LINE-RET-SURPLUS (Shift end unused surplus)',
      targetBin: 'QC-REJECT-ZONE-01',
      status: 'Quarantined',
      sapReversalDocNo: 'SAP-REV-40019290'
    }
  ],

  // -------------------------------------------------------------
  // 6. ADMIN MODULE STATE (F1 - F4)
  // -------------------------------------------------------------
  sapSyncLogs: [
    { syncId: 'SAP-SYNC-8822', interfaceType: 'BAPI_GOODSMVT_CREATE', direction: 'WMS → SAP', wmsRef: 'ISS-2026-0081', sapDocNo: 'SAP-MAT-6001928410', payloadType: 'Movement 261 (Goods Issue to Line 1)', status: 'success', errorText: '—', timestamp: '24-Sep-2026 10:41:00' },
    { syncId: 'SAP-SYNC-8821', interfaceType: 'BAPI_INV_ADJUSTMENT', direction: 'WMS → SAP', wmsRef: 'CC-2026-0091 (A-01-05)', sapDocNo: 'SAP-ADJ-70019482', payloadType: 'Movement 711 (Cycle Count Variance -2)', status: 'success', errorText: '—', timestamp: '24-Sep-2026 10:18:22' },
    { syncId: 'SAP-SYNC-8820', interfaceType: 'BAPI_GOODSMVT_CREATE', direction: 'WMS → SAP', wmsRef: 'GRN-HND-2026-00520', sapDocNo: 'SAP-MAT-5001928500', payloadType: 'Movement 101 (Goods Receipt 590 EA)', status: 'success', errorText: '—', timestamp: '24-Sep-2026 09:46:12' },
    { syncId: 'SAP-SYNC-8819', interfaceType: 'BAPI_PO_GETDETAIL1', direction: 'SAP → WMS', wmsRef: 'PO-HND-2026-00501', sapDocNo: 'SAP-PO-4500198501', payloadType: 'Purchase Order 1,000 EA Sync', status: 'success', errorText: '—', timestamp: '24-Sep-2026 08:00:15' },
    { syncId: 'SAP-SYNC-8818', interfaceType: 'BAPI_GOODSMVT_CREATE', direction: 'WMS → SAP', wmsRef: 'GRN-HND-2026-00482', sapDocNo: '—', payloadType: 'Movement 101 (Batch GRN)', status: 'failed', errorText: 'RFC_ERROR_COMMUNICATION: S/4HANA Gateway timeout', timestamp: '24-Sep-2026 07:45:00' }
  ],

  auditTrail: [
    { timestamp: '24-Sep-2026 10:40:15', user: 'Sanjay Verma', role: 'WAREHOUSE_OP', deviceId: 'ZEBRA-TC57-01', transaction: 'Issue to Line Confirmation', reference: 'ISS-2026-0081', oldValue: 'Status: In-Picking (100 EA)', newValue: 'Delivered to Line 1 Staging STG-P1-L1 (SAP Doc: SAP-MAT-6001928410)' },
    { timestamp: '24-Sep-2026 10:18:00', user: 'Rajesh Sharma', role: 'WMS_ADMIN', deviceId: 'PC Console (WH-MGR-01)', transaction: 'Stock Adjustment Approved', reference: 'CC-2026-0091', oldValue: 'Stock in A-01-05: 590 EA', newValue: 'Stock in A-01-05: 588 EA (Adj: -2 EA, Shrinkage)' },
    { timestamp: '24-Sep-2026 09:46:00', user: 'Rajesh Sharma', role: 'WMS_ADMIN', deviceId: 'PC Console (WH-MGR-01)', transaction: 'MRN Approval & GRN Post', reference: 'MRN-HND-2026-00088', oldValue: 'Status: Pending Approval (590 Good / 5 Damaged / 5 Short)', newValue: 'Status: Approved → Created GRN-HND-2026-00520 (SAP Mvt 101)' },
    { timestamp: '24-Sep-2026 08:30:00', user: 'Ramesh Gowda', role: 'SECURITY_OFFICER', deviceId: 'ZEBRA-TC26-01', transaction: 'Gate Entry & Dock Assign', reference: 'GE-HND-2026-01045', oldValue: 'Vehicle: KA-04-E-1190 Arrived', newValue: 'Assigned to DOCK-04 (Chassis & Braking Systems)' }
  ],

  labelTemplates: [
    { templateId: 'LBL-PALLET-HU', name: 'Pallet / HU Label (100 x 150 mm)', barcodeType: 'Code 128 / GS1-128', fields: 'HU ID, Material Code & Desc, Batch, Qty, Receipt Date, PO No., Supplier, Barcode', targetPrinter: 'ZEBRA-ZT411-P1 (Dock 04)' },
    { templateId: 'LBL-BIN-BARCODE', name: 'Storage Bin Barcode Label (50 x 100 mm)', barcodeType: 'Code 39 / 2D DataMatrix', fields: 'Bin Code, Zone, Capacity, Max Weight, Barcode', targetPrinter: 'ZEBRA-ZT411-P1 (Dock 04)' },
    { templateId: 'LBL-PICK-SLIP', name: 'Outbound Pick List & Issue Slip', barcodeType: 'Code 128', fields: 'Issue List No., Line, Shift, Materials, Allocated Bins, Qty', targetPrinter: 'LaserJet Office MGR-01' },
    { templateId: 'LBL-MRN-COPY', name: 'MRN / GRN Inspection Copy', barcodeType: 'PDF Document with Barcode', fields: 'Document No., PO, Supplier, Good/Damaged/Short Qty, QC Signatures', targetPrinter: 'LaserJet Office MGR-01' }
  ],

  notificationSettings: [
    { id: 'NOTIF-01', alertType: 'Low Stock Shortage Alert', recipients: 'wh-lead@hmsi.co.in, purchase@hmsi.co.in', enabled: true },
    { id: 'NOTIF-02', alertType: 'SAP RFC / Interface Posting Failure', recipients: 'sap-admin@hmsi.co.in, wh-lead@hmsi.co.in', enabled: true },
    { id: 'NOTIF-03', alertType: 'FIFO Override Authorization Alert', recipients: 'wh-lead@hmsi.co.in, qa-manager@hmsi.co.in', enabled: true },
    { id: 'NOTIF-04', alertType: 'Overdue Putaway (> 2 Hours at Dock)', recipients: 'wh-supervisors@hmsi.co.in', enabled: true },
    { id: 'NOTIF-05', alertType: 'Cycle Count Variance > Tolerance Limit', recipients: 'finance-audit@hmsi.co.in, wh-lead@hmsi.co.in', enabled: true }
  ]
};

// -------------------------------------------------------------
// LOCALSTORAGE LOAD & SAVE CONTROLLER
// -------------------------------------------------------------
function loadWMSState() {
  try {
    const saved = localStorage.getItem(WMS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.materials && parsed.asns && parsed.mrns && parsed.cycleCountPlans) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('WMS: Failed to parse localStorage state. Resetting to Honda spec default.');
  }
  saveWMSState(WMS_DEFAULT_STATE);
  return JSON.parse(JSON.stringify(WMS_DEFAULT_STATE));
}

function saveWMSState(state) {
  try {
    localStorage.setItem(WMS_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('WMS: Failed to persist state into localStorage.', e);
  }
}

function resetWMSData() {
  localStorage.removeItem(WMS_STORAGE_KEY);
  window.wms = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE));
  saveWMSState(window.wms);
  if (typeof renderAllWMSViews === 'function') {
    renderAllWMSViews();
  }
  alert('HMSIL WMS State reset to Specification Default (Brake Pad Walkthrough Demo Active).');
}

// Universal CSV Export
function exportTableToCSV(dataArray, filename = 'Honda_WMS_Export.csv') {
  if (!dataArray || !dataArray.length) {
    alert('No data available to export.');
    return;
  }
  
  const headers = Object.keys(dataArray[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of dataArray) {
    const values = headers.map(header => {
      let val = row[header];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val).replace(/"/g, '""');
      } else {
        val = ('' + (val ?? '')).replace(/"/g, '""');
      }
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
