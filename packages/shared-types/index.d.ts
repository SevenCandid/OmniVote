export interface SharedVoter {
  voterIdentifier: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
}

export interface SharedCandidate {
  id: string;
  name: string;
  voteCount: number;
}
