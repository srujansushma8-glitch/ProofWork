export type Language = 'en' | 'kn' | 'hi';
export type UserRole = 'worker' | 'contractor';

export interface WorkerProfile {
  user_id: string;
  name: string;
  language: Language;
  trade: string;
  locality: string;
  latitude: number;
  longitude: number;
  experience_years: number;
  bio?: string;
  daily_rate: number;
  available: number;
}

export interface ContractorProfile {
  user_id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  locality: string;
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  created_at: string;
  worker_profile?: WorkerProfile;
  contractor_profile?: ContractorProfile;
}

export interface TaskGuideStep {
  en: string;
  kn: string;
  hi: string;
}

export interface SpokenPhrase {
  en: string;
  kn: string;
  hi: string;
}

export interface Task {
  id: string;
  slug: string;
  title_en: string;
  title_kn: string;
  title_hi: string;
  description_en: string;
  description_kn: string;
  description_hi: string;
  guide_steps: TaskGuideStep[];
  spoken_phrases: SpokenPhrase[];
}

export interface ChecklistItem {
  id: number;
  title_en: string;
  title_kn: string;
  title_hi: string;
  passed: boolean;
  observation: string;
  confidence: number;
  timestamp_sec?: number;
}

export interface Assessment {
  id: string;
  video_id: string;
  worker_id: string;
  task_id: string;
  score: number;
  max_score: number;
  confidence: number;
  status: 'pending_verification' | 'verified' | 'rejected';
  checklist: ChecklistItem[];
  verification_token?: string;
  share_url?: string;
  passport_id?: string;
  created_at: string;
}

export interface VerificationDetails {
  verification_id: string;
  assessment_id: string;
  token: string;
  decision?: string;
  note?: string;
  verified_at?: string;
  status: string;
  score: number;
  max_score: number;
  confidence: number;
  checklist: ChecklistItem[];
  worker_id: string;
  worker_name: string;
  worker_locality: string;
  worker_experience: number;
  video_url: string;
  anti_fraud_phrase: string;
  task_title: string;
  task_title_kn?: string;
  task_title_hi?: string;
  passport_id?: string;
}

export interface PublicPassport {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_phone: string;
  worker_locality: string;
  worker_experience: number;
  trade: string;
  task_title: string;
  score: number;
  max_score: number;
  confidence: number;
  checklist: ChecklistItem[];
  verifier_name: string;
  verifier_phone: string;
  verifier_note?: string;
  decision: string;
  verified_at: string;
  verification_hash: string;
  qr_code_data: string;
  status: string;
}

export interface Job {
  id: string;
  contractor_id: string;
  title: string;
  description: string;
  trade: string;
  locality: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  day_rate_min: number;
  day_rate_max: number;
  duration_days: number;
  status: string;
  created_at: string;
  distance_km?: number;
  user_response_status?: 'applied' | 'accepted' | 'declined';
  matched_workers_count?: number;
}

export interface WorkerMatchItem {
  worker_id: string;
  name: string;
  phone: string;
  locality: string;
  distance_km: number;
  experience_years: number;
  daily_rate: number;
  verified: boolean;
  skill_score: number;
  confidence: number;
  passport_id?: string;
  latest_task?: string;
  available: number;
}
