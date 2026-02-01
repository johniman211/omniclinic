
export type UserRole = 
  | 'owner' 
  | 'admin' 
  | 'doctor' 
  | 'nurse' 
  | 'lab' 
  | 'pharmacy' 
  | 'cashier' 
  | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: {
    triageRequired: boolean;
    defaultCurrency: 'USD' | 'SSP';
    whatsappEnabled: boolean;
    enabledDepartments?: Record<string, boolean>;
    departmentServices?: Record<string, string[]>; // e.g., { 'Laboratory': ['FBC', 'Widal'], 'Pharmacy': ['Antibiotics'] }
  };
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export interface Membership {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Patient {
  id: string;
  organization_id: string;
  mrn: string;
  full_name: string;
  gender: string;
  dob: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface PatientDocument {
  id: string;
  patient_id: string;
  organization_id: string;
  name: string;
  file_type: string;
  file_size: number;
  url: string;
  created_at: string;
}

export interface Visit {
  id: string;
  organization_id: string;
  patient_id: string;
  status: 'triage' | 'consultation' | 'lab' | 'pharmacy' | 'completed';
  vitals?: {
    temp: number;
    bp: string;
    pulse: number;
    spo2: number;
  };
  notes?: string;
  created_at: string;
}
