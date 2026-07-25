export enum CandidateStatus {
  ACTIVE = 'active',
  WITHDRAWN = 'withdrawn',
  DISQUALIFIED = 'disqualified',
}

export interface CandidateBase {
  full_name: string;
  short_name?: string | null;
  photo?: string | null;
  bio?: string | null;
  manifesto?: string | null;
}

export interface Candidate extends CandidateBase {
  id: string;
  election_category_id: string;
  candidate_number: number;
  status: CandidateStatus;
  profile_completeness: number;
  created_at: string;
  updated_at: string;
}

export interface CandidateCreate extends CandidateBase {
  candidate_number?: number;
}

export interface CandidateUpdate {
  full_name?: string;
  short_name?: string | null;
  photo?: string | null;
  bio?: string | null;
  manifesto?: string | null;
  status?: CandidateStatus;
}

export interface CandidateReorderRequest {
  new_candidate_number: number;
}
