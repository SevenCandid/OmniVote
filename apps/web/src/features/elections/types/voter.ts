export interface VoterGroup {
  id: string;
  election_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface EligibleVoter {
  id: string;
  election_id: string;
  voter_identifier: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  gender: string | null;
  group_id: string | null;
  has_voted: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface EligibleVoterCreate {
  voter_identifier: string;
  full_name: string;
  phone_number?: string | null;
  email?: string | null;
  gender?: string | null;
  group_id?: string | null;
}

export interface PaginatedVoterResponse {
  items: EligibleVoter[];
  total: number;
  skip: number;
  limit: number;
}
