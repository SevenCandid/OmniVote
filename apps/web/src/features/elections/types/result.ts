export interface CandidateResult {
  candidate_id: string;
  name: string;
  photo: string | null;
  vote_count: number;
  percentage: number;
  rank: number;
  is_winner: boolean;
  is_tied: boolean;
}

export interface CategoryResult {
  category_id: string;
  name: string;
  total_votes: number;
  candidates: CandidateResult[];
}

export interface ElectionStatistics {
  total_eligible_voters: number | null;
  total_votes_cast: number;
  turnout_percentage: number | null;
}

export interface ElectionResult {
  election_id: string;
  status: string;
  is_hidden?: boolean;
  statistics?: ElectionStatistics;
  categories?: CategoryResult[];
  generated_at: string;
}
