// ── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  badge_number?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ── Cases ─────────────────────────────────────────────────────────────────────
export type CaseStatus = 'active' | 'closed' | 'pending' | 'archived';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface MissingPerson {
  id: number;
  case_id: string;
  full_name: string;
  age: number;
  gender: string;
  date_of_birth: string;
  phone?: string;
  emergency_contact?: string;
  photo_url?: string;
  // Physical
  height?: string;
  weight?: string;
  build?: string;
  hair_color?: string;
  eye_color?: string;
  complexion?: string;
  identifying_marks?: string;
  // Last known
  last_seen_date: string;
  last_seen_time: string;
  last_seen_location: string;
  last_seen_clothing: string;
  last_seen_possessions?: string;
  known_destinations?: string;
  // Additional
  medical_notes?: string;
  known_contacts?: string;
  usual_locations?: string;
  additional_info?: string;
}

export interface Case {
  id: number;
  case_id: string;
  status: CaseStatus;
  priority: Priority;
  created_at: string;
  updated_at: string;
  missing_person: MissingPerson;
  lead_count?: number;
  sighting_count?: number;
  tip_count?: number;
}

// ── Family Information ────────────────────────────────────────────────────────
export interface FamilyInformation {
  id: number;
  case_id: string;
  family_statement: string;
  known_routines?: string;
  known_places?: string;
  recent_activities?: string;
  clothing_info?: string;
  personal_belongings?: string;
  contact_info?: string;
  additional_observations?: string;
  created_at?: string;
}

// ── Investigator Tips ─────────────────────────────────────────────────────────
export type TipSource = 'witness' | 'phone_call' | 'field_officer' | 'community_tip' | 'social_media' | 'other';

export interface InvestigatorTip {
  id: number;
  tip_id: string;
  case_id: string;
  date: string;
  time: string;
  source_type: TipSource;
  location: string;
  description: string;
  witness_description?: string;
  confidence: number;
  supporting_notes?: string;
  created_at?: string;
}

// ── CCTV Sightings ────────────────────────────────────────────────────────────
export interface CCTVSighting {
  id: number;
  sighting_id: string;
  case_id: string;
  camera_id: string;
  location: string;
  date: string;
  time: string;
  description: string;
  observed_clothing?: string;
  approximate_age?: number;
  direction_of_movement?: string;
  confidence: number;
  lat?: number;
  lng?: number;
  created_at?: string;
}

// ── Leads ─────────────────────────────────────────────────────────────────────
export type LeadStatus = 'new' | 'under_review' | 'verified' | 'dismissed';

export interface LeadFactor {
  label: string;
  score: number;
  matched: boolean;
  detail: string;
}

export interface Lead {
  id: number;
  lead_id: string;
  case_id: string;
  description: string;
  source: string;
  location: string;
  time: string;
  priority: Priority;
  confidence: number;
  reasoning: string;
  factors: LeadFactor[];
  recommended_action: string;
  status: LeadStatus;
  notes?: string;
  created_at?: string;
}

// ── Timeline ──────────────────────────────────────────────────────────────────
export type TimelineSource = 'family' | 'cctv' | 'witness' | 'investigator' | 'ai';

export interface TimelineEvent {
  id: number;
  case_id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  source: TimelineSource;
  location?: string;
  lat?: number;
  lng?: number;
}

// ── AI Analysis ───────────────────────────────────────────────────────────────
export interface AIAnalysisResult {
  case_id: string;
  analyzed_at: string;
  leads: Lead[];
  timeline: TimelineEvent[];
  summary: string;
  recommended_actions: string[];
  correlation_notes: string[];
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface DashboardStats {
  active_cases: number;
  high_priority_leads: number;
  new_sightings: number;
  cases_requiring_review: number;
}
