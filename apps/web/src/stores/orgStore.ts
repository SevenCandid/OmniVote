import { create } from 'zustand';

interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
}

interface OrgState {
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization | null) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  currentOrg: null,
  setCurrentOrg: (org) => set({ currentOrg: org }),
}));
