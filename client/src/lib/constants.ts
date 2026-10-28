export const VEHICLE_TYPES = ['Car', 'SUV', 'Hatchback', 'Sedan', 'Motorcycle', 'Scooter', 'Electric', 'Commercial'];
export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
export const SERVICE_TYPES = [
  'General Service',
  'Oil Change',
  'Brake Service',
  'Major Service',
  'Inspection',
  'Repair',
  'Tyre & Alignment',
  'Battery Replacement',
];
export const DOCUMENT_TYPES = ['RC', 'PUC', 'PERMIT', 'FITNESS', 'TAX', 'OTHER'];
export const COVER_TYPES = ['Comprehensive', 'Third-Party', 'Zero Depreciation', 'Own Damage'];
export const WARRANTY_TYPES = ['Vehicle', 'Battery', 'Tyre', 'Component'];
export const TYRE_POSITIONS = ['Front Left', 'Front Right', 'Rear Left', 'Rear Right', 'Spare'];
export const EXPENSE_CATEGORIES = [
  'Fuel',
  'Service',
  'Insurance',
  'Accessories',
  'Repairs',
  'Fines',
  'Tolls',
  'Washing',
  'Other',
];
export const CARE_TYPES = ['WASH', 'INTERIOR_CLEAN', 'WAXING', 'FLUID_CHECK', 'INSPECTION', 'OTHER'];
export const RECURRENCES = ['NONE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY'];
export const CONTACT_TYPES = ['PERSONAL', 'ROADSIDE_ASSISTANCE', 'INSURANCE_HELPLINE', 'GARAGE', 'TOWING'];
export const NEARBY_CATEGORIES: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Services' },
  { value: 'GARAGE', label: 'Garages' },
  { value: 'TYRE_SHOP', label: 'Tyre Shops' },
  { value: 'SERVICE_CENTRE', label: 'Service Centres' },
  { value: 'FUEL_STATION', label: 'Fuel Stations' },
  { value: 'EV_CHARGER', label: 'EV Chargers' },
  { value: 'CAR_WASH', label: 'Car Washes' },
];
export const REPORT_SECTIONS = [
  { key: 'profile', label: 'Vehicle Profile' },
  { key: 'services', label: 'Service History' },
  { key: 'odometer', label: 'Odometer Readings' },
  { key: 'documents', label: 'Documents' },
  { key: 'insurance', label: 'Insurance History' },
  { key: 'fuel', label: 'Fuel Logs' },
  { key: 'expenses', label: 'Expenses' },
];
