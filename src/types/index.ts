export interface Rider {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  hubId: string;
  hub?: { id: string; name: string; zone?: { id: string; name: string } };
  vehicleType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryResult {
  outcome: 'delivered' | 'failed';
  timestamp: string;
  signatureUri?: string;
  photoUri?: string;
  codCollected?: number;
  failureReason?: string;
  failureNotes?: string;
  nextAction?: 'reschedule' | 'rts' | 'retry';
  overrideReason?: string;
}

export interface Stop {
  _id: string;
  stopId: string;
  manifestId: string | { _id: string; manifestId: string };
  orderId?: string;
  sequence: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rts' | 'reschedule';
  recipient: {
    name: string;
    phone: string;
  };
  address: {
    text: string;
    lat: number;
    lng: number;
    geocoded: boolean;
  };
  trackingNumber: string;
  serviceType: string;
  codAmount: number;
  packageDetails: string;
  specialInstructions: string;
  distance: number;
  eta: string;
  attemptCount: number;
  maxAttempts: number;
  deliveryResult?: DeliveryResult;
  createdAt: string;
  updatedAt: string;
}

export interface Manifest {
  _id: string;
  manifestId: string;
  riderId: string | Rider;
  date: string;
  status: 'pending' | 'in_progress' | 'completed';
  totalStops: number;
  completedStops: number;
  failedStops: number;
  stops: string[] | Stop[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  riders: { total: number; active: number };
  manifests: { total: number; today: number; active: number };
  stops: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    rts: number;
    reschedule: number;
  };
  orders?: {
    total: number;
    available: number;
    assigned: number;
    delivered: number;
    returned: number;
  };
  deliveryRate: number;
  cod: { totalExpected: number; totalCollected: number };
  recentActivity: Stop[];
  serviceBreakdown: { _id: string; count: number }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// ─── New types for Barcode Scan Manifest Flow ──────

export interface Order {
  _id: string;
  trackingNumber: string;
  stopId: string;
  recipient: {
    name: string;
    phone: string;
    field?: string;
  };
  address: {
    text: string;
    lat: number;
    lng: number;
    geocoded: boolean;
  };
  serviceType: string;
  codAmount: number;
  packageDetails: string;
  specialInstructions: string;
  hub: string;
  zone: string;
  status: 'available' | 'assigned' | 'delivered' | 'returned';
  assignedManifestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hub {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  createdAt: string;
  updatedAt: string;
}

export interface Zone {
  id: string;
  name: string;
  hubIds: string[] | Hub[];
  createdAt: string;
  updatedAt: string;
}
