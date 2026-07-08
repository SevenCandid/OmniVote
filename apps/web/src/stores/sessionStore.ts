import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'SuperAdmin' | 'OrgAdmin' | 'ElectionOfficer' | 'Voter';
  name: string;
}

interface SessionState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
