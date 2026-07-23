export enum ElectionStatus {
  DRAFT = 'draft',
  CONFIGURED = 'configured',
  PUBLISHED = 'published',
  VOTING_OPEN = 'voting_open',
  VOTING_PAUSED = 'voting_paused',
  VOTING_CLOSED = 'voting_closed',
  COUNTING = 'counting',
  RESULTS_PUBLISHED = 'results_published',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled',
}

export enum ElectionType {
  GENERAL_ELECTION = 'general_election',
  REFERENDUM = 'referendum',
  SURVEY = 'survey',
  POLL = 'poll',
  AWARD_VOTING = 'award_voting',
  COMMITTEE_ELECTION = 'committee_election',
  CUSTOM = 'custom',
}

export enum Visibility {
  PRIVATE = 'private',
  ORGANIZATION_ONLY = 'organization_only',
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
}

export interface Election {
  id: string;
  organization_id: string;
  slug: string;
  public_id: string;
  status: ElectionStatus;

  title: string;
  description: string | null;
  election_type: ElectionType;
  visibility: Visibility;

  registration_opens_at: string | null;
  registration_closes_at: string | null;
  voting_opens_at: string | null;
  voting_closes_at: string | null;
  results_publish_at: string | null;

  timezone: string;
  allow_anonymous_voting: boolean;
  automatically_publish_results: boolean;
  require_voter_verification: boolean;

  created_at: string;
  updated_at: string | null;
  created_by: string | null;
}

export interface ElectionCreate {
  title: string;
  description?: string | null;
  election_type?: ElectionType;
  visibility?: Visibility;

  registration_opens_at?: string | null;
  registration_closes_at?: string | null;
  voting_opens_at?: string | null;
  voting_closes_at?: string | null;
  results_publish_at?: string | null;

  timezone?: string;
  allow_anonymous_voting?: boolean;
  automatically_publish_results?: boolean;
  require_voter_verification?: boolean;
}

export interface ElectionUpdate extends Partial<ElectionCreate> {}

export interface PaginatedElectionResponse {
  items: Election[];
  total: number;
  skip: number;
  limit: number;
}
