export enum VotingSessionStatus {
  ACTIVE = 'active',
  SUBMITTED = 'submitted',
  EXPIRED = 'expired',
  ABANDONED = 'abandoned',
}

export enum VerificationMethod {
  PLATFORM_ACCOUNT = 'platform_account',
  STUDENT_ID = 'student_id',
  EMPLOYEE_ID = 'employee_id',
  EMAIL = 'email',
  PHONE_NUMBER = 'phone_number',
  USSD = 'ussd',
  PUBLIC = 'public',
}

export interface StartSessionRequest {
  verification_method: VerificationMethod;
  voter_identifier?: string;
}

export interface VotingSelectionItem {
  category_id: string;
  candidate_id: string;
}

export interface DraftSelectionUpdate {
  selections: VotingSelectionItem[];
}

export interface SubmitBallotResponse {
  receipt_code: string;
  cast_at: string;
}

export interface VotingSession {
  id: string;
  election_id: string;
  status: VotingSessionStatus;
  expires_at: string;
  selections: VotingSelectionItem[];
}
