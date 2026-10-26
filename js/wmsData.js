// HONDA MOTORCYCLE & SCOOTER INDIA (HMSI) - MANUFACTURING WMS
// Enterprise Data Model, Master State & Demo Flow Engine
// Aligned to HMSIL WMS Screen & Functional Specification

const WMS_STORAGE_KEY = 'HONDA_HMSI_WMS_STATE_V8_MULTIPART_PO';

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
  isStockFrozen: false,
  stockFreezeInfo: {
    isFrozen: false,
    countNo: null,
    frozenAt: null,
    frozenBy: null,
    reason: 'Wall-to-Wall Annual Physical Inventory Count'
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
      unitCost: 420,
      daysInactive: 1,
      lastMovementDate: '24-Sep-2026',
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
      unitCost: 1850,
      daysInactive: 4,
      lastMovementDate: '20-Sep-2026',
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
      unitCost: 4500,
      daysInactive: 32,
      lastMovementDate: '23-Aug-2026',
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
      unitCost: 2200,
      daysInactive: 16,
      lastMovementDate: '08-Sep-2026',
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
      unitCost: 380,
      daysInactive: 2,
      lastMovementDate: '22-Sep-2026',
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
      unitCost: 3200,
      daysInactive: 68,
      lastMovementDate: '18-Jul-2026',
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
      unitCost: 1450,
      daysInactive: 3,
      lastMovementDate: '21-Sep-2026',
      batchManaged: true,
      fifoApplicable: true,
      shelfLifeDays: 730,
      barcode: '8901452098406',
      defaultZone: 'Zone D - Tyres & Rubber Bay',
      status: 'ACTIVE',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      code: 'HND-EXH-CBR-90',
      description: 'Exhaust Muffler Assembly (CBR250R Legacy Model)',
      unit: 'EA',
      materialGroup: 'Exhaust Systems',
      plant: 'HMSI Narsapur Plant 1',
      abcClass: 'C',
      standardPackQty: 5,
      packType: 'Crate (5 EA)',
      weightKg: 5.20,
      dimensions: '600 x 200 x 200 mm',
      unitCost: 6800,
      daysInactive: 104,
      lastMovementDate: '12-Jun-2026',
      batchManaged: true,
      fifoApplicable: true,
      shelfLifeDays: 1825,
      barcode: '8901452098499',
      defaultZone: 'Zone C - Chassis & Suspension',
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
    { areaCode: 'PWR', zoneCode: 'PWR', areaName: 'Powertrain & Engine Bay', plant: 'HMSI Narsapur Plant 1', type: 'High-Bay Racking', allowedAbc: 'A, B', locationCount: 4, rackCount: 12, binCount: 120, occupiedBins: 84, utilization: '70%', status: 'ACTIVE' },
    { areaCode: 'ELE', zoneCode: 'ELE', areaName: 'Electronics & Sensors Bay', plant: 'HMSI Narsapur Plant 1', type: 'Small Parts Shelf', allowedAbc: 'A', locationCount: 2, rackCount: 6, binCount: 80, occupiedBins: 58, utilization: '72%', status: 'ACTIVE' },
    { areaCode: 'CHS', zoneCode: 'CHS', areaName: 'Chassis & Suspension Bay', plant: 'HMSI Narsapur Plant 1', type: 'Heavy High-Bay', allowedAbc: 'B, C', locationCount: 2, rackCount: 6, binCount: 90, occupiedBins: 45, utilization: '50%', status: 'ACTIVE' },
    { areaCode: 'TYR', zoneCode: 'TYR', areaName: 'Tyres & Rubber Bay', plant: 'HMSI Narsapur Plant 1', type: 'Floor Pallet Staging', allowedAbc: 'A', locationCount: 2, rackCount: 4, binCount: 60, occupiedBins: 52, utilization: '86%', status: 'ACTIVE' },
    { areaCode: 'QC', zoneCode: 'QC', areaName: 'Quality & Quarantine Inspection', plant: 'HMSI Narsapur Plant 1', type: 'Quarantine Lock-box', allowedAbc: 'A, B, C', locationCount: 1, rackCount: 2, binCount: 30, occupiedBins: 6, utilization: '20%', status: 'ACTIVE' },
    { areaCode: 'P2-MC', zoneCode: 'P2-MC', areaName: 'Plant 2 Motorcycle Powertrain', plant: 'HMSI Narsapur Plant 2', type: 'High-Bay Heavy', allowedAbc: 'A, B', locationCount: 4, rackCount: 10, binCount: 150, occupiedBins: 95, utilization: '63%', status: 'ACTIVE' }
  ],

  locationMaster: [
    { locationCode: 'PWR-LOC-A01', areaCode: 'PWR', areaName: 'Powertrain & Engine Bay', name: 'Location A01 (Fast-Mover Intake)', description: 'Primary High-Bay Intake for Brakes & Throttle Bodies', rackCount: 3, capacity: 3000, currentQty: 488, status: 'ACTIVE' },
    { locationCode: 'PWR-LOC-A02', areaCode: 'PWR', areaName: 'Powertrain & Engine Bay', name: 'Location A02 (Starter & Drive Parts)', description: 'ACG Starters, Ignition Coils & Transmission components', rackCount: 3, capacity: 2400, currentQty: 400, status: 'ACTIVE' },
    { locationCode: 'PWR-LOC-A03', areaCode: 'PWR', areaName: 'Powertrain & Engine Bay', name: 'Location A03 (Throttle Sub-Assy)', description: 'PGM-FI 26mm Throttle Bodies & Injectors', rackCount: 3, capacity: 3000, currentQty: 650, status: 'ACTIVE' },
    { locationCode: 'PWR-LOC-A04', areaCode: 'PWR', areaName: 'Powertrain & Engine Bay', name: 'Location A04 (Belts & Powertrain)', description: 'CVT Drive Belts & Variators', rackCount: 3, capacity: 2500, currentQty: 450, status: 'ACTIVE' },
    { locationCode: 'ELE-LOC-B01', areaCode: 'ELE', areaName: 'Electronics & Sensors Bay', name: 'Location B01 (ECU & Main Harness)', description: 'Static-Shielded Master ECUs & Controllers', rackCount: 3, capacity: 1500, currentQty: 50, status: 'ACTIVE' },
    { locationCode: 'CHS-LOC-C01', areaCode: 'CHS', areaName: 'Chassis & Suspension Bay', name: 'Location C01 (Forks & Suspension)', description: 'Telescopic Front Fork & Rear Cushion Sets', rackCount: 3, capacity: 3600, currentQty: 480, status: 'ACTIVE' },
    { locationCode: 'TYR-LOC-D01', areaCode: 'TYR', areaName: 'Tyres & Rubber Bay', name: 'Location D01 (Tyres Staging)', description: 'Tubeless OEM 90/90-12 Tyres Floor Pallet Bay', rackCount: 2, capacity: 3000, currentQty: 950, status: 'ACTIVE' },
    { locationCode: 'QC-LOC-Q01', areaCode: 'QC', areaName: 'Quality & Quarantine Inspection', name: 'Location Q01 (Quarantine Reject)', description: 'Transit damaged & defective lots awaiting RTV', rackCount: 2, capacity: 600, currentQty: 25, status: 'BLOCKED' }
  ],

  binMaster: [
    { binCode: 'PWR-LOC-A01-RCK-01', areaCode: 'PWR', areaName: 'Powertrain & Engine Bay', locationCode: 'PWR-LOC-A01', locationName: 'Location A01 (Fast-Mover Intake)', rackCode: 'RCK-01', zone: 'PWR', zoneName: 'Powertrain & Engine Bay', type: 'High-Bay Rack', capacity: 1000, maxWeightKg: 1200, currentQty: 488, storedMaterial: 'HND-BRK-PAD-01 (Brake Pad Set)', status: 'ACTIVE', barcode: 'BIN-PWR-LOC-A01-RCK-01' },
    { binCode: 'PWR-LOC-A03-RCK-01', areaCode: 'PWR', areaName: 'Powertrain & Engine Bay', locationCode: 'PWR-LOC-A03', locationName: 'Location A03 (Throttle Sub-Assy)', rackCode: 'RCK-01', zone: 'PWR', zoneName: 'Powertrain & Engine Bay', type: 'High-Bay Rack', capacity: 1000, maxWeightKg: 1500, currentQty: 650, storedMaterial: 'HND-THROT-KEIHIN (Throttle Body)', status: 'ACTIVE', barcode: 'BIN-PWR-LOC-A03-RCK-01' },
    { binCode: 'PWR-LOC-A02-RCK-01', areaCode: 'PWR', areaName: 'Powertrain & Engine Bay', locationCode: 'PWR-LOC-A02', locationName: 'Location A02 (Starter & Drive Parts)', rackCode: 'RCK-01', zone: 'PWR', zoneName: 'Powertrain & Engine Bay', type: 'High-Bay Rack', capacity: 800, maxWeightKg: 1000, currentQty: 400, storedMaterial: 'HND-STR-MITSUBA (ACG Starter)', status: 'ACTIVE', barcode: 'BIN-PWR-LOC-A02-RCK-01' },
    { binCode: 'PWR-LOC-A04-RCK-01', areaCode: 'PWR', areaName: 'Powertrain & Engine Bay', locationCode: 'PWR-LOC-A04', locationName: 'Location A04 (Belts & Powertrain)', rackCode: 'RCK-01', zone: 'PWR', zoneName: 'Powertrain & Engine Bay', type: 'High-Bay Rack', capacity: 1000, maxWeightKg: 1200, currentQty: 450, storedMaterial: 'HND-CVT-BELT-BND (Drive Belt)', status: 'ACTIVE', barcode: 'BIN-PWR-LOC-A04-RCK-01' },
    { binCode: 'ELE-LOC-B01-RCK-01', areaCode: 'ELE', areaName: 'Electronics & Sensors Bay', locationCode: 'ELE-LOC-B01', locationName: 'Location B01 (ECU & Main Harness)', rackCode: 'RCK-01', zone: 'ELE', zoneName: 'Electronics & Sensors Bay', type: 'Small Parts Shelf', capacity: 500, maxWeightKg: 300, currentQty: 50, storedMaterial: 'HND-ECU-KEIHIN-01 (Master ECU)', status: 'ACTIVE', barcode: 'BIN-ELE-LOC-B01-RCK-01' },
    { binCode: 'CHS-LOC-C01-RCK-01', areaCode: 'CHS', areaName: 'Chassis & Suspension Bay', locationCode: 'CHS-LOC-C01', locationName: 'Location C01 (Forks & Suspension)', rackCode: 'RCK-01', zone: 'CHS', zoneName: 'Chassis & Suspension Bay', type: 'High-Bay Rack', capacity: 1200, maxWeightKg: 2000, currentQty: 480, storedMaterial: 'HND-SHK-SHOWA (Fork Set)', status: 'ACTIVE', barcode: 'BIN-CHS-LOC-C01-RCK-01' },
    { binCode: 'TYR-LOC-D01-RCK-01', areaCode: 'TYR', areaName: 'Tyres & Rubber Bay', locationCode: 'TYR-LOC-D01', locationName: 'Location D01 (Tyres Staging)', rackCode: 'RCK-01', zone: 'TYR', zoneName: 'Tyres & Rubber Bay', type: 'Floor Staging Pallet', capacity: 1500, maxWeightKg: 2500, currentQty: 950, storedMaterial: 'HND-TYR-MRF-90 (MRF Tyres)', status: 'ACTIVE', barcode: 'BIN-TYR-LOC-D01-RCK-01' },
    { binCode: 'QC-LOC-Q01-RCK-01', areaCode: 'QC', areaName: 'Quality & Quarantine Inspection', locationCode: 'QC-LOC-Q01', locationName: 'Location Q01 (Quarantine Reject)', rackCode: 'RCK-01', zone: 'QC', zoneName: 'Quality & Quarantine Inspection', type: 'Quarantine Lock-box', capacity: 200, maxWeightKg: 500, currentQty: 25, storedMaterial: 'Damaged / Shortage Inbound Lots', status: 'BLOCKED', barcode: 'BIN-QC-LOC-Q01-RCK-01' }
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
    { lineCode: 'L4', name: 'Line 4 (CB350 / H\'ness Premium Assembly)', plant: 'HMSI Narsapur Plant 2', stagingBin: 'STG-P2-L4', shiftPattern: '2 Shifts (A/B)', dailyTarget: 400, status: 'ACTIVE' }
  ],

  // Production Area / Shop Master (Module E)
  shopMaster: [
    {
      shopCode: 'SHOP-MCH',
      name: 'Machine Shop (Machining Division)',
      plant: 'HMSI Narsapur Plant 1',
      stagingBin: 'STG-MCH-01',
      subAreas: [
        { code: 'MCH-CELL-01', name: 'Cylinder Block CNC Cell', stagingBin: 'STG-MCH-01' },
        { code: 'MCH-CELL-02', name: 'Crankcase Machining Cell', stagingBin: 'STG-MCH-02' }
      ],
      manager: 'K. R. Venkat',
      status: 'ACTIVE'
    },
    {
      shopCode: 'SHOP-PNT',
      name: 'Paint Shop (Electrostatic & Robotic Painting)',
      plant: 'HMSI Narsapur Plant 1',
      stagingBin: 'STG-PNT-01',
      subAreas: [
        { code: 'PNT-LINE-01', name: 'Plastic Body Paint Line (Activa 6G)', stagingBin: 'STG-PNT-01' },
        { code: 'PNT-LINE-02', name: 'Fuel Tank Metallic Paint Booth', stagingBin: 'STG-PNT-02' }
      ],
      manager: 'Deepak Rao',
      status: 'ACTIVE'
    },
    {
      shopCode: 'SHOP-WLD',
      name: 'Weld Shop (Robotic Frame & Chassis Welding)',
      plant: 'HMSI Narsapur Plant 1',
      stagingBin: 'STG-WLD-01',
      subAreas: [
        { code: 'WLD-ROBOT-01', name: 'Underbone Frame Robotic Cell 1', stagingBin: 'STG-WLD-01' },
        { code: 'WLD-SUB-02', name: 'Swingarm & Stand Welding Station', stagingBin: 'STG-WLD-02' }
      ],
      manager: 'Manoj Pillai',
      status: 'ACTIVE'
    },
    {
      shopCode: 'SHOP-AE',
      name: 'Assembly Engine (AE - Engine Assembly Division)',
      plant: 'HMSI Narsapur Plant 1',
      stagingBin: 'STG-AE-01',
      subAreas: [
        { code: 'AE-LINE-01', name: 'Line 3 (110cc/125cc PGM-FI Engine Sub-Assembly)', stagingBin: 'STG-AE-01' },
        { code: 'AE-TEST-01', name: 'Hot Engine Testing & Dyno Cell', stagingBin: 'STG-AE-02' }
      ],
      manager: 'Arun Deshmukh',
      status: 'ACTIVE'
    },
    {
      shopCode: 'SHOP-AF',
      name: 'Assembly Frame / Final (AF - Vehicle Final Assembly)',
      plant: 'HMSI Narsapur Plant 1',
      stagingBin: 'STG-AF-01',
      subAreas: [
        { code: 'AF-LINE-01', name: 'Line 1 (Activa 6G Final Assembly)', stagingBin: 'STG-P1-L1' },
        { code: 'AF-LINE-02', name: 'Line 2 (Shine 125 & SP125 Assembly)', stagingBin: 'STG-P1-L2' },
        { code: 'AF-LINE-04', name: 'Line 4 (CB350 / H\'ness Premium Assembly - Plant 2)', stagingBin: 'STG-P2-L4' }
      ],
      manager: 'Amit Patel',
      status: 'ACTIVE'
    }
  ],

  // Defect Reason Codes & Quarantine Bins Master (Module F)
  defectReasonCodes: [
    { code: 'DEF-CRACK', name: 'Micro-fracture / Crack', category: 'Physical Damage', defaultAction: 'Return to Vendor (RTV)' },
    { code: 'DEF-DENT', name: 'Surface Dent / Deformation', category: 'Handling Damage', defaultAction: 'Return to Vendor (RTV)' },
    { code: 'DEF-DIM', name: 'Out of Dimensional Tolerance', category: 'Manufacturing Defect', defaultAction: 'Rework (In-house)' },
    { code: 'DEF-RUST', name: 'Surface Oxidation / Rust', category: 'Environmental Damage', defaultAction: 'Scrap (Write-off)' },
    { code: 'DEF-PAINT', name: 'Paint Peel / Blistering', category: 'Coating Defect', defaultAction: 'Rework (In-house)' },
    { code: 'DEF-ELEC', name: 'Electrical Continuity / Stator Fail', category: 'Component Failure', defaultAction: 'Return to Vendor (RTV)' },
    { code: 'DEF-CONTAM', name: 'Foreign Particle / Burr Contamination', category: 'Contamination', defaultAction: 'Rework (In-house)' }
  ],

  quarantineBins: [
    { binCode: 'QRN-LOC-Q01-RCK-01', name: 'Quarantine Cage A (Receiving / Dock)', plant: 'HMSI Narsapur Plant 1', capacity: 15, currentOccupancy: 2 },
    { binCode: 'QRN-LOC-Q01-RCK-02', name: 'Quarantine Cage B (QC Hold & Metallurgical)', plant: 'HMSI Narsapur Plant 1', capacity: 20, currentOccupancy: 1 },
    { binCode: 'QRN-LOC-Q01-RCK-03', name: 'Quarantine Lock-Box C (Scrap & Write-off)', plant: 'HMSI Narsapur Plant 1', capacity: 10, currentOccupancy: 1 },
    { binCode: 'QRN-LOC-Q01-RCK-04', name: 'Quarantine Bay D (Rework Staging Buffer)', plant: 'HMSI Narsapur Plant 1', capacity: 15, currentOccupancy: 1 }
  ],

  // -------------------------------------------------------------
  // Finished Goods Packing & Dispatch Master (Module G - Configurable Scope)
  // -------------------------------------------------------------
  dispatchSettings: {
    enabled: false, // Default: Pending Client Confirmation (Phase 2 scope)
    scopeStatus: 'AWAITING_CONFIRMATION',
    confirmationNote: 'Finished Goods Packing & Customer Dispatch workflow is configured as a Phase 2 item awaiting final client confirmation regarding finished vehicle yard management scope.',
    sapMovementType: 'Movement 601 (Post Goods Issue - PGI)',
    requireBayScan: true,
    requireVehicleRegCheck: true
  },

  dispatchBays: [
    { bayCode: 'DSP-BAY-01', name: 'Dispatch Staging Bay 01 (South Yard)', plant: 'HMSI Narsapur Plant 1', capacity: 60, currentLoad: 45, status: 'OCCUPIED', activeTruck: 'KA-04-E-8821' },
    { bayCode: 'DSP-BAY-02', name: 'Dispatch Staging Bay 02 (South Yard)', plant: 'HMSI Narsapur Plant 1', capacity: 60, currentLoad: 50, status: 'OCCUPIED', activeTruck: 'KA-51-M-4102' },
    { bayCode: 'DSP-BAY-03', name: 'Dispatch Staging Bay 03 (North Yard)', plant: 'HMSI Narsapur Plant 1', capacity: 80, currentLoad: 0, status: 'AVAILABLE', activeTruck: null },
    { bayCode: 'DSP-BAY-04', name: 'Dispatch Staging Bay 04 (Express Buffer)', plant: 'HMSI Narsapur Plant 2', capacity: 50, currentLoad: 25, status: 'OCCUPIED', activeTruck: 'HR-26-BR-9014' }
  ],

  stockLevelMaster: [
    { materialCode: 'HND-BRK-PAD-01', plant: 'HMSI Narsapur Plant 1', minStock: 200, maxStock: 1500, reorderPoint: 450, safetyStock: 150, abcCycleDays: 1, alertEmails: 'wh-lead@hmsi.co.in, purchase@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-THROT-KEIHIN', plant: 'HMSI Narsapur Plant 1', minStock: 250, maxStock: 1200, reorderPoint: 400, safetyStock: 120, abcCycleDays: 1, alertEmails: 'wh-lead@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-ECU-KEIHIN-01', plant: 'HMSI Narsapur Plant 2', minStock: 180, maxStock: 800, reorderPoint: 300, safetyStock: 80, abcCycleDays: 1, alertEmails: 'wh-lead@hmsi.co.in, electronics-lead@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-STR-MITSUBA', plant: 'HMSI Narsapur Plant 1', minStock: 100, maxStock: 600, reorderPoint: 180, safetyStock: 50, abcCycleDays: 2, alertEmails: 'wh-lead@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-CVT-BELT-BND', plant: 'HMSI Narsapur Plant 1', minStock: 300, maxStock: 1500, reorderPoint: 500, safetyStock: 150, abcCycleDays: 1, alertEmails: 'wh-lead@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-SHK-SHOWA', plant: 'HMSI Narsapur Plant 1', minStock: 120, maxStock: 600, reorderPoint: 200, safetyStock: 60, abcCycleDays: 2, alertEmails: 'wh-lead@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-TYR-MRF-90', plant: 'HMSI Narsapur Plant 1', minStock: 400, maxStock: 2000, reorderPoint: 700, safetyStock: 200, abcCycleDays: 1, alertEmails: 'wh-lead@hmsi.co.in', status: 'ACTIVE' },
    { materialCode: 'HND-EXH-CBR-90', plant: 'HMSI Narsapur Plant 1', minStock: 10, maxStock: 50, reorderPoint: 15, safetyStock: 5, abcCycleDays: 7, alertEmails: 'wh-lead@hmsi.co.in', status: 'ACTIVE' }
  ],

  // -------------------------------------------------------------
  // Scheduled Daily Auto-Email & Vendor Shortage Alerting (Module H.6, H.7)
  // -------------------------------------------------------------
  dailyAutoEmailConfig: {
    enabled: true,
    schedule: '07:00 Daily (Pre-Shift A)',
    recipients: 'wh-lead@hmsi.co.in, purchase@hmsi.co.in, plant-head@hmsi.co.in',
    reports: ['stockSummary', 'shortage', 'slowMoving', 'quarantine'],
    format: 'Executive PDF + Excel Attachment',
    lastSent: '24-Sep-2026 07:00:15',
    autoSendVendorAlerts: true
  },

  vendorShortageAlerts: [
    {
      alertId: 'VSA-2026-001',
      vendorCode: 'VEND-KEI-01',
      vendorName: 'Keihin India Electronics Pvt Ltd',
      materialCode: 'HND-ECU-KEIHIN-01',
      materialDescription: 'Keihin Master Engine Control Unit (ECU) with OBD2',
      currentStock: 50,
      reorderPoint: 300,
      shortageQty: 250,
      contactEmail: 'supply@keihin-india.com',
      contactPerson: 'M. Anand',
      timestamp: '24-Sep-2026 08:30',
      status: 'Sent',
      expeditedPO: 'PO-HND-2026-00620'
    }
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
    { deviceId: 'ZEBRA-TC57-01', type: 'handheld', model: 'Zebra TC57 Touch Computer (TBC)', serialNo: 'ZBR-57-99401', plant: 'HMSI Narsapur Plant 1', zone: 'ZONE-A-PWR', ip: '10.24.101.45', assignedUser: 'Sanjay Verma', defaultLabel: 'Standard Pallet Label', status: 'ONLINE', lastPing: '24-Sep-2026 10:44' },
    { deviceId: 'ZEBRA-TC57-02', type: 'handheld', model: 'Zebra TC57 Touch Computer (TBC)', serialNo: 'ZBR-57-99402', plant: 'HMSI Narsapur Plant 2', zone: 'ZONE-P2-MC', ip: '10.24.102.12', assignedUser: 'Praveen Kumar', defaultLabel: 'Standard Pallet Label', status: 'ONLINE', lastPing: '24-Sep-2026 10:42' },
    { deviceId: 'ZEBRA-ZT411-P1', type: 'label printer', model: 'Zebra ZT411 Industrial Thermal 300dpi (TBC)', serialNo: 'ZBR-ZT-88101', plant: 'HMSI Narsapur Plant 1', zone: 'DOCK-04 (Receiving)', ip: '10.24.101.80', assignedUser: 'Dock Receiving Desk', defaultLabel: 'Pallet / HU Label (100x150mm)', status: 'ONLINE', lastPing: '24-Sep-2026 10:45' },
    { deviceId: 'ZEBRA-ZT411-P2', type: 'label printer', model: 'Zebra ZT411 Industrial Thermal 300dpi (TBC)', serialNo: 'ZBR-ZT-88102', plant: 'HMSI Narsapur Plant 2', zone: 'DOCK-05 (Receiving)', ip: '10.24.102.80', assignedUser: 'Dock Receiving Desk', defaultLabel: 'Pallet / HU Label (100x150mm)', status: 'ONLINE', lastPing: '24-Sep-2026 10:40' }
  ],

  // -------------------------------------------------------------
  // 3. INBOUND MODULE STATE & DEMO WALKTHROUGH (B1 - B8)
  // -------------------------------------------------------------
  purchaseOrders: [
    {
      poNumber: 'PO-HND-2026-00600',
      supplier: 'Keihin India Electronics Pvt Ltd',
      plant: 'HMSI Narsapur Plant 1',
      materialCode: 'HND-THROT-KEIHIN',
      materialDescription: 'Keihin PGM-FI 26mm Throttle Body Assembly',
      orderedQty: 600,
      asnQty: 300,
      receivedQty: 300,
      openQty: 300,
      uom: 'EA',
      deliveryDate: '25-Sep-2026',
      status: 'Partially received',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      poNumber: 'PO-HND-2026-00600',
      supplier: 'Keihin India Electronics Pvt Ltd',
      plant: 'HMSI Narsapur Plant 1',
      materialCode: 'HND-ECU-KEIHIN-01',
      materialDescription: 'Keihin Master Engine Control Unit (ECU) OBD2',
      orderedQty: 400,
      asnQty: 0,
      receivedQty: 0,
      openQty: 400,
      uom: 'EA',
      deliveryDate: '25-Sep-2026',
      status: 'Open',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
    {
      poNumber: 'PO-HND-2026-00600',
      supplier: 'Keihin India Electronics Pvt Ltd',
      plant: 'HMSI Narsapur Plant 1',
      materialCode: 'HND-CVT-BELT-BND',
      materialDescription: 'Bando Double-Cog Reinforced V-Belt Drive',
      orderedQty: 500,
      asnQty: 0,
      receivedQty: 0,
      openQty: 500,
      uom: 'EA',
      deliveryDate: '26-Sep-2026',
      status: 'Open',
      isSapOwned: true,
      lastSync: '24-Sep-2026 08:00'
    },
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
      invoiceNo: 'INV-NIS-2026-0891',
      invoiceDate: '24-Sep-2026',
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
      acceptanceStatus: 'Accepted',
      acceptedBy: 'Anand Murthy (QC Insp)',
      mrnGenerated: 'MRN-HND-2026-00088'
    },
    {
      receivingId: 'REC-2026-0090',
      plant: 'HMSI Narsapur Plant 2',
      invoiceNo: 'INV-SHW-2026-0912',
      invoiceDate: '24-Sep-2026',
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
      acceptanceStatus: 'Pending Acceptance',
      acceptedBy: 'Pending QC',
      mrnGenerated: '—'
    }
  ],

  qualityInspections: [
    {
      inspectionId: 'QC-2026-00101',
      receiptRef: 'REC-2026-0089',
      mrnNumber: 'MRN-HND-2026-00088',
      materialCode: 'HND-BRK-PAD-01',
      materialDescription: 'Nissin Front Disc Brake Pad Set',
      inspectedQty: 590,
      inspectedBy: 'Anand Murthy (QC Inspector)',
      inspectorId: 'HND-USR-1004',
      inspectionTimestamp: '24-Sep-2026 09:50',
      result: 'Accepted',
      sapPqStatus: 'PASSED',
      remarks: 'Dimensional, friction surface & visual inspection cleared. Tolerance ±0.2mm ok.'
    },
    {
      inspectionId: 'QC-2026-00102',
      receiptRef: 'REC-2026-0090',
      mrnNumber: 'MRN-HND-2026-00089',
      materialCode: 'HND-SHK-SHOWA',
      materialDescription: 'Showa Telescopic Front Fork Set',
      inspectedQty: 398,
      inspectedBy: 'Anand Murthy (QC Inspector)',
      inspectorId: 'HND-USR-1004',
      inspectionTimestamp: '24-Sep-2026 10:20',
      result: 'On Hold',
      sapPqStatus: 'PENDING',
      remarks: 'Pending damping resistance laboratory test results. Blocked from putaway.'
    },
    {
      inspectionId: 'QC-2026-00103',
      receiptRef: 'REC-2026-0091',
      mrnNumber: 'MRN-HND-2026-00090',
      materialCode: 'HND-TYR-MRF-90',
      materialDescription: 'MRF Nylogrip Zapper 90/90-12 Tubeless Tyre',
      inspectedQty: 130,
      inspectedBy: 'Pending QC Assignment',
      inspectorId: '—',
      inspectionTimestamp: '—',
      result: 'On Hold',
      sapPqStatus: 'PENDING',
      remarks: 'Awaiting durometer & bead seating verification. Putaway locked until clearance.'
    }
  ],

  mrns: [
    {
      mrnNumber: 'MRN-HND-2026-00088',
      plant: 'HMSI Narsapur Plant 1',
      invoiceNo: 'INV-NIS-2026-0891',
      invoiceDate: '24-Sep-2026',
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
      acceptanceStatus: 'Accepted',
      acceptedBy: 'Anand Murthy (QC Insp)',
      sapPqStatus: 'PASSED',
      damagePhotoAttached: true,
      grnNumber: 'GRN-HND-2026-00520'
    },
    {
      mrnNumber: 'MRN-HND-2026-00089',
      plant: 'HMSI Narsapur Plant 2',
      invoiceNo: 'INV-SHW-2026-0912',
      invoiceDate: '24-Sep-2026',
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
      acceptanceStatus: 'Pending Acceptance',
      acceptedBy: 'Pending QC',
      sapPqStatus: 'PENDING',
      damagePhotoAttached: true,
      grnNumber: '—'
    }
  ],

  goodsReceiptNotes: [
    {
      grnNumber: 'GRN-HND-2026-00520',
      plant: 'HMSI Narsapur Plant 1',
      invoiceNo: 'INV-NIS-2026-0891',
      invoiceDate: '24-Sep-2026',
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
      invoiceNo: 'INV-KEI-2026-0819',
      invoiceDate: '18-Sep-2026',
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
      invoiceNo: 'INV-KEI-2026-0742',
      invoiceDate: '24-Sep-2026',
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
      quarantineBin: 'QC-LOC-Q01-RCK-01',
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
      quarantineBin: 'QC-LOC-Q01-RCK-01',
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
      quarantineBin: 'QC-LOC-Q01-RCK-01',
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
      suggestedBin: 'PWR-LOC-A01-RCK-01',
      actualBin: 'PWR-LOC-A01-RCK-01',
      overrideReason: '—',
      operator: 'Sanjay Verma (Op 01)',
      status: 'Completed',
      sapPqStatus: 'PASSED',
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
      suggestedBin: 'TYR-LOC-D01-RCK-01',
      actualBin: '—',
      overrideReason: '—',
      operator: 'Vikram Patil (Forklift)',
      status: 'In progress',
      sapPqStatus: 'PENDING',
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
      suggestedBin: 'ELE-LOC-B01-RCK-01',
      actualBin: '—',
      overrideReason: '—',
      operator: 'Praveen Kumar (Forklift)',
      status: 'In progress',
      sapPqStatus: 'PASSED',
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
      location: 'PWR-LOC-A01-RCK-01',
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
      location: 'PWR-LOC-A03-RCK-01',
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
      location: 'ELE-LOC-B01-RCK-01',
      batch: 'BAT-KEI-2026-08-25-01',
      receiptDate: '25-Aug-2026',
      fifoDate: '25-Aug-2026',
      fifoPriority: 1,
      stockStatus: 'AVAILABLE',
      supplier: 'Keihin India Electronics Pvt Ltd',
      poNumber: 'PO-HND-2026-00388',
      agingDays: 30,
      agingBucket: '16–30 Days'
    },
    {
      huNumber: 'HU-HND-2026-009809',
      lpn: 'LPN-HND-009809',
      materialCode: 'HND-TYR-MRF-90',
      description: 'MRF Nylogrip Zapper 90/90-12 Tubeless Tyre',
      quantity: 2200,
      uom: 'EA',
      plant: 'HMSI Narsapur Plant 1',
      location: 'TYR-LOC-D01-RCK-01',
      batch: 'BAT-MRF-2026-09-20-01',
      receiptDate: '20-Sep-2026',
      fifoDate: '20-Sep-2026',
      fifoPriority: 1,
      stockStatus: 'AVAILABLE',
      supplier: 'MRF Tyres India Ltd',
      poNumber: 'PO-HND-2026-00410',
      agingDays: 4,
      agingBucket: '0–7 Days'
    },
    {
      huNumber: 'HU-HND-2026-009812',
      lpn: 'LPN-HND-009812',
      materialCode: 'HND-STR-MITSUBA',
      description: 'Mitsuba ACG Silent Starter & Generator 12V',
      quantity: 750,
      uom: 'EA',
      plant: 'HMSI Narsapur Plant 1',
      location: 'PWR-LOC-A02-RCK-01',
      batch: 'BAT-MIT-2026-09-15-01',
      receiptDate: '15-Sep-2026',
      fifoDate: '15-Sep-2026',
      fifoPriority: 1,
      stockStatus: 'AVAILABLE',
      supplier: 'Mitsuba Sical India Pvt Ltd',
      poNumber: 'PO-HND-2026-00422',
      agingDays: 9,
      agingBucket: '8–15 Days'
    },
    {
      huNumber: 'HU-EXH-2026-00441',
      lpn: 'LPN-EXH-00441',
      materialCode: 'HND-EXH-CBR-90',
      description: 'Exhaust Muffler Assembly (CBR250R Legacy Model)',
      quantity: 20,
      uom: 'EA',
      plant: 'HMSI Narsapur Plant 1',
      location: 'CHS-LOC-C01-RCK-01',
      batch: 'BAT-EXH-2026-06-12-01',
      receiptDate: '12-Jun-2026',
      fifoDate: '12-Jun-2026',
      fifoPriority: 1,
      stockStatus: 'AVAILABLE',
      supplier: 'Mitsuba Sical India Pvt Ltd',
      poNumber: 'PO-HND-2026-00210',
      agingDays: 104,
      agingBucket: '>90 Days'
    }
  ],

  // Integrated Cycle Count & Adjustment Single-Screen Data (Module I: Inventory Verification)
  cycleCountPlans: [
    {
      countNo: 'CC-2026-0090',
      plant: 'HMSI Narsapur Plant 1',
      zone: 'WALL-TO-WALL (All Plant 1 Storage Bins & Buffers)',
      abcClass: 'All (A/B/C/D)',
      countType: 'ANNUAL_PHYSICAL',
      countTypeName: 'Annual Physical Inventory (Wall-to-Wall)',
      plannedDate: '24-Sep-2026',
      counter: 'Sanjay Verma (Op 01) & Audit Team',
      progressPct: 75,
      status: 'Counting',
      blindCount: true,
      isStockFrozen: true,
      supervisorApproved: false,
      supervisorApprovedBy: '—',
      lines: [
        {
          lineId: 1,
          bin: 'PWR-LOC-A01-RCK-01',
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
          approvedBy: '—',
          sapDocNo: '—',
          sapStatus: 'pending',
          sapMovement: '711',
          lineStatus: 'Variance flagged'
        },
        {
          lineId: 2,
          bin: 'ELE-LOC-B01-RCK-01',
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
          sapMovement: '—',
          lineStatus: 'Counted'
        },
        {
          lineId: 3,
          bin: 'PWR-LOC-A03-RCK-01',
          materialCode: 'HND-THROT-KEIHIN',
          materialDescription: 'Keihin PGM-FI 26mm Throttle Body',
          huLot: 'HU-HND-2026-009801 / BAT-KEI-2026-09-18-01',
          systemQty: 80,
          countedQty: 83,
          varianceQty: 3,
          variancePct: 3.75,
          isOutsideTolerance: true,
          reasonCode: 'COUNT-VAR-GAIN',
          recountFlag: false,
          adjustmentQty: 3,
          approvedBy: '—',
          sapDocNo: '—',
          sapStatus: 'pending',
          sapMovement: '712',
          lineStatus: 'Variance flagged'
        },
        {
          lineId: 4,
          bin: 'CHS-LOC-C01-RCK-01',
          materialCode: 'HND-WHL-ALLOY-12',
          materialDescription: 'Enkei 12-inch Front Alloy Wheel',
          huLot: 'HU-ENK-2026-00812 / BAT-ENK-2026-09-22-01',
          systemQty: 120,
          countedQty: 118,
          varianceQty: -2,
          variancePct: -1.67,
          isOutsideTolerance: true,
          reasonCode: 'COUNT-VAR-SHRINK',
          recountFlag: false,
          adjustmentQty: -2,
          approvedBy: '—',
          sapDocNo: '—',
          sapStatus: 'pending',
          sapMovement: '711',
          lineStatus: 'Adjustment pending approval'
        }
      ]
    },
    {
      countNo: 'CC-2026-0089',
      plant: 'HMSI Narsapur Plant 1',
      zone: 'ZONE-A & ZONE-B (Powertrain & Electrical)',
      abcClass: 'A/B',
      countType: 'HALF_YEARLY',
      countTypeName: 'Half-yearly Internal Verification (December)',
      plannedDate: '15-Dec-2026',
      counter: 'Prakash (Op 03)',
      progressPct: 100,
      status: 'Closed',
      blindCount: true,
      isStockFrozen: false,
      supervisorApproved: true,
      supervisorApprovedBy: 'Rajesh Sharma (Manager)',
      lines: [
        {
          lineId: 1,
          bin: 'PWR-LOC-A03-RCK-01',
          materialCode: 'HND-THROT-KEIHIN',
          materialDescription: 'Keihin PGM-FI 26mm Throttle Body',
          huLot: 'HU-HND-2026-009801 / BAT-KEI-2026-09-18-01',
          systemQty: 80,
          countedQty: 82,
          varianceQty: 2,
          variancePct: 2.5,
          isOutsideTolerance: true,
          reasonCode: 'COUNT-VAR-GAIN',
          recountFlag: false,
          adjustmentQty: 2,
          approvedBy: 'Rajesh Sharma (Manager)',
          sapDocNo: 'SAP-ADJ-70018901',
          sapStatus: 'posted',
          sapMovement: '712',
          lineStatus: 'Posted to SAP (Mvt 712)'
        }
      ]
    },
    {
      countNo: 'CC-2026-0091',
      plant: 'HMSI Narsapur Plant 1',
      zone: 'ZONE-A-PWR',
      abcClass: 'A',
      countType: 'DAILY_ABC',
      countTypeName: 'Daily Cycle Count (ABC Fast Movers)',
      plannedDate: '24-Sep-2026',
      counter: 'Sanjay Verma (Op 01)',
      progressPct: 100,
      status: 'Closed',
      blindCount: true,
      isStockFrozen: false,
      supervisorApproved: true,
      supervisorApprovedBy: 'Rajesh Sharma (Manager)',
      lines: [
        {
          lineId: 1,
          bin: 'PWR-LOC-A01-RCK-01',
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
          sapMovement: '711',
          lineStatus: 'Posted to SAP (Mvt 711)'
        }
      ]
    },
    {
      countNo: 'CC-2026-0092',
      plant: 'HMSI Narsapur Plant 1',
      zone: 'ZONE-B-ELE',
      abcClass: 'A',
      countType: 'DAILY_ABC',
      countTypeName: 'Daily Cycle Count (ABC Fast Movers)',
      plannedDate: '24-Sep-2026',
      counter: 'Prakash (Op 03)',
      progressPct: 40,
      status: 'Counting',
      blindCount: true,
      isStockFrozen: false,
      supervisorApproved: false,
      supervisorApprovedBy: '—',
      lines: [
        {
          lineId: 1,
          bin: 'ELE-LOC-B01-RCK-01',
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
          sapMovement: '—',
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
      bin: 'PWR-LOC-A03-RCK-01',
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
          sourceBin: 'ELE-LOC-B01-RCK-01',
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
      sourceBin: 'PWR-LOC-A01-RCK-01',
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
      sourceBin: 'ELE-LOC-B01-RCK-01',
      fifoOverrideFlag: false,
      status: 'Completed'
    }
  ],

  lineIssues: [
    {
      issueNo: 'ISS-2026-0081',
      plant: 'HMSI Narsapur Plant 1',
      issueListNo: 'IL-HND-2026-0081',
      productionOrderNo: 'PROD-2026-10491',
      shopCode: 'SHOP-AF',
      shopName: 'Assembly Frame / Final (AF)',
      subArea: 'Line 1 (Activa 6G Final Assembly)',
      productionLine: 'Line 1 (Activa 6G Final Assembly)',
      lineCode: 'L1',
      materialCode: 'HND-BRK-PAD-01',
      materialDescription: 'Nissin Front Disc Brake Pad Set',
      qtyIssued: 100,
      uom: 'EA',
      deliveredBy: 'Sanjay Verma (Trolley #04)',
      receivedAtLineTime: '24-Sep-2026 10:40',
      stagingBin: 'STG-P1-L1',
      shift: 'Shift N1',
      sapGoodsIssueDocNo: 'SAP-MAT-6001928410',
      sapStatus: 'posted',
      status: 'Delivered to Shop'
    },
    {
      issueNo: 'ISS-2026-0082',
      plant: 'HMSI Narsapur Plant 1',
      issueListNo: 'IL-HND-2026-0082',
      productionOrderNo: 'PROD-2026-10492',
      shopCode: 'SHOP-MCH',
      shopName: 'Machine Shop (Machining Division)',
      subArea: 'MCH-CELL-01 (Cylinder Block CNC Cell)',
      productionLine: 'Machine Shop CNC Cell 1',
      lineCode: 'MCH-01',
      materialCode: 'HND-THROT-KEIHIN',
      materialDescription: 'Keihin PGM-FI Throttle Body Castings',
      qtyIssued: 120,
      uom: 'EA',
      deliveredBy: 'Anand Murthy (Trolley #07)',
      receivedAtLineTime: '24-Sep-2026 10:15',
      stagingBin: 'STG-MCH-01',
      shift: 'Shift N1',
      sapGoodsIssueDocNo: 'SAP-MAT-6001928412',
      sapStatus: 'posted',
      status: 'Delivered to Shop'
    },
    {
      issueNo: 'ISS-2026-0083',
      plant: 'HMSI Narsapur Plant 2',
      issueListNo: 'IL-HND-2026-0083',
      productionOrderNo: 'PROD-2026-10493',
      shopCode: 'SHOP-AF',
      shopName: 'Assembly Frame / Final (AF)',
      subArea: 'Line 4 (CB350 Premium Final Assembly)',
      productionLine: 'Line 4 (CB350 / H\'ness Premium Assembly)',
      lineCode: 'L4',
      materialCode: 'HND-ECU-KEIHIN-01',
      materialDescription: 'Keihin Master ECU OBD2',
      qtyIssued: 40,
      uom: 'EA',
      deliveredBy: 'Praveen Kumar (Trolley #02)',
      receivedAtLineTime: '24-Sep-2026 09:10',
      stagingBin: 'STG-P2-L4',
      shift: 'Shift N1',
      sapGoodsIssueDocNo: 'SAP-MAT-6001928415',
      sapStatus: 'posted',
      status: 'Delivered to Shop'
    },
    {
      issueNo: 'ISS-2026-0084',
      plant: 'HMSI Narsapur Plant 1',
      issueListNo: 'IL-HND-2026-0084',
      productionOrderNo: 'PROD-2026-10494',
      shopCode: 'SHOP-PNT',
      shopName: 'Paint Shop (Electrostatic & Robotic Painting)',
      subArea: 'PNT-LINE-01 (Body Paint Line - Activa 6G)',
      productionLine: 'Paint Line 1',
      lineCode: 'PNT-01',
      materialCode: 'HND-CVT-BELT-BND',
      materialDescription: 'Heat-Resistant Drive Belts & Primer',
      qtyIssued: 80,
      uom: 'EA',
      deliveredBy: 'Sanjay Verma (Trolley #03)',
      receivedAtLineTime: '24-Sep-2026 08:30',
      stagingBin: 'STG-PNT-01',
      shift: 'Shift N1',
      sapGoodsIssueDocNo: 'SAP-MAT-6001928422',
      sapStatus: 'posted',
      status: 'Delivered to Shop'
    },
    {
      issueNo: 'ISS-2026-0085',
      plant: 'HMSI Narsapur Plant 1',
      issueListNo: 'IL-HND-2026-0085',
      productionOrderNo: 'PROD-2026-10495',
      shopCode: 'SHOP-WLD',
      shopName: 'Weld Shop (Robotic Frame & Chassis Welding)',
      subArea: 'WLD-ROBOT-01 (Underbone Frame Robotic Cell 1)',
      productionLine: 'Weld Robot Cell 1',
      lineCode: 'WLD-01',
      materialCode: 'HND-SHK-SHOWA',
      materialDescription: 'Rear Hydraulic Shock Mount Brackets',
      qtyIssued: 120,
      uom: 'EA',
      deliveredBy: 'Rajesh Sharma (Trolley #01)',
      receivedAtLineTime: '23-Sep-2026 15:20',
      stagingBin: 'STG-WLD-01',
      shift: 'Shift N2',
      sapGoodsIssueDocNo: 'SAP-MAT-6001928425',
      sapStatus: 'posted',
      status: 'Delivered to Shop'
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
  // Dedicated Rejection Module State (Module F)
  // -------------------------------------------------------------
  rejections: [
    {
      rejectionId: 'REJ-2026-0041',
      hu: 'HU-2026-00841',
      plant: 'HMSI Narsapur Plant 1',
      materialCode: 'HND-BRK-PAD-01',
      materialDescription: 'Front Disc Brake Pad Set (Non-Asbestos)',
      quantity: 25,
      uom: 'SET',
      supplier: 'Nissin Brake India Pvt Ltd',
      batchNo: 'BAT-2026-B81',
      stage: 'Inspection',
      reasonCode: 'DEF-CRACK',
      reasonDescription: 'Friction lining micro-fracture discovered during visual QA sample audit',
      rejectedBy: 'Ramesh Kumar (QC Inspector)',
      rejectionDate: '15-Oct-2026 11:15',
      rejectionLocation: 'AREA-Q-LOC-01-RCK-01 (Quarantine Lock-Box)',
      quarantineBin: 'QRN-LOC-Q01-RCK-02',
      commercialAction: 'Pending Disposition',
      dispositionRemarks: 'Awaiting Senior Quality Manager review for vendor claim vs scrap.',
      sapBlockedMvt: '124 (GR Blocked Stock)',
      sapDocNo: 'SAP-MAT-6001929910',
      photoAttached: true,
      photoName: 'DEFECT_BRAKE_PAD_CRACK_01.JPG',
      status: 'BLOCKED'
    },
    {
      rejectionId: 'REJ-2026-0038',
      hu: 'HU-2026-00812',
      plant: 'HMSI Narsapur Plant 1',
      materialCode: 'HND-THROT-KEIHIN',
      materialDescription: 'Keihin 24mm Throttle Body Assembly',
      quantity: 12,
      uom: 'EA',
      supplier: 'Keihin India Electronics Pvt Ltd',
      batchNo: 'BAT-2026-K10',
      stage: 'Receiving',
      reasonCode: 'DEF-DENT',
      reasonDescription: 'Inlet flange casting dented during truck transit from vendor',
      rejectedBy: 'Sanjay Verma (Dock 04 Operator)',
      rejectionDate: '14-Oct-2026 09:30',
      rejectionLocation: 'Inbound Dock 04 (Chassis & Brakes Bay)',
      quarantineBin: 'QRN-LOC-Q01-RCK-01',
      commercialAction: 'Return to Vendor (RTV)',
      dispositionRemarks: 'Vendor acknowledged transit damage; debit note DN-2026-081 raised. Mvt 122 posted.',
      sapBlockedMvt: '122 (Return Delivery to Vendor)',
      sapDocNo: 'SAP-MAT-6001928010',
      photoAttached: true,
      photoName: 'DEFECT_THROTTLE_FLANGE_DENT.JPG',
      status: 'RTV_PROCESSED'
    },
    {
      rejectionId: 'REJ-2026-0043',
      hu: 'HU-2026-00788',
      plant: 'HMSI Narsapur Plant 1',
      materialCode: 'HND-CYL-BLK-01',
      materialDescription: 'Cylinder Block Casting 110cc',
      quantity: 8,
      uom: 'EA',
      supplier: 'Sundaram Clayton Ltd',
      batchNo: 'BAT-2026-SC04',
      stage: 'Storage',
      reasonCode: 'DEF-RUST',
      reasonDescription: 'Moisture ingress in rack aisle 02 caused surface oxidation on machined bore',
      rejectedBy: 'Praveen Gowda (Warehouse Supervisor)',
      rejectionDate: '15-Oct-2026 16:45',
      rejectionLocation: 'PWR-LOC-A02-RCK-01 (Powertrain Storing)',
      quarantineBin: 'QRN-LOC-Q01-RCK-03',
      commercialAction: 'Scrap (Write-off)',
      dispositionRemarks: 'Bore pitting beyond hone recovery limit; scrapped under Scrap Note SN-2026-019.',
      sapBlockedMvt: '551 (Scrapping from Blocked Stock)',
      sapDocNo: 'SAP-MAT-6001930104',
      photoAttached: true,
      photoName: 'DEFECT_CYLINDER_BORE_RUST.JPG',
      status: 'SCRAPPED'
    },
    {
      rejectionId: 'REJ-2026-0045',
      hu: 'HU-2026-00914',
      plant: 'HMSI Narsapur Plant 1',
      materialCode: 'HND-STR-MITSUBA',
      materialDescription: 'Mitsuba ACG Starter Motor 12V',
      quantity: 6,
      uom: 'EA',
      supplier: 'Mitsuba Sical India Pvt Ltd',
      batchNo: 'BAT-2026-M09',
      stage: 'Production',
      reasonCode: 'DEF-ELEC',
      reasonDescription: 'Line 3 Engine Assembly dyno cell detected low cranking torque and stator winding open-circuit',
      rejectedBy: 'Vikram Patil (AE Line 3 Lead)',
      rejectionDate: '16-Oct-2026 08:20',
      rejectionLocation: 'SHOP-AE (Line 3 Staging STG-AE-01)',
      quarantineBin: 'QRN-LOC-Q01-RCK-01',
      commercialAction: 'Pending Disposition',
      dispositionRemarks: 'Shop floor return MRN-2026-0081 logged; quarantine hold for vendor joint teardown.',
      sapBlockedMvt: '124 (GR Blocked Stock)',
      sapDocNo: 'SAP-MAT-6001931220',
      photoAttached: true,
      photoName: 'DEFECT_STARTER_MOTOR_BURNOUT.JPG',
      status: 'BLOCKED'
    },
    {
      rejectionId: 'REJ-2026-0046',
      hu: 'HU-2026-00930',
      plant: 'HMSI Narsapur Plant 1',
      materialCode: 'HND-WHL-ALLOY-F',
      materialDescription: 'Front Alloy Wheel 12-inch (Black Cast)',
      quantity: 10,
      uom: 'EA',
      supplier: 'Enkei Castalloy Ltd',
      batchNo: 'BAT-2026-EN02',
      stage: 'Inspection',
      reasonCode: 'DEF-CONTAM',
      reasonDescription: 'Excess flash and burr on rim bead seat causing bead leak hazard',
      rejectedBy: 'K. R. Venkat (QC Metallurgist)',
      rejectionDate: '16-Oct-2026 10:00',
      rejectionLocation: 'QC-INSPECT-BAY-01',
      quarantineBin: 'QRN-LOC-Q01-RCK-04',
      commercialAction: 'Rework (In-house)',
      dispositionRemarks: 'De-burred and polished in Machine Shop CNC cell; re-inspected and cleared.',
      sapBlockedMvt: '311 (Transfer to Production Rework)',
      sapDocNo: 'SAP-MAT-6001931550',
      photoAttached: true,
      photoName: 'DEFECT_ALLOY_FLASH_BURR.JPG',
      status: 'REWORKED'
    }
  ],

  // -------------------------------------------------------------
  // Finished Goods Packing & Dispatch Ledger (Module G - Configurable Scope)
  // -------------------------------------------------------------
  dispatchOrders: [
    {
      dispatchOrderNo: 'DSP-2026-0081',
      plant: 'HMSI Narsapur Plant 1',
      soNumber: 'SO-HMSI-400912',
      destination: 'Honda Regional Depot (Bhiwandi, Maharashtra)',
      modelCode: 'HND-ACTIVA-6G-DLX',
      modelDescription: 'Activa 6G Deluxe (Matte Axis Grey Metallic)',
      quantity: 45,
      uom: 'UNT',
      carrier: 'VRL Logistics Ltd',
      truckNo: 'KA-04-E-8821',
      driverName: 'Suresh Patil (+91 98451 22910)',
      stagingBay: 'DSP-BAY-01',
      packingSlipNo: 'PS-2026-081',
      sapPgiDocNo: 'SAP-PGI-6001948810',
      scheduledDate: '21-Oct-2026 14:00',
      status: 'STAGED',
      scopeBadge: 'CONFIGURABLE_SCOPE',
      notes: 'Export crates banded and sealed with security tamper tags.'
    },
    {
      dispatchOrderNo: 'DSP-2026-0082',
      plant: 'HMSI Narsapur Plant 1',
      soNumber: 'SO-HMSI-400918',
      destination: 'Apex Honda Showroom & Dealership (Bengaluru East)',
      modelCode: 'HND-SHINE-125-DISC',
      modelDescription: 'Shine 125 Disc Brake (Geny Grey Metallic)',
      quantity: 50,
      uom: 'UNT',
      carrier: 'Transport Corporation of India (TCI)',
      truckNo: 'KA-51-M-4102',
      driverName: 'Mohan Das (+91 94481 00293)',
      stagingBay: 'DSP-BAY-02',
      packingSlipNo: 'PS-2026-082',
      sapPgiDocNo: 'SAP-PGI-6001948825',
      scheduledDate: '21-Oct-2026 16:30',
      status: 'LOADING',
      scopeBadge: 'CONFIGURABLE_SCOPE',
      notes: 'Standard 2-tier vehicle carrier truck; pre-dispatch inspection completed.'
    },
    {
      dispatchOrderNo: 'DSP-2026-0083',
      plant: 'HMSI Narsapur Plant 2',
      soNumber: 'SO-HMSI-400922',
      destination: 'Honda Spares & CKD Hub (Gurugram Central)',
      modelCode: 'HND-HORNET-2.0-ABS',
      modelDescription: 'Hornet 2.0 ABS (Pearl Igneous Black)',
      quantity: 25,
      uom: 'UNT',
      carrier: 'Gati KWE Express',
      truckNo: 'HR-26-BR-9014',
      driverName: 'Harpreet Singh (+91 98110 55431)',
      stagingBay: 'DSP-BAY-04',
      packingSlipNo: 'PS-2026-083',
      sapPgiDocNo: 'SAP-PGI-6001948850',
      scheduledDate: '22-Oct-2026 09:00',
      status: 'DISPATCHED',
      scopeBadge: 'CONFIGURABLE_SCOPE',
      notes: 'Goods Issue posted under SAP Movement 601; gate pass GP-2026-0199 generated.'
    }
  ],

  // -------------------------------------------------------------
  // 6. ADMIN MODULE STATE (F1 - F4)
  // -------------------------------------------------------------
  sapSyncLogs: [
    { syncId: 'SAP-SYNC-8822', interfaceType: 'BAPI_GOODSMVT_CREATE', direction: 'WMS → SAP', wmsRef: 'ISS-2026-0081', sapDocNo: 'SAP-MAT-6001928410', payloadType: 'Movement 261 (Goods Issue to Line 1)', status: 'success', errorText: '—', timestamp: '24-Sep-2026 10:41:00' },
    { syncId: 'SAP-SYNC-8821', interfaceType: 'BAPI_INV_ADJUSTMENT', direction: 'WMS → SAP', wmsRef: 'CC-2026-0091 (PWR-LOC-A01-RCK-01)', sapDocNo: 'SAP-ADJ-70019482', payloadType: 'Movement 711 (Cycle Count Variance -2)', status: 'success', errorText: '—', timestamp: '24-Sep-2026 10:18:22' },
    { syncId: 'SAP-SYNC-8820', interfaceType: 'BAPI_GOODSMVT_CREATE', direction: 'WMS → SAP', wmsRef: 'GRN-HND-2026-00520', sapDocNo: 'SAP-MAT-5001928500', payloadType: 'Movement 101 (Goods Receipt 590 EA)', status: 'success', errorText: '—', timestamp: '24-Sep-2026 09:46:12' },
    { syncId: 'SAP-SYNC-8819', interfaceType: 'BAPI_PO_GETDETAIL1', direction: 'SAP → WMS', wmsRef: 'PO-HND-2026-00501', sapDocNo: 'SAP-PO-4500198501', payloadType: 'Purchase Order 1,000 EA Sync', status: 'success', errorText: '—', timestamp: '24-Sep-2026 08:00:15' },
    { syncId: 'SAP-SYNC-8818', interfaceType: 'BAPI_GOODSMVT_CREATE', direction: 'WMS → SAP', wmsRef: 'GRN-HND-2026-00482', sapDocNo: '—', payloadType: 'Movement 101 (Batch GRN)', status: 'failed', errorText: 'RFC_ERROR_COMMUNICATION: ERP Gateway timeout (PRD-100)', timestamp: '24-Sep-2026 07:45:00' }
  ],

  auditTrail: [
    { timestamp: '24-Sep-2026 10:40:15', user: 'Sanjay Verma', role: 'WAREHOUSE_OP', deviceId: 'ZEBRA-TC57-01', transaction: 'Issue to Line Confirmation', reference: 'ISS-2026-0081', oldValue: 'Status: In-Picking (100 EA)', newValue: 'Delivered to Line 1 Staging STG-P1-L1 (SAP Doc: SAP-MAT-6001928410)' },
    { timestamp: '24-Sep-2026 10:18:00', user: 'Rajesh Sharma', role: 'WMS_ADMIN', deviceId: 'PC Console (WH-MGR-01)', transaction: 'Stock Adjustment Approved', reference: 'CC-2026-0091', oldValue: 'Stock in PWR-LOC-A01-RCK-01: 590 EA', newValue: 'Stock in PWR-LOC-A01-RCK-01: 588 EA (Adj: -2 EA, Shrinkage)' },
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
  ],

  // -------------------------------------------------------------
  // 21. PART PARKING & STAGING BUFFER MASTER (Module D)
  // -------------------------------------------------------------
  parkingBays: [
    { bayCode: 'PARK-BAY-01', name: 'Inbound Dock 04 Buffer', zone: 'Dock Receiving Buffer', capacity: 10, occupied: 1, plant: 'HMSI Narsapur Plant 1', status: 'ACTIVE' },
    { bayCode: 'PARK-BAY-02', name: 'Shopfloor Central Staging Buffer', zone: 'Assembly Shop Buffer', capacity: 12, occupied: 1, plant: 'HMSI Narsapur Plant 1', status: 'ACTIVE' },
    { bayCode: 'PARK-BAY-03', name: 'QC Hold Staging Area', zone: 'Quality Buffer', capacity: 8, occupied: 0, plant: 'HMSI Narsapur Plant 1', status: 'ACTIVE' },
    { bayCode: 'PARK-BAY-04', name: 'Frame Sub-Assembly Staging', zone: 'Frame Shop Staging', capacity: 10, occupied: 0, plant: 'HMSI Narsapur Plant 2', status: 'ACTIVE' },
    { bayCode: 'PARK-BAY-05', name: 'Powertrain Overflow Buffer', zone: 'Powertrain Zone A', capacity: 15, occupied: 0, plant: 'HMSI Narsapur Plant 1', status: 'ACTIVE' }
  ],

  parkedStock: [
    {
      parkingId: 'PRK-2026-0001',
      huNumber: 'HU-HND-2026-009805',
      materialCode: 'HND-ECU-KEIHIN-01',
      materialDescription: 'Keihin Master Engine Control Unit (ECU)',
      quantity: 50,
      uom: 'EA',
      batch: 'BAT-KEI-2026-09-24-03',
      plant: 'HMSI Narsapur Plant 1',
      parkingBay: 'PARK-BAY-01',
      parkingBayName: 'Inbound Dock 04 Buffer',
      parkingReason: 'Buffer Overflow / High-Bay Congestion',
      notes: 'Awaiting high-bay rack clearance on Powertrain Aisle 04',
      parkedBy: 'Sanjay Verma (Op 01)',
      parkedDate: '24-Sep-2026 09:15',
      parkedTimestamp: Date.now() - 45 * 60 * 1000,
      durationMinutes: 45,
      status: 'PARKED'
    },
    {
      parkingId: 'PRK-2026-0002',
      huNumber: 'HU-HND-2026-009806',
      materialCode: 'HND-THROT-KEIHIN',
      materialDescription: 'Keihin PGM-FI 26mm Throttle Body (Activa 6G)',
      quantity: 60,
      uom: 'EA',
      batch: 'BAT-KEI-2026-09-22-02',
      plant: 'HMSI Narsapur Plant 1',
      parkingBay: 'PARK-BAY-02',
      parkingBayName: 'Shopfloor Central Staging Buffer',
      parkingReason: 'Awaiting Production Line-Side Confirmation',
      notes: 'Line 1 requested temporary buffer hold pending shift handover',
      parkedBy: 'Rajesh Sharma',
      parkedDate: '24-Sep-2026 07:40',
      parkedTimestamp: Date.now() - 150 * 60 * 1000,
      durationMinutes: 150,
      status: 'PARKED'
    }
  ],

  // -------------------------------------------------------------
  // 24. ERP & INTEGRATION ARCHITECTURE (Module J / 2.10)
  // -------------------------------------------------------------
  erpConfig: {
    systemType: 'SAP_ERP',
    systemName: 'SAP ERP Production (PRD-100)',
    systemVersion: 'ECC 6.0 / S/4HANA Ready',
    gatewayHost: 'sapgw01.hmsi.co.in:3300',
    clientNumber: '100',
    systemId: 'PRD',
    defaultMode: 'REAL_TIME',
    connectionStatus: 'ONLINE',
    lastHeartbeat: '24-Sep-2026 10:45:00',
    retryAttempts: 3,
    retryIntervalSec: 60,
    rfcDestination: 'SAP_HMSIL_RFC_01',
    autoReconScheduled: true,
    autoReconTime: '00:05'
  },

  movementTypeMaster: [
    { code: '101', name: 'Goods Receipt for Purchase Order', category: 'INBOUND', defaultDocPrefix: 'SAP-MAT-500', active: true, description: 'Standard GRN into warehouse unconstrained stock' },
    { code: '103', name: 'Goods Receipt into Blocked / Inspection Stock', category: 'INBOUND', defaultDocPrefix: 'SAP-MAT-501', active: true, description: 'Direct receipt into inspection staging pending quality release' },
    { code: '122', name: 'Return Delivery to Vendor (RTV)', category: 'REJECTION', defaultDocPrefix: 'SAP-RTV-122', active: true, description: 'Return of rejected / non-conforming materials to vendor' },
    { code: '124', name: 'Return to Vendor from Inspection Stock', category: 'REJECTION', defaultDocPrefix: 'SAP-QRN-124', active: true, description: 'Quarantine defect lock from inbound inspection' },
    { code: '261', name: 'Goods Issue for Production Order / Shop', category: 'OUTBOUND', defaultDocPrefix: 'SAP-MAT-600', active: true, description: 'Issuance of raw materials/parts to manufacturing shop or line' },
    { code: '262', name: 'Reversal of Goods Issue for Order', category: 'OUTBOUND', defaultDocPrefix: 'SAP-REV-262', active: true, description: 'Return of unused line stock back to warehouse inventory' },
    { code: '311', name: 'Transfer Posting SLoc to SLoc', category: 'INTERNAL', defaultDocPrefix: 'SAP-TRF-311', active: true, description: 'Internal warehouse bin relocation or transfer to rework shop' },
    { code: '551', name: 'Scrapping from Blocked Stock', category: 'DISPOSITION', defaultDocPrefix: 'SAP-SCR-551', active: true, description: 'Authorized scrap write-off of destroyed/obsolete material' },
    { code: '601', name: 'Goods Issue for Outbound Delivery (PGI)', category: 'DISPATCH', defaultDocPrefix: 'SAP-PGI-601', active: true, description: 'Post Goods Issue for outbound dealership dispatch' },
    { code: '711', name: 'Physical Inventory Shrinkage (Negative Variance)', category: 'INVENTORY_ADJ', defaultDocPrefix: 'SAP-INV-711', active: true, description: 'Adjustment for physical inventory deficit / missing stock' },
    { code: '712', name: 'Physical Inventory Surplus (Positive Variance)', category: 'INVENTORY_ADJ', defaultDocPrefix: 'SAP-INV-712', active: true, description: 'Adjustment for physical inventory excess found in bins' }
  ],

  integrationSwitchboard: [
    {
      id: 'PT-01',
      name: 'Purchase Orders (PO Sync)',
      interfaceCode: 'BAPI_PO_GETDETAIL1',
      category: 'INBOUND',
      enabled: true,
      mode: 'REAL_TIME',
      batchSchedule: 'REAL_TIME',
      status: 'HEALTHY',
      direction: 'SAP → WMS',
      lastSync: '24-Sep-2026 10:41:00',
      totalTransmitted: 1420,
      failedCount: 0,
      description: 'Fetch PO header, line items, schedule lines, and vendor ASN details from ERP'
    },
    {
      id: 'PT-02',
      name: 'Goods Receipt (GRN Sync)',
      interfaceCode: 'BAPI_GOODSMVT_CREATE (101)',
      category: 'INBOUND',
      enabled: true,
      mode: 'REAL_TIME',
      batchSchedule: 'REAL_TIME',
      status: 'HEALTHY',
      direction: 'WMS → SAP',
      lastSync: '24-Sep-2026 09:46:12',
      totalTransmitted: 890,
      failedCount: 1,
      description: 'Post Movement 101 Goods Receipt Material Documents upon physical unload and inspection'
    },
    {
      id: 'PT-03',
      name: 'Quality Inspection (PQ Status Sync)',
      interfaceCode: 'BAPI_INSPCHAR_GETRESULT',
      category: 'QUALITY',
      enabled: true,
      mode: 'REAL_TIME',
      batchSchedule: 'REAL_TIME',
      status: 'HEALTHY',
      direction: 'SAP ↔ WMS',
      lastSync: '24-Sep-2026 09:30:00',
      totalTransmitted: 640,
      failedCount: 0,
      description: 'Synchronize Quality Inspection lot status and strictly gate Putaway until QC PASS'
    },
    {
      id: 'PT-04',
      name: 'Production Issuance (GI Sync)',
      interfaceCode: 'BAPI_GOODSMVT_CREATE (261)',
      category: 'OUTBOUND',
      enabled: true,
      mode: 'REAL_TIME',
      batchSchedule: 'REAL_TIME',
      status: 'HEALTHY',
      direction: 'WMS → SAP',
      lastSync: '24-Sep-2026 10:41:00',
      totalTransmitted: 2150,
      failedCount: 0,
      description: 'Post Movement 261 Goods Issue to Machine, Paint, Weld, Engine, or Final Assembly lines'
    },
    {
      id: 'PT-05',
      name: 'Rejection & Scrap (RTV/Scrap Sync)',
      interfaceCode: 'BAPI_GOODSMVT_CREATE (122/551)',
      category: 'REJECTION',
      enabled: true,
      mode: 'BATCH',
      batchSchedule: 'HOURLY',
      status: 'HEALTHY',
      direction: 'WMS → SAP',
      lastSync: '24-Sep-2026 10:00:00',
      totalTransmitted: 74,
      failedCount: 0,
      description: 'Post Movement 122 (Return to Vendor) and Movement 551 (Scrap Write-off) for quarantined stock'
    },
    {
      id: 'PT-06',
      name: 'Stock Reconciliation (Daily Recon)',
      interfaceCode: 'BAPI_INV_ADJUSTMENT',
      category: 'RECONCILIATION',
      enabled: true,
      mode: 'BATCH',
      batchSchedule: 'DAILY_MIDNIGHT',
      status: 'HEALTHY',
      direction: 'WMS ↔ SAP',
      lastSync: '24-Sep-2026 00:05:00',
      totalTransmitted: 31,
      failedCount: 0,
      description: 'Daily ledger reconciliation between WMS physical storage bin stock and ERP SLoc book balances'
    }
  ],

  interfaceModeSettings: [
    {
      interfaceId: 'INT-PO-GET',
      bapiName: 'BAPI_PO_GETDETAIL1',
      displayName: 'Inbound Purchase Order Fetch',
      direction: 'SAP → WMS',
      mode: 'REAL_TIME',
      batchInterval: 'REAL_TIME',
      lastBatchRun: '24-Sep-2026 10:41:00',
      nextBatchRun: 'REAL_TIME (Instant)',
      queueBacklog: 0,
      status: 'ACTIVE'
    },
    {
      interfaceId: 'INT-GRN-POST',
      bapiName: 'BAPI_GOODSMVT_CREATE (GRN 101)',
      displayName: 'Goods Receipt Note (GRN) Posting',
      direction: 'WMS → SAP',
      mode: 'REAL_TIME',
      batchInterval: 'REAL_TIME',
      lastBatchRun: '24-Sep-2026 09:46:12',
      nextBatchRun: 'REAL_TIME (Instant)',
      queueBacklog: 1,
      status: 'ACTIVE'
    },
    {
      interfaceId: 'INT-PQ-STATUS',
      bapiName: 'BAPI_INSPCHAR_GETRESULT',
      displayName: 'Quality Inspection PQ Status Fetch',
      direction: 'SAP → WMS',
      mode: 'REAL_TIME',
      batchInterval: 'REAL_TIME',
      lastBatchRun: '24-Sep-2026 09:30:00',
      nextBatchRun: 'REAL_TIME (Instant)',
      queueBacklog: 0,
      status: 'ACTIVE'
    },
    {
      interfaceId: 'INT-GI-POST',
      bapiName: 'BAPI_GOODSMVT_CREATE (GI 261)',
      displayName: 'Production Shop & Line Goods Issue',
      direction: 'WMS → SAP',
      mode: 'REAL_TIME',
      batchInterval: 'REAL_TIME',
      lastBatchRun: '24-Sep-2026 10:41:00',
      nextBatchRun: 'REAL_TIME (Instant)',
      queueBacklog: 0,
      status: 'ACTIVE'
    },
    {
      interfaceId: 'INT-REJ-POST',
      bapiName: 'BAPI_GOODSMVT_CREATE (122/124/551)',
      displayName: 'Quarantine Defect, RTV & Scrap',
      direction: 'WMS → SAP',
      mode: 'BATCH',
      batchInterval: 'HOURLY',
      lastBatchRun: '24-Sep-2026 10:00:00',
      nextBatchRun: '24-Sep-2026 11:00:00',
      queueBacklog: 2,
      status: 'ACTIVE'
    },
    {
      interfaceId: 'INT-INV-ADJ',
      bapiName: 'BAPI_INV_ADJUSTMENT (711/712)',
      displayName: 'Cycle Count & Physical Inv Variance',
      direction: 'WMS → SAP',
      mode: 'BATCH',
      batchInterval: 'SHIFT_END',
      lastBatchRun: '24-Sep-2026 06:30:00',
      nextBatchRun: '24-Sep-2026 14:30:00',
      queueBacklog: 3,
      status: 'ACTIVE'
    },
    {
      interfaceId: 'INT-PGI-POST',
      bapiName: 'BAPI_GOODSMVT_CREATE (PGI 601)',
      displayName: 'Outbound Packing & Dispatch (PGI)',
      direction: 'WMS → SAP',
      mode: 'REAL_TIME',
      batchInterval: 'REAL_TIME',
      lastBatchRun: '24-Sep-2026 09:00:00',
      nextBatchRun: 'REAL_TIME (Instant)',
      queueBacklog: 0,
      status: 'ACTIVE'
    }
  ],

  sapReconciliationRecords: [
    { reconId: 'REC-2026-0924-01', materialCode: 'HND-BRK-PAD-01', materialDescription: 'Nissin Front Disc Brake Pad Set', plant: 'HMSI Narsapur Plant 1', sloc: 'RM01 (Raw Materials)', wmsPhysicalQty: 1180, erpBookQty: 1180, varianceQty: 0, unitPrice: 420.00, varianceValue: 0, status: 'MATCHED', lastReconDate: '24-Sep-2026 00:05:00' },
    { reconId: 'REC-2026-0924-02', materialCode: 'HND-THROT-KEIHIN', materialDescription: 'Keihin PGM-FI 26mm Throttle Body', plant: 'HMSI Narsapur Plant 1', sloc: 'RM01 (Raw Materials)', wmsPhysicalQty: 500, erpBookQty: 500, varianceQty: 0, unitPrice: 2850.00, varianceValue: 0, status: 'MATCHED', lastReconDate: '24-Sep-2026 00:05:00' },
    { reconId: 'REC-2026-0924-03', materialCode: 'HND-SPK-NGK-MR7C', materialDescription: 'NGK Nickel Spark Plug MR7C-9N', plant: 'HMSI Narsapur Plant 1', sloc: 'RM01 (Raw Materials)', wmsPhysicalQty: 1200, erpBookQty: 1200, varianceQty: 0, unitPrice: 115.00, varianceValue: 0, status: 'MATCHED', lastReconDate: '24-Sep-2026 00:05:00' },
    { reconId: 'REC-2026-0924-04', materialCode: 'HND-BAT-YTZ5S', materialDescription: 'Exide Maintenance-Free 12V 4Ah Battery', plant: 'HMSI Narsapur Plant 1', sloc: 'RM01 (Raw Materials)', wmsPhysicalQty: 300, erpBookQty: 300, varianceQty: 0, unitPrice: 1450.00, varianceValue: 0, status: 'MATCHED', lastReconDate: '24-Sep-2026 00:05:00' },
    { reconId: 'REC-2026-0924-05', materialCode: 'HND-CVT-BANDO-01', materialDescription: 'Bando Kevlar V-Belt Drive', plant: 'HMSI Narsapur Plant 1', sloc: 'RM01 (Raw Materials)', wmsPhysicalQty: 400, erpBookQty: 400, varianceQty: 0, unitPrice: 580.00, varianceValue: 0, status: 'MATCHED', lastReconDate: '24-Sep-2026 00:05:00' },
    { reconId: 'REC-2026-0924-06', materialCode: 'HND-TYR-MRF-9090', materialDescription: 'MRF 90/90-12 Front Tubeless Tyre', plant: 'HMSI Narsapur Plant 1', sloc: 'RM02 (Tyre Store)', wmsPhysicalQty: 350, erpBookQty: 350, varianceQty: 0, unitPrice: 1120.00, varianceValue: 0, status: 'MATCHED', lastReconDate: '24-Sep-2026 00:05:00' },
    { reconId: 'REC-2026-0924-07', materialCode: 'HND-OIL-10W30-4T', materialDescription: 'Honda 10W-30 SJ Engine Oil', plant: 'HMSI Narsapur Plant 1', sloc: 'RM03 (Lubricants)', wmsPhysicalQty: 600, erpBookQty: 600, varianceQty: 0, unitPrice: 320.00, varianceValue: 0, status: 'MATCHED', lastReconDate: '24-Sep-2026 00:05:00' },
    { reconId: 'REC-2026-0924-08', materialCode: 'HND-ECU-KEIHIN-01', materialDescription: 'Keihin Master Engine Control Unit (ECU)', plant: 'HMSI Narsapur Plant 1', sloc: 'RM01 (Raw Materials)', wmsPhysicalQty: 150, erpBookQty: 150, varianceQty: 0, unitPrice: 4800.00, varianceValue: 0, status: 'MATCHED', lastReconDate: '24-Sep-2026 00:05:00' },
    { reconId: 'REC-2026-0924-09', materialCode: 'HND-ABS-BOSCH-MOD', materialDescription: 'Bosch Single-Channel ABS Modulator', plant: 'HMSI Narsapur Plant 1', sloc: 'RM01 (Raw Materials)', wmsPhysicalQty: 80, erpBookQty: 80, varianceQty: 0, unitPrice: 6200.00, varianceValue: 0, status: 'MATCHED', lastReconDate: '24-Sep-2026 00:05:00' },
    { reconId: 'REC-2026-0924-10', materialCode: 'HND-EXH-CBR-90', materialDescription: 'Stainless Steel Exhaust Pipe Assembly (CBR 250R)', plant: 'HMSI Narsapur Plant 2', sloc: 'RM04 (Frame/Exhaust)', wmsPhysicalQty: 18, erpBookQty: 18, varianceQty: 0, unitPrice: 8450.00, varianceValue: 0, status: 'MATCHED', lastReconDate: '24-Sep-2026 00:05:00' }
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
        if (!parsed.erpConfig) parsed.erpConfig = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.erpConfig));
        if (!parsed.movementTypeMaster || parsed.movementTypeMaster.length === 0) parsed.movementTypeMaster = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.movementTypeMaster));
        if (!parsed.integrationSwitchboard || parsed.integrationSwitchboard.length === 0) parsed.integrationSwitchboard = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.integrationSwitchboard));
        if (!parsed.interfaceModeSettings || parsed.interfaceModeSettings.length === 0) parsed.interfaceModeSettings = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.interfaceModeSettings));
        if (!parsed.sapReconciliationRecords || parsed.sapReconciliationRecords.length === 0) parsed.sapReconciliationRecords = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.sapReconciliationRecords));
        if (!parsed.qualityInspections) parsed.qualityInspections = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.qualityInspections));
        if (!parsed.locationMaster) parsed.locationMaster = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.locationMaster));
        if (!parsed.areaMaster || !parsed.areaMaster[0]?.areaCode) parsed.areaMaster = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.areaMaster));
        if (!parsed.binMaster || !parsed.binMaster[0]?.locationCode) parsed.binMaster = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.binMaster));
        if (!parsed.parkingBays || parsed.parkingBays.length === 0) parsed.parkingBays = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.parkingBays));
        if (!parsed.parkedStock || parsed.parkedStock.length === 0) parsed.parkedStock = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.parkedStock));
        if (!parsed.shopMaster || parsed.shopMaster.length === 0) parsed.shopMaster = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.shopMaster));
        if (!parsed.lineIssues || parsed.lineIssues.length === 0) parsed.lineIssues = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.lineIssues));
        if (!parsed.rejections || parsed.rejections.length === 0) parsed.rejections = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.rejections));
        if (!parsed.defectReasonCodes || parsed.defectReasonCodes.length === 0) parsed.defectReasonCodes = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.defectReasonCodes));
        if (!parsed.quarantineBins || parsed.quarantineBins.length === 0) parsed.quarantineBins = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.quarantineBins));
        if (!parsed.dispatchSettings) parsed.dispatchSettings = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.dispatchSettings));
        if (!parsed.dispatchBays || parsed.dispatchBays.length === 0) parsed.dispatchBays = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.dispatchBays));
        if (!parsed.dispatchOrders || parsed.dispatchOrders.length === 0) parsed.dispatchOrders = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.dispatchOrders));
        if (!parsed.dailyAutoEmailConfig) parsed.dailyAutoEmailConfig = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.dailyAutoEmailConfig));
        if (!parsed.vendorShortageAlerts || parsed.vendorShortageAlerts.length === 0) parsed.vendorShortageAlerts = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.vendorShortageAlerts));
        if (!parsed.materials || !parsed.materials[0]?.unitCost || parsed.materials.length < WMS_DEFAULT_STATE.materials.length) {
          parsed.materials = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.materials));
        }
        if (!parsed.handlingUnits.some(h => h.materialCode === 'HND-EXH-CBR-90')) {
          const deadStockHu = WMS_DEFAULT_STATE.handlingUnits.find(h => h.materialCode === 'HND-EXH-CBR-90');
          if (deadStockHu) parsed.handlingUnits.push(JSON.parse(JSON.stringify(deadStockHu)));
        }
        if (parsed.isStockFrozen === undefined) parsed.isStockFrozen = false;
        if (!parsed.stockFreezeInfo) parsed.stockFreezeInfo = JSON.parse(JSON.stringify(WMS_DEFAULT_STATE.stockFreezeInfo));
        if (parsed.cycleCountPlans) {
          parsed.cycleCountPlans.forEach(p => {
            if (!p.countType) {
              if (p.countNo === 'CC-2026-0090') {
                p.countType = 'ANNUAL_PHYSICAL';
                p.countTypeName = 'Annual Physical Inventory (Wall-to-Wall)';
                p.isStockFrozen = true;
              } else if (p.countNo === 'CC-2026-0089') {
                p.countType = 'HALF_YEARLY';
                p.countTypeName = 'Half-yearly Internal Verification (December)';
              } else {
                p.countType = 'DAILY_ABC';
                p.countTypeName = 'Daily Cycle Count (ABC Fast Movers)';
              }
            }
          });
          if (!parsed.cycleCountPlans.some(p => p.countType === 'ANNUAL_PHYSICAL')) {
            const annualPlan = WMS_DEFAULT_STATE.cycleCountPlans.find(p => p.countType === 'ANNUAL_PHYSICAL');
            if (annualPlan) parsed.cycleCountPlans.unshift(JSON.parse(JSON.stringify(annualPlan)));
          }
          if (!parsed.cycleCountPlans.some(p => p.countType === 'HALF_YEARLY')) {
            const halfPlan = WMS_DEFAULT_STATE.cycleCountPlans.find(p => p.countType === 'HALF_YEARLY');
            if (halfPlan) parsed.cycleCountPlans.splice(1, 0, JSON.parse(JSON.stringify(halfPlan)));
          }
        }
        // Module K: Ensure device models have (TBC) and uniform user Rajesh Sharma
        if (parsed.deviceMaster) {
          parsed.deviceMaster.forEach(d => {
            if (d.model && !d.model.includes('(TBC)')) {
              d.model += ' (TBC)';
            }
          });
        }
        if (parsed.users) {
          parsed.users.forEach(u => {
            if (u.name === 'Rajesh Kumar') u.name = 'Rajesh Sharma';
          });
        }
        if (parsed.currentUser && parsed.currentUser.name === 'Rajesh Kumar') {
          parsed.currentUser.name = 'Rajesh Sharma';
        }
        if (parsed.shopMaster) {
          parsed.shopMaster.forEach(s => {
            if (s.manager === 'Rajesh Kumar') s.manager = 'Rajesh Sharma';
          });
        }
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
