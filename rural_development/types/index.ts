// types/index.ts
export type Role =
  | 'citizen'
  | 'panchayat_officer'
  | 'block_officer'
  | 'district_admin'
  | 'super_admin';

export interface Profile {
  id: string;
  auth_user_id: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  village_id?: string;
  role: Role;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  citizen_id: string;
  village_id: string;
  ward_id?: string;
  department_id?: string;
  gps_location?: any;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  resolution_deadline?: string;
  resolution_summary?: string;
  resolution_evidence_url?: string;
}
