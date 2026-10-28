export interface UserSettings {
  id?: string;
  userId?: string;
  emailAlerts: boolean;
  smsAlerts: boolean;
  distanceUnit: 'km' | 'miles' | string;
  currency: string;
  reminderDaysBefore: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar?: string | null;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  role?: 'USER' | 'ADMIN' | string;
  settings?: UserSettings | null;
  unreadNotificationsCount?: number;
  vehicleCount?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Vehicle {
  id: string;
  nickname: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  vehicleType: string;
  fuelType: string;
  photo?: string | null;
  notes?: string | null;
  currentOdometer: number;
  createdAt?: string;
  updatedAt?: string;
  activeInsurance?: {
    id: string;
    insurer: string;
    policyNumber: string;
    expiryDate: string;
    status: string;
  } | null;
  latestService?: {
    id: string;
    serviceDate: string;
    serviceType: string;
    odometer: number;
    cost: number;
  } | null;
  pendingRemindersCount?: number;
  expiredDocsCount?: number;
  nextRenewalDate?: string | null;
  odometerReadings?: OdometerReading[];
  serviceRecords?: ServiceRecord[];
  serviceReminders?: ServiceReminder[];
  documents?: VehicleDocument[];
  insurancePolicies?: InsurancePolicy[];
  warranties?: Warranty[];
  tyreBatteryRecords?: TyreBatteryRecord[];
  fuelLogs?: FuelLog[];
  expenses?: Expense[];
}

export interface OdometerReading {
  id: string;
  vehicleId: string;
  reading: number;
  readingDate: string;
  isCorrection: boolean;
  notes?: string | null;
  source: string;
  createdAt?: string;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  serviceDate: string;
  serviceType: string;
  workshopName: string;
  description: string;
  partsReplaced?: string | null;
  cost: number;
  odometer: number;
  invoiceUrl?: string | null;
  nextDueMonths?: number | null;
  nextDueKm?: number | null;
  vehicle?: Pick<Vehicle, 'id' | 'nickname' | 'make' | 'model' | 'registrationNumber'>;
  createdAt?: string;
}

export interface ServiceReminder {
  id: string;
  vehicleId: string;
  title: string;
  serviceType: string;
  dueDate?: string | null;
  dueOdometer?: number | null;
  isCompleted: boolean;
  completedAt?: string | null;
  notes?: string | null;
  vehicle?: Pick<Vehicle, 'id' | 'nickname' | 'make' | 'model' | 'registrationNumber' | 'currentOdometer'>;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  fileUrl?: string | null;
  notes?: string | null;
  vehicle?: Pick<Vehicle, 'id' | 'nickname' | 'make' | 'model' | 'registrationNumber'>;
  createdAt?: string;
}

export interface InsurancePolicy {
  id: string;
  vehicleId: string;
  insurer: string;
  policyNumber: string;
  coverType: string;
  premium: number;
  idv?: number | null;
  startDate: string;
  expiryDate: string;
  documentUrl?: string | null;
  isActive: boolean;
  notes?: string | null;
  vehicle?: Pick<Vehicle, 'id' | 'nickname' | 'make' | 'model' | 'registrationNumber'>;
  createdAt?: string;
}

export interface Warranty {
  id: string;
  vehicleId: string;
  warrantyType: string;
  provider: string;
  coverageNotes: string;
  startDate: string;
  expiryDate: string;
  maxOdometer?: number | null;
  documentUrl?: string | null;
  vehicle?: Pick<Vehicle, 'id' | 'nickname' | 'make' | 'model' | 'registrationNumber'>;
  createdAt?: string;
}

export interface DrivingLicence {
  id: string;
  userId: string;
  licenceNumber: string;
  vehicleClasses: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority?: string | null;
  bloodGroup?: string | null;
  documentUrl?: string | null;
  createdAt?: string;
}

export interface TyreBatteryRecord {
  id: string;
  vehicleId: string;
  itemType: 'TYRE' | 'BATTERY' | string;
  brand: string;
  model: string;
  position?: string | null;
  sizeOrSerial?: string | null;
  installedDate: string;
  installedOdometer: number;
  replacementDueAgeMonths?: number | null;
  replacementDueKm?: number | null;
  lastRotatedDate?: string | null;
  lastAlignedDate?: string | null;
  notes?: string | null;
  vehicle?: Pick<Vehicle, 'id' | 'nickname' | 'make' | 'model' | 'registrationNumber'>;
  createdAt?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  logDate: string;
  fuelType: string;
  quantity: number;
  totalCost: number;
  pricePerUnit: number;
  odometer: number;
  isFullTank: boolean;
  calculatedEfficiency?: number | null;
  notes?: string | null;
  vehicle?: Pick<Vehicle, 'id' | 'nickname' | 'make' | 'model' | 'registrationNumber' | 'fuelType'>;
}

export interface Expense {
  id: string;
  vehicleId: string;
  expenseDate: string;
  category: string;
  amount: number;
  description: string;
  sourceType: string;
  sourceId?: string | null;
  receiptUrl?: string | null;
  vehicle?: Pick<Vehicle, 'id' | 'nickname' | 'make' | 'model' | 'registrationNumber'>;
}

export interface CareSchedule {
  id: string;
  userId: string;
  vehicleId?: string | null;
  title: string;
  careType: string;
  scheduledDate: string;
  recurrence: string;
  isCompleted: boolean;
  completedAt?: string | null;
  notes?: string | null;
  isOverdue?: boolean;
  vehicle?: Pick<Vehicle, 'id' | 'nickname' | 'make' | 'model' | 'registrationNumber'> | null;
}

export interface EmergencyContact {
  id: string;
  userId?: string;
  name: string;
  contactType: string;
  phone: string;
  altPhone?: string | null;
  policyOrAccountNo?: string | null;
  notes?: string | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  vehicleId?: string | null;
  title: string;
  message: string;
  category: string;
  priority: 'INFO' | 'WARNING' | 'URGENT' | string;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
  vehicle?: Pick<Vehicle, 'id' | 'nickname' | 'make' | 'model' | 'registrationNumber'> | null;
}

export interface FavouritePlace {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  rating?: number | null;
  notes?: string | null;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  rating?: number | null;
  phone?: string | null;
  openingHours?: string | null;
  isFavourite?: boolean;
}

export interface FuelLogsResponse {
  logs: FuelLog[];
  metrics: {
    totalFuelSpend: number;
    totalQuantity: number;
    avgEfficiency: number | null;
    efficiencyUnit: string;
  };
}

export interface ExpensesResponse {
  expenses: Expense[];
  summary: {
    thisMonthTotal: number;
    ytdTotal: number;
    categoryBreakdown: { name: string; value: number }[];
    vehicleBreakdown: { name: string; value: number }[];
    monthlySpending: { month: string; amount: number; fuel: number; service: number; insurance: number; other: number }[];
  };
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export interface SettingsResponse {
  profile: Pick<User, 'name' | 'email' | 'mobile' | 'avatar' | 'isEmailVerified' | 'isMobileVerified'>;
  preferences: UserSettings;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'USER' | 'ADMIN' | string;
  avatar?: string | null;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  createdAt: string;
  _count: {
    vehicles: number;
    notifications?: number;
    careSchedules?: number;
  };
}

export interface AdminVehicle {
  id: string;
  nickname: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  vehicleType: string;
  fuelType: string;
  currentOdometer: number;
  photo?: string | null;
  notes?: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  _count?: {
    serviceRecords: number;
    documents: number;
    fuelLogs: number;
    expenses: number;
  };
}

export interface AdminOverview {
  stats: {
    totalUsers: number;
    verifiedUsers: number;
    totalAdmins: number;
    totalVehicles: number;
    totalRecords: number;
    totalServices: number;
    totalDocuments: number;
    totalInsurancePolicies: number;
    totalFuelLogs: number;
    totalExpenses: number;
    totalCareTasks: number;
  };
  recentUsers: AdminUser[];
  recentVehicles: AdminVehicle[];
}
